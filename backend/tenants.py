"""Tenants & businesses — who synced data belongs to.

A tenant is a customer (e.g. a restaurant group); a business is one of its brands / locations. A connection can be
assigned to a tenant and either one business or "from data" (a column such as location_id, mapped through each
business's source IDs). Every row that connection syncs then carries tenant and business columns (names set in
Admin › Settings › Data Hub), so many customers can share one Catalog table safely:
  * Upsert keys become (tenant, business, key…) — two customers' order #1 never collide.
  * Full refresh replaces only that tenant's businesses in a shared table, never the other customers' rows."""
import json
import re
import threading
import time
import uuid

from fastapi import HTTPException

from .settings import DATA_ROOT, env

FILE = DATA_ROOT / ".stratum" / "tenants.json"
_lock = threading.Lock()
_CODE = re.compile(r"^[a-z][a-z0-9_]{0,39}$")
_COL = re.compile(r"^[a-z_][a-z0-9_]{0,63}$")


def _load():
    try:
        return json.loads(FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def _save(d):
    FILE.parent.mkdir(parents=True, exist_ok=True)
    tmp = FILE.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, indent=1), encoding="utf-8")
    tmp.replace(FILE)


def slug(x):
    s = re.sub(r"[^a-z0-9]+", "_", str(x or "").lower()).strip("_")
    if s and s[0].isdigit():
        s = "t_" + s
    return s[:40]


def columns():
    """(tenant column, business column) names written into every synced table."""
    t = (env("TENANT_COLUMN", "tenant") or "tenant").strip().lower()
    b = (env("BUSINESS_COLUMN", "business") or "business").strip().lower()
    return (t if _COL.match(t) else "tenant"), (b if _COL.match(b) and b != t else "business")


def list_tenants():
    from .connectors import CONN_FILE, _load as cload
    used = {}
    for c in cload(CONN_FILE, []):
        if c.get("tenant_id"):
            used[c["tenant_id"]] = used.get(c["tenant_id"], 0) + 1
    out = []
    for t in _load():
        out.append({**t, "connections": used.get(t["id"], 0)})
    return out


def get(tid):
    t = next((x for x in _load() if x["id"] == tid), None)
    if not t:
        raise HTTPException(404, "Tenant not found")
    return t


def _clean(body, old=None, others=()):
    name = str(body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "Tenant name is required")
    code = slug(body.get("code") or name)
    if not _CODE.match(code):
        raise HTTPException(400, "Tenant code: lowercase letters, digits and _ (starts with a letter)")
    if any(o["code"] == code for o in others):
        raise HTTPException(400, f"Another tenant already uses the code {code!r}")
    if old and old.get("code") != code and (body.get("confirm_code_change") is not True):
        # rows already synced keep the old code; changing it splits that tenant's data in two
        raise HTTPException(409, f"Changing the code from {old['code']!r} to {code!r} leaves rows already synced under the old code. Send confirm_code_change to proceed.")
    olds = {b["id"]: b for b in (old or {}).get("businesses") or []}
    seen_codes, seen_ids, bs = set(), {}, []
    for b in body.get("businesses") or []:
        bname = str(b.get("name") or "").strip()
        if not bname and not b.get("code"):
            continue
        bcode = slug(b.get("code") or bname)
        if not _CODE.match(bcode):
            raise HTTPException(400, f"Business {bname!r}: code must be lowercase letters, digits and _")
        if bcode in seen_codes:
            raise HTTPException(400, f"Two businesses use the code {bcode!r}")
        seen_codes.add(bcode)
        ids = []
        for x in b.get("source_ids") or []:
            x = str(x).strip()
            if not x or x in ids:
                continue
            if x in seen_ids:
                raise HTTPException(400, f"Source ID {x!r} is on both {seen_ids[x]!r} and {bname!r}")
            seen_ids[x] = bname or bcode
            ids.append(x)
        bid = b.get("id") if b.get("id") in olds else uuid.uuid4().hex[:10]
        bs.append({"id": bid, "code": bcode, "name": bname or bcode, "source_ids": ids,
                   "timezone": str(b.get("timezone") or "").strip()[:64] or None, "active": b.get("active", True) is not False})
    return {"name": name, "code": code, "notes": str(body.get("notes") or "").strip()[:500], "active": body.get("active", True) is not False,
            "businesses": bs}


