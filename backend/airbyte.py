"""Data Hub › Connectors: Airbyte OSS behind DataBridge's own UI.

Talks to the Airbyte Public API (abctl install: http://localhost:8000/api/public/v1) with an application
client id/secret -> bearer token. Settings: AIRBYTE_URL, AIRBYTE_CLIENT_ID, AIRBYTE_CLIENT_SECRET (Admin › Settings)."""
import asyncio
import time

import httpx
from fastapi import HTTPException

from .settings import env

# curated connector templates shown in "New source" / "New destination" (configuration is sent as-is)
SOURCE_TEMPLATES = {
    "postgres": {"label": "PostgreSQL", "config": {"host": "", "port": 5432, "database": "", "schemas": ["public"], "username": "", "password": "",
                                                   "ssl_mode": {"mode": "prefer"}, "replication_method": {"method": "Standard"}, "tunnel_method": {"tunnel_method": "NO_TUNNEL"}}},
    "mysql": {"label": "MySQL", "config": {"host": "", "port": 3306, "database": "", "username": "", "password": "",
                                           "replication_method": {"method": "STANDARD"}, "tunnel_method": {"tunnel_method": "NO_TUNNEL"}}},
    "mssql": {"label": "SQL Server", "config": {"host": "", "port": 1433, "database": "", "schemas": ["dbo"], "username": "", "password": "",
                                                "replication_method": {"method": "STANDARD"}, "tunnel_method": {"tunnel_method": "NO_TUNNEL"}}},
    "oracle": {"label": "Oracle", "config": {"host": "", "port": 1521, "connection_data": {"connection_type": "service_name", "service_name": ""},
                                             "username": "", "password": "", "schemas": [], "encryption": {"encryption_method": "unencrypted"},
                                             "tunnel_method": {"tunnel_method": "NO_TUNNEL"}}},
    "mongodb-v2": {"label": "MongoDB", "config": {"database_config": {"cluster_type": "SELF_MANAGED_REPLICA_SET", "connection_string": "mongodb://host:27017",
                                                                     "database": "", "username": "", "password": ""}}},
    "sftp-bulk": {"label": "SFTP (files)", "config": {"host": "", "port": 22, "username": "", "credentials": {"auth_type": "password", "password": ""},
                                                      "folder_path": "/", "streams": [{"name": "files", "globs": ["*.csv"], "format": {"filetype": "csv"}}]}},
    "s3": {"label": "Amazon S3 (files)", "config": {"bucket": "", "aws_access_key_id": "", "aws_secret_access_key": "",
                                                   "streams": [{"name": "files", "globs": ["**/*.csv"], "format": {"filetype": "csv"}}]}},
    "google-sheets": {"label": "Google Sheets", "config": {"spreadsheet_id": "https://docs.google.com/spreadsheets/d/…",
                                                           "credentials": {"auth_type": "Service", "service_account_info": "{…json key…}"}}},
    "salesforce": {"label": "Salesforce", "config": {"client_id": "", "client_secret": "", "refresh_token": "", "start_date": "2024-01-01T00:00:00Z"}},
    "hubspot": {"label": "HubSpot", "config": {"credentials": {"credentials_title": "Private App Credentials", "access_token": ""}, "start_date": "2024-01-01T00:00:00Z"}},
    "shopify": {"label": "Shopify", "config": {"shop": "", "credentials": {"auth_method": "api_password", "api_password": ""}, "start_date": "2024-01-01"}},
    "stripe": {"label": "Stripe", "config": {"account_id": "", "client_secret": "", "start_date": "2024-01-01T00:00:00Z"}},
    "razorpay": {"label": "Razorpay", "config": {"key_id": "", "key_secret": "", "start_date": "2024-01-01T00:00:00Z"}},
}
DEST_TEMPLATES = {
    "postgres": {"label": "PostgreSQL", "config": {"host": "", "port": 5432, "database": "", "schema": "airbyte_raw", "username": "", "password": "",
                                                   "ssl_mode": {"mode": "disable"}, "tunnel_method": {"tunnel_method": "NO_TUNNEL"}}},
    "s3": {"label": "Amazon S3 / MinIO (Parquet)", "config": {"s3_bucket_name": "", "s3_bucket_path": "airbyte", "s3_bucket_region": "ap-south-1",
                                                              "access_key_id": "", "secret_access_key": "", "s3_endpoint": "",
                                                              "format": {"format_type": "Parquet"}}},
    "bigquery": {"label": "BigQuery", "config": {"project_id": "", "dataset_location": "asia-south1", "dataset_id": "", "credentials_json": "{…}"}},
    "snowflake": {"label": "Snowflake", "config": {"host": "", "role": "", "warehouse": "", "database": "", "schema": "", "username": "",
                                                   "credentials": {"auth_type": "Username and Password", "password": ""}}},
}


