"""BI endpoint: an OData v4 feed of the catalog for Power BI, Excel, Tableau and anything else that reads OData,
plus a CSV/JSON query URL for tools that call a web address with SQL.

Power BI / Excel:  Get Data › OData feed › https://<your DataBridge>/api/odata/
                   Authentication: Basic — user name = your DataBridge user, password = a personal access token
                   (Account › Access tokens). Every table you may read shows up in the Navigator.
Paging is server-driven (@odata.nextLink); $select, $filter, $orderby, $top, $skip and $count are pushed down to
SQL, so Power Query folding works. All reads go through Governance (grants, masks, row filters) as that person."""
import asyncio
import datetime as dt
import re
from xml.sax.saxutils import escape

from fastapi import HTTPException

from . import catalog, dash_ai, fastsql, governance
from .kernels import run_sql
from .settings import env

BI_KERNEL = "__bi__"
NS = "DataBridge"
SEP = "__"


def page_size():
    return max(100, min(int(env("ODATA_PAGE_SIZE", "5000") or 5000), 50000))


def set_name(schema, table):
    return f"{schema}{SEP}{table}"


def parse_set(name):
    if SEP not in name or not re.fullmatch(r"[A-Za-z_]\w*", name):
        raise HTTPException(404, f"Unknown table {name}")
    s, t = name.split(SEP, 1)
    return s, t


def _edm(t):
    t = (t or "").lower()
    if t.startswith(("bigint", "long")):
        return "Edm.Int64"
    if t.startswith(("int", "integer")):
        return "Edm.Int32"
    if t.startswith(("smallint", "short", "tinyint", "byte")):
        return "Edm.Int16"
    if t.startswith(("double", "float", "real")):
        return "Edm.Double"
    if t.startswith(("decimal", "numeric")):
        return "Edm.Decimal"
    if t.startswith("bool"):
        return "Edm.Boolean"
    if t == "date":
        return "Edm.Date"
    if t.startswith("timestamp"):
        return "Edm.DateTimeOffset"
    return "Edm.String"


async def _query(sql, limit):
    return await fastsql.query(sql, limit, lambda: asyncio.wait_for(run_sql(sql, limit, key=BI_KERNEL, label="BI endpoint"), 900))


async def tables(user):
    out = []
    for d in await catalog.databases():
        try:
            for t in await catalog.tables(d["name"]):
                fq = f"{d['name']}.{t['name']}"
                if governance.can(user, fq) and re.fullmatch(r"[A-Za-z_]\w*", d["name"]) and re.fullmatch(r"[A-Za-z_]\w*", t["name"]):
                    out.append((d["name"], t["name"]))
        except Exception:  # noqa: BLE001
            continue
    return out


async def columns(schema, table):
    cols = await dash_ai._columns(f"{schema}.{table}")
    return [(c, _edm(t), t) for c, t in cols if re.fullmatch(r"[A-Za-z_][\w]*", c)]


def service_doc(base, sets):
    return {"@odata.context": f"{base}$metadata", "value": [{"name": n, "kind": "EntitySet", "url": n} for n in sets]}


async def metadata(user):
    parts = []
    sets = []
    for s, t in await tables(user):
        try:
            cols = await columns(s, t)
        except Exception:  # noqa: BLE001
            continue
        name = set_name(s, t)
        props = "".join(f'<Property Name="{escape(c)}" Type="{e}"/>' for c, e, _ in cols)
        parts.append(f'<EntityType Name="{name}"><Key><PropertyRef Name="_row"/></Key>'
                     f'<Property Name="_row" Type="Edm.Int64" Nullable="false"/>{props}</EntityType>')
        sets.append(f'<EntitySet Name="{name}" EntityType="{NS}.{name}"/>')
    return ('<?xml version="1.0" encoding="utf-8"?>'
            '<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"><edmx:DataServices>'
            f'<Schema Namespace="{NS}" xmlns="http://docs.oasis-open.org/odata/ns/edm">{"".join(parts)}'
            f'<EntityContainer Name="Container">{"".join(sets)}</EntityContainer></Schema></edmx:DataServices></edmx:Edmx>')


