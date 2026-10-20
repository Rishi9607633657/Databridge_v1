"""Data Hub › Connections & Syncs — DataBridge's own lightweight connectors (no Airbyte, no Docker).

Connection  = where data lives (Postgres, MySQL/MariaDB, SQL Server, Oracle, SFTP, folder, REST API, Google Sheets, file URL).
Sync        = which tables/streams to copy into which Catalog schema, how (full / incremental append / upsert) and when.
Run         = one execution of a sync: extract (Python driver, streamed in chunks to Parquet) -> Spark -> Delta table.
State (cursor values, files already loaded) is kept per sync so incremental runs only move new data."""
import asyncio
import fnmatch
import io
import json
import os
import re
import secrets
import shutil
import stat as _stat
import threading
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
from fastapi import HTTPException

from .settings import DATA_ROOT, env

ST = DATA_ROOT / ".stratum"
CONN_FILE, SYNC_FILE, RUN_FILE = ST / "dh_connections.json", ST / "dh_syncs.json", ST / "dh_runs.json"
STAGE = ST / "dh_stage"
MASK = "••••••••"
CHUNK = 50_000
_lock = threading.Lock()
_ID = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,127}$")

# ---------------- connector types (fields drive the UI form) ----------------
F = lambda key, label, typ="text", **kw: {"key": key, "label": label, "type": typ, **kw}  # noqa: E731
DB_FIELDS = lambda port: [F("host", "Host", placeholder="db.company.local or 10.0.0.5", required=True),  # noqa: E731
                          F("port", "Port", "number", default=port, required=True),
                          F("database", "Database", required=True), F("user", "User", required=True),
                          F("password", "Password", "password")]
TYPES = {
    "postgres": {"label": "PostgreSQL", "group": "Databases", "icon": "postgres", "kind": "db", "fields": DB_FIELDS(5432) + [
        F("sslmode", "SSL mode", "select", options=["prefer", "require", "disable"], default="prefer")], "pip": "psycopg[binary]"},
    "mysql": {"label": "MySQL", "group": "Databases", "icon": "mysql", "kind": "db", "fields": DB_FIELDS(3306), "pip": "pymysql"},
    "mariadb": {"label": "MariaDB", "group": "Databases", "icon": "mysql", "kind": "db", "fields": DB_FIELDS(3306), "pip": "pymysql"},
    "sqlserver": {"label": "SQL Server", "group": "Databases", "icon": "mssql", "kind": "db", "fields": DB_FIELDS(1433), "pip": "pymssql"},
    "oracle": {"label": "Oracle", "group": "Databases", "icon": "oracle", "kind": "db", "pip": "oracledb", "fields": [
        F("host", "Host", required=True), F("port", "Port", "number", default=1521, required=True),
        F("service_name", "Service name", required=True, placeholder="ORCLPDB1"), F("user", "User", required=True), F("password", "Password", "password")]},
    "sftp": {"label": "SFTP", "group": "Files", "icon": "sftp-bulk", "kind": "files", "pip": "paramiko", "fields": [
        F("host", "Host", required=True), F("port", "Port", "number", default=22), F("user", "User", required=True),
        F("password", "Password", "password"), F("private_key", "Private key (instead of password)", "textarea", secret=True),
        F("path", "Folder", default="/", required=True), F("pattern", "Files to pick (glob)", default="*.csv", hint="e.g. *.csv, sales_*.xlsx, *.json")]},
    "folder": {"label": "Folder / network share", "group": "Files", "icon": "file", "kind": "files", "fields": [
        F("path", "Folder path", required=True, placeholder=r"C:\data\exports  or  \\server\share\exports"),
        F("pattern", "Files to pick (glob)", default="*.csv")]},
    "http_file": {"label": "File from URL", "group": "Files", "icon": "file", "kind": "url", "fields": [
        F("url", "File URL (CSV, Excel, JSON, Parquet)", required=True), F("headers", "Headers (JSON, optional)", "textarea", secret=True, placeholder='{"Authorization": "Bearer …"}')]},
    "gsheets": {"label": "Google Sheets", "group": "Apps & APIs", "icon": "google-sheets", "kind": "url", "fields": [
        F("url", "Sheet link (shared: anyone with the link can view)", required=True, placeholder="https://docs.google.com/spreadsheets/d/…/edit#gid=0")]},
    "rest": {"label": "REST API", "group": "Apps & APIs", "icon": "http-request", "kind": "api", "fields": [
        F("url", "Endpoint URL", required=True, placeholder="https://api.example.com/v1/orders"),
        F("headers", "Headers (JSON)", "textarea", secret=True, placeholder='{"Authorization": "Bearer …"}'),
        F("params", "Query parameters (JSON)", "textarea", placeholder='{"status": "paid"}'),
        F("records_path", "Records path in the response", placeholder="data  or  result.items (empty = whole response)"),
        F("pagination", "Pagination", "select", options=["none", "page", "offset", "next_url", "cursor"], default="none"),
        F("page_param", "Page / offset / cursor parameter", default="page"), F("size_param", "Page-size parameter", default="per_page"),
        F("page_size", "Page size", "number", default=100), F("next_path", "Next URL / cursor path in the response", placeholder="links.next  or  meta.next_cursor"),
        F("max_pages", "Max pages per run", "number", default=500)]},
    "airbyte": {"label": "Connector library", "group": "Connector library", "icon": "library", "kind": "airbyte", "fields": []},
}


def types():
    return [{"type": k, **{x: v[x] for x in ("label", "group", "icon", "kind", "fields")}} for k, v in TYPES.items()]


def _secret_keys(t):
    return {f["key"] for f in TYPES[t]["fields"] if f["type"] == "password" or f.get("secret")}


# ---------------- storage ----------------
def _load(f, default):
    try:
        return json.loads(f.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return default


def _save(f, d):
    f.parent.mkdir(parents=True, exist_ok=True)
    tmp = f.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, indent=1, default=str), encoding="utf-8")
    tmp.replace(f)


def _public(c):
    c = json.loads(json.dumps(c))
    from . import tenants
    c["tenancy"] = tenants.label(c)
    if c["type"] == "airbyte":
        from . import airbyte_local
        c["config"] = airbyte_local.mask(c.get("config") or {})
        try:
            meta = airbyte_local.get(c["config"]["connector"])
            c["airbyte"] = {k: meta[k] for k in ("id", "name", "runtime", "support", "icon")}
        except HTTPException:
            c["airbyte"] = {"id": c["config"].get("connector"), "name": c["config"].get("connector"), "runtime": "?"}
        return c
    for k in _secret_keys(c["type"]):
        if c["config"].get(k):
            c["config"][k] = MASK
    return c


def list_connections():
    return [_public(c) for c in _load(CONN_FILE, [])]


def _get_conn(cid):
    c = next((x for x in _load(CONN_FILE, []) if x["id"] == cid), None)
    if not c:
        raise HTTPException(404, "Connection not found")
    return c


def _clean_config(t, cfg, old=None):
    if t not in TYPES:
        raise HTTPException(400, f"Unknown connector type: {t}")
    if t == "airbyte":
        from . import airbyte_local
        return airbyte_local.clean_config(cfg, old)
    out = {}
    for f in TYPES[t]["fields"]:
        v = (cfg or {}).get(f["key"], f.get("default"))
        if v == MASK and old is not None:
            v = old.get(f["key"])
        if f["type"] == "number" and v not in (None, ""):
            try:
                v = int(v)
            except (TypeError, ValueError):
                raise HTTPException(400, f"{f['label']} must be a number")
        if f.get("required") and v in (None, ""):
            raise HTTPException(400, f"{f['label']} is required")
        out[f["key"]] = v
    return out


def save_connection(body, cid=None, user=None):
    with _lock:
        conns = _load(CONN_FILE, [])
        old = next((x for x in conns if x["id"] == cid), None) if cid else None
        if cid and not old:
            raise HTTPException(404, "Connection not found")
        t = (old or {}).get("type") or body.get("type")
        name = (body.get("name") or "").strip() or TYPES.get(t, {}).get("label", "Connection")
        if cid and t == "airbyte":
            from . import airbyte_local
            airbyte_local.forget(cid)
        cfg = _clean_config(t, body.get("config"), (old or {}).get("config"))
        from . import tenants
        ten = tenants.validate_assignment(body, old)
        if old:
            old.update(name=name, config=cfg, updated=time.time(), **ten)
            rec = old
        else:
            rec = {"id": uuid.uuid4().hex[:12], "type": t, "name": name, "config": cfg, "created": time.time(), "user": user, **ten}
            conns.append(rec)
        _save(CONN_FILE, conns)
        return _public(rec)


def delete_connection(cid):
    with _lock:
        if any(s["connection_id"] == cid for s in _load(SYNC_FILE, [])):
            raise HTTPException(409, "Delete the syncs that use this connection first")
        conns = [c for c in _load(CONN_FILE, []) if c["id"] != cid]
        _save(CONN_FILE, conns)
    return {"ok": True}