class Airbyte:
    def __init__(self):
        self._tok, self._tok_at, self._tok_key = None, 0, None

    @property
    def base(self):
        return (env("AIRBYTE_URL") or "").rstrip("/")

    @property
    def ui_url(self):
        return (env("AIRBYTE_UI_URL") or self.base).rstrip("/")

    def status(self):
        return {"configured": bool(self.base and env("AIRBYTE_CLIENT_ID") and env("AIRBYTE_CLIENT_SECRET")),
                "url": self.base, "ui_url": self.ui_url}

    async def _token(self, c):
        cid, sec = env("AIRBYTE_CLIENT_ID"), env("AIRBYTE_CLIENT_SECRET")
        if not (self.base and cid and sec):
            raise HTTPException(503, "Airbyte is not connected. Set AIRBYTE_URL, AIRBYTE_CLIENT_ID and AIRBYTE_CLIENT_SECRET in Admin › Settings.")
        key = (self.base, cid, sec)
        if self._tok and self._tok_key == key and time.time() - self._tok_at < 120:
            return self._tok
        r = await c.post(f"{self.base}/api/v1/applications/token",
                         json={"client_id": cid, "client_secret": sec, "grant-type": "client_credentials"})
        if r.status_code >= 400:
            raise HTTPException(502, f"Airbyte login failed ({r.status_code}). Check the client id/secret. {r.text[:200]}")
        self._tok, self._tok_at, self._tok_key = r.json()["access_token"], time.time(), key
        return self._tok

    def _client(self):
        """One shared HTTP client (keep-alive): no new TCP connection per Airbyte call."""
        c = getattr(self, "_http", None)
        if c is None or c.is_closed:
            c = self._http = httpx.AsyncClient(timeout=httpx.Timeout(60, connect=5),
                                               limits=httpx.Limits(max_connections=20, max_keepalive_connections=10))
        return c

    async def call(self, method, path, **kw):
        c = self._client()
        try:
            for attempt in range(2):
                tok = await self._token(c)
                r = await c.request(method, f"{self.base}/api/public/v1{path}",
                                    headers={"Authorization": f"Bearer {tok}", "Accept": "application/json"}, **kw)
                if r.status_code == 401 and attempt == 0:
                    self._tok = None
                    continue
                break
        except httpx.HTTPError as e:
            raise HTTPException(502, f"Cannot reach Airbyte at {self.base}: {e}")
        if method != "GET":
            self._ov = None                      # something changed: next overview is fresh
        if r.status_code >= 400:
            try:
                j = r.json()
                msg = j.get("detail") or j.get("message") or j.get("title") or r.text
            except ValueError:
                msg = r.text
            raise HTTPException(r.status_code if r.status_code < 500 else 502, f"Airbyte: {str(msg)[:600]}")
        return r.json() if r.content else {}

    async def _list(self, path, **params):
        out, offset = [], 0
        while True:
            j = await self.call("GET", path, params={**params, "limit": 100, "offset": offset})
            data = j.get("data") or []
            out += data
            if len(data) < 100 or offset > 2000:
                return out
            offset += 100

    async def workspace(self):
        key = (self.base, env("AIRBYTE_CLIENT_ID"))
        if getattr(self, "_ws", None) and self._ws[0] == key:
            return self._ws[1]
        ws = await self._list("/workspaces")
        if not ws:
            raise HTTPException(502, "Airbyte has no workspace")
        self._ws = (key, ws[0]["workspaceId"])
        return self._ws[1]

    async def _last_job(self, cid):
        try:
            d = (await self.call("GET", "/jobs", params={"connectionId": cid, "limit": 1, "orderBy": "createdAt|DESC"})).get("data") or []
            return d[0] if d else None
        except HTTPException:
            return None

    async def overview(self, fresh=False):
        ov = getattr(self, "_ov", None)
        if ov and not fresh and time.time() - ov[0] < 4:     # many tabs / quick refreshes share one answer
            return ov[1]
        ws = await self.workspace()
        conns, srcs, dsts = await asyncio.gather(            # in parallel, not one after another
            self._list("/connections", workspaceIds=ws), self._list("/sources", workspaceIds=ws),
            self._list("/destinations", workspaceIds=ws))
        lasts = await asyncio.gather(*[self._last_job(c["connectionId"]) for c in conns])   # newest job only
        sname = {s["sourceId"]: s for s in srcs}
        dname = {d["destinationId"]: d for d in dsts}
        for c, j in zip(conns, lasts):
            c["sourceName"] = (sname.get(c.get("sourceId")) or {}).get("name")
            c["sourceType"] = (sname.get(c.get("sourceId")) or {}).get("sourceType")
            c["destinationName"] = (dname.get(c.get("destinationId")) or {}).get("name")
            c["destinationType"] = (dname.get(c.get("destinationId")) or {}).get("destinationType")
            c["lastJob"] = j
        out = {"workspaceId": ws, "connections": conns, "sources": srcs, "destinations": dsts, "ui_url": self.ui_url}
        self._ov = (time.time(), out)
        return out

    async def jobs(self, connection_id):
        return await self.call("GET", "/jobs", params={"connectionId": connection_id, "limit": 25, "orderBy": "createdAt|DESC"})

    async def run(self, connection_id, job_type="sync"):
        if job_type not in ("sync", "reset", "refresh", "clear"):
            raise HTTPException(400, "Unknown job type")
        return await self.call("POST", "/jobs", json={"connectionId": connection_id, "jobType": job_type})

    async def cancel(self, job_id):
        return await self.call("DELETE", f"/jobs/{int(job_id)}")

    async def set_status(self, connection_id, active: bool):
        return await self.call("PATCH", f"/connections/{connection_id}", json={"status": "active" if active else "inactive"})

    async def create_source(self, body):
        ws = await self.workspace()
        cfg = dict(body.get("configuration") or {})
        cfg["sourceType"] = body.get("type") or cfg.get("sourceType")
        if not body.get("name") or not cfg["sourceType"]:
            raise HTTPException(400, "Name and connector type are required")
        payload = {"name": body["name"], "workspaceId": ws, "configuration": cfg}
        if body.get("definitionId"):
            payload["definitionId"] = body["definitionId"]
        return await self.call("POST", "/sources", json=payload)

    async def create_destination(self, body):
        ws = await self.workspace()
        cfg = dict(body.get("configuration") or {})
        cfg["destinationType"] = body.get("type") or cfg.get("destinationType")
        if not body.get("name") or not cfg["destinationType"]:
            raise HTTPException(400, "Name and connector type are required")
        payload = {"name": body["name"], "workspaceId": ws, "configuration": cfg}
        if body.get("definitionId"):
            payload["definitionId"] = body["definitionId"]
        return await self.call("POST", "/destinations", json=payload)

    async def create_connection(self, body):
        if not body.get("sourceId") or not body.get("destinationId"):
            raise HTTPException(400, "Pick a source and a destination")
        cron = (body.get("cron") or "").strip()
        payload = {"sourceId": body["sourceId"], "destinationId": body["destinationId"], "name": body.get("name") or None,
                   "schedule": {"scheduleType": "cron", "cronExpression": cron} if cron else {"scheduleType": "manual"},
                   "namespaceDefinition": "destination", "prefix": body.get("prefix") or ""}
        return await self.call("POST", "/connections", json={k: v for k, v in payload.items() if v is not None})

    async def delete(self, kind, oid):
        if kind not in ("sources", "destinations", "connections"):
            raise HTTPException(400, "Unknown object")
        return await self.call("DELETE", f"/{kind}/{oid}")


