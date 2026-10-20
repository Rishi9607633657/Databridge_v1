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

from .settings import DATA_ROOT, env as _env


def env(key, default=None):
    """Connector settings: neutral CONNECTORS_* names, older AIRBYTE_* names still honoured."""
    alias = {"AIRBYTE_REPO_URL": "CONNECTORS_REPO_URL", "AIRBYTE_REPO_BRANCH": "CONNECTORS_REPO_BRANCH", "AIRBYTE_CDK_SPEC": "CONNECTORS_RUNNER_SPEC",
             "AIRBYTE_PYTHON_VERSION": "CONNECTORS_PYTHON_VERSION", "AIRBYTE_PYTHON": "CONNECTORS_PYTHON"}.get(key)
    return (_env(alias) if alias else None) or _env(key, default)


def brand():
    return _env("CONNECTORS_BRAND", "DataBridge") or "DataBridge"


_UPSTREAM = re.compile(r"\bair\s?byte(?:'s)?\b", re.I)


def scrub(text):
    """Customer-facing text (spec descriptions, logs, errors) uses your brand, not the upstream project name."""
    if not isinstance(text, str):
        return text
    t = re.sub(r"https?://docs\.airbyte\.(?:com|io)\S*", "the connector documentation", text)
    t = re.sub(r"\bairbyte[-_](cdk|source|protocol)\S*", "connector runtime", t, flags=re.I)
    return _UPSTREAM.sub(brand(), t)


def _scrub_schema(x):
    if isinstance(x, dict):
        ren = {"airbyte_secret": "x_secret", "airbyte_hidden": "x_hidden"}
        return {ren.get(k, k): (scrub(v) if k in ("title", "description", "pattern_descriptor") else _scrub_schema(v)) for k, v in x.items()}
    if isinstance(x, list):
        return [_scrub_schema(v) for v in x]
    return x


def allowed_licenses():
    """CONNECTORS_LICENSES: which connector licences may be used (e.g. 'MIT' when you sell DataBridge as a hosted service)."""
    v = _env("CONNECTORS_LICENSES", "MIT,ELv2") or "MIT,ELv2"
    return {x.strip().lower() for x in v.split(",") if x.strip()}

ROOT = DATA_ROOT / ".stratum" / "airbyte_local"
REPO = ROOT / "repo"
CONN_DIR = REPO / "airbyte-integrations" / "connectors"
CATALOG = ROOT / "catalog.json"
BUILTIN = Path(__file__).resolve().parent / "builtin_connectors"     # DataBridge's own connectors (Toast, Clover, R365…)
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
    return {"built": CATALOG.exists(), "connectors": len(cat or []), "builtins": len(_builtins()),
            "updated": CATALOG.stat().st_mtime if CATALOG.exists() else None,
            "git": bool(shutil.which("git")), "docker": bool(shutil.which("docker")), "cdk_ready": cdk,
            "brand": brand(), "licenses": sorted(allowed_licenses()), "jobs": _jobs,
            "counts": {r: sum(1 for c in cat or [] if c["runtime"] == r) for r in ("manifest", "python", "docker")}}


