"""Semantic model for the AI dashboard builder: domain knowledge, business context, relationships (ERD) and reconciliation.

- DOMAINS: KPI/chart knowledge for HR, engineering, restaurants, retail/sales, support, finance, marketing, inventory, logistics.
  Detected from table/column names; the user can override it and add free-text business context + metric definitions.
- Relationships: auto-detected (dash_ai.relationships) + edited by the user, verified (key uniqueness, orphan keys).
- Reconciliation: checks that the numbers a dashboard shows add up to the source tables
  (dimension keys unique -> no join fan-out, no orphan keys, dataset totals == source totals, custom rules).
- Context is saved per schema (.stratum/ai_context.json) so the next dashboard on the same data starts with it."""
import asyncio
import json
import re
import threading
import time

from fastapi import HTTPException

from .settings import DATA_ROOT

CTX_FILE = DATA_ROOT / ".stratum" / "ai_context.json"
_lock = threading.Lock()

DOMAINS = {
    "auto": {"label": "Detect automatically"},
    "restaurant": {
        "label": "Restaurant / food service",
        "detect": r"menu|item|order|check|cover|table_no|server|waiter|kitchen|dine|takeaway|swiggy|zomato|tip|void|comp|store|outlet|pos",
        "kpis": ["Net sales", "Orders / checks", "Average check (net sales / orders)", "Covers / guests", "Discount %", "Voids & comps",
                 "Food cost % (cost / sales)", "Labour cost %", "Sales per labour hour", "Delivery share % (aggregators)"],
        "charts": ["Daily/hourly sales trend with forecast", "Sales by store/outlet", "Channel mix (dine-in, takeaway, delivery apps)",
                   "Top 10 menu items and categories", "Day-of-week × hour heat", "Payment method share", "Discount by store (lower is better)"],
    },
    "retail_sales": {
        "label": "Retail / sales / e-commerce",
        "detect": r"sale|revenue|invoice|customer|product|sku|order|cart|basket|region|channel|quantity|qty|price|discount|return",
        "kpis": ["Revenue", "Orders", "Average order value", "Units sold", "Gross margin %", "Return rate %", "New vs repeat customers", "Discount %"],
        "charts": ["Revenue trend with forecast", "Revenue by region/channel", "Top products/SKUs", "Category share", "Customer segment mix",
                   "Margin by category", "Returns by reason/product"],
    },
    "hr": {
        "label": "HR / people",
        "detect": r"employee|emp_|staff|headcount|hire|join|exit|attrition|termination|salary|payroll|grade|department|dept|tenure|leave|attendance|manager|performance|gender",
        "kpis": ["Headcount (active)", "New hires", "Exits", "Attrition % (exits / avg headcount)", "Average tenure (years)", "Average salary",
                 "Absenteeism %", "Gender ratio", "Average performance score"],
        "charts": ["Headcount trend (hires vs exits)", "Headcount by department", "Attrition by department/grade", "Salary distribution by grade",
                   "Tenure bands", "Gender split by department", "Performance score by department"],
    },
    "engineering": {
        "label": "Engineering / software delivery",
        "detect": r"issue|ticket|story|sprint|epic|bug|jira|commit|deploy|release|build|pipeline|incident|pull|merge|repo|assignee|story_points|velocity|lead_time|cycle",
        "kpis": ["Deployment frequency", "Lead time for changes", "Change failure rate %", "MTTR (mean time to restore)", "Open bugs",
                 "Sprint velocity (story points)", "Cycle time", "Throughput (issues closed)"],
        "charts": ["Issues created vs resolved trend", "Open issues by priority/status (funnel)", "Velocity per sprint", "Cycle time by team",
                   "Bugs by component", "Deployments per week with failure rate", "Incidents by severity"],
    },
    "support": {
        "label": "Customer support / ITSM",
        "detect": r"incident|ticket|case|sla|priority|severity|agent|assignment|resolved|opened|closed|csat|nps|response|breach|category|channel",
        "kpis": ["Tickets opened", "Tickets resolved", "Backlog (open)", "SLA met %", "Avg first response time", "Avg resolution time", "CSAT", "Reopen rate %"],
        "charts": ["Opened vs resolved trend", "Backlog by priority", "SLA breaches by group", "Resolution time by category", "Tickets by channel", "Agent workload"],
    },
    "finance": {
        "label": "Finance / accounting",
        "detect": r"ledger|gl_|account|journal|debit|credit|invoice|payable|receivable|ar_|ap_|budget|actual|expense|cost_center|profit|ebitda|cash",
        "kpis": ["Revenue", "Expenses", "Gross profit", "Net profit margin %", "Budget vs actual variance", "Cash balance", "DSO (days sales outstanding)", "Overdue receivables"],
        "charts": ["Revenue vs expense trend", "Budget vs actual by cost centre", "Expense by category", "AR ageing buckets", "Profit by business unit"],
    },
    "marketing": {
        "label": "Marketing / growth",
        "detect": r"campaign|impression|click|ctr|lead|conversion|utm|spend|cpc|cpa|roas|session|visitor|signup|funnel|channel|source|medium",
        "kpis": ["Spend", "Impressions", "Clicks", "CTR %", "Leads", "Conversion rate %", "Cost per acquisition", "ROAS"],
        "charts": ["Spend vs conversions trend", "Funnel (impressions > clicks > leads > customers)", "ROAS by campaign", "Channel mix", "Top campaigns"],
    },
    "inventory": {
        "label": "Inventory / manufacturing",
        "detect": r"stock|inventory|warehouse|sku|batch|lot|production|machine|defect|scrap|yield|oee|downtime|reorder|supplier|purchase",
        "kpis": ["Stock on hand", "Stock value", "Days of inventory", "Stock-outs", "Production output", "Yield %", "Defect rate %", "Downtime hours"],
        "charts": ["Stock level trend", "Stock value by warehouse", "Items below reorder point", "Defects by line/machine", "Output vs plan"],
    },
    "logistics": {
        "label": "Logistics / delivery",
        "detect": r"shipment|delivery|courier|route|vehicle|driver|dispatch|eta|delay|distance|km|freight|consignment|pod|tracking",
        "kpis": ["Shipments", "On-time delivery %", "Average delivery time", "Delayed shipments", "Cost per shipment", "Distance travelled"],
        "charts": ["Shipments trend", "On-time % by route/hub", "Delay reasons", "Cost per shipment by carrier", "Deliveries by city"],
    },
}


