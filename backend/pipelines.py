"""DataBridge Pipelines — Azure Data Factory-style orchestration.

Pipelines contain activities joined by dependency conditions (Succeeded / Failed / Completed / Skipped).
Activities: Copy, Notebook, SqlScript, Web, Lookup, SetVariable, AppendVariable, IfCondition, ForEach,
ExecutePipeline, Wait, Fail. Triggers: manual/API, schedule (cron), tumbling window (with backfill)."""
import asyncio
import json
import time
import uuid
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

import httpx
from croniter import croniter
from fastapi import HTTPException

from .expressions import ExpressionError, evaluate
from .jobs import manager as job_manager, store
from .kernels import SqlError, kernels, run_sql

PIPE_KERNEL = "__pipelines__"
TERMINAL = {"Succeeded", "Failed", "Skipped", "Cancelled"}
CONTAINERS = {"IfCondition": ("ifTrueActivities", "ifFalseActivities"), "ForEach": ("activities",)}
SECRET_KEYS = {"password", "key", "token", "apiKey", "accountKey", "headerValue"}
MASK = "********"

store.db.executescript("""
CREATE TABLE IF NOT EXISTS linked_services (id TEXT PRIMARY KEY, name TEXT UNIQUE, type TEXT, config TEXT, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS pipelines (id TEXT PRIMARY KEY, name TEXT UNIQUE, description TEXT, draft TEXT, published TEXT,
  published_at REAL, version INTEGER DEFAULT 0, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS pipeline_runs (id TEXT PRIMARY KEY, pipeline_id TEXT, run_number INTEGER, trigger TEXT, params TEXT,
  state TEXT, start REAL, end REAL, message TEXT, debug INTEGER DEFAULT 0, definition TEXT, parent_run TEXT, rerun_of TEXT, trigger_info TEXT);
CREATE INDEX IF NOT EXISTS pruns_pipe ON pipeline_runs(pipeline_id, run_number);
CREATE TABLE IF NOT EXISTS activity_runs (id TEXT PRIMARY KEY, run_id TEXT, name TEXT, type TEXT, path TEXT, state TEXT,
  start REAL, end REAL, input TEXT, output TEXT, error TEXT, attempt INTEGER DEFAULT 1, seq INTEGER);
CREATE INDEX IF NOT EXISTS aruns_run ON activity_runs(run_id, seq);
CREATE TABLE IF NOT EXISTS pipeline_state (pipeline_id TEXT, key TEXT, value TEXT, PRIMARY KEY (pipeline_id, key));
""")
store.db.commit()


def _now():
    return time.time()


def _j(v, default=None):
    return json.loads(v) if v else default


# =============================================================== linked services
def _mask(cfg):
    return {k: (MASK if k in SECRET_KEYS and v else v) for k, v in (cfg or {}).items()}


def list_linked():
    return [{**r, "config": _mask(_j(r["config"], {}))} for r in store.q("SELECT * FROM linked_services ORDER BY name")]


def _linked(name_or_id):
    r = store.one("SELECT * FROM linked_services WHERE id = ? OR name = ?", (name_or_id, name_or_id))
    if not r:
        raise HTTPException(404, f"Linked service {name_or_id!r} not found")
    return {**r, "config": _j(r["config"], {})}


def save_linked(body, ls_id=None):
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "Name is required")
    cfg = dict(body.get("config") or {})
    if ls_id:
        old = _linked(ls_id)["config"]
        for k, v in cfg.items():
            if v == MASK:
                cfg[k] = old.get(k)
        store.x("UPDATE linked_services SET name=?, type=?, config=?, updated=? WHERE id=?",
                (name, body.get("type"), json.dumps(cfg), _now(), ls_id))
    else:
        ls_id = uuid.uuid4().hex[:10]
        try:
            store.x("INSERT INTO linked_services (id, name, type, config, created, updated) VALUES (?,?,?,?,?,?)",
                    (ls_id, name, body.get("type"), json.dumps(cfg), _now(), _now()))
        except Exception:
            raise HTTPException(409, f"A linked service named {name!r} already exists")
    return {**_linked(ls_id), "config": _mask(cfg)}


def delete_linked(ls_id):
    store.x("DELETE FROM linked_services WHERE id = ?", (ls_id,))


async def test_linked(body):
    t, cfg = body.get("type"), dict(body.get("config") or {})
    if body.get("id"):
        old = _linked(body["id"])["config"]
        cfg = {k: (old.get(k) if v == MASK else v) for k, v in cfg.items()}
    try:
        if t == "postgresql":
            import psycopg2
            c = psycopg2.connect(host=cfg.get("host"), port=int(cfg.get("port") or 5432), dbname=cfg.get("database"),
                                 user=cfg.get("user"), password=cfg.get("password"), connect_timeout=8,
                                 sslmode=cfg.get("sslmode") or "prefer")
            c.close()
            return {"ok": True, "message": "Connected to PostgreSQL"}
        if t == "rest":
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(cfg.get("baseUrl"), headers=_rest_headers(cfg))
            return {"ok": r.status_code < 500, "message": f"HTTP {r.status_code}"}
        if t == "adls":
            return {"ok": bool(cfg.get("account") and cfg.get("container")), "message": "Settings look complete (checked when a copy runs)"}
        return {"ok": False, "message": f"Unknown type {t}"}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "message": str(e).strip()[:300]}


