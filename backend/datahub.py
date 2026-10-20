"""Data Hub › Import file: CSV / Excel upload -> preview & type detection -> column mapping -> Delta table.

Flow: upload (raw body) -> staged under .stratum/uploads/<id>/ -> preview() parses with pandas ->
load() applies the mapping in pandas, writes a clean CSV, and a Spark kernel reads it with an explicit
schema and saves a Delta table (Parquet if Delta is not available). History is kept in imports.json."""
import csv
import io
import json
import re
import shutil
import time
import uuid
from pathlib import Path

import pandas as pd
from fastapi import HTTPException

from .kernels import SQL_KEY, SqlError, kernels
from .settings import DATA_ROOT, env
import asyncio

UP = DATA_ROOT / ".stratum" / "uploads"
HIST = DATA_ROOT / ".stratum" / "imports.json"
MAX_BYTES = 200 * 1024 * 1024
EXT = {".csv", ".tsv", ".txt", ".xlsx", ".xlsm", ".xls", ".json", ".jsonl", ".ndjson", ".parquet"}
EXCEL = (".xlsx", ".xlsm", ".xls")
TYPES = ["string", "bigint", "double", "decimal(18,2)", "boolean", "date", "timestamp"]
_TRUE = {"true", "yes", "y", "1", "t"}
_FALSE = {"false", "no", "n", "0", "f"}
_ID = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,127}$")


def _dir(uid):
    if not re.fullmatch(r"[a-f0-9]{32}", uid or ""):
        raise HTTPException(400, "Bad upload id")
    d = UP / uid
    if not d.exists():
        raise HTTPException(404, "Upload not found (it may have expired). Upload the file again.")
    return d


def _meta(d):
    return json.loads((d / "meta.json").read_text(encoding="utf-8"))


def clean_name(s, i=0):
    s = re.sub(r"[^0-9A-Za-z]+", "_", str(s or "").strip()).strip("_").lower()
    if not s or s.startswith("unnamed"):
        s = f"col_{i + 1}"
    if s[0].isdigit():
        s = "c_" + s
    return s[:120]


def _gc():
    """Remove staged uploads older than 2 days."""
    if not UP.exists():
        return
    cut = time.time() - 2 * 86400
    for d in UP.iterdir():
        try:
            if d.stat().st_mtime < cut:
                shutil.rmtree(d, ignore_errors=True)
        except OSError:
            pass


def save_upload(filename, data: bytes, user):
    name = (filename or "upload.csv").replace("\\", "/").split("/")[-1][:200]
    ext = ("." + name.rsplit(".", 1)[-1].lower()) if "." in name else ""
    if ext not in EXT:
        raise HTTPException(400, "Upload a CSV, TSV, TXT, Excel (.xlsx/.xls), JSON / JSON Lines or Parquet file")
    if not data:
        raise HTTPException(400, "The file is empty")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File is larger than 200 MB. Use a connector or load it with a notebook.")
    _gc()
    uid = uuid.uuid4().hex
    d = UP / uid
    d.mkdir(parents=True)
    (d / ("source" + ext)).write_bytes(data)
    meta = {"id": uid, "filename": name, "ext": ext, "size": len(data), "user": user, "created": time.time()}
    if ext in EXCEL:
        try:
            meta["sheets"] = pd.ExcelFile(d / ("source" + ext)).sheet_names
        except Exception as e:  # noqa: BLE001
            shutil.rmtree(d, ignore_errors=True)
            raise HTTPException(400, f"Cannot open this Excel file: {e}. For .xls install xlrd (pip install xlrd).")
    (d / "meta.json").write_text(json.dumps(meta), encoding="utf-8")
    return meta


def _sniff(raw: bytes, encoding):
    text = raw[:65536].decode(encoding, errors="replace")
    try:
        return csv.Sniffer().sniff(text, delimiters=",;\t|").delimiter
    except csv.Error:
        return ","


def _encoding(raw: bytes):
    for enc in ("utf-8-sig", "utf-8"):
        try:
            raw[:200000].decode(enc)
            return enc
        except UnicodeDecodeError:
            pass
    return "latin-1"


