"""Admin: system health checks, .env settings editor with validation, kernel manager, startup self-check."""
import asyncio
import importlib.metadata as md
import os
import platform
import re
import shutil
import socket
import subprocess
import sys
import time
from pathlib import Path
from zoneinfo import ZoneInfo

from fastapi import HTTPException

from .settings import DATA_ROOT, ROOT, env, settings

ENV_PATH = DATA_ROOT / ".env"
MASK = "********"
IS_WIN = os.name == "nt"

# ------------------------------------------------------------------ settings schema
# key: (group, label, type, default, help, restart)   type: bool|int|str|secret|enum:a,b|path|tz|jdbc|url
SCHEMA = {
    "STRATUM_PORT": ("Server", "Port", "int", "8800", "Port DataBridge listens on", True),
    "STRATUM_WORKSPACE": ("Server", "Workspace folder", "path", "./workspace", "Where notebooks are stored", True),
    "AUTH_ENABLED": ("Server", "Require sign-in", "bool", "true", "Keep true whenever anyone else can reach this machine", True),
    "SESSION_HOURS": ("Server", "Sign-in lasts (hours)", "int", "12", "", True),
    "KERNEL_IDLE_MINUTES": ("Server", "Stop idle kernels after (minutes)", "int", "60", "0 = never. Frees RAM and database connections", False),
    "SPARK_AUTO_INIT": ("Spark", "Start Spark in every kernel", "bool", "true", "", False),
    "SPARK_MASTER": ("Spark", "Spark master", "str", "local[*]", "local[*] on this machine, or k8s://… / spark://…", False),
    "SPARK_TIMEZONE": ("Spark", "Timezone", "tz", "Asia/Kolkata", "IANA name, e.g. Asia/Kolkata or UTC", False),
    "SPARK_SHUFFLE_PARTITIONS": ("Spark", "Shuffle partitions", "int", "8", "Small number for local mode", False),
    "BASE_PATH": ("Spark", "BASE_PATH", "str", "", "e.g. abfss://container@account.dfs.core.windows.net", False),
    "ADLS_ACCOUNT": ("Storage", "ADLS account", "str", "", "", False),
    "ADLS_KEY": ("Storage", "ADLS account key", "secret", "", "", False),
    "CATALOG_BACKEND": ("Catalog", "Catalog backend", "enum:spark,metastore", "spark", "spark = read via Spark; metastore = read Postgres directly", True),
    "HMS_JDBC_URL": ("Catalog", "Hive metastore JDBC URL", "jdbc", "", "jdbc:postgresql://localhost:5433/hive_metastore", False),
    "HMS_USER": ("Catalog", "Metastore user", "str", "hive", "", False),
    "HMS_PASSWORD": ("Catalog", "Metastore password", "secret", "", "", False),
    "HMS_AUTO_CREATE": ("Catalog", "Auto-create metastore tables", "bool", "false", "Keep false once the schema exists", False),
    "METASTORE_DSN": ("Catalog", "Metastore DSN (metastore backend)", "secret", "", "postgresql://user:pass@host:5433/hive_metastore", True),
    "AIRFLOW_URL": ("Airflow", "Airflow URL", "url", "", "http://localhost:8080 (empty = off)", True),
    "AIRFLOW_DAGS_MODE": ("Airflow", "How DAGs are deployed", "enum:folder,git", "folder", "folder = write into the DAGs folder Airflow reads · git = commit & push for git-sync", True),
    "AIRFLOW_DAGS_DIR": ("Airflow", "DAGs folder (or git clone)", "str", "./dags", "Folder Airflow reads, or your local clone of the DAG repo", True),
    "AIRFLOW_DAGS_GIT_BRANCH": ("Airflow", "Git branch (git mode)", "str", "main", "Branch that Airflow's git-sync pulls", True),
    "AIRFLOW_DAGS_GIT_SUBDIR": ("Airflow", "Sub-folder inside the repo (git mode)", "str", "", "e.g. dags — leave empty if DAGs are at the repo root", True),
    "AIRFLOW_API_VERSION": ("Airflow", "API version", "enum:v2,v1", "v2", "v2 = Airflow 3, v1 = Airflow 2", True),
    "AIRFLOW_USER": ("Airflow", "User", "str", "admin", "", True),
    "AIRFLOW_PASSWORD": ("Airflow", "Password", "secret", "", "", True),
    "K8S_ENABLED": ("Kubernetes", "Show Spark Operator apps", "bool", "false", "", True),
    "SPARK_NAMESPACE": ("Kubernetes", "Spark namespace", "str", "spark", "", True),
    "DORA_BASE_URL": ("Dora (AI)", "Model endpoint", "url", "http://localhost:11434/v1", "Ollama, Groq, Gemini or OpenRouter (OpenAI-compatible)", True),
    "DORA_MODEL": ("Dora (AI)", "Model", "str", "qwen2.5-coder:7b", "", True),
    "DORA_API_KEY": ("Dora (AI)", "API key (cloud only)", "secret", "", "", True),
}


