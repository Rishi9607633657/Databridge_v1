"""Markets pack installer: Indian stocks (NSE), mutual funds (AMFI) and forex.

install() writes the notebooks into workspace/Markets, creates two jobs (nightly refresh, live quotes — paused) and five
dashboards. Running it again updates notebooks and jobs in place and leaves edited dashboards alone unless overwrite=True.
The analysis code lives in backend/markets_pack/market_lib.py, so app updates improve it without reinstalling."""
import json
from pathlib import Path

import nbformat
from fastapi import HTTPException

from . import dashboards
from .jobs import manager as job_manager, store
from .settings import DATA_ROOT, settings

PACK = Path(__file__).resolve().parent / "markets_pack"
STATE = DATA_ROOT / ".stratum" / "markets.json"
FOLDER = "Markets"
NOTEBOOKS = [("01_ingest_nse", "01 Ingest NSE"), ("02_ingest_funds", "02 Ingest mutual funds"), ("03_ingest_forex", "03 Ingest forex"),
             ("10_stock_analytics", "10 Stock analytics"), ("20_fund_analytics", "20 Fund analytics"),
             ("30_forex_analytics", "30 Forex analytics"), ("40_live_quotes", "40 Live quotes")]
DISCLAIMER = ("**Not investment advice.** Scores rank stocks and funds on past data so you can screen faster; they are not a "
              "recommendation to buy or sell. Past performance does not guarantee future returns. Data: NSE end-of-day files, "
              "AMFI NAVs, ECB reference rates.")


def _state():
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _save_state(s):
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(s, indent=1), encoding="utf-8")


def _notebook(src: str):
    """'# %%' separated Python source -> .ipynb ('# %% [md]' cells become markdown)."""
    nb = nbformat.v4.new_notebook()
    nb.metadata["kernelspec"] = {"name": settings.kernel_name, "display_name": "Python 3 (PySpark)", "language": "python"}
    nb.metadata["language_info"] = {"name": "python"}
    for chunk in src.split("# %%")[1:]:
        head, _, body = chunk.partition("\n")
        if head.strip() == "[md]":
            nb.cells.append(nbformat.v4.new_markdown_cell("\n".join(l[2:] if l.startswith("# ") else l.lstrip("#") for l in body.strip().splitlines())))
        else:
            nb.cells.append(nbformat.v4.new_code_cell(body.strip("\n")))
    return nb


def _nb_path(name):
    return f"{FOLDER}/{name}.ipynb"


def _write_notebooks():
    folder = settings.workspace / FOLDER
    folder.mkdir(parents=True, exist_ok=True)
    for key, name in NOTEBOOKS:
        nbformat.write(_notebook((PACK / "notebooks" / f"{key}.py").read_text(encoding="utf-8")), folder / f"{name}.ipynb")
    return [_nb_path(n) for _, n in NOTEBOOKS]


def _job_body(kind):
    nb = {k: _nb_path(n) for k, n in NOTEBOOKS}
    if kind == "nightly":
        r = {"max_retries": 2, "retry_delay_sec": 300}
        return {"name": "Markets — nightly refresh", "description": "NSE, AMFI and forex data, then stock, fund and forex analytics",
                "schedule": "40 23 * * 1-5", "timezone": "Asia/Kolkata",
                "tasks": [{"task_key": "ingest_nse", "notebook_path": nb["01_ingest_nse"], **r},
                          {"task_key": "ingest_funds", "notebook_path": nb["02_ingest_funds"], **r},
                          {"task_key": "ingest_forex", "notebook_path": nb["03_ingest_forex"], **r},
                          {"task_key": "stock_analytics", "notebook_path": nb["10_stock_analytics"], "depends_on": ["ingest_nse"]},
                          {"task_key": "fund_analytics", "notebook_path": nb["20_fund_analytics"], "depends_on": ["ingest_funds"]},
                          {"task_key": "forex_analytics", "notebook_path": nb["30_forex_analytics"], "depends_on": ["ingest_forex"]}]}
    return {"name": "Markets — live quotes", "description": "Broker quotes for your watchlist every 5 minutes in market hours (your own API key)",
            "schedule": "*/5 9-15 * * 1-5", "timezone": "Asia/Kolkata", "paused": True,
            "tasks": [{"task_key": "live_quotes", "notebook_path": nb["40_live_quotes"], "timeout_sec": 240}]}


