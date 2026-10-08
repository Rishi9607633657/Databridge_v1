# DataBridge notebook runtime — loaded into every notebook kernel, the SQL editor kernel and job tasks,
# right after config/spark_init.py. Adds Databricks-style notebook features:
#   %sql / %md / %run / %python / %sh / %fs cells, display(), displayHTML(), df.display(),
#   ${param} substitution in SQL, dbutils.widgets / dbutils.notebook / dbutils.fs
import builtins as _db_builtins
import datetime as _db_dt
import decimal as _db_decimal
import html as _db_html
import json as _db_json
import math as _db_math
import os as _db_os
import re as _db_re
import shlex as _db_shlex
import subprocess as _db_subprocess
from collections import namedtuple as _db_namedtuple
from pathlib import Path as _DbPath

from IPython import get_ipython as _db_get_ipython
from IPython.display import display as _db_ipy_display

_db_shell = _db_get_ipython()
_DB_WORKSPACE = _DbPath(_db_os.getcwd()).resolve()          # kernels start in the workspace folder
_DB_NOTEBOOK = _db_os.getenv("DATABRIDGE_NOTEBOOK_PATH", "")  # e.g. pipelines/toast/bronze.ipynb
TABLE_MIME = "application/vnd.databridge.table+json"
RUN_MIME = "application/vnd.databridge.run+json"             # live cards for dbutils.notebook.run / %run
_DB_API = _db_os.getenv("DATABRIDGE_API_URL", "").rstrip("/")
DISPLAY_LIMIT = int(_db_os.getenv("DATABRIDGE_DISPLAY_LIMIT", "1000"))


class NotebookExit(Exception):
    """Raised by dbutils.notebook.exit(value): ends the notebook (or a job task) successfully."""


# ---------------------------------------------------------------- dbutils
class _DbWidgets:
    """dbutils.widgets — values shown in the notebook's widgets bar; job/run parameters override defaults."""

    def __init__(self):
        self._p = {}
        self._defs = {}

    def _define(self, name, kind, default, choices=None, label=None):
        self._defs[name] = {"type": kind, "default": "" if default is None else str(default),
                            "choices": [str(c) for c in choices] if choices else None, "label": label or name}
        self._p.setdefault(name, "" if default is None else str(default))

    def text(self, name, defaultValue="", label=None):
        self._define(name, "text", defaultValue, None, label)

    def dropdown(self, name, defaultValue, choices=None, label=None):
        self._define(name, "dropdown", defaultValue, choices, label)

    def combobox(self, name, defaultValue, choices=None, label=None):
        self._define(name, "combobox", defaultValue, choices, label)

    def multiselect(self, name, defaultValue, choices=None, label=None):
        self._define(name, "multiselect", defaultValue, choices, label)

    def get(self, name):
        if name not in self._p:
            raise KeyError(f"Widget/parameter '{name}' is not defined. Create it with dbutils.widgets.text('{name}', 'default').")
        return self._p[name]

    getArgument = get

    def getAll(self):
        return dict(self._p)

    def remove(self, name):
        self._p.pop(name, None)
        self._defs.pop(name, None)

    def removeAll(self):
        self._p.clear()
        self._defs.clear()

    def _set(self, name, value):
        self._p[name] = str(value)

    def _state(self):
        names = list(self._defs) + [k for k in self._p if k not in self._defs]
        return [{"name": n, "value": self._p.get(n, ""), **self._defs.get(n, {"type": "text", "default": "", "choices": None,
                                                                              "label": n})} for n in names]


class _DbNotebookExitHelper:
    pass


class NotebookRunError(Exception):
    """A notebook started with dbutils.notebook.run() failed, was canceled or timed out."""


class NotebookRunTimeout(NotebookRunError):
    pass