# ------------------------------------------------------------------ $filter → SQL
_TOK = re.compile(r"\s*(?:(?P<str>'(?:[^']|'')*')|(?P<dt>\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})?)|(?P<date>\d{4}-\d{2}-\d{2})|"
                  r"(?P<num>-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[mMdDfFlL]?)|(?P<id>[A-Za-z_][\w]*)|(?P<p>[(),/]))")
CMP = {"eq": "=", "ne": "<>", "gt": ">", "ge": ">=", "lt": "<", "le": "<="}
FUNCS1 = {"tolower": "lower({0})", "toupper": "upper({0})", "trim": "trim({0})", "length": "length({0})",
          "year": "year({0})", "month": "month({0})", "day": "day({0})", "hour": "hour({0})", "minute": "minute({0})",
          "date": "CAST({0} AS DATE)", "round": "round({0})", "floor": "floor({0})", "ceiling": "ceil({0})"}
FUNCS2 = {"contains": "({0} LIKE concat('%', {1}, '%'))", "startswith": "({0} LIKE concat({1}, '%'))",
          "endswith": "({0} LIKE concat('%', {1}))", "indexof": "(instr({0}, {1}) - 1)", "concat": "concat({0}, {1})"}


class _P:
    def __init__(self, text, cols):
        self.toks, self.i, self.cols = [], 0, {c.lower(): c for c in cols}
        pos = 0
        while pos < len(text):
            m = _TOK.match(text, pos)
            if not m or m.end() == pos:
                if text[pos:].strip() == "":
                    break
                raise HTTPException(400, f"$filter: can't read {text[pos:pos + 20]!r}")
            kind = m.lastgroup
            self.toks.append((kind, m.group(kind)))
            pos = m.end()

    def peek(self):
        return self.toks[self.i] if self.i < len(self.toks) else (None, None)

    def take(self, val=None):
        k, v = self.peek()
        if val is not None and (v or "").lower() != val:
            raise HTTPException(400, f"$filter: expected {val!r}")
        self.i += 1
        return k, v

    def parse(self):
        e = self.or_()
        if self.i != len(self.toks):
            raise HTTPException(400, "$filter: unexpected text at the end")
        return e

    def or_(self):
        e = self.and_()
        while (self.peek()[1] or "").lower() == "or":
            self.take()
            e = f"({e} OR {self.and_()})"
        return e

    def and_(self):
        e = self.not_()
        while (self.peek()[1] or "").lower() == "and":
            self.take()
            e = f"({e} AND {self.not_()})"
        return e

    def not_(self):
        if (self.peek()[1] or "").lower() == "not":
            self.take()
            return f"(NOT {self.not_()})"
        return self.cmp()

    def cmp(self):
        left = self.value()
        k, v = self.peek()
        if k == "id" and v.lower() in CMP:
            self.take()
            right = self.value()
            op = v.lower()
            if right == "NULL":
                return f"({left} IS {'NOT ' if op == 'ne' else ''}NULL)"
            return f"({left} {CMP[op]} {right})"
        return left

    def value(self):
        k, v = self.take()
        if k == "p" and v == "(":
            e = self.or_()
            self.take(")")
            return e
        if k == "str":
            return fastsql.sql_str(v[1:-1].replace("''", "'"))
        if k == "num":
            return re.sub(r"[mMdDfFlL]$", "", v)
        if k == "date":
            return f"DATE '{v}'"
        if k == "dt":
            return f"TIMESTAMP '{v.replace('T', ' ').rstrip('Z')[:26]}'"
        if k == "id":
            lv = v.lower()
            if lv in ("null",):
                return "NULL"
            if lv in ("true", "false"):
                return lv.upper()
            if (self.peek()[1] or "") == "(":
                self.take("(")
                args = [self.or_()]
                while self.peek()[1] == ",":
                    self.take(",")
                    args.append(self.or_())
                self.take(")")
                if lv in FUNCS1 and len(args) == 1:
                    return FUNCS1[lv].format(*args)
                if lv in FUNCS2 and len(args) == 2:
                    return FUNCS2[lv].format(*args)
                raise HTTPException(400, f"$filter: function {v} is not supported")
            if lv in self.cols:
                return f"`{self.cols[lv]}`"
            raise HTTPException(400, f"$filter: unknown column {v}")
        raise HTTPException(400, f"$filter: unexpected {v!r}")


