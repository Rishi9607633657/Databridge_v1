"""DataBridge AI overview app (React, built into frontend/overview).

- GET /overview                → the app (served from /static/overview/index.html)
- GET /api/overview/host       → live CPU / memory / disk / network of the DataBridge host for the
                                 "System Health" card (signed-in users; numbers only, no process details)
"""
import socket
import time

from fastapi import APIRouter
from fastapi.responses import RedirectResponse

from .settings import settings

router = APIRouter()

_last = {"t": 0.0, "bytes": 0}
NOMINAL_MBPS = 1000.0  # ring shows throughput as a share of a 1 Gbit/s link


def _psutil():
    try:
        import psutil  # noqa: PLC0415
        return psutil
    except ImportError:  # pragma: no cover - psutil is in requirements.txt
        return None


_ps = _psutil()
if _ps:
    _ps.cpu_percent(interval=None)  # prime: the first call always returns 0


@router.get("/overview", include_in_schema=False)
def overview_app():
    return RedirectResponse("/static/overview/index.html")


@router.get("/api/overview/host")
def overview_host():
    ps = _ps
    if ps is None:
        return {"cpu": None, "memory": None, "storage": None, "network_mbps": 0, "network_share": 0, "time": time.time(), "note": "psutil not installed"}
    cpu = ps.cpu_percent(interval=None)
    mem = ps.virtual_memory().percent
    try:
        disk = ps.disk_usage(str(settings.workspace)).percent
    except Exception:  # noqa: BLE001
        disk = ps.disk_usage("/").percent
    now = time.time()
    try:
        io = ps.net_io_counters()
        total = io.bytes_sent + io.bytes_recv
    except Exception:  # noqa: BLE001
        total = 0
    mbps = 0.0
    if _last["t"] and now > _last["t"] and total >= _last["bytes"]:
        mbps = (total - _last["bytes"]) * 8 / 1e6 / (now - _last["t"])
    _last.update(t=now, bytes=total)
    return {
        "cpu": round(cpu, 1),
        "memory": round(mem, 1),
        "storage": round(disk, 1),
        "network_mbps": round(mbps, 1),
        "network_share": round(min(1.0, mbps / NOMINAL_MBPS), 4),
        "host": socket.gethostname(),
        "time": now,
    }
