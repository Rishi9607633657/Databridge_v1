"""Data access governance: table grants, column masks and row filters (Unity-Catalog style, simplified).

Who it applies to: editors and viewers. Admins, super admins and DataBridge itself (scheduled work without a user)
always see raw data.

Where it applies: every query DataBridge runs on a person's behalf — SQL editor, dashboards, Catalog sample/profile,
Ask data (chat), SQL alerts and the BI endpoint (Power BI / Excel). Python code in notebooks runs with the
notebook's Spark session and is not filtered: give people who must only see masked data the Viewer role, or turn
off Notebooks for them in Admin › Features.

* Grants  — principal (everyone / user:<name> / role:<role> / company:<company>) gets SELECT or MODIFY or ALL on
            '*' (everything), '<schema>' or '<schema>.<table>'. Only checked when "Require table grants" is on.
* Masks   — a column is replaced by an expression (hash, partial, email, redact, null or custom SQL) for everyone
            except the exempt principals.
* Row filters — a SQL condition added to every read of the table, e.g.  tenant = {company}
            Placeholders {username} {email} {company} {role} become quoted values of the person running the query.
The current user travels in a context variable set by the HTTP middleware (copied into tasks and threads)."""
import contextvars
import json
import re
import time
import uuid

from fastapi import HTTPException

from .jobs import store
from .settings import env

current_user = contextvars.ContextVar("databridge_user", default=None)

store.db.executescript("""
CREATE TABLE IF NOT EXISTS gov_grants (id TEXT PRIMARY KEY, principal TEXT, object TEXT, privilege TEXT, created REAL, created_by TEXT);
CREATE TABLE IF NOT EXISTS gov_masks (id TEXT PRIMARY KEY, object TEXT, col TEXT, method TEXT, expr TEXT, exempt TEXT, created REAL, created_by TEXT);
CREATE TABLE IF NOT EXISTS gov_filters (id TEXT PRIMARY KEY, object TEXT, predicate TEXT, exempt TEXT, description TEXT, created REAL, created_by TEXT);
""")
store.db.commit()

PRIVS = ("SELECT", "MODIFY", "ALL")
MASKS = {
    "hash": "md5(concat('{salt}', cast({col} as string)))",
    "partial": "concat('****', substr(cast({col} as string), -4))",
    "email": "regexp_replace(cast({col} as string), '^[^@]+', '***')",
    "redact": "'****'",
    "null": "CAST(NULL AS STRING)",
}
MASK_LABELS = {"hash": "Hash (same value → same hash, joins still work)", "partial": "Show last 4 characters",
               "email": "Hide e-mail name (***@domain.com)", "redact": "Replace with ****", "null": "Replace with NULL",
               "custom": "Custom SQL expression"}
_PRINCIPAL = re.compile(r"^(everyone|user:[^\s:]{1,120}|role:(super_admin|admin|editor|viewer)|company:[^:]{1,120})$")
_OBJ = re.compile(r"^(\*|[A-Za-z_][\w]*|[A-Za-z_][\w]*\.[A-Za-z_][\w]*)$")
_KW = {"where", "join", "left", "right", "inner", "full", "outer", "cross", "on", "group", "order", "limit", "union",
       "having", "window", "using", "lateral", "natural", "semi", "anti", "except", "intersect", "minus", "tablesample",
       "pivot", "unpivot", "qualify", "sort", "cluster", "distribute", "for", "version", "timestamp", "as", "select",
       "from", "with", "when", "then", "set", "values"}


def _now():
    return time.time()


def exempt_user(u):
    return u is None or u.get("id") == "__service__" or u.get("role") in ("admin", "super_admin")


def enabled():
    return (env("GOVERNANCE_REQUIRE_GRANTS", "false") or "false").lower() == "true"


def _salt():
    s = env("GOVERNANCE_MASK_SALT")
    if s:
        return re.sub(r"[^A-Za-z0-9]", "", s)[:64]
    from .settings import DATA_ROOT
    p = DATA_ROOT / ".stratum" / "mask_salt"
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(uuid.uuid4().hex + uuid.uuid4().hex, encoding="utf-8")
    return p.read_text(encoding="utf-8").strip()


# ------------------------------------------------------------------ principals
def matches(principal, u):
    p = (principal or "").strip()
    if p == "everyone":
        return True
    kind, _, val = p.partition(":")
    val = val.lower()
    if kind == "user":
        return val in {(u.get("username") or "").lower(), (u.get("email") or "").lower()}
    if kind == "role":
        return val == (u.get("role") or "").lower()
    if kind == "company":
        return bool(u.get("company")) and val == u["company"].lower()
    return False


