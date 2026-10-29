"""Live Overview boards: the DataBridge AI Overview page (KPI cards, 3D globe with buildings, performance trend,
top list, distribution, categories, insights, events) drawn from your own tables instead of demo data.

A board is a dashboard whose definition is {"kind": "overview", "board": {...}}. The board names one fact table
(optionally joined to lookup tables) and which column plays which role (date, location, city, measure, orders,
customers, category ...). /api/dashboards/{id}/board-data returns compact daily aggregates per location (and per
category / segment); the browser computes every card for any date range and region, so filters are instant.
Queries run through the dashboard engine (DuckDB on the warehouse files, Spark otherwise) with governance applied."""
import asyncio
import hashlib
import json
import math
import re
import time
import unicodedata
from datetime import date, timedelta
from pathlib import Path

from fastapi import HTTPException

from . import dash_ai, dashboards, fastsql
from .kernels import SqlError, run_sql

KERNEL = "__dashboards__"
MAX_DAYS = 800               # enough for "last 12 months" vs the 12 months before
MIN_DAYS = 92
MAX_CELLS = 240_000          # rows in the most detailed query (locations x days x categories)
MAX_ENTITIES = 300
TTL = 300
CACHE: dict = {}
ROLES = ("date", "site", "city", "state", "country", "lat", "lon", "measure", "orders", "customers", "rate", "category", "segment")
HUES = ["green", "blue", "violet", "orange", "rose", "teal", "amber", "sky"]

SITE = re.compile(r"(^|_)(outlet|store|site|branch|shop|restaurant|cafe|kitchen|warehouse|plant|factory|hotel|property|clinic|hospital|"
                  r"pharmacy|school|college|campus|location|facility|unit|centre|center|office|depot|showroom|franchise)s?(_?(id|code|no|key|name))?$", re.I)
MONEY = re.compile(r"net_?sales|gross_?sales|sales|revenue|amount|gmv|turnover|income|billing|value|total|spend|payment|collection|price", re.I)
ORDERS_NUM = re.compile(r"orders?|transactions?|txns?|tickets?|bills?|invoices?|receipts?|checks?|visits?|bookings?|appointments?|admissions?|shipments?", re.I)
UNITS_NUM = re.compile(r"quantity|qty|units|items|cases|volume|pieces|pcs", re.I)
ORDER_ID = re.compile(r"(^|_)(order|transaction|txn|ticket|bill|invoice|receipt|check|booking|appointment|admission|visit|shipment)_?(id|no|number|key|code)?$", re.I)
PEOPLE_NUM = re.compile(r"customers?|guests?|visitors?|footfall|covers|patients?|students?|users?|members?|clients?|passengers?|shoppers?|headcount|pax", re.I)
PEOPLE_ID = re.compile(r"(^|_)(customer|guest|visitor|patient|student|user|member|client|account|passenger|shopper)_?(id|no|number|key|code|phone|mobile|email)?$", re.I)
AVG_LIKE = re.compile(r"score|rating|csat|nps|satisf|minute|duration|time|days?$|age$|rate|ratio|pct|percent|price|temp|avg|mean|speed|latency|sla|"
                      r"occupancy|margin|share|yield|utili[sz]ation", re.I)
RATE_RE = re.compile(r"pct|percent|rate|ratio|margin|occupancy|utili[sz]ation|conversion|yield|attendance|oee|fill", re.I)
CATEGORY_RE = re.compile(r"categor|department|dept|family|(^|_)class$|cuisine|product_?type|item_?type|menu|brand|(^|_)line$|genre|special[i]?ty|"
                         r"service|course|subject|product_?group|item_?group|product$|item$", re.I)
SEGMENT_RE = re.compile(r"segment|tier|loyalty|member|customer_?type|cust_?type|channel|order_?type|service_?type|(^|_)mode$|(^|_)source$|platform|"
                        r"payment|gender|age_?group|(^|_)plan$|(^|_)type$|cohort|fulfil", re.I)
DATE_PREF = re.compile(r"business_?date|order_?date|txn_?date|transaction_?date|sale_?date|invoice_?date|bill_?date|^date$|^day$|^dt$|created|_date$|_at$|_ts$", re.I)
CITY_ALIAS = {
    "gurugram": "gurgaon", "chhatrapati sambhajinagar": "aurangabad", "sambhajinagar": "aurangabad", "dharashiv": "osmanabad", "mysuru": "mysore",
    "mangaluru": "mangalore", "belagavi": "belgaum", "kalaburagi": "gulbarga", "thiruvananthapuram": "trivandrum", "kochi": "cochin",
    "puducherry": "pondicherry", "prayagraj": "allahabad", "vadodara": "baroda", "kozhikode": "calicut", "new york city": "new york", "nyc": "new york",
    "la": "los angeles", "sf": "san francisco", "bengaluru": "bangalore", "kolkata": "calcutta", "chennai": "madras", "mumbai": "bombay",
    "pune": "poona", "varanasi": "benares", "new delhi": "delhi",
}
BUILDINGS = [("hospital", r"hospital|clinic|pharma|health|patient|medical|lab"), ("bank", r"bank|branch|atm|finance|loan|account"),
             ("factory", r"plant|factory|warehouse|mill|depot|manufactur|production|line"), ("campus", r"school|college|campus|universit|student|course"),
             ("store", r"store|outlet|shop|restaurant|cafe|kitchen|retail|mart|showroom|franchise|sales|order")]


