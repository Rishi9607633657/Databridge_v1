"""Logs centre: server log, notebook/Spark kernel logs (one file per kernel), job and pipeline run logs."""
import json
import logging
import logging.handlers
import re
import time
from pathlib import Path

from fastapi import HTTPException

from .settings import DATA_ROOT

LOG_DIR = DATA_ROOT / ".stratum" / "logs"
KERNEL_DIR = LOG_DIR / "kernels"
SERVER_LOG = LOG_DIR / "server.log"
LEVEL_RE = re.compile(r"\b(ERROR|FATAL|CRITICAL|SEVERE|Exception|Traceback|WARN(?:ING)?|INFO|DEBUG)\b")
_setup_done = False


def setup():
    """Send DataBridge + uvicorn logging to a rotating server.log (kept small)."""
    global _setup_done
    if _setup_done:
        return
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    KERNEL_DIR.mkdir(parents=True, exist_ok=True)
    h = logging.handlers.RotatingFileHandler(SERVER_LOG, maxBytes=5_000_000, backupCount=2, encoding="utf-8")
    h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s"))
    class _OnlyFailedRequests(logging.Filter):            # access log: keep 4xx/5xx only (no polling noise)
        def filter(self, rec):
            if rec.name != "uvicorn.access":
                return True
            try:
                return int(rec.args[4]) >= 400
            except Exception:  # noqa: BLE001
                return False
    h.addFilter(_OnlyFailedRequests())
    for name in ("", "uvicorn", "uvicorn.access"):      # these do not pass records upward, so no duplicates
        lg = logging.getLogger(name)
        if not any(isinstance(x, logging.handlers.RotatingFileHandler) for x in lg.handlers):
            lg.addHandler(h)
    logging.getLogger("databridge").setLevel(logging.INFO)
    logging.getLogger().setLevel(logging.INFO)
    _setup_done = True
    logging.getLogger("databridge").info("DataBridge server started")
    _prune()


def _prune(keep=60, max_mb=5):
    files = sorted(KERNEL_DIR.glob("*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    for p in files[keep:]:
        p.unlink(missing_ok=True)
    for p in files[:keep]:
        if p.stat().st_size > max_mb * 1_000_000:          # keep the newest part of very large logs
            data = p.read_bytes()[-max_mb * 500_000:]
            p.write_bytes(b"...(older lines removed)\n" + data)


def _level(line):
    m = LEVEL_RE.search(line)
    if not m:
        return ""
    t = m.group(1).upper()
    return "error" if t in ("ERROR", "FATAL", "CRITICAL", "SEVERE", "EXCEPTION", "TRACEBACK") else "warn" if t.startswith("WARN") else t.lower()


def _tail(path: Path, lines=800):
    if not path.exists():
        return []
    with open(path, "rb") as f:
        f.seek(0, 2)
        size = f.tell()
        block, data = 65536, b""
        while size > 0 and data.count(b"\n") <= lines:
            step = min(block, size)
            size -= step
            f.seek(size)
            data = f.read(step) + data
    return data.decode("utf-8", "replace").splitlines()[-lines:]


def sources(kernels, store):
    live = {getattr(ks, "log_path", None): ks for ks in kernels.by_id.values()}
    out = [{"id": "server", "kind": "server", "name": "DataBridge server", "detail": "API, scheduler, errors", "live": True,
            "updated": SERVER_LOG.stat().st_mtime if SERVER_LOG.exists() else None}]
    for p in sorted(KERNEL_DIR.glob("*.log"), key=lambda p: p.stat().st_mtime, reverse=True)[:40]:
        ks = live.get(p)
        label = p.stem.rsplit("__", 1)[0].replace("_", " ")
        out.append({"id": f"kernel:{p.name}", "kind": "kernel", "name": label, "live": bool(ks),
                    "detail": ("running" if ks else "stopped") + f" · {round(p.stat().st_size / 1024)} KB", "updated": p.stat().st_mtime})
    out.append({"id": "jobs", "kind": "runs", "name": "Job runs", "detail": "Workflows › Jobs", "live": True, "updated": None})
    out.append({"id": "pipelines", "kind": "runs", "name": "Pipeline runs", "detail": "Pipelines", "live": True, "updated": None})
    return out


def read(source, store, lines=800, q="", level=""):
    if source == "server":
        rows = _tail(SERVER_LOG, lines * 2)
    elif source.startswith("kernel:"):
        name = source.split(":", 1)[1]
        if "/" in name or "\\" in name or not name.endswith(".log"):
            raise HTTPException(400, "bad log name")
        rows = _tail(KERNEL_DIR / name, lines * 2)
    elif source == "jobs":
        return {"kind": "runs", "rows": _job_runs(store)}
    elif source == "pipelines":
        return {"kind": "runs", "rows": _pipeline_runs(store)}
    else:
        raise HTTPException(404, "unknown log")
    out = []
    for ln in rows:
        lv = _level(ln)
        if level == "error" and lv != "error":
            continue
        if level == "warn" and lv not in ("error", "warn"):
            continue
        if q and q.lower() not in ln.lower():
            continue
        out.append({"t": ln, "l": lv})
    return {"kind": "text", "lines": out[-lines:], "total": len(rows)}


def _ts(v):
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(v)) if v else ""


def _job_runs(store, limit=60):
    rows = store.q("""SELECT r.id, r.run_number, r.state, r.start, r.end, r.message, r.trigger, j.name
                      FROM runs r LEFT JOIN jobs j ON j.id = r.job_id ORDER BY r.start DESC LIMIT ?""", (limit,))
    out = []
    for r in rows:
        tasks = store.q("SELECT task_key, attempt, state, start, end, error, current_cell, notebook_path FROM task_runs WHERE run_id=? ORDER BY start", (r["id"],))
        out.append({"title": f"{r['name'] or 'job'} #{r['run_number']}", "state": r["state"], "start": _ts(r["start"]),
                    "duration": round((r["end"] or time.time()) - r["start"], 1) if r["start"] else None, "trigger": r["trigger"],
                    "message": r["message"] or "", "link": f"#/run/{r['id']}",
                    "steps": [{"name": f"{t['task_key']} (try {t['attempt']})", "state": t["state"], "error": (t["error"] or "")[:1500],
                               "detail": t["notebook_path"] or ""} for t in tasks]})
    return out


def _pipeline_runs(store, limit=60):
    rows = store.q("""SELECT r.id, r.run_number, r.state, r.start, r.end, r.message, r.trigger, p.name
                      FROM pipeline_runs r LEFT JOIN pipelines p ON p.id = r.pipeline_id ORDER BY r.start DESC LIMIT ?""", (limit,))
    out = []
    for r in rows:
        acts = store.q("SELECT name, type, state, start, end, error FROM activity_runs WHERE run_id=? ORDER BY seq", (r["id"],))
        out.append({"title": f"{r['name'] or 'pipeline'} #{r['run_number']}", "state": r["state"], "start": _ts(r["start"]),
                    "duration": round((r["end"] or time.time()) - r["start"], 1) if r["start"] else None, "trigger": r["trigger"],
                    "message": r["message"] or "", "link": f"#/prun/{r['id']}",
                    "steps": [{"name": f"{a['name']} · {a['type']}", "state": a["state"], "error": (a["error"] or "")[:1500], "detail": ""} for a in acts]})
    return out