airbyte = Airbyte()


# ---------------- connector catalog (all Airbyte connectors, with logos + setup specs) ----------------
import json as _json
import re as _re
import asyncio as _asyncio
from fastapi.responses import Response as _Response
from .settings import DATA_ROOT as _ROOT

_REG_URL = "https://connectors.airbyte.com/files/registries/v0/oss_registry.json"
_REG_FILE = _ROOT / ".stratum" / "airbyte_registry.json"
_ICON_DIR = _ROOT / ".stratum" / "airbyte_icons"
_REG = {"data": None, "at": 0}
_KIND = {"source": ("sources", "sourceDefinitionId"), "destination": ("destinations", "destinationDefinitionId")}


async def _registry():
    if _REG["data"] and time.time() - _REG["at"] < 86400:
        return _REG["data"]
    data = None
    fresh = _REG_FILE.exists() and time.time() - _REG_FILE.stat().st_mtime < 86400
    if not fresh:
        try:
            async with httpx.AsyncClient(timeout=90, follow_redirects=True) as c:
                r = await c.get(_REG_URL)
            r.raise_for_status()
            data = r.json()
            _REG_FILE.parent.mkdir(parents=True, exist_ok=True)
            _REG_FILE.write_text(_json.dumps(data), encoding="utf-8")
        except Exception:  # noqa: BLE001 - offline: fall back to the cached copy
            data = None
    if data is None and _REG_FILE.exists():
        try:
            data = _json.loads(_REG_FILE.read_text(encoding="utf-8"))
        except ValueError:
            data = None
    if data is None:            # never downloaded and offline: the curated templates only
        data = {"sources": [], "destinations": [], "offline": True}
    _REG.update(data=data, at=time.time())
    return data