def _validate(key, value):
    if key not in SCHEMA or value in (None, ""):
        return None
    t = SCHEMA[key][2]
    v = str(value).strip()
    if t == "bool" and v.lower() not in ("true", "false"):
        return "must be true or false"
    if t == "int" and not re.fullmatch(r"-?\d+", v):
        return "must be a whole number"
    if t.startswith("enum:") and v not in t[5:].split(","):
        return f"must be one of {t[5:].replace(',', ', ')}"
    if t == "tz":
        try:
            ZoneInfo(v)
        except Exception:  # noqa: BLE001
            return "unknown timezone (use e.g. Asia/Kolkata or UTC)"
    if t == "jdbc" and not re.fullmatch(r"jdbc:postgresql://[^/:\s]+:\d+/\w+(\?.*)?", v):
        return "expected jdbc:postgresql://host:port/database"
    if t == "url" and not re.match(r"https?://", v):
        return "must start with http:// or https://"
    if v != value or re.search(r"\s", v) and t not in ("str", "path"):
        return "contains stray spaces"
    return None


def _read_env_file():
    lines = ENV_PATH.read_text(encoding="utf-8").splitlines() if ENV_PATH.exists() else []
    vals = {}
    for ln in lines:
        m = re.match(r"^\s*([A-Z0-9_]+)\s*=(.*)$", ln)
        if m:
            vals[m.group(1)] = m.group(2).strip()
    return lines, vals


def get_settings():
    _, vals = _read_env_file()
    out = []
    for key, (group, label, t, default, help_, restart) in SCHEMA.items():
        file_key = f"{key}_FILE"
        via_file = file_key in vals and key not in vals
        raw = vals.get(key, "")
        value = MASK if (t == "secret" and (raw or via_file)) else raw
        out.append({"key": key, "group": group, "label": label, "type": t, "default": default, "help": help_,
                    "restart": restart, "value": value, "from_file": vals.get(file_key) if via_file else None,
                    "error": _validate(key, raw) if raw else None})
    extra = {k: v for k, v in vals.items() if k not in SCHEMA and not k.endswith("_FILE")}
    return {"settings": out, "other_keys": sorted(extra), "env_path": str(ENV_PATH)}


def save_settings(values: dict):
    errors = {k: e for k, v in values.items() if k in SCHEMA and v != MASK and (e := _validate(k, v))}
    if errors:
        raise HTTPException(400, "; ".join(f"{k}: {e}" for k, e in errors.items()))
    lines, current = _read_env_file()
    changed = []
    for k, v in values.items():
        if k not in SCHEMA or v == MASK:
            continue
        v = "" if v is None else str(v).strip()
        if current.get(k, None) == v:
            continue
        changed.append(k)
        pat = re.compile(rf"^\s*{re.escape(k)}\s*=")
        for i, ln in enumerate(lines):
            if pat.match(ln):
                lines[i] = f"{k}={v}"
                break
        else:
            lines.append(f"{k}={v}")
    if changed:
        backup = ENV_PATH.with_suffix(".env.bak") if ENV_PATH.exists() else None
        if backup:
            shutil.copyfile(ENV_PATH, backup)
        ENV_PATH.write_text("\n".join(lines) + "\n", encoding="ascii", errors="replace")
        for k in changed:  # new kernels inherit the server environment
            os.environ[k] = values[k] if values[k] is not None else ""
            os.environ.pop(f"{k}_FILE", None) if SCHEMA[k][2] == "secret" and values[k] else None
    return {"changed": changed, "restart_needed": [k for k in changed if SCHEMA[k][5]]}


