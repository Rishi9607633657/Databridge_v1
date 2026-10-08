"""Dashboard AI builder: one prompt -> a complete, validated, well laid-out dashboard.

Pipeline: pick tables -> profile them (columns, kinds, distinct counts, date range, sample)
-> plan (LLM via Dora's model, or a rule-based designer when no AI is configured / it fails)
-> validate (run every dataset query, check every column, repair or drop) -> lay out on a 12-column grid."""
import asyncio
import json
import re
import uuid

from fastapi import HTTPException

from . import assistant, catalog
from .kernels import SqlError, run_sql

DASH_KERNEL = "__dashboards__"
NUM_TYPES = ("int", "bigint", "smallint", "tinyint", "double", "float", "decimal", "long", "short")
CHART_TYPES = {"kpi", "bar", "hbar", "line", "area", "pie", "funnel", "table", "panel", "insights", "text"}
SUB_TYPES = {"kpi", "bar", "hbar", "line", "area", "pie", "funnel"}
AGGS = {"sum", "avg", "count", "countd", "min", "max", "none"}
FORMATS = {"compact", "currency_compact", "currency", "number", "integer", "percent"}
OPS = {"eq", "neq", "in", "gt", "gte", "lt", "lte", "contains"}

TEMPLATE = """Goal: (what decisions should this dashboard support?)
Audience: (owner / sales team / operations / finance)
Tables: (e.g. gold.sales_daily, gold.customers — or leave empty and let AI pick)
KPI cards: (e.g. net sales, orders, average order value, discount % — or "you decide")
Charts: (e.g. sales trend with forecast, sales by region, top 10 products, channel share — or "you decide")
Multi-chart panels: (e.g. "regions as tabs", "one small chart per channel" — or "you decide")
Filters: (dashboard-wide: region, channel, date range; per chart: e.g. "top products chart filtered to Online")
Pages: (e.g. Overview, Products, Customers — or "you decide")
Period: (e.g. last 30 days compared with the previous 30 days)
Style: (e.g. compact, executive summary first, details on a second page)"""


def _uid(p):
    return p + uuid.uuid4().hex[:6]


def _q(name):
    return "`" + name.replace("`", "") + "`"


# ------------------------------------------------------------------ discovery & profiling
async def list_tables():
    out = []
    try:
        for d in (await asyncio.wait_for(catalog.databases(), 20))[:40]:
            try:
                for t in await asyncio.wait_for(catalog.tables(d["name"]), 20):
                    out.append(f"{d['name']}.{t['name']}")
            except Exception:  # noqa: BLE001
                continue
    except Exception:  # noqa: BLE001
        pass
    return out


async def _columns(fq):
    """[(name, type)] via the catalog, falling back to a LIMIT 0 query."""
    db, tb = fq.split(".", 1)
    try:
        t = await asyncio.wait_for(catalog.table(db, tb), 30)
        cols = [(c["name"], (c.get("type") or "").lower()) for c in t.get("columns", []) if c.get("name") and not str(c["name"]).startswith("#")]
        if cols:
            return cols
    except Exception:  # noqa: BLE001
        pass
    res = await run_sql(f"DESCRIBE {fq}", 500, key=DASH_KERNEL, label="Dashboards")
    return [(r[0], str(r[1]).lower()) for r in res["rows"] if r[0] and not str(r[0]).startswith("#")]


async def profile(fq):
    cols = (await _columns(fq))[:40]
    if not cols:
        raise HTTPException(400, f"Table {fq} has no columns or does not exist")
    parts = ["count(*) AS __n"]
    for name, typ in cols:
        q = _q(name)
        parts.append(f"approx_count_distinct({q}) AS {_q('d__' + name)}")
        if any(typ.startswith(t) for t in NUM_TYPES) or typ in ("date", "timestamp") or typ.startswith("timestamp"):
            parts.append(f"CAST(min({q}) AS STRING) AS {_q('mn__' + name)}")
            parts.append(f"CAST(max({q}) AS STRING) AS {_q('mx__' + name)}")
    stats = await run_sql(f"SELECT {', '.join(parts)} FROM {fq}", 1, key=DASH_KERNEL, label="Dashboards")
    row = dict(zip(stats["columns"], stats["rows"][0])) if stats["rows"] else {}
    sample = await run_sql(f"SELECT * FROM {fq} LIMIT 3", 3, key=DASH_KERNEL, label="Dashboards")
    n = int(row.get("__n") or 0)
    out = []
    for name, typ in cols:
        distinct = int(row.get("d__" + name) or 0)
        si = sample["columns"].index(name) if name in sample["columns"] else -1
        examples = [str(r[si]) for r in sample["rows"] if si >= 0 and r[si] is not None][:3]
        kind = _kind(name, typ, distinct, n, examples)
        out.append({"name": name, "type": typ, "kind": kind, "distinct": distinct, "min": row.get("mn__" + name),
                    "max": row.get("mx__" + name), "examples": examples})
    for c in out:                                          # actual values of small categories (stages, regions, channels)
        if c["kind"] == "cat" and 0 < c["distinct"] <= 12:
            try:
                vr = await run_sql(f"SELECT {_q(c['name'])}, COUNT(*) FROM {fq} GROUP BY 1 ORDER BY 2 DESC LIMIT 12", 12, key=DASH_KERNEL, label="Dashboards")
                c["values"] = [str(r[0]) for r in vr["rows"] if r[0] is not None]
            except Exception:  # noqa: BLE001
                pass
    return {"table": fq, "rows": n, "columns": out}


