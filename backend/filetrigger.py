"""Job trigger: run a job when new files arrive in a folder (local / network / mounted disk, ADLS Gen2, S3, OCI
Object Storage, or a Data Hub SFTP / folder connection).

Every FILE_TRIGGER_SECONDS the folder is listed. New or changed files (by size + modified time) start a waiting
period; when no further files have arrived for `wait_seconds` the job runs once with parameters
  trigger_files       JSON list of the new file paths (first 200)
  trigger_file_count  how many files arrived
Files already in the folder when the trigger is switched on are not processed (like Databricks file arrival)."""
import asyncio
import fnmatch
import json
import logging
import time
from pathlib import Path

from fastapi import HTTPException

from .jobs import store
from .settings import env

log = logging.getLogger("databridge")
for _col in ("file_trigger TEXT", "file_state TEXT"):
    try:
        store.db.execute(f"ALTER TABLE jobs ADD COLUMN {_col}")
    except Exception:  # noqa: BLE001 - column exists
        pass
store.db.commit()


def clean(t):
    """Validate a file trigger definition from the job editor. None = no trigger."""
    if not t or not t.get("enabled"):
        return None
    loc = (t.get("location") or "").strip()
    if not loc:
        raise HTTPException(400, "File arrival: enter the folder to watch")
    try:
        wait = max(0, min(int(t.get("wait_seconds") or 60), 86400))
    except ValueError:
        raise HTTPException(400, "File arrival: wait time must be seconds")
    return {"enabled": True, "location": loc, "pattern": (t.get("pattern") or "*").strip() or "*", "recursive": bool(t.get("recursive")),
            "wait_seconds": wait, "connection_id": (t.get("connection_id") or "").strip() or None}


# ------------------------------------------------------------------ listing
def _fsspec(proto, loc):
    try:
        import fsspec
    except ImportError:
        raise RuntimeError("Watching cloud storage needs the fsspec packages (pip install fsspec adlfs s3fs)")
    if proto in ("abfss", "abfs", "az"):
        acct = env("ADLS_ACCOUNT")
        opts = {"account_name": acct} if acct else {}
        if env("ADLS_KEY"):
            opts["account_key"] = env("ADLS_KEY")
        else:
            opts["anon"] = False                     # managed identity / az login (DefaultAzureCredential)
        try:
            fs = fsspec.filesystem("abfs", **opts)
        except ImportError:
            raise RuntimeError("Watching ADLS needs: pip install adlfs")
        # abfss://container@account.dfs.core.windows.net/path -> container/path
        rest = loc.split("://", 1)[1]
        container, _, tail = rest.partition("@")
        path = container + "/" + (tail.split("/", 1)[1] if "/" in tail else "")
        return fs, path.rstrip("/")
    if proto in ("s3", "s3a", "oci"):
        opts = {}
        if env("S3_ACCESS_KEY"):
            opts.update(key=env("S3_ACCESS_KEY"), secret=env("S3_SECRET_KEY"))
        if env("S3_ENDPOINT"):
            opts["client_kwargs"] = {"endpoint_url": env("S3_ENDPOINT")}
        try:
            fs = fsspec.filesystem("s3", **opts)
        except ImportError:
            raise RuntimeError("Watching S3 / OCI Object Storage needs: pip install s3fs")
        return fs, loc.split("://", 1)[1].rstrip("/")
    raise RuntimeError(f"Unsupported location {loc}")