# ------------------------------------------------------------------ small helpers
def _norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]+", " ", s)).strip()


def _slug(s):
    return re.sub(r"[^a-z0-9]+", "-", _norm(s)).strip("-")[:48] or "x"


def _lit(v):
    return "'" + str(v).replace("\\", "\\\\").replace("'", "''") + "'"


def _num(v):
    try:
        f = float(v)
        return f if math.isfinite(f) else None
    except (TypeError, ValueError):
        return None


def _r(v):
    """compact numbers for the browser: whole units for big values, cents for small ones"""
    v = _num(v) or 0.0
    return int(round(v)) if abs(v) >= 100 else round(v, 2)


def _title(s):
    words = dash_ai._nice(s).split(" ")
    return " ".join(w if w.isupper() or w in ("%",) else w[:1].upper() + w[1:] for w in words)


def _plural(w):
    if re.search(r"(s|x|z|ch|sh)$", w, re.I):
        return w + "es"
    if re.search(r"[^aeiou]y$", w, re.I):
        return w[:-1] + "ies"
    return w + "s"


def _singular(w):
    if re.search(r"ies$", w, re.I):
        return w[:-3] + "y"
    if re.search(r"(ch|sh|x|ss)es$", w, re.I):
        return w[:-2]
    if re.search(r"[^su]s$", w, re.I):
        return w[:-1]
    return w


def _stem(col):
    """outlet_name -> Outlet; store_id -> Store; branches -> Branch"""
    s = re.sub(r"(_?(id|code|no|key|name|number))$", "", col or "", flags=re.I) or col or "location"
    return _title(_singular(s.split("_")[-1] or s))


def _one(label):
    """'Customer Visits' / 'Customers' / 'Orders' -> 'Customer' / 'Customer' / 'Order' (for 'X Distribution')"""
    words = re.sub(r"\s+Visits$", "", label or "").split(" ")
    return " ".join(words[:-1] + [_singular(words[-1])]) if words and words[-1] else "Record"


# ------------------------------------------------------------------ geography (bundled, offline)
_GEO: dict = {}


def _centroid(geom):
    polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
    best, area = None, -1.0
    for poly in polys:
        ring = poly[0]
        a = abs(sum(ring[i][0] * ring[i - 1][1] - ring[i - 1][0] * ring[i][1] for i in range(len(ring)))) / 2
        if a > area:
            area, best = a, ring
    if not best:
        return 0.0, 0.0
    return sum(p[0] for p in best) / len(best), sum(p[1] for p in best) / len(best)


def _geo():
    if _GEO:
        return _GEO
    base = Path(__file__).resolve().parent.parent / "frontend" / "vendor" / "maps"
    places, countries = {}, {}
    try:
        for r in json.loads((base / "places.json").read_text(encoding="utf-8")):
            for n in [r[0], *((r[6] or []) if len(r) > 6 else [])]:
                places.setdefault(_norm(n), []).append(r)
    except (OSError, ValueError):
        pass
    try:
        for f in json.loads((base / "world.json").read_text(encoding="utf-8"))["features"]:
            p = f["properties"]
            lon, lat = _centroid(f["geometry"])
            rec = {"iso2": p.get("iso2") or "", "name": p.get("name") or "", "cont": p.get("cont") or "", "lat": lat, "lon": lon}
            for k in [p.get("name"), p.get("iso2"), p.get("iso3"), *(p.get("alt") or [])]:
                if k:
                    countries.setdefault(_norm(k), rec)
    except (OSError, ValueError, KeyError):
        pass
    for a, b in (("usa", "us"), ("uk", "gb"), ("uae", "ae"), ("america", "us"), ("england", "gb"), ("bharat", "in")):
        if b in countries:
            countries.setdefault(a, countries[b])
    _GEO.update(places=places, countries=countries, by_iso={v["iso2"]: v for v in countries.values() if v["iso2"]})
    return _GEO


def _country(v):
    return _geo()["countries"].get(_norm(v)) if v not in (None, "") else None


