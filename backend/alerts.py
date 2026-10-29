"""SQL alerts: a saved query + a condition, checked on a schedule; notifies by e-mail, Slack or Teams.

Condition kinds
  value   — compare one column of the first row with a threshold:  > >= < <= == !=
  rows    — the query returns any rows / no rows
  changed — the first row's value differs from the previous check
Alerts run as their owner, so the owner's data permissions (Governance) apply."""
import asyncio
import json
import logging
import time
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException

from . import fastsql, governance, notify
from .jobs import next_fire, store, validate_cron
from .kernels import SqlError, run_sql

log = logging.getLogger("databridge")
ALERT_KERNEL = "__alerts__"
OPS = (">", ">=", "<", "<=", "==", "!=")

store.db.executescript("""
CREATE TABLE IF NOT EXISTS alerts (id TEXT PRIMARY KEY, name TEXT, query TEXT, kind TEXT, col TEXT, op TEXT, threshold TEXT,
  schedule TEXT, timezone TEXT, paused INTEGER DEFAULT 0, notify_when TEXT, notify_ok INTEGER DEFAULT 1, dest TEXT, owner TEXT,
  state TEXT, last_value TEXT, last_error TEXT, last_checked REAL, last_triggered REAL, next_run TEXT, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS alert_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, alert_id TEXT, time REAL, state TEXT, value TEXT,
  error TEXT, notified TEXT);
CREATE INDEX IF NOT EXISTS alert_runs_a ON alert_runs(alert_id, time);
""")
store.db.commit()
_running = set()


def _row(r):
    d = dict(r)
    d["dest"] = json.loads(d["dest"] or "{}")
    d["paused"] = bool(d["paused"])
    d["notify_ok"] = bool(d["notify_ok"])
    return d


def list_alerts():
    return [_row(r) for r in store.q("SELECT * FROM alerts ORDER BY name COLLATE NOCASE")]


def get(aid):
    r = store.one("SELECT * FROM alerts WHERE id=?", (aid,))
    if not r:
        raise HTTPException(404, "Alert not found")
    a = _row(r)
    a["history"] = store.q("SELECT * FROM alert_runs WHERE alert_id=? ORDER BY id DESC LIMIT 100", (aid,))
    return a


def condition_text(a):
    if a["kind"] == "rows":
        return "the query returns rows" if a["op"] != "==" else "the query returns no rows"
    if a["kind"] == "changed":
        return f"{a['col'] or 'the first value'} changes"
    return f"{a['col'] or 'first column'} {a['op']} {a['threshold']}"


def _clean(body):
    name = (body.get("name") or "").strip()[:150]
    if not name:
        raise HTTPException(400, "Give the alert a name")
    q = (body.get("query") or "").strip().rstrip(";")
    if not q:
        raise HTTPException(400, "Write the query to check")
    if len(governance.split_statements(q)) != 1 or governance.refs(q)[1]:
        raise HTTPException(400, "An alert query must be one SELECT statement (it must not change data)")
    kind = body.get("kind") or "value"
    if kind not in ("value", "rows", "changed"):
        raise HTTPException(400, "Unknown condition")
    op = body.get("op") or (">" if kind == "value" else "!=")
    if kind == "value" and op not in OPS:
        raise HTTPException(400, f"Operator must be one of {' '.join(OPS)}")
    if kind == "value" and str(body.get("threshold") or "").strip() == "":
        raise HTTPException(400, "Enter the threshold value")
    sched = (body.get("schedule") or "").strip() or "*/15 * * * *"
    tz = body.get("timezone") or "Asia/Kolkata"
    validate_cron(sched, tz)
    nw = body.get("notify_when") or "change"
    if nw not in ("change", "each"):
        raise HTTPException(400, "notify_when must be change or each")
    return {"name": name, "query": q, "kind": kind, "col": (body.get("col") or "").strip(), "op": op,
            "threshold": str(body.get("threshold") or "").strip(), "schedule": sched, "timezone": tz,
            "paused": 1 if body.get("paused") else 0, "notify_when": nw, "notify_ok": 0 if body.get("notify_ok") is False else 1,
            "dest": json.dumps(notify.clean_dest(body.get("dest")))}


def save(body, aid=None, owner=""):
    v = _clean(body)
    nxt = next_fire(v["schedule"], v["timezone"]).isoformat()
    now = time.time()
    if aid:
        get(aid)
        cols = ", ".join(f"{k}=?" for k in v)
        store.x(f"UPDATE alerts SET {cols}, next_run=?, updated=? WHERE id=?", (*v.values(), nxt, now, aid))
    else:
        aid = uuid.uuid4().hex[:10]
        store.x(f"INSERT INTO alerts (id, {', '.join(v)}, owner, state, next_run, created, updated) VALUES (?{', ?' * len(v)}, ?, 'UNKNOWN', ?, ?, ?)",
                (aid, *v.values(), owner, nxt, now, now))
    return get(aid)


