"""Table lineage and impact analysis.

Edges are reported by the notebook runtime (config/notebook_runtime.py) whenever Spark code reads or writes tables:
spark.sql / %sql, spark.table, df.write.saveAsTable / insertInto, df.writeTo(...), DeltaTable.merge. Each event is
stored as edges between nodes:
    table:db.t ──flows──▶ table:db.u        (data from t ended up in u)
    table:db.t ──reads──▶ notebook:path      (the notebook / job reads t)
    notebook:path ──writes──▶ table:db.u
Dashboards, SQL alerts and data quality rules are added at query time from their saved SQL."""
import json
import re
import time
from collections import deque

from .jobs import store

store.db.executescript("""
CREATE TABLE IF NOT EXISTS lineage_edges (src TEXT, dst TEXT, kind TEXT, via TEXT, via_kind TEXT, op TEXT, user TEXT,
  first_seen REAL, last_seen REAL, count INTEGER DEFAULT 1, PRIMARY KEY (src, dst, kind, via));
CREATE INDEX IF NOT EXISTS lin_src ON lineage_edges(src);
CREATE INDEX IF NOT EXISTS lin_dst ON lineage_edges(dst);
""")
store.db.commit()
_TBL = re.compile(r"\b(?:from|join)\s+((?:`[^`]+`|[A-Za-z_]\w*)\s*\.\s*(?:`[^`]+`|[A-Za-z_]\w*))", re.I)


def _norm(x):
    x = (x or "").strip().strip("`").lower()
    if x.startswith("path:"):
        return x
    parts = [p.strip("` ") for p in x.split(".") if p]
    parts = parts[-2:]
    return ".".join(parts) if len(parts) == 2 else (f"default.{parts[0]}" if parts else "")


def _edge(src, dst, kind, via, via_kind, op, user):
    now = time.time()
    store.x("INSERT INTO lineage_edges (src, dst, kind, via, via_kind, op, user, first_seen, last_seen, count) VALUES (?,?,?,?,?,?,?,?,?,1) "
            "ON CONFLICT(src, dst, kind, via) DO UPDATE SET last_seen=excluded.last_seen, count=count+1, op=excluded.op, user=excluded.user",
            (src, dst, kind, via, via_kind, op, user, now, now))


def record(ev):
    reads = [n for n in (_norm(r) for r in ev.get("reads") or []) if n][:200]
    writes = [n for n in (_norm(w) for w in ev.get("writes") or []) if n and not n.startswith("path:")][:20]
    if ev.get("job"):
        proc, pk = f"job:{ev['job']}", "job"
    elif ev.get("notebook"):
        proc, pk = f"notebook:{ev['notebook']}", "notebook"
    else:
        proc, pk = f"query:{ev.get('kernel') or 'SQL'}", "query"
    op, user = (ev.get("op") or "")[:40], (ev.get("user") or "")[:120]
    for w in writes:
        _edge(proc, f"table:{w}", "writes", proc, pk, op, user)
        for r in reads:
            src = r if r.startswith("path:") else f"table:{r}"
            _edge(src, f"table:{w}", "flows", proc, pk, op, user)
    if not writes:
        for r in reads:
            if not r.startswith("path:"):
                _edge(f"table:{r}", proc, "reads", proc, pk, op, user)
    return {"ok": True}


# ------------------------------------------------------------------ consumers from saved SQL
def _sql_tables(sql):
    return {_norm(m) for m in _TBL.findall(sql or "")}


def _dashboard_sqls():
    """[(dashboard id, name, [sql...])] from the saved dashboard definitions."""
    res = []
    try:
        rows = store.q("SELECT id, name, definition FROM dashboards")
    except Exception:  # noqa: BLE001
        return res
    for r in rows:
        try:
            d = json.loads(r["definition"] or "{}")
        except ValueError:
            continue
        sqls = [ds.get("sql") or "" for ds in d.get("datasets") or [] if isinstance(ds, dict)]
        res.append((r["id"], r["name"], [x for x in sqls if x]))
    return res


