"""Airbyte connectors WITHOUT Airbyte: DataBridge builds the connector catalog straight from github.com/airbytehq/airbyte
and runs the connectors itself, speaking the Airbyte protocol (spec / check / discover / read).

Three runtimes, picked per connector from its metadata.yaml:
  manifest  ~500 API connectors defined as low-code YAML (manifest.yaml [+ components.py]). Run in-process-style by the
            airbyte-cdk "source-declarative-manifest" runner from ONE shared virtualenv. No Docker, no per-connector install.
  python    ~70 Python connectors published on PyPI (airbyte-source-<name>). Each gets its own virtualenv (pip install).
  docker    ~20 Java connectors (mostly databases). Run with `docker run airbyte/source-<name>` if Docker is available.
            DataBridge already has native Postgres / MySQL / SQL Server / Oracle connectors, so these are optional.

Layout (under .stratum/airbyte_local):  repo/ (sparse git checkout: metadata.yaml, manifest.yaml, components.py, icon.svg)
catalog.json (built index)   envs/cdk (shared runner)   envs/<connector> (PyPI connectors)."""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

from fastapi import HTTPException

from .settings import DATA_ROOT, env

ROOT = DATA_ROOT / ".stratum" / "airbyte_local"
REPO = ROOT / "repo"
CONN_DIR = REPO / "airbyte-integrations" / "connectors"
CATALOG = ROOT / "catalog.json"
ENVS = ROOT / "envs"
MASK = "••••••••"
SPARSE = ["/airbyte-integrations/connectors/source-*/metadata.yaml", "/airbyte-integrations/connectors/source-*/manifest.yaml",
          "/airbyte-integrations/connectors/source-*/components.py", "/airbyte-integrations/connectors/source-*/icon.svg"]
WIN = os.name == "nt"
_lock = threading.Lock()
_jobs = {"build": {"state": "idle", "log": []}}          # background build / install status
_cat_cache = {"mtime": 0, "data": None}


# ---------------- helpers ----------------
def _log(job, msg):
    j = _jobs.setdefault(job, {"state": "idle", "log": []})
    j["log"] = (j.get("log") or [])[-200:] + [f"{time.strftime('%H:%M:%S')} {msg}"]


def _run(cmd, cwd=None, timeout=1800):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd[:4]))} failed: {(p.stderr or p.stdout)[-1500:]}")
    return p.stdout


def _venv_python(d: Path) -> Path:
    return d / ("Scripts/python.exe" if WIN else "bin/python")


def _venv_bin(d: Path, name: str) -> Path:
    return d / ("Scripts" if WIN else "bin") / (name + (".exe" if WIN else ""))


def _base_python():
    """Python used to create connector virtualenvs when uv is not available (AIRBYTE_PYTHON = path to python.exe)."""
    return env("AIRBYTE_PYTHON") or sys.executable


def _uv(job=None):
    """uv (fast pip + downloads a matching Python, e.g. 3.11, when the machine has a newer/older one). Installed once into envs/_tools."""
    found = shutil.which("uv")
    if found:
        return found
    tools = ENVS / "_tools"
    exe = _venv_bin(tools, "uv")
    if exe.exists():
        return str(exe)
    try:
        if job:
            _log(job, "Installing uv (fast installer, one time)…")
        if not _venv_python(tools).exists():
            _run([sys.executable, "-m", "venv", str(tools)])
        _run([str(_venv_python(tools)), "-m", "pip", "install", "-q", "uv"], timeout=600)
        return str(exe) if exe.exists() else None
    except Exception:  # noqa: BLE001 - fall back to venv + pip
        return None


def _uv_env():
    return dict(os.environ, UV_PYTHON_INSTALL_DIR=str(ENVS / "_python"), UV_CACHE_DIR=str(ENVS / "_cache"))


def _make_env(d: Path, job):
    """Virtualenv for connectors, on Python AIRBYTE_PYTHON_VERSION (default 3.11 — what Airbyte's connectors are built for)."""
    if _venv_python(d).exists():
        return
    uv = _uv(job)
    ver = env("AIRBYTE_PYTHON_VERSION", "3.11")
    if uv and not env("AIRBYTE_PYTHON"):
        _log(job, f"Creating environment on Python {ver} (downloaded automatically if needed)…")
        p = subprocess.run([uv, "venv", "--python", ver, str(d)], capture_output=True, text=True, env=_uv_env(), timeout=900)
        if p.returncode == 0:
            return
        _log(job, f"uv could not create it ({(p.stderr or '')[-300:]}); using the local Python")
    _run([_base_python(), "-m", "venv", str(d)])