def delete(aid):
    store.x("DELETE FROM alert_runs WHERE alert_id=?", (aid,))
    store.x("DELETE FROM alerts WHERE id=?", (aid,))


def _owner_user(name):
    u = store.one("SELECT * FROM users WHERE username=?", (name,)) if name else None
    if not u:
        return None
    from .auth import _public
    return _public(u)


async def run_query(q, user, limit=1000):
    token = governance.current_user.set(user)
    try:
        return await fastsql.query(q, limit, lambda: asyncio.wait_for(run_sql(q, limit, key=ALERT_KERNEL, label="SQL alerts"), 600))
    finally:
        governance.current_user.reset(token)


def _num(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def evaluate(a, res):
    """(triggered: bool, value: str)"""
    rows, cols = res.get("rows") or [], res.get("columns") or []
    if a["kind"] == "rows":
        has = len(rows) > 0
        return (not has) if a["op"] == "==" else has, f"{len(rows)} row{'s' if len(rows) != 1 else ''}"
    if not rows:
        return False if a["kind"] == "value" else (a["last_value"] not in (None, "", "(no rows)")), "(no rows)"
    ci = cols.index(a["col"]) if a["col"] in cols else 0
    val = rows[0][ci]
    sval = "" if val is None else str(val)
    if a["kind"] == "changed":
        return a["last_value"] is not None and a["state"] != "UNKNOWN" and sval != a["last_value"], sval
    x, t = _num(val), _num(a["threshold"])
    if x is None or t is None:
        x, t = sval, a["threshold"]
        if a["op"] not in ("==", "!="):
            raise ValueError(f"Can't compare text value {sval!r} with {a['op']}")
    ok = {">": x > t, ">=": x >= t, "<": x < t, "<=": x <= t, "==": x == t, "!=": x != t}[a["op"]]
    return ok, sval


async def check(aid, manual=False):
    if aid in _running:
        raise HTTPException(409, "This alert is being checked right now")
    _running.add(aid)
    try:
        a = get(aid)
        user = _owner_user(a["owner"])
        state, value, err = "OK", None, None
        try:
            res = await run_query(a["query"], user)
            trig, value = evaluate(a, res)
            state = "TRIGGERED" if trig else "OK"
        except (SqlError, HTTPException, ValueError, asyncio.TimeoutError) as e:
            state, err = "ERROR", (getattr(e, "detail", None) or str(e))[:500]
        except Exception as e:  # noqa: BLE001
            state, err = "ERROR", str(e)[:500]
        prev = a["state"]
        sent = None
        link = f"/#/alert/{aid}"
        if state == "TRIGGERED" and (prev != "TRIGGERED" or a["notify_when"] == "each"):
            sent = await asyncio.to_thread(notify.send, a["dest"], f"Alert: {a['name']}",
                                           f"{a['name']} is triggered: {condition_text(a)} (value now: {value}).", link)
        elif state == "OK" and prev == "TRIGGERED" and a["notify_ok"]:
            sent = await asyncio.to_thread(notify.send, a["dest"], f"Back to normal: {a['name']}",
                                           f"{a['name']} is back to normal (value now: {value}).", link)
        elif state == "ERROR" and prev != "ERROR":
            sent = await asyncio.to_thread(notify.send, a["dest"], f"Alert failed: {a['name']}",
                                           f"The alert query failed: {err}", link)
        now = time.time()
        store.x("UPDATE alerts SET state=?, last_value=?, last_error=?, last_checked=?, last_triggered=COALESCE(?, last_triggered) WHERE id=?",
                (state, value, err, now, now if state == "TRIGGERED" else None, aid))
        store.x("INSERT INTO alert_runs (alert_id, time, state, value, error, notified) VALUES (?,?,?,?,?,?)",
                (aid, now, state, value, err, json.dumps(sent) if sent else None))
        store.x("DELETE FROM alert_runs WHERE alert_id=? AND id NOT IN (SELECT id FROM alert_runs WHERE alert_id=? ORDER BY id DESC LIMIT 500)", (aid, aid))
        return get(aid)
    finally:
        _running.discard(aid)


async def loop():
    while True:
        await asyncio.sleep(15)
        try:
            now = datetime.now(timezone.utc)
            for a in store.q("SELECT id, schedule, timezone, next_run FROM alerts WHERE paused=0"):
                nxt = datetime.fromisoformat(a["next_run"]) if a["next_run"] else None
                if nxt is None or now >= nxt:
                    store.x("UPDATE alerts SET next_run=? WHERE id=?", (next_fire(a["schedule"], a["timezone"], now).isoformat(), a["id"]))
                    if nxt is not None and a["id"] not in _running:
                        asyncio.create_task(_safe_check(a["id"]))
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            log.exception("alert scheduler")


async def _safe_check(aid):
    try:
        await check(aid)
    except Exception:  # noqa: BLE001
        log.exception("alert %s", aid)