def _place(city, state=None, iso2=None):
    g = _geo()["places"]
    k = _norm(city)
    rows = g.get(k) or g.get(CITY_ALIAS.get(k, "")) or g.get(re.sub(r"\b(city|nagar|district|town)\b", "", k).strip())
    if not rows:
        return None
    h = _norm(state)
    if h:
        m = [r for r in rows if _norm(r[2]) == h]
        rows = m or rows
    if iso2:
        m = [r for r in rows if r[1] == iso2]
        rows = m or rows
    return rows[0]                                          # sorted by population


# ------------------------------------------------------------------ detection
def _roles(cols):
    """Pick a column for every role from the column profiles (name patterns + kinds)."""
    pick = lambda pred: next((c for c in cols if pred(c)), None)  # noqa: E731
    m = {r: None for r in ROLES}
    dates = [c for c in cols if c["kind"] == "date"]
    m["date"] = (sorted(dates, key=lambda c: 0 if DATE_PREF.search(c["name"]) else 1) or [None])[0]
    place = ("cat", "text")
    m["country"] = pick(lambda c: dash_ai.GEO_COUNTRY.search(c["name"]) and c["kind"] in place)
    m["state"] = pick(lambda c: dash_ai.GEO_STATE.search(c["name"]) and c["kind"] in place)
    m["city"] = pick(lambda c: dash_ai.GEO_CITY.search(c["name"]) and c["kind"] in place)
    m["lat"] = pick(lambda c: dash_ai.GEO_LAT.match(c["name"]) and c["kind"] in ("num", "id"))
    m["lon"] = pick(lambda c: dash_ai.GEO_LON.match(c["name"]) and c["kind"] in ("num", "id"))
    sites = [c for c in cols if SITE.search(c["name"]) and 1 <= (c.get("distinct") or 0) <= 1000
             and (c["kind"] in ("cat", "text") or (c["kind"] == "id" and re.search(r"(^|_)(id|code|no|key|number|name)$", c["name"], re.I)))]
    sites.sort(key=lambda c: (0 if re.search(r"name$", c["name"], re.I) else 1 if c["kind"] in place else 2, -(c.get("distinct") or 0)))
    m["site"] = sites[0] if sites else (m["city"] or m["state"] or m["country"])
    nums = [c for c in cols if c["kind"] == "num"]
    add = [c for c in nums if not AVG_LIKE.search(c["name"])]
    money = [c for c in add if MONEY.search(c["name"])]
    m["measure"] = (money or add or [None])[0]
    rest = [c for c in add if c is not m["measure"]]
    # orders: a count measure (orders, bills…), else distinct order ids, else units sold
    m["orders"] = next((c for c in rest if ORDERS_NUM.search(c["name"]) and not PEOPLE_NUM.search(c["name"])), None)
    m["orders_mode"] = "sum" if m["orders"] else None
    if not m["orders"]:
        oid = pick(lambda c: c["kind"] in ("id", "text", "cat") and ORDER_ID.search(c["name"]) and c is not m["site"])
        if oid:
            m["orders"], m["orders_mode"] = oid, "countd"
    if not m["orders"]:
        m["orders"] = next((c for c in rest if UNITS_NUM.search(c["name"])), None)
        m["orders_mode"] = "sum" if m["orders"] else None
    m["customers"] = next((c for c in rest if PEOPLE_NUM.search(c["name"]) and c is not m["orders"]), None)
    m["customers_mode"] = "sum" if m["customers"] else None
    if not m["customers"]:
        pid = pick(lambda c: c["kind"] in ("id", "text", "cat") and PEOPLE_ID.search(c["name"]) and c is not m["site"])
        if pid:
            m["customers"], m["customers_mode"] = pid, "countd"
    if not m["orders"] and len(rest) > 1:                 # a second measure is still better than nothing
        m["orders"], m["orders_mode"] = next(c for c in rest if c is not m["customers"]), "sum"
    rate = next((c for c in nums if RATE_RE.search(c["name"]) and (_num(c.get("max")) or 0) <= 100 and (_num(c.get("min")) or 0) >= 0), None)
    m["rate"] = rate
    m["rate_scale"] = 0.01 if rate and (_num(rate.get("max")) or 0) > 1.0 else 1.0
    taken = {id(v) for k, v in m.items() if isinstance(v, dict)}
    geo_name = lambda c: any(rx.search(c["name"]) for rx in (dash_ai.GEO_COUNTRY, dash_ai.GEO_STATE, dash_ai.GEO_CITY))  # noqa: E731
    cats = [c for c in cols if c["kind"] == "cat" and 2 <= (c.get("distinct") or 0) <= 60 and id(c) not in taken and not geo_name(c)
            and not dash_ai.TIME_PART.search(c["name"])]
    m["category"] = next((c for c in cats if CATEGORY_RE.search(c["name"])), None)
    m["segment"] = next((c for c in cats if c is not m["category"] and SEGMENT_RE.search(c["name"]) and c["distinct"] <= 12), None)
    if not m["segment"]:
        m["segment"] = next((c for c in cats if c is not m["category"] and 2 <= c["distinct"] <= 8), None)
    if not m["category"]:
        m["category"] = next((c for c in cats if c is not m["segment"] and 3 <= c["distinct"] <= 30), None)
    return {k: (v["name"] if isinstance(v, dict) else v) for k, v in m.items()}