def _type_of(entry, kind):
    repo = entry.get("dockerRepository") or ""
    return repo.split("/")[-1].removeprefix(f"{kind}-")


_SLIM = {}      # kind -> catalog answer (built once per registry load)
_SPECS = {}     # (kind, def_id) -> entry


async def connector_catalog(kind):
    if kind not in _KIND:
        raise HTTPException(400, "kind must be source or destination")
    reg = await _registry()
    hit = _SLIM.get(kind)
    if hit and hit[0] is reg:
        return hit[1]
    key, idk = _KIND[kind]
    out = []
    for e in reg.get(key) or []:
        if e.get("tombstone") or e.get("public") is False:
            continue
        t = _type_of(e, kind)
        _SPECS[(kind, e.get(idk))] = e
        out.append({"id": e.get(idk), "name": e.get("name"), "type": t, "category": e.get("sourceType") or ("database" if kind == "destination" else "api"),
                    "support": e.get("supportLevel") or e.get("releaseStage") or "", "docs": e.get("documentationUrl"),
                    "icon": f"/api/airbyte/icons/{kind}/{t}"})
    if not out:                 # offline fallback: curated list
        tpl = SOURCE_TEMPLATES if kind == "source" else DEST_TEMPLATES
        out = [{"id": None, "name": v["label"], "type": k, "category": "database", "support": "", "docs": None,
                "icon": f"/api/airbyte/icons/{kind}/{k}"} for k, v in tpl.items()]
    out.sort(key=lambda x: (0 if x["support"] == "certified" else 1, (x["name"] or "").lower()))
    res = {"connectors": out, "offline": bool(reg.get("offline"))}
    _SLIM[kind] = (reg, res)
    return res


async def connector_spec(kind, def_id):
    if kind not in _KIND:
        raise HTTPException(400, "kind must be source or destination")
    await connector_catalog(kind)                         # builds the index
    e = _SPECS.get((kind, def_id))
    if not e:
        raise HTTPException(404, "Connector not found")
    return {"id": def_id, "name": e.get("name"), "type": _type_of(e, kind), "docs": e.get("documentationUrl"),
            "spec": ((e.get("spec") or {}).get("connectionSpecification")) or {}}