def consumers():
    """Saved SQL that reads tables: dashboards, alerts, quality rules -> [(node id, label, kind, set(tables), sql_text)]"""
    out = []
    for did, name, sqls in _dashboard_sqls():
        t = set()
        for s in sqls:
            t |= _sql_tables(s)
        if t:
            out.append((f"dashboard:{did}", name, "dashboard", t, "\n".join(sqls)))
    try:
        for a in store.q("SELECT id, name, query FROM alerts"):
            out.append((f"alert:{a['id']}", a["name"], "alert", _sql_tables(a["query"]), a["query"]))
    except Exception:  # noqa: BLE001
        pass
    try:
        for r in store.q("SELECT object FROM dq_rules GROUP BY object"):
            out.append((f"quality:{r['object']}", f"Quality rules on {r['object']}", "quality", {r["object"]}, ""))
    except Exception:  # noqa: BLE001
        pass
    return out


# ------------------------------------------------------------------ graph
def _label(node):
    kind, _, name = node.partition(":")
    return {"kind": kind, "name": name}


def graph(fq=None, depth=3):
    """Nodes/edges around one table (or everything when fq is None)."""
    edges = store.q("SELECT src, dst, kind, via, via_kind, last_seen, count FROM lineage_edges")
    cons = consumers()
    for nid, name, kind, tables, _ in cons:
        for t in tables:
            edges.append({"src": f"table:{t}", "dst": nid, "kind": "reads", "via": nid, "via_kind": kind, "last_seen": None, "count": 0, "label": name})
    names = {nid: name for nid, name, *_ in cons}
    if fq:
        start = f"table:{_norm(fq)}"
        out_adj, in_adj = {}, {}
        for e in edges:
            out_adj.setdefault(e["src"], []).append(e)
            in_adj.setdefault(e["dst"], []).append(e)
        keep, nodes = [], {start: 0}
        for direction, adj, key in ((1, out_adj, "dst"), (-1, in_adj, "src")):
            q = deque([(start, 0)])
            seen = {start}
            while q:
                n, d = q.popleft()
                if d >= depth:
                    continue
                for e in adj.get(n, []):
                    m = e[key]
                    if e["kind"] == "flows" or e["kind"] in ("reads", "writes"):
                        keep.append(e)
                        lvl = (d + 1) * direction
                        if m not in nodes or abs(lvl) < abs(nodes[m]):
                            nodes[m] = lvl
                        if m not in seen and m.startswith(("table:", "path:")):
                            seen.add(m)
                            q.append((m, d + 1))
        uniq = {(e["src"], e["dst"], e["kind"]): e for e in keep}
        edges = list(uniq.values())
    else:
        nodes = {}
        for e in edges:
            nodes.setdefault(e["src"], 0)
            nodes.setdefault(e["dst"], 0)
    return {"center": f"table:{_norm(fq)}" if fq else None,
            "nodes": [{"id": n, **_label(n), "level": lvl, "label": names.get(n, _label(n)["name"])} for n, lvl in nodes.items()],
            "edges": [{"src": e["src"], "dst": e["dst"], "kind": e["kind"], "via": e["via"], "count": e["count"], "last_seen": e["last_seen"]} for e in edges]}


def impact(fq, column=None):
    """Everything downstream of a table, and (with a column) which of it mentions that column."""
    g = graph(fq, depth=10)
    down = [n for n in g["nodes"] if n["level"] > 0]
    col = (column or "").strip().strip("`")
    hits = {}
    if col:
        rx = re.compile(rf"(?<![\w.]){re.escape(col)}(?!\w)", re.I)
        texts = {nid: sql for nid, _, _, _, sql in consumers()}
        from .settings import settings
        for n in down:
            text = texts.get(n["id"], "")
            if n["kind"] in ("notebook", "job") and not text:
                path = n["name"]
                if n["kind"] == "job":
                    j = store.one("SELECT tasks FROM jobs WHERE name=?", (path,))
                    paths = [t["notebook_path"] for t in json.loads(j["tasks"])] if j else []
                else:
                    paths = [path]
                for p in paths:
                    try:
                        nb = json.loads((settings.workspace / p).read_text(encoding="utf-8"))
                        text += "\n".join("".join(c.get("source") or []) if isinstance(c.get("source"), list) else (c.get("source") or "")
                                          for c in nb.get("cells", []))
                    except Exception:  # noqa: BLE001
                        pass
            if text:
                m = [ln.strip()[:160] for ln in text.splitlines() if rx.search(ln)]
                if m:
                    hits[n["id"]] = m[:5]
    groups = {}
    for n in down:
        groups.setdefault(n["kind"], []).append({**n, "mentions": hits.get(n["id"])})
    return {"table": _norm(fq), "column": col or None, "downstream": groups, "total": len(down),
            "column_hits": len(hits) if col else None}