# ---------------- drivers ----------------
def _need(mod, pip):
    try:
        return __import__(mod)
    except ImportError:
        raise HTTPException(400, f"This connector needs a Python package. Run:  pip install {pip}  and restart DataBridge.")


def _db_connect(t, c):
    try:
        if t == "postgres":
            psycopg = _need("psycopg", "psycopg[binary]")
            return psycopg.connect(host=c["host"], port=c["port"], dbname=c["database"], user=c["user"], password=c.get("password") or None,
                                   sslmode=c.get("sslmode") or "prefer", connect_timeout=10)
        if t in ("mysql", "mariadb"):
            pymysql = _need("pymysql", "pymysql")
            return pymysql.connect(host=c["host"], port=int(c["port"]), database=c["database"], user=c["user"], password=c.get("password") or "",
                                   connect_timeout=10, cursorclass=pymysql.cursors.SSCursor, charset="utf8mb4")
        if t == "sqlserver":
            pymssql = _need("pymssql", "pymssql")
            return pymssql.connect(server=c["host"], port=str(c["port"]), database=c["database"], user=c["user"], password=c.get("password") or "",
                                   login_timeout=10, charset="UTF-8")
        if t == "oracle":
            oracledb = _need("oracledb", "oracledb")
            return oracledb.connect(user=c["user"], password=c.get("password") or "", dsn=f"{c['host']}:{c['port']}/{c['service_name']}")
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(400, f"Cannot connect: {str(e).strip()[:500]}")
    raise HTTPException(400, f"Not a database connector: {t}")


def _q(t, *parts):
    """Quote identifiers for the source database."""
    if t in ("mysql", "mariadb"):
        return ".".join("`" + p.replace("`", "``") + "`" for p in parts)
    if t == "sqlserver":
        return ".".join("[" + p.replace("]", "]]") + "]" for p in parts)
    return ".".join('"' + p.replace('"', '""') + '"' for p in parts)


def _ph(t):
    return "%s" if t in ("postgres", "mysql", "mariadb", "sqlserver") else ":1"


_SYS_SCHEMAS = ("information_schema", "pg_catalog", "pg_toast", "mysql", "performance_schema", "sys", "guest", "INFORMATION_SCHEMA")


def _db_tables(t, conn, c):
    cur = conn.cursor()
    if t == "oracle":
        cur.execute("select owner, table_name, 'TABLE' from all_tables where owner = upper(:1) "
                    "union all select owner, view_name, 'VIEW' from all_views where owner = upper(:1)", [c["user"]])
    elif t in ("mysql", "mariadb"):
        cur.execute("select table_schema, table_name, table_type from information_schema.tables where table_schema = %s order by 1, 2", (c["database"],))
    else:
        cur.execute("select table_schema, table_name, table_type from information_schema.tables "
                    "where table_schema not in ('information_schema','pg_catalog','sys','INFORMATION_SCHEMA') "
                    "and table_schema not like 'pg_toast%%' and table_schema not like 'pg_temp%%' order by 1, 2")
    rows = cur.fetchall()
    cur.close()
    return [{"stream": f"{r[0]}.{r[1]}", "schema": r[0], "name": r[1], "kind": "view" if "VIEW" in str(r[2]).upper() else "table"}
            for r in rows if r[0] not in _SYS_SCHEMAS]


def _db_columns(t, conn, schema, table):
    cur = conn.cursor()
    if t == "oracle":
        cur.execute("select column_name, data_type from all_tab_columns where owner = :1 and table_name = :2 order by column_id", [schema, table])
        cols = [{"name": r[0], "type": r[1]} for r in cur.fetchall()]
        cur.execute("select cc.column_name from all_constraints c join all_cons_columns cc on c.constraint_name = cc.constraint_name and c.owner = cc.owner "
                    "where c.constraint_type = 'P' and c.owner = :1 and c.table_name = :2", [schema, table])
    else:
        ph = _ph(t)
        cur.execute(f"select column_name, data_type from information_schema.columns where table_schema = {ph} and table_name = {ph} order by ordinal_position", (schema, table))
        cols = [{"name": r[0], "type": r[1]} for r in cur.fetchall()]
        cur.execute(f"select k.column_name from information_schema.table_constraints c join information_schema.key_column_usage k "
                    f"on c.constraint_name = k.constraint_name and c.table_schema = k.table_schema and c.table_name = k.table_name "
                    f"where c.constraint_type = 'PRIMARY KEY' and c.table_schema = {ph} and c.table_name = {ph}", (schema, table))
    pk = [r[0] for r in cur.fetchall()]
    cur.close()
    for col in cols:
        col["pk"] = col["name"] in pk
        tp = str(col["type"]).lower()
        col["cursor_ok"] = any(x in tp for x in ("int", "date", "time", "serial", "numeric", "decimal", "number"))
    return cols


# ---------------- file sources ----------------
class _Files:
    """List/open files for SFTP and folder connections."""

    def __init__(self, t, c):
        self.t, self.c, self.sftp, self.ssh = t, c, None, None

    def __enter__(self):
        if self.t == "sftp":
            paramiko = _need("paramiko", "paramiko")
            try:
                self.ssh = paramiko.SSHClient()
                self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                kw = {"hostname": self.c["host"], "port": int(self.c.get("port") or 22), "username": self.c["user"], "timeout": 15,
                      "allow_agent": False, "look_for_keys": False}
                if self.c.get("private_key"):
                    key = None
                    for kc in (paramiko.RSAKey, paramiko.Ed25519Key, paramiko.ECDSAKey):
                        try:
                            key = kc.from_private_key(io.StringIO(self.c["private_key"]))
                            break
                        except Exception:  # noqa: BLE001
                            continue
                    if key is None:
                        raise HTTPException(400, "Could not read the private key (RSA, Ed25519 or ECDSA, unencrypted)")
                    kw["pkey"] = key
                else:
                    kw["password"] = self.c.get("password") or ""
                self.ssh.connect(**kw)
                self.sftp = self.ssh.open_sftp()
            except HTTPException:
                raise
            except Exception as e:  # noqa: BLE001
                raise HTTPException(400, f"Cannot connect to SFTP: {e}")
        else:
            if not Path(self.c["path"]).exists():
                raise HTTPException(400, f"Folder not found on the DataBridge server: {self.c['path']}")
        return self

    def __exit__(self, *a):
        for x in (self.sftp, self.ssh):
            try:
                x and x.close()
            except Exception:  # noqa: BLE001
                pass

    def list(self, pattern=None):
        pattern = pattern or self.c.get("pattern") or "*"
        out = []
        if self.t == "sftp":
            base = self.c.get("path") or "/"
            try:
                for a in self.sftp.listdir_attr(base):
                    if _stat.S_ISREG(a.st_mode or 0) and fnmatch.fnmatch(a.filename.lower(), pattern.lower()):
                        out.append({"name": a.filename, "path": base.rstrip("/") + "/" + a.filename, "size": a.st_size, "mtime": a.st_mtime})
            except OSError as e:
                raise HTTPException(400, f"Cannot list {base}: {e}")
        else:
            base = Path(self.c["path"])
            for p in base.iterdir():
                if p.is_file() and fnmatch.fnmatch(p.name.lower(), pattern.lower()):
                    st = p.stat()
                    out.append({"name": p.name, "path": str(p), "size": st.st_size, "mtime": st.st_mtime})
        return sorted(out, key=lambda x: x["mtime"])

    def fetch(self, f, dest: Path):
        if self.t == "sftp":
            self.sftp.get(f["path"], str(dest))
        else:
            shutil.copyfile(f["path"], dest)


def _read_file(path: Path, nrows=None):
    """Any supported file -> DataFrame (same parsers as Import file)."""
    from . import datahub
    ext = path.suffix.lower()
    meta = {"ext": ext if ext in datahub.EXT else ".csv"}
    if ext in datahub.EXCEL:
        meta["sheets"] = pd.ExcelFile(path).sheet_names
    d = path.parent
    src = d / ("source" + meta["ext"])
    if src != path:
        if src.exists():
            src.unlink()
        try:
            os.link(path, src)
        except (OSError, AttributeError):
            shutil.copyfile(path, src)
    try:
        df, _ = datahub._read(d, meta, {"header": True}, nrows=nrows)
    finally:
        if src != path and src.exists():
            src.unlink()
    return df


# ---------------- URL / API sources ----------------
def _headers(c):
    h = c.get("headers")
    if not h:
        return {}
    try:
        h = json.loads(h) if isinstance(h, str) else h
        return {str(k): str(v) for k, v in h.items()}
    except (ValueError, AttributeError):
        raise HTTPException(400, "Headers must be a JSON object")


def _gsheet_url(u):
    m = re.search(r"/spreadsheets/d/([A-Za-z0-9_-]+)", u or "")
    if not m:
        raise HTTPException(400, "Not a Google Sheets link")
    gid = re.search(r"[#&?]gid=(\d+)", u)
    return f"https://docs.google.com/spreadsheets/d/{m.group(1)}/export?format=csv" + (f"&gid={gid.group(1)}" if gid else "")