# ------------------------------------------------------------------ health checks
def _check(cid, group, name, status, detail="", fix=""):
    return {"id": cid, "group": group, "name": name, "status": status, "detail": detail, "fix": fix}


def _run(cmd, timeout=6):
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=False)
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except FileNotFoundError:
        return 127, "not found"
    except subprocess.TimeoutExpired:
        return 124, "timed out"


def _ver(pkg):
    try:
        return md.version(pkg)
    except md.PackageNotFoundError:
        return None


def _jdbc_parts(url):
    m = re.match(r"jdbc:postgresql://([^/:]+):(\d+)/(\w+)", url or "")
    return (m.group(1), int(m.group(2)), m.group(3)) if m else None


def env_checks():
    out = []
    _, vals = _read_env_file()
    if not ENV_PATH.exists():
        return [_check("env", "Configuration", ".env file", "fail", f"{ENV_PATH} not found", "copy .env.example .env")]
    bad = [(k, _validate(k, v)) for k, v in vals.items() if _validate(k, v)]
    for k, e in bad:
        out.append(_check(f"env-{k}", "Configuration", f"{k}", "fail", f"value '{vals[k]}' {e}",
                          f"Open Admin › Settings and fix {k} (or edit .env)"))
    for k, v in vals.items():
        if k.endswith("_FILE") and v:
            p = Path(v) if Path(v).is_absolute() else DATA_ROOT / v
            if not p.exists():
                out.append(_check(f"envfile-{k}", "Configuration", k, "fail", f"file {v} does not exist",
                                  f"Create {v} or set {k[:-5]} directly in Admin › Settings"))
    if not out:
        out.append(_check("env", "Configuration", ".env settings", "ok", f"{len(vals)} values, all valid"))
    return out


def runtime_checks():
    out = []
    pv = sys.version_info
    out.append(_check("python", "Runtime", "Python", "ok" if pv < (3, 14) else "warn",
                      f"{platform.python_version()} ({sys.executable})",
                      "" if pv < (3, 14) else "Use Python 3.11–3.13 for PySpark 3.5"))
    code, text = _run(["java", "-version"])
    m = re.search(r'version "(\d+)', text)
    if code != 0 or not m:
        out.append(_check("java", "Runtime", "Java", "fail", "java not found on PATH", "winget install Microsoft.OpenJDK.17"))
    else:
        major = int(m.group(1))
        out.append(_check("java", "Runtime", "Java", "ok" if major in (11, 17) else "warn", f"Java {major}",
                          "" if major in (11, 17) else "Spark 3.5 works best with Java 17: winget install Microsoft.OpenJDK.17"))
    ps, dl = _ver("pyspark"), _ver("delta-spark")
    ok = ps and ps.startswith("3.5") and dl
    out.append(_check("pyspark", "Runtime", "PySpark + Delta", "ok" if ok else "fail", f"pyspark {ps or 'missing'} · delta-spark {dl or 'missing'}",
                      "" if ok else 'pip install "pyspark>=3.5,<3.6" delta-spark==3.1.0'))
    sh = os.environ.get("SPARK_HOME", "")
    if sh and ps and ps not in sh:
        out.append(_check("spark_home", "Runtime", "SPARK_HOME", "warn", f"points to {sh} (not pyspark {ps})",
                          "Remove-Item Env:SPARK_HOME   (run.bat already clears it)"))
    if IS_WIN:
        hh = Path(os.environ.get("HADOOP_HOME") or r"C:\hadoop") / "bin"
        missing = [f for f in ("winutils.exe", "hadoop.dll") if not (hh / f).exists()]
        out.append(_check("winutils", "Runtime", "winutils / hadoop.dll", "fail" if missing else "ok",
                          f"missing in {hh}: {', '.join(missing)}" if missing else str(hh),
                          "Download winutils.exe and hadoop.dll (Hadoop 3.3) into C:\\hadoop\\bin" if missing else ""))
    free = shutil.disk_usage(DATA_ROOT).free / 1e9
    out.append(_check("disk", "Runtime", "Free disk space", "ok" if free > 10 else "warn", f"{free:.1f} GB free",
                      "" if free > 10 else "Free up disk space (Spark and Delta need room)"))
    return out