def filter_sql(text, cols):
    return _P(text, cols).parse()


def _fix(v, edm):
    if v is None:
        return None
    if edm == "Edm.DateTimeOffset":
        s = str(v).replace(" ", "T")
        return s if s.endswith("Z") or re.search(r"[+-]\d{2}:\d{2}$", s) else s + "Z"
    if edm == "Edm.Date":
        return str(v)[:10]
    if edm == "Edm.String" and not isinstance(v, str):
        import json
        return json.dumps(v, default=str)
    return v


async def entity_set(base, name, params, count_only=False):
    s, t = parse_set(name)
    cols = await columns(s, t)
    if not cols:
        raise HTTPException(404, f"Unknown table {name}")
    names = [c for c, _, _ in cols]
    edm = {c: e for c, e, _ in cols}
    raw = {c: r for c, _, r in cols}
    sel = names
    if params.get("$select"):
        want = [x.strip() for x in params["$select"].split(",") if x.strip() and x.strip() != "_row"]
        bad = [w for w in want if w not in edm]
        if bad:
            raise HTTPException(400, f"$select: unknown column {', '.join(bad)}")
        sel = want or names
    where = f" WHERE {filter_sql(params['$filter'], names)}" if params.get("$filter") else ""
    src = f"`{s}`.`{t}`"
    if count_only or params.get("$count", "").lower() == "true":
        cres = await _query(f"SELECT count(*) AS n FROM {src}{where}", 1)
        n = int(cres["rows"][0][0]) if cres["rows"] else 0
        if count_only:
            return n
    else:
        n = None
    order = []
    for part in [x.strip() for x in (params.get("$orderby") or "").split(",") if x.strip()]:
        c, _, d = part.partition(" ")
        if c not in edm:
            raise HTTPException(400, f"$orderby: unknown column {c}")
        order.append(f"`{c}` {'DESC' if d.strip().lower() == 'desc' else 'ASC'}")
    if not order:                      # stable paging: order by every orderable column
        order = [f"`{c}`" for c in sel if not raw[c].lower().startswith(("map", "struct", "array", "binary"))]
    skip = max(0, int(params.get("$skip") or 0))
    top = int(params["$top"]) if params.get("$top") else None
    size = page_size()
    take = min(size, top) if top is not None else size
    sql = (f"SELECT {', '.join(f'`{c}`' for c in sel)} FROM {src}{where}"
           f"{(' ORDER BY ' + ', '.join(order)) if order else ''} LIMIT {take + 1} OFFSET {skip}")
    res = await _query(sql, take + 1)
    rows = res["rows"]
    more = len(rows) > take
    rows = rows[:take]
    value = []
    for i, r in enumerate(rows):
        rec = {"_row": skip + i}
        for c, v in zip(sel, r):
            rec[c] = _fix(v, edm[c])
        value.append(rec)
    out = {"@odata.context": f"{base}$metadata#{name}" + (f"({','.join(sel)})" if params.get("$select") else "")}
    if n is not None:
        out["@odata.count"] = n
    out["value"] = value
    remaining = None if top is None else top - take
    if more and (remaining is None or remaining > 0):
        from urllib.parse import urlencode
        nxt = {k: v for k, v in params.items() if k not in ("$skip", "$top")}
        nxt["$skip"] = str(skip + take)
        if remaining is not None:
            nxt["$top"] = str(remaining)
        out["@odata.nextLink"] = f"{base}{name}?{urlencode(nxt)}"
    return out


async def run_query(sql, limit):
    stmts = governance.split_statements(sql)
    if len(stmts) != 1 or governance.refs(sql)[1] or not re.match(r"^\s*(select|with)\b", governance._blank(sql), re.I):
        raise HTTPException(400, "Only one SELECT query is allowed here")
    return await _query(sql.strip().rstrip(";"), limit)


def to_csv(res):
    import csv
    import io
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(res["columns"])
    for r in res["rows"]:
        w.writerow(["" if v is None else (v.isoformat() if isinstance(v, (dt.date, dt.datetime)) else v) for v in r])
    return buf.getvalue()