def _clean_principal(p):
    p = (p or "").strip()
    if not _PRINCIPAL.match(p):
        raise HTTPException(400, "Principal must be everyone, user:<username>, role:<viewer|editor|admin> or company:<company>")
    return p


def _clean_obj(o, table_only=False):
    o = (o or "").strip().strip("`").lower()
    if "." not in o and table_only and o != "*":
        o = f"default.{o}"
    if not _OBJ.match(o) or (table_only and "." not in o):
        raise HTTPException(400, "Use schema.table" if table_only else "Use *, a schema name or schema.table")
    return o


def _exempt_list(v):
    if isinstance(v, str):
        v = [x.strip() for x in v.split(",") if x.strip()]
    return [_clean_principal(x) for x in (v or [])]


# ------------------------------------------------------------------ CRUD
def list_all():
    g = store.q("SELECT * FROM gov_grants ORDER BY object, principal")
    m = [{**r, "exempt": json.loads(r["exempt"] or "[]")} for r in store.q("SELECT * FROM gov_masks ORDER BY object, col")]
    f = [{**r, "exempt": json.loads(r["exempt"] or "[]")} for r in store.q("SELECT * FROM gov_filters ORDER BY object")]
    return {"grants": g, "masks": m, "filters": f, "require_grants": enabled(), "mask_methods": MASK_LABELS}


def add_grant(body, actor):
    p, o = _clean_principal(body.get("principal")), _clean_obj(body.get("object"))
    priv = (body.get("privilege") or "SELECT").upper()
    if priv not in PRIVS:
        raise HTTPException(400, "Privilege must be SELECT, MODIFY or ALL")
    if store.one("SELECT id FROM gov_grants WHERE principal=? AND object=? AND privilege=?", (p, o, priv)):
        raise HTTPException(409, "That grant already exists")
    gid = uuid.uuid4().hex[:10]
    store.x("INSERT INTO gov_grants VALUES (?,?,?,?,?,?)", (gid, p, o, priv, _now(), actor))
    return store.one("SELECT * FROM gov_grants WHERE id=?", (gid,))


def add_mask(body, actor):
    o = _clean_obj(body.get("object"), table_only=True)
    col = (body.get("column") or "").strip().strip("`")
    if not re.fullmatch(r"[A-Za-z_][\w]*", col):
        raise HTTPException(400, "Choose a column")
    method = body.get("method") or "hash"
    if method not in MASK_LABELS:
        raise HTTPException(400, "Unknown mask")
    expr = (body.get("expr") or "").strip()
    if method == "custom":
        if "{col}" not in expr or ";" in expr or re.search(r"\b(select|from)\b", expr, re.I):
            raise HTTPException(400, "Custom mask: one SQL expression using {col}, e.g. concat(left({col}, 2), '***')")
    mid = uuid.uuid4().hex[:10]
    store.x("DELETE FROM gov_masks WHERE object=? AND lower(col)=?", (o, col.lower()))
    store.x("INSERT INTO gov_masks VALUES (?,?,?,?,?,?,?,?)", (mid, o, col, method, expr, json.dumps(_exempt_list(body.get("exempt"))), _now(), actor))
    return {"id": mid}


def add_filter(body, actor):
    o = _clean_obj(body.get("object"), table_only=True)
    pred = (body.get("predicate") or "").strip()
    if not pred or ";" in pred or re.search(r"\b(select|insert|update|delete|drop)\b", pred, re.I):
        raise HTTPException(400, "Row filter: one SQL condition, e.g.  tenant = {company}  or  region IN ('North', 'West')")
    fid = uuid.uuid4().hex[:10]
    store.x("INSERT INTO gov_filters VALUES (?,?,?,?,?,?,?)", (fid, o, pred, json.dumps(_exempt_list(body.get("exempt"))),
                                                               (body.get("description") or "")[:200], _now(), actor))
    return {"id": fid}


def delete(kind, rid):
    table = {"grants": "gov_grants", "masks": "gov_masks", "filters": "gov_filters"}.get(kind)
    if not table:
        raise HTTPException(404, "Unknown policy type")
    store.x(f"DELETE FROM {table} WHERE id=?", (rid,))


