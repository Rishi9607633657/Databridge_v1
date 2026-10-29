"""Overview dashboards in the Dashboards tab: the DataBridge AI Overview built from ordinary widgets (no AI needed).

Tabs, all with the same period and filters: Overview (an icon KPI row, a 3D globe card with regions and the top locations
as buildings, a trend with a forecast, a top list, a donut, a category list, AI insight tiles), Analytics (trends and
breakdowns), AI Insights (every finding on the dashboard) and Reports (summary tables and the latest records).

Big tables are summarised by day into small datasets, so every number is exact for any period:
  locations   day × location (+ city, state, country, lat/lon)   KPIs, globe, trend, top list
  categories  day × category                                     category list
  segments    day × segment                                      donut
When a breakdown has too many rows per day it is kept per week or per month instead.

The dashboard filters (region, location, category, segment) are linked: clicking a region on the globe, a row in a
list or a donut slice sets them. Each dataset reads the filters through SQL parameters, except the one for its own
breakdown, so the widget you click keeps all its rows (your choice is highlighted) while the rest of the dashboard is
filtered exactly."""
import re

from . import boards, dash_ai

LIMIT = 60_000          # rows per summary dataset (dashboards.MAX_BIG)
LOWER = re.compile(r"discount|refund|cost|return|void|cancel|churn|delay|waste|loss", re.I)
IDLIKE = re.compile(r"(^|_)(id|key|code|no|number|uuid|guid|pk|fk|zip|pin|pincode|phone|mobile|year)$", re.I)


def _cols_for(fact, profiles, rels):
    """The fact table's columns plus the columns of the lookup tables it joins to (city, state… from a stores table)."""
    by = {p["table"]: p for p in profiles}
    cols = [dict(c, expr=f"f.`{c['name']}`") for c in fact["columns"]]
    used = {c["name"].lower() for c in cols}
    joins = []
    for k, r in enumerate([r for r in rels if r["from"] == fact["table"] and r["to"] in by][:3]):
        d, alias = by[r["to"]], f"j{k}"
        joins.append(f"LEFT JOIN {d['table']} {alias} ON f.`{r['on'][0]}` = {alias}.`{r['on'][1]}`")
        for c in d["columns"]:
            if c["name"].lower() == str(r["on"][1]).lower():
                continue
            name = c["name"] if c["name"].lower() not in used else f"{d['table'].split('.')[-1].rstrip('s')}_{c['name']}"
            used.add(name.lower())
            cols.append(dict(c, name=name, expr=f"{alias}.`{c['name']}`"))
    return cols, f"{fact['table']} f" + "".join(f" {j}" for j in joins)


def _ident(s):
    return re.sub(r"\W+", "_", str(s or "")).strip("_").lower() or "v"