def _upsert_job(kind, st):
    body = _job_body(kind)
    jid = (st.get("jobs") or {}).get(kind)
    if jid and store.one("SELECT id FROM jobs WHERE id=?", (jid,)):
        cur = job_manager.get_job(jid)
        body["paused"] = bool(cur.get("paused"))          # keep the user's on/off choice
        if cur.get("schedule"):
            body["schedule"], body["timezone"] = cur["schedule"], cur.get("timezone") or body["timezone"]
        return job_manager.update_job(jid, body)["id"]
    found = store.one("SELECT id FROM jobs WHERE name=?", (body["name"],))
    if found:
        return job_manager.update_job(found["id"], body)["id"]
    return job_manager.create_job(body)["id"]


# ------------------------------------------------------------------ dashboards
def _L(x, y, w, h):
    return {"x": x, "y": y, "w": w, "h": h}


def _ds(i, name, sql):
    return {"id": i, "name": name, "sql": sql, "timeColumn": "__none__"}


def _defn(datasets, widgets, filters=None, pages=None, look="clean"):
    for i, w in enumerate(widgets):
        w.setdefault("id", f"w{i:02d}")
        w.setdefault("page", "p1")
        if w["type"] == "kpi":
            w.setdefault("compare", "none")
    return {"datasets": datasets, "widgets": widgets, "filters": filters or [], "pages": pages or [{"id": "p1", "name": "Overview"}],
            "period": {"preset": "all", "compare": False, "column": "", "anchor": "data"}, "refreshMinutes": 0, "currency": "₹",
            "theme": "auto", "look": look, "kpiStyle": "tinted", "fitScreen": False, "kpiLayout": "row"}


def _note(y, w=12, x=0):
    return {"type": "text", "title": "About these numbers", "text": DISCLAIMER, "layout": _L(x, y, w, 1)}


SCORE_COLS = ["rank", "symbol", "company", "industry", "close", "ret_1m_pct", "ret_1y_pct", "rsi_14", "trend_score", "momentum_score",
              "low_risk_score", "score", "band"]
SCORE_SQL = ("SELECT rank, symbol, company, industry, round(close, 2) AS close, round(ret_1m * 100, 1) AS ret_1m_pct, "
             "round(ret_1y * 100, 1) AS ret_1y_pct, round(rsi_14, 0) AS rsi_14, trend_score, momentum_score, low_risk_score, "
             "liquidity_score, delivery_score, round(avg_value_cr, 1) AS avg_value_cr, round(volatility_1y * 100, 1) AS volatility_pct, "
             "round(max_drawdown_1y * 100, 1) AS max_fall_1y_pct, round(from_52w_high * 100, 1) AS from_52w_high_pct, score, band "
             "FROM market.stock_scores WHERE eligible")