def labels_for(b):
    """Words shown on the board, from the column names (all can be overridden in the board's settings)."""
    m = b["map"]
    site = m.get("site")
    one = _stem(site) if site else "Location"
    if site and site in (m.get("city"), m.get("state"), m.get("country")):
        one = {m.get("city"): "City", m.get("state"): "State", m.get("country"): "Country"}[site]
    many = _plural(one)
    hay = f"{site or ''} {b['table']}".lower()
    building = next((k for k, rx in BUILDINGS if re.search(rx, hay)), "office")
    meas = m.get("measure")
    primary = _title(meas) if meas else "Records"
    money = bool(meas and MONEY.search(meas))
    o, om = m.get("orders"), m.get("orders_mode")
    secondary = _title(o) if om == "sum" else _plural(_stem(o)) if om == "countd" else None
    q, qm = m.get("customers"), m.get("customers_mode")
    people = _title(q) if qm == "sum" else f"{_stem(q)} Visits" if qm == "countd" else None
    rate = _title(m["rate"]) if m.get("rate") else None
    seg_series = "people" if people else "secondary" if secondary else "primary"
    seg_noun = {"people": people, "secondary": secondary, "primary": primary}[seg_series] or "Records"
    seg_title = f"{primary} Distribution" if seg_series == "primary" else f"{_one(seg_noun)} Distribution"
    return {
        "entity": one, "entities": many, "building": building,
        "primary": primary, "primaryFormat": "currency" if money else "count",
        "secondary": secondary, "people": people, "peopleDaily": qm == "countd", "rate": rate,
        "category": _title(m["category"]) if m.get("category") else None,
        "categoryTitle": f"{primary} by {_title(m['category'])}" if m.get("category") else None,
        "segment": _title(m["segment"]) if m.get("segment") else None, "segmentSeries": seg_series, "segmentTitle": seg_title,
        "segmentNoun": seg_noun.lower(),
    }


async def detect(prompt, tables, schema):
    """Profile the chosen tables and propose a board (nothing saved)."""
    warnings = []
    profiles = await dash_ai._profiles_for(prompt or "", tables or [], schema, warnings)
    rels = dash_ai.relationships(profiles)
    by = {p["table"]: p for p in profiles}
    facts = [p for p in profiles if any(c["kind"] == "date" for c in p["columns"]) and any(c["kind"] == "num" for c in p["columns"])]
    fact = max(facts or profiles, key=lambda p: p["rows"])
    cols = [dict(c, expr=f"f.`{c['name']}`", src=fact["table"]) for c in fact["columns"]]
    used = {c["name"].lower() for c in cols}
    joins = []
    for k, r in enumerate([r for r in rels if r["from"] == fact["table"]][:3]):
        d, alias = by[r["to"]], f"j{k}"
        joins.append({"table": d["table"], "alias": alias, "on": r["on"]})
        for c in d["columns"]:
            if c["name"].lower() == r["on"][1].lower():
                continue
            name = c["name"] if c["name"].lower() not in used else f"{d['table'].split('.')[-1].rstrip('s')}_{c['name']}"
            used.add(name.lower())
            cols.append(dict(c, name=name, expr=f"{alias}.`{c['name']}`", src=d["table"]))
    keep = ("name", "type", "kind", "distinct", "min", "max", "expr", "src")
    board = {"table": fact["table"], "joins": joins, "columns": [{k: c.get(k) for k in keep} for c in cols], "map": _roles(cols)}
    if not board["map"].get("date"):
        raise HTTPException(400, f"{fact['table']} has no date column, which the Overview needs for trends and comparisons. Pick a table with a date.")
    if len(profiles) > 1:
        warnings.append(f"Built from {fact['table']}" + (f" joined to {', '.join(j['table'] for j in joins)}" if joins else "") + ".")
    board["labels"] = labels_for(board)
    return board, warnings


async def create(prompt, tables, schema, name, owner):
    board, warnings = await detect(prompt, tables, schema)
    title = (name or "").strip() or f"{_title(board['table'].split('.')[-1])} Overview"
    d = dashboards.create_dashboard({"name": title[:80], "description": (prompt or "")[:300] or f"Live Overview of {board['table']}",
                                     "definition": {"kind": "overview", "board": board, "look": "vivid", "widgets": [], "datasets": []}}, owner)
    try:
        payload = await data(d["id"])
        warnings += payload.get("warnings") or []
    except HTTPException as e:
        dashboards.delete_dashboard(d["id"])
        raise HTTPException(e.status_code, f"The board could not read its data: {e.detail}")
    return {"id": d["id"], "name": d["name"], "url": f"/static/overview/index.html?board={d['id']}#/", "warnings": warnings, "map": board["map"],
            "labels": board["labels"], "table": board["table"]}