def domain_list():
    return [{"id": k, "label": v["label"]} for k, v in DOMAINS.items()]


def detect_domain(profiles):
    words = " ".join([p["table"] for p in profiles] + [c["name"] for p in profiles for c in p["columns"]]).lower()
    best, score = "retail_sales", 0
    for k, d in DOMAINS.items():
        if k == "auto":
            continue
        s = len(re.findall(d["detect"], words))
        if s > score:
            best, score = k, s
    return best


def domain_brief(domain):
    d = DOMAINS.get(domain) or {}
    if not d.get("kpis"):
        return ""
    return (f"Domain: {d['label']}.\nTypical KPIs (use the ones the data supports, with these exact business meanings): {'; '.join(d['kpis'])}.\n"
            f"Useful charts for this domain: {'; '.join(d['charts'])}.")


# ---------------- saved context per schema ----------------
def _ctx_all():
    try:
        return json.loads(CTX_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def context_key(tables, schema=None):
    if schema:
        return schema
    schemas = sorted({t.split(".")[0] for t in tables or []})
    return ",".join(schemas) or "default"


def get_context(key):
    return _ctx_all().get(key) or {}


def save_context(key, ctx):
    clean = {"domain": ctx.get("domain") if ctx.get("domain") in DOMAINS else "auto",
             "context": str(ctx.get("context") or "")[:6000],
             "density": ctx.get("density") if ctx.get("density") in ("compact", "standard", "detailed") else "standard",
             "metrics": [{"name": str(m.get("name") or "")[:80], "definition": str(m.get("definition") or "")[:400]}
                         for m in (ctx.get("metrics") or []) if (m.get("name") or "").strip()][:40],
             "relationships": [r for r in (_rel(r) for r in (ctx.get("relationships") or [])) if r][:40],
             "rules": [r for r in (_rule(r) for r in (ctx.get("rules") or [])) if r][:30],
             "updated": time.time()}
    with _lock:
        CTX_FILE.parent.mkdir(parents=True, exist_ok=True)
        allc = _ctx_all()
        allc[key] = clean
        tmp = CTX_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(allc, indent=1), encoding="utf-8")
        tmp.replace(CTX_FILE)
    return clean


_FQ = re.compile(r"^[A-Za-z_]\w*\.[A-Za-z_]\w*$")
_COL = re.compile(r"^[A-Za-z_][\w ]*$")


