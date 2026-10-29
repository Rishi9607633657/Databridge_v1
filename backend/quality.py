"""Data quality rules per table (like Delta Live Tables expectations), run on demand, on a schedule, or from code.

Rule types: not_null, unique, between, in_set, regex, row_count, freshness, expression (rows must satisfy a SQL
condition) and custom_sql (a query that returns the number of bad rows). Each rule has a severity: "fail" or "warn",
and an allowed share of bad rows (default 0 %).

From a notebook or job:   dbutils.quality.check("sales.orders")              # raises (job fails) if a "fail" rule fails
                          dbutils.quality.check("sales.orders", fail=False)  # just returns the results"""
import asyncio
import json
import logging
import re
import time
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from . import fastsql, governance, notify
from .jobs import next_fire, store, validate_cron
from .kernels import run_sql

log = logging.getLogger("databridge")
DQ_KERNEL = "__quality__"
TYPES = {"not_null": "Not empty", "unique": "Unique", "between": "Between", "in_set": "One of a list", "regex": "Matches a pattern",
         "row_count": "Row count", "freshness": "Fresh (newest row age)", "expression": "Rows meet a condition", "custom_sql": "Custom SQL"}

store.db.executescript("""
CREATE TABLE IF NOT EXISTS dq_rules (id TEXT PRIMARY KEY, object TEXT, name TEXT, rule_type TEXT, col TEXT, params TEXT,
  severity TEXT, enabled INTEGER DEFAULT 1, created REAL, created_by TEXT);
CREATE INDEX IF NOT EXISTS dq_rules_o ON dq_rules(object);
CREATE TABLE IF NOT EXISTS dq_tables (object TEXT PRIMARY KEY, schedule TEXT, timezone TEXT, dest TEXT, next_run TEXT, notify TEXT);
CREATE TABLE IF NOT EXISTS dq_runs (id TEXT PRIMARY KEY, object TEXT, time REAL, trigger TEXT, status TEXT, passed INTEGER,
  failed INTEGER, warned INTEGER, rows INTEGER, results TEXT, error TEXT, duration REAL);
CREATE INDEX IF NOT EXISTS dq_runs_o ON dq_runs(object, time);
""")
store.db.commit()
_COL = re.compile(r"^[A-Za-z_][\w]*$")


def _obj(o):
    o = (o or "").strip().strip("`").lower()
    if "." not in o:
        o = f"default.{o}"
    if not re.fullmatch(r"[a-z_]\w*\.[a-z_]\w*", o):
        raise HTTPException(400, "Table must be schema.table")
    return o


def _q(c):
    return "`" + c.replace("`", "") + "`"


def _lit(v):
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        return repr(v)
    try:
        float(str(v))
        return str(v)
    except ValueError:
        return fastsql.sql_str(v)


def _rule_out(r):
    d = dict(r)
    d["params"] = json.loads(d["params"] or "{}")
    d["enabled"] = bool(d["enabled"])
    d["type_label"] = TYPES.get(d["rule_type"], d["rule_type"])
    d["text"] = describe(d)
    return d


def describe(r):
    p, c = r["params"], r.get("col") or ""
    t = r["rule_type"]
    if t == "not_null":
        return f"{c} is never empty"
    if t == "unique":
        return f"{c} has no duplicates"
    if t == "between":
        return f"{c} is between {p.get('min', '…')} and {p.get('max', '…')}"
    if t == "in_set":
        return f"{c} is one of {', '.join(map(str, p.get('values') or []))[:80]}"
    if t == "regex":
        return f"{c} matches {p.get('pattern')}"
    if t == "row_count":
        return f"row count between {p.get('min', 0)} and {p.get('max', '∞')}"
    if t == "freshness":
        return f"newest {c} is less than {p.get('max_hours')} hours old"
    if t == "expression":
        return f"every row: {p.get('expr')}"
    return "custom query returns 0 bad rows"