def board_of(did):
    d = dashboards.get_dashboard(did)
    defn = d.get("definition") or {}
    if defn.get("kind") != "overview" or not isinstance(defn.get("board"), dict):
        raise HTTPException(400, "This dashboard is not a live Overview board")
    return d, defn["board"]


def update(did, body):
    """Change which column plays which role (and the words), from the board's settings."""
    d, b = board_of(did)
    names = {c["name"] for c in b["columns"]}
    new_map = dict(b["map"])
    for k, v in (body.get("map") or {}).items():
        if k in ROLES:
            if v not in (None, "") and v not in names:
                raise HTTPException(400, f"Unknown column for {k}: {v}")
            new_map[k] = v or None
        elif k in ("orders_mode", "customers_mode") and v in ("sum", "countd", None):
            new_map[k] = v
        elif k == "rate_scale" and v in (1, 1.0, 0.01):
            new_map[k] = float(v)
    if not new_map.get("date"):
        raise HTTPException(400, "Pick the date column")
    kinds = {c["name"]: c["kind"] for c in b["columns"]}
    for k in ("orders", "customers"):                      # a measure is added up; anything else is counted
        if new_map.get(k) and (body.get("map") or {}).get(k):
            new_map[f"{k}_mode"] = "sum" if kinds.get(new_map[k]) == "num" else "countd"
        if not new_map.get(k):
            new_map[f"{k}_mode"] = None
    if new_map.get("rate") and new_map.get("rate") != b["map"].get("rate"):
        rc = next((c for c in b["columns"] if c["name"] == new_map["rate"]), {})
        new_map["rate_scale"] = 0.01 if (_num(rc.get("max")) or 0) > 1.0 else 1.0
    b = {**b, "map": new_map}
    auto = labels_for(b)
    words = {k: str(v)[:60] for k, v in (body.get("labels") or {}).items() if k in ("entity", "entities", "primary", "secondary", "people", "rate", "categoryTitle",
                                                                                    "segmentTitle") and v and str(v) != str(auto.get(k))}
    b["words"] = words
    b["labels"] = {**auto, **words}
    defn = {**d["definition"], "board": b}
    out = dashboards.save_dashboard(did, {"name": (body.get("name") or d["name"])[:80], "definition": defn})
    for k in [k for k in CACHE if k.startswith(did + ":")]:
        CACHE.pop(k, None)
    return {"id": out["id"], "name": out["name"], "map": new_map, "labels": b["labels"]}


# ------------------------------------------------------------------ data
async def _q(sql, limit):
    try:
        return await fastsql.query(sql, limit, lambda: asyncio.wait_for(run_sql(sql, limit, key=KERNEL, label="Dashboards"), 600))
    except SqlError as e:
        raise HTTPException(400, f"{e.ename}: {str(e.evalue)[:400]}")
    except asyncio.TimeoutError:
        raise HTTPException(504, "The board query took longer than 10 minutes")


def _exprs(b):
    cols = {c["name"]: c for c in b["columns"]}
    m = b["map"]

    def x(role):
        n = m.get(role)
        return cols[n]["expr"] if n and n in cols else None

    out = {r: x(r) for r in ROLES}
    dcol = cols.get(m.get("date")) or {}
    d = out["date"]
    if d:
        typ = str(dcol.get("type") or "").lower()
        out["day"] = f"CAST({d} AS DATE)" if typ.startswith(("date", "timestamp")) else f"CAST(SUBSTR(CAST({d} AS STRING), 1, 10) AS DATE)"
    src = f"{b['table']} f" + "".join(f" LEFT JOIN {j['table']} {j['alias']} ON f.`{j['on'][0]}` = {j['alias']}.`{j['on'][1]}`" for j in b.get("joins") or [])
    out["src"] = src
    return out


def _measure(expr, mode):
    if not expr:
        return None
    return f"COUNT(DISTINCT {expr})" if mode == "countd" else f"SUM(CAST({expr} AS DOUBLE))"


