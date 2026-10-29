"""Machine learning: MLflow experiment tracking, model registry and model serving inside DataBridge.

* DataBridge starts an MLflow tracking server on 127.0.0.1 (MLFLOW_PORT, default 5055) with a SQLite store in
  .stratum/mlflow and artifacts in the workspace (shared disk on Kubernetes). The MLflow UI is served through
  DataBridge at /mlflow/ (signed-in users only).
* Every notebook and job kernel gets MLFLOW_TRACKING_URI, and notebooks log to an experiment named after the
  notebook (like Databricks), so `mlflow.autolog()` / `mlflow.start_run()` just work.
* Serving endpoints run `mlflow models serve` for a registered model version or alias; requests go through
  DataBridge: POST /api/ml/serving/<name>/invocations (Bearer token or Basic with a personal access token)."""
import asyncio
import importlib.util
import logging
import os
import re
import signal
import subprocess
import sys
import time

import httpx
from fastapi import HTTPException

from .jobs import store
from .settings import DATA_ROOT, env, settings

log = logging.getLogger("databridge")
store.db.executescript("""
CREATE TABLE IF NOT EXISTS ml_serving (name TEXT PRIMARY KEY, model TEXT, ref TEXT, port INTEGER, desired TEXT, status TEXT,
  error TEXT, created REAL, created_by TEXT, started REAL, requests INTEGER DEFAULT 0);
""")
store.db.commit()
_server = {"proc": None, "started": None, "error": None}
_serving = {}            # name -> Popen
_lock = asyncio.Lock()
_NAME = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}$")


def installed():
    return importlib.util.find_spec("mlflow") is not None


def enabled():
    v = (env("ML_ENABLED", "auto") or "auto").lower()
    return installed() if v == "auto" else v == "true"


def port():
    return int(env("MLFLOW_PORT", "5055") or 5055)


def tracking_uri():
    return f"http://127.0.0.1:{port()}/mlflow"


def kernel_env(notebook_path=""):
    if not enabled():
        return {}
    out = {"MLFLOW_TRACKING_URI": tracking_uri(), "MLFLOW_DISABLE_AGENT_HINT": "1"}
    if notebook_path and not os.environ.get("MLFLOW_EXPERIMENT_NAME"):
        out["MLFLOW_EXPERIMENT_NAME"] = "/" + re.sub(r"\.ipynb$", "", notebook_path.replace("\\", "/")).lstrip("/")
    return out


def _popen(args, log_path, extra_env=None):
    env_ = {**os.environ, "MLFLOW_DISABLE_AGENT_HINT": "1", "MLFLOW_SERVER_ENABLE_JOB_EXECUTION": "false", **(extra_env or {})}
    fh = open(log_path, "a", encoding="utf-8", errors="replace")
    kw = {"creationflags": subprocess.CREATE_NEW_PROCESS_GROUP} if os.name == "nt" else {"start_new_session": True}
    return subprocess.Popen(args, stdout=fh, stderr=subprocess.STDOUT, env=env_, cwd=str(DATA_ROOT), **kw)


def _kill_tree(p):
    if not p or p.poll() is not None:
        return
    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/T", "/F", "/PID", str(p.pid)], capture_output=True, timeout=20)
        else:
            os.killpg(p.pid, signal.SIGTERM)
            try:
                p.wait(10)
            except subprocess.TimeoutExpired:
                os.killpg(p.pid, signal.SIGKILL)
    except Exception:  # noqa: BLE001
        pass


async def _wait_http(url, timeout):
    t0 = time.time()
    async with httpx.AsyncClient(timeout=3) as c:
        while time.time() - t0 < timeout:
            try:
                if (await c.get(url)).status_code == 200:
                    return True
            except httpx.HTTPError:
                pass
            await asyncio.sleep(1)
    return False


async def ensure_server():
    """Start the MLflow tracking server once (idempotent)."""
    if not enabled():
        raise HTTPException(503, "MLflow is not installed. Run: pip install mlflow   (then restart DataBridge)")
    async with _lock:
        p = _server["proc"]
        if p and p.poll() is None:
            return True
        if await _wait_http(f"{tracking_uri()}/health", 1):          # already running (e.g. after a reload)
            return True
        d = DATA_ROOT / ".stratum" / "mlflow"
        d.mkdir(parents=True, exist_ok=True)
        art = settings.workspace / ".mlflow-artifacts"
        art.mkdir(parents=True, exist_ok=True)
        logs = DATA_ROOT / ".stratum" / "logs"
        logs.mkdir(parents=True, exist_ok=True)
        args = [sys.executable, "-m", "mlflow", "server", "--backend-store-uri", f"sqlite:///{(d / 'mlflow.db').as_posix()}",
                "--artifacts-destination", art.as_posix(), "--serve-artifacts", "--host", "127.0.0.1", "--port", str(port()),
                "--static-prefix", "/mlflow", "--workers", "1"]
        _server["proc"] = _popen(args, logs / "mlflow-server.log")
        _server["started"] = time.time()
        ok = await _wait_http(f"{tracking_uri()}/health", 120)
        _server["error"] = None if ok else "MLflow did not start — see .stratum/logs/mlflow-server.log"
        if not ok:
            raise HTTPException(503, _server["error"])
        return True