async def preload():
    """Warm the connector catalog in the background at startup (download/parse once)."""
    try:
        await connector_catalog("source")
        await connector_catalog("destination")
    except Exception:  # noqa: BLE001
        pass


_SAFE = _re.compile(r"^[a-z0-9][a-z0-9-]{0,80}$")


_ICON_MEM = {}          # "kind-type" -> svg bytes (or None = no icon)
_ICON_SEM = _asyncio.Semaphore(8)
_ICON_HDR = {"Cache-Control": "public, max-age=604800",
             "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'", "X-Content-Type-Options": "nosniff"}


async def icon(kind, ctype):
    if kind not in _KIND or not _SAFE.match(ctype or ""):
        raise HTTPException(404, "No icon")
    name = f"{kind}-{ctype}"
    if name not in _ICON_MEM:
        f, miss = _ICON_DIR / f"{name}.svg", _ICON_DIR / f"{name}.none"
        if f.exists():
            _ICON_MEM[name] = f.read_bytes()
        elif miss.exists() and time.time() - miss.stat().st_mtime < 7 * 86400:
            _ICON_MEM[name] = None
        else:
            async with _ICON_SEM:
                data = None
                try:
                    r = await airbyte._client().get(f"https://connectors.airbyte.com/files/metadata/airbyte/{name}/latest/icon.svg",
                                                    timeout=8, follow_redirects=True)
                    if r.status_code == 200 and b"<svg" in r.content[:2000].lower():
                        data = r.content
                except httpx.HTTPError:
                    data = None
                _ICON_DIR.mkdir(parents=True, exist_ok=True)
                if data:
                    f.write_bytes(data)
                else:
                    miss.write_text("")                    # remember: no icon (do not ask again for a week)
                _ICON_MEM[name] = data
    data = _ICON_MEM.get(name)
    if not data:
        raise HTTPException(404, "No icon")
    return _Response(data, media_type="image/svg+xml", headers=_ICON_HDR)


# ---------------- land synced data into the DataBridge Catalog ----------------
_LAND_FILE = _ROOT / ".stratum" / "airbyte_landing.json"
_LAND_LOCK = _asyncio.Lock()
_RUNNING = set()


def _land_all():
    try:
        return _json.loads(_LAND_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _land_save(d):
    _LAND_FILE.parent.mkdir(parents=True, exist_ok=True)
    _LAND_FILE.write_text(_json.dumps(d, indent=1), encoding="utf-8")


def _norm(s):
    return _re.sub(r"[^a-z0-9_]", "_", (s or "").lower())


async def landing_get(cid):
    conn = await airbyte.call("GET", f"/connections/{cid}")
    dest = await airbyte.call("GET", f"/destinations/{conn['destinationId']}")
    dcfg = dest.get("configuration") or {}
    streams = [s.get("name") for s in ((conn.get("configurations") or {}).get("streams") or [])]
    cfg = dict(_land_all().get(cid) or {})
    has_pw = bool(cfg.get("password"))
    cfg.pop("password", None)
    host = dcfg.get("host") or "localhost"
    if host in ("host.docker.internal", "172.17.0.1"):
        host = "localhost"                      # Airbyte sees the DB via Docker; DataBridge sees it on this PC
    suggest = {"jdbc_url": f"jdbc:postgresql://{host}:{dcfg.get('port', 5432)}/{dcfg.get('database', '')}",
               "user": dcfg.get("username", ""), "src_schema": dcfg.get("schema") or "public",
               "target_schema": _re.sub(r"_+", "_", _norm("airbyte_" + (conn.get("name") or "sync"))).strip("_")[:60]}
    return {"connection": {"id": cid, "name": conn.get("name"), "prefix": conn.get("prefix") or "", "streams": streams},
            "destinationType": dest.get("destinationType"), "supported": dest.get("destinationType") in ("postgres", None),
            "config": cfg, "has_password": has_pw, "suggest": suggest}


def landing_put(cid, body):
    allowed = {"enabled", "auto", "jdbc_url", "user", "password", "src_schema", "target_schema", "mode", "format", "drop_meta"}
    with_ = {k: v for k, v in (body or {}).items() if k in allowed}
    if with_.get("target_schema") and not _re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]{0,63}", with_["target_schema"]):
        raise HTTPException(400, "Target schema: letters, digits and _ only")
    if with_.get("jdbc_url") and not str(with_["jdbc_url"]).startswith("jdbc:postgresql://"):
        raise HTTPException(400, "Only Postgres destinations can be landed for now (jdbc:postgresql://…)")
    d = _land_all()
    cur = d.get(cid) or {}
    if not with_.get("password"):
        with_.pop("password", None)            # keep the stored password
    cur.update(with_)
    d[cid] = cur
    _land_save(d)
    cur = dict(cur)
    cur.pop("password", None)
    return cur