def build_catalog():
    """Sparse-clone / update the Airbyte repo (connector definitions only, ~50 MB) and index every source connector."""
    import yaml
    job = "build"
    _jobs[job] = {"state": "running", "log": [], "started": time.time()}
    try:
        if not shutil.which("git"):
            raise RuntimeError("Git is required to download the connector library. Install Git for Windows (https://git-scm.com/download/win) and try again.")
        url = env("AIRBYTE_REPO_URL", "https://github.com/airbytehq/airbyte.git")
        branch = env("AIRBYTE_REPO_BRANCH", "master")
        ROOT.mkdir(parents=True, exist_ok=True)
        if not (REPO / ".git").exists():
            _log(job, "Downloading the connector library (definitions only, ~50 MB)…")
            shutil.rmtree(REPO, ignore_errors=True)
            _run(["git", "clone", "--depth", "1", "--filter=blob:none", "--no-checkout", "--branch", branch, url, str(REPO)])
            _run(["git", "sparse-checkout", "init", "--no-cone"], cwd=REPO)
            (REPO / ".git" / "info" / "sparse-checkout").write_text("\n".join(SPARSE) + "\n", encoding="utf-8")
            _log(job, "Unpacking connector definitions and logos…")
            _run(["git", "checkout", branch], cwd=REPO)
        else:
            _log(job, "Updating the connector library…")
            (REPO / ".git" / "info" / "sparse-checkout").write_text("\n".join(SPARSE) + "\n", encoding="utf-8")
            _run(["git", "fetch", "--depth", "1", "origin", branch], cwd=REPO)
            _run(["git", "reset", "--hard", "FETCH_HEAD"], cwd=REPO)
        commit = _run(["git", "rev-parse", "--short", "HEAD"], cwd=REPO).strip()
        out = []
        dirs = sorted(p for p in CONN_DIR.glob("source-*") if (p / "metadata.yaml").exists())
        _log(job, f"Indexing {len(dirs)} connectors (version {commit})…")
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
            if "airbyte" in cid:                       # connectors to the upstream project's own API
                continue
            base = ((md.get("connectorBuildOptions") or {}).get("baseImage") or "")
            out.append({"id": cid, "name": md.get("name") or cid, "runtime": runtime, "dir": d.name,
                        "support": md.get("supportLevel") or "community", "stage": md.get("releaseStage") or "",
                        "subtype": md.get("connectorSubtype") or "api", "version": str(md.get("dockerImageTag") or ""),
                        "image": f"{md.get('dockerRepository')}:{md.get('dockerImageTag')}" if md.get("dockerRepository") else None,
                        "pypi": pypi.get("packageName") if runtime == "python" else None,
                        "cdk": (re.search(r":(\d+\.\d+\.\d+)", base) or [None, None])[1],
                        "components": (d / "components.py").exists(), "icon": (d / "icon.svg").exists(),
                        "license": (md.get("license") or "ELv2").replace("Elv2", "ELv2"),
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


# categories for browsing (id prefixes); anything else falls back to the connector's subtype
CATEGORIES = [
    ("Restaurant, retail & hospitality", "square lightspeed-retail cloudbeds waiteraid 7shifts retailexpress track-pms deputy when-i-work shiftbase"),
    ("E-commerce", "shopify woocommerce adobe-commerce commercetools prestashop squarespace shopwired sharetribe ebay amazon-seller-partner cart judge-me yotpo recharge printify sendowl akeneo klarna trustpilot webflow wordpress"),
    ("Inventory & logistics", "cin7 linnworks katana inflowinventory veeqo picqer shipstation shippo easypost flexport freightview onfleet tplcentral ezofficeinventory fleetio zoho-inventory"),
    ("Payments & billing", "stripe paypal braintree chargebee chargify chargedesk recurly paddle gocardless paystack dwolla plaid revolut nexiopay xsolla revenuecat orb getlago stigg pabbly invoiced invoiceninja zoho-billing zoho-invoice tremendous brex ramp qonto chartmogul churnkey younium"),
    ("Finance & accounting", "quickbooks xero netsuite freshbooks e-conomic visma zoho-books zoho-expense pennylane fastbill kyriba railz free-agent workflowmax you-need-a-budget navan chift"),
    ("CRM & sales", "salesforce hubspot pipedrive zoho-crm zoho-bigin close-com copper freshsales insightly agilecrm capsule-crm nutshell onepagecrm less-annoying-crm salesflare nocrm pipeliner apptivo spotlercrm jobnimbus outreach salesloft gong reply-io persistiq smartreach leadfeeder flowlu dolibarr planhat vitally merge"),
    ("Marketing & ads", "google-ads facebook instagram linkedin tiktok snapchat pinterest twitter reddit bing-ads criteo taboola outbrain amazon-ads apple-search-ads spotify-ads openai-ads mntn mercado-ads awin commission-junction partnerize partnerstack referralhero uppromote google-search-console youtube metricool rd-station marketo pardot"),
    ("Email & messaging", "mailchimp klaviyo sendgrid brevo sendinblue mailgun mailjet mailerlite mailersend campaign-monitor convertkit drip iterable customer-io braze omnisend emailoctopus elasticemail sparkpost postmark tinyemail bigmailer smaily flexmail encharge sendpulse lemlist twilio onesignal tyntec smsmode campayn mailosaur mailtrap mixmax"),
    ("Analytics & product", "google-analytics amplitude mixpanel posthog segment pendo fullstory kissmetrics plausible piwik appsflyer adjust appfigures appfollow app-store-connect vwo statsig launchdarkly split-io configcat unleash chameleon appcues gainsight yandex-metrica looker metabase mode sigma-computing zoho-analytics google-pagespeed linkrunner"),
    ("Support & ITSM", "zendesk freshdesk freshservice freshchat freshcaller intercom help-scout front gorgias dixa drift customerly solarwinds uservoice canny opsgenie pagerduty incident-io firehydrant rootly statuspage instatus ninjaone pylon missive zoho-desk getgist babelforce genesys zonka retently survicate"),
    ("HR, payroll & recruiting", "bamboo-hr hibob greenhouse lever-hiring workable ashby teamtailor recruitee breezy-hr factorial payfit sage-hr keka greythr zenefits employment-hero hoorayhr perk thrive-learning workramp northpass"),
    ("Projects & time tracking", "jira asana monday clickup trello linear notion confluence basecamp wrike teamwork smartsheets airtable coda miro todoist ticktick shortcut productboard aha rocketlane google-tasks microsoft-lists gridly clockify toggl harvest everhour my-hours timely clockodo tempo float productive primetric hubplanner ruddr glassfrog"),
    ("Developer & IT", "github gitlab circleci buildkite harness codefresh sentry bugsnag rollbar datadog grafana pingdom vercel fastly sonar-cloud dockerhub pypi testrail jamf-pro auth0 okta microsoft-entra-id aws-cloudtrail cisco-meraki intruder secoda dbt n8n svix"),
    ("Communication & documents", "slack microsoft-teams discord zoom gmail outlook google-calendar calendly cal-com savvycal ringcentral aircall justcall callrail google-directory dropbox-sign docuseal pandadoc signnow yousign zapsign boldsign papersign typeform jotform surveymonkey google-forms wufoo fillout paperform formbricks survey-sparrow surveycto opinion-stage qualaroo rocket-chat feishu nylas"),
    ("Files & storage", "file sftp s3 gcs azure-blob-storage azure-table google-sheets google-drive microsoft-sharepoint microsoft-onedrive box"),
    ("Events & ticketing", "eventbrite eventee eventzilla humanitix luma ticketmaster tickettailor pretix oveit goldcast"),
    ("AI & ML services", "assemblyai claude clarif-ai hugging-face jina-ai-reader nebius-ai devin-ai cursor dust tavus imagga perigon granola"),
    ("Market & public data", "alpha-vantage alpaca coin finnhub finage finnworlds marketstack polygon stockdata twelve-data yahoo-finance simfin defillama "
                             "exchange-rates open-exchange-rates nasa news gnews newsdata nytimes the-guardian openweather weatherstack openaq openfda us-census "
                             "wikipedia rss aviationstack tmdb tvmaze rentcast cimis open-data-dc recreation watchmode pokeapi scryfall"),
    ("Databases & warehouses", "postgres mysql mssql oracle mongodb bigquery snowflake redshift clickhouse db2 teradata singlestore tidb cockroachdb couchbase dynamodb elasticsearch kafka firebolt firebase convex dremio microsoft-dataverse amazon-sqs"),
]
POPULAR = ("stripe shopify google-sheets hubspot salesforce quickbooks xero zoho-crm google-analytics-data-api google-ads facebook-marketing "
           "zendesk-support freshdesk jira notion airtable slack mailchimp woocommerce amazon-seller-partner zoho-books "
           "toast clover r365 revel square lightspeed-retail 7shifts").split()
HIDDEN = {"e2e-test", "smoke-test", "hardcoded-records"}


def category(c):
    cid = c["id"]
    for name, ids in CATEGORIES:
        for k in ids.split():
            if cid == k or cid.startswith(k + "-") or cid.startswith(k):
                return name
    return {"database": "Databases & warehouses", "file": "Files & storage"}.get(c.get("subtype"), "Other apps")


_bi_cache = {"key": None, "data": []}


def _builtins():
    """Connectors that ship with DataBridge (backend/builtin_connectors/<id>/meta.json + manifest.yaml): always available."""
    dirs = sorted(p for p in BUILTIN.glob("*") if (p / "manifest.yaml").exists() and (p / "meta.json").exists()) if BUILTIN.exists() else []
    key = tuple((d.name, (d / "manifest.yaml").stat().st_mtime, (d / "meta.json").stat().st_mtime) for d in dirs)
    if _bi_cache["key"] != key:
        out = []
        for d in dirs:
            try:
                m = json.loads((d / "meta.json").read_text(encoding="utf-8"))
            except ValueError:
                continue
            out.append({"id": d.name, "name": m.get("name") or d.name, "runtime": "manifest", "path": str(d), "builtin": True,
                        "support": "builtin", "stage": m.get("stage") or "", "subtype": "api", "version": m.get("version") or "1.0.0",
                        "components": (d / "components.py").exists(), "icon": (d / "icon.svg").exists(), "license": "DataBridge",
                        "hosts": m.get("hosts") or [], "suggested": m.get("suggested") or [], "description": m.get("description") or "",
                        "location": m.get("location") or "", "category": m.get("category") or "Other apps",
                        "popular": POPULAR.index(d.name) if d.name in POPULAR else None})
        _bi_cache.update(key=key, data=out)
    return _bi_cache["data"]


def _library():
    if not CATALOG.exists():
        return []
    mt = CATALOG.stat().st_mtime
    if _cat_cache["mtime"] != mt:
        data = [c for c in json.loads(CATALOG.read_text(encoding="utf-8"))["connectors"] if c["id"] not in HIDDEN]
        for c in data:
            c["category"] = category(c)
            c["popular"] = POPULAR.index(c["id"]) if c["id"] in POPULAR else None
        _cat_cache.update(mtime=mt, data=data)
    return _cat_cache["data"]


def catalog(silent=False):
    """Built-in connectors first, then the downloaded library (a built-in wins over a library connector with the same id)."""
    b = _builtins()
    ids = {c["id"] for c in b}
    return b + [c for c in _library() if c["id"] not in ids]


def licensed(c):
    if c.get("builtin"):
        return True
    return (c.get("license") or "ELv2").lower() in allowed_licenses()


def get(cid):
    c = next((x for x in catalog() if x["id"] == cid), None)
    if c and not licensed(c):
        raise HTTPException(403, f"{c['name']} is not enabled under this installation's connector licence policy (Admin › Settings › Connectors).")
    if not c:
        raise HTTPException(404, f"Unknown connector: {cid}")
    return c


def icon_path(cid):
    b = next((c for c in _builtins() if c["id"] == cid), None)
    if b:
        p = Path(b["path"]) / "icon.svg"
        return p if p.exists() else None
    p = CONN_DIR / f"source-{re.sub(r'[^a-z0-9_-]', '', cid.lower())}" / "icon.svg"
    return p if p.exists() else None


def _conn_dir(c):
    return Path(c["path"]) if c.get("builtin") else CONN_DIR / c["dir"]


def _manifest(c):
    import yaml
    return yaml.safe_load((_conn_dir(c) / "manifest.yaml").read_text(encoding="utf-8"))


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
            _log(job, "Installing the connector runtime…")
            _pip(d, spec, upgrade=True)
            (d / ".ready").write_text(spec, encoding="utf-8")
        elif c["runtime"] == "python":
            d = ENVS / c["id"]
            _make_env(d, job)
            pkg = c["pypi"] or f"airbyte-source-{c['id']}"
            _log(job, f"Installing {c['name']} {c['version']}…")
            try:
                _pip(d, f"{pkg}=={c['version']}")
            except RuntimeError:
                _log(job, "That exact version is not available; installing the latest…")
                _pip(d, pkg, upgrade=True)
            (d / ".ready").write_text(pkg, encoding="utf-8")
        else:
            if not shutil.which("docker"):
                raise RuntimeError("This connector needs Docker Desktop. For Postgres, MySQL, SQL Server and Oracle use the built-in database connectors instead.")
            _log(job, f"Downloading the {c['name']} image…")
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
            raise AirbyteError("The connector runtime is not installed yet — click Install on the connector.")
        args += ["--manifest-path", str(_conn_dir(c) / "manifest.yaml")]
        if c["components"]:
            args += ["--components-path", str(_conn_dir(c) / "components.py")]
        return [str(py), "-c", "from airbyte_cdk.cli.source_declarative_manifest import run; run()"] + args
    exe = _venv_bin(ENVS / c["id"], f"source-{c['id']}")
    if not exe.exists():
        raise AirbyteError(f"{c['name']} is not installed yet — click Install on the connector.")
    return [str(exe)] + args


def run(c, cmd, config=None, catalog_=None, state=None, on_record=None, limit=None, timeout=None, on_state=None):
    """Run spec/check/discover/read. Returns {spec|status|catalog, states, logs, records(count)}. on_record(stream, data),
    on_state(state) at each checkpoint the connector emits (an exception from a callback stops the connector)."""
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
                    if on_state:
                        on_state(m["state"])
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
        except BaseException:
            p.kill()                       # a callback failed (e.g. a checkpoint load): stop the connector, report the error
            raise
        finally:
            try:
                p.wait(timeout=30)
            except subprocess.TimeoutExpired:
                p.kill()
            t_err.join(timeout=5)
        if p.returncode not in (0, None) and not killed and not out["records"] and not out.get("catalog") and not out.get("status") and not out.get("spec"):
            msg = (out["errors"] or [""])[-1] or "\n".join(err_lines[-15:]) or "\n".join(out["logs"][-10:])
            raise AirbyteError(scrub(f"{c['name']} {cmd} failed: {msg[-2000:]}"))
        if out["errors"] and cmd == "read" and not out["records"]:
            raise AirbyteError(scrub(f"{c['name']}: {out['errors'][-1]}"))
        return out


# ---------------- spec / config ----------------
def spec(cid):
    c = get(cid)
    if c["runtime"] == "manifest":
        m = _manifest(c)
        s = (m.get("spec") or {})
        return {"connector": c, "schema": _scrub_schema(s.get("connection_specification") or {}), "docs": _docs(c), "ready": runtime_ready(c)}
    if not runtime_ready(c):
        return {"connector": c, "schema": None, "ready": False}
    sp = (run(c, "spec").get("spec") or {})
    return {"connector": c, "schema": _scrub_schema(sp.get("connectionSpecification") or {}), "docs": _docs(c), "ready": True}


def _docs(c):
    """Documentation links point upstream; hidden unless CONNECTORS_SHOW_DOCS=true."""
    return c.get("docs") if (_env("CONNECTORS_SHOW_DOCS", "false") or "").lower() == "true" else None


def _secret_keys(schema, acc=None):
    acc = set() if acc is None else acc
    if isinstance(schema, dict):
        for k, v in (schema.get("properties") or {}).items():
            if isinstance(v, dict) and (v.get("airbyte_secret") or v.get("x_secret")):
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
    return {"connector": cid, "values": _fix_dates(_walk_unmask(vals, (old or {}).get("values") or {}), _schema_for(cid))}


_DATE_IN = re.compile(r"^(\d{4}-\d{2}(?:-\d{2})?)(?:[T ](\d{2}:\d{2})(?::(\d{2}))?(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$")


def _fix_dates(vals, schema):
    """Dates typed in another format (2025-03-20) are rewritten to what the connector's pattern expects (2025-03-20T00:00:00Z)."""
    if not isinstance(vals, dict) or not isinstance(schema, dict):
        return vals
    props = schema.get("properties") or {}
    out = dict(vals)
    for k, v in vals.items():
        p = props.get(k) or {}
        if isinstance(v, dict):
            subs = [p] + list(p.get("oneOf") or [])
            for sub in subs:
                if isinstance(sub, dict) and sub.get("properties"):
                    out[k] = _fix_dates(v, sub)
            continue
        pat = p.get("pattern") if isinstance(p, dict) else None
        if not isinstance(v, str) or not pat:
            continue
        try:
            rx = re.compile(pat)
        except re.error:
            continue
        m = _DATE_IN.match(v.strip())
        if rx.search(v) or not m:
            continue
        d, hm, sec = m.group(1), m.group(2) or "00:00", m.group(3) or "00"
        t = f"{hm}:{sec}"
        for cand in (f"{d}T{t}Z", f"{d}T{t}.000Z", f"{d}T{t}", f"{d} {t}", d[:10], d[:7]):
            if rx.search(cand):
                out[k] = cand
                break
    return out


# ---------------- check / discover / read ----------------
_disc = {}           # key -> (time, catalog)


def check(cfg):
    c = get(cfg["connector"])
    cfg = {**cfg, "values": _fix_dates(cfg.get("values") or {}, _schema_for(c["id"]))}
    try:
        r = run(c, "check", cfg.get("values") or {}, timeout=300)
    except AirbyteError as e:
        raise HTTPException(400, str(e))
    st = r.get("status") or {}
    if st.get("status") != "SUCCEEDED":
        raise HTTPException(400, scrub(f"{c['name']}: {st.get('message') or (r['errors'] or ['check failed'])[-1]}"))
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


def read(cfg, stream_name, mode, cursor, keys, prev_state, on_record, limit=None, key=None, on_state=None):
    """Read one stream. prev_state: list of AirbyteStateMessage from the last successful run (incremental).
    on_state(states): called at every checkpoint of an incremental read with the state to resume from."""
    c = get(cfg["connector"])
    cfg = {**cfg, "values": _fix_dates(cfg.get("values") or {}, _schema_for(c["id"]))}
    cat = discover(cfg, key)
    stream = next((s for s in cat["streams"] if s["name"] == stream_name), None)
    if not stream:
        raise HTTPException(400, f"{c['name']} has no stream named {stream_name!r} (any more)")
    cc, inc = configured_catalog(stream, mode, cursor, keys)
    # keep the latest state message per stream (or the global one)
    latest = {}

    def _keep(s):
        k = s.get("type") == "STREAM" and json.dumps((s.get("stream") or {}).get("stream_descriptor") or {}, sort_keys=True) or s.get("type") or "LEGACY"
        latest[k] = s
        if on_state and inc:
            on_state(list(latest.values()))
    try:
        r = run(c, "read", cfg.get("values") or {}, cc, prev_state if (inc and prev_state) else None, on_record=on_record, limit=limit, on_state=_keep)
    except AirbyteError as e:
        raise HTTPException(400, str(e))
    return {"records": r["records"], "state": list(latest.values()) if inc else None, "incremental": inc, "logs": [scrub(x) for x in r["logs"][-20:]]}


NOTICE = """Third-party software used by the connector library

Connector definitions (metadata, manifests, components) are downloaded at install time from the
open-source repository configured in CONNECTORS_REPO_URL and are © their respective authors.
Each connector carries its own licence (shown on the connector): most are licensed under the
Elastic License 2.0 (ELv2) and some under the MIT License. The connector runtime (python package
"airbyte-cdk") is licensed under the MIT License. Licence texts are in the downloaded library
under .stratum/airbyte_local/repo and on each package's PyPI page. Trademarks belong to their owners.

Built-in connectors (Toast, Clover, Restaurant365, Revel) are part of DataBridge and need no library download."""


def notices():
    cat = _library()
    from collections import Counter
    return {"text": NOTICE, "licenses": dict(Counter(c.get("license") or "ELv2" for c in cat)), "allowed": sorted(allowed_licenses())}