def list_files(t):
    """[{path, size, mtime}] of files matching the trigger's pattern."""
    pat = (t.get("pattern") or "*").lower()
    loc = t["location"]
    out = []
    if t.get("connection_id"):
        from .connectors import _Files, _get_conn
        c = _get_conn(t["connection_id"])
        cfg = {**c["config"], "path": loc or c["config"].get("path")}
        with _Files(c["type"], cfg) as fs:
            return [{"path": f["path"], "size": f["size"], "mtime": f["mtime"]} for f in fs.list(t.get("pattern") or "*")]
    if "://" in loc and not loc.lower().startswith("file://"):
        proto = loc.split("://", 1)[0].lower()
        fs, base = _fsspec(proto, loc)
        entries = fs.find(base, detail=True) if t.get("recursive") else fs.ls(base, detail=True)
        items = entries.values() if isinstance(entries, dict) else entries
        for e in items:
            if e.get("type") not in ("file", None) or e.get("size") is None:
                continue
            name = e["name"]
            if not fnmatch.fnmatch(name.rsplit("/", 1)[-1].lower(), pat):
                continue
            m = e.get("last_modified") or e.get("LastModified") or e.get("mtime") or 0
            mt = m.timestamp() if hasattr(m, "timestamp") else float(m or 0)
            out.append({"path": f"{proto}://{name}" if proto in ("s3", "s3a") else name, "size": int(e["size"]), "mtime": mt})
        return out
    base = Path(loc[7:] if loc.lower().startswith("file://") else loc)
    if not base.exists():
        raise RuntimeError(f"Folder not found on the DataBridge server: {base}")
    it = base.rglob("*") if t.get("recursive") else base.iterdir()
    for p in it:
        if p.is_file() and fnmatch.fnmatch(p.name.lower(), pat) and not p.name.startswith((".", "_")):
            st = p.stat()
            out.append({"path": str(p), "size": st.st_size, "mtime": st.st_mtime})
    return out


# ------------------------------------------------------------------ state
def _state(j):
    try:
        return json.loads(j.get("file_state") or "{}")
    except ValueError:
        return {}


def _save_state(job_id, st):
    store.x("UPDATE jobs SET file_state=? WHERE id=?", (json.dumps(st), job_id))


def reset(job_id, t):
    """Called when a trigger is created or its location changes: existing files count as already processed."""
    st = {"seen": {}, "pending": {}, "since": None, "last_check": time.time(), "error": None, "fired": 0, "last_fire": None}
    try:
        st["seen"] = {f["path"]: [f["size"], f["mtime"]] for f in list_files(t)}
    except Exception as e:  # noqa: BLE001
        st["error"] = str(e)[:300]
    _save_state(job_id, st)


def status(j):
    st = _state(j)
    return {"seen": len(st.get("seen") or {}), "pending": len(st.get("pending") or {}), "last_check": st.get("last_check"),
            "last_fire": st.get("last_fire"), "fired": st.get("fired", 0), "error": st.get("error")}


async def tick(manager):
    now = time.time()
    for j in store.q("SELECT id, name, paused, file_trigger, file_state FROM jobs WHERE file_trigger IS NOT NULL AND file_trigger != 'null'"):
        t = json.loads(j["file_trigger"] or "null")
        if not t or j["paused"]:
            continue
        st = _state(j)
        st.setdefault("seen", {})
        st.setdefault("pending", {})
        try:
            files = await asyncio.to_thread(list_files, t)
            st["error"] = None
        except Exception as e:  # noqa: BLE001
            st["error"], st["last_check"] = str(e)[:300], now
            _save_state(j["id"], st)
            continue
        st["last_check"] = now
        new = {f["path"]: [f["size"], f["mtime"]] for f in files if st["seen"].get(f["path"]) != [f["size"], f["mtime"]]}
        changed = {k: v for k, v in new.items() if st["pending"].get(k) != v}
        if changed:
            st["pending"].update(changed)
            st["since"] = now                        # wait until files stop arriving
        if st["pending"] and st.get("since") and now - st["since"] >= t["wait_seconds"]:
            paths = sorted(st["pending"])
            try:
                run = manager.trigger(j["id"], {"trigger_files": json.dumps(paths[:200]), "trigger_file_count": str(len(paths))}, trigger="file_arrival")
            except HTTPException as e:
                st["error"] = f"Waiting: {e.detail}"
                run = None
            if run:
                st["seen"].update(st["pending"])
                st["pending"], st["since"] = {}, None
                st["fired"] = st.get("fired", 0) + 1
                st["last_fire"] = now
        if len(st["seen"]) > 50000:                  # keep state small: forget files no longer in the folder
            present = {f["path"] for f in files}
            st["seen"] = {k: v for k, v in st["seen"].items() if k in present}
        _save_state(j["id"], st)


async def loop(manager):
    while True:
        await asyncio.sleep(max(15, int(env("FILE_TRIGGER_SECONDS", "60") or 60)))
        try:
            await tick(manager)
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            log.exception("file arrival triggers")