def _json_frame(raw: bytes):
    text = raw.decode(_encoding(raw), errors="replace").strip()
    try:
        data = json.loads(text)
    except ValueError:                                     # JSON Lines
        data = [json.loads(ln) for ln in text.splitlines() if ln.strip()]
    if isinstance(data, dict):                             # {"data": [...]} or a single object
        lists = [v for v in data.values() if isinstance(v, list) and v and isinstance(v[0], dict)]
        data = lists[0] if len(lists) == 1 else [data]
    if not isinstance(data, list):
        raise HTTPException(400, "JSON must be an array of objects, an object holding one, or JSON Lines")
    df = pd.json_normalize(data, sep="_")
    for c in df.columns:                                   # nested lists/objects -> JSON text
        if df[c].map(lambda x: isinstance(x, (list, dict))).any():
            df[c] = df[c].map(lambda x: json.dumps(x) if isinstance(x, (list, dict)) else x)
    return df


def _read(d, meta, opts, nrows=None):
    src = d / ("source" + meta["ext"])
    header = 0 if opts.get("header", True) else None
    skip = int(opts.get("skip_rows") or 0)
    ext = meta["ext"]
    if ext in EXCEL:
        sheet = opts.get("sheet") or (meta.get("sheets") or [0])[0]
        df = pd.read_excel(src, sheet_name=sheet, header=header, skiprows=skip, nrows=nrows, dtype=object)
        info = {"sheet": sheet}
    elif ext == ".parquet":
        try:
            if nrows:                               # preview: read only the first batch
                import pyarrow.parquet as pq
                batch = next(pq.ParquetFile(src).iter_batches(batch_size=nrows), None)
                df = batch.to_pandas() if batch is not None else pd.DataFrame()
            else:
                df = pd.read_parquet(src)
        except ImportError:
            raise HTTPException(400, "Parquet needs pyarrow: run  pip install pyarrow  and restart DataBridge")
        return df.dropna(how="all"), {"format": "parquet"}
    elif ext in (".json", ".jsonl", ".ndjson"):
        try:
            df = _json_frame(src.read_bytes())
        except HTTPException:
            raise
        except Exception as e:  # noqa: BLE001
            raise HTTPException(400, f"Cannot parse the JSON file: {e}")
        if nrows:
            df = df.head(nrows)
        return df.dropna(how="all"), {"format": "json"}
    else:
        if nrows:                                   # preview: the first few MB are enough
            with open(src, "rb") as fh:
                raw = fh.read(8 * 1024 * 1024)
            if len(raw) == 8 * 1024 * 1024 and b"\n" in raw:
                raw = raw[:raw.rfind(b"\n") + 1]
        else:
            raw = src.read_bytes()
        enc = opts.get("encoding") or _encoding(raw)
        delim = opts.get("delimiter") or ("\t" if ext == ".tsv" else _sniff(raw, enc))
        try:
            df = pd.read_csv(io.BytesIO(raw), sep=delim, header=header, skiprows=skip, nrows=nrows, dtype=str,
                             keep_default_na=False, na_values=[""], encoding=enc, engine="python" if len(delim) > 1 else "c",
                             on_bad_lines="warn")
        except Exception as e:  # noqa: BLE001
            raise HTTPException(400, f"Cannot parse the file: {e}")
        info = {"encoding": enc, "delimiter": delim}
    df = df.dropna(how="all")
    if header is None:
        df.columns = [f"col_{i + 1}" for i in range(len(df.columns))]
    return df, info


def _is_blank(s):
    return s.isna() | (s.astype(str).str.strip() == "")