def _rel(r):
    try:
        f, t, on = r["from"], r["to"], r["on"]
        if _FQ.match(f) and _FQ.match(t) and len(on) == 2 and all(_COL.match(str(c)) for c in on):
            out = {"from": f, "to": t, "on": [str(on[0]), str(on[1])], "source": r.get("source") or "user"}
            if r.get("removed"):
                out["removed"] = True
            return out
    except (KeyError, TypeError):
        pass
    return None


def _rule(r):
    name = str((r or {}).get("name") or "").strip()[:100]
    left, right = str(r.get("left") or "").strip(), str(r.get("right") or "").strip()
    ro = re.compile(r"^\s*(select|with)\b", re.I)
    if not name or not ro.match(left) or (right and not ro.match(right) and not re.fullmatch(r"-?\d+(\.\d+)?", right)):
        return None
    try:
        tol = float(r.get("tolerance") or 0)
    except (TypeError, ValueError):
        tol = 0.0
    return {"name": name, "left": left, "right": right, "tolerance": max(0.0, min(tol, 100.0))}


# ---------------- ERD payload ----------------
def erd(profiles, rels):
    """Tables with their key / measure / category columns and verified relationships, for the ERD diagram."""
    tables = []
    for p in profiles:
        n = p["rows"]
        cols = []
        for c in p["columns"]:
            role = ("pk" if n and c["distinct"] and c["distinct"] >= 0.9 * n and c["kind"] in ("id", "num", "cat", "text") and re.search(r"(^|_)(id|key|code|no)$", c["name"].lower())
                    else "fk" if any((r["from"] == p["table"] and r["on"][0] == c["name"]) for r in rels)
                    else "date" if c["kind"] == "date" else "measure" if c["kind"] == "num" else "dim" if c["kind"] == "cat" else "attr")
            cols.append({"name": c["name"], "type": c["type"], "role": role, "distinct": c["distinct"]})
        is_fact = any(r["from"] == p["table"] for r in rels) or (any(c["kind"] == "num" for c in p["columns"]) and any(c["kind"] == "date" for c in p["columns"]))
        tables.append({"table": p["table"], "rows": n, "kind": "fact" if is_fact else "dimension", "columns": cols})
    return {"tables": tables, "relationships": rels}


# ---------------- reconciliation ----------------
def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


async def _scalar(run, sql):
    res = await asyncio.wait_for(run(sql, 1), 300)
    rows = res.get("rows") or []
    return rows[0][0] if rows and rows[0] else None


def _q(name):
    return "`" + str(name).replace("`", "") + "`"