def _pip(d: Path, *pkgs, upgrade=False):
    uv = _uv()
    if uv:
        cmd = [uv, "pip", "install", "--python", str(_venv_python(d))] + (["--upgrade"] if upgrade else []) + list(pkgs)
        p = subprocess.run(cmd, capture_output=True, text=True, env=_uv_env(), timeout=1800)
        if p.returncode != 0:
            raise RuntimeError(f"install failed: {(p.stderr or p.stdout)[-1500:]}")
        return
    _run([str(_venv_python(d)), "-m", "pip", "install", "-q"] + (["--upgrade"] if upgrade else []) + list(pkgs), timeout=1800)


# ---------------- catalog: build from GitHub ----------------
def status():
    cat = catalog(silent=True)
    cdk = (ENVS / "cdk" / ".ready").exists()
    return {"built": bool(cat), "connectors": len(cat or []), "updated": CATALOG.stat().st_mtime if CATALOG.exists() else None,
            "git": bool(shutil.which("git")), "docker": bool(shutil.which("docker")), "cdk_ready": cdk,
            "repo": env("AIRBYTE_REPO_URL", "https://github.com/airbytehq/airbyte.git"), "jobs": _jobs,
            "counts": {r: sum(1 for c in cat or [] if c["runtime"] == r) for r in ("manifest", "python", "docker")}}


def build_catalog():
    """Sparse-clone / update the Airbyte repo (connector definitions only, ~50 MB) and index every source connector."""
    import yaml
    job = "build"
    _jobs[job] = {"state": "running", "log": [], "started": time.time()}
    try:
        if not shutil.which("git"):
            raise RuntimeError("Git is not installed. Install Git for Windows (https://git-scm.com/download/win) and try again.")
        url = env("AIRBYTE_REPO_URL", "https://github.com/airbytehq/airbyte.git")
        branch = env("AIRBYTE_REPO_BRANCH", "master")
        ROOT.mkdir(parents=True, exist_ok=True)
        if not (REPO / ".git").exists():
            _log(job, f"Cloning {url} (connector definitions only)…")
            shutil.rmtree(REPO, ignore_errors=True)
            _run(["git", "clone", "--depth", "1", "--filter=blob:none", "--no-checkout", "--branch", branch, url, str(REPO)])
            _run(["git", "sparse-checkout", "init", "--no-cone"], cwd=REPO)
            (REPO / ".git" / "info" / "sparse-checkout").write_text("\n".join(SPARSE) + "\n", encoding="utf-8")
            _log(job, "Downloading metadata, manifests and icons…")
            _run(["git", "checkout", branch], cwd=REPO)
        else:
            _log(job, "Updating from GitHub…")
            (REPO / ".git" / "info" / "sparse-checkout").write_text("\n".join(SPARSE) + "\n", encoding="utf-8")
            _run(["git", "fetch", "--depth", "1", "origin", branch], cwd=REPO)
            _run(["git", "reset", "--hard", "FETCH_HEAD"], cwd=REPO)
        commit = _run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO).strip()
        out = []
        dirs = sorted(p for p in CONN_DIR.glob("source-*") if (p / "metadata.yaml").exists())
        _log(job, f"Indexing {len(dirs)} source connectors (commit {commit})…")
        for d in dirs:
            try:
                md = (yaml.safe_load((d / "metadata.yaml").read_text(encoding="utf-8")) or {}).get("data") or {}
            except Exception:  # noqa: BLE001
                continue
            if md.get("supportLevel") == "archived" or (md.get("registryOverrides") or {}).get("oss", {}).get("enabled") is False:
                continue
            tags = md.get("tags") or []
            lang = next((t.split(":", 1)[1] for t in tags if t.startswith("language:")), "")
            pypi = (md.get("remoteRegistries") or {}).get("pypi") or {}
            has_manifest = (d / "manifest.yaml").exists()
            runtime = ("manifest" if lang == "manifest-only" and has_manifest else
                       "python" if lang == "python" and pypi.get("enabled") else "docker")
            cid = d.name[len("source-"):]
            base = ((md.get("connectorBuildOptions") or {}).get("baseImage") or "")
            out.append({"id": cid, "name": md.get("name") or cid, "runtime": runtime, "dir": d.name,
                        "support": md.get("supportLevel") or "community", "stage": md.get("releaseStage") or "",
                        "subtype": md.get("connectorSubtype") or "api", "version": str(md.get("dockerImageTag") or ""),
                        "image": f"{md.get('dockerRepository')}:{md.get('dockerImageTag')}" if md.get("dockerRepository") else None,
                        "pypi": pypi.get("packageName") if runtime == "python" else None,
                        "cdk": (re.search(r":(\d+\.\d+\.\d+)", base) or [None, None])[1],
                        "components": (d / "components.py").exists(), "icon": (d / "icon.svg").exists(),
                        "docs": md.get("documentationUrl"), "hosts": (md.get("allowedHosts") or {}).get("hosts") or [],
                        "suggested": (md.get("suggestedStreams") or {}).get("streams") or []})
        CATALOG.write_text(json.dumps({"commit": commit, "built": time.time(), "connectors": out}, indent=0), encoding="utf-8")
        _cat_cache["mtime"] = 0
        _log(job, f"Done: {len(out)} connectors ({sum(c['runtime'] == 'manifest' for c in out)} API/no-install, "
                  f"{sum(c['runtime'] == 'python' for c in out)} Python, {sum(c['runtime'] == 'docker' for c in out)} Docker).")
        _jobs[job]["state"] = "done"
    except Exception as e:  # noqa: BLE001
        _log(job, f"Failed: {e}")
        _jobs[job]["state"] = "failed"
        _jobs[job]["error"] = str(e)[:1500]


