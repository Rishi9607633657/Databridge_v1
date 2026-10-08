"""DataBridge Dashboards — datasets (SQL), widgets, filters; cached query execution on a dedicated Spark kernel.

SQL parameters: write {{name}} in a dataset's SQL. Values are inserted as safe SQL literals:
  text -> 'quoted'   number -> 12.5   date -> DATE '2026-09-01'   list -> ('a', 'b')   empty -> NULL
Filters on a column the dataset returns (without {{}}) are applied in the browser instead."""
import asyncio
import hashlib
import json
import re
import time
import uuid
from datetime import date

from fastapi import HTTPException

from .jobs import store
from .kernels import SqlError, run_sql

DASH_KERNEL = "__dashboards__"
MAX_ROWS = 5000
CACHE: dict = {}          # key -> (time, result)
CACHE_LIMIT = 200

store.db.executescript("""
CREATE TABLE IF NOT EXISTS dashboards (id TEXT PRIMARY KEY, name TEXT, description TEXT, definition TEXT,
  owner TEXT, created REAL, updated REAL);
""")
store.db.commit()

EMPTY = {"datasets": [], "filters": [], "widgets": [], "refreshMinutes": 0}


def _now():
    return time.time()


def _out(r):
    d = dict(r)
    d["definition"] = json.loads(d["definition"] or "{}") or dict(EMPTY)
    return d


def list_dashboards():
    out = []
    for r in store.q("SELECT * FROM dashboards ORDER BY updated DESC"):
        d = _out(r)
        out.append({"id": d["id"], "name": d["name"], "description": d["description"], "owner": d["owner"],
                    "updated": d["updated"], "widgets": len(d["definition"].get("widgets") or []),
                    "datasets": len(d["definition"].get("datasets") or [])})
    return out


def get_dashboard(did):
    r = store.one("SELECT * FROM dashboards WHERE id=?", (did,))
    if not r:
        raise HTTPException(404, "Dashboard not found")
    return _out(r)


def create_dashboard(body, owner):
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "Name is required")
    did = uuid.uuid4().hex[:10]
    store.x("INSERT INTO dashboards (id, name, description, definition, owner, created, updated) VALUES (?,?,?,?,?,?,?)",
            (did, name, body.get("description") or "", json.dumps(body.get("definition") or EMPTY), owner, _now(), _now()))
    return get_dashboard(did)


def save_dashboard(did, body):
    d = get_dashboard(did)
    defn = body.get("definition") or d["definition"]
    ids = [w.get("id") for w in defn.get("widgets") or []]
    if len(ids) != len(set(ids)):
        raise HTTPException(400, "Widget ids must be unique")
    store.x("UPDATE dashboards SET name=?, description=?, definition=?, updated=? WHERE id=?",
            ((body.get("name") or d["name"]).strip(), body.get("description", d["description"]), json.dumps(defn), _now(), did))
    for k in [k for k in CACHE if k.startswith(did + ":")]:
        CACHE.pop(k, None)
    return get_dashboard(did)


def delete_dashboard(did):
    store.x("DELETE FROM dashboards WHERE id=?", (did,))


# ------------------------------------------------------------------ safe parameters
_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_NUM = re.compile(r"^-?\d+(\.\d+)?$")


def _literal(v):
    if v is None or v == "" or v == []:
        return "NULL"
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, (list, tuple)):
        return "(" + ", ".join(_literal(x) for x in v) + ")"
    s = str(v)
    if _DATE.match(s):
        try:
            date.fromisoformat(s)
            return f"DATE '{s}'"
        except ValueError:
            pass
    if _NUM.match(s):
        return s
    return "'" + s.replace("\\", "\\\\").replace("'", "''") + "'"


def render_sql(sql, params):
    """Replace {{name}} with a safe literal. Unknown names become NULL."""
    def rep(m):
        return _literal((params or {}).get(m.group(1)))
    return re.sub(r"\{\{\s*([A-Za-z_]\w*)\s*\}\}", rep, sql or "")


def sql_params(sql):
    return sorted(set(re.findall(r"\{\{\s*([A-Za-z_]\w*)\s*\}\}", sql or "")))


# ------------------------------------------------------------------ queries
async def query(did, dataset_id, params, force=False, sql_override=None):
    d = get_dashboard(did)
    ds = next((x for x in d["definition"].get("datasets") or [] if x.get("id") == dataset_id), None)
    if sql_override is not None:
        ds = {"id": "__preview__", "sql": sql_override}
    if not ds:
        raise HTTPException(404, "Dataset not found")
    used = {k: v for k, v in (params or {}).items() if k in sql_params(ds["sql"])}
    sql = render_sql(ds["sql"], used)
    if not sql.strip():
        raise HTTPException(400, "The dataset has no SQL")
    key = f"{did}:{hashlib.sha1((sql).encode()).hexdigest()}"
    ttl = max(60, int(d["definition"].get("refreshMinutes") or 5) * 60)
    hit = CACHE.get(key)
    if hit and not force and _now() - hit[0] < ttl:
        return {**hit[1], "cached": True, "cachedAt": hit[0]}
    try:
        res = await asyncio.wait_for(run_sql(sql, MAX_ROWS, key=DASH_KERNEL, label="Dashboards"), 600)
    except SqlError as e:
        raise HTTPException(400, f"{e.ename}: {str(e.evalue)[:600]}")
    except asyncio.TimeoutError:
        raise HTTPException(504, "The query took longer than 10 minutes")
    out = {"columns": res["columns"], "rows": res["rows"], "truncated": res.get("truncated", False),
           "elapsed": res.get("elapsed"), "params": used}
    if len(CACHE) > CACHE_LIMIT:
        for k in sorted(CACHE, key=lambda k: CACHE[k][0])[: CACHE_LIMIT // 4]:
            CACHE.pop(k, None)
    CACHE[key] = (_now(), out)
    return {**out, "cached": False, "cachedAt": _now()}


async def filter_options(did, dataset_id, column):
    if not re.fullmatch(r"[A-Za-z_][\w]*", column or ""):
        raise HTTPException(400, "Invalid column name")
    d = get_dashboard(did)
    ds = next((x for x in d["definition"].get("datasets") or [] if x.get("id") == dataset_id), None)
    if not ds:
        raise HTTPException(404, "Dataset not found")
    base = render_sql(ds["sql"], {})
    sql = f"SELECT DISTINCT `{column}` AS v FROM ({base}) _src WHERE `{column}` IS NOT NULL ORDER BY 1 LIMIT 500"
    try:
        res = await asyncio.wait_for(run_sql(sql, 500, key=DASH_KERNEL, label="Dashboards"), 300)
    except SqlError as e:
        raise HTTPException(400, f"{e.ename}: {str(e.evalue)[:400]}")
    return [r[0] for r in res["rows"]]
