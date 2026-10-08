"""Airflow DAG studio: write DAG files in DataBridge and deploy them without kubectl.

AIRFLOW_DAGS_MODE=folder  -> files are written into AIRFLOW_DAGS_DIR, which Airflow reads directly
                             (docker-compose / WSL mount, or a shared drive).
AIRFLOW_DAGS_MODE=git     -> AIRFLOW_DAGS_DIR is a git clone; Save & deploy commits and pushes, and Airflow's
                             git-sync (standard in the official Helm chart) pulls it within a minute.
After deploying, Airflow's REST API tells us whether the DAG was parsed or has import errors."""
import ast
import re
import subprocess
import time
from pathlib import Path

from fastapi import HTTPException

from .airflow import af
from .settings import DATA_ROOT, env

NAME_RE = re.compile(r"^[A-Za-z0-9_][\w.-]{0,80}\.py$")


def cfg():
    mode = (env("AIRFLOW_DAGS_MODE", "folder") or "folder").lower()
    d = env("AIRFLOW_DAGS_DIR", "./dags") or "./dags"
    p = Path(d) if Path(d).is_absolute() else DATA_ROOT / d
    return {"mode": mode if mode in ("folder", "git") else "folder", "dir": p.resolve(), "branch": env("AIRFLOW_DAGS_GIT_BRANCH", "main") or "main",
            "subdir": (env("AIRFLOW_DAGS_GIT_SUBDIR", "") or "").strip("/\\"), "url": (env("AIRFLOW_URL", "") or "").rstrip("/")}


def _folder():
    c = cfg()
    f = c["dir"] / c["subdir"] if c["subdir"] else c["dir"]
    f.mkdir(parents=True, exist_ok=True)
    return f


def _path(name):
    if not NAME_RE.match(name or ""):
        raise HTTPException(400, "DAG file names must look like my_dag.py (letters, numbers, _ - .)")
    return _folder() / name


def dag_ids(code):
    ids = re.findall(r"""dag_id\s*=\s*['"]([\w.-]+)['"]""", code)
    ids += re.findall(r"""\bDAG\(\s*['"]([\w.-]+)['"]""", code)
    for m in re.finditer(r"@dag\b[^\n]*\n\s*def\s+(\w+)", code):
        ids.append(m.group(1))
    out = []
    for i in ids:
        if i not in out:
            out.append(i)
    return out


def list_files():
    c = cfg()
    out = []
    for p in sorted(_folder().glob("*.py")):
        try:
            code = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        out.append({"name": p.name, "size": p.stat().st_size, "updated": p.stat().st_mtime, "dag_ids": dag_ids(code)})
    return {"files": out, "mode": c["mode"], "dir": str(_folder()), "airflow_url": c["url"]}


def read(name):
    p = _path(name)
    if not p.exists():
        raise HTTPException(404, "DAG file not found")
    return {"name": name, "code": p.read_text(encoding="utf-8", errors="replace"), "dag_ids": dag_ids(p.read_text(encoding="utf-8", errors="replace"))}


def validate(code):
    problems, warnings = [], []
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return {"ok": False, "problems": [f"Line {e.lineno}: {e.msg}"], "warnings": [], "dag_ids": []}
    text = code
    if "airflow" not in text:
        problems.append("No 'airflow' import found — Airflow only loads files that import airflow.")
    ids = dag_ids(code)
    if not ids:
        problems.append("No DAG found. Use `with DAG(dag_id=\"...\", ...)` or the @dag decorator.")
    if len(set(ids)) != len(ids):
        problems.append("The same dag_id is used twice in this file.")
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and getattr(node.func, "attr", getattr(node.func, "id", "")) in ("sleep",):
            warnings.append(f"Line {node.lineno}: time.sleep at parse time slows the scheduler.")
    if re.search(r"^\s*(requests\.|spark\s*=|SparkSession)", code, re.M):
        warnings.append("Top-level network or Spark calls run every time Airflow parses the file — move them into a task.")
    if "start_date" not in code:
        warnings.append("No start_date — Airflow needs one for scheduled DAGs.")
    return {"ok": not problems, "problems": problems, "warnings": warnings, "dag_ids": ids}