def catalog(silent=False):
    if not CATALOG.exists():
        if silent:
            return None
        raise HTTPException(409, "The connector catalog is not built yet. Data Hub › Connector catalog › Build from GitHub.")
    mt = CATALOG.stat().st_mtime
    if _cat_cache["mtime"] != mt:
        _cat_cache.update(mtime=mt, data=json.loads(CATALOG.read_text(encoding="utf-8"))["connectors"])
    return _cat_cache["data"]


def get(cid):
    c = next((x for x in catalog() if x["id"] == cid), None)
    if not c:
        raise HTTPException(404, f"Unknown Airbyte connector: {cid}")
    return c


def icon_path(cid):
    p = CONN_DIR / f"source-{re.sub(r'[^a-z0-9_-]', '', cid.lower())}" / "icon.svg"
    return p if p.exists() else None


def _manifest(c):
    import yaml
    return yaml.safe_load((CONN_DIR / c["dir"] / "manifest.yaml").read_text(encoding="utf-8"))


# ---------------- runtimes: install ----------------
def runtime_ready(c):
    if c["runtime"] == "manifest":
        return (ENVS / "cdk" / ".ready").exists()
    if c["runtime"] == "python":
        return (ENVS / c["id"] / ".ready").exists() and _venv_bin(ENVS / c["id"], f"source-{c['id']}").exists()
    return bool(shutil.which("docker"))


def install(cid):
    """Prepare the runtime (pip into a virtualenv / docker pull). Runs in a background thread; poll status()['jobs']."""
    c = get(cid)
    job = f"install:{cid}"
    _jobs[job] = {"state": "running", "log": [], "started": time.time()}
    try:
        if c["runtime"] == "manifest":
            d = ENVS / "cdk"
            _log(job, "Preparing the shared runner for all API connectors (one time)…")
            _make_env(d, job)
            spec = env("AIRBYTE_CDK_SPEC", "airbyte-cdk>=7,<8")
            _log(job, f"install {spec}")
            _pip(d, spec, upgrade=True)
            (d / ".ready").write_text(spec, encoding="utf-8")
        elif c["runtime"] == "python":
            d = ENVS / c["id"]
            _make_env(d, job)
            pkg = c["pypi"] or f"airbyte-source-{c['id']}"
            _log(job, f"install {pkg}=={c['version']}")
            try:
                _pip(d, f"{pkg}=={c['version']}")
            except RuntimeError:
                _log(job, "That exact version is not available; installing the latest…")
                _pip(d, pkg, upgrade=True)
            (d / ".ready").write_text(pkg, encoding="utf-8")
        else:
            if not shutil.which("docker"):
                raise RuntimeError("This connector needs Docker (it is written in Java). Install Docker Desktop, or use DataBridge's built-in "
                                   "database connectors (Postgres, MySQL, SQL Server, Oracle).")
            _log(job, f"docker pull {c['image']}")
            _run(["docker", "pull", c["image"]], timeout=3600)
        _log(job, "Ready.")
        _jobs[job]["state"] = "done"
    except Exception as e:  # noqa: BLE001
        _log(job, f"Failed: {e}")
        _jobs[job].update(state="failed", error=str(e)[:1500])


