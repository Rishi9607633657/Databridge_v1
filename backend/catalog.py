"""Catalog: browse the Hive Metastore (direct Postgres read) or via Spark SHOW/DESCRIBE; table actions via Spark."""
import json
import re
from datetime import datetime, timezone

import psycopg2
import psycopg2.extras
from fastapi import HTTPException

from .kernels import run_sql
from .settings import settings

IDENT = re.compile(r"^[A-Za-z0-9_]+$")


def q(name: str) -> str:
    if not IDENT.match(name or ""):
        raise HTTPException(400, f"Invalid identifier: {name!r}")
    return f"`{name}`"


# ---------------- Metastore (Postgres) backend ----------------
def _conn():
    if not settings.metastore_dsn:
        raise HTTPException(503, "METASTORE_DSN is not set")
    try:
        return psycopg2.connect(settings.metastore_dsn, connect_timeout=10)
    except psycopg2.OperationalError as e:
        raise HTTPException(503, f"Cannot connect to the Hive Metastore database: {str(e).strip()}. "
                                 "Check METASTORE_DSN in .env and the Postgres firewall rules.")


def _fetch(sql, params=()):
    c = _conn()
    try:
        with c, c.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(sql, params)
            return [dict(r) for r in cur.fetchall()]
    except psycopg2.Error as e:
        raise HTTPException(500, f"Metastore query failed: {str(e).strip()}")
    finally:
        c.close()


def _ts(v):
    return datetime.fromtimestamp(v, tz=timezone.utc).isoformat() if v else None


def _type_str(t):
    if isinstance(t, str):
        return t
    kind = t.get("type")
    if kind == "struct":
        return "struct<" + ",".join(f"{f['name']}:{_type_str(f['type'])}" for f in t["fields"]) + ">"
    if kind == "array":
        return f"array<{_type_str(t['elementType'])}>"
    if kind == "map":
        return f"map<{_type_str(t['keyType'])},{_type_str(t['valueType'])}>"
    return json.dumps(t)


def _ms_databases():
    rows = _fetch('SELECT "NAME" AS name, "DESC" AS comment, "DB_LOCATION_URI" AS location, '
                  '"OWNER_NAME" AS owner FROM "DBS" ORDER BY "NAME"')
    return rows


def _ms_tables(db):
    return _fetch(
        'SELECT t."TBL_NAME" AS name, t."TBL_TYPE" AS table_type, t."OWNER" AS owner, '
        't."CREATE_TIME" AS create_time, p."PARAM_VALUE" AS provider '
        'FROM "TBLS" t JOIN "DBS" d ON d."DB_ID" = t."DB_ID" '
        'LEFT JOIN "TABLE_PARAMS" p ON p."TBL_ID" = t."TBL_ID" AND p."PARAM_KEY" = \'spark.sql.sources.provider\' '
        'WHERE d."NAME" = %s ORDER BY t."TBL_NAME"', (db,))


def _ms_table(db, table):
    rows = _fetch(
        'SELECT t."TBL_ID", t."TBL_NAME", t."TBL_TYPE", t."OWNER", t."CREATE_TIME", t."LAST_ACCESS_TIME", '
        's."LOCATION", s."INPUT_FORMAT", s."CD_ID", s."SERDE_ID" '
        'FROM "TBLS" t JOIN "DBS" d ON d."DB_ID" = t."DB_ID" LEFT JOIN "SDS" s ON s."SD_ID" = t."SD_ID" '
        'WHERE d."NAME" = %s AND t."TBL_NAME" = %s', (db, table))
    if not rows:
        raise HTTPException(404, "Table not found")
    t = rows[0]
    params = {r["PARAM_KEY"]: r["PARAM_VALUE"] for r in _fetch(
        'SELECT "PARAM_KEY", "PARAM_VALUE" FROM "TABLE_PARAMS" WHERE "TBL_ID" = %s', (t["TBL_ID"],))}
    serde = {}
    if t["SERDE_ID"]:
        serde = {r["PARAM_KEY"]: r["PARAM_VALUE"] for r in _fetch(
            'SELECT "PARAM_KEY", "PARAM_VALUE" FROM "SERDE_PARAMS" WHERE "SERDE_ID" = %s', (t["SERDE_ID"],))}

    columns, partitions = [], []
    schema_json = params.get("spark.sql.sources.schema")
    if not schema_json and params.get("spark.sql.sources.schema.numParts"):
        n = int(params["spark.sql.sources.schema.numParts"])
        schema_json = "".join(params.get(f"spark.sql.sources.schema.part.{i}", "") for i in range(n))
    if schema_json:
        for f in json.loads(schema_json).get("fields", []):
            columns.append({"name": f["name"], "type": _type_str(f["type"]), "nullable": f.get("nullable", True),
                            "comment": (f.get("metadata") or {}).get("comment", "")})
        n = int(params.get("spark.sql.sources.schema.numPartCols", "0"))
        partitions = [params.get(f"spark.sql.sources.schema.partCol.{i}") for i in range(n)]
    elif t["CD_ID"]:
        for r in _fetch('SELECT "COLUMN_NAME", "TYPE_NAME", "COMMENT" FROM "COLUMNS_V2" WHERE "CD_ID" = %s '
                        'ORDER BY "INTEGER_IDX"', (t["CD_ID"],)):
            columns.append({"name": r["COLUMN_NAME"], "type": r["TYPE_NAME"], "nullable": True,
                            "comment": r["COMMENT"] or ""})
        pk = _fetch('SELECT "PKEY_NAME", "PKEY_TYPE" FROM "PARTITION_KEYS" WHERE "TBL_ID" = %s '
                    'ORDER BY "INTEGER_IDX"', (t["TBL_ID"],))
        partitions = [r["PKEY_NAME"] for r in pk]
        columns += [{"name": r["PKEY_NAME"], "type": r["PKEY_TYPE"], "nullable": True, "comment": "partition"}
                    for r in pk]

    location = serde.get("path") or t["LOCATION"]
    hidden = ("spark.sql.sources.schema",)
    props = {k: v for k, v in params.items() if not k.startswith(hidden)}
    return {"database": db, "name": table, "table_type": t["TBL_TYPE"], "owner": t["OWNER"],
            "created": _ts(t["CREATE_TIME"]), "provider": params.get("spark.sql.sources.provider", "hive"),
            "location": location, "input_format": t["INPUT_FORMAT"], "columns": columns,
            "partition_columns": partitions, "properties": props}