def _git(args, cwd):
    r = subprocess.run(["git", *args], cwd=str(cwd), capture_output=True, text=True, timeout=120)
    return r.returncode, (r.stdout + r.stderr).strip()


def save(name, code, deploy=True, message=""):
    v = validate(code)
    if not v["ok"]:
        raise HTTPException(400, "Fix these first: " + " ".join(v["problems"]))
    p = _path(name)
    p.write_text(code, encoding="utf-8")
    c = cfg()
    out = {"name": name, "dag_ids": v["dag_ids"], "warnings": v["warnings"], "mode": c["mode"], "deployed": False, "log": ""}
    if not deploy:
        return out
    if c["mode"] == "folder":
        out.update(deployed=True, log=f"Written to {p}. Airflow picks it up on its next scan (usually within 30 seconds).")
        return out
    repo = c["dir"]
    if not (repo / ".git").exists():
        raise HTTPException(400, f"{repo} is not a git clone. Clone your DAG repository there, or set AIRFLOW_DAGS_MODE=folder.")
    rel = str(p.relative_to(repo)).replace("\\", "/")
    steps = [["pull", "--rebase", "--autostash", "origin", c["branch"]], ["add", rel],
             ["commit", "-m", message or f"DataBridge: update {name}"], ["push", "origin", f"HEAD:{c['branch']}"]]
    logs = []
    for s in steps:
        code_, txt = _git(s, repo)
        logs.append(f"$ git {' '.join(s)}\n{txt}")
        if code_ != 0 and not (s[0] == "commit" and "nothing to commit" in txt):
            raise HTTPException(502, "Git deploy failed:\n" + "\n".join(logs)[-2000:])
    out.update(deployed=True, log="\n".join(logs)[-3000:] + "\nPushed. git-sync in Airflow pulls it within about a minute.")
    return out


def delete(name):
    p = _path(name)
    if p.exists():
        p.unlink()
    c = cfg()
    if c["mode"] == "git" and (c["dir"] / ".git").exists():
        rel = str(p.relative_to(c["dir"])).replace("\\", "/")
        for s in (["rm", "--cached", "--ignore-unmatch", rel], ["commit", "-m", f"DataBridge: remove {name}"], ["push", "origin", f"HEAD:{c['branch']}"]):
            _git(s, c["dir"])
    return {"ok": True}


async def status(name):
    """Is the DAG in Airflow yet? Any import errors for this file?"""
    p = _path(name)
    ids = dag_ids(p.read_text(encoding="utf-8", errors="replace")) if p.exists() else []
    out = {"name": name, "dags": [], "import_errors": [], "airflow": bool(af.enabled), "checked": time.time()}
    if not af.enabled:
        return out
    try:
        errs = await af.json("GET", "/importErrors", params={"limit": 100})
        for e in errs.get("import_errors", []):
            if str(e.get("filename", "")).replace("\\", "/").endswith("/" + name) or str(e.get("filename", "")).endswith(name):
                out["import_errors"].append(str(e.get("stack_trace") or e.get("stacktrace") or "")[-3000:])
    except HTTPException as e:
        out["error"] = str(e.detail)[:300]
    for i in ids:
        try:
            d = await af.json("GET", f"/dags/{i}")
            out["dags"].append({"dag_id": i, "found": True, "paused": d.get("is_paused"), "last_parsed": d.get("last_parsed_time")})
        except HTTPException:
            out["dags"].append({"dag_id": i, "found": False})
    return out


async def embed_check():
    """Can the Airflow UI be shown inside DataBridge? Reads Airflow's security headers server-side."""
    import httpx
    url = cfg()["url"]
    if not url:
        return {"url": "", "embeddable": False, "reason": "AIRFLOW_URL is not set."}
    try:
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as c:
            r = await c.get(url)
    except Exception as e:  # noqa: BLE001
        return {"url": url, "embeddable": False, "reachable": False, "reason": f"DataBridge cannot reach Airflow at {url} ({type(e).__name__})."}
    xfo = (r.headers.get("x-frame-options") or "").strip()
    csp = r.headers.get("content-security-policy") or ""
    fa = next((p.strip() for p in csp.split(";") if p.strip().lower().startswith("frame-ancestors")), "")
    blocked, why = False, ""
    if xfo.upper() in ("DENY", "SAMEORIGIN"):
        blocked, why = True, f"Airflow sends “X-Frame-Options: {xfo}”, so browsers refuse to show it inside another site."
    if fa and "*" not in fa:
        blocked, why = True, f"Airflow sends “Content-Security-Policy: {fa}”, so browsers refuse to show it inside another site."
    return {"url": url, "embeddable": not blocked, "reachable": True, "reason": why, "status": r.status_code}