# ---------------- protocol runner ----------------
class AirbyteError(Exception):
    pass


def _command(c, cmd, files):
    """argv to run one Airbyte command. files: {name: host_path} for config/catalog/state."""
    args = [cmd]
    if c["runtime"] == "docker":
        tmp = Path(next(iter(files.values()))).parent if files else Path(tempfile.gettempdir())
        for k, p in files.items():
            args += [f"--{k}", f"/abtmp/{Path(p).name}"]
        return ["docker", "run", "--rm", "-i", "--add-host=host.docker.internal:host-gateway", "-v", f"{tmp}:/abtmp", c["image"]] + args
    for k, p in files.items():
        args += [f"--{k}", str(p)]
    if c["runtime"] == "manifest":
        py = _venv_python(ENVS / "cdk")
        if not (ENVS / "cdk" / ".ready").exists():
            raise AirbyteError("The connector runner is not installed yet — click Install / Prepare on the connector.")
        args += ["--manifest-path", str(CONN_DIR / c["dir"] / "manifest.yaml")]
        if c["components"]:
            args += ["--components-path", str(CONN_DIR / c["dir"] / "components.py")]
        return [str(py), "-c", "from airbyte_cdk.cli.source_declarative_manifest import run; run()"] + args
    exe = _venv_bin(ENVS / c["id"], f"source-{c['id']}")
    if not exe.exists():
        raise AirbyteError(f"{c['name']} is not installed yet — click Install / Prepare on the connector.")
    return [str(exe)] + args


def run(c, cmd, config=None, catalog_=None, state=None, on_record=None, limit=None, timeout=None):
    """Run spec/check/discover/read. Returns {spec|status|catalog, states, logs, records(count)}. on_record(stream, data)."""
    with tempfile.TemporaryDirectory(prefix="dbab-") as td:
        files = {}
        if config is not None:
            files["config"] = Path(td) / "config.json"
            files["config"].write_text(json.dumps(config), encoding="utf-8")
        if catalog_ is not None:
            files["catalog"] = Path(td) / "catalog.json"
            files["catalog"].write_text(json.dumps(catalog_), encoding="utf-8")
        if state is not None:
            files["state"] = Path(td) / "state.json"
            files["state"].write_text(json.dumps(state), encoding="utf-8")
        argv = _command(c, cmd, files)
        envv = dict(os.environ, PYTHONUNBUFFERED="1", PYTHONIOENCODING="utf-8")
        if c.get("components"):
            envv["AIRBYTE_ENABLE_UNSAFE_CODE"] = "true"      # components.py comes from the official repo you built from
        p = subprocess.Popen(argv, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding="utf-8", errors="replace",
                             env=envv, bufsize=1, **({"creationflags": 0x08000000} if WIN else {}))
        out = {"states": [], "logs": [], "records": 0, "errors": []}
        err_lines = []
        t_err = threading.Thread(target=lambda: err_lines.extend(p.stderr.read().splitlines()[-60:]), daemon=True)
        t_err.start()
        killed = False
        t0 = time.time()
        try:
            for line in p.stdout:
                line = line.strip()
                if not line:
                    continue
                if not line.startswith("{"):
                    out["logs"] = (out["logs"] + [line[:500]])[-60:]
                    continue
                try:
                    m = json.loads(line)
                except ValueError:
                    out["logs"] = (out["logs"] + [line[:500]])[-60:]
                    continue
                t = m.get("type")
                if t == "RECORD":
                    r = m["record"]
                    out["records"] += 1
                    if on_record:
                        on_record(r.get("stream"), r.get("data") or {})
                    if limit and out["records"] >= limit:
                        killed = True
                        p.kill()
                        break
                elif t == "STATE":
                    out["states"].append(m["state"])
                elif t == "LOG":
                    lg = m.get("log") or {}
                    out["logs"] = (out["logs"] + [f"{lg.get('level')}: {str(lg.get('message'))[:500]}"])[-60:]
                    if lg.get("level") in ("ERROR", "FATAL"):
                        out["errors"].append(str(lg.get("message"))[:1500])
                elif t == "TRACE":
                    tr = m.get("trace") or {}
                    if tr.get("type") == "ERROR":
                        e = tr.get("error") or {}
                        out["errors"].append(str(e.get("message") or e.get("internal_message") or e)[:1500])
                elif t == "CONNECTION_STATUS":
                    out["status"] = m["connectionStatus"]
                elif t == "CATALOG":
                    out["catalog"] = m["catalog"]
                elif t == "SPEC":
                    out["spec"] = m["spec"]
                if timeout and time.time() - t0 > timeout:
                    killed = True
                    p.kill()
                    out["errors"].append(f"stopped after {timeout} s")
                    break
        finally:
            try:
                p.wait(timeout=30)
            except subprocess.TimeoutExpired:
                p.kill()
            t_err.join(timeout=5)
        if p.returncode not in (0, None) and not killed and not out["records"] and not out.get("catalog") and not out.get("status") and not out.get("spec"):
            msg = (out["errors"] or [""])[-1] or "\n".join(err_lines[-15:]) or "\n".join(out["logs"][-10:])
            raise AirbyteError(f"{c['name']} {cmd} failed: {msg[-2000:]}")
        if out["errors"] and cmd == "read" and not out["records"]:
            raise AirbyteError(f"{c['name']}: {out['errors'][-1]}")
        return out