def _rest_headers(cfg):
    h = {}
    if cfg.get("headerName") and cfg.get("headerValue"):
        h[cfg["headerName"]] = cfg["headerValue"]
    if cfg.get("token"):
        h["Authorization"] = f"Bearer {cfg['token']}"
    return h


# =============================================================== pipeline CRUD + validation
EMPTY_DEF = {"parameters": {}, "variables": {}, "activities": [], "triggers": []}


def _pipe_out(r, runs=None):
    d = dict(r)
    d["draft"] = _j(d["draft"], EMPTY_DEF)
    d["published"] = _j(d["published"], None)
    if runs is not None:
        d["recent_runs"] = runs
    return d


def list_pipelines():
    out = []
    for r in store.q("SELECT * FROM pipelines ORDER BY name COLLATE NOCASE"):
        runs = [_run_out(x) for x in store.q("SELECT * FROM pipeline_runs WHERE pipeline_id=? AND debug=0 ORDER BY run_number DESC LIMIT 10", (r["id"],))]
        out.append(_pipe_out(r, runs))
    return out


def get_pipeline(pid):
    r = store.one("SELECT * FROM pipelines WHERE id = ? OR name = ?", (pid, pid))
    if not r:
        raise HTTPException(404, "Pipeline not found")
    return _pipe_out(r)


def create_pipeline(body):
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "Name is required")
    pid = uuid.uuid4().hex[:10]
    try:
        store.x("INSERT INTO pipelines (id, name, description, draft, created, updated) VALUES (?,?,?,?,?,?)",
                (pid, name, body.get("description") or "", json.dumps(body.get("definition") or EMPTY_DEF), _now(), _now()))
    except Exception:
        raise HTTPException(409, f"A pipeline named {name!r} already exists")
    return get_pipeline(pid)


def save_draft(pid, body):
    p = get_pipeline(pid)
    store.x("UPDATE pipelines SET name=?, description=?, draft=?, updated=? WHERE id=?",
            ((body.get("name") or p["name"]).strip(), body.get("description", p["description"]),
             json.dumps(body.get("definition") or EMPTY_DEF), _now(), p["id"]))
    return get_pipeline(p["id"])


def delete_pipeline(pid):
    p = get_pipeline(pid)
    for r in store.q("SELECT id FROM pipeline_runs WHERE pipeline_id=?", (p["id"],)):
        store.x("DELETE FROM activity_runs WHERE run_id=?", (r["id"],))
    store.x("DELETE FROM pipeline_runs WHERE pipeline_id=?", (p["id"],))
    store.x("DELETE FROM pipeline_state WHERE pipeline_id=?", (p["id"],))
    store.x("DELETE FROM pipelines WHERE id=?", (p["id"],))


REQUIRED = {"Notebook": ["notebookPath"], "SqlScript": ["query"], "Web": ["url"], "SetVariable": ["variableName"],
            "AppendVariable": ["variableName"], "IfCondition": ["expression"], "ForEach": ["items"],
            "ExecutePipeline": ["pipeline"], "Wait": ["waitTimeInSeconds"], "Fail": ["message"]}


def validate(defn):
    errors = []

    def check(acts, where):
        names = [a.get("name") for a in acts]
        for n in names:
            if not n:
                errors.append(f"{where}: an activity has no name")
            elif names.count(n) > 1:
                errors.append(f"{where}: duplicate activity name {n!r}")
        graph = {a.get("name"): [d.get("activity") for d in a.get("dependsOn") or []] for a in acts}
        for a in acts:
            tp = a.get("typeProperties") or {}
            for d in a.get("dependsOn") or []:
                if d.get("activity") not in graph:
                    errors.append(f"{a.get('name')}: depends on unknown activity {d.get('activity')!r}")
            for k in REQUIRED.get(a.get("type"), []):
                if tp.get(k) in (None, ""):
                    errors.append(f"{a.get('name')}: '{k}' is required")
            if a.get("type") == "Copy":
                if not (tp.get("source") or {}).get("type"):
                    errors.append(f"{a.get('name')}: choose a source")
                if not (tp.get("sink") or {}).get("table"):
                    errors.append(f"{a.get('name')}: choose a sink table")
            for key in CONTAINERS.get(a.get("type"), ()):
                check(tp.get(key) or [], f"{where} › {a.get('name')}")
        seen, stack = set(), set()

        def visit(n):
            if n in stack:
                errors.append(f"{where}: circular dependency at {n!r}")
                return
            if n in seen or n not in graph:
                return
            stack.add(n)
            for d in graph[n]:
                visit(d)
            stack.discard(n)
            seen.add(n)
        for n in graph:
            visit(n)
    check(defn.get("activities") or [], "pipeline")
    for t in defn.get("triggers") or []:
        if t.get("type") == "schedule" and not croniter.is_valid(t.get("cron") or ""):
            errors.append(f"Trigger {t.get('name')}: invalid cron {t.get('cron')!r}")
        if t.get("type") == "tumbling" and not int(t.get("frequencyMinutes") or 0) > 0:
            errors.append(f"Trigger {t.get('name')}: frequency must be > 0 minutes")
    return errors