def metastore_checks():
    out = []
    url = env("HMS_JDBC_URL")
    if not url:
        return [_check("hms", "Catalog", "Hive metastore", "warn", "HMS_JDBC_URL is empty — tables are in-memory and vanish on restart",
                       "Set HMS_JDBC_URL, HMS_USER, HMS_PASSWORD in Admin › Settings")]
    parts = _jdbc_parts(url)
    if not parts:
        return [_check("hms", "Catalog", "Hive metastore", "fail", f"cannot parse {url}", "Fix HMS_JDBC_URL in Admin › Settings")]
    host, port, db = parts
    code, text = (_run(["docker", "ps", "-a", "--filter", "name=databridge-hms", "--format", "{{.Status}}"], 8)
                  if not settings.bundled else (-1, ""))
    if settings.bundled:
        pass                                  # installer ships its own PostgreSQL; no Docker involved
    elif code == 0:
        st = text.strip()
        if not st:
            out.append(_check("docker", "Catalog", "Metastore container", "warn", "no container named databridge-hms",
                              "docker run -d --name databridge-hms --restart unless-stopped -p 5433:5432 -e POSTGRES_USER=hive -e POSTGRES_PASSWORD=hive -e POSTGRES_DB=hive_metastore postgres:15"))
        else:
            up = st.startswith("Up")
            out.append(_check("docker", "Catalog", "Metastore container", "ok" if up else "fail", f"databridge-hms: {st}",
                              "" if up else "docker start databridge-hms"))
    elif code == 127:
        out.append(_check("docker", "Catalog", "Docker", "warn", "docker CLI not found", "Install / start Docker Desktop"))
    else:
        out.append(_check("docker", "Catalog", "Docker", "fail", "Docker is not responding", "Start Docker Desktop and wait until it says Running"))
    try:
        with socket.create_connection((host, port), timeout=3):
            pass
    except OSError as e:
        out.append(_check("hms_port", "Catalog", "Metastore port", "fail", f"{host}:{port} unreachable ({e})",
                          "Restart DataBridge from the Start menu" if settings.bundled else "docker start databridge-hms"))
        return out
    try:
        import psycopg2
        c = psycopg2.connect(host=host, port=port, dbname=db, user=env("HMS_USER", ""), password=env("HMS_PASSWORD", ""), connect_timeout=5)
        try:
            cur = c.cursor()
            try:
                cur.execute('SELECT "SCHEMA_VERSION" FROM "VERSION"')
                ver = cur.fetchone()[0]
            except Exception:  # noqa: BLE001
                c.rollback()
                ver = None
            cur.execute("SELECT count(*), (SELECT setting::int FROM pg_settings WHERE name='max_connections') FROM pg_stat_activity")
            used, mx = cur.fetchone()
        finally:
            c.close()
        out.append(_check("hms_login", "Catalog", "Metastore login", "ok", f"{env('HMS_USER')}@{host}:{port}/{db}"))
        out.append(_check("hms_schema", "Catalog", "Metastore schema", "ok" if ver else "fail",
                          f"Hive schema {ver}" if ver else "Hive tables missing",
                          "" if ver else "Load hive-schema-2.3.0.postgres.sql into the container (see earlier steps)"))
        pct = used / mx if mx else 0
        out.append(_check("hms_conn", "Catalog", "Database connections", "ok" if pct < 0.8 else "warn", f"{used} of {mx} in use",
                          "" if pct < 0.8 else "Stop idle kernels (Compute) or raise max_connections"))
    except Exception as e:  # noqa: BLE001
        msg = str(e).strip().splitlines()[0][:200]
        fix = "Check HMS_USER / HMS_PASSWORD in Admin › Settings" if "password" in msg else "docker restart databridge-hms"
        out.append(_check("hms_login", "Catalog", "Metastore login", "fail", msg, fix))
    jar_dir = Path(os.environ.get("DATABRIDGE_JARS_DIR") or (ROOT / "jars"))
    if env("HMS_JDBC_URL") and not list(jar_dir.glob("postgresql-*.jar")):
        out.append(_check("jdbc_jar", "Catalog", "PostgreSQL JDBC driver", "warn", "jars\\postgresql-*.jar not found yet (downloaded on first Spark start)",
                          "Start a notebook once, or download postgresql-42.7.3.jar into the jars folder"))
    return out