# ---------------- spec / config ----------------
def spec(cid):
    c = get(cid)
    if c["runtime"] == "manifest":
        m = _manifest(c)
        s = (m.get("spec") or {})
        return {"connector": c, "schema": s.get("connection_specification") or {}, "docs": s.get("documentation_url") or c["docs"], "ready": runtime_ready(c)}
    if not runtime_ready(c):
        return {"connector": c, "schema": None, "ready": False}
    sp = (run(c, "spec").get("spec") or {})
    return {"connector": c, "schema": sp.get("connectionSpecification") or {}, "docs": sp.get("documentationUrl") or c["docs"], "ready": True}


def _secret_keys(schema, acc=None):
    acc = set() if acc is None else acc
    if isinstance(schema, dict):
        for k, v in (schema.get("properties") or {}).items():
            if isinstance(v, dict) and v.get("airbyte_secret"):
                acc.add(k)
            _secret_keys(v, acc)
        for key in ("oneOf", "anyOf", "allOf"):
            for v in schema.get(key) or []:
                _secret_keys(v, acc)
        if isinstance(schema.get("items"), dict):
            _secret_keys(schema["items"], acc)
    return acc


_SECRET_GUESS = re.compile(r"(secret|password|token|api_?key|private_?key|credentials_json|access_key)", re.I)


def _walk_mask(v, keys):
    if isinstance(v, dict):
        return {k: (MASK if (k in keys or _SECRET_GUESS.search(k)) and isinstance(x, str) and x else _walk_mask(x, keys)) for k, x in v.items()}
    if isinstance(v, list):
        return [_walk_mask(x, keys) for x in v]
    return v


def _walk_unmask(new, old):
    if isinstance(new, dict):
        o = old if isinstance(old, dict) else {}
        return {k: (o.get(k) if x == MASK else _walk_unmask(x, o.get(k))) for k, x in new.items()}
    if isinstance(new, list):
        return [_walk_unmask(x, (old or [None] * len(new))[i] if isinstance(old, list) and i < len(old) else None) for i, x in enumerate(new)]
    return new


_spec_cache = {}


def _schema_for(cid):
    if cid not in _spec_cache:
        try:
            _spec_cache[cid] = spec(cid).get("schema") or {}
        except Exception:  # noqa: BLE001
            return {}
    return _spec_cache[cid]