def infer_type(s: pd.Series):
    v = s[~_is_blank(s)]
    if v.empty:
        return "string"
    if pd.api.types.is_bool_dtype(v) or v.map(lambda x: isinstance(x, bool)).all():
        return "boolean"
    if v.map(lambda x: hasattr(x, "year") and hasattr(x, "month")).all():   # Excel date / datetime cells
        v = pd.to_datetime(v, errors="coerce")
    if pd.api.types.is_datetime64_any_dtype(v):
        return "date" if (v.dt.normalize() == v).all() else "timestamp"
    sv = v.astype(str).str.strip()
    low = sv.str.lower()
    if low.isin(_TRUE | _FALSE).all() and low.isin({"true", "false", "yes", "no", "y", "n", "t", "f"}).any():
        return "boolean"
    if sv.str.match(r"^0\d+$").any():          # leading zeros: ids, pin codes, phone numbers -> keep as text
        return "string"
    num = pd.to_numeric(sv.str.replace(",", "", regex=False), errors="coerce")
    if num.notna().mean() >= 0.98:
        if (num.dropna() % 1 == 0).all() and num.abs().max() < 2**62:
            return "bigint"
        return "double"
    if sv.str.contains(r"\d").all() and sv.str.len().between(6, 32).all():
        dt = _to_dt(sv)
        if dt.notna().mean() >= 0.95:
            d = dt.dropna()
            return "date" if (d.dt.normalize() == d).all() and not sv.str.contains(r"\d:\d").any() else "timestamp"
    return "string"


def _to_dt(sv):
    iso = sv.str.match(r"^\d{4}-\d{2}-\d{2}").mean() > 0.5
    try:
        return pd.to_datetime(sv, errors="coerce", dayfirst=not iso, format="mixed")
    except (TypeError, ValueError):
        return pd.to_datetime(sv, errors="coerce", dayfirst=not iso)


def preview(uid, opts):
    d = _dir(uid)
    meta = _meta(d)
    df, info = _read(d, meta, opts, nrows=5000)
    cols, seen = [], set()
    for i, c in enumerate(df.columns):
        n = clean_name(c, i)
        while n in seen:
            n += "_2"
        seen.add(n)
        s = df[c]
        cols.append({"source": str(c), "name": n, "type": infer_type(s), "include": True,
                     "nulls": int(_is_blank(s).sum()), "distinct": int(s.nunique(dropna=True)),
                     "sample": [None if pd.isna(x) else str(x)[:60] for x in s.head(3).tolist()]})
    rows = [[None if pd.isna(x) else (x.isoformat() if hasattr(x, "isoformat") else str(x)) for x in r]
            for r in df.head(50).itertuples(index=False)]
    base = clean_name(meta["filename"].rsplit(".", 1)[0]) or "imported"
    if info.get("sheet") and len(meta.get("sheets") or []) > 1:
        base = f"{base}_{clean_name(info['sheet'])}"
    return {"upload": meta, "options": info, "columns": cols, "rows": rows, "headers": [str(c) for c in df.columns],
            "rows_scanned": len(df), "suggested_table": base, "types": TYPES}


def _convert(s: pd.Series, t):
    blank = _is_blank(s)
    sv = s.astype(str).str.strip()
    if t == "string":
        out = s.where(~blank, None).map(lambda x: None if x is None or (isinstance(x, float) and pd.isna(x)) else str(x))
        return out, 0
    if t in ("bigint", "double") or t.startswith("decimal"):
        num = pd.to_numeric(sv.str.replace(",", "", regex=False).str.replace(r"^[₹$€£]\s*", "", regex=True), errors="coerce")
        if t == "bigint":
            bad_frac = num.notna() & (num % 1 != 0)
            num = num.where(~bad_frac)
            out = num.map(lambda x: "" if pd.isna(x) else str(int(x)))
        else:
            out = num.map(lambda x: "" if pd.isna(x) else repr(float(x)))
        return out, int((num.isna() & ~blank).sum())
    if t == "boolean":
        low = sv.str.lower()
        out = low.map(lambda x: "true" if x in _TRUE else "false" if x in _FALSE else "")
        return out, int(((out == "") & ~blank).sum())
    if t in ("date", "timestamp"):
        dt = s if pd.api.types.is_datetime64_any_dtype(s) else _to_dt(sv)
        if not pd.api.types.is_datetime64_any_dtype(dt):
            dt = pd.to_datetime(dt, errors="coerce")
        fmt = "%Y-%m-%d" if t == "date" else "%Y-%m-%d %H:%M:%S"
        out = dt.dt.strftime(fmt).fillna("")
        return out, int((dt.isna() & ~blank).sum())
    raise HTTPException(400, f"Unknown type {t}")