def _clean_rule(body):
    t = body.get("rule_type")
    if t not in TYPES:
        raise HTTPException(400, "Choose a rule type")
    col = (body.get("col") or "").strip().strip("`")
    p = dict(body.get("params") or {})
    if t in ("not_null", "unique", "between", "in_set", "regex", "freshness") and not _COL.match(col):
        raise HTTPException(400, "Choose a column")
    if t == "between" and p.get("min") in (None, "") and p.get("max") in (None, ""):
        raise HTTPException(400, "Enter a minimum, a maximum or both")
    if t == "in_set":
        vals = p.get("values")
        if isinstance(vals, str):
            vals = [x.strip() for x in vals.split(",") if x.strip()]
        if not vals:
            raise HTTPException(400, "List the allowed values")
        p["values"] = vals[:500]
    if t == "regex":
        try:
            re.compile(p.get("pattern") or "")
        except re.error as e:
            raise HTTPException(400, f"Pattern: {e}")
        if not p.get("pattern"):
            raise HTTPException(400, "Enter the pattern")
    if t == "freshness":
        try:
            p["max_hours"] = float(p.get("max_hours"))
        except (TypeError, ValueError):
            raise HTTPException(400, "Enter the maximum age in hours")
    if t == "expression":
        e = (p.get("expr") or "").strip()
        if not e or ";" in e or re.search(r"\b(insert|update|delete|drop|create)\b", e, re.I):
            raise HTTPException(400, "Enter one SQL condition every row must meet, e.g. amount >= 0 AND status <> ''")
        p["expr"] = e
    if t == "custom_sql":
        s = (p.get("sql") or "").strip().rstrip(";")
        if not re.match(r"^\s*(select|with)\b", s, re.I) or len(governance.split_statements(s)) != 1:
            raise HTTPException(400, "Custom SQL: one SELECT that returns the number of bad rows in its first column")
        p["sql"] = s
    try:
        p["max_bad_pct"] = max(0.0, float(p.get("max_bad_pct") or 0))
    except ValueError:
        raise HTTPException(400, "Allowed bad rows % must be a number")
    sev = body.get("severity") or "fail"
    if sev not in ("fail", "warn"):
        raise HTTPException(400, "Severity must be fail or warn")
    name = (body.get("name") or "").strip()[:120]
    return t, col, p, sev, name


def add_rule(body, actor):
    obj = _obj(body.get("object"))
    t, col, p, sev, name = _clean_rule(body)
    rid = uuid.uuid4().hex[:10]
    store.x("INSERT INTO dq_rules VALUES (?,?,?,?,?,?,?,1,?,?)", (rid, obj, name, t, col, json.dumps(p), sev, time.time(), actor))
    return _rule_out(store.one("SELECT * FROM dq_rules WHERE id=?", (rid,)))


def update_rule(rid, body):
    r = store.one("SELECT * FROM dq_rules WHERE id=?", (rid,))
    if not r:
        raise HTTPException(404, "Rule not found")
    if set(body) == {"enabled"}:
        store.x("UPDATE dq_rules SET enabled=? WHERE id=?", (1 if body["enabled"] else 0, rid))
    else:
        t, col, p, sev, name = _clean_rule(body)
        store.x("UPDATE dq_rules SET rule_type=?, col=?, params=?, severity=?, name=? WHERE id=?", (t, col, json.dumps(p), sev, name, rid))
    return _rule_out(store.one("SELECT * FROM dq_rules WHERE id=?", (rid,)))


def delete_rule(rid):
    store.x("DELETE FROM dq_rules WHERE id=?", (rid,))


def table_info(obj):
    obj = _obj(obj)
    s = store.one("SELECT * FROM dq_tables WHERE object=?", (obj,)) or {"object": obj, "schedule": None, "timezone": "Asia/Kolkata", "dest": "{}", "notify": "fail"}
    s = dict(s)
    s["dest"] = json.loads(s.get("dest") or "{}")
    rules = [_rule_out(r) for r in store.q("SELECT * FROM dq_rules WHERE object=? ORDER BY created", (obj,))]
    runs = [_run_out(r, False) for r in store.q("SELECT * FROM dq_runs WHERE object=? ORDER BY time DESC LIMIT 30", (obj,))]
    return {"object": obj, "settings": s, "rules": rules, "runs": runs, "types": TYPES}


def save_settings(obj, body):
    obj = _obj(obj)
    sched = (body.get("schedule") or "").strip() or None
    tz = body.get("timezone") or "Asia/Kolkata"
    if sched:
        validate_cron(sched, tz)
    nt = body.get("notify") or "fail"
    if nt not in ("fail", "always", "never"):
        raise HTTPException(400, "notify must be fail, always or never")
    nxt = next_fire(sched, tz).isoformat() if sched else None
    store.x("INSERT INTO dq_tables (object, schedule, timezone, dest, next_run, notify) VALUES (?,?,?,?,?,?) ON CONFLICT(object) DO UPDATE SET "
            "schedule=excluded.schedule, timezone=excluded.timezone, dest=excluded.dest, next_run=excluded.next_run, notify=excluded.notify",
            (obj, sched, tz, json.dumps(notify.clean_dest(body.get("dest"))), nxt, nt))
    return table_info(obj)