def save_tenant(body, tid=None, user=None):
    with _lock:
        ts = _load()
        old = next((x for x in ts if x["id"] == tid), None) if tid else None
        if tid and not old:
            raise HTTPException(404, "Tenant not found")
        v = _clean(body, old, [x for x in ts if x is not old])
        if old:
            gone = {b["id"] for b in old.get("businesses") or []} - {b["id"] for b in v["businesses"]}
            if gone:
                from .connectors import CONN_FILE, _load as cload
                using = [c["name"] for c in cload(CONN_FILE, []) if c.get("business_id") in gone]
                if using:
                    raise HTTPException(409, f"A removed business is still used by: {', '.join(using)}. Change those connections first.")
            old.update(v, updated=time.time())
            rec = old
        else:
            rec = {"id": uuid.uuid4().hex[:10], **v, "created": time.time(), "user": user}
            ts.append(rec)
        _save(ts)
        return rec


def delete_tenant(tid):
    from .connectors import CONN_FILE, _load as cload
    using = [c["name"] for c in cload(CONN_FILE, []) if c.get("tenant_id") == tid]
    if using:
        raise HTTPException(409, f"Still used by connection(s): {', '.join(using)}. Reassign them first. Rows already synced are kept.")
    with _lock:
        _save([x for x in _load() if x["id"] != tid])
    return {"ok": True}


def validate_assignment(body, old=None):
    """Tenant / business fields of a connection. Returns the three values to store."""
    src = body if "tenant_id" in body else (old or {})
    tid = src.get("tenant_id") or None
    bid = src.get("business_id") or None
    bcol = str(src.get("business_column") or "").strip() or None
    if not tid:
        return {"tenant_id": None, "business_id": None, "business_column": None}
    t = get(tid)
    if bid and not any(b["id"] == bid for b in t.get("businesses") or []):
        raise HTTPException(400, "That business does not belong to the tenant")
    if bcol and not re.match(r"^[A-Za-z_][A-Za-z0-9_.]{0,127}$", bcol):
        raise HTTPException(400, "Business column: a column name such as location_id")
    return {"tenant_id": tid, "business_id": bid, "business_column": None if bid else bcol}


def label(conn):
    """Small display object for a connection: {tenant, business} names + codes, or None."""
    tid = conn.get("tenant_id")
    if not tid:
        return None
    t = next((x for x in _load() if x["id"] == tid), None)
    if not t:
        return {"missing": True, "tenant": "(deleted tenant)"}
    b = next((x for x in t.get("businesses") or [] if x["id"] == conn.get("business_id")), None)
    return {"tenant_id": t["id"], "tenant": t["name"], "tenant_code": t["code"],
            "business": b["name"] if b else None, "business_code": b["code"] if b else None,
            "business_from": None if b else (conn.get("business_column") or default_business_column(conn))}


def default_business_column(conn):
    return "location_id" if conn.get("type") == "airbyte" else None


def stamp(conn):
    """What the Spark load writes: {tcol, bcol, tenant, business | bfrom + bmap}. None when the connection has no tenant."""
    tid = conn.get("tenant_id")
    if not tid:
        return None
    t = next((x for x in _load() if x["id"] == tid), None)
    if not t:
        raise HTTPException(400, f"The tenant of connection {conn.get('name')!r} was deleted — assign another tenant")
    tcol, bcol = columns()
    out = {"tcol": tcol, "bcol": bcol, "tenant": t["code"]}
    b = next((x for x in t.get("businesses") or [] if x["id"] == conn.get("business_id")), None)
    if conn.get("business_id") and not b:
        raise HTTPException(400, f"The business of connection {conn.get('name')!r} was removed from tenant {t['name']!r}")
    if b:
        out["business"] = b["code"]
    else:
        out["bfrom"] = conn.get("business_column") or default_business_column(conn)
        out["bmap"] = {sid: x["code"] for x in t.get("businesses") or [] for sid in x.get("source_ids") or []}
    return out