def mask(cfg):
    keys = _secret_keys(_schema_for(cfg.get("connector"))) if cfg.get("connector") else set()
    return {"connector": cfg.get("connector"), "values": _walk_mask(cfg.get("values") or {}, keys)}


def clean_config(cfg, old=None):
    cfg = cfg or {}
    cid = cfg.get("connector") or (old or {}).get("connector")
    get(cid)
    vals = cfg.get("values") or {}
    if not isinstance(vals, dict):
        raise HTTPException(400, "Connector settings must be an object")
    return {"connector": cid, "values": _walk_unmask(vals, (old or {}).get("values") or {})}


# ---------------- check / discover / read ----------------
_disc = {}           # key -> (time, catalog)


def check(cfg):
    c = get(cfg["connector"])
    try:
        r = run(c, "check", cfg.get("values") or {}, timeout=300)
    except AirbyteError as e:
        raise HTTPException(400, str(e))
    st = r.get("status") or {}
    if st.get("status") != "SUCCEEDED":
        raise HTTPException(400, f"{c['name']}: {st.get('message') or (r['errors'] or ['check failed'])[-1]}")
    return f"Connected to {c['name']}"


def discover(cfg, key=None, force=False):
    c = get(cfg["connector"])
    k = key or json.dumps(cfg, sort_keys=True)
    hit = _disc.get(k)
    if hit and not force and time.time() - hit[0] < 600:
        return hit[1]
    try:
        r = run(c, "discover", cfg.get("values") or {}, timeout=600)
    except AirbyteError as e:
        raise HTTPException(400, str(e))
    cat = r.get("catalog") or {"streams": []}
    _disc[k] = (time.time(), cat)
    return cat


def forget(key):
    _disc.pop(key, None)


def stream_columns(stream):
    props = ((stream.get("json_schema") or {}).get("properties") or {})
    pk = {p[0] for p in (stream.get("source_defined_primary_key") or []) if p}
    cur = (stream.get("default_cursor_field") or [None])[0]
    out = []
    for name, sch in props.items():
        t = sch.get("type") if isinstance(sch, dict) else None
        t = [x for x in (t if isinstance(t, list) else [t]) if x and x != "null"]
        fmt = sch.get("format") if isinstance(sch, dict) else None
        typ = fmt or (t[0] if t else "any")
        out.append({"name": name, "type": typ, "pk": name in pk, "cursor_ok": typ in ("date-time", "date", "integer", "number", "string") or name == cur})
    return out


def configured_catalog(stream, mode, cursor=None, keys=None):
    inc = mode in ("append", "merge") and "incremental" in (stream.get("supported_sync_modes") or [])
    cs = {"stream": stream, "sync_mode": "incremental" if inc else "full_refresh",
          "destination_sync_mode": "append_dedup" if mode == "merge" else "append" if inc else "overwrite"}
    if inc:
        cs["cursor_field"] = stream.get("default_cursor_field") if stream.get("source_defined_cursor") or not cursor else [cursor]
    pk = stream.get("source_defined_primary_key") or ([[k] for k in keys] if keys else None)
    if pk:
        cs["primary_key"] = pk
    return {"streams": [cs]}, inc


def read(cfg, stream_name, mode, cursor, keys, prev_state, on_record, limit=None, key=None):
    """Read one stream. prev_state: list of AirbyteStateMessage from the last successful run (incremental)."""
    c = get(cfg["connector"])
    cat = discover(cfg, key)
    stream = next((s for s in cat["streams"] if s["name"] == stream_name), None)
    if not stream:
        raise HTTPException(400, f"{c['name']} has no stream named {stream_name!r} (any more)")
    cc, inc = configured_catalog(stream, mode, cursor, keys)
    try:
        r = run(c, "read", cfg.get("values") or {}, cc, prev_state if (inc and prev_state) else None, on_record=on_record, limit=limit)
    except AirbyteError as e:
        raise HTTPException(400, str(e))
    # keep the latest state message per stream (or the global one)
    latest = {}
    for s in r["states"]:
        k = s.get("type") == "STREAM" and json.dumps((s.get("stream") or {}).get("stream_descriptor") or {}, sort_keys=True) or s.get("type") or "LEGACY"
        latest[k] = s
    return {"records": r["records"], "state": list(latest.values()) if inc else None, "incremental": inc, "logs": r["logs"][-20:]}