async def data(did, refresh=False):
    d, b = board_of(did)
    key = f"{did}:{hashlib.sha1(json.dumps(b, sort_keys=True, default=str).encode()).hexdigest()[:16]}"
    hit = CACHE.get(key)
    if hit and not refresh and time.time() - hit[0] < TTL:
        return {**hit[1], "cached": True}
    t0 = time.time()
    X, m, L = _exprs(b), b["map"], {**labels_for(b), **(b.get("words") or {})}
    if not X.get("day"):
        raise HTTPException(400, "The board has no date column")
    day, src = X["day"], X["src"]
    site = f"COALESCE(CAST({X['site']} AS STRING), '(blank)')" if X.get("site") else "'All'"
    warnings = []
    engine = "duckdb"

    # 1. date range and number of locations
    res = await _q(f"SELECT CAST(MIN({day}) AS STRING) AS lo, CAST(MAX({day}) AS STRING) AS hi, COUNT(DISTINCT {site}) AS n FROM {src} WHERE {day} IS NOT NULL", 1)
    engine = res.get("engine", engine)
    lo, hi, n_ent = (res["rows"][0] if res["rows"] else [None, None, 0])
    if not lo or not hi:
        raise HTTPException(400, f"{b['table']} has no rows with a date")
    lo_d, hi_d = date.fromisoformat(str(lo)[:10]), date.fromisoformat(str(hi)[:10])
    n_ent = int(n_ent or 0)

    # 2. locations (top MAX_ENTITIES by the main measure; the rest become one "Other" location)
    p_expr = _measure(X.get("measure"), "sum") or "COUNT(*)"
    geo_sel = ", ".join(f"MAX(CAST({X[r]} AS STRING)) AS {r}" if X.get(r) else f"CAST(NULL AS STRING) AS {r}" for r in ("city", "state", "country"))
    ll_sel = ", ".join(f"AVG(CAST({X[r]} AS DOUBLE)) AS {r}" if X.get(r) else f"CAST(NULL AS DOUBLE) AS {r}" for r in ("lat", "lon"))
    ent = await _q(f"SELECT {site} AS e, {geo_sel}, {ll_sel}, {p_expr} AS v FROM {src} WHERE {day} IS NOT NULL GROUP BY 1 ORDER BY v DESC LIMIT {MAX_ENTITIES}",
                   MAX_ENTITIES)
    rows = ent["rows"]
    names = [str(r[0]) for r in rows]
    other = n_ent > len(names)
    site_k = site
    if other:
        site_k = f"CASE WHEN {site} IN ({', '.join(_lit(x) for x in names)}) THEN {site} ELSE '__other__' END"
        warnings.append(f"{n_ent - len(names)} smaller {L['entities'].lower()} are combined into “Other {L['entities'].lower()}”.")

    # categories / segments to keep (top 7 + other)
    async def tops(col_expr, measure, n=7):
        r = await _q(f"SELECT CAST({col_expr} AS STRING) AS c, {measure} AS v FROM {src} WHERE {day} IS NOT NULL AND {col_expr} IS NOT NULL "
                     f"GROUP BY 1 ORDER BY v DESC LIMIT {n + 1}", n + 1)
        vals = [str(x[0]) for x in r["rows"] if x[0] is not None]
        return vals[:n], len(vals) > n

    seg_measure = {"people": _measure(X.get("customers"), m.get("customers_mode")), "secondary": _measure(X.get("orders"), m.get("orders_mode")),
                   "primary": p_expr}[L.get("segmentSeries") or "primary"] or p_expr
    cat_keep, cat_more = (await tops(X["category"], p_expr)) if X.get("category") else ([], False)
    seg_keep, seg_more = (await tops(X["segment"], seg_measure, 6)) if X.get("segment") else ([], False)

    # 3. how many days fit
    n_e = len(names) + (1 if other else 0)
    span = (hi_d - lo_d).days + 1
    days = min(span, MAX_DAYS, MAX_CELLS // max(1, n_e))
    if cat_keep:
        days = min(days, MAX_CELLS // max(1, n_e * (len(cat_keep) + (1 if cat_more else 0))))
    if seg_keep:
        days = min(days, MAX_CELLS // max(1, n_e * (len(seg_keep) + (1 if seg_more else 0))))
    days = max(min(span, MIN_DAYS), days)
    start = hi_d - timedelta(days=days - 1)
    if days < span:
        warnings.append(f"Showing the last {days} days of {span} so the board stays fast.")
    where = f"{day} >= DATE '{start.isoformat()}' AND {day} <= DATE '{hi_d.isoformat()}'"

    # 4. daily values per location
    sel = [f"CAST({day} AS STRING) AS d", f"{site_k} AS e", f"{p_expr} AS p"]
    s_expr = _measure(X.get("orders"), m.get("orders_mode"))
    q_expr = _measure(X.get("customers"), m.get("customers_mode"))
    r_expr = f"AVG(CAST({X['rate']} AS DOUBLE))" if X.get("rate") else None
    sel += [f"{s_expr} AS s" if s_expr else "CAST(NULL AS DOUBLE) AS s", f"{q_expr} AS q" if q_expr else "CAST(NULL AS DOUBLE) AS q",
            f"{r_expr} AS r" if r_expr else "CAST(NULL AS DOUBLE) AS r"]
    daily = await _q(f"SELECT {', '.join(sel)} FROM {src} WHERE {where} GROUP BY 1, 2", MAX_CELLS + 10)

    idx = {nm: i for i, nm in enumerate(names)}
    if other:
        idx["__other__"] = len(names)
    rscale = float(m.get("rate_scale") or 1.0)

    def dnum(v):
        try:
            return (date.fromisoformat(str(v)[:10]) - start).days
        except ValueError:
            return None

    cols = {k: [] for k in ("d", "e", "p", "s", "q", "r")}
    for r in daily["rows"]:
        di, ei = dnum(r[0]), idx.get(str(r[1]))
        if di is None or ei is None or di < 0 or di >= days:
            continue
        cols["d"].append(di)
        cols["e"].append(ei)
        cols["p"].append(_r(r[2]))
        cols["s"].append(_r(r[3]))
        cols["q"].append(_r(r[4]))
        rv = _num(r[5])
        cols["r"].append(None if rv is None else round(rv * rscale, 5))
    seen = sorted(set(cols["d"]))
    when = [start + timedelta(days=x) for x in seen]
    grain = "day"
    if len(when) >= 3 and all(w.day == 1 for w in when):
        grain = "month"
    elif len(when) >= 3 and len({w.weekday() for w in when}) == 1:
        grain = "week"
    if not s_expr:
        cols["s"] = None
    if not q_expr:
        cols["q"] = None
    if not r_expr:
        cols["r"] = None

    # 5. categories and segments per day and location
    async def split(col_expr, keep, more, measure):
        if not keep:
            return None
        c_k = f"CASE WHEN CAST({col_expr} AS STRING) IN ({', '.join(_lit(x) for x in keep)}) THEN CAST({col_expr} AS STRING) ELSE '__other__' END"
        res2 = await _q(f"SELECT CAST({day} AS STRING) AS d, {site_k} AS e, {c_k} AS c, {measure} AS v FROM {src} WHERE {where} AND {col_expr} IS NOT NULL "
                        f"GROUP BY 1, 2, 3", MAX_CELLS + 10)
        labels = keep + (["Other"] if more else [])
        ci = {v: i for i, v in enumerate(keep)}
        if more:
            ci["__other__"] = len(keep)
        out = {"labels": labels, "d": [], "e": [], "c": [], "v": []}
        for r in res2["rows"]:
            di, ei, cc = dnum(r[0]), idx.get(str(r[1])), ci.get(str(r[2]))
            if di is None or ei is None or cc is None or di < 0 or di >= days:
                continue
            out["d"].append(di)
            out["e"].append(ei)
            out["c"].append(cc)
            out["v"].append(_r(r[3]))
        return out

    categories = await split(X["category"], cat_keep, cat_more, p_expr) if X.get("category") else None
    segments = await split(X["segment"], seg_keep, seg_more, seg_measure) if X.get("segment") else None

    # 6. where the locations are
    entities = []
    for r in rows:
        city, state, country = (str(v) if v not in (None, "") else None for v in r[1:4])
        lat, lon = _num(r[4]), _num(r[5])
        c = _country(country) if country else None
        iso2 = c["iso2"] if c else None
        if lat is None or lon is None or not (-90 <= lat <= 90 and -180 <= lon <= 180) or (lat == 0 and lon == 0):
            lat = lon = None
            if city or (not X.get("city") and X.get("site")):
                p = _place(city or r[0], state, iso2)
                if p:
                    lat, lon = p[3], p[4]
                    iso2 = iso2 or p[1]
                    state = state or (p[2] if not X.get("state") else None)
            if lat is None and c and not city and not state:
                lat, lon = c["lat"], c["lon"]
        if not iso2 and city:
            p = _place(city, state)
            iso2 = p[1] if p else None
        info = _geo()["by_iso"].get(iso2) if iso2 else None
        entities.append({"name": str(r[0]), "city": city, "state": state, "country": iso2 or (country or ""), "countryName": (info or {}).get("name") or country or "",
                         "continent": (info or {}).get("cont") or "", "lat": lat, "lon": lon, "value": _num(r[6]) or 0.0})
    if other:
        entities.append({"name": f"Other {L['entities'].lower()}", "city": None, "state": None, "country": "", "countryName": "", "continent": "",
                         "lat": None, "lon": None, "value": 0.0, "other": True})
    geo = _zones(entities)
    for e in entities:
        e.pop("value", None)
        e.pop("continent", None)
    located = sum(1 for e in entities if e["lat"] is not None)
    if entities and located < len(entities) * 0.5:
        warnings.append(f"Only {located} of {len(entities)} {L['entities'].lower()} could be placed on the globe — map a city or latitude/longitude column in the board settings.")

    out = {"id": did, "name": d["name"], "description": d.get("description") or "", "updated": d.get("updated"), "board": {"table": b["table"], "map": m, "labels": L},
           "columns": [{"name": c["name"], "type": c.get("type"), "kind": c.get("kind")} for c in b["columns"]],
           "start": start.isoformat(), "end": hi_d.isoformat(), "days": days, "firstDay": lo_d.isoformat(), "grain": grain,
           "entities": entities, "geo": geo, "daily": cols, "categories": categories, "segments": segments,
           "warnings": warnings, "engine": engine, "elapsed": round(time.time() - t0, 2), "loadedAt": time.time()}
    if len(CACHE) > 60:
        for k in sorted(CACHE, key=lambda k: CACHE[k][0])[:20]:
            CACHE.pop(k, None)
    CACHE[key] = (time.time(), out)
    return {**out, "cached": False}


def _zones(entities):
    """Regions for the region list and filter: continents when the business spans countries, else states, else cities."""
    real = [e for e in entities if not e.get("other")]
    by_country = {}
    for e in real:
        if e["country"]:
            by_country[e["country"]] = by_country.get(e["country"], 0.0) + (e.get("value") or 0.0)
    total = sum(by_country.values()) or 1.0
    home = max(by_country, key=by_country.get) if by_country else None
    domestic = [e for e in real if not home or e["country"] in (home, "")]
    states = {e["state"] for e in domestic if e["state"]}
    cities = {e["city"] for e in domestic if e["city"]}
    local = (lambda e: e["state"] or "Other") if len(states) >= 2 else (lambda e: e["city"] or "Other") if len(cities) >= 2 else None
    if len(by_country) >= 2 and by_country[home] / total < 0.75:
        mode, key = "continent", (lambda e: e["continent"] or e["countryName"] or "Other")
    elif len(by_country) >= 2 and local:               # mostly one country: its states (or cities), plus one region per other country
        mode, key = "mixed", (lambda e: local(e) if e["country"] in (home, "") else (e["countryName"] or e["country"]))
    elif local:
        mode, key = ("state" if len(states) >= 2 else "city"), local
    else:
        mode, key = "none", (lambda e: e["countryName"] or e["city"] or "All")
    totals = {}
    for e in real:
        k = key(e)
        totals[k] = totals.get(k, 0.0) + (e.get("value") or 0.0)
    order = sorted(totals, key=lambda k: -totals[k])
    top = order if len(order) <= 6 else order[:5]
    zone_of = {}
    zones = []
    for i, k in enumerate(top):
        zid = _slug(k)
        zones.append({"id": zid, "label": k, "hue": HUES[i % len(HUES)]})
        zone_of[k] = zid
    other_label = {"continent": "Other regions", "state": "Other states", "city": "Other cities", "mixed": "Other regions"}.get(mode, "Other")
    if len(order) > len(top):
        zones.append({"id": "other", "label": other_label, "hue": "slate"})
    for e in entities:
        e["zone"] = zone_of.get(key(e), "other") if not e.get("other") else "other"
    if any(e["zone"] == "other" for e in entities) and not any(z["id"] == "other" for z in zones):
        zones.append({"id": "other", "label": "Other", "hue": "slate"})
    # callouts on the globe: countries when there are several, else the biggest zones
    hubs = []
    if mode == "continent":
        by = {}
        for e in real:
            if e["country"]:
                by.setdefault(e["country"], []).append(e)
        for iso, es in sorted(by.items(), key=lambda kv: -sum(x.get("value") or 0 for x in kv[1]))[:7]:
            pts = [x for x in es if x["lat"] is not None]
            info = _geo()["by_iso"].get(iso) or {}
            lat = sum(x["lat"] for x in pts) / len(pts) if pts else info.get("lat")
            lon = sum(x["lon"] for x in pts) / len(pts) if pts else info.get("lon")
            if lat is None:
                continue
            hubs.append({"id": f"c-{iso.lower()}", "label": es[0]["countryName"] or iso, "flag": iso, "countries": [iso], "lat": round(lat, 3), "lon": round(lon, 3)})
    elif mode in ("state", "city", "mixed"):
        for z in [z for z in zones if z["id"] != "other"][:6]:
            pts = [x for x in real if x["zone"] == z["id"] and x["lat"] is not None]
            if not pts:
                continue
            iso = next((x["country"] for x in pts if x["country"]), "")
            hubs.append({"id": f"z-{z['id']}", "label": z["label"], "flag": iso, "zones": [z["id"]], "countries": [], "lat": round(sum(x["lat"] for x in pts) / len(pts), 3),
                         "lon": round(sum(x["lon"] for x in pts) / len(pts), 3)})
    names = {}
    for e in real:
        if e["country"]:
            names.setdefault(e["country"], {"name": e["countryName"] or e["country"], "zone": e["zone"]})
    return {"mode": mode, "zones": zones, "hubs": hubs, "countries": names}