def publish(pid):
    p = get_pipeline(pid)
    errs = validate(p["draft"])
    if errs:
        raise HTTPException(400, "Fix these before publishing: " + "; ".join(errs[:8]))
    store.x("UPDATE pipelines SET published=?, published_at=?, version=version+1 WHERE id=?",
            (json.dumps(p["draft"]), _now(), p["id"]))
    for i, t in enumerate(p["draft"].get("triggers") or []):   # reset schedule pointers so new settings apply
        if t.get("type") == "schedule":
            _state_set(p["id"], f"trigger:{t.get('name') or i}:next", None)
    return get_pipeline(p["id"])


def _state_get(pid, key):
    r = store.one("SELECT value FROM pipeline_state WHERE pipeline_id=? AND key=?", (pid, key))
    return r["value"] if r else None


def _state_set(pid, key, value):
    if value is None:
        store.x("DELETE FROM pipeline_state WHERE pipeline_id=? AND key=?", (pid, key))
    else:
        store.x("INSERT INTO pipeline_state (pipeline_id, key, value) VALUES (?,?,?) "
                "ON CONFLICT(pipeline_id, key) DO UPDATE SET value=excluded.value", (pid, key, str(value)))


# =============================================================== runs
def _run_out(r):
    d = dict(r)
    d["params"] = _j(d.get("params"), {})
    d["trigger_info"] = _j(d.get("trigger_info"), {})
    d.pop("definition", None)
    d["duration"] = ((d["end"] or _now()) - d["start"]) if d.get("start") else None
    return d


def list_runs(pid=None, limit=50):
    if pid:
        p = get_pipeline(pid)
        rows = store.q("SELECT * FROM pipeline_runs WHERE pipeline_id=? ORDER BY start DESC LIMIT ?", (p["id"], limit))
    else:
        rows = store.q("SELECT * FROM pipeline_runs ORDER BY start DESC LIMIT ?", (limit,))
    names = {r["id"]: r["name"] for r in store.q("SELECT id, name FROM pipelines")}
    return [{**_run_out(r), "pipeline_name": names.get(r["pipeline_id"])} for r in rows]


def get_run(rid):
    r = store.one("SELECT * FROM pipeline_runs WHERE id=?", (rid,))
    if not r:
        raise HTTPException(404, "Pipeline run not found")
    run = _run_out(r)
    run["definition"] = _j(r["definition"], EMPTY_DEF)
    p = store.one("SELECT name FROM pipelines WHERE id=?", (r["pipeline_id"],))
    run["pipeline_name"] = p["name"] if p else "(deleted)"
    acts = []
    for a in store.q("SELECT * FROM activity_runs WHERE run_id=? ORDER BY seq", (rid,)):
        a = dict(a)
        a["input"], a["output"] = _j(a["input"], None), _j(a["output"], None)
        a["duration"] = ((a["end"] or _now()) - a["start"]) if a.get("start") else None
        acts.append(a)
    run["activities"] = acts
    return run


class ActivityFailed(Exception):
    pass


class Cancelled(Exception):
    pass


class RunCtx:
    def __init__(self, run_id, pipeline, defn, params, trigger_info, reuse=None):
        self.run_id, self.pipeline, self.defn = run_id, pipeline, defn
        self.params = params
        self.variables = {k: (v or {}).get("default") for k, v in (defn.get("variables") or {}).items()}
        self.trigger_info = trigger_info or {}
        self.cancel = asyncio.Event()
        self.seq = 0
        self.children = set()   # notebook/job runs to cancel
        self.reuse = reuse or {}


class Scope:
    def __init__(self, ctx, parent=None, item=None, path=""):
        self.ctx, self.parent, self.item, self.path = ctx, parent, item, path
        self.results = {}   # activity name -> {"status", "output", "error"}

    def lookup(self, name):
        s = self
        while s:
            if name in s.results:
                return s.results[name]
            s = s.parent
        raise ExpressionError(f"activity('{name}') has not run yet (or does not exist in this scope)")

    def expr_ctx(self):
        c = self.ctx
        item = self.item
        s = self
        while item is None and s.parent:
            s = s.parent
            item = s.item
        return {"pipeline": {"parameters": c.params, "RunId": c.run_id, "Pipeline": c.pipeline["name"],
                             "TriggerTime": c.trigger_info.get("time"), "TriggerType": c.trigger_info.get("type"),
                             "TriggerName": c.trigger_info.get("name"), "DataFactory": "DataBridge"},
                "variables": c.variables, "activity": self.lookup, "item": item,
                "trigger": {"startTime": c.trigger_info.get("time"), "name": c.trigger_info.get("name"),
                            "outputs": {"windowStartTime": c.trigger_info.get("windowStartTime"),
                                        "windowEndTime": c.trigger_info.get("windowEndTime")}}}


