"""DataBridge Jobs — Databricks-style jobs: notebook tasks with dependencies, job clusters, retries,
timeouts, cron schedules, per-cell run output, logs, cancel and repair. State lives in SQLite."""
import asyncio
import json
import sqlite3
import threading
import time
import uuid
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import nbformat
from croniter import croniter
from fastapi import HTTPException

from .kernels import apply_output, kernels
from .settings import DATA_ROOT, ROOT, settings
from .workspace import resolve

DATA_DIR = DATA_ROOT / ".stratum"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "jobs.db"

ADHOC_JOB = "__notebook_runs__"   # job_id for runs started by dbutils.notebook.run()
TERMINAL = {"SUCCESS", "FAILED", "CANCELED", "TIMEDOUT", "UPSTREAM_FAILED", "SKIPPED"}
FAILED_STATES = {"FAILED", "TIMEDOUT", "UPSTREAM_FAILED", "CANCELED"}

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, schedule TEXT, timezone TEXT,
  paused INTEGER DEFAULT 0, max_concurrent INTEGER DEFAULT 1, cluster TEXT, tasks TEXT,
  parameters TEXT, next_run TEXT, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY, job_id TEXT, run_number INTEGER, trigger TEXT, state TEXT, start REAL, end REAL,
  parameters TEXT, message TEXT, cluster TEXT);
CREATE INDEX IF NOT EXISTS runs_job ON runs(job_id, run_number);
CREATE TABLE IF NOT EXISTS task_runs (
  id TEXT PRIMARY KEY, run_id TEXT, task_key TEXT, attempt INTEGER, state TEXT, start REAL, end REAL,
  notebook_path TEXT, cells TEXT, current_cell INTEGER, error TEXT, result TEXT, log TEXT);