def plan(prompt, profiles, rels):
    """A complete dashboard plan (the same shape as dash_ai.rule_plan), or None when the tables do not suit it."""
    facts = [p for p in profiles if any(c["kind"] in ("num", "date") for c in p["columns"])]
    if not facts:
        return None
    fact = max(facts, key=lambda p: (any(c["kind"] == "date" for c in p["columns"]), any(c["kind"] == "num" for c in p["columns"]), p["rows"]))
    cols, src = _cols_for(fact, profiles, rels)
    for c in cols:                                  # a number with one value per row ("orders", "stores") is a measure, not a key
        if c["kind"] == "id" and str(c.get("type") or "").lower().startswith(dash_ai.NUM_TYPES) and not IDLIKE.search(c["name"]):
            c["kind"] = "num"
    col = {c["name"]: c for c in cols}
    m = boards._roles(cols)
    words = boards.labels_for({"map": m, "table": fact["table"]})
    X = lambda n: col[n]["expr"] if n and n in col else None  # noqa: E731
    distinct = lambda n: int((col.get(n) or {}).get("distinct") or 0)  # noqa: E731
    title = boards._title

    # ---- time: one row per day (a week or a month when a breakdown is too detailed)
    date = m.get("date")
    day = None
    if date:
        typ = str(col[date].get("type") or "").lower()
        day = f"CAST({X(date)} AS DATE)" if typ.startswith(("date", "timestamp")) else f"CAST(SUBSTR(CAST({X(date)} AS STRING), 1, 10) AS DATE)"
    days = dash_ai._days(col[date]) if date else 1
    dd = distinct(date) if date else 0           # how often the table has a date: daily, weekly or monthly rows
    data_grain = "month" if date and dd and dd <= days / 20 else "week" if date and dd and dd <= days / 4 else "day"

    def grain(n):
        if not day:
            return None
        for g, per in (("day", 1), ("week", 7), ("month", 30.4)):
            if days / per * max(1, n) <= LIMIT:
                return g
        return "month"

    def bucket(g):
        return day if g == "day" else f"CAST(DATE_TRUNC('{g}', {day}) AS DATE)"

    # ---- roles
    site = m.get("site")
    geo = [n for n in (m.get("city"), m.get("state"), m.get("country")) if n]
    zone = next((n for n in (m.get("country"), m.get("state"), m.get("city")) if n and 2 <= distinct(n) <= 80), None)
    if zone is None and site and site in geo:
        zone = site
    category, segment = m.get("category"), m.get("segment")
    measure = m.get("measure")
    taken = {c.lower() for c in col}

    def alias(want):
        a = next((x for x in (want, f"{want}_n", f"{want}_total") if x.lower() not in taken), f"{want}_{len(taken)}")
        taken.add(a.lower())
        return a

    meas = []                                     # (alias, sql, kpi title, format, lowerBetter)
    money = bool(measure and boards.MONEY.search(measure))
    fmt_main = "currency_compact" if money else "compact"
    if measure:
        meas.append((measure, f"SUM(CAST({X(measure)} AS DOUBLE))", words["primary"], fmt_main, bool(LOWER.search(measure))))
    for role, label in (("orders", words.get("secondary")), ("customers", words.get("people"))):
        n, mode = m.get(role), m.get(f"{role}_mode")
        if not n or not label:
            continue
        a = n if mode == "sum" else alias(_ident(label))
        meas.append((a, f"COUNT(DISTINCT {X(n)})" if mode == "countd" else f"SUM(CAST({X(n)} AS DOUBLE))", label, "integer" if mode == "countd" else "compact", False))
    extra = next((c for c in cols if c["kind"] == "num" and c["name"] not in (measure, m.get("orders"), m.get("customers"), m.get("rate"))
                  and not boards.AVG_LIKE.search(c["name"]) and (LOWER.search(c["name"]) or boards.MONEY.search(c["name"]))), None)
    if extra:
        meas.append((extra["name"], f"SUM(CAST({X(extra['name'])} AS DOUBLE))", title(extra["name"]),
                     "currency_compact" if (boards.MONEY.search(extra["name"]) or (LOWER.search(extra["name"]) and money)) else "compact", bool(LOWER.search(extra["name"]))))
    rate = m.get("rate")
    main_y = measure or "records"
    primary = words["primary"] if measure else "Records"

    # ---- linked filters: one SQL parameter per breakdown
    params = {}
    for role, n in (("zone", zone), ("site", site if site != zone else None), ("category", category), ("segment", segment)):
        if n:
            p = _ident(n)
            while p in {v[0] for v in params.values()}:
                p += "_f"
            params[role] = (p, X(n), n)

    def where(*skip):
        conds = [f"({{{{{p}}}}} IS NULL OR CAST({e} AS STRING) = CAST({{{{{p}}}}} AS STRING))" for r, (p, e, _) in params.items() if r not in skip]
        return f"\nWHERE {' AND '.join(conds)}" if conds else ""

    tname = fact["table"].split(".")[-1]
    nice_t = title(tname)
    datasets, widgets, filters = [], [], []

    # ---- locations: KPIs, globe, trend, top list
    keys = []
    if day:
        g_loc = grain(distinct(site) if site else 1)
        keys.append((bucket(g_loc), date))
    else:
        g_loc = None
    if site:
        keys.append((X(site), site))
    for n in geo:
        if n != site:
            keys.append((X(n), n))
    aggs = [f"{sql} AS `{a}`" for a, sql, *_ in meas]
    for r in ("lat", "lon"):
        if m.get(r):
            aggs.append(f"MAX(CAST({X(m[r])} AS DOUBLE)) AS `{m[r]}`")
    if rate:
        aggs.append(f"AVG(CAST({X(rate)} AS DOUBLE)) AS `{rate}`")
    aggs.append("COUNT(*) AS `records`")
    sel = [f"{e} AS `{n}`" for e, n in keys] + aggs
    group = f"\nGROUP BY {', '.join(str(i + 1) for i in range(len(keys)))}" if keys else ""
    step = {"week": "week", "month": "month"}.get(g_loc or "", "")
    what = words["entity"].lower() if site else "day" if day else ""
    datasets.append({"id": "dsl", "name": f"{nice_t} · " + (f"by {what}" if what else "totals") + (f" and {step}" if step and site else ""),
                     "sql": f"SELECT {', '.join(sel)}\nFROM {src}{where('zone', 'site')}{group}", "timeColumn": date, "maxRows": LIMIT,
                     "purpose": f"{fact['rows']:,} rows summarised per {step or ('day' if day else 'group')}{' and ' + words['entity'].lower() if site else ''}: KPIs, globe, trend and top list."})
    # ---- KPI row (icon tiles)
    kpis = [{"title": t, "y": [a], "agg": "sum", "format": f, **({"lowerBetter": True} if lb else {})} for a, _, t, f, lb in meas[:3]]
    if not meas:
        kpis.append({"title": "Records", "y": ["records"], "agg": "sum", "format": "integer"})
    if site and distinct(site) >= 2:
        kpis.append({"title": words["entities"], "y": [site], "agg": "countd", "format": "integer"})
    for a, _, t, f, lb in meas[3:]:
        kpis.append({"title": t, "y": [a], "agg": "sum", "format": f, **({"lowerBetter": True} if lb else {})})
    if rate:
        kpis.append({"title": f"Avg {words['rate'] or title(rate)}", "y": [rate], "agg": "avg", "format": "percent" if m.get("rate_scale") == 1.0 else "compact"})
    for k in kpis[:4]:                                  # four cards: wide enough for big numbers on a laptop screen
        widgets.append({"type": "kpi", "page": "p1", "dataset": "dsl", **k})
    # ---- globe + trend
    has_geo = bool(geo or (m.get("lat") and m.get("lon")))
    if site and has_geo:
        gw = {"type": "globe", "page": "p1", "dataset": "dsl", "title": "Global Business Overview", "x": site, "y": [main_y], "agg": "sum",
              "format": fmt_main, "size": "L", "kind": words.get("building") or "office"}
        for r in ("city", "state", "country", "lat", "lon"):
            if m.get(r):
                gw[r] = m[r]
        if zone:
            gw["zone"] = zone
        widgets.append(gw)
    if day:
        fc = {"day": 7, "week": 4, "month": 3}[max((g_loc, data_grain), key=("day", "week", "month").index)]
        widgets.append({"type": "area", "page": "p1", "dataset": "dsl", "title": f"{primary} Performance", "x": date, "y": [main_y], "agg": "sum",
                        "format": fmt_main, "size": "S" if site and has_geo else "L", "ml": {"forecast": fc, "anomalies": True}})
    # ---- top list
    if site and distinct(site) >= 2:
        widgets.append({"type": "rank", "page": "p1", "dataset": "dsl", "title": f"Top {words['entities']} by {primary}", "x": site, "y": [main_y],
                        "agg": "sum", "format": fmt_main, "top": 8, "size": "S"})

    def breakdown(did, n, skip, label):
        g = grain(distinct(n))
        k = ([(bucket(g), date)] if day else []) + [(X(n), n)]
        s = [f"{e} AS `{a}`" for e, a in k] + ([f"SUM(CAST({X(measure)} AS DOUBLE)) AS `{measure}`"] if measure else []) + ["COUNT(*) AS `records`"]
        datasets.append({"id": did, "name": f"{nice_t} · by {title(n).lower()}{f' and {g}' if g and g != 'day' else ''}", "timeColumn": date, "maxRows": LIMIT,
                         "sql": f"SELECT {', '.join(s)}\nFROM {src}{where(skip)}\nGROUP BY {', '.join(str(i + 1) for i in range(len(k)))}",
                         "purpose": f"{label} per {g or 'group'}."})

    # ---- segment donut and category list
    if segment:
        breakdown("dss", segment, "segment", f"{primary} by {title(segment).lower()}")
        widgets.append({"type": "pie", "page": "p1", "dataset": "dss", "title": f"{primary} by {title(segment)}", "x": segment, "y": [main_y], "agg": "sum",
                        "format": fmt_main, "top": 6, "size": "S", "pieStyle": "donut"})
    if category:
        breakdown("dsc", category, "category", f"{primary} by {title(category).lower()}")
        widgets.append({"type": "catlist", "page": "p1", "dataset": "dsc", "title": f"{primary} by {title(category)}", "x": category, "y": [main_y],
                        "agg": "sum", "format": fmt_main, "top": 8, "size": "S"})
    if day or segment or category or (site and distinct(site) >= 2):
        widgets.append({"type": "insights", "page": "p1", "title": "AI Insights", "size": "XL", "scope": "all"})
    # ---- Analytics: trends and breakdowns, same filters and period
    fmt_of = {a: f for a, _, _, f, _ in meas}
    if day:
        widgets.append({"type": "line", "page": "p_an", "dataset": "dsl", "title": f"{primary} trend", "x": date, "y": [main_y], "agg": "sum",
                        "format": fmt_main, "size": "L", "ml": {"forecast": {"day": 14, "week": 6, "month": 3}[max((g_loc, data_grain), key=("day", "week", "month").index)],
                                                                "anomalies": True, "trend": True}})
    if zone and zone != site:
        widgets.append({"type": "bar", "page": "p_an", "dataset": "dsl", "title": f"{primary} by {title(zone)}", "x": zone, "y": [main_y], "agg": "sum",
                        "sort": "value_desc", "top": 10, "format": fmt_main, "size": "S" if day else "M", "colorBy": "category"})
    if category and day:
        widgets.append({"type": "area", "page": "p_an", "dataset": "dsc", "title": f"{primary} by {title(category)} over time", "x": date, "y": [main_y],
                        "series": category, "stacked": True, "agg": "sum", "format": fmt_main, "size": "M", **({"grain": "week"} if data_grain == "day" else {})})
    if segment and day:
        widgets.append({"type": "line", "page": "p_an", "dataset": "dss", "title": f"{primary} by {title(segment)} over time", "x": date, "y": [main_y],
                        "series": segment, "agg": "sum", "format": fmt_main, "size": "M", **({"grain": "week"} if data_grain == "day" else {})})
    if site and distinct(site) >= 2:
        second = next((a for a, *_ in meas[1:3]), None)
        if second and measure:
            widgets.append({"type": "scatter", "page": "p_an", "dataset": "dsl", "title": f"{words['entities']}: {title(second)} vs {primary}", "x": second,
                            "y": [main_y], "label": site, "sizeBy": main_y, "agg": "sum", "aggX": "sum", "format": fmt_main, "size": "M"})
        widgets.append({"type": "hbar", "page": "p_an", "dataset": "dsl", "title": f"{words['entities']} ranked by {primary}", "x": site, "y": [main_y],
                        "agg": "sum", "sort": "value_desc", "top": 15, "format": fmt_main, "size": "M"})
    # ---- AI Insights: every finding on the dashboard, as tiles
    widgets.append({"type": "insights", "page": "p_ai", "title": "AI Insights", "size": "XL", "scope": "all", "rows": 7})
    # ---- Reports: summary tables (they follow the period and filters) and the latest records
    rep_y = [a for a, *_ in meas] or ["records"]
    if site:
        widgets.append({"type": "table", "page": "p_rep", "dataset": "dsl", "title": f"{words['entity']} report", "groupBy": site, "y": rep_y[:5], "agg": "sum",
                        "formats": {a: fmt_of.get(a, "integer") for a in rep_y[:5]}, "size": "XL", "rows": 6})
    if category:
        widgets.append({"type": "table", "page": "p_rep", "dataset": "dsc", "title": f"{title(category)} report", "groupBy": category, "y": [main_y, "records"],
                        "agg": "sum", "formats": {main_y: fmt_main, "records": "integer"}, "size": "M", "rows": 5})
    if segment:
        widgets.append({"type": "table", "page": "p_rep", "dataset": "dss", "title": f"{title(segment)} report", "groupBy": segment, "y": [main_y, "records"],
                        "agg": "sum", "formats": {main_y: fmt_main, "records": "integer"}, "size": "M", "rows": 5})
    shown = [c for c in cols if c["kind"] != "id" or c["name"] in (site, m.get("orders"))][:12] or cols[:12]
    order = f"\nORDER BY {X(date)} DESC" if date else ""
    sel_d = ", ".join(f"{c['expr']} AS `{c['name']}`" for c in shown)
    datasets.append({"id": "dsd", "name": f"{nice_t} · latest records", "timeColumn": date,
                     "sql": f"SELECT {sel_d}\nFROM {src}{where()}{order}\nLIMIT 1000",
                     "purpose": "The latest 1,000 records, filtered like the rest of the dashboard."})
    widgets.append({"type": "table", "page": "p_rep", "dataset": "dsd", "title": "Latest records", "columns": [c["name"] for c in shown], "size": "XL", "rows": 6})
    # ---- linked dashboard filters (a click on the globe, a list or the donut sets them)
    home = {"zone": "dsl", "site": "dsl", "category": "dsc", "segment": "dss"}
    for role, (p, _, n) in params.items():
        label = words["entity"] if role == "site" and n not in geo else title(n)
        filters.append({"label": label, "type": "select", "dataset": home[role], "column": n, "param": p, "link": True})

    name = f"{nice_t} Overview"
    mt = re.match(r"\s*(?:create|build|make|design)?\s*(?:an?\s+)?([A-Za-z][\w &-]{2,40}?)\s+(?:overview|dashboard)\b", prompt or "", re.I)
    if mt and mt.group(1).lower() not in ("a", "an", "the", "my", "new", "full", "complete", "overview", "business"):
        name = mt.group(1).strip().title() + " Overview"
    return {"name": name, "description": (prompt or "")[:200] or f"Overview of {fact['table']}",
            "pages": [{"id": "p1", "name": "Overview"}, {"id": "p_an", "name": "Analytics"}, {"id": "p_ai", "name": "AI Insights"}, {"id": "p_rep", "name": "Reports"}],
            "datasets": datasets, "filters": filters, "widgets": widgets,
            "period": {"preset": {"day": "last_30_days", "week": "last_90_days", "month": "last_12_months"}[data_grain] if day else "all", "compare": True},
            "style": {"look": "vivid", "kpiStyle": "icon", "fitScreen": False, "kpiLayout": "row", "motion": "subtle", "dim": "2d"}}