class PipelineEngine:
    def __init__(self):
        self.active = {}
        self._sched = None

    # ---- lifecycle ----
    def startup(self):
        for r in store.q("SELECT id FROM pipeline_runs WHERE state IN ('Queued','InProgress')"):
            store.update("pipeline_runs", r["id"], state="Failed", end=_now(), message="DataBridge restarted during the run")
        store.x("UPDATE activity_runs SET state='Failed', end=?, error='DataBridge restarted' WHERE state IN ('Queued','InProgress')", (_now(),))
        self._sched = asyncio.create_task(self._scheduler())

    async def shutdown(self):
        if self._sched:
            self._sched.cancel()
        for ctx in list(self.active.values()):
            ctx.cancel.set()

    # ---- start / cancel / rerun ----
    def start(self, pid, params=None, debug=False, trigger=None, parent_run=None, rerun_of=None, reuse=None, definition=None):
        p = get_pipeline(pid)
        defn = definition or (p["draft"] if debug else p["published"])
        if not defn:
            raise HTTPException(409, "Publish the pipeline first (or use Debug to run the draft)")
        errs = validate(defn)
        if errs:
            raise HTTPException(400, "; ".join(errs[:8]))
        merged = {k: (v or {}).get("default") for k, v in (defn.get("parameters") or {}).items()}
        merged.update(params or {})
        trigger = trigger or {"type": "Manual", "name": "Manual", "time": datetime.now(timezone.utc).isoformat()}
        num = (store.one("SELECT MAX(run_number) AS n FROM pipeline_runs WHERE pipeline_id=?", (p["id"],))["n"] or 0) + 1
        rid = uuid.uuid4().hex[:12]
        store.x("INSERT INTO pipeline_runs (id, pipeline_id, run_number, trigger, params, state, start, debug, definition, "
                "parent_run, rerun_of, trigger_info) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
                (rid, p["id"], num, trigger["type"], json.dumps(merged), "Queued", _now(), 1 if debug else 0,
                 json.dumps(defn), parent_run, rerun_of, json.dumps(trigger)))
        ctx = RunCtx(rid, p, defn, merged, trigger, reuse)
        self.active[rid] = ctx
        asyncio.create_task(self._run(ctx))
        return get_run(rid)

    async def cancel(self, rid):
        ctx = self.active.get(rid)
        if not ctx:
            raise HTTPException(409, "Run is not active")
        ctx.cancel.set()
        for child in list(ctx.children):
            try:
                if child[0] == "job":
                    await job_manager.cancel(child[1])
                else:
                    await self.cancel(child[1])
            except Exception:  # noqa: BLE001
                pass
        ks = kernels.for_key(PIPE_KERNEL)
        if ks:
            try:
                await ks.interrupt()
            except Exception:  # noqa: BLE001
                pass
        return {"ok": True}

    def rerun(self, rid, from_failed=False):
        run = get_run(rid)
        reuse = {}
        if from_failed:
            for a in run["activities"]:
                if not a["path"] and a["state"] == "Succeeded":
                    reuse[a["name"]] = a["output"]
        return self.start(run["pipeline_id"], run["params"], debug=bool(run["debug"]), rerun_of=rid, reuse=reuse,
                          definition=run["definition"], trigger={"type": "Rerun", "name": f"Rerun of #{run['run_number']}",
                                                                 "time": datetime.now(timezone.utc).isoformat(),
                                                                 **{k: v for k, v in run["trigger_info"].items() if k.startswith("window")}})

    async def wait(self, rid):
        while True:
            r = store.one("SELECT state FROM pipeline_runs WHERE id=?", (rid,))
            if r["state"] in TERMINAL:
                return r["state"]
            await asyncio.sleep(1)

    # ---- execution ----
    async def _run(self, ctx):
        store.update("pipeline_runs", ctx.run_id, state="InProgress")
        try:
            ok, failures = await self._run_list(ctx.defn.get("activities") or [], Scope(ctx))
            state = "Cancelled" if ctx.cancel.is_set() else ("Succeeded" if ok else "Failed")
            store.update("pipeline_runs", ctx.run_id, state=state, end=_now(),
                         message=None if ok else ("Run was cancelled" if state == "Cancelled" else "; ".join(failures)[:1000]))
        except Exception as e:  # noqa: BLE001
            store.update("pipeline_runs", ctx.run_id, state="Failed", end=_now(), message=f"Internal error: {e}")
        finally:
            self.active.pop(ctx.run_id, None)

    async def _run_list(self, acts, scope):
        """Run a list of activities honouring dependency conditions. Returns (ok, failure messages)."""
        by = {a["name"]: a for a in acts}
        state = {}
        pending = list(by)
        running = {}
        handled = {d["activity"] for a in acts for d in a.get("dependsOn") or []
                   if set(d.get("conditions") or ["Succeeded"]) & {"Failed", "Completed"}}
        while pending or running:
            for n in list(pending):
                a = by[n]
                deps = a.get("dependsOn") or []
                if any(d["activity"] not in state for d in deps):
                    continue
                pending.remove(n)
                ok = all(self._cond_ok(state[d["activity"]], d.get("conditions") or ["Succeeded"]) for d in deps)
                if ctx_cancelled(scope):
                    ok = False
                if not ok:
                    state[n] = "Skipped"
                    self._record_skip(scope, a)
                    continue
                running[n] = asyncio.create_task(self._run_activity(a, scope))
            if not running:
                break
            done, _ = await asyncio.wait(running.values(), return_when=asyncio.FIRST_COMPLETED)
            for n, t in list(running.items()):
                if t in done:
                    state[n] = t.result()
                    del running[n]
        failures = [f"{n}: {(scope.results.get(n) or {}).get('error') or 'failed'}" for n, s in state.items()
                    if s in ("Failed", "Cancelled") and n not in handled]
        return (not failures and not ctx_cancelled(scope)), failures

    @staticmethod
    def _cond_ok(st, conds):
        conds = set(conds)
        return (st == "Succeeded" and ("Succeeded" in conds or "Completed" in conds)) or \
               (st in ("Failed", "Cancelled") and ("Failed" in conds or "Completed" in conds)) or \
               (st == "Skipped" and "Skipped" in conds)

    def _new_row(self, scope, a, state, inp=None):
        scope.ctx.seq += 1
        aid = uuid.uuid4().hex[:12]
        store.x("INSERT INTO activity_runs (id, run_id, name, type, path, state, start, end, input, seq) VALUES (?,?,?,?,?,?,?,?,?,?)",
                (aid, scope.ctx.run_id, a["name"], a.get("type"), scope.path, state, _now(),
                 _now() if state in TERMINAL else None, json.dumps(inp, default=str) if inp is not None else None, scope.ctx.seq))
        return aid

    def _record_skip(self, scope, a):
        scope.results[a["name"]] = {"status": "Skipped", "output": None, "error": None}
        self._new_row(scope, a, "Skipped")

    async def _run_activity(self, a, scope):
        ctx = scope.ctx
        if not scope.path and a["name"] in ctx.reuse:     # rerun-from-failed: reuse earlier success
            aid = self._new_row(scope, a, "Succeeded", {"reused": True})
            store.update("activity_runs", aid, output=json.dumps(ctx.reuse[a["name"]], default=str), error="Reused output from the previous run")
            scope.results[a["name"]] = {"status": "Succeeded", "output": ctx.reuse[a["name"]], "error": None}
            return "Succeeded"
        policy = a.get("policy") or {}
        retries = int(policy.get("retry") or 0)
        interval = int(policy.get("retryIntervalInSeconds") or 30)
        timeout = int(policy.get("timeoutSeconds") or 0) or None
        status, output, error = "Failed", None, None
        for attempt in range(retries + 1):
            aid = self._new_row(scope, a, "InProgress")
            store.update("activity_runs", aid, attempt=attempt + 1)
            try:
                if ctx.cancel.is_set():
                    raise Cancelled()
                tp = a.get("typeProperties") or {}
                raw = {k: v for k, v in tp.items() if k not in CONTAINERS.get(a.get("type"), ())}
                inp = evaluate(raw, scope.expr_ctx())
                store.update("activity_runs", aid, input=json.dumps(_redact(inp), default=str))
                handler = getattr(self, f"_act_{a.get('type')}", None)
                if handler is None:
                    raise ActivityFailed(f"Unsupported activity type {a.get('type')}")
                coro = handler(a, inp, scope, tp)
                output = await (asyncio.wait_for(coro, timeout) if timeout else coro)
                status, error = "Succeeded", None
            except Cancelled:
                status, error = "Cancelled", "Run was cancelled"
            except asyncio.TimeoutError:
                status, error = "Failed", f"Activity timed out after {timeout}s"
            except (ActivityFailed, ExpressionError, SqlError, HTTPException) as e:
                status, error = "Failed", (e.detail if isinstance(e, HTTPException) else str(e))
            except Exception as e:  # noqa: BLE001
                status, error = "Failed", f"{type(e).__name__}: {e}"
            if ctx.cancel.is_set() and status != "Succeeded":
                status = "Cancelled"
            store.update("activity_runs", aid, state=status, end=_now(), output=json.dumps(output, default=str) if output is not None else None,
                         error=error)
            if status != "Failed" or attempt == retries:
                break
            try:
                await asyncio.wait_for(ctx.cancel.wait(), interval)
            except asyncio.TimeoutError:
                pass
        scope.results[a["name"]] = {"status": status, "output": output, "error": error}
        return status

    # ---- activity handlers: return the activity output dict ----
    async def _act_Wait(self, a, inp, scope, tp):
        try:
            await asyncio.wait_for(scope.ctx.cancel.wait(), float(inp["waitTimeInSeconds"]))
            raise Cancelled()
        except asyncio.TimeoutError:
            return {"waited": inp["waitTimeInSeconds"]}

    async def _act_Fail(self, a, inp, scope, tp):
        raise ActivityFailed(f"{inp.get('errorCode') or 'Fail'}: {inp.get('message')}")

    async def _act_SetVariable(self, a, inp, scope, tp):
        scope.ctx.variables[inp["variableName"]] = inp.get("value")
        return {"name": inp["variableName"], "value": inp.get("value")}

    async def _act_AppendVariable(self, a, inp, scope, tp):
        cur = scope.ctx.variables.get(inp["variableName"]) or []
        if not isinstance(cur, list):
            raise ActivityFailed(f"Variable {inp['variableName']} is not an array")
        cur.append(inp.get("value"))
        scope.ctx.variables[inp["variableName"]] = cur
        return {"name": inp["variableName"], "value": cur}

    async def _act_Notebook(self, a, inp, scope, tp):
        params = {k: ("" if v is None else (json.dumps(v) if isinstance(v, (dict, list)) else str(v)))
                  for k, v in (inp.get("baseParameters") or {}).items()}
        run = job_manager.run_notebook(inp["notebookPath"], params, 0, parent=f"pipeline:{scope.ctx.pipeline['name']}")
        scope.ctx.children.add(("job", run["id"]))
        while True:
            if scope.ctx.cancel.is_set():
                raise Cancelled()
            r = job_manager.get_run(run["id"])
            if r["state"] in ("SUCCESS", "FAILED", "CANCELED", "TIMEDOUT"):
                break
            await asyncio.sleep(1)
        t = (r.get("tasks") or [{}])[0].get("latest") or {}
        out = {"runId": run["id"], "runPageUrl": f"#/run/{run['id']}", "status": r["state"], "exitValue": t.get("result")}
        if r["state"] != "SUCCESS":
            raise ActivityFailed(f"Notebook {inp['notebookPath']} {r['state'].lower()}: {t.get('error') or r.get('message')}")
        try:
            out["runOutput"] = json.loads(t.get("result") or "null")
        except Exception:  # noqa: BLE001
            out["runOutput"] = t.get("result")
        return out

    async def _act_SqlScript(self, a, inp, scope, tp):
        res = await run_sql(inp["query"], int(inp.get("maxRows") or 1000), key=PIPE_KERNEL, label="Pipelines")
        rows = [dict(zip(res["columns"], r)) for r in res["rows"]]
        return {"rowCount": len(rows), "columns": res["columns"], "resultSets": rows[:100], "elapsedSeconds": res["elapsed"]}

    async def _act_Lookup(self, a, inp, scope, tp):
        src = inp.get("source") or {}
        rows = await self._query_rows(src, 5000)
        if inp.get("firstRowOnly", True):
            return {"firstRow": rows[0] if rows else None}
        return {"count": len(rows), "value": rows}

    async def _query_rows(self, src, limit):
        if src.get("type") == "postgresql":
            cfg = _linked(src.get("linkedService"))["config"]

            def q():
                import psycopg2
                import psycopg2.extras
                c = psycopg2.connect(host=cfg.get("host"), port=int(cfg.get("port") or 5432), dbname=cfg.get("database"),
                                     user=cfg.get("user"), password=cfg.get("password"), connect_timeout=15,
                                     sslmode=cfg.get("sslmode") or "prefer")
                try:
                    with c.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                        cur.execute(src.get("query"))
                        return [dict(r) for r in cur.fetchmany(limit)]
                finally:
                    c.close()
            rows = await asyncio.to_thread(q)
            return json.loads(json.dumps(rows, default=str))
        res = await run_sql(src.get("query") or f"SELECT * FROM {src.get('table')}", limit, key=PIPE_KERNEL, label="Pipelines")
        return [dict(zip(res["columns"], r)) for r in res["rows"]]

    async def _act_Web(self, a, inp, scope, tp):
        headers = dict(inp.get("headers") or {})
        url = inp["url"]
        if inp.get("linkedService"):
            cfg = _linked(inp["linkedService"])["config"]
            headers = {**_rest_headers(cfg), **headers}
            if not url.startswith("http"):
                url = cfg.get("baseUrl", "").rstrip("/") + "/" + url.lstrip("/")
        body = inp.get("body")
        async with httpx.AsyncClient(timeout=float(inp.get("timeoutSeconds") or 120)) as client:
            r = await client.request((inp.get("method") or "GET").upper(), url, headers=headers,
                                     json=body if isinstance(body, (dict, list)) else None,
                                     content=body if isinstance(body, str) else None)
        try:
            payload = r.json()
        except Exception:  # noqa: BLE001
            payload = r.text[:20000]
        if r.status_code >= 400:
            raise ActivityFailed(f"HTTP {r.status_code}: {str(payload)[:500]}")
        return {"statusCode": r.status_code, "response": payload}

    async def _act_IfCondition(self, a, inp, scope, tp):
        result = bool(inp.get("expression"))
        branch = tp.get("ifTrueActivities" if result else "ifFalseActivities") or []
        child = Scope(scope.ctx, scope, None, f"{scope.path}{a['name']}/{'true' if result else 'false'}/")
        ok, failures = await self._run_list(branch, child)
        if not ok:
            raise ActivityFailed("; ".join(failures) or "a branch activity failed")
        return {"expression": result}

    async def _act_ForEach(self, a, inp, scope, tp):
        items = inp.get("items")
        if isinstance(items, str):
            try:
                items = json.loads(items)
            except Exception:  # noqa: BLE001
                items = [x.strip() for x in items.split(",") if x.strip()]
        if not isinstance(items, list):
            raise ActivityFailed("ForEach 'items' must evaluate to an array")
        sequential = bool(inp.get("isSequential"))
        sem = asyncio.Semaphore(1 if sequential else max(1, min(50, int(inp.get("batchCount") or 4))))
        results = [None] * len(items)

        async def one(i, it):
            async with sem:
                if scope.ctx.cancel.is_set():
                    results[i] = (False, ["cancelled"])
                    return
                child = Scope(scope.ctx, scope, it, f"{scope.path}{a['name']}[{i}]/")
                results[i] = await self._run_list(tp.get("activities") or [], child)
        await asyncio.gather(*(one(i, it) for i, it in enumerate(items)))
        failed = [i for i, r in enumerate(results) if r and not r[0]]
        if failed:
            raise ActivityFailed(f"{len(failed)} of {len(items)} iterations failed (items {failed[:10]})")
        return {"iterations": len(items), "succeeded": len(items)}

    async def _act_ExecutePipeline(self, a, inp, scope, tp):
        child = self.start(inp["pipeline"], inp.get("parameters") or {}, trigger={
            "type": "ExecutePipeline", "name": scope.ctx.pipeline["name"], "time": datetime.now(timezone.utc).isoformat()},
            parent_run=scope.ctx.run_id)
        scope.ctx.children.add(("pipe", child["id"]))
        out = {"pipelineRunId": child["id"], "pipelineName": child["pipeline_name"], "runPageUrl": f"#/prun/{child['id']}"}
        if inp.get("waitOnCompletion", True):
            st = await self.wait(child["id"])
            out["status"] = st
            if st != "Succeeded":
                raise ActivityFailed(f"Child pipeline {child['pipeline_name']} {st.lower()}")
        return out

    async def _act_Copy(self, a, inp, scope, tp):
        src, sink = dict(inp.get("source") or {}), dict(inp.get("sink") or {})
        inc = inp.get("incremental") or {}
        pid = scope.ctx.pipeline["id"]
        wm_key = f"watermark:{a['name']}:{sink.get('table')}"
        wm = _state_get(pid, wm_key) if inc.get("column") else None
        if inc.get("column") and wm is None and inc.get("initialValue") not in (None, ""):
            wm = str(inc["initialValue"])
        if src.get("linkedService"):
            src["_ls"] = _linked(src["linkedService"])["config"]
        if sink.get("linkedService"):
            sink["_ls"] = _linked(sink["linkedService"])["config"]
        cfg = {"source": src, "sink": sink, "incremental": inc, "watermark": wm}
        code = COPY_CODE.replace("__CFG__", repr(json.dumps(cfg, default=str)))
        ks = await kernels.get_or_start(PIPE_KERNEL, "Pipelines")
        outs = []

        async def collect(o):
            outs.append(o)
        status, _ = await ks.execute(code, collect, store_history=False)
        text = "".join(o.get("text", "") for o in outs if o["output_type"] == "stream" and o["name"] == "stdout")
        if status != "ok":
            err = next((o for o in outs if o["output_type"] == "error"), {})
            raise ActivityFailed(f"{err.get('ename', 'Error')}: {str(err.get('evalue', 'copy failed'))[:800]}")
        line = next((ln for ln in text.splitlines() if ln.startswith("__COPY__")), None)
        if not line:
            raise ActivityFailed("Copy produced no result")
        res = json.loads(line[8:])
        if inc.get("column") and res.get("newWatermark") not in (None, "None"):
            _state_set(pid, wm_key, res["newWatermark"])
        res["previousWatermark"] = wm
        return res

    # ---- triggers ----
    async def _scheduler(self):
        while True:
            try:
                now = datetime.now(timezone.utc)
                for p in store.q("SELECT * FROM pipelines WHERE published IS NOT NULL"):
                    defn = _j(p["published"], {})
                    for i, t in enumerate(defn.get("triggers") or []):
                        if not t.get("enabled", True):
                            continue
                        tname = t.get("name") or f"trigger{i + 1}"
                        if t.get("type") == "schedule":
                            self._fire_schedule(p, t, tname, now)
                        elif t.get("type") == "tumbling":
                            self._fire_tumbling(p, t, tname, now)
            except Exception:  # noqa: BLE001
                pass
            await asyncio.sleep(10)

    def _fire_schedule(self, p, t, tname, now):
        key = f"trigger:{tname}:next"
        tz = ZoneInfo(t.get("timezone") or "UTC")
        nxt = _state_get(p["id"], key)
        if not nxt:
            _state_set(p["id"], key, croniter(t["cron"], now.astimezone(tz)).get_next(datetime).astimezone(timezone.utc).isoformat())
            return
        if now >= datetime.fromisoformat(nxt):
            _state_set(p["id"], key, croniter(t["cron"], now.astimezone(tz)).get_next(datetime).astimezone(timezone.utc).isoformat())
            self.start(p["id"], t.get("parameters") or {}, trigger={"type": "ScheduleTrigger", "name": tname, "time": now.isoformat()})

    def _fire_tumbling(self, p, t, tname, now):
        freq = timedelta(minutes=int(t["frequencyMinutes"]))
        key = f"trigger:{tname}:lastEnd"
        start = _parse_iso(t.get("startTime")) or now.replace(second=0, microsecond=0)
        last = _state_get(p["id"], key)
        wstart = _parse_iso(last) if last else start
        active = store.one("SELECT COUNT(*) AS n FROM pipeline_runs WHERE pipeline_id=? AND trigger='TumblingWindowTrigger' "
                           "AND state IN ('Queued','InProgress')", (p["id"],))["n"]
        maxc = int(t.get("maxConcurrency") or 1)
        started = 0
        end_limit = _parse_iso(t.get("endTime"))
        while wstart + freq <= now and active + started < maxc and started < 5:
            wend = wstart + freq
            if end_limit and wend > end_limit:
                break
            self.start(p["id"], t.get("parameters") or {}, trigger={
                "type": "TumblingWindowTrigger", "name": tname, "time": now.isoformat(),
                "windowStartTime": wstart.isoformat().replace("+00:00", "Z"), "windowEndTime": wend.isoformat().replace("+00:00", "Z")})
            _state_set(p["id"], key, wend.isoformat())
            wstart = wend
            started += 1