TEMPLATES = {
    "notebook_job": ("Run a DataBridge job daily", '''"""Runs a DataBridge job every day and fails the DAG if the job fails."""
from datetime import datetime, timedelta
import time, requests
try:                                    # Airflow 3
    from airflow.sdk import DAG
    from airflow.providers.standard.operators.python import PythonOperator
except ImportError:                     # Airflow 2
    from airflow import DAG
    from airflow.operators.python import PythonOperator

DATABRIDGE = "http://host.docker.internal:8800"     # where Airflow can reach DataBridge
TOKEN = "dbt_your_api_token"                        # Admin › Users › API tokens
JOB_ID = "your_job_id"                              # from the job's URL in DataBridge

def run_job():
    h = {"Authorization": f"Bearer {TOKEN}"}
    run = requests.post(f"{DATABRIDGE}/api/jobs/{JOB_ID}/run", headers=h, timeout=30).json()
    while True:
        r = requests.get(f"{DATABRIDGE}/api/runs/{run['id']}", headers=h, timeout=30).json()
        if r["state"] in ("succeeded", "failed", "canceled", "timed_out"):
            if r["state"] != "succeeded":
                raise RuntimeError(f"DataBridge run {run['id']} {r['state']}: {r.get('message')}")
            return r["state"]
        time.sleep(15)

with DAG(
    dag_id="databridge_daily_job",
    start_date=datetime(2026, 1, 1),
    schedule="0 2 * * *",
    catchup=False,
    default_args={"retries": 1, "retry_delay": timedelta(minutes=5)},
    tags=["databridge"],
) as dag:
    PythonOperator(task_id="run_databridge_job", python_callable=run_job)
'''),
    "python_etl": ("Python ETL (extract → transform → load)", '''from datetime import datetime
try:                                    # Airflow 3
    from airflow.sdk import dag, task
except ImportError:                     # Airflow 2
    from airflow.decorators import dag, task

@dag(start_date=datetime(2026, 1, 1), schedule="@daily", catchup=False, tags=["etl"])
def daily_etl():
    @task
    def extract():
        return [{"id": 1, "amount": 120.5}, {"id": 2, "amount": 80.0}]

    @task
    def transform(rows):
        return [{**r, "amount_with_tax": round(r["amount"] * 1.18, 2)} for r in rows]

    @task
    def load(rows):
        print(f"Loaded {len(rows)} rows")

    load(transform(extract()))

daily_etl()
'''),
    "spark_k8s": ("Spark job on Kubernetes (Spark Operator)", '''from datetime import datetime
try:                                    # Airflow 3
    from airflow.sdk import DAG
except ImportError:                     # Airflow 2
    from airflow import DAG
from airflow.providers.cncf.kubernetes.operators.spark_kubernetes import SparkKubernetesOperator

with DAG(
    dag_id="spark_daily_on_k8s",
    start_date=datetime(2026, 1, 1),
    schedule="0 3 * * *",
    catchup=False,
    tags=["spark", "kubernetes"],
) as dag:
    SparkKubernetesOperator(
        task_id="run_spark_app",
        namespace="spark",
        application_file="spark-apps/daily-etl.yaml",   # SparkApplication manifest next to this DAG
        kubernetes_conn_id="kubernetes_default",
    )
'''),
    "blank": ("Blank DAG", '''from datetime import datetime
try:                                    # Airflow 3
    from airflow.sdk import DAG
    from airflow.providers.standard.operators.empty import EmptyOperator
except ImportError:                     # Airflow 2
    from airflow import DAG
    from airflow.operators.empty import EmptyOperator

with DAG(dag_id="my_new_dag", start_date=datetime(2026, 1, 1), schedule=None, catchup=False) as dag:
    EmptyOperator(task_id="start")
'''),
}