async def service_checks():
    out = []
    from . import assistant
    try:
        st = await asyncio.wait_for(assistant.status(), 6)
        out.append(_check("dora", "Services", "Dora (AI)", "ok" if st.get("ok") else "warn", f"{st.get('model')} · {st.get('base_url')}" if st.get("ok") else st.get("message"),
                          "" if st.get("ok") else ("winget install Ollama.Ollama ; ollama pull " + st.get("model", "")) if st.get("provider") == "ollama" else "Check Dora settings"))
    except Exception as e:  # noqa: BLE001
        out.append(_check("dora", "Services", "Dora (AI)", "warn", str(e)))
    url = (env("AIRFLOW_URL") or "").rstrip("/")
    if url:
        import httpx
        try:
            async with httpx.AsyncClient(timeout=4) as c:
                r = await c.get(f"{url}/api/v2/monitor/health" if env("AIRFLOW_API_VERSION", "v2") == "v2" else f"{url}/health")
            out.append(_check("airflow", "Services", "Airflow", "ok" if r.status_code < 400 else "warn", f"{url} → HTTP {r.status_code}"))
        except Exception as e:  # noqa: BLE001
            out.append(_check("airflow", "Services", "Airflow", "fail", f"{url} unreachable ({type(e).__name__})",
                              "kubectl port-forward svc/airflow-api-server 8080:8080 -n airflow"))
    else:
        out.append(_check("airflow", "Services", "Airflow", "skip", "not configured (optional)"))
    return out


async def spark_deep_check():
    from .kernels import run_sql
    t0 = time.time()
    try:
        res = await asyncio.wait_for(run_sql("SHOW DATABASES", 200), 180)
        return [_check("spark_sql", "Spark", "Spark + catalog query", "ok", f"SHOW DATABASES → {len(res['rows'])} schemas in {time.time() - t0:.1f}s")]
    except Exception as e:  # noqa: BLE001
        msg = getattr(e, "evalue", None) or str(e)
        return [_check("spark_sql", "Spark", "Spark + catalog query", "fail", str(msg)[:300],
                       "Open Admin › Health after fixing the Catalog items above, then Restart kernels")]


def kernel_checks():
    from .kernels import kernels
    out = []
    ks = kernels.list()
    errs = [k for k in ks if k.get("init_status") == "error"]
    for k in errs:
        out.append(_check(f"kernel-{k['id']}", "Spark", f"Kernel “{k['label']}”", "fail", f"Spark failed to start: {k.get('init_message', '')[:200]}",
                          "Fix the issue above, then Compute › Stop all kernels (they restart on next use)"))
    jv = [p for p in _java_procs()]
    orphans = [p for p in jv if p["orphan"]]
    out.append(_check("kernels", "Spark", "Kernels", "ok" if len(ks) < 8 else "warn",
                      f"{len(ks)} running · {len(jv)} Spark JVMs ({sum(p['mb'] for p in jv) / 1024:.1f} GB)",
                      "" if len(ks) < 8 else "Compute › Stop idle kernels"))
    if orphans:
        out.append(_check("orphans", "Spark", "Leftover Spark JVMs", "warn", f"{len(orphans)} java processes not owned by any kernel",
                          "Compute › Kill leftover JVMs"))
    return out


async def health(deep=False):
    loop = asyncio.get_running_loop()
    parts = await asyncio.gather(loop.run_in_executor(None, env_checks), loop.run_in_executor(None, runtime_checks),
                                 loop.run_in_executor(None, metastore_checks), service_checks())
    checks = [c for p in parts for c in p] + kernel_checks()
    if deep:
        checks += await spark_deep_check()
    summary = {s: sum(1 for c in checks if c["status"] == s) for s in ("ok", "warn", "fail", "skip")}
    return {"checks": checks, "summary": summary, "time": time.time()}


