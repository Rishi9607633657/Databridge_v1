"""Monthly budgets on cluster spend, cost alerts, automatic stop, and customer invoices.

A budget watches the month's spend (cloud cost, or charge = cost + markup) of everything, one cluster, one user or
one company (the Company field of users). At the warning % it notifies; at 100 % it notifies and, with action
"stop", shuts down the kernels in scope and refuses new ones on those clusters until next month (or until an
admin raises the budget or lifts the block). Spend comes from Compute › Usage and cost (metered every minute)."""
import asyncio
import html
import json
import time
import uuid

from fastapi import HTTPException

from . import clusters, notify
from .jobs import store
from .settings import env

store.db.executescript("""
CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY, name TEXT, scope TEXT, scope_value TEXT, amount REAL, basis TEXT,
  warn_pct REAL, action TEXT, dest TEXT, state TEXT, created REAL, created_by TEXT);
""")
store.db.commit()

SCOPES = ("all", "cluster", "user", "company")


def _month():
    return time.strftime("%Y-%m")


def _companies():
    return {u["username"].lower(): (u.get("company") or "") for u in store.q("SELECT username, company FROM users")}


def _row(r):
    d = dict(r)
    d["dest"] = json.loads(d["dest"] or "{}")
    d["state"] = json.loads(d["state"] or "{}")
    return d


def list_budgets(month=None):
    month = month or _month()
    use = clusters.usage(month)["rows"]
    out = []
    for b in [_row(r) for r in store.q("SELECT * FROM budgets ORDER BY name")]:
        spend = spend_for(b, use)
        st = b["state"] if b["state"].get("month") == month else {}
        out.append({**b, "month": month, "spend": round(spend, 2), "pct": round(100 * spend / b["amount"], 1) if b["amount"] else 0,
                    "warned": bool(st.get("warned")), "exceeded": bool(st.get("exceeded")), "blocked": bool(st.get("blocked"))})
    return out


def _in_scope(b, row, companies):
    s, v = b["scope"], (b["scope_value"] or "").lower()
    if s == "all":
        return True
    if s == "cluster":
        return row["cluster_id"].lower() == v or row["cluster"].lower() == v
    if s == "user":
        return (row["user"] or "").lower() == v
    if s == "company":
        return companies.get((row["user"] or "").lower(), "").lower() == v
    return False


def spend_for(b, rows=None):
    rows = rows if rows is not None else clusters.usage(_month())["rows"]
    comp = _companies()
    key = "charge" if b.get("basis") == "charge" else "cost"
    return sum(r[key] for r in rows if _in_scope(b, r, comp))