def _kind(name, typ, distinct, n, examples):
    lname = name.lower()
    if typ in ("date",) or typ.startswith("timestamp"):
        return "date"
    if typ.startswith("string") and examples and all(re.match(r"^\d{4}-\d{2}-\d{2}", e) for e in examples):
        return "date"
    if any(typ.startswith(t) for t in NUM_TYPES):
        metric = re.search(r"amount|sales|revenue|value|price|total|cost|qty|quantity|count|profit|discount|fee|tax|score|balance|spend", lname)
        if re.search(r"(^|_)(id|key|code|zip|pin|year|month|day)$", lname):
            return "id"
        if not metric and n and distinct >= 0.9 * n and "int" in typ:
            return "id"                                    # unique whole numbers without a metric name: an identifier
        return "num"
    if typ.startswith("boolean"):
        return "cat"
    if distinct and distinct <= 60:
        return "cat"
    return "text"


def _pick_tables(prompt, tables, available):
    if tables:
        return [t for t in tables if t in available] or tables
    low = prompt.lower()
    hits = [t for t in available if t.lower() in low or t.split(".", 1)[1].lower() in low]
    if hits:
        return hits[:4]
    named = []                                       # schema.table written in the prompt (catalog may be slow/unavailable)
    for m in re.findall(r"\b([A-Za-z_]\w*\.[A-Za-z_]\w*)\b", prompt):
        a, b = m.split(".", 1)
        if m not in named and len(a) >= 2 and len(b) >= 2 and not b[0].isdigit():
            named.append(m)
    if named:
        return named[:4]
    gold = [t for t in available if t.lower().startswith("gold.")]
    return (gold or available)[:2]


# ------------------------------------------------------------------ LLM planner
SYSTEM = """You design business dashboards for DataBridge. Return ONLY one JSON object, no prose, no markdown fences.

JSON shape:
{"name": str, "description": str,
 "period": {"preset": "last_7_days|last_week|last_14_days|last_30_days|this_month|last_month|all", "compare": true},
 "style": {"look": "ocean|midnight|aurora|clean", "kpiStyle": "gradient|gauge|spark|tinted", "fitScreen": true, "kpiLayout": "row|beside_insights"},
 "pages": [{"id": "p1", "name": "Overview"}],
 "datasets": [{"id": "ds1", "name": str, "sql": "Spark SQL", "timeColumn": "date/timestamp column or null"}],
 "filters": [{"label": str, "type": "select|multiselect|text", "dataset": "ds1", "column": str}],
 "widgets": [{
   "type": "kpi|bar|hbar|line|area|pie|funnel|table|panel|insights|text", "page": "p1", "title": str,
   "kpiStyle": "gradient|gauge|spark|tinted (optional, per KPI)", "target": "number for gauges (optional)", "heat": true, "totals": true,
   "dataset": "ds1", "x": "column or null", "y": ["numeric column"], "agg": "sum|avg|count|countd|min|max",
   "series": "category column or null", "sort": "label|value_desc|value_asc", "top": 0,
   "format": "compact|currency_compact|integer|percent|number", "lowerBetter": false,
   "size": "XS|S|M|L|XL",
   "ml": {"forecast": 0, "trend": false, "anomalies": false},
   "where": [{"column": str, "op": "eq|neq|in|gt|gte|lt|lte|contains", "value": "..."}],
   "filterControls": ["category column shown as a dropdown on this chart"],
   "panelMode": "tabs|grid", "children": [ {sub-chart: type kpi|bar|hbar|line|area|pie, title, x, y, agg, where, ...} ],
   "text": "markdown for text widgets"}]}

Rules:
- Use ONLY the tables and columns given. Column names must match exactly.
- Datasets: each dataset is one Spark SQL query and should return at most ~5,000 rows. For tables with more rows, write an
  aggregated query: GROUP BY the date (CAST(col AS DATE)) and 1-3 low-cardinality categories, SUM the measures and add COUNT(*) AS records
  (then KPIs use agg "sum" of records instead of count). Add a small "detail" dataset (LIMIT 1000) for tables.
  Use the given relationships to LEFT JOIN lookup tables when their category columns are useful (e.g. customer segment).
  Give every dataset a short "purpose". Set timeColumn to the date/timestamp column.
- 3 to 6 KPI cards first (money -> currency_compact, counts -> integer; discounts/refunds/costs lowerBetter true).
- One "insights" widget on the first page when there is a date column.
- Time trends: line/area with x = the date column; add ml.forecast 7 for the main metric and anomalies true.
- Categories with few values (<= 8): pie or bar; many values: hbar with sort value_desc and top 10.
- Use a "panel" with panelMode "tabs" to group 2-5 related charts in one card (e.g. same metric by region/channel/payment).
- Give each chart filterControls (1-2 category columns) when useful, and "where" for fixed conditions the user asked for.
- size: XS=quarter width (4 per row), S=third (3 per row), M=half, L=two thirds, XL=full width. Widgets are placed in the order you list them,
  left to right, starting a new row when the row is full. Tables are XL at the end or on a second page.
- With 3 or more KPI cards and an insights widget, insights sits at the left and the KPI cards fill 3 per row beside it.
- Unless asked otherwise, design a FULL ONE-PAGE dashboard that fits one screen: style.fitScreen true, 6 KPI cards
  (style.kpiLayout "row" = all 6 across the top; "beside_insights" = insights at the left with 3+3 KPIs beside it),
  then 6-9 charts in rows (XS = 4 per row, S = 3 per row), and put long tables on a second page.
- style.look: "ocean" (light blue, business), "midnight" (dark navy, operations/support), "aurora" (purple, marketing/product), "clean".
  style.kpiStyle: "gradient" (colourful tiles), "gauge" (progress against a target, e.g. CSAT, SLA %, utilisation),
  "spark" (number + trend line). Individual KPIs may override with their own kpiStyle (e.g. a gauge for a percentage KPI).
- "funnel" shows ordered stages (impressions > clicks > leads, created > resolved > closed) — x = stage column, y = count.
- Tables: "heat": true colours numbers by size, "totals": true adds a totals row.
- If the user specified something, follow it exactly; decide the rest yourself for a clean, uncluttered dashboard."""