def _dash_overview():
    ds = [_ds("idx", "Index levels (1 year)", "SELECT trade_date, index_name, close, sma50, sma200 FROM market.index_prices "
                 "WHERE index_name IN ('NIFTY 50', 'NIFTY BANK') AND days_back <= 365"),
          _ds("idxl", "Index latest", "SELECT index_name, close, change_pct, pe, pb FROM market.index_latest"),
          _ds("br", "Breadth (1 year)", "SELECT trade_date, advancing, declining, pct_above_200dma, days_back FROM market.breadth WHERE days_back <= 365"),
          _ds("sec", "Sector returns", "SELECT industry, stocks, ret_1m_pct, ret_1y_pct, avg_score FROM market.sector_returns"),
          _ds("top", "Highest scores", SCORE_SQL + " ORDER BY rank LIMIT 15"),
          _ds("fx", "Forex latest", "SELECT pair, rate, round(chg_1d * 100, 2) AS chg_1d_pct FROM market.fx_metrics")]
    w = [{"type": "kpi", "title": "NIFTY 50", "y": ["close"], "agg": "max", "format": "number", "dataset": "idxl",
          "where": [{"column": "index_name", "op": "eq", "value": "NIFTY 50"}], "layout": _L(0, 0, 3, 2)},
         {"type": "kpi", "title": "NIFTY BANK", "y": ["close"], "agg": "max", "format": "number", "dataset": "idxl",
          "where": [{"column": "index_name", "op": "eq", "value": "NIFTY BANK"}], "layout": _L(3, 0, 3, 2)},
         {"type": "kpi", "title": "Stocks above 200-day average (%)", "y": ["pct_above_200dma"], "agg": "max", "format": "number", "dataset": "br",
          "where": [{"column": "days_back", "op": "eq", "value": 0}], "layout": _L(6, 0, 3, 2)},
         {"type": "kpi", "title": "USD / INR", "y": ["rate"], "agg": "max", "format": "currency", "dataset": "fx",
          "where": [{"column": "pair", "op": "eq", "value": "USD/INR"}], "layout": _L(9, 0, 3, 2)},
         {"type": "line", "title": "NIFTY 50 with 50- and 200-day averages", "x": "trade_date", "y": ["close", "sma50", "sma200"], "agg": "max",
          "format": "compact", "dataset": "idx", "where": [{"column": "index_name", "op": "eq", "value": "NIFTY 50"}], "layout": _L(0, 2, 8, 4)},
         {"type": "hbar", "title": "Sector return, last month (median %)", "x": "industry", "y": ["ret_1m_pct"], "agg": "max", "format": "number",
          "sort": "value_desc", "dataset": "sec", "layout": _L(8, 2, 4, 4)},
         {"type": "table", "title": "Highest scores", "dataset": "top", "columns": SCORE_COLS, "y": [], "heat": True,
          "layout": _L(0, 6, 8, 5)},
         {"type": "bar", "title": "Advancing vs declining stocks", "x": "trade_date", "y": ["advancing", "declining"], "agg": "sum", "format": "integer",
          "dataset": "br", "where": [{"column": "days_back", "op": "lte", "value": 30}], "layout": _L(8, 6, 4, 5)},
         _note(11)]
    return _defn(ds, w)


def _dash_screener():
    ds = [_ds("s", "Stock scores", SCORE_SQL + " ORDER BY rank")]
    w = [{"type": "kpi", "title": "Stocks scored", "y": ["symbol"], "agg": "count", "format": "integer", "dataset": "s", "layout": _L(0, 0, 3, 2)},
         {"type": "kpi", "title": "Strong (75+)", "y": ["symbol"], "agg": "count", "format": "integer", "dataset": "s",
          "where": [{"column": "band", "op": "eq", "value": "Strong"}], "layout": _L(3, 0, 3, 2)},
         {"type": "kpi", "title": "Median 1-year return (%)", "y": ["ret_1y_pct"], "agg": "avg", "format": "number", "dataset": "s", "layout": _L(6, 0, 3, 2)},
         {"type": "kpi", "title": "Average score", "y": ["score"], "agg": "avg", "format": "integer", "dataset": "s", "layout": _L(9, 0, 3, 2)},
         {"type": "table", "title": "Screener — every stock, sorted by score", "dataset": "s", "y": [], "heat": True,
          "columns": ["rank", "symbol", "company", "industry", "close", "ret_1m_pct", "ret_1y_pct", "rsi_14", "trend_score", "momentum_score",
                      "low_risk_score", "liquidity_score", "delivery_score", "volatility_pct", "max_fall_1y_pct", "from_52w_high_pct", "avg_value_cr",
                      "score", "band"], "layout": _L(0, 2, 12, 7)},
         {"type": "bar", "title": "Stocks per band", "x": "band", "y": ["symbol"], "agg": "count", "format": "integer", "dataset": "s", "layout": _L(0, 9, 4, 4)},
         {"type": "hbar", "title": "Average score by industry", "x": "industry", "y": ["score"], "agg": "avg", "format": "integer", "sort": "value_desc",
          "top": 15, "dataset": "s", "layout": _L(4, 9, 8, 4)},
         _note(13)]
    f = [{"id": "f1", "label": "Industry", "type": "select", "dataset": "s", "column": "industry"},
         {"id": "f2", "label": "Band", "type": "select", "dataset": "s", "column": "band"}]
    return _defn(ds, w, f)