def save(body, bid=None, actor=""):
    name = (body.get("name") or "").strip()[:120]
    if not name:
        raise HTTPException(400, "Give the budget a name")
    scope = body.get("scope") or "all"
    if scope not in SCOPES:
        raise HTTPException(400, "Scope must be all, cluster, user or company")
    if scope != "all" and not (body.get("scope_value") or "").strip():
        raise HTTPException(400, f"Choose the {scope}")
    try:
        amount = float(body.get("amount") or 0)
    except ValueError:
        raise HTTPException(400, "Amount must be a number")
    if amount <= 0:
        raise HTTPException(400, "Monthly amount must be more than 0")
    warn = min(99.0, max(1.0, float(body.get("warn_pct") or 80)))
    action = body.get("action") or "notify"
    if action not in ("notify", "stop"):
        raise HTTPException(400, "Action must be notify or stop")
    vals = (name, scope, (body.get("scope_value") or "").strip() if scope != "all" else "", amount,
            "charge" if body.get("basis") == "charge" else "cost", warn, action, json.dumps(notify.clean_dest(body.get("dest"))))
    if bid:
        if not store.one("SELECT id FROM budgets WHERE id=?", (bid,)):
            raise HTTPException(404, "Budget not found")
        store.x("UPDATE budgets SET name=?, scope=?, scope_value=?, amount=?, basis=?, warn_pct=?, action=?, dest=?, state='{}' WHERE id=?", (*vals, bid))
    else:
        bid = uuid.uuid4().hex[:10]
        store.x("INSERT INTO budgets VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (bid, *vals, "{}", time.time(), actor))
    return _row(store.one("SELECT * FROM budgets WHERE id=?", (bid,)))


def delete(bid):
    store.x("DELETE FROM budgets WHERE id=?", (bid,))


def lift(bid):
    b = store.one("SELECT * FROM budgets WHERE id=?", (bid,))
    if not b:
        raise HTTPException(404, "Budget not found")
    st = json.loads(b["state"] or "{}")
    st["blocked"] = False
    st["lifted"] = time.time()
    store.x("UPDATE budgets SET state=? WHERE id=?", (json.dumps(st), bid))


def blocked_reason(cluster_id, user):
    """Message if a 'stop' budget blocks starting a kernel on this cluster for this user, else None."""
    month = _month()
    c = clusters.get(cluster_id) if cluster_id and cluster_id != "local-default" else None
    if not c:
        return None
    row = {"cluster_id": c["id"], "cluster": c["name"], "user": user or "system"}
    comp = _companies()
    for b in [_row(r) for r in store.q("SELECT * FROM budgets WHERE action='stop'")]:
        st = b["state"]
        if st.get("month") == month and st.get("blocked") and _in_scope(b, row, comp):
            return (f"The monthly budget “{b['name']}” is used up ({b['amount']:g}). New sessions on {c['name']} are stopped until "
                    f"next month. An admin can raise the budget or lift the block in Compute › Budgets.")
    return None


async def _stop_scope(b):
    from .kernels import kernels
    comp = _companies()
    cl = {c["id"]: c for c in clusters.list_clusters()}
    stopped = []
    for ks in list(kernels.by_id.values()):
        cid = (ks.extra_env or {}).get("DATABRIDGE_CLUSTER_ID")
        if not cid or cid not in cl:
            continue
        row = {"cluster_id": cid, "cluster": cl[cid]["name"], "user": (ks.extra_env or {}).get("DATABRIDGE_CLUSTER_USER") or "system"}
        if _in_scope(b, row, comp):
            try:
                await kernels.shutdown(ks.id)
                stopped.append(ks.label)
            except Exception:  # noqa: BLE001
                pass
    return stopped


async def check_once():
    month = _month()
    rows = await asyncio.to_thread(lambda: clusters.usage(month)["rows"])
    for b in [_row(r) for r in store.q("SELECT * FROM budgets")]:
        st = b["state"] if b["state"].get("month") == month else {"month": month}
        spend = spend_for(b, rows)
        pct = 100 * spend / b["amount"] if b["amount"] else 0
        cur = next((r["currency"] for r in rows), None) or "₹"
        changed = False
        what = f"{b['name']}: {cur}{spend:,.2f} of {cur}{b['amount']:,.2f} ({pct:.0f}%) spent in {month}"
        if pct >= 100 and not st.get("exceeded"):
            st["exceeded"] = st["warned"] = True
            text = what + "."
            if b["action"] == "stop":
                st["blocked"] = True
                stopped = await _stop_scope(b)
                text += f" Clusters in scope are stopped and new sessions are refused until next month. Stopped {len(stopped)} session(s)."
            await asyncio.to_thread(notify.send, b["dest"], f"Budget reached: {b['name']}", text, "/#/compute")
            changed = True
        elif pct >= b["warn_pct"] and not st.get("warned"):
            st["warned"] = True
            await asyncio.to_thread(notify.send, b["dest"], f"Budget at {pct:.0f}%: {b['name']}", what + ".", "/#/compute")
            changed = True
        if changed or b["state"].get("month") != month:
            store.x("UPDATE budgets SET state=? WHERE id=?", (json.dumps(st), b["id"]))


async def loop():
    while True:
        await asyncio.sleep(int(env("BUDGET_CHECK_SECONDS", "300") or 300))
        try:
            await check_once()
        except Exception:  # noqa: BLE001
            import logging
            logging.getLogger("databridge").exception("budget check failed")


# ------------------------------------------------------------------ invoices
def invoice_customers(month=None, by="company"):
    month = month or _month()
    comp = _companies()
    out = {}
    for r in clusters.usage(month)["rows"]:
        cust = (comp.get((r["user"] or "").lower()) or r["user"] or "system") if by == "company" else (r["user"] or "system")
        c = out.setdefault(cust, {"customer": cust, "node_hours": 0.0, "cost": 0.0, "charge": 0.0, "currency": r["currency"]})
        c["node_hours"] += r["node_hours"]
        c["cost"] += r["cost"]
        c["charge"] += r["charge"]
    return {"month": month, "by": by, "customers": [{**v, "node_hours": round(v["node_hours"], 2), "cost": round(v["cost"], 2),
                                                     "charge": round(v["charge"], 2)} for v in sorted(out.values(), key=lambda x: -x["charge"])]}


def invoice_html(month, customer, by="company"):
    comp = _companies()
    cl = {c["id"]: c for c in clusters.list_clusters()}
    lines = {}
    for r in clusters.usage(month)["rows"]:
        cust = (comp.get((r["user"] or "").lower()) or r["user"] or "system") if by == "company" else (r["user"] or "system")
        if cust != customer:
            continue
        c = cl.get(r["cluster_id"], {})
        rate = float(c.get("price_per_node_hour") or 0) * (1 + float(c.get("markup_pct") or 0) / 100)
        ln = lines.setdefault(r["cluster_id"], {"cluster": r["cluster"], "cloud": r["cloud"], "hours": 0.0, "rate": rate, "amount": 0.0,
                                                "currency": r["currency"]})
        ln["hours"] += r["node_hours"]
        ln["amount"] += r["charge"]
    if not lines:
        raise HTTPException(404, f"No usage for {customer} in {month}")
    cur = next(iter(lines.values()))["currency"]
    sub = sum(x["amount"] for x in lines.values())
    tax_pct = float(env("INVOICE_TAX_PCT", "0") or 0)
    tax = sub * tax_pct / 100
    e = html.escape
    import zlib
    num = f"{month.replace('-', '')}-{zlib.crc32(customer.encode()) % 100000:05d}"
    rows = "".join(f"<tr><td>{e(x['cluster'])}<div class=s>{e(x['cloud'])}</div></td><td class=n>{x['hours']:,.2f}</td>"
                   f"<td class=n>{e(cur)}{x['rate']:,.2f}</td><td class=n>{e(cur)}{x['amount']:,.2f}</td></tr>" for x in lines.values())
    frm = e(env("INVOICE_FROM_NAME", "") or "Your company name (Admin › Settings › Invoices)")
    addr = e(env("INVOICE_FROM_ADDRESS", "") or "").replace("\\n", "<br>")
    taxid = e(env("INVOICE_TAX_ID", "") or "")
    label = e(env("INVOICE_TAX_LABEL", "GST") or "Tax")
    note = e(env("INVOICE_NOTE", "") or "")
    return f"""<!doctype html><html><head><meta charset=utf-8><title>Invoice {num} · {e(customer)}</title>
<style>body{{font:14px/1.5 system-ui,Segoe UI,sans-serif;color:#1b2333;max-width:820px;margin:32px auto;padding:0 24px}}
h1{{font-size:26px;margin:0}}.top{{display:flex;justify-content:space-between;gap:24px;margin-bottom:28px}}.s{{color:#667085;font-size:12px}}
table{{width:100%;border-collapse:collapse;margin-top:12px}}th,td{{padding:9px 8px;border-bottom:1px solid #e4e7ec;text-align:left;vertical-align:top}}
th{{font-size:12px;color:#667085;font-weight:600}}.n{{text-align:right;font-variant-numeric:tabular-nums}}.tot td{{border:0;padding:5px 8px}}
.grand td{{font-weight:700;font-size:16px;border-top:2px solid #1b2333}}button{{margin-top:24px;padding:8px 16px}}@media print{{button{{display:none}}}}</style></head>
<body><div class=top><div><h1>Invoice</h1><div class=s>No. {num}<br>Period: {e(month)}<br>Date: {time.strftime('%d %b %Y')}</div></div>
<div style="text-align:right"><b>{frm}</b><div class=s>{addr}{('<br>' + label + ' ID: ' + taxid) if taxid else ''}</div></div></div>
<div><div class=s>Bill to</div><b>{e(customer)}</b></div>
<table><thead><tr><th>Compute</th><th class=n>Node-hours</th><th class=n>Rate / node-hour</th><th class=n>Amount</th></tr></thead><tbody>{rows}</tbody></table>
<table style="width:auto;margin-left:auto"><tr class=tot><td>Subtotal</td><td class=n>{e(cur)}{sub:,.2f}</td></tr>
{f'<tr class=tot><td>{label} {tax_pct:g}%</td><td class=n>{e(cur)}{tax:,.2f}</td></tr>' if tax_pct else ''}
<tr class="tot grand"><td>Total</td><td class=n>{e(cur)}{sub + tax:,.2f}</td></tr></table>
<p class=s style="margin-top:28px">Node-hours are measured every minute by DataBridge (worker nodes running for this customer's sessions and jobs).{(' ' + note) if note else ''}</p>
<button onclick="print()">Print / Save as PDF</button></body></html>"""