def _extract_json(text):
    text = text.strip()
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S)
    if m:
        text = m.group(1)
    start, end = text.find("{"), text.rfind("}")
    if start < 0 or end < 0:
        raise ValueError("no JSON object in the AI answer")
    return json.loads(text[start:end + 1])


async def llm_plan(prompt, profiles, rels=None):
    schema = [{"table": p["table"], "rows": p["rows"],
               "columns": [{k: c.get(k) for k in ("name", "type", "kind", "distinct", "min", "max", "examples", "values") if c.get(k) is not None} for c in p["columns"]]}
              for p in profiles]
    msgs = [{"role": "system", "content": SYSTEM},
            {"role": "user", "content": f"Tables (profiled):\n{json.dumps(schema, default=str)[:24000]}\n\nRelationships:\n{json.dumps(rels or [])}\n\nRequest:\n{prompt}"}]
    text = await assistant.complete(msgs, max_tokens=6000)
    return _extract_json(text)


# ------------------------------------------------------------------ relationships between tables
def relationships(profiles):
    """Shared keys between tables: same column name (…_id/_key/_code or ID-like), or fk 'customer_id' -> customers.id."""
    out = []
    for a in profiles:
        for b in profiles:
            if a is b:
                continue
            bname = b["table"].split(".")[-1].lower()
            bcols = {c["name"].lower(): c for c in b["columns"]}
            for c in a["columns"]:
                n = c["name"].lower()
                if not re.search(r"(_id|_key|_code|_no)$|^id$", n) and c["kind"] != "id":
                    continue
                target = None
                if n in bcols and n != "id" and bcols[n]["distinct"] and b["rows"] and bcols[n]["distinct"] >= 0.9 * b["rows"]:
                    target = bcols[n]["name"]                              # b has one row per key -> a looks up b
                stem = re.sub(r"(_id|_key|_code|_no)$", "", n)
                if not target and stem and (bname.startswith(stem) or bname.rstrip("s").endswith(stem)) and "id" in bcols:
                    target = bcols["id"]["name"]                            # customer_id -> customers.id
                if target and not any(r["from"] == a["table"] and r["to"] == b["table"] for r in out):
                    out.append({"from": a["table"], "to": b["table"], "on": [c["name"], target]})
    return out


def _source(p, rels, by_table):
    """FROM clause for a table, joined to related lookup tables to bring in their category columns."""
    joins, extra_cols, used = [], [], set(c["name"].lower() for c in p["columns"])
    for k, r in enumerate([r for r in rels if r["from"] == p["table"]][:2]):
        d = by_table[r["to"]]
        cats = [c for c in sorted(d["columns"], key=lambda c: c["distinct"]) if c["kind"] == "cat" and c["distinct"] >= 2][:2]
        if not cats:
            continue
        alias = f"j{k}"
        sel = []
        for c in cats:
            name = c["name"] if c["name"].lower() not in used else f"{d['table'].split('.')[-1].rstrip('s')}_{c['name']}"
            used.add(name.lower())
            sel.append(f"{alias}.`{c['name']}` AS `{name}`")
            extra_cols.append({**c, "name": name, "from_table": d["table"]})
        joins.append((f"LEFT JOIN {d['table']} {alias} ON f.`{r['on'][0]}` = {alias}.`{r['on'][1]}`", sel))
    if not joins:
        return p["table"], []
    sel = ", ".join(["f.*"] + [s for _, ss in joins for s in ss])
    return f"(SELECT {sel} FROM {p['table']} f {' '.join(j for j, _ in joins)}) src", extra_cols


def _days(c):
    from datetime import date
    try:
        a, b = date.fromisoformat(str(c["min"])[:10]), date.fromisoformat(str(c["max"])[:10])
        return max(1, (b - a).days + 1)
    except Exception:  # noqa: BLE001
        return 365


def _summary_sql(src, date_col, cats, nums, limit=4500):
    """GROUP BY day (+ low-cardinality categories) with SUMs and a record count — small, fast, filterable."""
    est = _days(date_col) if date_col else 1
    keep = []
    for c in sorted(cats, key=lambda c: c["distinct"]):
        if c["distinct"] <= 30 and est * c["distinct"] <= limit:
            keep.append(c)
            est *= c["distinct"]
        if len(keep) == 3:
            break
    keys = ([f"CAST(`{date_col['name']}` AS DATE) AS `{date_col['name']}`"] if date_col else []) + [f"`{c['name']}`" for c in keep]
    group = ", ".join(str(i + 1) for i in range(len(keys)))
    measures = ", ".join([f"SUM(`{n['name']}`) AS `{n['name']}`" for n in nums[:6]] + ["COUNT(*) AS `records`"])
    return f"SELECT {', '.join(keys)}{', ' if keys else ''}{measures}\nFROM {src}" + (f"\nGROUP BY {group}" if keys else ""), keep, est


# ------------------------------------------------------------------ rule-based designer (no AI needed)
def _mentioned(prompt, cols):
    low = prompt.lower().replace("_", " ")
    return [c for c in cols if c["name"].lower().replace("_", " ") in low]