def _db_http(method, path, body=None, timeout=30):
    import urllib.error
    import urllib.request
    if not _DB_API:
        raise RuntimeError("DATABRIDGE_API_URL is not set - dbutils.notebook.run only works inside DataBridge.")
    data = _db_json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if _db_os.getenv("DATABRIDGE_API_TOKEN"):
        headers["Authorization"] = "Bearer " + _db_os.getenv("DATABRIDGE_API_TOKEN")
    req = urllib.request.Request(_DB_API + path, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read()
            return _db_json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        try:
            detail = _db_json.loads(e.read().decode("utf-8")).get("detail")
        except Exception:  # noqa: BLE001
            detail = str(e)
        raise NotebookRunError(detail) from None


_DB_TERMINAL = {"SUCCESS", "FAILED", "CANCELED", "TIMEDOUT"}


def _db_card(**kw):
    return {RUN_MIME: kw, "text/plain": f"{kw.get('title', 'run')}: {kw.get('state')}"}


_DB_ERROR_CODES = {"FAILED": "RUN_EXECUTION_ERROR", "TIMEDOUT": "RUN_TIMEOUT", "CANCELED": "RUN_CANCELED"}
_db_workflows = {}   # execution_count -> {"handle": DisplayHandle, "rows": {run_id: row}}


def _db_wf_row(run, rel, timeout, args):
    t = (run.get("tasks") or [{}])[0].get("latest") or {}
    state = "TIMEDOUT" if t.get("state") == "TIMEDOUT" else run["state"]
    if state == "RUNNING" and t.get("state") in (None, "PENDING"):
        state = "PENDING"
    return {"run_id": run["id"], "run_number": run["run_number"], "path": rel, "start": run.get("start"),
            "end": run.get("end"), "duration": run.get("duration"), "state": state,
            "error_code": _DB_ERROR_CODES.get(state), "error": t.get("error") or (run.get("message") if state in _DB_ERROR_CODES else None),
            "parameters": args, "timeout": timeout, "result": t.get("result"), "current_cell": t.get("current_cell")}


def _db_wf_publish(rows):
    """One live 'Notebook Workflows' table per notebook cell, like Databricks."""
    key = getattr(_db_shell, "execution_count", 0) if _db_shell else 0
    ent = _db_workflows.get(key)
    if ent is None:
        for old in list(_db_workflows)[:-5]:
            _db_workflows.pop(old, None)
        ent = _db_workflows[key] = {"handle": None, "rows": {}}
    for r in rows:
        ent["rows"][r["run_id"]] = r
    table = sorted(ent["rows"].values(), key=lambda r: (r["start"] or 0, r["run_number"]))
    plain = "\n".join(f"{r['path']}  {r['state']}  {round(r['duration'] or 0)}s" for r in table)
    data = {RUN_MIME: {"kind": "workflows", "rows": table}, "text/plain": plain}
    if ent["handle"] is None:
        ent["handle"] = _db_ipy_display(data, raw=True, display_id=True)
    else:
        ent["handle"].update(data, raw=True)


class _DbNotebook:
    def exit(self, value=""):
        raise NotebookExit(value if isinstance(value, str) else _db_json.dumps(value, default=str))

    # -- internals: start / wait (all polling happens on the notebook's main thread) --
    def _start(self, path, timeout_seconds=0, arguments=None):
        nb = _db_resolve_notebook(path)
        rel = nb.relative_to(_DB_WORKSPACE).as_posix()
        args = {str(k): str(v) for k, v in (arguments or {}).items()}
        timeout = int(timeout_seconds or 0)
        run = _db_http("POST", "/api/notebook-runs", {"path": rel, "arguments": args, "timeout_seconds": timeout,
                                                      "parent": _DB_NOTEBOOK or None})
        return {"run": run, "rel": rel, "args": args, "timeout": timeout, "done": False}

    def _outcome(self, h):
        run = h["run"]
        t = (run.get("tasks") or [{}])[0].get("latest") or {}
        if run["state"] == "SUCCESS":
            return t.get("result") or ""
        where = f"{h['rel']} (run #{run['run_number']})"
        if t.get("state") == "TIMEDOUT":
            return NotebookRunTimeout(f"Notebook {where} timed out after {h['timeout']}s")
        return NotebookRunError(f"Notebook {where} {run['state'].lower()}: {t.get('error') or run.get('message') or 'unknown error'}")

    def _wait(self, handles, pending_specs=(), max_parallel=1):
        import time as _t
        queue = list(pending_specs)
        try:
            while True:
                while queue and sum(1 for h in handles if not h["done"]) < max_parallel:
                    spec = queue.pop(0)
                    h = self._start(spec["path"], spec.get("timeout_seconds", 0), spec.get("arguments"))
                    h["index"] = spec["_index"]
                    handles.append(h)
                active = [h for h in handles if not h["done"]]
                if not active and not queue:
                    break
                for h in active:
                    h["run"] = _db_http("GET", f"/api/runs/{h['run']['id']}")
                    if h["run"]["state"] in _DB_TERMINAL:
                        h["done"] = True
                    elif h["timeout"] and (h["run"].get("duration") or 0) > h["timeout"] + 900:  # safety net
                        _db_http("POST", f"/api/runs/{h['run']['id']}/cancel")
                _db_wf_publish([_db_wf_row(h["run"], h["rel"], h["timeout"], h["args"]) for h in handles])
                if any(not h["done"] for h in handles) or queue:
                    _t.sleep(1)
        except KeyboardInterrupt:
            for h in handles:
                if not h["done"]:
                    try:
                        _db_http("POST", f"/api/runs/{h['run']['id']}/cancel")
                    except Exception:  # noqa: BLE001
                        pass
            raise
        return handles

    # -- public API --
    def run(self, path, timeout_seconds=0, arguments=None):
        """Run another notebook in its own Spark session and return its dbutils.notebook.exit() value.

        path: relative to this notebook ("./child"), or from the workspace root ("/pipelines/child").
        timeout_seconds: 0 = no timeout. arguments: dict -> dbutils.widgets in the child.
        Raises NotebookRunError on failure/cancel and NotebookRunTimeout on timeout."""
        h = self._start(path, timeout_seconds, arguments)
        _db_wf_publish([_db_wf_row(h["run"], h["rel"], h["timeout"], h["args"])])
        self._wait([h])
        out = self._outcome(h)
        if isinstance(out, Exception):
            raise out
        return out

    def runMultiple(self, runs, max_parallel=4, raise_on_error=True):
        """Run notebooks in parallel. runs: list of dicts {path, timeout_seconds, arguments} (or plain paths).
        Returns exit values in the same order (exception objects when raise_on_error=False)."""
        specs = [dict(r if isinstance(r, dict) else {"path": r}, _index=i) for i, r in enumerate(runs)]
        handles = self._wait([], specs, max(1, int(max_parallel)))
        handles.sort(key=lambda h: h["index"])
        results = [self._outcome(h) for h in handles]
        errors = [(h["rel"], r) for h, r in zip(handles, results) if isinstance(r, Exception)]
        if errors and raise_on_error:
            raise NotebookRunError("; ".join(f"{p}: {e}" for p, e in errors))
        return results

    run_multiple = runMultiple

    def getContext(self):
        return {"notebookPath": _DB_NOTEBOOK, "workspace": str(_DB_WORKSPACE)}


FileInfo = _db_namedtuple("FileInfo", ["path", "name", "size", "modificationTime"])


class _DbFS:
    """dbutils.fs on top of the Hadoop FileSystem API — works for file:/, abfss://, etc."""

    def _spark(self):
        sp = globals().get("spark") or getattr(_db_builtins, "spark", None)
        if sp is None:
            raise RuntimeError("dbutils.fs needs a Spark session (check config/spark_init.py).")
        return sp

    def _fs(self, path):
        sp = self._spark()
        p = sp._jvm.org.apache.hadoop.fs.Path(_db_localize(path))
        return p.getFileSystem(sp._jsc.hadoopConfiguration()), p

    def ls(self, path="."):
        fs, p = self._fs(path)
        out = []
        for s in fs.listStatus(p):
            name = s.getPath().getName() + ("/" if s.isDirectory() else "")
            out.append(FileInfo(str(s.getPath()) + ("/" if s.isDirectory() else ""), name, int(s.getLen()), int(s.getModificationTime())))
        return sorted(out, key=lambda f: f.name)

    def head(self, path, maxBytes=65536):
        fs, p = self._fs(path)
        sp = self._spark()
        stream = fs.open(p)
        try:
            bounded = sp._jvm.org.apache.commons.io.input.BoundedInputStream(stream, int(maxBytes))
            return sp._jvm.org.apache.commons.io.IOUtils.toString(bounded, "UTF-8")
        finally:
            stream.close()

    def put(self, path, contents, overwrite=False):
        fs, p = self._fs(path)
        out = fs.create(p, bool(overwrite))
        try:
            out.write(bytearray(contents.encode("utf-8")))
        finally:
            out.close()
        return True

    def mkdirs(self, path):
        fs, p = self._fs(path)
        return bool(fs.mkdirs(p))

    def rm(self, path, recurse=False):
        fs, p = self._fs(path)
        return bool(fs.delete(p, bool(recurse)))

    def mv(self, src, dst, recurse=False):
        fs, p = self._fs(src)
        _, q = self._fs(dst)
        return bool(fs.rename(p, q))

    def cp(self, src, dst, recurse=False):
        sp = self._spark()
        sfs, sp_ = self._fs(src)
        dfs, dp = self._fs(dst)
        return bool(sp._jvm.org.apache.hadoop.fs.FileUtil.copy(sfs, sp_, dfs, dp, False, sp._jsc.hadoopConfiguration()))

    def help(self):
        print("dbutils.fs: ls(path), head(path, maxBytes), put(path, contents, overwrite), mkdirs(path), "
              "rm(path, recurse), cp(src, dst), mv(src, dst)")


class _DbUtils:
    _databridge = True

    def __init__(self):
        self.widgets = _DbWidgets()
        self.notebook = _DbNotebook()
        self.fs = _DbFS()

    def help(self):
        print("dbutils.widgets (text, dropdown, get, getAll) · dbutils.notebook (run, runMultiple, exit) · "
              "dbutils.fs (ls, head, put, mkdirs, rm, cp, mv)")


dbutils = _DbUtils()


def _db_localize(path):
    """Paths without a scheme are relative to the workspace (like /Workspace in Databricks)."""
    path = str(path)
    if _db_re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:(//|/)", path) and not _db_re.match(r"^[a-zA-Z]:[\\/]", path):
        return path
    if _db_re.match(r"^[a-zA-Z]:[\\/]", path):
        return _DbPath(path).as_uri()
    p = path.replace("\\", "/")
    for prefix in ("/Workspace/", "/workspace/", "/dbfs/", "dbfs:/"):
        if p.startswith(prefix):
            p = p[len(prefix):]
    p = p.lstrip("/")
    return (_DB_WORKSPACE / p).resolve().as_uri()


# ---------------------------------------------------------------- display()
def _db_cell(v):
    if v is None:
        return None
    if isinstance(v, float):
        return None if _db_math.isnan(v) or _db_math.isinf(v) else v
    if isinstance(v, (bool, int, str)):
        return v
    if isinstance(v, _db_decimal.Decimal):
        return float(v)
    if isinstance(v, (_db_dt.datetime, _db_dt.date, _db_dt.time)):
        return v.isoformat()
    if isinstance(v, (bytes, bytearray)):
        return v.hex()
    if hasattr(v, "asDict"):
        return {k: _db_cell(x) for k, x in v.asDict(recursive=True).items()}
    if isinstance(v, dict):
        return {str(k): _db_cell(x) for k, x in v.items()}
    if isinstance(v, (list, tuple, set)):
        return [_db_cell(x) for x in v]
    try:
        import numpy as _np
        if isinstance(v, _np.generic):
            return _db_cell(v.item())
    except Exception:  # noqa: BLE001
        pass
    return str(v)


_NUMERIC_TYPES = ("int", "bigint", "smallint", "tinyint", "double", "float", "decimal", "long", "short", "number")


def _db_payload_spark(df, limit):
    rows = df.limit(limit + 1).collect()
    truncated = len(rows) > limit
    rows = rows[:limit]
    cols = [f.name for f in df.schema.fields]
    types = [f.dataType.simpleString() for f in df.schema.fields]
    return {"columns": cols, "types": types, "rows": [[_db_cell(x) for x in r] for r in rows], "truncated": truncated,
            "limit": limit}


def _db_payload_pandas(pdf, limit):
    truncated = len(pdf) > limit
    pdf = pdf.head(limit)
    cols = [str(c) for c in pdf.columns]
    types = []
    for dt in pdf.dtypes:
        k = getattr(dt, "kind", "O")
        types.append({"i": "bigint", "u": "bigint", "f": "double", "b": "boolean", "M": "timestamp"}.get(k, "string"))
    rows = [[_db_cell(x) for x in r] for r in pdf.astype(object).where(pdf.notna(), None).itertuples(index=False, name=None)]
    return {"columns": cols, "types": types, "rows": rows, "truncated": truncated, "limit": limit}


def _db_payload_records(items, limit):
    items = list(items)
    truncated = len(items) > limit
    items = items[:limit]
    first = items[0] if items else None
    if first is not None and hasattr(first, "_fields"):
        cols = list(first._fields)
        rows = [[_db_cell(getattr(it, c)) for c in cols] for it in items]
    elif first is not None and isinstance(first, dict):
        cols = list(dict.fromkeys(k for it in items for k in it))
        rows = [[_db_cell(it.get(c)) for c in cols] for it in items]
    else:
        return None
    types = []
    for i in range(len(cols)):
        vals = [r[i] for r in rows if r[i] is not None]
        types.append("double" if vals and all(isinstance(x, (int, float)) and not isinstance(x, bool) for x in vals) else "string")
    return {"columns": cols, "types": types, "rows": rows, "truncated": truncated, "limit": limit}


def _db_html_table(p, n=50):
    head = "".join(f"<th>{_db_html.escape(str(c))}</th>" for c in p["columns"])
    body = "".join("<tr>" + "".join(f"<td>{_db_html.escape('' if v is None else str(v))}</td>" for v in r) + "</tr>"
                   for r in p["rows"][:n])
    more = f"<p>Showing {min(n, len(p['rows']))} of {len(p['rows'])}{'+' if p['truncated'] else ''} rows</p>"
    return f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>{more}"


def _db_plain_table(p, n=20):
    cols = p["columns"]
    lines = [" | ".join(cols)] + [" | ".join("null" if v is None else str(v) for v in r) for r in p["rows"][:n]]
    if len(p["rows"]) > n or p["truncated"]:
        lines.append(f"... ({len(p['rows'])}{'+' if p['truncated'] else ''} rows)")
    return "\n".join(lines)


def display(obj=None, *args, limit=None, **kwargs):
    """Databricks-style display(): interactive table + charts for Spark/pandas DataFrames."""
    if obj is None:
        return
    limit = int(limit or DISPLAY_LIMIT)
    payload = None
    try:
        from pyspark.sql import DataFrame as _SparkDF
        if isinstance(obj, _SparkDF):
            payload = _db_payload_spark(obj, limit)
    except ImportError:
        pass
    if payload is None:
        try:
            import pandas as _pd
            if isinstance(obj, _pd.Series):
                obj = obj.to_frame()
            if isinstance(obj, _pd.DataFrame):
                payload = _db_payload_pandas(obj, limit)
        except ImportError:
            pass
    if payload is None and isinstance(obj, (list, tuple)) and obj:
        payload = _db_payload_records(obj, limit)
    if payload is None:
        _db_ipy_display(obj, *args, **kwargs)
        return
    _db_ipy_display({TABLE_MIME: payload, "text/plain": _db_plain_table(payload), "text/html": _db_html_table(payload)},
                    raw=True)


def displayHTML(html):
    _db_ipy_display({"text/html": str(html), "text/plain": "<HTML>"}, raw=True)


try:
    from pyspark.sql import DataFrame as _SparkDF

    _SparkDF.display = lambda self, *a, **k: display(self, *a, **k)
except ImportError:
    pass
try:
    import pandas as _pd

    _pd.DataFrame.display = lambda self, *a, **k: display(self, *a, **k)
except ImportError:
    pass


# ---------------------------------------------------------------- %sql
def _db_split_sql(text):
    """Split on ';' outside quotes and comments."""
    stmts, buf, i, q = [], [], 0, None
    while i < len(text):
        ch = text[i]
        if q:
            buf.append(ch)
            if ch == q:
                q = None
        elif ch in ("'", '"', "`"):
            q = ch
            buf.append(ch)
        elif ch == "-" and text[i:i + 2] == "--":
            j = text.find("\n", i)
            i = len(text) if j < 0 else j
            continue
        elif ch == "/" and text[i:i + 2] == "/*":
            j = text.find("*/", i + 2)
            i = len(text) if j < 0 else j + 2
            continue
        elif ch == ";":
            stmts.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
        i += 1
    stmts.append("".join(buf))
    return [s.strip() for s in stmts if s.strip()]


def _db_params():
    ns = _db_shell.user_ns if _db_shell else globals()
    du = ns.get("dbutils", dbutils)
    try:
        return du.widgets.getAll()
    except Exception:  # noqa: BLE001
        return {}


def _db_substitute(text):
    params = _db_params()

    def rep(m):
        name = m.group(1)
        if name in params:
            return str(params[name])
        raise KeyError(f"SQL parameter ${{{name}}} is not defined. Set it with dbutils.widgets.text('{name}', 'value') "
                       f"or as a job parameter.")
    return _db_re.sub(r"\$\{(\w+)\}", rep, text)


def _databridge_sql(text):
    sp = globals().get("spark") or getattr(_db_builtins, "spark", None)
    if sp is None:
        raise RuntimeError("%sql needs a Spark session (check config/spark_init.py).")
    df = None
    for stmt in _db_split_sql(_db_substitute(text)):
        df = sp.sql(stmt)
    if df is not None:
        if _db_shell:
            _db_shell.user_ns["_sqldf"] = df
        display(df)


# ---------------------------------------------------------------- %md / %sh / %fs
def _databridge_md(text):
    _db_ipy_display({"text/markdown": text, "text/plain": text}, raw=True)


def _databridge_sh(script):
    res = _db_subprocess.run(script, shell=True, capture_output=True, text=True, cwd=str(_DB_WORKSPACE))
    if res.stdout:
        print(res.stdout, end="")
    if res.stderr:
        import sys as _sys
        print(res.stderr, end="", file=_sys.stderr)
    if res.returncode != 0:
        raise RuntimeError(f"%sh exited with code {res.returncode}")


def _databridge_fs(argline):
    parts = _db_shlex.split(argline)
    if not parts:
        dbutils.fs.help()
        return
    cmd, args = parts[0], parts[1:]
    fn = getattr(dbutils.fs, cmd, None)
    if fn is None:
        raise ValueError(f"Unknown %fs command '{cmd}'. Use: ls, head, mkdirs, rm, cp, mv")
    if cmd == "rm" and args and args[0] in ("-r", "--recurse"):
        return fn(args[1], recurse=True)
    out = fn(*args)
    if cmd == "ls":
        display(out)
    elif cmd == "head":
        print(out)
    else:
        return out


# ---------------------------------------------------------------- %run
_db_run_depth = [0]


def _db_resolve_notebook(ref):
    ref = ref.strip().strip('"').strip("'").replace("\\", "/")
    for prefix in ("/Workspace/", "/workspace/"):
        if ref.startswith(prefix):
            ref = "/" + ref[len(prefix):]
    if ref.startswith("/"):
        base = _DB_WORKSPACE / ref.lstrip("/")
    else:
        here = (_DB_WORKSPACE / _DB_NOTEBOOK).parent if _DB_NOTEBOOK else _DB_WORKSPACE
        base = here / ref
    base = base.resolve()
    for cand in (base, base.with_name(base.name + ".ipynb")):
        if cand.is_file() and cand.suffix == ".ipynb":
            if _DB_WORKSPACE not in cand.parents:
                raise PermissionError(f"%run can only run notebooks inside the workspace: {ref}")
            return cand
    raise FileNotFoundError(f"%run: notebook not found: {ref} (looked for {base} and {base}.ipynb)")


def _databridge_run(argline):
    """%run ./other_notebook $param="value" — runs another notebook in this notebook's scope."""
    import nbformat as _nbf
    tokens = _db_shlex.split(argline, posix=True)
    if not tokens:
        raise ValueError('%run needs a notebook path, e.g. %run ./utils/common $env="dev"')
    path = _db_resolve_notebook(tokens[0])
    run_params = {}
    for t in tokens[1:]:
        m = _db_re.match(r"^\$?([A-Za-z_]\w*)=(.*)$", t)
        if m:
            run_params[m.group(1)] = m.group(2)
    if _db_run_depth[0] >= 10:
        raise RecursionError("%run nested more than 10 levels (circular %run?)")
    import time as _t
    nb = _nbf.read(str(path), as_version=4)
    ns = _db_shell.user_ns
    widgets = ns.get("dbutils", dbutils).widgets
    saved = dict(widgets._p)
    widgets._p.update(run_params)
    rel = path.relative_to(_DB_WORKSPACE).as_posix()
    code_cells = [(i, c) for i, c in enumerate(nb.cells) if c.cell_type == "code"
                  and (c.source if isinstance(c.source, str) else "".join(c.source)).strip()]
    t0 = _t.time()
    card = lambda **kw: _db_card(kind="inline_run", title=f"%run {rel}", arguments=run_params,  # noqa: E731
                                 cells=len(code_cells), duration=_t.time() - t0, **kw)
    handle = _db_ipy_display(card(state="RUNNING", current_cell=None), raw=True, display_id=True)
    _db_run_depth[0] += 1
    done = 0
    try:
        for n, (i, cell) in enumerate(code_cells, 1):
            handle.update(card(state="RUNNING", current_cell=n, done=done), raw=True)
            src = cell.source if isinstance(cell.source, str) else "".join(cell.source)
            code = _db_shell.transform_cell(src)
            try:
                exec(compile(code, f"<%run {rel} cell {i + 1}>", "exec"), ns)
            except NotebookExit as e:
                handle.update(card(state="SUCCESS", done=done + 1, result=str(e)), raw=True)
                return
            except KeyboardInterrupt:
                handle.update(card(state="CANCELED", current_cell=n, done=done), raw=True)
                raise
            except Exception as e:
                handle.update(card(state="FAILED", current_cell=n, done=done,
                                   error=f"Cell {i + 1} of {rel}: {type(e).__name__}: {e}"), raw=True)
                raise RuntimeError(f"%run {rel} failed in cell {i + 1}: {type(e).__name__}: {e}") from e
            done += 1
        handle.update(card(state="SUCCESS", done=done), raw=True)
    finally:
        _db_run_depth[0] -= 1
        widgets._p.clear()
        widgets._p.update(saved)


# ---------------------------------------------------------------- kernel state (widgets bar + variable explorer)
_DB_HIDDEN = {"In", "Out", "exit", "quit", "get_ipython", "spark", "sc", "F", "T", "BASE_PATH", "dbutils", "display",
              "displayHTML", "NotebookExit", "FileInfo", "NotebookRunError", "NotebookRunTimeout", "TABLE_MIME",
              "RUN_MIME", "DISPLAY_LIMIT", "SparkSession", "configure_spark_with_delta_pip", "pyspark", "EXTRA_PACKAGES",
              "LOCAL_JARS"}


def _db_describe(v):
    import inspect as _insp
    if _insp.ismodule(v) or _insp.isclass(v) or _insp.isroutine(v) or callable(v) and not hasattr(v, "__len__"):
        return None
    tname = type(v).__name__
    try:
        from pyspark.sql import DataFrame as _SDF
        if isinstance(v, _SDF):
            cols = v.columns
            return "pyspark DataFrame", f"{len(cols)} columns: " + ", ".join(cols[:6]) + ("…" if len(cols) > 6 else ""), True
    except ImportError:
        pass
    try:
        import pandas as _pd
        if isinstance(v, _pd.DataFrame):
            return "pandas DataFrame", f"{v.shape[0]:,} rows × {v.shape[1]} columns", True
        if isinstance(v, _pd.Series):
            return "pandas Series", f"{len(v):,} values", True
    except ImportError:
        pass
    if isinstance(v, (list, tuple, set, dict)):
        return tname, f"{len(v):,} items", True
    if isinstance(v, (str, bytes)):
        r = repr(v)
        return tname, r[:80] + ("…" if len(r) > 80 else ""), False
    if isinstance(v, (int, float, bool, complex, _db_decimal.Decimal, _db_dt.date, _db_dt.datetime)) or v is None:
        return tname, repr(v)[:80], False
    r = repr(v)
    return tname, r[:80] + ("…" if len(r) > 80 else ""), False


def _db_state_json():
    ns = _db_shell.user_ns
    du = ns.get("dbutils", dbutils)
    widgets = du.widgets._state() if hasattr(du.widgets, "_state") else [
        {"name": k, "value": v, "type": "text", "default": v, "choices": None, "label": k} for k, v in du.widgets.getAll().items()]
    variables = []
    for k, v in list(ns.items()):
        if k.startswith("_") or k in _DB_HIDDEN or k in _DB_BASELINE:
            continue
        try:
            d = _db_describe(v)
        except Exception:  # noqa: BLE001
            d = None
        if d:
            variables.append({"name": k, "type": d[0], "summary": d[1], "previewable": d[2]})
        if len(variables) >= 300:
            break
    variables.sort(key=lambda x: x["name"].lower())
    return _db_json.dumps({"widgets": widgets, "variables": variables}, default=str)


def _db_preview_json(name):
    ns = _db_shell.user_ns
    if name not in ns:
        return _db_json.dumps({"text": f"{name} is not defined"})
    v = ns[name]
    try:
        from pyspark.sql import DataFrame as _SDF
        if isinstance(v, _SDF):
            return _db_json.dumps({"table": _db_payload_spark(v, 100)}, default=str)
    except ImportError:
        pass
    try:
        import pandas as _pd
        if isinstance(v, _pd.Series):
            v = v.to_frame()
        if isinstance(v, _pd.DataFrame):
            return _db_json.dumps({"table": _db_payload_pandas(v, 100)}, default=str)
    except ImportError:
        pass
    if isinstance(v, (list, tuple)) and v:
        p = _db_payload_records(v, 100)
        if p:
            return _db_json.dumps({"table": p}, default=str)
    import pprint as _pp
    return _db_json.dumps({"text": _pp.pformat(v, width=120)[:20000]})


# ---------------------------------------------------------------- cell transformer
_DB_MAGIC = _db_re.compile(r"^%(sql|md|python|py|run|sh|fs)(?:\s+(.*))?$")


def _databridge_transform(lines):
    i = 0
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i >= len(lines):
        return lines
    m = _DB_MAGIC.match(lines[i].strip())
    if not m:
        return lines
    kind, rest = m.group(1), (m.group(2) or "").strip()
    body = "".join(lines[i + 1:])
    if kind in ("python", "py"):
        return ([rest + "\n"] if rest else []) + lines[i + 1:]
    if kind == "sql":
        return [f"_databridge_sql({((rest + chr(10)) if rest else '') + body!r})\n"]
    if kind == "md":
        return [f"_databridge_md({((rest + chr(10)) if rest else '') + body!r})\n"]
    if kind == "sh":
        return [f"_databridge_sh({((rest + chr(10)) if rest else '') + body!r})\n"]
    if kind == "fs":
        return [f"_databridge_fs({rest!r})\n"]
    if kind == "run":
        return [f"_databridge_run({rest!r})\n"] + lines[i + 1:]
    return lines


if _db_shell is not None:
    _tx = _db_shell.input_transformers_cleanup
    _tx[:] = [t for t in _tx if getattr(t, "__name__", "") != "_databridge_transform"]
    _tx.insert(0, _databridge_transform)
    _db_shell.user_ns.update({"display": display, "displayHTML": displayHTML, "dbutils": dbutils,
                              "NotebookExit": NotebookExit, "FileInfo": FileInfo,
                              "NotebookRunError": NotebookRunError, "NotebookRunTimeout": NotebookRunTimeout})
    _DB_BASELINE = set(_db_shell.user_ns.keys())
else:
    _DB_BASELINE = set()


# ---------------------------------------------------------------- Spark job progress (like Databricks "Spark Jobs")
SPARK_MIME = "application/vnd.databridge.sparkjobs+json"
import threading as _db_threading  # noqa: E402
import time as _db_ptime  # noqa: E402


class _DbSparkProgress:
    """Tags each cell's Spark work with a job group and streams jobs → stages → tasks into a live card."""

    def __init__(self):
        self.n = 0
        self.stop = None
        self.thread = None
        self.handle = None
        self.group = None

    @staticmethod
    def _sc():
        try:
            from pyspark import SparkContext
            return SparkContext._active_spark_context
        except Exception:  # noqa: BLE001
            return None

    def _name(self, sc, jid):
        try:                                               # call site, e.g. "count at cell line 3"
            name = str(sc._jsc.sc().statusStore().job(int(jid)).name())
        except Exception:  # noqa: BLE001
            return f"Job {jid}"
        if "ipykernel_" in name:
            action = name.split(" at ")[0]
            line = name.rsplit(":", 1)[-1] if name.rsplit(":", 1)[-1].isdigit() else ""
            return f"{action} at cell{' line ' + line if line else ''}"
        return name

    def snapshot(self, sc, done=False):
        st = sc.statusTracker()
        jobs = []
        for jid in sorted(st.getJobIdsForGroup(self.group)):
            j = st.getJobInfo(jid)
            if not j:
                continue
            stages = []
            for sid in sorted(j.stageIds):
                s = st.getStageInfo(sid)
                if s is None:
                    stages.append({"id": sid, "name": f"Stage {sid}", "attempt": 0, "tasks": 0, "done": 0, "active": 0, "failed": 0,
                                   "status": "skipped" if done or j.status != "RUNNING" else "pending"})
                    continue
                if s.numFailedTasks and s.numCompletedTasks < s.numTasks and not s.numActiveTasks:
                    status = "failed"
                elif s.numTasks and s.numCompletedTasks >= s.numTasks:
                    status = "succeeded"
                elif s.numActiveTasks:
                    status = "running"
                else:
                    status = "skipped" if (done or j.status != "RUNNING") else "pending"
                stages.append({"id": sid, "name": s.name, "attempt": s.currentAttemptId, "tasks": s.numTasks, "done": s.numCompletedTasks,
                               "active": s.numActiveTasks, "failed": s.numFailedTasks, "status": status})
            jobs.append({"id": jid, "status": j.status, "name": self._name(sc, jid), "stages": stages,
                         "tasks": sum(x["tasks"] for x in stages if x["status"] != "skipped"),
                         "done": sum(x["done"] for x in stages if x["status"] != "skipped")})
        return {"ui": sc.uiWebUrl or "", "app": sc.applicationId, "jobs": jobs, "done": done,
                "elapsed": round(_db_ptime.time() - self.t0, 2)}

    def _show(self, payload):
        n = len(payload["jobs"])
        data = {SPARK_MIME: payload, "text/plain": f"({n} Spark job{'s' if n != 1 else ''})"}
        if self.handle is None:
            self.handle = _db_ipy_display(data, raw=True, display_id=True)
        else:
            self.handle.update(data, raw=True)

    def _loop(self, sc, stop):
        last = None
        while not stop.wait(0.5):
            try:
                snap = self.snapshot(sc)
            except Exception:  # noqa: BLE001
                continue
            key = str([(j["id"], j["status"], [(x["done"], x["active"], x["status"]) for x in j["stages"]]) for j in snap["jobs"]])
            if snap["jobs"] and key != last:
                last = key
                self._show(snap)

    def pre(self, *_a, **_k):
        sc = self._sc()
        if sc is None or _db_os.getenv("DATABRIDGE_SPARK_PROGRESS", "true").lower() == "false":
            return
        self.n += 1
        self.group = f"databridge-{_db_os.getpid()}-cell-{self.n}"
        self.handle = None
        self.t0 = _db_ptime.time()
        try:
            sc.setJobGroup(self.group, f"DataBridge cell {self.n}", interruptOnCancel=True)
        except Exception:  # noqa: BLE001
            return
        self.stop = _db_threading.Event()
        self.thread = _db_threading.Thread(target=self._loop, args=(sc, self.stop), daemon=True)
        self.thread.start()

    def post(self, *_a, **_k):
        if not self.stop:
            return
        self.stop.set()
        if self.thread:
            self.thread.join(timeout=2)
        sc = self._sc()
        try:
            if sc is not None:
                snap = self.snapshot(sc, done=True)
                if snap["jobs"]:
                    self._show(snap)
        except Exception:  # noqa: BLE001
            pass
        self.stop = self.thread = None


_db_spark_progress = _DbSparkProgress()
try:
    if _db_shell is not None:
        _db_shell.events.register("pre_run_cell", _db_spark_progress.pre)
        _db_shell.events.register("post_run_cell", _db_spark_progress.post)
except Exception:  # noqa: BLE001
    pass