def _dash_deep():
    sym = "coalesce({{symbol}}, 'RELIANCE')"
    ds = [_ds("list", "Symbols", "SELECT symbol FROM market.stock_scores WHERE eligible"),
          _ds("px", "Price history (2 years)", f"SELECT trade_date, adj_close AS close, sma50, sma200, rsi_14, adj_volume AS volume, delivery_pct "
                 f"FROM market.stock_prices WHERE symbol = {sym} AND days_back <= 730"),
          _ds("one", "Scores for the stock", f"{SCORE_SQL} AND symbol = {sym}")]
    w = [{"type": "kpi", "title": "Score (0–100)", "y": ["score"], "agg": "max", "format": "integer", "dataset": "one", "layout": _L(0, 0, 2, 2)},
         {"type": "kpi", "title": "Close ₹", "y": ["close"], "agg": "max", "format": "integer", "dataset": "one", "layout": _L(2, 0, 2, 2)},
         {"type": "kpi", "title": "1-year return %", "y": ["ret_1y_pct"], "agg": "max", "format": "number", "dataset": "one", "layout": _L(4, 0, 2, 2)},
         {"type": "kpi", "title": "RSI (14)", "y": ["rsi_14"], "agg": "max", "format": "integer", "dataset": "one", "layout": _L(6, 0, 2, 2)},
         {"type": "kpi", "title": "Volatility %", "y": ["volatility_pct"], "agg": "max", "format": "number", "dataset": "one", "layout": _L(8, 0, 2, 2)},
         {"type": "kpi", "title": "From 52-week high %", "y": ["from_52w_high_pct"], "agg": "max", "format": "number", "dataset": "one", "layout": _L(10, 0, 2, 2)},
         {"type": "line", "title": "Price with 50- and 200-day averages (adjusted for splits and bonuses)", "x": "trade_date",
          "y": ["close", "sma50", "sma200"], "agg": "max", "format": "compact", "dataset": "px", "layout": _L(0, 2, 12, 5)},
         {"type": "line", "title": "RSI (14) — above 70 often means overbought, below 30 oversold", "x": "trade_date", "y": ["rsi_14"], "agg": "max",
          "format": "integer", "dataset": "px", "layout": _L(0, 7, 6, 4)},
         {"type": "bar", "title": "Volume", "x": "trade_date", "y": ["volume"], "agg": "max", "format": "compact", "dataset": "px", "grain": "week", "layout": _L(6, 7, 6, 4)},
         {"type": "table", "title": "Score breakdown", "dataset": "one", "y": [], "columns": ["symbol", "company", "industry", "trend_score",
          "momentum_score", "low_risk_score", "liquidity_score", "delivery_score", "max_fall_1y_pct", "avg_value_cr", "band"], "layout": _L(0, 11, 12, 2)},
         _note(13)]
    f = [{"id": "f1", "label": "Stock", "type": "select", "dataset": "list", "column": "symbol", "param": "symbol"}]
    return _defn(ds, w, f)