def ctx_cancelled(scope):
    return scope.ctx.cancel.is_set()


def _parse_iso(v):
    if not v:
        return None
    d = datetime.fromisoformat(str(v).replace("Z", "+00:00"))
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def _redact(v):
    if isinstance(v, dict):
        return {k: (MASK if k in SECRET_KEYS or k == "_ls" else _redact(x)) for k, x in v.items()}
    if isinstance(v, list):
        return [_redact(x) for x in v]
    return v


engine = PipelineEngine()


# Copy activity — runs inside the pipelines Spark kernel.
COPY_CODE = r'''
import json as _cj, time as _ct, urllib.request as _cu
_cfg = _cj.loads(__CFG__)
_src, _sink, _inc, _wm = _cfg["source"], _cfg["sink"], _cfg["incremental"], _cfg["watermark"]
_t0 = _ct.time()

def _c_rest(src):
    ls = src.get("_ls") or {}
    url = src.get("url") or ""
    if not url.startswith("http"):
        url = (ls.get("baseUrl") or "").rstrip("/") + "/" + url.lstrip("/")
    hdr = {}
    if ls.get("headerName") and ls.get("headerValue"): hdr[ls["headerName"]] = ls["headerValue"]
    if ls.get("token"): hdr["Authorization"] = "Bearer " + ls["token"]
    hdr.update(src.get("headers") or {})
    records, page = [], int(src.get("startPage") or 1)
    for _ in range(int(src.get("maxPages") or 1)):
        u = url
        if src.get("pageParam"):
            u += ("&" if "?" in u else "?") + src["pageParam"] + "=" + str(page)
        req = _cu.Request(u, headers=hdr, method=(src.get("method") or "GET").upper())
        with _cu.urlopen(req, timeout=120) as r:
            data = _cj.loads(r.read().decode("utf-8"))
        for part in [p for p in (src.get("recordsPath") or "").split(".") if p]:
            data = data.get(part) if isinstance(data, dict) else data
        batch = data if isinstance(data, list) else [data]
        records += batch
        if not batch or not src.get("pageParam"):
            break
        page += 1
    if not records:
        return None
    return spark.read.json(spark.sparkContext.parallelize([_cj.dumps(r) for r in records]))

def _c_read(src):
    t = src.get("type")
    if t == "postgresql":
        ls = src["_ls"]
        q = src.get("query") or ("SELECT * FROM " + src["table"])
        if _inc.get("column") and _wm is not None:
            q = "SELECT * FROM (" + q + ") _src WHERE " + _inc["column"] + " > '" + str(_wm).replace("'", "''") + "'"
        url = "jdbc:postgresql://%s:%s/%s" % (ls.get("host"), ls.get("port") or 5432, ls.get("database"))
        if ls.get("sslmode") == "require": url += "?sslmode=require"
        return (spark.read.format("jdbc").option("url", url).option("query", q).option("user", ls.get("user"))
                .option("password", ls.get("password")).option("driver", "org.postgresql.Driver").load())
    if t == "rest":
        return _c_rest(src)
    if t == "spark_sql":
        return spark.sql(src["query"])
    if t == "table":
        return spark.table(src["table"])
    if t == "file":
        path = src["path"]
        ls = src.get("_ls") or {}
        if ls.get("account") and not path.startswith(("abfss://", "file:", "/")):
            path = "abfss://%s@%s.dfs.core.windows.net/%s" % (ls["container"], ls["account"], path.lstrip("/"))
            if ls.get("accountKey"):
                spark.conf.set("fs.azure.account.key.%s.dfs.core.windows.net" % ls["account"], ls["accountKey"])
        fmt = src.get("format") or "parquet"
        r = spark.read.format(fmt)
        if fmt == "csv": r = r.option("header", True).option("inferSchema", True)
        if fmt == "json": r = r.option("multiLine", bool(src.get("multiLine")))
        return r.load(path)
    raise ValueError("Unknown source type " + str(t))

_df = _c_read(_src)
if _df is not None and _inc.get("column") and _wm is not None and _src.get("type") != "postgresql":
    _df = _df.where(F.col(_inc["column"]) > F.lit(_wm))
_rows = 0 if _df is None else _df.count()
_new_wm = None
_mode = (_sink.get("mode") or "append").lower()
_table = _sink["table"]
if _rows:
    if _sink.get("addIngestTime", True):
        _df = _df.withColumn("_ingested_at", F.current_timestamp())
    if "." in _table:
        spark.sql("CREATE SCHEMA IF NOT EXISTS " + _table.split(".")[0])
    _exists = spark.catalog.tableExists(_table)
    if _mode == "merge" and _exists:
        from delta.tables import DeltaTable
        _keys = [k.strip() for k in (_sink.get("keys") or "").split(",") if k.strip()]
        if not _keys: raise ValueError("Merge needs key columns")
        (DeltaTable.forName(spark, _table).alias("t").merge(_df.alias("s"), " AND ".join("t.%s = s.%s" % (k, k) for k in _keys))
            .whenMatchedUpdateAll().whenNotMatchedInsertAll().execute())
    else:
        _w = _df.write.format(_sink.get("format") or "delta").option("mergeSchema", "true")
        _w.mode("overwrite" if _mode == "overwrite" else "append").saveAsTable(_table)
    if _inc.get("column"):
        _new_wm = _df.agg(F.max(F.col(_inc["column"]))).collect()[0][0]
print("__COPY__" + _cj.dumps({"rowsRead": _rows, "rowsWritten": _rows, "sinkTable": _table, "mode": _mode,
                              "newWatermark": None if _new_wm is None else str(_new_wm),
                              "copyDurationSeconds": round(_ct.time() - _t0, 2)}))
'''