async def startup():
    if not enabled():
        return
    try:
        await ensure_server()
        for s in store.q("SELECT name FROM ml_serving WHERE desired='running'"):
            asyncio.create_task(_start_endpoint(s["name"]))
    except Exception as e:  # noqa: BLE001
        log.warning("MLflow not started: %s", getattr(e, "detail", e))


def shutdown():
    for p in list(_serving.values()):
        _kill_tree(p)
    _kill_tree(_server["proc"])


async def mlapi(method, path, params=None, body=None):
    await ensure_server()
    async with httpx.AsyncClient(timeout=60) as c:
        r = await c.request(method, f"{tracking_uri()}/api/2.0/mlflow/{path}", params=params, json=body)
    if r.status_code >= 400:
        try:
            msg = r.json().get("message") or r.text
        except ValueError:
            msg = r.text
        raise HTTPException(r.status_code if r.status_code < 500 else 502, f"MLflow: {msg[:300]}")
    return r.json()


async def status():
    info = {"installed": installed(), "enabled": enabled(), "tracking_uri": tracking_uri(), "ui": "/mlflow/", "error": _server["error"]}
    if info["enabled"]:
        info["running"] = await _wait_http(f"{tracking_uri()}/health", 1)
    return info


async def experiments():
    d = await mlapi("POST", "experiments/search", body={"max_results": 500, "order_by": ["last_update_time DESC"]})
    out = []
    for e in d.get("experiments") or []:
        if e.get("lifecycle_stage") == "deleted":
            continue
        out.append({"id": e["experiment_id"], "name": e["name"], "updated": int(e.get("last_update_time") or 0) / 1000,
                    "created": int(e.get("creation_time") or 0) / 1000})
    return out


async def runs(exp_id):
    d = await mlapi("POST", "runs/search", body={"experiment_ids": [exp_id], "max_results": 100, "order_by": ["attributes.start_time DESC"]})
    out = []
    for r in d.get("runs") or []:
        i, data = r["info"], r.get("data") or {}
        tags = {t["key"]: t["value"] for t in data.get("tags") or []}
        out.append({"id": i["run_id"], "name": i.get("run_name") or tags.get("mlflow.runName") or i["run_id"][:8], "status": i.get("status"),
                    "start": int(i.get("start_time") or 0) / 1000, "end": int(i.get("end_time") or 0) / 1000 or None,
                    "metrics": {m["key"]: m["value"] for m in data.get("metrics") or []},
                    "params": {p["key"]: p["value"] for p in data.get("params") or []}, "user": tags.get("mlflow.user"),
                    "source": tags.get("mlflow.source.name")})
    return out


async def models():
    d = await mlapi("GET", "registered-models/search", params={"max_results": 500})
    out = []
    for m in d.get("registered_models") or []:
        out.append({"name": m["name"], "description": m.get("description") or "", "updated": int(m.get("last_updated_timestamp") or 0) / 1000,
                    "latest": [{"version": v["version"], "status": v.get("status"), "run_id": v.get("run_id")} for v in m.get("latest_versions") or []],
                    "aliases": {a["alias"]: a["version"] for a in m.get("aliases") or []}})
    return out


async def versions(name):
    d = await mlapi("GET", "model-versions/search", params={"filter": f"name='{name}'", "max_results": 200})
    return [{"version": v["version"], "status": v.get("status"), "run_id": v.get("run_id"), "created": int(v.get("creation_timestamp") or 0) / 1000,
             "description": v.get("description") or "", "source": v.get("source")} for v in d.get("model_versions") or []]


async def set_alias(name, alias, version):
    if not re.fullmatch(r"[A-Za-z][\w-]{0,62}", alias or ""):
        raise HTTPException(400, "Alias: letters, digits, - and _ (e.g. champion, staging)")
    await mlapi("POST", "registered-models/alias", body={"name": name, "alias": alias, "version": str(version)})
    return {"ok": True}


# ------------------------------------------------------------------ serving
def endpoints():
    out = []
    for s in store.q("SELECT * FROM ml_serving ORDER BY name"):
        d = dict(s)
        p = _serving.get(d["name"])
        if d["status"] == "READY" and (not p or p.poll() is not None):
            d["status"] = "STOPPED" if d["desired"] != "running" else "FAILED"
        d["url"] = f"/api/ml/serving/{d['name']}/invocations"
        out.append(d)
    return out