def table_policies(fq):
    fq = fq.lower()
    db = fq.split(".")[0]
    return {"grants": store.q("SELECT * FROM gov_grants WHERE object IN ('*', ?, ?)", (db, fq)),
            "masks": [{**r, "exempt": json.loads(r["exempt"] or "[]")} for r in store.q("SELECT * FROM gov_masks WHERE object=?", (fq,))],
            "filters": [{**r, "exempt": json.loads(r["exempt"] or "[]")} for r in store.q("SELECT * FROM gov_filters WHERE object=?", (fq,))]}


# ------------------------------------------------------------------ checks
def can(u, fq, privilege="SELECT"):
    if exempt_user(u) or not enabled():
        return True
    fq = fq.lower()
    db = fq.split(".")[0]
    want = {"SELECT": ("SELECT", "ALL"), "MODIFY": ("MODIFY", "ALL")}[privilege]
    for g in store.q("SELECT principal, privilege FROM gov_grants WHERE object IN ('*', ?, ?)", (db, fq)):
        if g["privilege"] in want and matches(g["principal"], u):
            return True
    return False


def visible_tables(u, names):
    """Filter a list of 'schema.table' to those the user may SELECT."""
    return [n for n in names if can(u, n)]


def _blank(sql):
    """Same-length copy with string literals and comments replaced by spaces (so regexes don't match inside them)."""
    out, i, n = list(sql), 0, len(sql)
    while i < n:
        ch = sql[i]
        if ch in ("'", '"'):
            j = i + 1
            while j < n and sql[j] != ch:
                j += 2 if sql[j] == "\\" else 1
            for k in range(i + 1, min(j, n)):
                out[k] = " "
            i = j + 1
        elif sql.startswith("--", i):
            j = sql.find("\n", i)
            j = n if j < 0 else j
            for k in range(i, j):
                out[k] = " "
            i = j
        elif sql.startswith("/*", i):
            j = sql.find("*/", i + 2)
            j = n if j < 0 else j + 2
            for k in range(i, j):
                out[k] = " "
            i = j
        else:
            i += 1
    return "".join(out)


_REF = re.compile(r"\b(from|join)\s+((?:`[^`]+`|[A-Za-z_][\w]*)(?:\s*\.\s*(?:`[^`]+`|[A-Za-z_][\w]*)){0,2})", re.I)
_WRITE = re.compile(r"^\s*(?:insert\s+(?:into|overwrite)(?:\s+table)?|merge\s+into|update|delete\s+from|truncate\s+table|"
                    r"drop\s+(?:table|view)(?:\s+if\s+exists)?|alter\s+table|create\s+(?:or\s+replace\s+)?(?:temporary\s+)?"
                    r"(?:table|view)(?:\s+if\s+not\s+exists)?|replace\s+table|optimize|vacuum|restore\s+table)\s+"
                    r"((?:`[^`]+`|[A-Za-z_][\w]*)(?:\s*\.\s*(?:`[^`]+`|[A-Za-z_][\w]*)){0,2})", re.I)


def _norm(raw):
    parts = [p.strip().strip("`").lower() for p in raw.split(".")]
    if len(parts) == 3:                      # catalog.schema.table -> schema.table
        parts = parts[1:]
    return f"{parts[0]}.{parts[1]}" if len(parts) == 2 else f"default.{parts[0]}"


def split_statements(sql):
    blank, out, start = _blank(sql), [], 0
    for i, ch in enumerate(blank):
        if ch == ";":
            out.append(sql[start:i])
            start = i + 1
    out.append(sql[start:])
    return [s for s in out if s.strip()]


def refs(sql):
    """(read tables, written tables) of one statement, as schema.table."""
    blank = _blank(sql)
    ctes = {x.lower() for x in re.findall(r"(?:\bwith|,)\s*([A-Za-z_]\w*)\s+as\s*\(", blank, re.I)}
    reads = []
    for m in _REF.finditer(blank):
        raw = m.group(2)
        if "." not in raw and raw.strip("`").lower() in ctes | {"values", "range", "unnest", "lateral", "select"}:
            continue
        nxt = blank[m.end(2):].lstrip()
        if nxt.startswith("("):              # table-valued function
            continue
        reads.append(_norm(raw))
    w = _WRITE.match(blank)
    writes = [_norm(w.group(1))] if w else []
    return reads, writes


def _fmt_value(v):
    from .fastsql import sql_str
    return sql_str(v or "")


def _placeholders(pred, u):
    vals = {"username": u.get("username"), "email": u.get("email") or u.get("username"), "company": u.get("company"), "role": u.get("role")}
    return re.sub(r"\{(username|email|company|role)\}", lambda m: _fmt_value(vals[m.group(1)]), pred)