def _run_out(r, full=True):
    d = dict(r)
    d["results"] = json.loads(d["results"] or "[]") if full else None
    return d


def get_run(rid):
    r = store.one("SELECT * FROM dq_runs WHERE id=?", (rid,))
    if not r:
        raise HTTPException(404, "Run not found")
    return _run_out(r)


async def _sql(sql, limit=1):
    return await fastsql.query(sql, limit, lambda: asyncio.wait_for(run_sql(sql, limit, key=DQ_KERNEL, label="Data quality"), 900))


def _bad_condition(r):
    """SQL condition that is TRUE for a bad row, or None for table-level rules."""
    c, p, t = _q(r["col"]) if r["col"] else "", r["params"], r["rule_type"]
    if t == "not_null":
        return f"({c} IS NULL OR trim(cast({c} as string)) = '')"
    if t == "between":
        parts = []
        if p.get("min") not in (None, ""):
            parts.append(f"{c} < {_lit(p['min'])}")
        if p.get("max") not in (None, ""):
            parts.append(f"{c} > {_lit(p['max'])}")
        return f"({c} IS NOT NULL AND ({' OR '.join(parts)}))"
    if t == "in_set":
        return f"({c} IS NOT NULL AND cast({c} as string) NOT IN ({', '.join(fastsql.sql_str(v) for v in p['values'])}))"
    if t == "regex":
        return f"({c} IS NOT NULL AND regexp_extract(cast({c} as string), {fastsql.sql_str(p['pattern'])}, 0) = '')"
    if t == "expression":
        return f"(NOT coalesce(({p['expr']}), false))"
    return None