def _http_get(url, headers=None, params=None):
    import httpx
    try:
        r = httpx.get(url, headers=headers or {}, params=params or None, timeout=60, follow_redirects=True)
    except httpx.HTTPError as e:
        raise HTTPException(400, f"Cannot reach {url}: {e}")
    if r.status_code >= 400:
        raise HTTPException(400, f"{url} answered {r.status_code}: {r.text[:300]}")
    return r


def _dig(obj, path):
    for part in [p for p in (path or "").split(".") if p]:
        if isinstance(obj, list):
            try:
                obj = obj[int(part)]
            except (ValueError, IndexError):
                return None
        elif isinstance(obj, dict):
            obj = obj.get(part)
        else:
            return None
    return obj


def _api_pages(c, max_pages=None):
    """Yield lists of records from a REST API, following its pagination."""
    headers = _headers(c)
    try:
        params = json.loads(c.get("params") or "{}") or {}
    except ValueError:
        raise HTTPException(400, "Query parameters must be a JSON object")
    mode = c.get("pagination") or "none"
    size = int(c.get("page_size") or 100)
    pages = int(max_pages or c.get("max_pages") or 500)
    url, page, offset, cursor = c["url"], 1, 0, None
    for _ in range(pages):
        p = dict(params)
        if mode == "page":
            p[c.get("page_param") or "page"] = page
            p[c.get("size_param") or "per_page"] = size
        elif mode == "offset":
            p[c.get("page_param") or "offset"] = offset
            p[c.get("size_param") or "limit"] = size
        elif mode == "cursor" and cursor:
            p[c.get("page_param") or "cursor"] = cursor
        j = _http_get(url, headers, p if mode != "next_url" or page == 1 else None).json()
        recs = _dig(j, c.get("records_path")) if c.get("records_path") else j
        if isinstance(recs, dict):
            recs = [recs]
        recs = recs or []
        yield recs
        if mode == "none" or not recs:
            return
        if mode == "page":
            page += 1
            if len(recs) < size:
                return
        elif mode == "offset":
            offset += len(recs)
            if len(recs) < size:
                return
        elif mode == "next_url":
            nxt = _dig(j, c.get("next_path") or "next")
            if not nxt:
                return
            url, page = nxt, page + 1
        elif mode == "cursor":
            cursor = _dig(j, c.get("next_path") or "next_cursor")
            if not cursor:
                return


# ---------------- test / browse / preview ----------------
def test(t, cfg):
    t0 = time.time()
    kind = TYPES[t]["kind"]
    if kind == "db":
        conn = _db_connect(t, cfg)
        try:
            n = len(_db_tables(t, conn, cfg))
        finally:
            conn.close()
        msg = f"Connected · {n} tables/views visible"
    elif kind == "files":
        with _Files(t, cfg) as fs:
            n = len(fs.list())
        msg = f"Connected · {n} file(s) match {cfg.get('pattern') or '*'}"
    elif t == "gsheets":
        r = _http_get(_gsheet_url(cfg["url"]))
        if "text/html" in r.headers.get("content-type", ""):
            raise HTTPException(400, "Google returned a sign-in page. Share the sheet as 'Anyone with the link can view'.")
        msg = f"Connected · {max(0, r.text.count(chr(10)))} rows"
    elif t == "http_file":
        _http_get(cfg["url"], _headers(cfg))
        msg = "File reachable"
    elif kind == "airbyte":
        from . import airbyte_local
        msg = airbyte_local.check(cfg)
    else:
        recs = next(_api_pages(cfg, 1), [])
        msg = f"Connected · first page has {len(recs)} record(s)"
    return {"ok": True, "message": msg, "ms": int((time.time() - t0) * 1000)}


def test_saved(cid):
    c = _get_conn(cid)
    return test(c["type"], c["config"])


def test_new(body):
    t = body.get("type")
    old = _get_conn(body["id"])["config"] if body.get("id") else None
    return test(t, _clean_config(t, body.get("config"), old))


def streams(cid):
    c = _get_conn(cid)
    t, cfg = c["type"], c["config"]
    kind = TYPES[t]["kind"]
    if kind == "db":
        conn = _db_connect(t, cfg)
        try:
            return {"kind": kind, "streams": _db_tables(t, conn, cfg)}
        finally:
            conn.close()
    if kind == "files":
        with _Files(t, cfg) as fs:
            files = fs.list()
        return {"kind": kind, "files": files[-200:], "streams": [{"stream": cfg.get("pattern") or "*", "name": _stream_table(cfg.get("pattern") or "files"), "kind": "files",
                                                                   "count": len(files)}]}
    if kind == "airbyte":
        from . import airbyte_local
        cat = airbyte_local.discover(cfg, cid)
        sugg = set(airbyte_local.get(cfg["connector"]).get("suggested") or [])
        return {"kind": kind, "streams": [{"stream": st["name"], "name": _stream_table(st["name"]), "kind": "airbyte",
                                           "incremental": "incremental" in (st.get("supported_sync_modes") or []),
                                           "cursor": (st.get("default_cursor_field") or [None])[0], "source_cursor": bool(st.get("source_defined_cursor")),
                                           "pk": [p[0] for p in (st.get("source_defined_primary_key") or []) if p], "suggested": st["name"] in sugg}
                                          for st in cat["streams"]]}
    return {"kind": kind, "streams": [{"stream": "data", "name": _stream_table(c["name"]), "kind": "api"}]}


def _airbyte_records(c, stream, n):
    from . import airbyte_local
    recs = []
    airbyte_local.read(c["config"], stream, "full", None, None, None, lambda s, d: recs.append(d), limit=n, key=c["id"])
    return recs


def columns(cid, stream):
    c = _get_conn(cid)
    t, cfg = c["type"], c["config"]
    if TYPES[t]["kind"] == "db":
        schema, _, table = stream.partition(".")
        conn = _db_connect(t, cfg)
        try:
            return {"columns": _db_columns(t, conn, schema, table)}
        finally:
            conn.close()
    if TYPES[t]["kind"] == "airbyte":
        from . import airbyte_local
        st = next((x for x in airbyte_local.discover(cfg, cid)["streams"] if x["name"] == stream), None)
        if not st:
            raise HTTPException(404, f"No stream {stream}")
        return {"columns": airbyte_local.stream_columns(st)}
    df = _preview_df(c, stream, 200)
    return {"columns": [{"name": str(x), "type": str(df[x].dtype), "pk": False, "cursor_ok": True} for x in df.columns]}