def rule_plan(prompt, profiles, rels=None):
    low = prompt.lower()
    pages = [{"id": "p1", "name": "Overview"}]
    datasets, widgets, filters = [], [], []
    rels = rels if rels is not None else relationships(profiles)
    by_table = {p["table"]: p for p in profiles}
    lookups = {r["to"] for r in rels}
    facts = [p for p in profiles if any(c["kind"] == "num" for c in p["columns"]) and (p["table"] not in lookups or any(c["kind"] == "date" for c in p["columns"]))] or profiles
    want_details = True
    for ti, p in enumerate(facts):
        ds = f"ds{ti + 1}"
        src, joined = _source(p, rels, by_table)
        cols = p["columns"] + joined
        nums = [c for c in cols if c["kind"] == "num"]
        cats = sorted([c for c in cols if c["kind"] == "cat"], key=lambda c: c["distinct"])
        dates = [c for c in cols if c["kind"] == "date"]
        ment = _mentioned(prompt, cols)
        money_first = lambda c: (0 if re.search(r"net_?sales|revenue|sales|amount|gmv|turnover|profit|value|total", c["name"], re.I) else 1)  # noqa: E731
        nums = [c for c in ment if c["kind"] == "num"] + sorted([c for c in nums if c not in ment], key=money_first)
        cats = [c for c in ment if c["kind"] == "cat"] + [c for c in cats if c not in ment]
        tname = p["table"].split(".")[-1].replace("_", " ")
        records_col = None
        if p["rows"] > 5000 and (nums or cats):
            sql, kept, est = _summary_sql(src, dates[0] if dates else None, cats, nums)
            kept_names = {c["name"] for c in kept}
            cats = [c for c in cats if c["name"] in kept_names] + [c for c in cats if c["name"] not in kept_names][:0]
            nums = nums[:6]
            records_col = "records"
            datasets.append({"id": ds, "name": f"{tname} · daily summary" if dates else f"{tname} · summary", "sql": sql,
                             "timeColumn": dates[0]["name"] if dates else None,
                             "purpose": f"{p['rows']:,} rows summarised to about {min(est, 5000):,} (per {'day' if dates else 'group'}"
                                        f"{', ' + ', '.join(c['name'] for c in kept) if kept else ''}) so charts stay fast and complete."})
            datasets.append({"id": f"{ds}d", "name": f"{tname} · detail sample", "sql": f"SELECT * FROM {src}\nLIMIT 1000",
                             "timeColumn": dates[0]["name"] if dates else None, "purpose": "1,000 example rows for the detail table."})
        else:
            sql = f"SELECT * FROM {src}" if src != p["table"] else f"SELECT * FROM {p['table']}"
            datasets.append({"id": ds, "name": tname, "sql": sql, "timeColumn": dates[0]["name"] if dates else None,
                             "purpose": f"All {p['rows']:,} rows{' with ' + ', '.join(c['name'] for c in joined) + ' from related tables' if joined else ''}."})
        nice = lambda c: c["name"].replace("_", " ").strip().capitalize()  # noqa: E731
        money = lambda c: bool(re.search(r"amount|sales|revenue|price|value|total|cost|discount|refund|fee|tax|profit", c["name"], re.I))  # noqa: E731
        lower = lambda c: bool(re.search(r"discount|refund|cost|return|void|cancel|churn|delay", c["name"], re.I))  # noqa: E731
        page = "p1" if ti == 0 else f"p{ti + 1}"
        if ti > 0:
            pages.append({"id": page, "name": nice({"name": p["table"].split(".")[-1]})})
        # ---- semantics: which measures add up, which must be averaged
        avg_like = lambda c: bool(re.search(r"score|rating|csat|nps|satisf|hour|minute|min$|duration|time|days?$|age|rate|ratio|pct|percent|price|temp|avg|mean|speed|latency|sla", c["name"], re.I))  # noqa: E731
        add_m = [c for c in nums if not avg_like(c)]
        avg_m = [c for c in nums if avg_like(c)]
        main = add_m[0] if add_m else None
        count_y = records_col or cols[0]["name"]
        count_agg = "sum" if records_col else "count"
        noun = tname.split(" ·")[0].strip().title() or "Records"
        main_y, main_agg, main_title, main_fmt = ([main["name"]], "sum", nice(main), "compact") if main else ([count_y], count_agg, noun, "integer")
        stage = next((c for c in cats if re.search(r"stage|status|step|funnel|phase|state", c["name"], re.I) and 2 <= c["distinct"] <= 10), None)
        kpis = []
        for c in add_m[:3]:
            kpis.append({"title": nice(c), "y": [c["name"]], "agg": "sum", "format": "currency_compact" if money(c) else "compact", "lowerBetter": lower(c)})
        kpis.append({"title": noun, "y": [count_y], "agg": count_agg, "format": "integer"})
        for c in avg_m[:3]:
            top = c.get("max")
            try:
                top = float(top)
            except (TypeError, ValueError):
                top = None
            gauge = bool(re.search(r"score|rating|csat|nps|satisf|pct|percent|rate|sla", c["name"], re.I)) and top is not None and top <= 100
            kpis.append({"title": f"Avg {c['name'].replace('_', ' ')}", "y": [c["name"]], "agg": "avg", "format": "compact",
                         "lowerBetter": bool(re.search(r"hour|minute|time|duration|days|latency|wait|delay", c["name"], re.I)),
                         **({"kpiStyle": "gauge", "target": 5 if top <= 5 else 10 if top <= 10 else 100} if gauge else {"kpiStyle": "spark"})})
        if main and money(main) and not records_col:          # a true per-row average needs row-level data
            kpis.append({"title": f"{main_title} per {noun.rstrip('s').lower()}", "y": [main["name"]], "agg": "avg", "format": "currency_compact", "kpiStyle": "spark"})
        if stage:
            vals = [str(v) for v in (stage.get("values") or stage.get("examples") or [])]
            final = [v for v in vals if v.lower() in ("closed", "resolved", "completed", "done", "delivered", "won", "paid", "shipped", "converted")]
            for v in (final or ["Closed", "Resolved"])[:2]:
                kpis.append({"title": f"{v} {noun.lower()}", "y": [count_y], "agg": count_agg, "format": "integer", "where": [{"column": stage["name"], "op": "eq", "value": v}]})
        seen_t = set()
        for k in kpis:
            if len([x for x in widgets if x["type"] == "kpi" and x["page"] == page]) >= 6 or k["title"] in seen_t:
                continue
            seen_t.add(k["title"])
            widgets.append({"type": "kpi", "page": page, "dataset": ds, **k})
        # ---- charts, ordered to fill rows: [insights S | trend L] [funnel S | share S | average S] [breakdown M | compare M]
        if dates and ti == 0:
            widgets.append({"type": "insights", "page": page, "title": "Smart insights", "size": "S"})
        if dates:
            widgets.append({"type": "area" if "area" in low else "line", "page": page, "title": f"{main_title} over time", "dataset": ds,
                            "x": dates[0]["name"], "y": main_y, "agg": main_agg, "format": main_fmt, "size": "L" if ti == 0 else "M",
                            "ml": {"forecast": 7 if ("forecast" in low or ti == 0) else 0, "anomalies": True, "trend": "trend" in low},
                            "filterControls": [cats[0]["name"]] if cats else []})
        if stage:
            widgets.append({"type": "funnel", "page": page, "title": f"{nice(stage)} funnel", "dataset": ds, "x": stage["name"],
                            "y": [count_y], "agg": count_agg, "format": "integer", "size": "XS"})
        dims = [c for c in cats if c is not stage]
        if dims:
            c0 = dims[0]
            widgets.append({"type": "pie" if c0["distinct"] <= 6 else "hbar", "page": page, "title": f"{main_title} by {c0['name'].replace('_', ' ')}",
                            "dataset": ds, "x": c0["name"], "y": main_y, "agg": main_agg, "sort": "value_desc", "top": 10, "format": main_fmt, "size": "XS"})
        for c in avg_m[:2]:
            dim = dims[1] if len(dims) > 1 else (dims[0] if dims else None)
            if dim:
                widgets.append({"type": "bar", "page": page, "title": f"Avg {c['name'].replace('_', ' ')} by {dim['name'].replace('_', ' ')}", "dataset": ds,
                                "x": dim["name"], "y": [c["name"]], "agg": "avg", "sort": "value_desc", "format": "compact", "size": "XS",
                                "lowerBetter": bool(re.search(r"hour|minute|time|duration|days|latency", c["name"], re.I))})
        if len(dims) > 1:
            widgets.append({"type": "panel", "page": page, "title": f"{main_title} breakdown", "panelMode": "tabs", "size": "M", "dataset": ds,
                            "children": [{"type": "pie" if c["distinct"] <= 5 else "bar", "title": f"By {c['name'].replace('_', ' ')}", "x": c["name"],
                                          "y": main_y, "agg": main_agg, "sort": "value_desc", "top": 10} for c in dims[1:4]]})
        if dims and len(add_m) > 1:
            widgets.append({"type": "bar", "page": page, "title": f"{nice(add_m[1])} by {dims[0]['name'].replace('_', ' ')}", "dataset": ds,
                            "x": dims[0]["name"], "y": [add_m[1]["name"]], "agg": "sum", "sort": "value_desc", "format": "compact", "size": "M",
                            "filterControls": [dims[1]["name"]] if len(dims) > 1 else []})
        elif dims and stage:
            widgets.append({"type": "bar", "page": page, "title": f"{noun} by {stage['name'].replace('_', ' ')} and {dims[0]['name'].replace('_', ' ')}", "dataset": ds,
                            "x": dims[0]["name"], "series": stage["name"], "y": [count_y], "agg": count_agg, "stacked": True, "format": "integer", "size": "M"})
        for c in cats[:2]:
            if ti == 0:
                filters.append({"label": nice(c), "type": "select", "dataset": ds, "column": c["name"]})
        if want_details:
            if "p_details" not in [x["id"] for x in pages]:
                pages.append({"id": "p_details", "name": "Details"})
            widgets.append({"type": "table", "page": "p_details", "title": f"{nice({'name': p['table'].split('.')[-1]})} — records",
                            "dataset": f"{ds}d" if records_col else ds, "columns": [c["name"] for c in cols[:10]], "size": "XL"})
    name = (facts[0]["table"].split(".")[-1].replace("_", " ").title() + " dashboard") if facts else "Dashboard"
    m = re.match(r"\s*(?:create|build|make|design)?\s*(?:an?\s+)?([A-Za-z][\w &-]{2,40}?)\s+dashboard\b", prompt, re.I)
    if m and m.group(1).lower() not in ("a", "an", "the", "my", "new", "full", "complete"):
        name = m.group(1).strip().title() + " dashboard"
    period = {"preset": "last_30_days" if "30" in low else "last_7_days", "compare": True}
    if not any(d["timeColumn"] for d in datasets):
        period = {"preset": "all", "compare": True}
    return {"name": name, "description": prompt[:200], "pages": pages, "datasets": datasets, "filters": filters, "widgets": widgets, "period": period,
            "style": {"look": "ocean", "kpiStyle": "gradient", "fitScreen": True, "kpiLayout": "row"}}