async def reconcile(run, profiles, rels, datasets=None, rules=None):
    """Run the checks. run(sql, limit) -> {columns, rows}. Returns a list of check results."""
    out = []
    by = {p["table"]: p for p in profiles}

    async def check(name, kind, sql, judge, detail_fn, sql2=None):
        item = {"name": name, "kind": kind, "sql": sql if not sql2 else f"{sql}\n-- vs --\n{sql2}"}
        try:
            a = await _scalar(run, sql)
            b = await _scalar(run, sql2) if sql2 else None
            item.update(left=a, right=b)
            item["status"] = judge(a, b)
            item["detail"] = detail_fn(a, b)
        except Exception as e:  # noqa: BLE001
            item.update(status="error", detail=str(getattr(e, "evalue", None) or getattr(e, "detail", None) or e)[:300])
        out.append(item)

    for r in rels:
        f, t, (fk, pk) = r["from"], r["to"], r["on"]
        if t not in by or f not in by:
            continue
        await check(f"Key {t.split('.')[-1]}.{pk} is unique", "unique_key",
                    f"SELECT COUNT(*) - COUNT(DISTINCT {_q(pk)}) AS v FROM {t} WHERE {_q(pk)} IS NOT NULL",
                    lambda a, b: "pass" if not _num(a) else "fail",
                    lambda a, b, t=t, pk=pk: "Each key appears once — joins will not double-count." if not _num(a)
                    else f"{int(_num(a)):,} duplicate {pk} value(s) in {t}: joining to it multiplies rows and inflates totals. Deduplicate it first.")
        n = by[f]["rows"] or 0
        await check(f"Every {f.split('.')[-1]}.{fk} exists in {t.split('.')[-1]}", "orphans",
                    f"SELECT COUNT(*) AS v FROM {f} x WHERE x.{_q(fk)} IS NOT NULL AND NOT EXISTS (SELECT 1 FROM {t} y WHERE y.{_q(pk)} = x.{_q(fk)})",
                    lambda a, b: "pass" if not _num(a) else "warn",
                    lambda a, b, n=n, fk=fk, t=t: "No orphan keys." if not _num(a)
                    else f"{int(_num(a)):,} row(s) ({(_num(a) / n * 100 if n else 0):.2f}%) have a {fk} that is missing in {t}. They show as (blank) when grouped by its columns.")

    for d in datasets or []:
        sql = (d.get("sql") or "").strip().rstrip(";")
        if not re.search(r"\bgroup\s+by\b", sql, re.I):
            continue
        base = next((p for p in profiles if re.search(r"\bfrom\s+" + re.escape(p["table"]) + r"\b", sql, re.I)), None)
        if not base:
            continue
        has_where = re.search(r"\bwhere\b", sql, re.I)
        measures = [m for m in re.findall(r"sum\s*\(\s*`?([A-Za-z_]\w*)`?\s*\)\s+as\s+`?([A-Za-z_]\w*)`?", sql, re.I)
                    if any(c["name"] == m[0] for c in base["columns"])][:3]
        for col, alias in measures:
            await check(f"“{d.get('name') or d['id']}”: total {alias} matches {base['table']}", "totals",
                        f"SELECT SUM({_q(alias)}) AS v FROM ({sql}) _d", lambda a, b: _judge_eq(a, b, 0.05),
                        lambda a, b, has_where=has_where: _eq_detail(a, b) + (" (the dataset has a WHERE filter, so a difference can be expected)" if has_where and _diff(a, b) else ""),
                        f"SELECT SUM({_q(col)}) AS v FROM {base['table']}")
        if re.search(r"count\s*\(\s*\*\s*\)\s+as\s+`?records`?", sql, re.I):
            await check(f"“{d.get('name') or d['id']}”: record count matches {base['table']}", "totals",
                        f"SELECT SUM(`records`) AS v FROM ({sql}) _d", lambda a, b: _judge_eq(a, b, 0),
                        lambda a, b: _eq_detail(a, b), f"SELECT COUNT(*) AS v FROM {base['table']}")

    for r in rules or []:
        right = r.get("right") or ""
        is_num = re.fullmatch(r"-?\d+(\.\d+)?", right or "")
        tol = r.get("tolerance") or 0
        if right and not is_num:
            await check(r["name"], "rule", r["left"], lambda a, b, tol=tol: _judge_eq(a, b, tol), _eq_detail, right)
        else:
            target = float(right) if is_num else None
            await check(r["name"], "rule", r["left"],
                        lambda a, b, target=target, tol=tol: (_judge_eq(a, target, tol) if target is not None else ("pass" if a not in (None, 0, "0") else "warn")),
                        lambda a, b, target=target: _eq_detail(a, target) if target is not None else f"Result: {a}")
    return out


def _diff(a, b):
    x, y = _num(a), _num(b)
    if x is None or y is None:
        return None if x == y else float("inf")
    return abs(x - y)


def _judge_eq(a, b, tol_pct):
    x, y = _num(a), _num(b)
    if x is None and y is None:
        return "pass"
    if x is None or y is None:
        return "warn"
    if abs(x - y) <= 1e-6 * max(1.0, abs(y)):
        return "pass"
    pct = abs(x - y) / (abs(y) or 1) * 100
    return "pass" if pct <= tol_pct else "warn" if pct <= 5 else "fail"


def _eq_detail(a, b):
    x, y = _num(a), _num(b)
    if x is None or y is None:
        return f"{a} vs {b}"
    if abs(x - y) <= 1e-6 * max(1.0, abs(y)):
        return f"Both are {y:,.2f}."
    pct = abs(x - y) / (abs(y) or 1) * 100
    return f"{x:,.2f} vs {y:,.2f} — difference {x - y:+,.2f} ({pct:.2f}%)."


def summary(checks):
    s = {"pass": 0, "warn": 0, "fail": 0, "error": 0}
    for c in checks:
        s[c.get("status", "error")] = s.get(c.get("status", "error"), 0) + 1
    return s


def check_ctx_body(body):
    if not isinstance(body, dict):
        raise HTTPException(400, "Expected a JSON object")
    return body