def _free_port():
    used = {r["port"] for r in store.q("SELECT port FROM ml_serving")}
    p = int(env("MLFLOW_SERVING_PORT_START", "5100") or 5100)
    while p in used:
        p += 1
    return p


async def create_endpoint(body, actor):
    name = (body.get("name") or "").strip().lower()
    if not _NAME.match(name):
        raise HTTPException(400, "Endpoint name: lowercase letters, digits and -, e.g. churn-model")
    model, ref = (body.get("model") or "").strip(), str(body.get("ref") or "").strip()
    if not model or not ref:
        raise HTTPException(400, "Choose a model and a version or alias")
    if store.one("SELECT name FROM ml_serving WHERE name=?", (name,)):
        raise HTTPException(409, f"An endpoint named {name} already exists")
    store.x("INSERT INTO ml_serving (name, model, ref, port, desired, status, created, created_by) VALUES (?,?,?,?,?,?,?,?)",
            (name, model, ref, _free_port(), "running", "STARTING", time.time(), actor))
    asyncio.create_task(_start_endpoint(name))
    return {"ok": True}


async def _start_endpoint(name):
    s = store.one("SELECT * FROM ml_serving WHERE name=?", (name,))
    if not s:
        return
    _kill_tree(_serving.pop(name, None))
    store.x("UPDATE ml_serving SET status='STARTING', error=NULL, desired='running' WHERE name=?", (name,))
    try:
        await ensure_server()
        uri = f"models:/{s['model']}/{s['ref']}" if s["ref"].isdigit() else f"models:/{s['model']}@{s['ref']}"
        logs = DATA_ROOT / ".stratum" / "logs"
        logs.mkdir(parents=True, exist_ok=True)
        _serving[name] = _popen([sys.executable, "-m", "mlflow", "models", "serve", "-m", uri, "--env-manager", "local",
                                 "-h", "127.0.0.1", "-p", str(s["port"])], logs / f"serving-{name}.log", {"MLFLOW_TRACKING_URI": tracking_uri()})
        ok = await _wait_http(f"http://127.0.0.1:{s['port']}/ping", int(env("MLFLOW_SERVING_START_SECONDS", "300") or 300))
        if ok:
            store.x("UPDATE ml_serving SET status='READY', started=? WHERE name=?", (time.time(), name))
        else:
            tail = ""
            try:
                tail = (logs / f"serving-{name}.log").read_text(encoding="utf-8", errors="replace")[-600:]
            except OSError:
                pass
            _kill_tree(_serving.pop(name, None))
            store.x("UPDATE ml_serving SET status='FAILED', error=? WHERE name=?", (tail or "did not start", name))
    except Exception as e:  # noqa: BLE001
        store.x("UPDATE ml_serving SET status='FAILED', error=? WHERE name=?", (str(getattr(e, "detail", e))[:600], name))


async def endpoint_action(name, action, body=None):
    s = store.one("SELECT * FROM ml_serving WHERE name=?", (name,))
    if not s:
        raise HTTPException(404, "Endpoint not found")
    if action == "stop":
        _kill_tree(_serving.pop(name, None))
        store.x("UPDATE ml_serving SET desired='stopped', status='STOPPED' WHERE name=?", (name,))
    elif action == "start":
        asyncio.create_task(_start_endpoint(name))
    elif action == "update":
        ref = str((body or {}).get("ref") or "").strip()
        if not ref:
            raise HTTPException(400, "Choose a version or alias")
        store.x("UPDATE ml_serving SET ref=? WHERE name=?", (ref, name))
        asyncio.create_task(_start_endpoint(name))
    elif action == "delete":
        _kill_tree(_serving.pop(name, None))
        store.x("DELETE FROM ml_serving WHERE name=?", (name,))
    return {"ok": True}


async def invoke(name, raw, content_type):
    s = store.one("SELECT * FROM ml_serving WHERE name=?", (name,))
    if not s:
        raise HTTPException(404, "Endpoint not found")
    p = _serving.get(name)
    if s["status"] != "READY" or not p or p.poll() is not None:
        raise HTTPException(503, f"Endpoint {name} is not running ({s['status'].lower()})")
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(f"http://127.0.0.1:{s['port']}/invocations", content=raw, headers={"Content-Type": content_type or "application/json"})
    store.x("UPDATE ml_serving SET requests = requests + 1 WHERE name=?", (name,))
    return r.status_code, r.content, r.headers.get("content-type", "application/json")


def endpoint_log(name):
    try:
        return (DATA_ROOT / ".stratum" / "logs" / f"serving-{name}.log").read_text(encoding="utf-8", errors="replace")[-20000:]
    except OSError:
        return ""

