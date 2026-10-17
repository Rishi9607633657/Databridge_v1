"""Closed loop: insights become tracked decisions (open → acted/ignored → measured) with estimated impact."""
import json
import sqlite3
import time
import uuid

from fastapi import HTTPException

from .settings import DATA_ROOT

DB = DATA_ROOT / ".stratum" / "decisions.db"
FIELDS = ("id", "dashboard_id", "title", "insight", "action", "metric", "status", "created_at", "acted_at", "measure_days", "result", "owner")


def _c():
    DB.parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    c.execute("""CREATE TABLE IF NOT EXISTS decisions (id TEXT PRIMARY KEY, dashboard_id TEXT, title TEXT, insight TEXT, action TEXT,
                 metric TEXT, status TEXT, created_at REAL, acted_at TEXT, measure_days INTEGER, result TEXT, owner TEXT)""")
    return c


def _row(r):
    d = dict(r)
    for k in ("metric", "result"):
        d[k] = json.loads(d[k]) if d.get(k) else None
    return d


def list_(dashboard_id):
    with _c() as c:
        return [_row(r) for r in c.execute("SELECT * FROM decisions WHERE dashboard_id=? ORDER BY created_at DESC", (dashboard_id,))]


def create(body, owner):
    if not (body.get("action") or "").strip() or not body.get("metric"):
        raise HTTPException(400, "Describe the action and choose a metric to watch")
    d = {"id": uuid.uuid4().hex[:10], "dashboard_id": body["dashboard_id"], "title": str(body.get("title") or "")[:200],
         "insight": str(body.get("insight") or "")[:1000], "action": body["action"].strip()[:500], "metric": json.dumps(body["metric"]),
         "status": "open", "created_at": time.time(), "acted_at": None, "measure_days": int(body.get("measure_days") or 14), "result": None, "owner": owner}
    with _c() as c:
        c.execute(f"INSERT INTO decisions ({','.join(FIELDS)}) VALUES ({','.join('?' * len(FIELDS))})", [d[k] for k in FIELDS])
    return _row(d)


def update(did, body):
    sets, vals = [], []
    if body.get("status") in ("open", "acted", "ignored", "measured"):
        sets.append("status=?"); vals.append(body["status"])
    if "acted_at" in body:
        sets.append("acted_at=?"); vals.append(body["acted_at"])
    if "result" in body:
        sets.append("result=?"); vals.append(json.dumps(body["result"]) if body["result"] is not None else None)
    if "action" in body:
        sets.append("action=?"); vals.append(str(body["action"])[:500])
    if not sets:
        raise HTTPException(400, "Nothing to update")
    with _c() as c:
        c.execute(f"UPDATE decisions SET {', '.join(sets)} WHERE id=?", [*vals, did])
        r = c.execute("SELECT * FROM decisions WHERE id=?", (did,)).fetchone()
    if not r:
        raise HTTPException(404, "Decision not found")
    return _row(r)


def delete(did):
    with _c() as c:
        c.execute("DELETE FROM decisions WHERE id=?", (did,))
    return {"ok": True}