def _dash_funds():
    sql = ("SELECT sub_category, fund_type, amc, scheme_name, plan, category_rank, funds_in_category, round(nav, 2) AS nav, "
           "round(sip_xirr_1y * 100, 1) AS sip_xirr_1y_pct, round(sip_xirr_3y * 100, 1) AS sip_xirr_3y_pct, round(sip_xirr_5y * 100, 1) AS sip_xirr_5y_pct, "
           "round(cagr_3y * 100, 1) AS cagr_3y_pct, round(cagr_5y * 100, 1) AS cagr_5y_pct, round(max_drawdown_3y * 100, 1) AS max_fall_3y_pct, "
           "round(volatility_3y * 100, 1) AS volatility_3y_pct, round(sharpe_3y, 2) AS sharpe_3y, score, band "
           "FROM market.fund_scores WHERE eligible AND plan = 'Direct' ORDER BY sub_category, category_rank")
    ds = [_ds("f", "Fund scores (direct plans)", sql)]
    w = [{"type": "kpi", "title": "Funds scored", "y": ["scheme_name"], "agg": "count", "format": "integer", "dataset": "f", "layout": _L(0, 0, 3, 2)},
         {"type": "kpi", "title": "Average SIP XIRR 3Y %", "y": ["sip_xirr_3y_pct"], "agg": "avg", "format": "number", "dataset": "f", "layout": _L(3, 0, 3, 2)},
         {"type": "kpi", "title": "Best SIP XIRR 3Y %", "y": ["sip_xirr_3y_pct"], "agg": "max", "format": "number", "dataset": "f", "layout": _L(6, 0, 3, 2)},
         {"type": "kpi", "title": "Average biggest fall 3Y %", "y": ["max_fall_3y_pct"], "agg": "avg", "format": "number", "dataset": "f", "layout": _L(9, 0, 3, 2)},
         {"type": "table", "title": "Funds by score within their category (₹10,000 SIP on the first NAV day of each month)", "dataset": "f", "y": [],
          "heat": True, "columns": ["sub_category", "category_rank", "scheme_name", "amc", "sip_xirr_1y_pct", "sip_xirr_3y_pct", "sip_xirr_5y_pct",
                                    "cagr_3y_pct", "max_fall_3y_pct", "volatility_3y_pct", "sharpe_3y", "score", "band"],
          "layout": _L(0, 2, 12, 7)},
         {"type": "hbar", "title": "Average SIP XIRR 3Y by category %", "x": "sub_category", "y": ["sip_xirr_3y_pct"], "agg": "avg", "format": "number",
          "sort": "value_desc", "top": 15, "dataset": "f", "layout": _L(0, 9, 6, 5)},
         {"type": "hbar", "title": "Average biggest fall 3Y by category %", "x": "sub_category", "y": ["max_fall_3y_pct"], "agg": "avg", "format": "number",
          "sort": "value_asc", "top": 15, "dataset": "f", "layout": _L(6, 9, 6, 5)},
         _note(14)]
    flt = [{"id": "f1", "label": "Category", "type": "select", "dataset": "f", "column": "sub_category"},
           {"id": "f2", "label": "Type", "type": "select", "dataset": "f", "column": "fund_type"},
           {"id": "f3", "label": "Fund house", "type": "select", "dataset": "f", "column": "amc"}]
    return _defn(ds, w, flt)


def _dash_fx():
    ds = [_ds("d", "Rates (2 years)", "SELECT rate_date, pair, rate, sma50, sma200 FROM market.fx_daily WHERE days_back <= 730"),
          _ds("m", "Latest", "SELECT pair, rate, round(chg_1d * 100, 2) AS chg_1d_pct, round(chg_1m * 100, 2) AS chg_1m_pct, "
                 "round(chg_1y * 100, 2) AS chg_1y_pct, round(vol_30d * 100, 1) AS vol_30d_pct, sma50, sma200, rate_date FROM market.fx_metrics")]
    w = []
    for i, p in enumerate(["USD/INR", "EUR/INR", "GBP/INR", "JPY/INR (100)"]):
        w.append({"type": "kpi", "title": p, "y": ["rate"], "agg": "max", "format": "currency", "dataset": "m",
                  "where": [{"column": "pair", "op": "eq", "value": p}], "layout": _L(i * 3, 0, 3, 2)})
    w += [{"type": "line", "title": "USD / INR with 50- and 200-day averages", "x": "rate_date", "y": ["rate", "sma50", "sma200"], "agg": "max",
           "format": "number", "dataset": "d", "where": [{"column": "pair", "op": "eq", "value": "USD/INR"}], "layout": _L(0, 2, 8, 5)},
          {"type": "table", "title": "Changes and volatility", "dataset": "m", "y": [], "heat": True,
           "columns": ["pair", "rate", "chg_1d_pct", "chg_1m_pct", "chg_1y_pct", "vol_30d_pct", "rate_date"], "layout": _L(8, 2, 4, 5)},
          {"type": "line", "title": "EUR, GBP and JPY (per 100) against the rupee", "x": "rate_date", "y": ["rate"], "series": "pair", "agg": "max",
           "format": "number", "dataset": "d", "where": [{"column": "pair", "op": "neq", "value": "USD/INR"}], "layout": _L(0, 7, 12, 5)},
          {"type": "text", "title": "Source", "text": "Rupee reference rates published by the European Central Bank (via the Frankfurter API), "
           "one value per working day. Rising means the rupee is weaker against that currency.", "layout": _L(0, 12, 12, 1)}]
    return _defn(ds, w)