# ------------------------------------------------------------------ validation & repair
def _match(name, cols):
    if not name:
        return None
    if name in cols:
        return name
    norm = lambda s: re.sub(r"[^a-z0-9]", "", str(s).lower())  # noqa: E731
    for c in cols:
        if norm(c) == norm(name):
            return c
    for c in cols:
        if norm(name) in norm(c) or norm(c) in norm(name):
            return c
    return None


async def validate(plan, profiles, warnings):
    kinds = {}
    for p in profiles:
        for c in p["columns"]:
            kinds[c["name"]] = c["kind"]
    ds_cols = {}
    datasets = []
    for i, d in enumerate(plan.get("datasets") or []):
        did = str(d.get("id") or f"ds{i + 1}")
        sql = (d.get("sql") or "").strip().rstrip(";")
        if not sql:
            continue
        try:
            res = await asyncio.wait_for(run_sql(f"SELECT * FROM ({sql}) _q LIMIT 50", 50, key=DASH_KERNEL, label="Dashboards"), 300)
            cols = res["columns"]
        except (SqlError, asyncio.TimeoutError, HTTPException) as e:
            table = next((p["table"] for p in profiles if p["table"].lower() in sql.lower()), None)
            reason = str(getattr(e, "evalue", e))[:120]
            if not table:
                warnings.append(f"Dropped dataset “{d.get('name', did)}” and its charts: the query failed ({reason}).")
                continue
            warnings.append(f"Dataset “{d.get('name', did)}” query failed ({reason}); used the whole table {table} instead.")
            sql = f"SELECT * FROM {table} LIMIT 5000"
            res = await run_sql(f"SELECT * FROM ({sql}) _q LIMIT 50", 50, key=DASH_KERNEL, label="Dashboards")
            cols = res["columns"]
        ds_cols[did] = cols
        tc = _match(d.get("timeColumn"), cols)
        if not tc:
            tc = next((c for c in cols if kinds.get(c) == "date"), None)
        rows_est = None
        try:
            cres = await asyncio.wait_for(run_sql(f"SELECT COUNT(*) FROM ({sql}) _c", 1, key=DASH_KERNEL, label="Dashboards"), 300)
            rows_est = int(cres["rows"][0][0])
            if rows_est > 5000:
                warnings.append(f"Dataset “{d.get('name', did)}” returns {rows_est:,} rows; dashboards use the first 5,000 — consider aggregating it.")
        except Exception:  # noqa: BLE001
            pass
        datasets.append({"id": did, "name": str(d.get("name") or did)[:60], "sql": sql, "timeColumn": tc or "__none__",
                         "purpose": str(d.get("purpose") or "")[:240], "rows": rows_est})
    if not datasets:
        raise HTTPException(400, "No usable dataset could be built from the request.")
    first_ds = datasets[0]["id"]
    pages = [{"id": str(p.get("id") or f"p{i + 1}"), "name": str(p.get("name") or f"Page {i + 1}")[:40]} for i, p in enumerate(plan.get("pages") or [])] \
        or [{"id": "p1", "name": "Overview"}]
    page_ids = {p["id"] for p in pages}

    def fix_spec(w, cols, sub=False):
        t = w.get("type")
        if t not in (SUB_TYPES if sub else CHART_TYPES):
            t = "bar"
        out = {"type": t, "title": str(w.get("title") or t.title())[:80]}
        if t in ("insights", "text"):
            if t == "text":
                out["text"] = str(w.get("text") or "")[:4000]
            return out
        nums = [c for c in cols if kinds.get(c) in ("num", "id")] or cols
        cats = [c for c in cols if kinds.get(c) == "cat"]
        y = [m for m in (_match(v, cols) for v in (w.get("y") or [])) if m][:3]
        if t != "table" and not y:
            y = [nums[0]] if nums else []
        x = _match(w.get("x"), cols)
        if t in ("bar", "hbar", "line", "area", "pie") and not x:
            x = next((c for c in cols if kinds.get(c) == ("date" if t in ("line", "area") else "cat")), None) or (cats[0] if cats else None)
        out.update({"x": x, "y": y, "agg": w.get("agg") if w.get("agg") in AGGS else "sum",
                    "format": w.get("format") if w.get("format") in FORMATS else "compact"})
        if t == "kpi" and out["agg"] == "count":
            out["format"] = "integer"
        for k in ("lowerBetter",):
            if w.get(k):
                out[k] = bool(w[k])
        if t == "kpi" and w.get("kpiStyle") in ("gradient", "gauge", "spark", "tinted"):
            out["kpiStyle"] = w["kpiStyle"]
        if t == "kpi" and isinstance(w.get("target"), (int, float)):
            out["target"] = w["target"]
        if t == "table":
            out["heat"] = w.get("heat", True) is not False
            out["totals"] = w.get("totals", True) is not False
        s = _match(w.get("series"), cols)
        if s and t in ("bar", "line", "area"):
            out["series"] = s
            out["y"] = out["y"][:1]
        if w.get("stacked") and t in ("bar", "hbar", "area"):
            out["stacked"] = True
        if w.get("sort") in ("label", "value_desc", "value_asc"):
            out["sort"] = w["sort"]
        if isinstance(w.get("top"), int) and 0 < w["top"] <= 50:
            out["top"] = w["top"]
        ml = w.get("ml") or {}
        if t in ("line", "area", "bar") and isinstance(ml, dict) and any(ml.values()):
            out["ml"] = {"forecast": int(ml.get("forecast") or 0) if str(ml.get("forecast") or 0).isdigit() else 0,
                         "trend": bool(ml.get("trend")), "anomalies": bool(ml.get("anomalies"))}
        where = []
        for cond in (w.get("where") or [])[:5]:
            c = _match((cond or {}).get("column"), cols)
            if c and cond.get("op") in OPS and cond.get("value") not in (None, ""):
                where.append({"column": c, "op": cond["op"], "value": cond["value"]})
        if where:
            out["where"] = where
        fc = [m for m in (_match(v, cols) for v in (w.get("filterControls") or [])) if m and kinds.get(m) == "cat"][:2]
        if fc:
            out["filterControls"] = fc
        if t == "table":
            out["columns"] = [m for m in (_match(v, cols) for v in (w.get("columns") or [])) if m][:12] or cols[:10]
        return out

    widgets = []
    for w in plan.get("widgets") or []:
        if not isinstance(w, dict):
            continue
        if w.get("dataset") and w["dataset"] not in ds_cols and w.get("type") not in ("insights", "text"):
            continue                                   # its dataset was dropped
        did = w.get("dataset") if w.get("dataset") in ds_cols else first_ds
        cols = ds_cols[did]
        spec = fix_spec(w, cols)
        spec["id"] = _uid("w")
        spec["page"] = w.get("page") if w.get("page") in page_ids else pages[0]["id"]
        spec["size"] = w.get("size") if w.get("size") in ("XS", "S", "M", "L", "XL") else None
        if spec["type"] not in ("insights", "text"):
            spec["dataset"] = did
        if spec["type"] == "panel":
            kids = []
            for c in (w.get("children") or [])[:6]:
                if isinstance(c, dict):
                    cd = c.get("dataset") if c.get("dataset") in ds_cols else did
                    k = fix_spec(c, ds_cols[cd], sub=True)
                    k["dataset"] = cd
                    kids.append(k)
            if len(kids) < 2:
                warnings.append(f"Panel “{spec['title']}” had too few valid charts and was skipped.")
                continue
            spec.update({"children": kids, "panelMode": w.get("panelMode") if w.get("panelMode") in ("tabs", "grid") else "tabs"})
            spec.pop("x", None); spec.pop("y", None)
        elif spec["type"] not in ("insights", "text", "table") and not spec.get("y"):
            warnings.append(f"Skipped “{spec['title']}”: no numeric column to show.")
            continue
        widgets.append(spec)
    kpis = [w for w in widgets if w["type"] == "kpi"]
    if len(kpis) > 8:
        drop = {id(w) for w in kpis[8:]}
        widgets = [w for w in widgets if id(w) not in drop]
        warnings.append("Kept the first 8 KPI cards to avoid clutter.")
    filters = []
    for f in (plan.get("filters") or [])[:4]:
        did = f.get("dataset") if f.get("dataset") in ds_cols else first_ds
        col = _match(f.get("column"), ds_cols[did])
        if col:
            filters.append({"id": _uid("f"), "label": str(f.get("label") or col)[:40], "type": f.get("type") if f.get("type") in ("select", "multiselect", "text") else "select",
                            "dataset": did, "column": col})
    used_pages = {w["page"] for w in widgets}
    pages = [p for p in pages if p["id"] in used_pages] or pages[:1]
    pr = plan.get("period") or {}
    period = {"preset": pr.get("preset") if pr.get("preset") in ("last_7_days", "last_week", "last_14_days", "last_30_days", "this_month", "last_month", "all") else "last_30_days",
              "compare": pr.get("compare", True) is not False, "column": "", "anchor": "data"}
    if not any(d["timeColumn"] != "__none__" for d in datasets):
        period["preset"] = "all"
    st = plan.get("style") or {}
    return {"datasets": datasets, "pages": pages, "widgets": widgets, "filters": filters, "period": period,
            "refreshMinutes": 0, "currency": "₹", "theme": "auto",
            "look": st.get("look") if st.get("look") in ("ocean", "midnight", "aurora", "clean") else "ocean",
            "kpiStyle": st.get("kpiStyle") if st.get("kpiStyle") in ("gradient", "gauge", "spark", "tinted") else "gradient",
            "fitScreen": st.get("fitScreen", True) is not False,
            "kpiLayout": st.get("kpiLayout") if st.get("kpiLayout") in ("row", "beside_insights") else "row"}