# ------------------------------------------------------------------ kernel manager
def _proc_tree_mb(pid):
    try:
        import psutil
        p = psutil.Process(pid)
        procs = [p] + p.children(recursive=True)
        return sum(x.memory_info().rss for x in procs if x.is_running()) / 1e6, [x.pid for x in procs]
    except Exception:  # noqa: BLE001
        return None, []


def _kernel_pid(ks):
    prov = getattr(ks.km, "provisioner", None)
    pid = getattr(prov, "pid", None) or getattr(getattr(prov, "process", None), "pid", None)
    return pid


def _java_procs():
    try:
        import psutil
    except ImportError:
        return []
    from .kernels import kernels
    owned = set()
    for ks in kernels.by_id.values():
        pid = _kernel_pid(ks)
        if pid:
            owned.update(_proc_tree_mb(pid)[1])
    out = []
    for p in psutil.process_iter(["pid", "name", "cmdline", "memory_info"]):
        try:
            name = (p.info["name"] or "").lower()
            cmd = " ".join(p.info["cmdline"] or [])
            if name.startswith("java") and ("pyspark" in cmd or "spark-submit" in cmd or "SparkSubmit" in cmd):
                out.append({"pid": p.pid, "mb": p.info["memory_info"].rss / 1e6, "orphan": p.pid not in owned})
        except Exception:  # noqa: BLE001
            continue
    return out


def kernel_stats():
    from .kernels import kernels
    stats = {}
    for kid, ks in kernels.by_id.items():
        pid = _kernel_pid(ks)
        mb, pids = _proc_tree_mb(pid) if pid else (None, [])
        stats[kid] = {"pid": pid, "memory_mb": round(mb) if mb else None, "processes": len(pids)}
    jv = _java_procs()
    return {"kernels": stats, "java": {"count": len(jv), "orphans": [p["pid"] for p in jv if p["orphan"]],
                                       "memory_mb": round(sum(p["mb"] for p in jv))}}


async def stop_kernels(idle_only=False, idle_minutes=0):
    from .kernels import kernels
    stopped = []
    now = time.time()
    for kid, ks in list(kernels.by_id.items()):
        if ks.busy or ks.kind == "job":
            continue
        if idle_only and now - ks.last_activity < max(1, idle_minutes) * 60:
            continue
        try:
            await kernels.shutdown(kid)
            stopped.append(ks.label)
        except Exception:  # noqa: BLE001
            pass
    return stopped


def kill_orphans():
    import psutil
    killed = []
    for p in _java_procs():
        if p["orphan"]:
            try:
                psutil.Process(p["pid"]).kill()
                killed.append(p["pid"])
            except Exception:  # noqa: BLE001
                pass
    return killed


async def idle_reaper():
    while True:
        await asyncio.sleep(60)
        try:
            minutes = int(env("KERNEL_IDLE_MINUTES", "60") or 0)
            if minutes > 0:
                stopped = await stop_kernels(idle_only=True, idle_minutes=minutes)
                if stopped:
                    print(f"[DataBridge] stopped idle kernels: {', '.join(stopped)}")
        except Exception:  # noqa: BLE001
            pass


# ------------------------------------------------------------------ startup self-check (console)
def startup_report():
    try:
        checks = env_checks() + runtime_checks() + metastore_checks()
    except Exception as e:  # noqa: BLE001
        print(f"[DataBridge] self-check skipped: {e}")
        return
    icon = {"ok": "OK  ", "warn": "WARN", "fail": "FAIL", "skip": "--  "}
    bad = [c for c in checks if c["status"] in ("fail", "warn")]
    print("\n==================== DataBridge self-check ====================")
    for c in checks:
        if c["status"] == "ok":
            print(f"  [{icon['ok']}] {c['name']}: {c['detail']}")
    for c in bad:
        print(f"  [{icon[c['status']]}] {c['name']}: {c['detail']}")
        if c["fix"]:
            print(f"         fix: {c['fix']}")
    print("  All good." if not bad else f"  {len(bad)} issue(s) — details in Admin › System health")
    print("===============================================================\n")