async def run_checks(obj, trigger="manual"):
    """Run every enabled rule of a table. Returns the run record (also stored)."""
    obj = _obj(obj)
    rules = [_rule_out(r) for r in store.q("SELECT * FROM dq_rules WHERE object=? AND enabled=1 ORDER BY created", (obj,))]
    t0 = time.time()
    token = governance.current_user.set(None)           # checks see the whole table
    results, error, n = [], None, 0
    try:
        if not rules:
            raise HTTPException(400, f"{obj} has no data quality rules yet")
        parts = ["count(*) AS __n"]
        for i, r in enumerate(rules):
            cond = _bad_condition(r)
            if cond:
                parts.append(f"sum(CASE WHEN {cond} THEN 1 ELSE 0 END) AS __r{i}")
            elif r["rule_type"] == "unique":
                parts.append(f"count({_q(r['col'])}) - count(DISTINCT {_q(r['col'])}) AS __r{i}")
            elif r["rule_type"] == "freshness":
                parts.append(f"CAST(max({_q(r['col'])}) AS STRING) AS __r{i}")
        res = await _sql(f"SELECT {', '.join(parts)} FROM {obj}", 1)
        row = dict(zip(res["columns"], res["rows"][0])) if res["rows"] else {}
        n = int(row.get("__n") or 0)
        for i, r in enumerate(rules):
            p = r["params"]
            out = {"id": r["id"], "name": r["name"] or r["text"], "type": r["rule_type"], "col": r["col"], "severity": r["severity"],
                   "text": r["text"], "bad": None, "pct": None, "value": None, "status": "pass", "sample": None}
            try:
                if r["rule_type"] == "row_count":
                    out["value"] = n
                    lo, hi = p.get("min"), p.get("max")
                    ok = (lo in (None, "") or n >= float(lo)) and (hi in (None, "") or n <= float(hi))
                    out["status"] = "pass" if ok else r["severity"]
                elif r["rule_type"] == "freshness":
                    newest = row.get(f"__r{i}")
                    out["value"] = newest
                    if newest is None:
                        out["status"] = r["severity"]
                    else:
                        ts = datetime.fromisoformat(str(newest).replace("Z", "").replace("T", " ")[:26])
                        if ts.tzinfo is None:
                            ts = ts.replace(tzinfo=timezone.utc) if "+" not in str(newest) else ts
                        age = (datetime.now(ts.tzinfo or timezone.utc) - ts).total_seconds() / 3600
                        out["value"] = f"{newest} ({age:.1f} h old)"
                        out["status"] = "pass" if age <= p["max_hours"] else r["severity"]
                elif r["rule_type"] == "custom_sql":
                    cr = await _sql(p["sql"], 1)
                    bad = int((cr["rows"][0][0] if cr["rows"] else 0) or 0)
                    out["bad"] = bad
                    out["status"] = "pass" if bad == 0 else r["severity"]
                else:
                    bad = int(row.get(f"__r{i}") or 0)
                    pct = 100.0 * bad / n if n else 0.0
                    out["bad"], out["pct"] = bad, round(pct, 3)
                    out["status"] = "pass" if (bad == 0 or pct <= p.get("max_bad_pct", 0)) else r["severity"]
                    if bad and out["status"] != "pass":
                        cond = _bad_condition(r)
                        try:
                            if cond:
                                s = await _sql(f"SELECT * FROM {obj} WHERE {cond} LIMIT 5", 5)
                            else:          # unique: show duplicated values
                                c = _q(r["col"])
                                s = await _sql(f"SELECT {c}, count(*) AS copies FROM {obj} WHERE {c} IS NOT NULL GROUP BY {c} HAVING count(*) > 1 "
                                               f"ORDER BY copies DESC LIMIT 5", 5)
                            out["sample"] = {"columns": s["columns"], "rows": s["rows"]}
                        except Exception:  # noqa: BLE001
                            pass
            except Exception as e:  # noqa: BLE001
                out["status"], out["error"] = "error", str(getattr(e, "detail", None) or e)[:300]
            results.append(out)
    except Exception as e:  # noqa: BLE001
        error = str(getattr(e, "detail", None) or e)[:500]
    finally:
        governance.current_user.reset(token)
    failed = sum(1 for x in results if x["status"] in ("fail", "error"))
    warned = sum(1 for x in results if x["status"] == "warn")
    passed = sum(1 for x in results if x["status"] == "pass")
    status = "ERROR" if error else "FAILED" if failed else "WARN" if warned else "PASSED"
    rid = uuid.uuid4().hex[:12]
    store.x("INSERT INTO dq_runs VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", (rid, obj, t0, trigger, status, passed, failed, warned, n,
                                                                       json.dumps(results, default=str), error, round(time.time() - t0, 2)))
    store.x("DELETE FROM dq_runs WHERE object=? AND id NOT IN (SELECT id FROM dq_runs WHERE object=? ORDER BY time DESC LIMIT 200)", (obj, obj))
    s = store.one("SELECT * FROM dq_tables WHERE object=?", (obj,))
    if s and (s["notify"] == "always" or (s["notify"] == "fail" and status in ("FAILED", "ERROR"))):
        lines = [f"{'✗' if x['status'] in ('fail', 'error') else '!' if x['status'] == 'warn' else '✓'} {x['name']}"
                 + (f" — {x['bad']} bad rows" if x.get("bad") else "") for x in results]
        db, tb = obj.split(".")
        await asyncio.to_thread(notify.send, json.loads(s["dest"] or "{}"), f"Data quality {status.lower()}: {obj}",
                                (error or "\n".join(lines)), f"/#/catalog?db={db}&table={tb}&tab=quality")
    return get_run(rid)


def overview():
    out = []
    for o in store.q("SELECT object, count(*) AS rules FROM dq_rules GROUP BY object ORDER BY object"):
        last = store.one("SELECT id, time, status, passed, failed, warned, rows FROM dq_runs WHERE object=? ORDER BY time DESC LIMIT 1", (o["object"],))
        s = store.one("SELECT schedule, timezone FROM dq_tables WHERE object=?", (o["object"],))
        out.append({"object": o["object"], "rules": o["rules"], "last": last, "schedule": s["schedule"] if s else None,
                    "timezone": s["timezone"] if s else None})
    return out


async def loop():
    while True:
        await asyncio.sleep(30)
        try:
            now = datetime.now(timezone.utc)
            for t in store.q("SELECT * FROM dq_tables WHERE schedule IS NOT NULL"):
                nxt = datetime.fromisoformat(t["next_run"]) if t["next_run"] else None
                if nxt is None or now >= nxt:
                    store.x("UPDATE dq_tables SET next_run=? WHERE object=?", (next_fire(t["schedule"], t["timezone"], now).isoformat(), t["object"]))
                    if nxt is not None:
                        asyncio.create_task(_safe(t["object"]))
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            log.exception("quality scheduler")


async def _safe(obj):
    try:
        await run_checks(obj, "schedule")
    except Exception:  # noqa: BLE001
        log.exception("quality run %s", obj)