CREATE INDEX IF NOT EXISTS task_runs_run ON task_runs(run_id, task_key, attempt);
"""

PREAMBLE = r'''
import json as _stratum_json
try:
    _db_runtime_ok = bool(dbutils._databridge)
except NameError:
    _db_runtime_ok = False
if not _db_runtime_ok:  # fallback when config/notebook_runtime.py is missing
    class NotebookExit(Exception):
        pass
    class _StratumWidgets:
        def __init__(self): self._p = {}
        def get(self, name):
            if name not in self._p: raise KeyError(f"Widget/parameter '{name}' is not defined")
            return self._p[name]
        def text(self, name, defaultValue="", label=None): self._p.setdefault(name, defaultValue)
        def dropdown(self, name, defaultValue, choices=None, label=None): self._p.setdefault(name, defaultValue)
        combobox = dropdown
        def getAll(self): return dict(self._p)
        def removeAll(self): self._p.clear()
    class _StratumNotebook:
        def exit(self, value=""):
            raise NotebookExit(value if isinstance(value, str) else _stratum_json.dumps(value))
    class _StratumDbutils:
        def __init__(self):
            self.widgets = _StratumWidgets()
            self.notebook = _StratumNotebook()
    dbutils = _StratumDbutils()
dbutils.widgets._p.update(_stratum_json.loads(__PARAMS__))
params = dbutils.widgets.getAll()
'''


def _now():
    return time.time()


class Store:
    def __init__(self, path):
        self.lock = threading.Lock()
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript(SCHEMA)
        cols = {r[1] for r in self.db.execute("PRAGMA table_info(runs)").fetchall()}
        for col in ("job_spec", "parent"):
            if col not in cols:
                self.db.execute(f"ALTER TABLE runs ADD COLUMN {col} TEXT")
        self.db.commit()

    def q(self, sql, args=()):
        with self.lock:
            return [dict(r) for r in self.db.execute(sql, args).fetchall()]

    def one(self, sql, args=()):
        rows = self.q(sql, args)
        return rows[0] if rows else None

    def x(self, sql, args=()):
        with self.lock:
            self.db.execute(sql, args)
            self.db.commit()

    def update(self, table, row_id, **fields):
        if not fields:
            return
        cols = ", ".join(f"{k} = ?" for k in fields)
        vals = [json.dumps(v) if isinstance(v, (dict, list)) else v for v in fields.values()]
        self.x(f"UPDATE {table} SET {cols} WHERE id = ?", (*vals, row_id))


store = Store(DB_PATH)


# ---------------- helpers ----------------
def _job_out(r):
    j = dict(r)
    for k in ("cluster", "tasks", "parameters"):
        j[k] = json.loads(j[k]) if j.get(k) else ({} if k != "tasks" else [])
    j["paused"] = bool(j["paused"])
    return j


def _run_out(r):
    d = dict(r)
    d["parameters"] = json.loads(d["parameters"]) if d.get("parameters") else {}
    d["cluster"] = json.loads(d["cluster"]) if d.get("cluster") else {}
    d["job_spec"] = json.loads(d["job_spec"]) if d.get("job_spec") else None
    d["duration"] = (d["end"] or _now()) - d["start"] if d.get("start") else None
    return d


def _tr_out(r, with_cells=False):
    d = dict(r)
    d["duration"] = (d["end"] or _now()) - d["start"] if d.get("start") else None
    if with_cells:
        d["cells"] = json.loads(d["cells"]) if d.get("cells") else []
    else:
        d.pop("cells", None)
        d.pop("log", None)
    return d


def next_fire(expr, tz_name, after=None):
    tz = ZoneInfo(tz_name or "UTC")
    base = (after or datetime.now(timezone.utc)).astimezone(tz)
    return croniter(expr, base).get_next(datetime).astimezone(timezone.utc)


def validate_cron(expr, tz_name):
    try:
        ZoneInfo(tz_name or "UTC")
    except Exception:
        raise HTTPException(400, f"Unknown timezone {tz_name!r}")
    if not croniter.is_valid(expr):
        raise HTTPException(400, f"Invalid cron expression {expr!r} (use 5 fields: minute hour day month weekday)")


def cron_preview(expr, tz_name, n=5):
    validate_cron(expr, tz_name)
    tz = ZoneInfo(tz_name or "UTC")
    it = croniter(expr, datetime.now(tz))
    return [it.get_next(datetime).isoformat() for _ in range(n)]


def cluster_env(cluster: dict, job_name: str) -> dict:
    """Turn a job cluster definition into env vars consumed by config/spark_init.py."""
    c = cluster or {}
    conf = {}
    if c.get("driver_memory"):
        conf["spark.driver.memory"] = c["driver_memory"]
    if c.get("executor_memory"):
        conf["spark.executor.memory"] = c["executor_memory"]
    if c.get("executor_cores"):
        conf["spark.executor.cores"] = str(c["executor_cores"])
    if c.get("autoscale", True) and c.get("max_executors"):
        conf["spark.dynamicAllocation.enabled"] = "true"
        conf["spark.dynamicAllocation.shuffleTracking.enabled"] = "true"
        conf["spark.dynamicAllocation.minExecutors"] = str(c.get("min_executors") or 1)
        conf["spark.dynamicAllocation.maxExecutors"] = str(c["max_executors"])
    elif c.get("num_executors"):
        conf["spark.executor.instances"] = str(c["num_executors"])
    conf.update({k: str(v) for k, v in (c.get("spark_conf") or {}).items()})
    env = {"STRATUM_SPARK_CONF": json.dumps(conf), "SPARK_APP_NAME": f"stratum-job-{job_name}"[:60]}
    if c.get("master"):
        env["SPARK_MASTER"] = c["master"]
    return env


def _validate_job(body: dict) -> dict:
    name = (body.get("name") or "").strip()
    if not name:
        raise HTTPException(400, "Job name is required")
    tasks = body.get("tasks") or []
    if not tasks:
        raise HTTPException(400, "Add at least one task")
    keys = [t.get("task_key", "").strip() for t in tasks]
    if any(not k for k in keys) or len(set(keys)) != len(keys):
        raise HTTPException(400, "Every task needs a unique task key")
    clean = []
    for t in tasks:
        nb = (t.get("notebook_path") or "").strip()
        if not nb:
            raise HTTPException(400, f"Task {t['task_key']}: choose a notebook")
        p = resolve(nb)
        if not p.is_file() or p.suffix != ".ipynb":
            raise HTTPException(400, f"Task {t['task_key']}: notebook {nb} not found")
        deps = [d for d in (t.get("depends_on") or []) if d]
        for d in deps:
            if d not in keys or d == t["task_key"]:
                raise HTTPException(400, f"Task {t['task_key']}: invalid dependency {d!r}")
        clean.append({"task_key": t["task_key"].strip(), "notebook_path": nb, "depends_on": deps,
                      "parameters": {str(k): str(v) for k, v in (t.get("parameters") or {}).items()},
                      "max_retries": max(0, int(t.get("max_retries") or 0)),
                      "retry_delay_sec": max(0, int(t.get("retry_delay_sec") or 30)),
                      "timeout_sec": max(0, int(t.get("timeout_sec") or 0))})
    # cycle check
    graph = {t["task_key"]: t["depends_on"] for t in clean}
    seen, stack = set(), set()

    def visit(k):
        if k in stack:
            raise HTTPException(400, f"Tasks have a circular dependency at {k!r}")
        if k in seen:
            return
        stack.add(k)
        for d in graph[k]:
            visit(d)
        stack.discard(k)
        seen.add(k)
    for k in graph:
        visit(k)
    schedule = (body.get("schedule") or "").strip() or None
    tz_name = body.get("timezone") or "UTC"
    if schedule:
        validate_cron(schedule, tz_name)
    return {"name": name, "description": body.get("description") or "", "schedule": schedule, "timezone": tz_name,
            "paused": 1 if body.get("paused") else 0, "max_concurrent": max(1, int(body.get("max_concurrent") or 1)),
            "cluster": json.dumps(body.get("cluster") or {}), "tasks": json.dumps(clean),
            "parameters": json.dumps({str(k): str(v) for k, v in (body.get("parameters") or {}).items()})}


# ---------------- engine ----------------
class RunContext:
    def __init__(self, run_id):
        self.run_id = run_id
        self.cancel = asyncio.Event()
        self.sessions = set()


class JobManager:
    def __init__(self):
        self.active: dict[str, RunContext] = {}
        self._sched_task = None

    # ---- lifecycle ----
    def startup(self):
        for r in store.q("SELECT id FROM runs WHERE state IN ('QUEUED','RUNNING')"):
            store.update("runs", r["id"], state="FAILED", end=_now(), message="DataBridge restarted while the run was active")
        for t in store.q("SELECT id FROM task_runs WHERE state IN ('PENDING','RUNNING','WAITING_FOR_RETRY')"):
            store.update("task_runs", t["id"], state="FAILED", end=_now(), error="DataBridge restarted while the task was active")
        self._sched_task = asyncio.create_task(self._scheduler())

    async def shutdown(self):
        if self._sched_task:
            self._sched_task.cancel()
        for ctx in list(self.active.values()):
            ctx.cancel.set()

    # ---- CRUD ----
    def list_jobs(self, runs_per_job=10):
        out = []
        for j in store.q("SELECT * FROM jobs ORDER BY name COLLATE NOCASE"):
            job = _job_out(j)
            job["recent_runs"] = [_run_out(r) for r in store.q(
                "SELECT * FROM runs WHERE job_id = ? ORDER BY run_number DESC LIMIT ?", (job["id"], runs_per_job))]
            out.append(job)
        return out

    def get_job(self, job_id):
        j = store.one("SELECT * FROM jobs WHERE id = ?", (job_id,))
        if not j:
            raise HTTPException(404, "Job not found")
        return _job_out(j)

    def create_job(self, body):
        v = _validate_job(body)
        job_id = uuid.uuid4().hex[:10]
        nxt = next_fire(v["schedule"], v["timezone"]).isoformat() if v["schedule"] else None
        store.x("INSERT INTO jobs (id, name, description, schedule, timezone, paused, max_concurrent, cluster, tasks, "
                "parameters, next_run, created, updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                (job_id, v["name"], v["description"], v["schedule"], v["timezone"], v["paused"], v["max_concurrent"],
                 v["cluster"], v["tasks"], v["parameters"], nxt, _now(), _now()))
        return self.get_job(job_id)

    def update_job(self, job_id, body):
        self.get_job(job_id)
        v = _validate_job(body)
        nxt = next_fire(v["schedule"], v["timezone"]).isoformat() if v["schedule"] else None
        store.update("jobs", job_id, **v, next_run=nxt, updated=_now())
        return self.get_job(job_id)

    def delete_job(self, job_id):
        self.get_job(job_id)
        run_ids = [r["id"] for r in store.q("SELECT id FROM runs WHERE job_id = ?", (job_id,))]
        for rid in run_ids:
            if rid in self.active:
                self.active[rid].cancel.set()
            store.x("DELETE FROM task_runs WHERE run_id = ?", (rid,))
        store.x("DELETE FROM runs WHERE job_id = ?", (job_id,))
        store.x("DELETE FROM jobs WHERE id = ?", (job_id,))

    def set_paused(self, job_id, paused):
        job = self.get_job(job_id)
        nxt = next_fire(job["schedule"], job["timezone"]).isoformat() if job["schedule"] and not paused else job["next_run"]
        store.update("jobs", job_id, paused=1 if paused else 0, next_run=nxt, updated=_now())
        return self.get_job(job_id)

    # ---- runs ----
    def list_runs(self, job_id, limit=10):
        runs = [_run_out(r) for r in store.q(
            "SELECT * FROM runs WHERE job_id = ? ORDER BY run_number DESC LIMIT ?", (job_id, limit))]
        for r in runs:
            states = {}
            for t in store.q("SELECT task_key, state, attempt FROM task_runs WHERE run_id = ? ORDER BY attempt", (r["id"],)):
                states[t["task_key"]] = {"state": t["state"], "attempts": t["attempt"]}
            r["task_states"] = states
        return runs

    def get_run(self, run_id):
        r = store.one("SELECT * FROM runs WHERE id = ?", (run_id,))
        if not r:
            raise HTTPException(404, "Run not found")
        run = _run_out(r)
        job = store.one("SELECT * FROM jobs WHERE id = ?", (run["job_id"],))
        run["job"] = _job_out(job) if job else run.get("job_spec")
        attempts = [_tr_out(t) for t in store.q(
            "SELECT * FROM task_runs WHERE run_id = ? ORDER BY task_key, attempt", (run_id,))]
        by_task = {}
        for a in attempts:
            by_task.setdefault(a["task_key"], []).append(a)
        run["tasks"] = [{"task_key": k, "latest": v[-1], "attempts": v} for k, v in by_task.items()]
        return run

    def get_task_run(self, task_run_id):
        t = store.one("SELECT * FROM task_runs WHERE id = ?", (task_run_id,))
        if not t:
            raise HTTPException(404, "Task run not found")
        return _tr_out(t, with_cells=True)

    def trigger(self, job_id, parameters=None, trigger="manual"):
        job = self.get_job(job_id)
        running = store.one("SELECT COUNT(*) AS n FROM runs WHERE job_id = ? AND state IN ('QUEUED','RUNNING')", (job_id,))["n"]
        if running >= job["max_concurrent"]:
            if trigger == "schedule":
                return None
            raise HTTPException(409, f"Job already has {running} active run(s) (max concurrent runs: {job['max_concurrent']})")
        num = (store.one("SELECT MAX(run_number) AS n FROM runs WHERE job_id = ?", (job_id,))["n"] or 0) + 1
        run_id = uuid.uuid4().hex[:12]
        params = {**job["parameters"], **{str(k): str(v) for k, v in (parameters or {}).items()}}
        store.x("INSERT INTO runs (id, job_id, run_number, trigger, state, start, parameters, cluster) VALUES (?,?,?,?,?,?,?,?)",
                (run_id, job_id, num, trigger, "QUEUED", _now(), json.dumps(params), json.dumps(job["cluster"])))
        ctx = RunContext(run_id)
        self.active[run_id] = ctx
        keys = [t["task_key"] for t in job["tasks"]]
        asyncio.create_task(self._execute(ctx, job, params, keys, set()))
        return self.get_run(run_id)

    def run_notebook(self, path, arguments=None, timeout_seconds=0, parent=None, cluster=None):
        """Ephemeral one-task run used by dbutils.notebook.run() — visible in the run view like a job."""
        p = resolve(path)
        if not p.is_file() or p.suffix != ".ipynb":
            raise HTTPException(404, f"Notebook not found: {path}")
        rel = p.relative_to(settings.workspace).as_posix()
        key = "".join(ch if ch.isalnum() or ch == "_" else "_" for ch in p.stem)[:60] or "notebook"
        task = {"task_key": key, "notebook_path": rel, "depends_on": [], "parameters": {}, "max_retries": 0,
                "retry_delay_sec": 0, "timeout_sec": max(0, int(timeout_seconds or 0))}
        job = {"id": ADHOC_JOB, "name": rel, "tasks": [task], "cluster": cluster or {}, "parameters": {},
               "schedule": None, "timezone": "UTC", "paused": False, "max_concurrent": 1000}
        params = {str(k): str(v) for k, v in (arguments or {}).items()}
        num = (store.one("SELECT MAX(run_number) AS n FROM runs WHERE job_id = ?", (ADHOC_JOB,))["n"] or 0) + 1
        run_id = uuid.uuid4().hex[:12]
        store.x("INSERT INTO runs (id, job_id, run_number, trigger, state, start, parameters, cluster, job_spec, parent) "
                "VALUES (?,?,?,?,?,?,?,?,?,?)",
                (run_id, ADHOC_JOB, num, "notebook_run", "QUEUED", _now(), json.dumps(params), json.dumps(job["cluster"]),
                 json.dumps(job), parent or None))
        ctx = RunContext(run_id)
        self.active[run_id] = ctx
        asyncio.create_task(self._execute(ctx, job, params, [key], set()))
        return self.get_run(run_id)

    def list_notebook_runs(self, limit=50):
        out = []
        for r in store.q("SELECT * FROM runs WHERE job_id = ? ORDER BY run_number DESC LIMIT ?", (ADHOC_JOB, limit)):
            run = _run_out(r)
            t = store.one("SELECT state, result, error, current_cell FROM task_runs WHERE run_id = ? ORDER BY attempt DESC LIMIT 1",
                          (run["id"],))
            run["task"] = t
            run["path"] = (run.get("job_spec") or {}).get("name")
            run.pop("job_spec", None)
            out.append(run)
        return out

    def clone_task_run(self, task_run_id):
        """Create a new notebook containing a task run's code and outputs (Databricks: Clone into new notebook)."""
        tr = self.get_task_run(task_run_id)
        run = store.one("SELECT run_number FROM runs WHERE id = ?", (tr["run_id"],)) or {"run_number": 0}
        src = resolve(tr["notebook_path"])
        folder = src.parent if src.parent.exists() else settings.workspace
        base = f"{src.stem} - run {run['run_number']}"
        target = folder / f"{base}.ipynb"
        n = 2
        while target.exists():
            target = folder / f"{base} ({n}).ipynb"
            n += 1
        nb = nbformat.v4.new_notebook()
        nb.metadata["kernelspec"] = {"name": settings.kernel_name, "display_name": "Python 3 (PySpark)", "language": "python"}
        for c in tr["cells"]:
            if c["cell_type"] == "markdown":
                nb.cells.append(nbformat.v4.new_markdown_cell(c["source"]))
                continue
            cell = nbformat.v4.new_code_cell(c["source"])
            cell.execution_count = c.get("execution_count")
            outs = []
            for o in c.get("outputs") or []:
                if o.get("output_type") in ("stream", "display_data", "execute_result", "error"):
                    try:
                        outs.append(nbformat.from_dict(o))
                    except Exception:  # noqa: BLE001
                        pass
            cell.outputs = outs
            nb.cells.append(cell)
        nbformat.write(nb, target)
        return {"path": target.relative_to(settings.workspace).as_posix()}

    def repair(self, run_id):
        run = self.get_run(run_id)
        if run["state"] not in TERMINAL:
            raise HTTPException(409, "The run is still active")
        job = run["job"] if run["job_id"] == ADHOC_JOB else self.get_job(run["job_id"])
        if not job:
            raise HTTPException(409, "The job for this run no longer exists")
        latest = {t["task_key"]: t["latest"]["state"] for t in run["tasks"]}
        ok = {k for k, s in latest.items() if s == "SUCCESS"}
        todo = [t["task_key"] for t in job["tasks"] if t["task_key"] not in ok]
        if not todo:
            raise HTTPException(409, "All tasks already succeeded")
        store.update("runs", run_id, state="QUEUED", end=None, message=f"Repair: re-running {', '.join(todo)}")
        ctx = RunContext(run_id)
        self.active[run_id] = ctx
        asyncio.create_task(self._execute(ctx, job, run["parameters"], todo, ok))
        return self.get_run(run_id)

    async def cancel(self, run_id):
        ctx = self.active.get(run_id)
        if not ctx:
            raise HTTPException(409, "The run is not active")
        ctx.cancel.set()
        for ks in list(ctx.sessions):
            try:
                await ks.interrupt()
            except Exception:  # noqa: BLE001
                pass
        return {"ok": True}

    # ---- execution ----
    async def _execute(self, ctx, job, params, keys, done_ok):
        run_id = ctx.run_id
        store.update("runs", run_id, state="RUNNING")
        tasks = {t["task_key"]: t for t in job["tasks"]}
        state = {k: "SUCCESS" for k in done_ok}
        pending = [k for k in keys if k in tasks]
        running = {}
        try:
            while pending or running:
                if ctx.cancel.is_set():
                    for k in pending:
                        self._new_task_row(run_id, tasks[k], "CANCELED", error="Run was canceled")
                        state[k] = "CANCELED"
                    pending = []
                for k in list(pending):
                    deps = tasks[k]["depends_on"]
                    if any(state.get(d) in FAILED_STATES for d in deps):
                        bad = [d for d in deps if state.get(d) in FAILED_STATES]
                        self._new_task_row(run_id, tasks[k], "UPSTREAM_FAILED", error=f"Upstream task failed: {', '.join(bad)}")
                        state[k] = "UPSTREAM_FAILED"
                        pending.remove(k)
                    elif all(state.get(d) == "SUCCESS" for d in deps):
                        running[k] = asyncio.create_task(self._run_task(ctx, job, tasks[k], params))
                        pending.remove(k)
                if not running:
                    for k in pending:  # unreachable (should not happen after validation)
                        self._new_task_row(run_id, tasks[k], "UPSTREAM_FAILED", error="Dependencies could not be satisfied")
                        state[k] = "UPSTREAM_FAILED"
                    break
                done, _ = await asyncio.wait(running.values(), return_when=asyncio.FIRST_COMPLETED)
                for k, t in list(running.items()):
                    if t in done:
                        try:
                            state[k] = t.result()
                        except Exception as e:  # noqa: BLE001
                            state[k] = "FAILED"
                            store.x("UPDATE task_runs SET state='FAILED', end=?, error=? WHERE run_id=? AND task_key=? AND end IS NULL",
                                    (_now(), f"Internal error: {e}", run_id, k))
                        del running[k]
            if ctx.cancel.is_set():
                final = "CANCELED"
            elif all(state.get(t) == "SUCCESS" for t in tasks):
                final = "SUCCESS"
            else:
                final = "FAILED"
            failed = [k for k, s in state.items() if s != "SUCCESS"]
            msg = None if final == "SUCCESS" else (f"Tasks not successful: {', '.join(sorted(failed))}" if failed else None)
            store.update("runs", run_id, state=final, end=_now(), message=msg)
        except Exception as e:  # noqa: BLE001
            store.update("runs", run_id, state="FAILED", end=_now(), message=f"Internal error: {e}")
        finally:
            self.active.pop(run_id, None)

    def _new_task_row(self, run_id, task, st, error=None):
        prev = store.one("SELECT MAX(attempt) AS a FROM task_runs WHERE run_id = ? AND task_key = ?", (run_id, task["task_key"]))["a"]
        tid = uuid.uuid4().hex[:12]
        store.x("INSERT INTO task_runs (id, run_id, task_key, attempt, state, start, end, notebook_path, cells, error, log) "
                "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (tid, run_id, task["task_key"], (prev or 0) + 1, st, None if st in ("PENDING", "WAITING_FOR_RETRY") else _now(),
                 None if st not in TERMINAL else _now(), task["notebook_path"], "[]", error, ""))
        return tid

    async def _run_task(self, ctx, job, task, run_params):
        retries = task["max_retries"]
        row = None
        st = "FAILED"
        for i in range(retries + 1):
            if ctx.cancel.is_set():
                if row:
                    store.update("task_runs", row, state="CANCELED", end=_now(), error="Run was canceled")
                return "CANCELED"
            row = row or self._new_task_row(ctx.run_id, task, "PENDING")
            st = await self._attempt(ctx, job, task, run_params, row)
            if st in ("SUCCESS", "CANCELED") or i == retries:
                return st
            row = self._new_task_row(ctx.run_id, task, "WAITING_FOR_RETRY")
            store.update("task_runs", row, log=f"[stratum] Previous attempt {st.lower()}. Retry {i + 1}/{retries} "
                                                f"starts in {task['retry_delay_sec']}s.\n")
            try:
                await asyncio.wait_for(ctx.cancel.wait(), timeout=task["retry_delay_sec"])
            except asyncio.TimeoutError:
                pass
        return st

    async def _attempt(self, ctx, job, task, run_params, row):
        t0 = _now()
        log = []
        tr = store.one("SELECT log FROM task_runs WHERE id = ?", (row,))
        if tr and tr["log"]:
            log.append(tr["log"])

        def add_log(line):
            log.append(f"{datetime.now().strftime('%H:%M:%S')} {line}\n")

        cells = []
        last_save = [0.0]

        def save(force=False, **fields):
            if force or _now() - last_save[0] > 0.8:
                last_save[0] = _now()
                store.update("task_runs", row, cells=cells, log="".join(log)[-200_000:], **fields)
            elif fields:
                store.update("task_runs", row, **fields)

        store.update("task_runs", row, state="RUNNING", start=t0, end=None, error=None)
        try:
            nb = nbformat.read(resolve(task["notebook_path"]), as_version=4)
        except Exception as e:  # noqa: BLE001
            add_log(f"[stratum] Cannot open notebook {task['notebook_path']}: {e}")
            save(True, state="FAILED", end=_now(), error=f"Cannot open notebook: {e}")
            return "FAILED"
        for c in nb.cells:
            src = c.source if isinstance(c.source, str) else "".join(c.source)
            cells.append({"cell_type": "code" if c.cell_type == "code" else "markdown", "source": src, "outputs": [],
                          "execution_count": None, "status": "pending" if c.cell_type == "code" else "markdown",
                          "duration": None})
        cluster = job.get("cluster") or {}
        env = cluster_env(cluster, job["name"])
        env["DATABRIDGE_NOTEBOOK_PATH"] = task["notebook_path"]
        master = env.get("SPARK_MASTER") or "default master"
        add_log(f"[stratum] Starting job cluster ({master}) for task '{task['task_key']}'")
        save(True, current_cell=None)

        ks = None
        deadline = t0 + task["timeout_sec"] if task["timeout_sec"] else None
        result, error, final = None, None, "SUCCESS"
        try:
            ks = await kernels.start_session(f"job:{ctx.run_id}:{task['task_key']}:{row}",
                                             f"Job {job['name']} › {task['task_key']}", env, kind="job")
            ctx.sessions.add(ks)
            await kernels.wait_ready(ks, timeout=900)
            if ks.init_status == "error":
                raise RuntimeError(f"Cluster failed to start: {ks.init_message}")
            add_log(f"[stratum] Cluster ready. {ks.init_message.splitlines()[-1] if ks.init_message else ''}")
            params = {**task["parameters"], **run_params}
            pre_out = []

            async def pre_collect(o):
                pre_out.append(o)
            st, _ = await ks.execute(PREAMBLE.replace("__PARAMS__", repr(json.dumps(params))), pre_collect, store_history=False)
            if st != "ok":
                err = next((o for o in pre_out if o["output_type"] == "error"), {})
                raise RuntimeError(f"Could not set job parameters: {err.get('ename')}: {err.get('evalue')}")
            if params:
                add_log(f"[stratum] Parameters: {json.dumps(params)}")
            if task["timeout_sec"]:  # timeout covers notebook execution, not cluster start-up
                deadline = _now() + task["timeout_sec"]

            for i, cell in enumerate(cells):
                if cell["cell_type"] != "code" or not cell["source"].strip():
                    if cell["cell_type"] == "code":
                        cell["status"] = "skipped"
                    continue
                if ctx.cancel.is_set():
                    final, error = "CANCELED", "Run was canceled"
                    break
                cell["status"] = "running"
                c0 = _now()
                add_log(f"[stratum] Running cell {i + 1}")
                save(True, current_cell=i)

                async def on_output(o, cell=cell):
                    if o["output_type"] == "clear_output":
                        cell["outputs"] = []
                        return
                    if not apply_output(cell["outputs"], o):
                        save()
                        return
                    outs = cell["outputs"]
                    if o["output_type"] == "stream":
                        log.append(o["text"])
                        if outs and outs[-1]["output_type"] == "stream" and outs[-1]["name"] == o["name"]:
                            outs[-1]["text"] += o["text"]
                            save()
                            return
                    elif o["output_type"] == "error":
                        log.append("\n".join(o.get("traceback") or [f"{o['ename']}: {o['evalue']}"]) + "\n")
                    outs.append(o)
                    save()

                remaining = (deadline - _now()) if deadline else None
                if remaining is not None and remaining <= 0:
                    final, error = "TIMEDOUT", f"Task exceeded its timeout of {task['timeout_sec']}s"
                    cell["status"] = "failed"
                    break
                try:
                    st, count = await asyncio.wait_for(ks.execute(cell["source"], on_output), timeout=remaining)
                except asyncio.TimeoutError:
                    await ks.interrupt()
                    cell["status"] = "failed"
                    cell["duration"] = _now() - c0
                    final, error = "TIMEDOUT", f"Task exceeded its timeout of {task['timeout_sec']}s (cell {i + 1})"
                    add_log(f"[stratum] {error}")
                    break
                cell["execution_count"] = count
                cell["duration"] = _now() - c0
                if st == "ok":
                    cell["status"] = "success"
                    continue
                err = next((o for o in reversed(cell["outputs"]) if o["output_type"] == "error"), {})
                if err.get("ename") == "NotebookExit":
                    cell["status"] = "success"
                    cell["outputs"] = [o for o in cell["outputs"] if o["output_type"] != "error"]
                    result = err.get("evalue", "")
                    add_log(f"[stratum] dbutils.notebook.exit({result!r}) — task finished early")
                    break
                if ctx.cancel.is_set() or st == "aborted":
                    final, error = "CANCELED", "Run was canceled"
                    cell["status"] = "canceled"
                    break
                cell["status"] = "failed"
                final = "FAILED"
                error = f"Cell {i + 1} failed — {err.get('ename', 'Error')}: {err.get('evalue', '')}"
                add_log(f"[stratum] {error}")
                break
        except Exception as e:  # noqa: BLE001
            final, error = ("CANCELED", "Run was canceled") if ctx.cancel.is_set() else ("FAILED", str(e))
            add_log(f"[stratum] {error}")
        finally:
            for cell in cells:
                if cell["status"] in ("pending", "running"):
                    cell["status"] = "not_run"
            if ks:
                ctx.sessions.discard(ks)
                try:
                    await kernels.shutdown(ks.id)
                except Exception:  # noqa: BLE001
                    pass
        add_log(f"[stratum] Task {final.lower()} after {round(_now() - t0, 1)}s")
        save(True, state=final, end=_now(), error=error, result=result, current_cell=None)
        return final

    # ---- scheduler ----
    async def _scheduler(self):
        while True:
            try:
                now = datetime.now(timezone.utc)
                for j in store.q("SELECT * FROM jobs WHERE schedule IS NOT NULL AND paused = 0"):
                    nxt = datetime.fromisoformat(j["next_run"]) if j["next_run"] else None
                    if nxt is None:
                        store.update("jobs", j["id"], next_run=next_fire(j["schedule"], j["timezone"]).isoformat())
                        continue
                    if now >= nxt:
                        store.update("jobs", j["id"], next_run=next_fire(j["schedule"], j["timezone"], now).isoformat())
                        try:
                            self.trigger(j["id"], trigger="schedule")
                        except Exception:  # noqa: BLE001
                            pass
            except Exception:  # noqa: BLE001
                pass
            await asyncio.sleep(10)


manager = JobManager()


def all_notebooks():
    root = settings.workspace
    nbs = [p for p in root.rglob("*.ipynb") if not any(part.startswith(".") for part in p.relative_to(root).parts)]
    return sorted(p.relative_to(root).as_posix() for p in nbs)