def _hist():
    try:
        return json.loads(HIST.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def _hist_add(rec):
    h = [rec] + _hist()
    HIST.parent.mkdir(parents=True, exist_ok=True)
    HIST.write_text(json.dumps(h[:200], indent=1), encoding="utf-8")


def history():
    return _hist()


async def load(uid, body, user):
    d = _dir(uid)
    meta = _meta(d)
    schema, table = (body.get("schema") or "default").strip(), (body.get("table") or "").strip()
    mode = body.get("mode") or "create"
    fmt = body.get("format") or "delta"
    if not _ID.match(schema) or not _ID.match(table):
        raise HTTPException(400, "Schema and table names: letters, digits and _ only; must not start with a digit")
    if mode not in ("create", "overwrite", "append"):
        raise HTTPException(400, "mode must be create, overwrite or append")
    if fmt not in ("delta", "parquet"):
        raise HTTPException(400, "format must be delta or parquet")
    cols = [c for c in body.get("columns") or [] if c.get("include", True)]
    if not cols:
        raise HTTPException(400, "Select at least one column")
    names = [c["name"].strip().lower() for c in cols]
    for n in names:
        if not _ID.match(n):
            raise HTTPException(400, f"Bad column name: {n!r}")
    if len(set(names)) != len(names):
        raise HTTPException(400, "Column names must be unique")
    for c in cols:
        if c.get("type") not in TYPES:
            raise HTTPException(400, f"Unknown type for {c['name']}: {c.get('type')}")

    t0 = time.time()
    df, info = _read(d, meta, body.get("options") or {})
    out, issues = pd.DataFrame(index=df.index), {}
    for c, n in zip(cols, names):
        if c["source"] not in df.columns:
            src = next((x for x in df.columns if str(x) == c["source"]), None)
            if src is None:
                raise HTTPException(400, f"Column {c['source']!r} is not in the file")
            c["source"] = src
        out[n], bad = _convert(df[c["source"]], c["type"])
        if bad:
            issues[n] = bad
    if body.get("dedupe"):
        out = out.drop_duplicates()
    if body.get("drop_empty"):
        out = out[~out.replace("", None).isna().all(axis=1)]
    clean = d / "clean"
    shutil.rmtree(clean, ignore_errors=True)
    clean.mkdir()
    out.to_csv(clean / "part-0.csv", index=False, header=True, na_rep="", quoting=csv.QUOTE_MINIMAL, encoding="utf-8")
    ddl = ", ".join(f"`{n}` {'string' if c['type'] in ('date', 'timestamp') else c['type']}" for c, n in zip(cols, names))
    casts = [(n, c["type"]) for c, n in zip(cols, names) if c["type"] in ("date", "timestamp")]
    code = _spark_code(str(clean.resolve()), ddl, casts, schema, table, mode, fmt, body.get("comment") or f"Imported from {meta['filename']}")
    res = await kernel_exec(code)
    rec = {"id": uuid.uuid4().hex[:12], "file": meta["filename"], "sheet": info.get("sheet"), "schema": schema, "table": table,
           "mode": mode, "format": res.get("format", fmt), "rows": res.get("rows", len(out)), "columns": len(cols),
           "issues": issues, "user": user, "at": time.time(), "seconds": round(time.time() - t0, 1)}
    _hist_add(rec)
    return rec


_WARM = {"task": None}


def warm():
    """Start the Spark kernel in the background (called when Data Hub opens). Returns immediately."""
    t = _WARM["task"]
    if t is None or t.done():
        _WARM["task"] = asyncio.create_task(_start_kernel())
    return {"warming": True}


REGISTER_CODE = r"""
import json as __j
__out = []
try:
    if spark.conf.get("spark.sql.catalogImplementation", "in-memory") == "in-memory":
        __jv = spark._jvm
        __wh = __jv.org.apache.hadoop.fs.Path(spark.conf.get("spark.sql.warehouse.dir"))
        __fs = __wh.getFileSystem(spark._jsc.hadoopConfiguration())
        if __fs.exists(__wh):
            for __d in __fs.listStatus(__wh):
                if not __d.isDirectory():
                    continue
                __n = __d.getPath().getName()
                __db, __items = (__n[:-3], __fs.listStatus(__d.getPath())) if __n.endswith(".db") else ("default", [__d])
                for __t in __items:
                    __tp = __t.getPath()
                    if __t.isDirectory() and __fs.exists(__jv.org.apache.hadoop.fs.Path(__tp, "_delta_log")):
                        if not spark.catalog.tableExists("%s.%s" % (__db, __tp.getName())):
                            spark.sql("CREATE DATABASE IF NOT EXISTS `%s`" % __db)
                            spark.sql("CREATE TABLE IF NOT EXISTS `%s`.`%s` USING DELTA LOCATION '%s'" % (__db, __tp.getName(), __tp.toString()))
                            __out.append("%s.%s" % (__db, __tp.getName()))
except Exception as __e:
    __out.append("error: " + str(__e)[:200])
print("__DBH__" + __j.dumps({"registered": __out}))
"""


async def _start_kernel():
    try:
        ks = await kernels.get_or_start(SQL_KEY, "SQL Editor")
        await kernels.wait_ready(ks)
        await kernel_exec(REGISTER_CODE)          # bring back Delta tables the in-memory catalog forgot
    except Exception:  # noqa: BLE001 - the real call will show the error
        pass


async def prewarm():
    if (env("SPARK_PREWARM", "true") or "").lower() in ("1", "true", "yes"):
        await asyncio.sleep(3)                      # let the web server come up first
        await _start_kernel()


async def kernel_exec(code, label="SQL Editor"):
    """Run Python in the shared Spark kernel; return the JSON printed after __DBH__."""
    ks = await kernels.get_or_start(SQL_KEY, label)
    outs = []

    async def collect(o):
        outs.append(o)

    status, _ = await ks.execute(code, collect, store_history=False)
    if status != "ok":
        err = next((o for o in outs if o["output_type"] == "error"), None)
        if err:
            raise SqlError(err["ename"], err["evalue"], err["traceback"])
        raise SqlError("Aborted", "The kernel was restarted or interrupted.", [])
    text = "".join(o.get("text", "") for o in outs if o["output_type"] == "stream")
    m = re.search(r"__DBH__(\{.*\})", text)
    return json.loads(m.group(1)) if m else {}


def file_uri(path) -> str:
    """Local path -> URI Spark/Hadoop accept on Windows and Linux (file:///C:/x/y, file:///home/x)."""
    return Path(path).resolve().as_uri()


# Python defined inside the kernel: save a DataFrame as a table, safely, for create / overwrite / append.
SAVE_FN = r"""
if 'spark' not in globals():
    raise RuntimeError("No Spark session in the SQL kernel. Check config/spark_init.py and that pyspark is installed.")
import json as __j
from pyspark.sql import functions as __F
def __db_exists(schema, table):
    try:
        return spark.sql("SHOW TABLES IN `%s` LIKE '%s'" % (schema, table)).count() > 0
    except Exception:
        return False
def __db_provider(name):
    try:
        for r in spark.sql("DESCRIBE TABLE EXTENDED " + name).collect():
            if (r[0] or "").strip() == "Provider":
                return (r[1] or "").strip().lower() or None
    except Exception:
        return None
    return None
def __db_table_loc(name):
    try:
        for r in spark.sql("DESCRIBE TABLE EXTENDED " + name).collect():
            if (r[0] or "").strip() == "Location":
                return (r[1] or "").strip() or None
    except Exception:
        return None
    return None
def __db_rm(loc):
    if not loc:
        return
    try:
        p = spark._jvm.org.apache.hadoop.fs.Path(loc)
        fs = p.getFileSystem(spark._jsc.hadoopConfiguration())
        if fs.exists(p):
            fs.delete(p, True)
    except Exception:
        pass
def __db_wipe(schema, table):
    # drop the table (even a broken entry the Delta catalog refuses to drop) and remove its folder
    name = "`%s`.`%s`" % (schema, table)
    real = __db_table_loc(name)
    try:
        spark.sql("DROP TABLE IF EXISTS " + name)
    except Exception:
        pass
    try:   # bypass the Delta catalog: drop straight from Spark's session catalog (in-memory or Hive metastore)
        jv = spark._jvm
        ident = jv.org.apache.spark.sql.catalyst.TableIdentifier(table, jv.scala.Some(schema))
        spark._jsparkSession.sessionState().catalog().dropTable(ident, True, True)
    except Exception:
        pass
    try:
        spark.catalog.clearCache()
    except Exception:
        pass
    __db_rm(real)
    __db_rm(__db_loc(schema, table))
def __db_loc(schema, table):
    try:
        for r in spark.sql("DESCRIBE SCHEMA EXTENDED `%s`" % schema).collect():
            if (r[0] or "").strip().lower() == "location":
                return (r[1] or "").rstrip("/") + "/" + table.lower()
    except Exception:
        return None
    return None
def __db_adopt(schema, table):
    # the catalog forgot the table (in-memory catalog + restart) but its Delta folder is still there: register it again
    loc = __db_loc(schema, table)
    try:
        p = spark._jvm.org.apache.hadoop.fs.Path(loc + "/_delta_log")
        if loc and p.getFileSystem(spark._jsc.hadoopConfiguration()).exists(p):
            spark.sql("CREATE TABLE IF NOT EXISTS `%s`.`%s` USING DELTA LOCATION '%s'" % (schema, table, loc.replace("'", "\\'")))
            return True
    except Exception:
        return False
    return False
def __db_no_delta(e):
    m = str(e).lower()
    return "delta" in m and ("failed to find" in m or "classnotfound" in m or "not found" in m or "cannot find" in m)
def __db_create(df, schema, table, fmt):
    name = "`%s`.`%s`" % (schema, table)
    try:
        df.write.mode("overwrite").format(fmt).saveAsTable(name)
        return fmt
    except Exception as e:
        if fmt == "delta" and __db_no_delta(e):
            __db_wipe(schema, table)
            df.write.mode("overwrite").format("parquet").saveAsTable(name)
            return "parquet"
    # a broken / non-Delta leftover blocks the catalog write ("does not support truncate"): clean everything, retry
    __db_wipe(schema, table)
    try:
        df.write.mode("overwrite").format(fmt).saveAsTable(name)
        return fmt
    except Exception:
        pass
    # last resort: write the files by path, then register the table on that folder
    __db_wipe(schema, table)
    loc = __db_loc(schema, table)
    if not loc:
        raise ValueError("Could not write %s: the table is broken and its folder could not be found" % name)
    df.write.mode("overwrite").option("overwriteSchema", "true").format(fmt).save(loc)
    spark.sql("CREATE TABLE IF NOT EXISTS %s USING %s LOCATION '%s'" % (name, fmt, loc.replace("'", "\\'")))
    return fmt
def __db_save(df, schema, table, mode, fmt, comment=None, keys=None, where=None):
    spark.sql("CREATE DATABASE IF NOT EXISTS `%s`" % schema)
    name = "`%s`.`%s`" % (schema, table)
    exists = __db_exists(schema, table)
    if not exists and mode in ("append", "merge"):
        exists = __db_adopt(schema, table)
    if exists:                            # a catalog entry whose data is gone/broken counts as missing
        try:
            spark.read.table(name).schema
            if __db_provider(name) is None:
                raise ValueError("no provider")
        except Exception:
            __db_wipe(schema, table); exists = False
    if mode == "create" and exists:
        raise ValueError("Table %s.%s already exists. Choose Replace or Append, or another name." % (schema, table))
    prov = __db_provider(name) if exists else None
    if where and exists and mode == "overwrite":
        # shared (multi-tenant) table: replace only the rows matching `where` (this tenant's businesses), keep the rest
        cur = spark.read.table(name)
        have = {c.lower() for c in cur.columns}
        miss = [f for f in df.schema.fields if f.name.lower() not in have]     # e.g. tenant / business on an older table
        if prov == "delta":
            if miss:
                spark.sql("ALTER TABLE %s ADD COLUMNS (%s)" % (name, ", ".join("`%s` %s" % (f.name, f.dataType.simpleString()) for f in miss)))
            loc = __db_table_loc(name)
            w = df.write.mode("overwrite").option("replaceWhere", where).option("mergeSchema", "true").format("delta")
            w.save(loc) if loc else w.saveAsTable(name)
            used = "delta"
        else:
            for f in miss:
                cur = cur.withColumn(f.name, __F.lit(None).cast(f.dataType))
            keep = cur.where("NOT (%s)" % where)
            both = keep.unionByName(df, allowMissingColumns=True).localCheckpoint(True)
            __db_wipe(schema, table)
            used = __db_create(both, schema, table, prov if prov in ("parquet", "orc") else fmt)
    elif mode == "merge" and exists and prov == "delta" and keys:
        from delta.tables import DeltaTable
        try:                              # key columns added later (e.g. tenant / business): add them to the table first
            have = {c.lower() for c in spark.read.table(name).columns}
            miss = [k for k in keys if k.lower() not in have]
            if miss:
                spark.sql("ALTER TABLE %s ADD COLUMNS (%s)" % (name, ", ".join("`%s` STRING" % k for k in miss)))
        except Exception:
            pass
        src = df.dropDuplicates(keys)
        cond = " AND ".join("t.`%s` <=> s.`%s`" % (k, k) for k in keys)
        spark.conf.set("spark.databricks.delta.schema.autoMerge.enabled", "true")
        DeltaTable.forName(spark, name).alias("t").merge(src.alias("s"), cond).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()
        used = "delta"
    elif mode in ("append", "merge") and exists and prov != "delta" and \
            {c.lower() for c in spark.read.table(name).columns} != {c.lower() for c in df.columns}:
        # Parquet / ORC table whose columns changed (new API fields, tenant columns…): rewrite it with the union of both
        both = spark.read.table(name).unionByName(df, allowMissingColumns=True).localCheckpoint(True)
        __db_wipe(schema, table)
        used = __db_create(both, schema, table, prov if prov in ("parquet", "orc") else fmt)
    elif mode in ("append", "merge") and exists:
        w = df.write.mode("append").option("mergeSchema", "true")
        loc = __db_table_loc(name) if prov == "delta" else None
        if loc:                           # Delta: append by path (same table, no catalog V2 write quirks)
            w.format("delta").save(loc)
        else:
            if prov in ("delta", "parquet", "orc", "csv", "json"):
                w = w.format(prov)
            w.saveAsTable(name)
        used = prov
    elif exists and prov == "delta" and fmt == "delta":
        loc = __db_table_loc(name)
        try:                              # replace in place by path: keeps Delta history, avoids catalog truncate issues
            if not loc:
                raise ValueError("no location")
            df.write.mode("overwrite").option("overwriteSchema", "true").format("delta").save(loc)
            used = "delta"
        except Exception:
            __db_wipe(schema, table)
            used = __db_create(df, schema, table, fmt)
    else:
        if exists:
            __db_wipe(schema, table)
        else:
            __db_wipe(schema, table)      # removes a leftover folder from an earlier failed load
        used = __db_create(df, schema, table, fmt)
    if comment:
        try:
            spark.sql("COMMENT ON TABLE " + name + " IS " + __j.dumps(comment))
        except Exception:
            pass
    return used
"""


def _spark_code(path, ddl, casts, schema, table, mode, fmt, comment):
    return SAVE_FN + f"""
__df = (spark.read.option("header", True).option("multiLine", True).option("escape", '"')
        .option("nullValue", "").option("mode", "PERMISSIVE").schema({json.dumps(ddl)}).csv({json.dumps(file_uri(path))}))
for __c, __t in {json.dumps(casts)}:
    __df = __df.withColumn(__c, __F.to_date(__c, "yyyy-MM-dd") if __t == "date" else __F.to_timestamp(__c, "yyyy-MM-dd HH:mm:ss"))
__df = __df.cache()
__n = __df.count()
__fmt = __db_save(__df, {schema!r}, {table!r}, {mode!r}, {fmt!r}, {comment!r})
__df.unpersist()
print("__DBH__" + __j.dumps({{"rows": __n, "format": __fmt}}))
"""


def discard(uid):
    shutil.rmtree(_dir(uid), ignore_errors=True)
    return {"ok": True}