async def _columns(fq):
    from . import dash_ai
    return [c for c, _ in await dash_ai._columns(fq)]


_cols_cache = {}


async def columns(fq):
    hit = _cols_cache.get(fq)
    if hit and _now() - hit[0] < 120:
        return hit[1]
    cols = await _columns(fq)
    _cols_cache[fq] = (_now(), cols)
    return cols


def _q(c):
    return "`" + c.replace("`", "") + "`"


async def _wrap(fq, raw, u):
    """Sub-query that applies masks and row filters of fq for user u, or None when nothing applies."""
    masks = [m for m in store.q("SELECT * FROM gov_masks WHERE object=?", (fq,))
             if not any(matches(p, u) for p in json.loads(m["exempt"] or "[]"))]
    filters = [f for f in store.q("SELECT * FROM gov_filters WHERE object=?", (fq,))
               if not any(matches(p, u) for p in json.loads(f["exempt"] or "[]"))]
    if not masks and not filters:
        return None
    sel = "*"
    if masks:
        by_col = {m["col"].lower(): m for m in masks}
        cols = await columns(fq)
        parts = []
        for c in cols:
            m = by_col.get(c.lower())
            if not m:
                parts.append(_q(c))
                continue
            tpl = m["expr"] if m["method"] == "custom" else MASKS[m["method"]]
            parts.append(f"{tpl.replace('{salt}', _salt()).replace('{col}', _q(c))} AS {_q(c)}")
        sel = ", ".join(parts)
    where = " AND ".join(f"({_placeholders(f['predicate'], u)})" for f in filters)
    return f"(SELECT {sel} FROM {raw}{' WHERE ' + where if where else ''})"


_last_read = {}


def _audit_read(u, tables, purpose):
    key = (u.get("username"), tuple(sorted(tables)), purpose)
    if _now() - _last_read.get(key, 0) < 60:
        return
    _last_read[key] = _now()
    from . import auth
    auth.audit(u.get("username") or "?", f"data.read.{purpose}", ", ".join(sorted(set(tables)))[:300], 200, "")


async def apply(sql, purpose="sql", u=None):
    """Check grants and rewrite the SQL with masks / row filters for the current user. Returns the SQL to run."""
    u = u if u is not None else current_user.get()
    if exempt_user(u):
        return sql
    stmts = split_statements(sql)
    out = []
    all_reads = []
    for s in stmts:
        reads, writes = refs(s)
        head = _blank(s).lstrip().split(None, 1)[0].lower() if s.strip() else ""
        for w in writes:
            if not can(u, w, "MODIFY"):
                raise HTTPException(403, f"You don't have permission to change {w}. Ask an admin for MODIFY on it (Governance › Permissions).")
        for r in reads:
            if not can(u, r, "SELECT"):
                raise HTTPException(403, f"You don't have permission to read {r}. Ask an admin for SELECT on it (Governance › Permissions).")
        if head in ("describe", "desc", "show"):
            m = re.search(r"([A-Za-z_]\w*\.[A-Za-z_]\w*|[A-Za-z_]\w*)\s*$", _blank(s).strip())
            if head != "show" and m and not can(u, _norm(m.group(1))):
                raise HTTPException(403, f"You don't have permission to read {_norm(m.group(1))}.")
            out.append(s)
            continue
        all_reads += reads
        # rewrite FROM/JOIN references that carry masks or row filters (right to left keeps positions valid)
        blank = _blank(s)
        edits = []
        for m in _REF.finditer(blank):
            raw = s[m.start(2):m.end(2)]
            if "." not in raw and raw.strip("`").lower() in {x.lower() for x in re.findall(r"(?:\bwith|,)\s*([A-Za-z_]\w*)\s+as\s*\(", blank, re.I)}:
                continue
            if blank[m.end(2):].lstrip().startswith("("):
                continue
            fq = _norm(raw)
            sub = await _wrap(fq, raw, u)
            if not sub:
                continue
            rest = blank[m.end(2):]
            am = re.match(r"\s+(?:as\s+)?([A-Za-z_]\w*)", rest, re.I)
            has_alias = bool(am) and am.group(1).lower() not in _KW
            edits.append((m.start(2), m.end(2), sub if has_alias else f"{sub} AS {_q(fq.split('.')[1])}"))
        for a, b, rep in sorted(edits, reverse=True):
            s = s[:a] + rep + s[b:]
        out.append(s)
    if all_reads:
        _audit_read(u, all_reads, purpose)
    return ";\n".join(out)