def _preview_df(c, stream, n=50):
    t, cfg = c["type"], c["config"]
    kind = TYPES[t]["kind"]
    if kind == "db":
        schema, _, table = stream.partition(".")
        conn = _db_connect(t, cfg)
        try:
            cur = conn.cursor()
            sql = (f"select top {int(n)} * from {_q(t, schema, table)}" if t == "sqlserver" else
                   f"select * from {_q(t, schema, table)} fetch first {int(n)} rows only" if t == "oracle" else
                   f"select * from {_q(t, schema, table)} limit {int(n)}")
            cur.execute(sql)
            rows = cur.fetchmany(n)
            cols = [d[0] for d in cur.description]
            cur.close()
            return pd.DataFrame.from_records(rows, columns=cols)
        finally:
            conn.close()
    tmp = STAGE / ("preview-" + uuid.uuid4().hex[:8])
    tmp.mkdir(parents=True, exist_ok=True)
    try:
        if kind == "files":
            with _Files(t, cfg) as fs:
                files = fs.list(stream)
                if not files:
                    return pd.DataFrame()
                dest = tmp / files[-1]["name"]
                fs.fetch(files[-1], dest)
            return _read_file(dest, n)
        if t in ("gsheets", "http_file"):
            return _url_df(t, cfg, tmp).head(n)
        recs = next(_api_pages(cfg, 1), [])
        return _records_df(recs).head(n)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _jsonable(v):
    if v is None or isinstance(v, (bool, int, str)):
        return v
    if isinstance(v, float):
        return None if v != v else v
    if isinstance(v, dict):
        return {str(k): _jsonable(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [_jsonable(x) for x in v]
    return str(v)


def preview(cid, stream, nested=None):
    c = _get_conn(cid)
    kind = TYPES[c["type"]]["kind"]
    if kind == "airbyte" or (nested == "struct" and kind == "api"):     # raw records: nested objects/arrays kept as they are
        recs = _airbyte_records(c, stream, 50) if kind == "airbyte" else [r if isinstance(r, dict) else {"value": r} for r in next(_api_pages(c["config"], 1), [])][:50]
        cols = []
        for r in recs:
            for k in r:
                if k not in cols:
                    cols.append(k)
        return {"columns": cols, "rows": [[_jsonable(r.get(k)) for k in cols] for r in recs], "nested": True}
    df = _preview_df(c, stream, 50)
    return {"columns": [str(x) for x in df.columns],
            "rows": [[None if (isinstance(v, float) and pd.isna(v)) or v is None else
                      json.dumps(v, default=str) if isinstance(v, (dict, list)) else str(v) for v in r] for r in df.itertuples(index=False)]}


def _records_df(recs):
    df = pd.json_normalize(recs, sep="_") if recs else pd.DataFrame()
    for col in df.columns:
        if df[col].map(lambda x: isinstance(x, (list, dict))).any():
            df[col] = df[col].map(lambda x: json.dumps(x, default=str) if isinstance(x, (list, dict)) else x)
    return df


def _url_df(t, cfg, tmp: Path):
    if t == "gsheets":
        r = _http_get(_gsheet_url(cfg["url"]))
        if "text/html" in r.headers.get("content-type", ""):
            raise HTTPException(400, "Google returned a sign-in page. Share the sheet as 'Anyone with the link can view'.")
        name = "sheet.csv"
    else:
        r = _http_get(cfg["url"], _headers(cfg))
        name = (cfg["url"].split("?")[0].rstrip("/").split("/")[-1] or "file.csv")
        if "." not in name:
            ct = r.headers.get("content-type", "")
            name += ".json" if "json" in ct else ".xlsx" if "sheet" in ct else ".parquet" if "parquet" in ct else ".csv"
    p = tmp / name
    p.write_bytes(r.content)
    return _read_file(p)


# ---------------- extract to Parquet ----------------
def _clean_cols(cols):
    from .datahub import clean_name
    out, seen = [], set()
    for i, c in enumerate(cols):
        n = clean_name(c, i)
        while n in seen:
            n += "_2"
        seen.add(n)
        out.append(n)
    return out


def _write_part(df: pd.DataFrame, path: Path, as_text=False):
    """as_text: files/APIs can differ per file/page, so store text and let Spark pick the types once at the end."""
    import pyarrow as pa
    import pyarrow.parquet as pq
    df = df.copy()
    df.columns = _clean_cols(df.columns)
    if as_text:
        df = df.map(lambda v: None if v is None or (isinstance(v, float) and pd.isna(v)) or v is pd.NaT else
                    json.dumps(v, default=str) if isinstance(v, (list, dict)) else
                    (v.isoformat(sep=" ") if hasattr(v, "isoformat") and not isinstance(v, str) else str(v))).astype("string")
        pq.write_table(pa.Table.from_pandas(df, preserve_index=False), path)
        return len(df)
    for col in df.columns:
        if df[col].dtype == object:
            sample = df[col].dropna().head(200)
            if not len(sample):
                df[col] = df[col].astype("string")
            elif not all(type(v).__name__ in ("Decimal", "datetime", "date", "Timestamp", "bytes") for v in sample) or \
                    len({type(v).__name__ for v in sample}) > 1:
                df[col] = df[col].map(lambda v: v if v is None or (isinstance(v, float) and pd.isna(v)) else
                                      (json.dumps(v, default=str) if isinstance(v, (list, dict)) else str(v)))
    try:
        table = pa.Table.from_pandas(df, preserve_index=False)
    except (pa.ArrowInvalid, pa.ArrowTypeError, TypeError):
        table = pa.Table.from_pandas(df.astype("string"), preserve_index=False)
    pq.write_table(table, path, coerce_timestamps="us", allow_truncated_timestamps=True)
    return len(df)


def _commit_rows():
    try:
        return max(1, int(env("DATAHUB_COMMIT_ROWS", "200000") or 200000))
    except ValueError:
        return 200000


def _extract(c, st, state, out_dir: Path, log, commit=None):
    """Write one stream as Parquet / JSON-lines parts. Returns (rows, new_state_for_stream).
    commit(states): optional checkpoint — loads the parts written so far into the table and saves the state, so a long
    history backfill resumes where it stopped instead of starting over."""
    t, cfg = c["type"], c["config"]
    kind = TYPES[t]["kind"]
    mode, cursor_col = st.get("mode") or "full", st.get("cursor")
    out_dir.mkdir(parents=True, exist_ok=True)
    rows, part = 0, 0
    new_state = dict(state or {})
    if kind == "db":
        schema, _, table = st["source"].partition(".")
        conn = _db_connect(t, cfg)
        try:
            sql, args = f"select * from {_q(t, schema, table)}", ()
            last = (state or {}).get("cursor")
            if mode in ("append", "merge") and cursor_col:
                if last is not None:
                    sql += f" where {_q(t, cursor_col)} > {_ph(t)}"
                    args = (last,) if t != "oracle" else [last]
                sql += f" order by {_q(t, cursor_col)}"
            cur = conn.cursor(name=f"dbx_{uuid.uuid4().hex[:8]}") if t == "postgres" else conn.cursor()
            if t == "postgres":
                cur.itersize = CHUNK
            if t == "oracle":
                cur.arraysize = 10_000
            cur.execute(sql, args or None) if t != "oracle" else cur.execute(sql, args)
            cols = None
            mx = last
            while True:
                batch = cur.fetchmany(CHUNK)
                if cols is None and cur.description:
                    cols = [d[0] for d in cur.description]
                if not batch:
                    break
                df = pd.DataFrame.from_records(batch, columns=cols)
                if cursor_col and cursor_col in df.columns:
                    v = df[cursor_col].dropna()
                    if len(v):
                        top = v.max()
                        try:
                            mx = top if mx is None or isinstance(mx, str) or top > mx else mx
                        except TypeError:
                            mx = top
                rows += _write_part(df, out_dir / f"part-{part:05d}.parquet")
                part += 1
                log(f"{st['table']}: {rows:,} rows read")
            cur.close()
            if cursor_col and mx is not None:
                new_state["cursor"] = mx.isoformat() if hasattr(mx, "isoformat") else (mx.item() if hasattr(mx, "item") else mx)
        finally:
            conn.close()
    elif kind == "files":
        seen = dict((state or {}).get("files") or {})
        with _Files(t, cfg) as fs:
            files = fs.list(st["source"])
            todo = [f for f in files if mode == "full" or seen.get(f["path"]) != [f["size"], f["mtime"]]]
            tmp = out_dir.parent / (out_dir.name + "_raw")
            tmp.mkdir(parents=True, exist_ok=True)
            for f in todo:
                dest = tmp / f["name"]
                fs.fetch(f, dest)
                df = _read_file(dest)
                df["_source_file"] = f["name"]
                rows += _write_part(df, out_dir / f"part-{part:05d}.parquet", True)
                part += 1
                seen[f["path"]] = [f["size"], f["mtime"]]
                dest.unlink(missing_ok=True)
                log(f"{st['table']}: {f['name']} ({rows:,} rows)")
            shutil.rmtree(tmp, ignore_errors=True)
        new_state["files"] = seen
    elif t in ("gsheets", "http_file"):
        df = _url_df(t, cfg, out_dir)
        for p in out_dir.iterdir():
            if p.suffix != ".parquet":
                p.unlink()
        if len(df):
            rows += _write_part(df, out_dir / "part-00000.parquet", True)
    elif kind == "airbyte":
        from . import airbyte_local
        fh = {"f": None, "n": 0, "since": 0}
        every = _commit_rows()

        def on_state(states):
            if commit and fh["n"] - fh["since"] >= every:
                if fh["f"]:
                    fh["f"].close()
                    fh["f"] = None
                commit(states)
                fh["since"] = fh["n"]

        def on_record(_s, data):
            if fh["f"] is None or fh["n"] % CHUNK == 0:
                if fh["f"]:
                    fh["f"].close()
                fh["f"] = open(out_dir / f"part-{fh['n'] // CHUNK:05d}.json", "w", encoding="utf-8")
            fh["f"].write(json.dumps(data, default=str, ensure_ascii=False) + "\n")
            fh["n"] += 1
            if fh["n"] % 10000 == 0:
                log(f"{st['table']}: {fh['n']:,} records")
        try:
            res = airbyte_local.read(cfg, st["source"], mode, cursor_col, st.get("keys"), (state or {}).get("airbyte_state"), on_record, key=c["id"],
                                     on_state=on_state if commit else None)
        finally:
            if fh["f"]:
                fh["f"].close()
        rows = fh["n"]
        log(f"{st['table']}: {rows:,} records ({'incremental' if res['incremental'] else 'full refresh'})")
        if res["state"]:
            new_state["airbyte_state"] = res["state"]
    elif (st.get("nested") or "flat") == "struct":
        # keep nested objects/arrays: JSON lines -> Spark infers STRUCT / ARRAY / MAP types
        total, fh = 0, None
        try:
            for recs in _api_pages(cfg):
                if fh is None or total and total % CHUNK < len(recs):
                    if fh:
                        fh.close()
                    fh = open(out_dir / f"part-{part:05d}.json", "w", encoding="utf-8")
                    part += 1
                for r in recs:
                    fh.write(json.dumps(r if isinstance(r, dict) else {"value": r}, default=str, ensure_ascii=False) + "\n")
                total += len(recs)
                log(f"{st['table']}: {total:,} records")
        finally:
            if fh:
                fh.close()
        rows = total
    else:
        buf, total = [], 0
        for recs in _api_pages(cfg):
            buf += recs
            total += len(recs)
            if len(buf) >= CHUNK:
                rows += _write_part(_records_df(buf), out_dir / f"part-{part:05d}.parquet", True)
                part, buf = part + 1, []
            log(f"{st['table']}: {total:,} records")
        if buf:
            rows += _write_part(_records_df(buf), out_dir / f"part-{part:05d}.parquet", True)
    return rows, new_state


# ---------------- syncs ----------------
def _stream_table(s):
    from .datahub import clean_name
    return clean_name(str(s).split(".")[-1].replace("*", "").strip("._-") or "data")


def list_syncs():
    syncs = _load(SYNC_FILE, [])
    conns = {c["id"]: c for c in _load(CONN_FILE, [])}
    from . import tenants
    for s in syncs:
        c = conns.get(s["connection_id"]) or {}
        s["connection"] = {"name": c.get("name"), "type": c.get("type"), "connector": (c.get("config") or {}).get("connector") if c.get("type") == "airbyte" else None,
                           "tenancy": tenants.label(c) if c else None}
        s["running"] = s["id"] in _RUNNING
        s["next_run"] = _next_run(s)
        s["positions"] = {t: _position(v) for t, v in (s.get("state") or {}).items()}
    return syncs


def _as_dt(v):
    """A cursor value as a datetime (UTC when it has a zone), or None: ISO text, or epoch seconds / milliseconds."""
    from datetime import timezone
    if isinstance(v, bool):
        return None
    if isinstance(v, (int, float)) or (isinstance(v, str) and v.isdigit()):
        n = float(v)
        n = n / 1000 if n > 1e11 else n
        return datetime.fromtimestamp(n, tz=timezone.utc) if 9e8 < n < 5e9 else None
    if isinstance(v, str) and re.match(r"^\d{4}-\d{2}-\d{2}", v):
        t = v.strip().replace("Z", "+00:00").replace(" ", "T", 1)
        t = re.sub(r"(\.\d{1,6})\d*", r"\1", t)                       # .1234567 -> .123456
        t = re.sub(r"([+-]\d{2})(\d{2})$", r"\1:\2", t)               # +0000 -> +00:00
        try:
            d = datetime.fromisoformat(t)
        except ValueError:
            return None
        return d.astimezone(timezone.utc) if d.tzinfo else d
    return None


def _fmt_dt(d):
    return d.strftime("%Y-%m-%d %H:%M:%S") + (" UTC" if d.tzinfo else "")


def _position(ns):
    """How far a stream has synced: the cursor of the slowest location / partition (and the newest), or files seen."""
    if not isinstance(ns, dict):
        return None
    if ns.get("cursor") is not None:
        d = _as_dt(ns["cursor"])
        return {"cursor": _fmt_dt(d) if d else str(ns["cursor"])}
    if ns.get("files"):
        return {"files": len(ns["files"])}
    vals = []
    for m in ns.get("airbyte_state") or []:
        ss = ((m.get("stream") or {}).get("stream_state") or {}) if isinstance(m, dict) else {}
        parts = ss.get("states")
        if isinstance(parts, list) and parts:
            vals += [next(iter((p.get("cursor") or {}).values()), None) for p in parts]
        else:
            vals += [v for k, v in ss.items() if not k.startswith("__ab") and k not in ("use_global_cursor", "lookback_window", "state_type")]
    ds = sorted({d for d in (_as_dt(v) for v in vals) if d}, key=lambda d: d.timestamp() if d.tzinfo else d.replace(tzinfo=None).timestamp())
    if not ds:
        return None
    return {"cursor": _fmt_dt(ds[0]), "latest": _fmt_dt(ds[-1]), "partitions": len([v for v in vals if _as_dt(v)])}


def reset_state(sid, tables=None):
    """Forget where a sync got to: the next run reloads history from the connector's start date (Upsert keeps it duplicate-free)."""
    if sid in _RUNNING:
        raise HTTPException(409, "Wait for the running sync to finish")
    with _lock:
        syncs = _load(SYNC_FILE, [])
        s = next((x for x in syncs if x["id"] == sid), None)
        if not s:
            raise HTTPException(404, "Sync not found")
        st = s.setdefault("state", {})
        for t in (tables or [x["table"] for x in s["streams"]]):
            st.pop(t, None)
        _save(SYNC_FILE, syncs)
    return {"ok": True}


def _save_stream_state(sid, table, ns):
    with _lock:
        syncs = _load(SYNC_FILE, [])
        for x in syncs:
            if x["id"] == sid:
                x.setdefault("state", {})[table] = ns
        _save(SYNC_FILE, syncs)


_TYPES_OK = re.compile(r"^(auto|string|json|bigint|int|double|boolean|date|timestamp|decimal\(\d{1,2},\d{1,2}\))$")
_BAD_SQL = re.compile(r";|\b(drop|delete|insert|update|merge|alter|create|truncate|grant)\b", re.I)


def _validate_transform(t, tbl):
    """Mapping / transformation / dedup spec of one stream (applied by Spark before writing)."""
    t = t or {}
    out = {}
    cols = []
    for c in t.get("columns") or []:
        name = str(c.get("name") or "")
        if not name:
            continue
        r = {"name": name}
        if c.get("keep") is False:
            r["keep"] = False
        if c.get("as") and c["as"] != name:
            if not _ID.match(c["as"]):
                raise HTTPException(400, f"{tbl}: new column name {c['as']!r} — letters, digits and _ only")
            r["as"] = c["as"].lower()
        if c.get("type") and c["type"] != "auto":
            if not _TYPES_OK.match(c["type"]):
                raise HTTPException(400, f"{tbl}: unknown type {c['type']!r}")
            r["type"] = c["type"]
        if len(r) > 1:
            cols.append(r)
    if cols:
        out["columns"] = cols
    der = []
    for d in t.get("derived") or []:
        if not d.get("name") and not d.get("expr"):
            continue
        if not _ID.match(str(d.get("name") or "")) or not str(d.get("expr") or "").strip():
            raise HTTPException(400, f"{tbl}: each calculated column needs a name (letters, digits, _) and an expression")
        if _BAD_SQL.search(d["expr"]):
            raise HTTPException(400, f"{tbl}: expression for {d['name']} must be a column expression")
        der.append({"name": d["name"].lower(), "expr": d["expr"].strip()})
    if der:
        out["derived"] = der
    f = str(t.get("filter") or "").strip()
    if f:
        if _BAD_SQL.search(f):
            raise HTTPException(400, f"{tbl}: the row filter must be a condition, e.g. status <> 'cancelled'")
        out["filter"] = f
    if t.get("flatten") in (1, 2, 3, "all"):
        out["flatten"] = t["flatten"]
    if t.get("explode"):
        out["explode"] = str(t["explode"])
    dd = t.get("dedup") or {}
    keys = [k for k in dd.get("keys") or [] if k]
    if keys:
        out["dedup"] = {"keys": keys, "order_by": dd.get("order_by") or None, "desc": dd.get("desc", True) is not False}
    return out


def _validate_sync(body):
    if not body.get("connection_id"):
        raise HTTPException(400, "Pick a connection")
    conn = _get_conn(body["connection_id"])
    schema = (body.get("target_schema") or "").strip()
    if not _ID.match(schema.replace("{tenant}", "t")):
        raise HTTPException(400, "Catalog schema: letters, digits and _ only (and {tenant} for one schema per tenant)")
    if "{tenant}" in schema and not conn.get("tenant_id"):
        raise HTTPException(400, "{tenant} in the schema name needs a connection assigned to a tenant (Connections › Edit)")
    sts = []
    for st in body.get("streams") or []:
        tbl = (st.get("table") or "").strip().lower()
        if not _ID.match(tbl):
            raise HTTPException(400, f"Bad table name: {tbl!r}")
        mode = st.get("mode") or "full"
        if mode not in ("full", "append", "merge"):
            raise HTTPException(400, "mode must be full, append or merge")
        if mode == "merge" and not st.get("keys"):
            raise HTTPException(400, f"{tbl}: Upsert needs key column(s)")
        sts.append({"source": st["source"], "table": tbl, "mode": mode, "cursor": st.get("cursor") or None,
                    "keys": [k for k in (st.get("keys") or []) if k], "nested": st.get("nested") if st.get("nested") in ("struct", "flat") else "flat",
                    "transform": _validate_transform(st.get("transform"), tbl)})
    if not sts:
        raise HTTPException(400, "Pick at least one table")
    if len({s["table"] for s in sts}) != len(sts):
        raise HTTPException(400, "Two streams write to the same table")
    sch = body.get("schedule") or {"type": "manual"}
    if sch.get("type") not in ("manual", "interval", "daily", "realtime", "event"):
        raise HTTPException(400, "Unknown schedule")
    if sch["type"] == "realtime":
        floor = max(10, int(env("DATAHUB_REALTIME_MIN_SECONDS", "15") or 15))
        sch = {"type": "realtime", "seconds": max(floor, int(sch.get("seconds") or 60))}
    if sch["type"] == "event":
        on = sch.get("on")
        if on not in ("files", "webhook", "after_sync"):
            raise HTTPException(400, "Event must be files, webhook or after_sync")
        if on == "after_sync" and not sch.get("after"):
            raise HTTPException(400, "Pick the sync that triggers this one")
        if on == "files" and TYPES[_get_conn(body["connection_id"])["type"]]["kind"] != "files":
            raise HTTPException(400, "“When new files arrive” needs a folder or SFTP connection")
        sch = {"type": "event", "on": on, **({"after": sch["after"]} if on == "after_sync" else {})}
    if sch["type"] == "interval":
        sch = {"type": "interval", "minutes": max(5, int(sch.get("minutes") or 60))}
    if sch["type"] == "daily":
        if not re.fullmatch(r"\d{2}:\d{2}", sch.get("at") or ""):
            raise HTTPException(400, "Daily time must be HH:MM")
        sch = {"type": "daily", "at": sch["at"]}
    return {"name": (body.get("name") or "").strip() or "Sync", "connection_id": body["connection_id"], "target_schema": schema,
            "format": body.get("format") if body.get("format") in ("delta", "parquet") else "delta",
            "streams": sts, "schedule": sch, "enabled": body.get("enabled", True)}


def save_sync(body, sid=None, user=None):
    v = _validate_sync(body)
    with _lock:
        syncs = _load(SYNC_FILE, [])
        if sid:
            s = next((x for x in syncs if x["id"] == sid), None)
            if not s:
                raise HTTPException(404, "Sync not found")
            # a table whose mode/cursor/source changed starts fresh
            old = {x["table"]: x for x in s["streams"]}
            for st in v["streams"]:
                o = old.get(st["table"])
                if not o or o["source"] != st["source"] or o.get("cursor") != st.get("cursor"):
                    (s.get("state") or {}).pop(st["table"], None)
            s.update(v, updated=time.time())
        else:
            s = {"id": uuid.uuid4().hex[:12], **v, "state": {}, "created": time.time(), "user": user}
            syncs.append(s)
        if not s.get("hook"):
            s["hook"] = secrets.token_urlsafe(24)
        _save(SYNC_FILE, syncs)
    return s


def delete_sync(sid):
    with _lock:
        _save(SYNC_FILE, [s for s in _load(SYNC_FILE, []) if s["id"] != sid])
        _save(RUN_FILE, [r for r in _load(RUN_FILE, []) if r["sync_id"] != sid])
    return {"ok": True}


def set_enabled(sid, on):
    with _lock:
        syncs = _load(SYNC_FILE, [])
        s = next((x for x in syncs if x["id"] == sid), None)
        if not s:
            raise HTTPException(404, "Sync not found")
        s["enabled"] = bool(on)
        _save(SYNC_FILE, syncs)
    return {"ok": True}


def runs(sid=None, limit=50):
    rs = [r for r in _load(RUN_FILE, []) if not sid or r["sync_id"] == sid]
    return rs[:limit]


def get_run(rid):
    r = next((x for x in _load(RUN_FILE, []) if x["id"] == rid), None)
    if not r:
        raise HTTPException(404, "Run not found")
    return r


def _put_run(run):
    with _lock:
        rs = [r for r in _load(RUN_FILE, []) if r["id"] != run["id"]]
        _save(RUN_FILE, ([run] + rs)[:500])


_RUNNING = {}           # sync_id -> run_id
_RUN_LOCK = asyncio.Lock()


def _next_run(s):
    sch = s.get("schedule") or {}
    if not s.get("enabled", True) or sch.get("type") in (None, "manual"):
        return None
    if sch["type"] == "event":
        return None
    last = s.get("last_started") or s.get("created") or time.time()
    if sch["type"] == "realtime":
        return last + int(sch.get("seconds") or 60)
    if sch["type"] == "interval":
        return last + sch["minutes"] * 60
    hh, mm = map(int, sch["at"].split(":"))
    base = datetime.fromtimestamp(last)
    nxt = base.replace(hour=hh, minute=mm, second=0, microsecond=0)
    if nxt.timestamp() <= last:
        nxt += timedelta(days=1)
    return nxt.timestamp()


def start_run(sid, trigger="manual", user=None):
    s = next((x for x in _load(SYNC_FILE, []) if x["id"] == sid), None)
    if not s:
        raise HTTPException(404, "Sync not found")
    if sid in _RUNNING:
        raise HTTPException(409, "This sync is already running")
    run = {"id": uuid.uuid4().hex[:12], "sync_id": sid, "sync_name": s["name"], "status": "queued", "trigger": trigger, "user": user,
           "started": time.time(), "streams": [{"table": st["table"], "source": st["source"], "status": "waiting", "rows": 0} for st in s["streams"]],
           "log": []}
    _RUNNING[sid] = run["id"]
    _put_run(run)
    with _lock:
        syncs = _load(SYNC_FILE, [])
        for x in syncs:
            if x["id"] == sid:
                x["last_started"] = run["started"]
        _save(SYNC_FILE, syncs)
    asyncio.create_task(_execute(s, run))
    return run


def _resolve_schema(s, stamp):
    sch = s["target_schema"]
    if "{tenant}" in sch:
        if not stamp:
            raise HTTPException(400, "{tenant} in the schema name needs the connection to be assigned to a tenant")
        sch = sch.replace("{tenant}", stamp["tenant"])
    return sch


def _plan_item(c, st, i, path_dir: Path, mode, stamp, prev=None):
    from .datahub import file_uri
    return {"i": i, "path": file_uri(path_dir), "table": st["table"], "mode": mode, "keys": st.get("keys") or [],
            "infer": TYPES[c["type"]]["kind"] != "db", "cursor": st.get("cursor"), "transform": st.get("transform") or {},
            "fmt": "json" if any(path_dir.glob("*.json")) else "parquet", "stamp": stamp,
            "prev_businesses": ((prev or {}).get("businesses") if stamp and mode == "overwrite" else None)}


def _load_code(schema, fmt, items, comment):
    from .datahub import SAVE_FN
    return SAVE_FN + TRANSFORM_FN + _LOAD_CODE.replace("__PLAN__", repr(json.dumps({"schema": schema, "fmt": fmt, "items": items, "comment": comment})))


async def _execute(s, run):
    from .datahub import kernel_exec
    from . import tenants
    stage = STAGE / run["id"]
    t0 = time.time()

    def log(msg):
        run["log"] = (run["log"] + [f"{time.strftime('%H:%M:%S')} {msg}"])[-200:]

    try:
        async with _RUN_LOCK:                         # one load at a time on the shared Spark kernel
            run["status"] = "running"
            _put_run(run)
            c = _get_conn(s["connection_id"])
            stamp = tenants.stamp(c)
            schema = _resolve_schema(s, stamp)
            fmt = s.get("format") or "delta"
            comment = f"Synced by DataBridge from {c['name']}"
            if stamp:
                log(f"Tenant {stamp['tenant']}: rows get {stamp['tcol']} = {stamp['tenant']}, {stamp['bcol']} = "
                    + (stamp.get("business") or (f"from {stamp['bfrom']}" if stamp.get("bfrom") else "(none)")))
            loop = asyncio.get_running_loop()
            state = dict(s.get("state") or {})
            new_state, plan = {}, []
            for i, st in enumerate(s["streams"]):
                rs = run["streams"][i]
                rs["status"] = "extracting"
                _put_run(run)
                base = {"full": "overwrite", "append": "append", "merge": "merge"}[st["mode"]]
                out_dir = stage / st["table"]
                done = {"n": 0}

                def commit(states, _i=i, _st=st, _rs=rs, _done=done, _out=out_dir, _base=base):
                    # checkpoint inside a long read: load what is on disk, then remember the connector state
                    mode = _base if (_done["n"] == 0 or _base != "overwrite") else "append"
                    code = _load_code(schema, fmt, [_plan_item(c, _st, _i, _out, mode, stamp)], comment)
                    res = asyncio.run_coroutine_threadsafe(kernel_exec(code), loop).result()
                    it = (res.get("items") or [{}])[0]
                    if it.get("error"):
                        raise RuntimeError(it["error"])
                    _done["n"] += 1
                    _save_stream_state(s["id"], _st["table"], {**(state.get(_st["table"]) or {}), "airbyte_state": states})
                    for f in _out.glob("part-*"):
                        f.unlink(missing_ok=True)
                    _rs["checkpoints"] = _done["n"]
                    log(f"{_st['table']}: checkpoint {_done['n']} written to {schema}.{_st['table']} — a restart continues from here")
                    _put_run(run)
                try:
                    rows, ns = await asyncio.to_thread(_extract, c, st, state.get(st["table"]), out_dir, log,
                                                       commit if st["mode"] in ("append", "merge") else None)
                    new_state[st["table"]] = ns
                    left = out_dir.exists() and any(out_dir.glob("part-*"))
                    if rows and left:
                        rs.update(rows=rows, status="loading")
                        plan.append(_plan_item(c, st, i, out_dir, base if (done["n"] == 0 or base != "overwrite") else "append", stamp, state.get(st["table"])))
                    elif rows:                                   # everything already went in through checkpoints
                        rs.update(rows=rows, status="succeeded", table=f"{schema}.{st['table']}")
                    else:
                        rs.update(rows=0, status="no new data")
                except Exception as e:  # noqa: BLE001
                    rs.update(status="failed", error=str(getattr(e, "detail", None) or e)[:1500])
                log(f"{st['table']}: {rs['status']} ({rs['rows']:,} rows)")
                _put_run(run)
            if plan:
                log(f"Writing {len(plan)} table(s) to {schema} with Spark…")
                _put_run(run)
                res = await kernel_exec(_load_code(schema, fmt, plan, comment))
                for item in res.get("items") or []:
                    rs = run["streams"][item["i"]]
                    if item.get("error"):
                        rs.update(status="failed", error=item["error"])
                    else:
                        rs.update(status="succeeded", format=item.get("format"), table=f"{schema}.{rs['table']}")
                        tname = s["streams"][item["i"]]["table"]
                        if item.get("businesses") is not None and tname in new_state:
                            new_state[tname] = {**(new_state[tname] or {}), "businesses": item["businesses"]}
            # save state only for streams that fully succeeded (or had nothing new)
            with _lock:
                syncs = _load(SYNC_FILE, [])
                for x in syncs:
                    if x["id"] == s["id"]:
                        stt = x.setdefault("state", {})
                        for i, st in enumerate(s["streams"]):
                            if run["streams"][i]["status"] in ("succeeded", "no new data") and st["table"] in new_state:
                                stt[st["table"]] = new_state[st["table"]]
                _save(SYNC_FILE, syncs)
            bad = [x for x in run["streams"] if x["status"] == "failed"]
            run["status"] = "failed" if bad and len(bad) == len(run["streams"]) else "partial" if bad else "succeeded"
    except Exception as e:  # noqa: BLE001
        run["status"] = "failed"
        run["error"] = str(getattr(e, "evalue", None) or getattr(e, "detail", None) or e)[:2000]
        for x in run["streams"]:
            if x["status"] in ("waiting", "extracting", "loading"):
                x["status"] = "failed"
    finally:
        run["ended"] = time.time()
        run["seconds"] = round(run["ended"] - t0, 1)
        run["rows"] = sum(x.get("rows") or 0 for x in run["streams"] if x["status"] == "succeeded")
        _RUNNING.pop(s["id"], None)
        _put_run(run)
        shutil.rmtree(stage, ignore_errors=True)
        with _lock:
            syncs = _load(SYNC_FILE, [])
            for x in syncs:
                if x["id"] == s["id"]:
                    x["last_run"] = {k: run.get(k) for k in ("id", "status", "started", "ended", "seconds", "rows", "error")}
            _save(SYNC_FILE, syncs)
        if run["status"] in ("succeeded", "partial"):          # event: start syncs that wait for this one
            for x in syncs:
                sch = x.get("schedule") or {}
                if x.get("enabled", True) and sch.get("type") == "event" and sch.get("on") == "after_sync" and sch.get("after") == s["id"] and x["id"] not in _RUNNING:
                    try:
                        start_run(x["id"], trigger=f"after {s['name']}")
                    except HTTPException:
                        pass


TRANSFORM_FN = r"""
import re as __re2
from pyspark.sql import functions as __F2, Window as __W2
from pyspark.sql.types import StructType as __ST, ArrayType as __AT, StringType as __STR
def __db_cname(n):
    n = __re2.sub(r"[^0-9A-Za-z_]+", "_", str(n)).strip("_").lower() or "col"
    return ("c_" + n) if n[0].isdigit() else n
def __db_clean_cols(df):
    seen, out = set(), []
    for c in df.columns:
        n = __db_cname(c)
        while n in seen:
            n += "_2"
        seen.add(n)
        out.append(n)
    return df.toDF(*out) if out != df.columns else df
def __db_infer(df):
    # text columns from files/APIs -> real types (one pass); nested STRUCT/ARRAY columns are left as they are
    cs = [f.name for f in df.schema.fields if isinstance(f.dataType, __STR) and f.name not in ("source_file", "_source_file")]
    ex = []
    for k, c in enumerate(cs):
        q = "`%s`" % c.replace("`", "``")
        ex += [__F2.count(__F2.col(q)).alias("n%d" % k), __F2.expr("count(try_cast(%s as bigint))" % q).alias("i%d" % k),
               __F2.expr("count(try_cast(%s as double))" % q).alias("d%d" % k), __F2.expr("count(try_cast(%s as date))" % q).alias("t%d" % k),
               __F2.expr("count(try_cast(%s as timestamp))" % q).alias("s%d" % k), __F2.expr("count(case when lower(%s) in ('true','false') then 1 end)" % q).alias("b%d" % k),
               __F2.expr("count(case when %s rlike '^0[0-9]' then 1 end)" % q).alias("z%d" % k),
               __F2.expr("count(case when %s rlike ':' then 1 end)" % q).alias("c%d" % k)]
    r = df.agg(*ex).first() if ex else None
    for k, c in enumerate(cs):
        n = r["n%d" % k]
        if not n or r["z%d" % k]:
            continue
        t = ("bigint" if r["i%d" % k] == n else "double" if r["d%d" % k] == n else "boolean" if r["b%d" % k] == n
             else "date" if r["t%d" % k] == n and r["s%d" % k] == n and not r["c%d" % k]
             else "timestamp" if r["s%d" % k] == n else None)
        if t:
            df = df.withColumn(c, __F2.expr("try_cast(`%s` as %s)" % (c.replace("`", "``"), t)))
    return df
def __db_flatten(df, depth):
    for _ in range(int(depth)):
        if not any(isinstance(f.dataType, __ST) for f in df.schema.fields):
            break
        cols = []
        for f in df.schema.fields:
            if isinstance(f.dataType, __ST):
                cols += [__F2.col("`%s`.`%s`" % (f.name, sf.name)).alias(__db_cname(f.name + "_" + sf.name)) for sf in f.dataType.fields]
            else:
                cols.append(__F2.col("`%s`" % f.name))
        df = df.select(*cols)
    return df
def __db_colname(df, k):
    lk = str(k).lower()
    return next((c for c in df.columns if c.lower() == lk), k)
def __db_bsrc(df, name, skip):
    # business source column; a.b reaches into a nested STRUCT (e.g. location.id)
    parts = str(name).split(".")
    head = __db_colname(df, parts[0])
    if head not in df.columns or head in skip:
        return None
    e = __F2.col("`%s`" % head + "".join(".`%s`" % p for p in parts[1:])).cast("string")
    try:
        df.select(e).schema
    except Exception:
        return None
    return e
def __db_stamp(df, S):
    # tenant / business columns first; business = fixed code, or from a column mapped through the businesses' source IDs
    tc, bc = S["tcol"], S["bcol"]
    df = df.withColumn(tc, __F2.lit(S["tenant"]))
    if S.get("business"):
        df = df.withColumn(bc, __F2.lit(S["business"]))
    elif S.get("bfrom") and __db_bsrc(df, S["bfrom"], (tc, bc)) is not None:
        src = __db_bsrc(df, S["bfrom"], (tc, bc))
        e = None
        for k, v in (S.get("bmap") or {}).items():
            e = __F2.when(src == k, __F2.lit(v)) if e is None else e.when(src == k, __F2.lit(v))
        df = df.withColumn(bc, src if e is None else e.otherwise(src))
    else:
        df = df.withColumn(bc, __F2.lit(None).cast("string"))
    return df.select(tc, bc, *[c for c in df.columns if c not in (tc, bc)])
def __db_slice(df, S, prev=None):
    # the rows a full refresh replaces in a shared table: this tenant, and the businesses in the new data plus the ones
    # this sync wrote last time (so a business that disappeared or changed is replaced too); other tenants are untouched
    tc, bc = S["tcol"], S["bcol"]
    q = lambda v: "NULL" if v is None else "'" + str(v).replace("\\", "\\\\").replace("'", "\\'") + "'"
    vals = [r[0] for r in df.select(bc).distinct().limit(5000).collect()]
    allv = list(dict.fromkeys(vals + list(prev or [])))
    cond = "(`%s` <=> %s)" % (tc, q(S["tenant"]))
    if allv:
        cond += " AND (" + " OR ".join("(`%s` <=> %s)" % (bc, q(v)) for v in allv) + ")"
    return cond, vals
def __db_transform(df, T, mode=None, keys=None, cursor=None):
    T = T or {}
    ex = T.get("explode")
    if ex and ex in df.columns and isinstance(df.schema[ex].dataType, __AT):
        df = df.withColumn(ex, __F2.explode_outer(__F2.col("`%s`" % ex)))
    if T.get("flatten"):
        df = __db_flatten(df, 8 if T["flatten"] == "all" else T["flatten"])
    rules = {r["name"]: r for r in (T.get("columns") or [])}
    sel = []
    for c in df.columns:
        r = rules.get(c, {})
        if r.get("keep") is False:
            continue
        e, t = __F2.col("`%s`" % c), r.get("type")
        if t == "json":
            e = e if isinstance(df.schema[c].dataType, __STR) else __F2.to_json(e)
        elif t == "string":
            e = __F2.to_json(e) if isinstance(df.schema[c].dataType, (__ST, __AT)) else e.cast("string")
        elif t:
            e = __F2.expr("try_cast(`%s` as %s)" % (c, t))
        sel.append(e.alias(r.get("as") or c))
    df = df.select(*sel)
    for d in T.get("derived") or []:
        df = df.withColumn(d["name"], __F2.expr(d["expr"]))
    if T.get("filter"):
        df = df.where(__F2.expr(T["filter"]))
    dd = dict(T.get("dedup") or {})
    dkeys = [__db_colname(df, k) for k in (dd.get("keys") or []) if __db_colname(df, k) in df.columns]
    if not dkeys and mode == "merge" and keys:          # an upsert needs exactly one source row per key
        dkeys = [__db_colname(df, k) for k in keys if __db_colname(df, k) in df.columns]
        dd = {"order_by": cursor, "desc": True}
    if dkeys:
        ob = __db_colname(df, dd.get("order_by")) if dd.get("order_by") else None
        if ob and ob in df.columns:
            order = __F2.col("`%s`" % ob).desc_nulls_last() if dd.get("desc", True) else __F2.col("`%s`" % ob).asc_nulls_last()
        else:
            order = __F2.monotonically_increasing_id().desc()   # no order column: keep the last row read
        w = __W2.partitionBy(*[__F2.col("`%s`" % k) for k in dkeys]).orderBy(order)
        df = df.withColumn("__rn", __F2.row_number().over(w)).where("__rn = 1").drop("__rn")
    return df
def __db_read(it):
    if it.get("fmt") == "json":
        return __db_clean_cols(spark.read.option("mode", "PERMISSIVE").json(it["path"]))
    return spark.read.option("mergeSchema", "true").parquet(it["path"])
"""

_LOAD_CODE = r"""
__P = __j.loads(__PLAN__)
__res = []
for __it in __P["items"]:
    __bvals = None
    try:
        __df = __db_read(__it)
        if __it.get("infer"):
            __df = __db_infer(__df)
        __df = __db_transform(__df, __it.get("transform"), __it["mode"], __it.get("keys"), __it.get("cursor"))
        __keys = [__db_colname(__df, k) for k in (__it.get("keys") or [])]
        __where = None
        __S = __it.get("stamp")
        if __S:
            __df = __db_stamp(__df, __S)
            if __keys:
                __keys = [__S["tcol"], __S["bcol"]] + [k for k in __keys if k.lower() not in (__S["tcol"], __S["bcol"])]
            if __it["mode"] == "overwrite":
                __where, __bvals = __db_slice(__df, __S, __it.get("prev_businesses"))
        __df = __df.withColumn("_synced_at", __F.current_timestamp())
        __fmt = __db_save(__df, __P["schema"], __it["table"], __it["mode"], __P["fmt"], __P["comment"], __keys or None, __where)
        __res.append({"i": __it["i"], "format": __fmt, **({"businesses": __bvals} if __where else {})})
    except Exception as __e:
        __res.append({"i": __it["i"], "error": str(__e)[:1500]})
print("__DBH__" + __j.dumps({"items": __res}))
"""

_PREVIEW_CODE = r"""
import json as __jp
def __pv(v):
    if hasattr(v, "asDict"):
        return {k: __pv(x) for k, x in v.asDict(recursive=False).items()}
    if isinstance(v, (list, tuple)):
        return [__pv(x) for x in v]
    if isinstance(v, dict):
        return {str(k): __pv(x) for k, x in v.items()}
    if isinstance(v, float) and v != v:
        return None
    if type(v).__name__ == "Decimal":
        return float(v)
    return v
__it = __jp.loads(__ITEM__)
__df = __db_read(__it)
__raw = [{"name": f.name, "type": f.dataType.simpleString()} for f in __df.schema.fields]
if __it.get("infer"):
    __df = __db_infer(__df)
__typed = [{"name": f.name, "type": f.dataType.simpleString()} for f in __df.schema.fields]
__out = __db_transform(__df, __it.get("transform"), __it.get("mode"), __it.get("keys"), __it.get("cursor"))
__n_in = __df.count()
__rows = [[__pv(x) for x in r] for r in __out.limit(50).collect()]
print("__DBH__" + __jp.dumps({"source_columns": __typed, "columns": [f.name for f in __out.schema.fields],
      "types": [f.dataType.simpleString() for f in __out.schema.fields], "rows": __rows, "rows_in": __n_in, "rows_out": __out.count()}, default=str))
"""


async def transform_preview(cid, body):
    """Run the stream's mapping / transformation / dedup on a sample (up to 500 rows) with Spark and return the result."""
    from .datahub import SAVE_FN, file_uri, kernel_exec  # noqa: F401
    c = _get_conn(cid)
    stream = body.get("stream") or "data"
    tbl = _stream_table(stream)
    tr = _validate_transform(body.get("transform"), tbl)
    nested = body.get("nested") if body.get("nested") in ("struct", "flat") else "flat"
    kind = TYPES[c["type"]]["kind"]
    tmp = STAGE / ("tp-" + uuid.uuid4().hex[:8])
    tmp.mkdir(parents=True, exist_ok=True)
    try:
        def build():
            if kind == "airbyte" or (kind == "api" and nested == "struct"):
                recs = _airbyte_records(c, stream, 500) if kind == "airbyte" else next(_api_pages(c["config"], 1), [])[:500]
                with open(tmp / "part-00000.json", "w", encoding="utf-8") as fh:
                    for r in recs:
                        fh.write(json.dumps(r if isinstance(r, dict) else {"value": r}, default=str, ensure_ascii=False) + "\n")
                return "json"
            df = _preview_df(c, stream, 500)
            _write_part(df, tmp / "part-00000.parquet", kind != "db")
            return "parquet"
        fmt = await asyncio.to_thread(build)
        item = {"path": file_uri(tmp), "fmt": fmt, "infer": kind != "db", "transform": tr, "mode": body.get("mode"),
                "keys": body.get("keys") or [], "cursor": body.get("cursor")}
        return await kernel_exec(TRANSFORM_FN + _PREVIEW_CODE.replace("__ITEM__", repr(json.dumps(item))))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def run_by_hook(token):
    s = next((x for x in _load(SYNC_FILE, []) if token and secrets.compare_digest(str(x.get("hook") or ""), token)), None)
    if not s:
        raise HTTPException(404, "Unknown trigger URL")
    if not s.get("enabled", True):
        raise HTTPException(409, "This sync is turned off")
    run = start_run(s["id"], trigger="webhook")
    return {"run_id": run["id"], "sync": s["name"], "status": run["status"]}


def _files_changed(s):
    """Event trigger 'when new files arrive': any file not loaded yet (or changed since)."""
    c = _get_conn(s["connection_id"])
    for st in s["streams"]:
        seen = ((s.get("state") or {}).get(st["table"]) or {}).get("files") or {}
        with _Files(c["type"], c["config"]) as fs:
            for f in fs.list(st["source"]):
                if seen.get(f["path"]) != [f["size"], f["mtime"]]:
                    return True
    return False


def mark_interrupted():
    """At startup: runs that were in progress when DataBridge stopped are marked failed."""
    rs = _load(RUN_FILE, [])
    changed = False
    for r in rs:
        if r.get("status") in ("queued", "running"):
            r.update(status="failed", error="Interrupted (DataBridge was restarted)", ended=r.get("ended") or time.time())
            changed = True
    if changed:
        _save(RUN_FILE, rs)
    shutil.rmtree(STAGE, ignore_errors=True)


async def scheduler_loop():
    """Every few seconds: start due syncs (real-time / interval / daily) and watch folders for 'new files' events."""
    await asyncio.to_thread(mark_interrupted)
    watched = {}                                   # sync id -> last time its folder was checked
    while True:
        await asyncio.sleep(5)
        try:
            now = time.time()
            watch_every = max(10, int(env("DATAHUB_WATCH_SECONDS", "30") or 30))
            for s in _load(SYNC_FILE, []):
                if s["id"] in _RUNNING or not s.get("enabled", True):
                    continue
                sch = s.get("schedule") or {}
                if sch.get("type") == "event" and sch.get("on") == "files":
                    if now - watched.get(s["id"], 0) >= watch_every:
                        watched[s["id"]] = now
                        try:
                            if await asyncio.to_thread(_files_changed, s):
                                start_run(s["id"], trigger="new files")
                        except Exception:  # noqa: BLE001 - folder offline: try again next time
                            pass
                    continue
                nxt = _next_run(s)
                if nxt and nxt <= now:
                    try:
                        start_run(s["id"], trigger="real-time" if sch.get("type") == "realtime" else "schedule")
                    except HTTPException:
                        pass
        except asyncio.CancelledError:
            raise
        except Exception:  # noqa: BLE001
            pass