DASHBOARDS = [("overview", "Markets overview", "Indices, breadth, sectors and the highest-scored stocks", _dash_overview),
              ("screener", "Stock screener", "Every NIFTY 500 stock with its scores — filter by industry and band", _dash_screener),
              ("deep", "Stock deep dive", "Pick a stock: adjusted price, averages, RSI, volume and its scores", _dash_deep),
              ("funds", "Mutual funds & SIP", "SIP XIRR, CAGR and risk for every direct growth fund, ranked within its category", _dash_funds),
              ("fx", "Forex", "Rupee against USD, EUR, GBP and JPY", _dash_fx)]


def _upsert_dashboards(st, user, overwrite):
    ids = dict(st.get("dashboards") or {})
    for key, name, desc, build in DASHBOARDS:
        did = ids.get(key)
        exists = False
        if did:
            try:
                dashboards.get_dashboard(did)
                exists = True
            except HTTPException:
                exists = False
        if exists and not overwrite:
            continue
        body = {"name": name, "description": desc, "definition": build()}
        if exists:
            dashboards.save_dashboard(did, body)
        else:
            ids[key] = dashboards.create_dashboard(body, user)["id"]
    return ids


# ------------------------------------------------------------------ API
def status():
    st = _state()
    folder = settings.workspace / FOLDER
    jobs = {}
    for kind, jid in (st.get("jobs") or {}).items():
        row = store.one("SELECT id, name, paused, schedule FROM jobs WHERE id=?", (jid,))
        if row:
            last = store.one("SELECT id, state, start, end FROM runs WHERE job_id=? ORDER BY start DESC LIMIT 1", (jid,))
            jobs[kind] = {**dict(row), "last_run": dict(last) if last else None}
    dash = {}
    for key, jd in (st.get("dashboards") or {}).items():
        try:
            d = dashboards.get_dashboard(jd)
            dash[key] = {"id": d["id"], "name": d["name"]}
        except HTTPException:
            pass
    return {"installed": bool(st) and folder.exists(), "version": st.get("version"), "installed_at": st.get("installed_at"),
            "notebooks": [_nb_path(n) for _, n in NOTEBOOKS if (folder / f"{n}.ipynb").exists()], "jobs": jobs, "dashboards": dash,
            "disclaimer": DISCLAIMER}


def install(user, overwrite_dashboards=False):
    import time
    st = _state()
    nbs = _write_notebooks()
    st["jobs"] = {k: _upsert_job(k, st) for k in ("nightly", "live")}
    st["dashboards"] = _upsert_dashboards(st, user, overwrite_dashboards)
    st.update(version=1, installed_at=time.time(), user=user)
    _save_state(st)
    return {**status(), "notebooks_written": nbs}


def run_now(kind="nightly"):
    st = _state()
    jid = (st.get("jobs") or {}).get(kind)
    if not jid:
        raise HTTPException(404, "Install the Markets pack first")
    return job_manager.trigger(jid, {})
