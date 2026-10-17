"""Feature flags controlled from the Super Admin portal.

Resolution (most specific wins): user override > role setting > global setting > default (on).
super_admin always has every feature. Disabled features are blocked in the API (middleware) and hidden in the UI."""
import json
import re
import threading

from fastapi import HTTPException

from .settings import DATA_ROOT

STORE = DATA_ROOT / ".stratum" / "features.json"
_lock = threading.Lock()

# key, label, group, description, API path patterns (regex) blocked when off
REGISTRY = [
    ("notebooks", "Notebooks", "Develop", "Create, open and run notebooks", [r"^/api/notebook(/|$|\?)", r"^/api/notebook-runs"]),
    ("sql_editor", "SQL editor", "Develop", "Run SQL queries in the SQL editor", [r"^/api/sql(/|$)"]),
    ("git", "Git folders", "Develop", "Clone repos, branches, commit & push", [r"^/api/git/"]),
    ("ai_assistant", "Dora AI assistant", "Develop", "Dora, Fix with Dora, Ask AI chat", [r"^/api/dora/"]),
    ("catalog", "Catalog", "Data", "Browse schemas and tables, sample data, EDA", [r"^/api/catalog/"]),
    ("data_hub", "Data Hub", "Data", "Import CSV / Excel files into tables", [r"^/api/datahub/"]),
    ("ai_agent", "AI Agent", "AI", "Agent that explores data, builds Silver/Gold tables and fixes syncs (writes need approval)", [r"^/api/agent/"]),
    ("airbyte", "Connectors (Airbyte)", "Data", "Databases, SaaS apps, SFTP and syncs via Airbyte", [r"^/api/airbyte/"]),
    ("delta_maintenance", "Delta maintenance", "Data", "OPTIMIZE, VACUUM, RESTORE, table settings", [r"^/api/catalog/databases/[^/]+/tables/[^/]+/delta/action$"]),
    ("jobs", "Jobs", "Orchestrate", "Create and run jobs, notebook runs", [r"^/api/jobs", r"^/api/runs"]),
    ("airflow", "Airflow", "Orchestrate", "Airflow DAGs, DAG studio, Airflow UI", [r"^/api/workflows", r"^/api/airflow-studio"]),
    ("pipelines", "Pipelines", "Orchestrate", "Visual pipelines, monitor, linked services", [r"^/api/pipelines", r"^/api/pipeline-runs", r"^/api/linked-services"]),
    ("compute", "Compute", "Orchestrate", "Spark applications on Kubernetes", [r"^/api/compute"]),
    ("dashboards", "Dashboards", "Analyze", "View and edit dashboards", [r"^/api/dashboards", r"^/api/dashboard-themes"]),
    ("dashboards_ai", "Build dashboard with AI", "Analyze", "AI dashboard builder", [r"^/api/dashboards/ai/"]),
    ("dashboards_present", "Present with AI", "Analyze", "AI slide presentation of a dashboard", [r"^/api/dashboards/[^/]+/story$", r"^/api/tts"]),
    ("logs", "Logs", "Operate", "Server, Spark, job and pipeline logs", [r"^/api/logs"]),
]
KEYS = [r[0] for r in REGISTRY]
_PATTERNS = [(k, [re.compile(p) for p in pats]) for k, _, _, _, pats in REGISTRY]
ROLES_SCOPED = ("admin", "editor", "viewer")


def _load():
    try:
        d = json.loads(STORE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        d = {}
    return {"global": d.get("global") or {}, "roles": d.get("roles") or {}, "users": d.get("users") or {}}


def _save(d):
    STORE.parent.mkdir(parents=True, exist_ok=True)
    tmp = STORE.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, indent=1), encoding="utf-8")
    tmp.replace(STORE)


def effective(user):
    """{feature_key: bool} for this user."""
    if user is None or user.get("role") == "super_admin" or user.get("id") == "__service__":
        return {k: True for k in KEYS}
    d = _load()
    role_cfg = d["roles"].get(user.get("role"), {})
    user_cfg = d["users"].get(user.get("username"), {})
    out = {}
    for k in KEYS:
        v = True
        if k in d["global"]:
            v = bool(d["global"][k])
        if k in role_cfg:
            v = bool(role_cfg[k])
        if k in user_cfg:
            v = bool(user_cfg[k])
        out[k] = v
    # a sub-feature cannot be on when its parent is off
    for child, parent in (("dashboards_ai", "dashboards"), ("dashboards_present", "dashboards"), ("delta_maintenance", "catalog"), ("airbyte", "data_hub")):
        if not out[parent]:
            out[child] = False
    return out


def blocked(user, path):
    """Feature key that blocks this API path for this user, or None."""
    if user is None or user.get("role") == "super_admin":
        return None
    eff = None
    for k, pats in _PATTERNS:
        if any(p.match(path) for p in pats):
            eff = eff or effective(user)
            if not eff[k]:
                return k
    return None


def label(k):
    return next((r[1] for r in REGISTRY if r[0] == k), k)


def config():
    d = _load()
    return {"features": [{"key": k, "label": l, "group": g, "description": desc} for k, l, g, desc, _ in REGISTRY],
            "role_list": list(ROLES_SCOPED), **d}


def update(body):
    """body: {global:{k:bool|null}, roles:{role:{k:bool|null}}, users:{username:{k:bool|null}}} — null removes the setting."""
    with _lock:
        d = _load()

        def merge(dst, src):
            for k, v in (src or {}).items():
                if k not in KEYS:
                    raise HTTPException(400, f"Unknown feature: {k}")
                if v is None:
                    dst.pop(k, None)
                else:
                    dst[k] = bool(v)

        merge(d["global"], body.get("global"))
        for role, cfg in (body.get("roles") or {}).items():
            if role not in ROLES_SCOPED:
                raise HTTPException(400, f"Unknown role: {role}")
            merge(d["roles"].setdefault(role, {}), cfg)
        for uname, cfg in (body.get("users") or {}).items():
            if not re.fullmatch(r"[A-Za-z0-9._@-]{1,64}", uname or ""):
                raise HTTPException(400, f"Bad username: {uname}")
            merge(d["users"].setdefault(uname, {}), cfg)
            if not d["users"][uname]:
                d["users"].pop(uname)
        d["roles"] = {r: c for r, c in d["roles"].items() if c}
        _save(d)
        return config()