# ---------------- Spark backend ----------------
async def _sp_databases():
    r = await run_sql("SHOW DATABASES")
    return [{"name": row[0], "comment": None, "location": None, "owner": None} for row in r["rows"]]


async def _sp_tables(db):
    r = await run_sql(f"SHOW TABLES IN {q(db)}")
    ci = r["columns"].index("tableName")
    ti = r["columns"].index("isTemporary") if "isTemporary" in r["columns"] else None
    return [{"name": row[ci], "table_type": "TEMPORARY" if ti is not None and row[ti] else None,
             "owner": None, "create_time": None, "provider": None} for row in r["rows"]]


async def _sp_table(db, table):
    r = await run_sql(f"DESCRIBE TABLE EXTENDED {q(db)}.{q(table)}")
    columns, partitions, info, section = [], [], {}, "cols"
    for name, dtype, comment in r["rows"]:
        name = (name or "").strip()
        if name == "# Partition Information":
            section = "parts"
            continue
        if name.startswith("# Detailed Table Information"):
            section = "info"
            continue
        if name.startswith("#") or (not name and not dtype):
            continue
        if section == "cols":
            columns.append({"name": name, "type": dtype, "nullable": True, "comment": comment or ""})
        elif section == "parts":
            partitions.append(name)
        else:
            info[name] = dtype
    return {"database": db, "name": table, "table_type": info.get("Type"), "owner": info.get("Owner"),
            "created": info.get("Created Time"), "provider": info.get("Provider"),
            "location": info.get("Location"), "input_format": info.get("InputFormat"), "columns": columns,
            "partition_columns": partitions,
            "properties": {k: v for k, v in info.items() if k not in ("Type", "Owner", "Created Time", "Provider", "Location")}}


# ---------------- Public API ----------------
def _use_ms():
    return settings.catalog_backend == "metastore"


async def databases():
    return _ms_databases() if _use_ms() else await _sp_databases()


async def tables(db):
    q(db)
    rows = _ms_tables(db) if _use_ms() else await _sp_tables(db)
    for r in rows:
        r["created"] = _ts(r.pop("create_time", None)) if isinstance(r.get("create_time"), int) else None
    return rows


async def table(db, name):
    q(db), q(name)
    return _ms_table(db, name) if _use_ms() else await _sp_table(db, name)


async def sample(db, name, limit=100):
    return await run_sql(f"SELECT * FROM {q(db)}.{q(name)} LIMIT {int(limit)}", limit)


async def history(db, name):
    return await run_sql(f"DESCRIBE HISTORY {q(db)}.{q(name)}", 200)


async def ddl(db, name):
    r = await run_sql(f"SHOW CREATE TABLE {q(db)}.{q(name)}", 1)
    return {"ddl": r["rows"][0][0] if r["rows"] else ""}


async def create_schema(name, comment=None, location=None):
    sql = f"CREATE SCHEMA IF NOT EXISTS {q(name)}"
    if comment:
        sql += " COMMENT " + json.dumps(comment)
    if location:
        sql += " LOCATION " + json.dumps(location)
    await run_sql(sql)
    return {"ok": True}


async def drop_table(db, name):
    await run_sql(f"DROP TABLE IF EXISTS {q(db)}.{q(name)}")
    return {"ok": True}


async def search(term: str, limit: int = 20):
    if _use_ms():
        return _fetch('SELECT d."NAME" AS database, t."TBL_NAME" AS name FROM "TBLS" t JOIN "DBS" d '
                      'ON d."DB_ID" = t."DB_ID" WHERE t."TBL_NAME" ILIKE %s ORDER BY t."TBL_NAME" LIMIT %s',
                      (f"%{term}%", limit))
    return []