async def land(cid, job_id=None):
    """Copy the connection's synced tables from the Postgres destination into Delta tables (Catalog)."""
    from .datahub import SAVE_FN, kernel_exec
    cfg = _land_all().get(cid) or {}
    for k in ("jdbc_url", "user", "password", "target_schema", "src_schema"):
        if not cfg.get(k):
            raise HTTPException(400, f"Set up 'Sync to Catalog' first ({k} is missing)")
    if cid in _RUNNING:
        raise HTTPException(409, "Already copying this connection")
    conn = await airbyte.call("GET", f"/connections/{cid}")
    prefix = conn.get("prefix") or ""
    streams = [s.get("name") for s in ((conn.get("configurations") or {}).get("streams") or [])]
    marks = cfg.get("marks") or {}
    spec = {"url": cfg["jdbc_url"], "user": cfg["user"], "password": cfg["password"], "src": cfg["src_schema"],
            "target": cfg["target_schema"], "mode": cfg.get("mode") or "replace", "fmt": cfg.get("format") or "delta",
            "drop_meta": cfg.get("drop_meta", True), "prefix": prefix, "streams": streams, "marks": marks}
    code = SAVE_FN + _LAND_CODE.replace("__SPEC__", repr(_json.dumps(spec)))
    _RUNNING.add(cid)
    _set_run(cid, {"status": "running", "started": time.time(), "job": job_id})
    try:
        res = await kernel_exec(code, "SQL Editor")
        d = _land_all()
        c = d.get(cid) or {}
        c.setdefault("marks", {}).update(res.get("marks") or {})
        c["last_job"] = job_id or c.get("last_job")
        c["last_run"] = {"status": "succeeded", "started": c.get("last_run", {}).get("started"), "ended": time.time(),
                         "tables": res.get("tables") or [], "job": job_id}
        d[cid] = c
        _land_save(d)
        return c["last_run"]
    except Exception as e:  # noqa: BLE001
        msg = getattr(e, "evalue", None) or str(e)
        _set_run(cid, {"status": "failed", "ended": time.time(), "error": str(msg)[:1500], "job": job_id}, keep_job=job_id)
        raise
    finally:
        _RUNNING.discard(cid)


def _set_run(cid, run, keep_job=None):
    d = _land_all()
    c = d.get(cid) or {}
    prev = c.get("last_run") or {}
    c["last_run"] = {**({"started": prev.get("started")} if "started" not in run else {}), **run}
    if keep_job:
        c["last_job"] = keep_job                # do not retry the same failed job forever
    d[cid] = c
    _land_save(d)


def landing_summary():
    out = {}
    for cid, c in _land_all().items():
        run = c.get("last_run")
        if run and run.get("status") == "running" and cid not in _RUNNING:      # server restarted mid-copy
            run = {**run, "status": "failed", "error": "Interrupted (DataBridge was restarted). Press Copy now."}
            c = {**c, "last_run": run}
        out[cid] = {"enabled": c.get("enabled", True), "auto": c.get("auto", False), "target_schema": c.get("target_schema"),
                    "last_run": c.get("last_run"), "running": cid in _RUNNING}
    return out