# ------------------------------------------------------------------ layout engine
SIZE_W = {"XS": 3, "S": 4, "M": 6, "L": 8, "XL": 12}
DEFAULT_SIZE = {"line": "L", "area": "L", "bar": "M", "hbar": "M", "pie": "S", "panel": "M", "table": "XL", "text": "M", "insights": "S"}
HEIGHT = {"kpi": 2, "insights": 4, "table": 6, "text": 2}


def layout(defn):
    for page in defn["pages"]:
        ws = [w for w in defn["widgets"] if w["page"] == page["id"]]
        y = 0
        kpis = [w for w in ws if w["type"] == "kpi"]
        ins = next((w for w in ws if w["type"] == "insights"), None)
        row_mode = defn.get("kpiLayout", "beside_insights") == "row"
        if kpis and row_mode:                               # all KPI tiles in one row across the top (up to 6 per row)
            per_row = min(6, len(kpis))
            width = 12 // per_row
            for i, k in enumerate(kpis):
                r_, c_ = divmod(i, per_row)
                k["layout"] = {"x": c_ * width, "y": r_ * 2, "w": width if c_ < per_row - 1 else 12 - c_ * width, "h": 2}
            y = -(-len(kpis) // per_row) * 2
            kpis = []                                       # placed
        if kpis:
            left = 0
            if ins and len(kpis) >= 3:                      # insights column + KPI grid beside it
                ins["layout"] = {"x": 0, "y": 0, "w": 3, "h": 4}
                left = 3
            per_row = 3 if left else min(4, len(kpis)) or 1
            width = (12 - left) // per_row
            for i, k in enumerate(kpis):
                row, col = divmod(i, per_row)
                k["layout"] = {"x": left + col * width, "y": row * 2, "w": width, "h": 2}
            rows = -(-len(kpis) // per_row)
            if left:
                rows = max(rows, 2)
            y = rows * 2
            if ins and not ins.get("layout"):
                ins["layout"] = {"x": 0, "y": y, "w": 4, "h": 4}
        rest = [w for w in ws if w["type"] != "kpi" and not w.get("layout")]
        rest.sort(key=lambda w: (w["type"] == "table", 0))
        row, row_w, row_h = [], 0, 0

        def flush():
            nonlocal y, row, row_w, row_h
            if not row:
                return
            spare = 12 - row_w
            if spare > 0:                                   # stretch the row to the full width
                row[-1]["layout"]["w"] += spare
            for w in row:
                w["layout"]["h"] = row_h
            y += row_h
            row, row_w, row_h = [], 0, 0

        for w in rest:
            size = w.pop("size", None) or DEFAULT_SIZE.get(w["type"], "M")
            wd = SIZE_W[size]
            h = HEIGHT.get(w["type"], 5 if w["type"] == "panel" and w.get("panelMode") == "grid" else 4)
            if row_w + wd > 12:
                flush()
            w["layout"] = {"x": row_w, "y": y, "w": wd, "h": h}
            row.append(w)
            row_w += wd
            row_h = max(row_h, h)
        flush()
    for w in defn["widgets"]:
        w.pop("size", None)
    return defn


# ------------------------------------------------------------------ entry point
async def plan(prompt, tables=None, use_ai=True, schema=None):
    """Design a dashboard (not saved): profile tables, plan with AI (or rules), validate, lay out."""
    prompt = (prompt or "").strip()
    if len(prompt) < 5:
        prompt = "Build a complete overview dashboard: you decide the KPIs, charts, panels and filters."
    available = await list_tables()
    if schema and not tables:
        tables = [t for t in available if t.split(".", 1)[0] == schema]
        if not tables:
            try:
                tables = [f"{schema}.{t['name']}" for t in await catalog.tables(schema)]
            except Exception:  # noqa: BLE001
                tables = []
    chosen = _pick_tables(prompt, tables or [], available)
    if not chosen:
        raise HTTPException(400, "No tables found. Pick a schema or tables, or name them in the prompt (e.g. gold.sales).")
    profiles, warnings = [], []
    for t in chosen[:6]:
        try:
            profiles.append(await profile(t))
        except Exception as e:  # noqa: BLE001
            warnings.append(f"Could not read {t}: {str(getattr(e, 'detail', e))[:150]}")
    if len(chosen) > 6:
        warnings.append(f"Used the first 6 of {len(chosen)} tables — pick the ones that matter for a sharper dashboard.")
    if not profiles:
        raise HTTPException(400, "None of the chosen tables could be read. " + " ".join(warnings))
    rels = relationships(profiles)
    the_plan, used_ai = None, False
    if use_ai:
        try:
            st = await assistant.status()
            if st.get("ok"):
                the_plan = await llm_plan(prompt, profiles, rels)
                used_ai = True
            else:
                warnings.append("AI is not configured (Admin › Settings › Dora), so the built-in designer was used.")
        except Exception as e:  # noqa: BLE001
            warnings.append(f"The AI plan could not be used ({str(e)[:140]}); the built-in designer was used instead.")
            the_plan = None
    if the_plan is None:
        the_plan = rule_plan(prompt, profiles, rels)
    defn = await validate(the_plan, profiles, warnings)
    layout(defn)
    return {"name": str(the_plan.get("name") or "AI dashboard")[:80], "description": str(the_plan.get("description") or prompt)[:300],
            "definition": defn, "warnings": warnings, "used_ai": used_ai, "tables": [p["table"] for p in profiles],
            "relationships": rels, "profiles": [{"table": p["table"], "rows": p["rows"], "columns": len(p["columns"])} for p in profiles]}


def compact(defn):
    """After the user removed widgets: drop unused datasets and pull widgets up to close the gaps."""
    used = {w.get("dataset") for w in defn["widgets"]} | {c.get("dataset") for w in defn["widgets"] for c in (w.get("children") or [])}
    used |= {f.get("dataset") for f in defn.get("filters") or []}
    defn["datasets"] = [d for d in defn["datasets"] if d["id"] in used] or defn["datasets"][:1]
    defn["filters"] = [f for f in defn.get("filters") or [] if f.get("dataset") in {d["id"] for d in defn["datasets"]}]
    pages_used = {w.get("page") for w in defn["widgets"]}
    defn["pages"] = [p for p in defn["pages"] if p["id"] in pages_used] or defn["pages"][:1]
    for page in defn["pages"]:
        placed = []
        for w in sorted([w for w in defn["widgets"] if w.get("page") == page["id"]], key=lambda w: (w["layout"]["y"], w["layout"]["x"])):
            L = w["layout"]
            y = 0
            while any(L["x"] < q["x"] + q["w"] and q["x"] < L["x"] + L["w"] and y < q["y"] + q["h"] and q["y"] < y + L["h"] for q in placed):
                y += 1
            L["y"] = y
            placed.append(dict(L))
    return defn


async def build(prompt, tables=None, use_ai=True, schema=None):
    return await plan(prompt, tables, use_ai, schema)