async def auto_land_loop():
    """Every minute: when a connection with auto-copy has a new successful sync, copy it into the Catalog."""
    while True:
        await _asyncio.sleep(60)
        try:
            if not airbyte.status()["configured"]:
                continue
            for cid, c in list(_land_all().items()):
                if not (c.get("enabled", True) and c.get("auto")) or cid in _RUNNING:
                    continue
                jobs = (await airbyte.call("GET", "/jobs", params={"connectionId": cid, "limit": 1, "orderBy": "createdAt|DESC"})).get("data") or []
                j = jobs[0] if jobs else None
                if j and j.get("status") == "succeeded" and j.get("jobType") == "sync" and str(j.get("jobId")) != str(c.get("last_job")):
                    try:
                        await land(cid, str(j.get("jobId")))
                    except Exception:  # noqa: BLE001 - recorded in last_run
                        pass
        except _asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001 - Airbyte down etc.: try again next minute
            pass


_LAND_CODE = r"""
import re as __re
__S = __j.loads(__SPEC__)
__props = {"user": __S["user"], "password": __S["password"], "driver": "org.postgresql.Driver", "fetchsize": "10000"}
def __norm(s): return __re.sub(r"[^a-z0-9_]", "_", (s or "").lower())
__src = __S["src"]
__tbls = [r[0] for r in spark.read.jdbc(__S["url"], "(select table_name from information_schema.tables where table_schema = '%s') t" % __src.replace("'", "''"), properties=__props).collect()]
__by = {t.lower(): t for t in __tbls}
__want = [(s, __norm(__S["prefix"] + s)) for s in (__S["streams"] or [])] or [(t, t.lower()) for t in __tbls if t.lower().startswith(__norm(__S["prefix"]))]
__out, __marks = [], {}
for __stream, __pg in __want:
    __t = __by.get(__pg)
    if not __t:
        __out.append({"stream": __stream, "status": "not found", "rows": 0}); continue
    __q = '"%s"."%s"' % (__src.replace('"', '""'), __t.replace('"', '""'))
    __mark = __S["marks"].get(__pg)
    __cols = [r[0] for r in spark.read.jdbc(__S["url"], "(select column_name from information_schema.columns where table_schema = '%s' and table_name = '%s') c" % (__src.replace("'", "''"), __t.replace("'", "''")), properties=__props).collect()]
    __has_ts = "_airbyte_extracted_at" in __cols
    if __S["mode"] == "append" and __mark and __has_ts:
        __q = "(select * from %s where _airbyte_extracted_at > '%s') x" % (__q, __mark)
    __df = spark.read.jdbc(__S["url"], __q, properties=__props)
    if __has_ts:
        __df = __df.withColumnRenamed("_airbyte_extracted_at", "_synced_at")
    if __S["drop_meta"]:
        __df = __df.drop(*[c for c in __df.columns if c.startswith("_airbyte_")])
    __df = __df.cache()
    __n = __df.count()
    __tbl = __norm(__stream)
    if __S["mode"] == "append" and __n == 0:
        __out.append({"stream": __stream, "table": __S["target"] + "." + __tbl, "status": "no new rows", "rows": 0}); __df.unpersist(); continue
    __mode = "append" if (__S["mode"] == "append" and __mark) else "overwrite"
    __fmt = __db_save(__df, __S["target"], __tbl, __mode, __S["fmt"], "Synced by Airbyte from %s.%s" % (__src, __t))
    if __has_ts and __n:
        __mx = __df.agg(__F.date_format(__F.max("_synced_at"), "yyyy-MM-dd HH:mm:ss.SSSSSSXXX")).first()[0]
        if __mx is not None: __marks[__pg] = __mx          # with UTC offset, so Postgres compares exactly
    __out.append({"stream": __stream, "table": __S["target"] + "." + __tbl, "status": "ok", "rows": __n, "format": __fmt, "mode": __mode})
    __df.unpersist()
print("__DBH__" + __j.dumps({"tables": __out, "marks": __marks}, default=str))
"""
