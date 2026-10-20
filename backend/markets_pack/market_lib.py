"""DataBridge Markets pack — data fetchers and analytics used by the Markets notebooks.

Sources (all public, official, downloaded at most once per day per file, politely throttled):
  NSE   nsearchives.nseindia.com  sec_bhavdata_full_DDMMYYYY.csv   every security: OHLC, prev close, volume, value, delivery
        nsearchives.nseindia.com  ind_close_all_DDMMYYYY.csv       every NSE index close
        niftyindices.com          ind_nifty500list.csv              NIFTY 500 constituents with industry
  AMFI  portal.amfiindia.com      NAVAll.txt + NAV history report   every mutual fund scheme NAV
  FX    api.frankfurter.app        daily reference rates (European Central Bank) for USD, EUR, GBP, JPY in rupees
  Live  your own broker API key   Zerodha Kite Connect, Upstox, Dhan — quotes for a watchlist

Use of exchange data: NSE end-of-day files are published for public download. Showing them inside your own
organisation is fine; redistributing NSE data to paying customers needs a data licence from NSE (NSE Data &
Analytics). Broker APIs are for the account holder's own use under the broker's terms.

Every URL can be overridden with an environment variable (MARKETS_*_URL) — used for testing against local files."""
import datetime as dt
import io
import json
import math
import os
import re
import time
import zipfile

import numpy as np
import pandas as pd
import requests

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 DataBridge-Markets"
NSE_ARCHIVE = os.getenv("MARKETS_NSE_ARCHIVE_URL", "https://nsearchives.nseindia.com").rstrip("/")
NSE_HOME = os.getenv("MARKETS_NSE_HOME_URL", "https://www.nseindia.com")
NIFTY500_URL = os.getenv("MARKETS_NIFTY500_URL", "https://niftyindices.com/IndexConstituent/ind_nifty500list.csv")
AMFI_BASE = os.getenv("MARKETS_AMFI_URL", "https://portal.amfiindia.com").rstrip("/")
FX_BASE = os.getenv("MARKETS_FX_URL", "https://api.frankfurter.app").rstrip("/")
KITE_BASE = os.getenv("MARKETS_KITE_URL", "https://api.kite.trade").rstrip("/")
UPSTOX_BASE = os.getenv("MARKETS_UPSTOX_URL", "https://api.upstox.com").rstrip("/")
DHAN_BASE = os.getenv("MARKETS_DHAN_URL", "https://api.dhan.co").rstrip("/")
DHAN_SCRIPS = os.getenv("MARKETS_DHAN_SCRIPS_URL", "https://images.dhan.co/api-data/api-scrip-master.csv")
PAUSE = float(os.getenv("MARKETS_REQUEST_PAUSE", "1.0"))      # seconds between requests to the same site (be polite)
FX_PAIRS = [p.strip().upper() for p in os.getenv("MARKETS_FX_CURRENCIES", "USD,EUR,GBP,JPY").split(",") if p.strip()]
TD = 252                                                       # trading days a year


def env(name, default=""):
    v = os.getenv(name)
    return v if v not in (None, "") else default


def start_date():
    s = env("MARKETS_START_DATE", "")
    if s:
        return dt.date.fromisoformat(s)
    return dt.date.today() - dt.timedelta(days=365 * int(env("MARKETS_HISTORY_YEARS", "3")) + 10)


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


# ------------------------------------------------------------------ http
class Http:
    def __init__(self):
        self.s = requests.Session()
        self.s.headers.update({"User-Agent": UA, "Accept": "*/*", "Accept-Language": "en-IN,en;q=0.9"})
        self._last = {}
        self._warm = False

    def get(self, url, tries=3, **kw):
        host = re.sub(r"^https?://([^/]+).*$", r"\1", url)
        for i in range(tries):
            wait = PAUSE - (time.time() - self._last.get(host, 0))
            if wait > 0:
                time.sleep(wait)
            self._last[host] = time.time()
            try:
                r = self.s.get(url, timeout=kw.pop("timeout", 45), **kw)
            except requests.RequestException as e:
                log("network error", url, e)
                time.sleep(3 * (i + 1))
                continue
            if r.status_code == 404:
                return None                              # no file that day (holiday / not published yet)
            if r.status_code in (401, 403) and "nseindia" in host and not self._warm:
                self._warm = True                        # NSE expects the session cookies a browser gets from its home page
                try:
                    self.s.get(NSE_HOME, timeout=30)
                except requests.RequestException:
                    pass
                continue
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(5 * (i + 1))
                continue
            r.raise_for_status()
            return r
        raise RuntimeError(f"Could not download {url} after {tries} tries")


HTTP = Http()


def weekdays(a, b):
    d = a
    while d <= b:
        if d.weekday() < 5:
            yield d
        d += dt.timedelta(days=1)


# ------------------------------------------------------------------ NSE
def _clean_cols(df):
    df.columns = [str(c).strip().upper().replace(" ", "_") for c in df.columns]
    for c in df.columns:
        if not pd.api.types.is_numeric_dtype(df[c]):
            df[c] = df[c].astype(str).str.strip()       # NSE pads every value with a space after the comma
    return df


def _num(s):
    return pd.to_numeric(pd.Series(s).replace({"-": None, "": None, "nan": None}), errors="coerce")


def nse_equity_day(d: dt.date):
    """One trading day of every NSE security (sec_bhavdata_full). None on holidays."""
    r = HTTP.get(f"{NSE_ARCHIVE}/products/content/sec_bhavdata_full_{d:%d%m%Y}.csv")
    if r is None or not r.content.strip():
        return None
    df = _clean_cols(pd.read_csv(io.BytesIO(r.content), dtype=str))
    out = pd.DataFrame({
        "trade_date": pd.Timestamp(d).date(),
        "symbol": df["SYMBOL"], "series": df["SERIES"],
        "prev_close": _num(df["PREV_CLOSE"]), "open": _num(df["OPEN_PRICE"]), "high": _num(df["HIGH_PRICE"]),
        "low": _num(df["LOW_PRICE"]), "last": _num(df["LAST_PRICE"]), "close": _num(df["CLOSE_PRICE"]),
        "avg_price": _num(df.get("AVG_PRICE")), "volume": _num(df["TTL_TRD_QNTY"]),
        "traded_value": _num(df["TURNOVER_LACS"]) * 1e5, "trades": _num(df.get("NO_OF_TRADES")),
        "delivery_qty": _num(df.get("DELIV_QTY")), "delivery_pct": _num(df.get("DELIV_PER")),
    })
    return out[out["close"].notna()]


def nse_indices_day(d: dt.date):
    r = HTTP.get(f"{NSE_ARCHIVE}/content/indices/ind_close_all_{d:%d%m%Y}.csv")
    if r is None or not r.content.strip():
        return None
    df = pd.read_csv(io.BytesIO(r.content), dtype=str)
    df.columns = [str(c).strip() for c in df.columns]
    col = lambda *names: next((df[c] for c in df.columns for n in names if c.lower().startswith(n)), None)  # noqa: E731
    out = pd.DataFrame({
        "trade_date": pd.Timestamp(d).date(), "index_name": col("index name").str.strip(),
        "open": _num(col("open index")), "high": _num(col("high index")), "low": _num(col("low index")),
        "close": _num(col("closing index")), "change_pct": _num(col("change(%)", "change (%)")),
        "pe": _num(col("p/e")), "pb": _num(col("p/b")), "div_yield": _num(col("div yield")),
    })
    return out[out["close"].notna()]


def nifty500():
    r = HTTP.get(NIFTY500_URL)
    if r is None:
        return None
    df = pd.read_csv(io.BytesIO(r.content), dtype=str)
    df.columns = [str(c).strip().lower() for c in df.columns]
    pick = lambda *n: next((df[c] for c in df.columns if any(c.startswith(x) for x in n)), None)  # noqa: E731
    return pd.DataFrame({"symbol": pick("symbol").str.strip(), "company": pick("company").str.strip(),
                         "industry": pick("industry").str.strip(), "isin": pick("isin").str.strip()})


# ------------------------------------------------------------------ AMFI
_KEEP = re.compile(r"growth", re.I)
_DROP = re.compile(r"idcw|dividend|bonus|payout|reinvest", re.I)


def parse_amfi(text, growth_only=True):
    """NAVAll.txt and the NAV history report: semicolon rows under category and fund-house heading lines."""
    rows, header, category, amc = [], None, None, None
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if ";" not in line:
            if re.search(r"schemes?\s*\(", line, re.I) or line.lower().startswith(("open ended", "close ended", "interval fund")):
                category = re.sub(r"\s+", " ", line)
            else:
                amc = line
            continue
        parts = [p.strip() for p in line.split(";")]
        if parts[0].lower().startswith("scheme code"):
            header = [p.lower() for p in parts]
            continue
        if not header or not parts[0].isdigit():
            continue
        get = lambda *names: next((parts[i] for i, h in enumerate(header) if i < len(parts) and any(h.startswith(n) for n in names)), None)  # noqa: E731
        name = get("scheme name", "nav name")
        if growth_only and name and (not _KEEP.search(name) or _DROP.search(name)):
            continue
        rows.append((int(parts[0]), name, get("isin div payout", "isin div payout/isin growth", "isin"), get("net asset value"),
                     get("date"), category, amc))
    df = pd.DataFrame(rows, columns=["scheme_code", "scheme_name", "isin", "nav", "nav_date", "category", "amc"])
    if df.empty:
        return df
    df["nav"] = pd.to_numeric(df["nav"], errors="coerce")
    df["nav_date"] = pd.to_datetime(df["nav_date"], format="%d-%b-%Y", errors="coerce").dt.date
    cat = df["category"].fillna("")
    df["fund_type"] = cat.str.extract(r"\(\s*([A-Za-z ]+?) Scheme", expand=False).str.strip()
    df["sub_category"] = cat.str.extract(r"-\s*([^)]+)\)", expand=False).str.strip()
    df["plan"] = np.where(df["scheme_name"].str.contains("direct", case=False, na=False), "Direct", "Regular")
    return df[df["nav"].notna() & df["nav_date"].notna() & (df["nav"] > 0)]


def amfi_latest():
    r = HTTP.get(f"{AMFI_BASE}/spages/NAVAll.txt")
    return parse_amfi(r.text) if r is not None else None


def amfi_history(frm: dt.date, to: dt.date):
    """All schemes between two dates (AMFI serves at most 90 days per request)."""
    r = HTTP.get(f"{AMFI_BASE}/DownloadNAVHistoryReport_Po.aspx?frmdt={frm:%d-%b-%Y}&todt={to:%d-%b-%Y}", timeout=180)
    return parse_amfi(r.text) if r is not None else None


# ------------------------------------------------------------------ forex
def fx_rates(frm: dt.date, to: dt.date):
    """Rupees per unit of each currency (JPY per 100), from the ECB reference rates published by Frankfurter."""
    out = []
    for cur in FX_PAIRS:
        r = HTTP.get(f"{FX_BASE}/{frm:%Y-%m-%d}..{to:%Y-%m-%d}?from={cur}&to=INR")
        if r is None:
            continue
        rates = (r.json() or {}).get("rates") or {}
        mult = 100 if cur == "JPY" else 1
        for day, v in rates.items():
            if "INR" in (v or {}):
                out.append({"rate_date": dt.date.fromisoformat(day), "pair": f"{cur}/INR" + (" (100)" if mult == 100 else ""),
                            "currency": cur, "rate": float(v["INR"]) * mult, "source": "ECB via Frankfurter"})
    return pd.DataFrame(out)


# ------------------------------------------------------------------ brokers (your own API key)
def watchlist():
    return [s.strip().upper() for s in env("MARKETS_WATCHLIST", "RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK").split(",") if s.strip()]


def kite_quotes(symbols):
    key, tok = env("KITE_API_KEY"), env("KITE_ACCESS_TOKEN")
    if not (key and tok):
        return None
    out = []
    for i in range(0, len(symbols), 200):
        q = "&".join(f"i=NSE:{s}" for s in symbols[i:i + 200])
        r = HTTP.s.get(f"{KITE_BASE}/quote?{q}", headers={"X-Kite-Version": "3", "Authorization": f"token {key}:{tok}"}, timeout=30)
        r.raise_for_status()
        for k, v in ((r.json() or {}).get("data") or {}).items():
            o = v.get("ohlc") or {}
            out.append({"symbol": k.split(":", 1)[-1], "ltp": v.get("last_price"), "open": o.get("open"), "high": o.get("high"),
                        "low": o.get("low"), "prev_close": o.get("close"), "volume": v.get("volume"), "exchange_ts": v.get("timestamp")})
    return out


def upstox_quotes(symbols, isin_of):
    tok = env("UPSTOX_ACCESS_TOKEN")
    if not tok:
        return None
    keys = {f"NSE_EQ|{isin_of[s]}": s for s in symbols if isin_of.get(s)}
    out = []
    items = list(keys)
    for i in range(0, len(items), 400):
        r = HTTP.s.get(f"{UPSTOX_BASE}/v2/market-quote/quotes", params={"instrument_key": ",".join(items[i:i + 400])},
                       headers={"Accept": "application/json", "Authorization": f"Bearer {tok}"}, timeout=30)
        r.raise_for_status()
        for _, v in ((r.json() or {}).get("data") or {}).items():
            o = v.get("ohlc") or {}
            sym = keys.get(v.get("instrument_token")) or v.get("symbol")
            out.append({"symbol": sym, "ltp": v.get("last_price"), "open": o.get("open"), "high": o.get("high"), "low": o.get("low"),
                        "prev_close": (v.get("last_price") or 0) - (v.get("net_change") or 0) if v.get("net_change") is not None else None,
                        "volume": v.get("volume"), "exchange_ts": v.get("timestamp")})
    return out


def dhan_quotes(symbols):
    cid, tok = env("DHAN_CLIENT_ID"), env("DHAN_ACCESS_TOKEN")
    if not (cid and tok):
        return None
    r = HTTP.get(DHAN_SCRIPS, timeout=120)
    m = pd.read_csv(io.BytesIO(r.content), dtype=str, low_memory=False)
    m.columns = [c.strip().upper() for c in m.columns]
    m = m[(m["SEM_EXM_EXCH_ID"] == "NSE") & (m.get("SEM_SERIES", "EQ") == "EQ")]
    ids = dict(zip(m["SEM_TRADING_SYMBOL"], m["SEM_SMST_SECURITY_ID"]))
    want = {int(ids[s]): s for s in symbols if s in ids}
    r = HTTP.s.post(f"{DHAN_BASE}/v2/marketfeed/quote", json={"NSE_EQ": list(want)},
                    headers={"access-token": tok, "client-id": cid, "Accept": "application/json", "Content-Type": "application/json"}, timeout=30)
    r.raise_for_status()
    out = []
    for sid, v in (((r.json() or {}).get("data") or {}).get("NSE_EQ") or {}).items():
        o = v.get("ohlc") or {}
        out.append({"symbol": want.get(int(sid)), "ltp": v.get("last_price"), "open": o.get("open"), "high": o.get("high"),
                    "low": o.get("low"), "prev_close": o.get("close"), "volume": v.get("volume"), "exchange_ts": v.get("last_trade_time")})
    return out


# ------------------------------------------------------------------ fund maths
def xirr(cashflows):
    """cashflows: list of (date, amount). Annual internal rate of return by bisection (robust for SIP flows)."""
    if len(cashflows) < 2:
        return None
    d0 = cashflows[0][0]
    t = np.array([(d - d0).days / 365.0 for d, _ in cashflows])
    a = np.array([v for _, v in cashflows], dtype=float)
    f = lambda r: float(np.sum(a / (1 + r) ** t))  # noqa: E731
    lo, hi = -0.99, 10.0
    flo, fhi = f(lo), f(hi)
    if np.isnan(flo) or np.isnan(fhi) or flo * fhi > 0:
        return None
    for _ in range(200):
        mid = (lo + hi) / 2
        fm = f(mid)
        if abs(fm) < 1e-6:
            break
        if flo * fm < 0:
            hi, fhi = mid, fm
        else:
            lo, flo = mid, fm
    return (lo + hi) / 2


def sip_xirr(nav: pd.Series, years: int, amount=10000.0):
    """nav: Series indexed by date (sorted). Invests `amount` on the first NAV day of each month for `years` years."""
    if nav.empty:
        return None
    end = nav.index[-1]
    start = end - pd.DateOffset(years=years)
    if nav.index[0] > start + pd.Timedelta(days=10):
        return None
    flows, units = [], 0.0
    months = pd.date_range(start.normalize().replace(day=1) + pd.offsets.MonthBegin(1), end, freq="MS")
    for m in months:
        s = nav[nav.index >= m]
        if s.empty:
            break
        units += amount / s.iloc[0]
        flows.append((s.index[0].date(), -amount))
    if len(flows) < 6:
        return None
    flows.append((end.date(), units * nav.iloc[-1]))
    return xirr(flows)


def cagr(nav: pd.Series, years):
    if nav.empty:
        return None
    end = nav.index[-1]
    past = nav[nav.index <= end - pd.DateOffset(years=years)]
    if past.empty or (end - past.index[-1]).days > years * 365 + 15:
        return None
    return (nav.iloc[-1] / past.iloc[-1]) ** (1 / years) - 1


def fund_metrics(g: pd.DataFrame) -> pd.DataFrame:
    g = g.sort_values("nav_date")
    nav = pd.Series(g["nav"].values, index=pd.to_datetime(g["nav_date"])).astype(float)
    nav = nav[~nav.index.duplicated(keep="last")]
    last = g.iloc[-1]
    w3 = nav[nav.index >= nav.index[-1] - pd.DateOffset(years=3)]
    rets = w3.pct_change().dropna()
    dd = (w3 / w3.cummax() - 1).min() if len(w3) else None
    return pd.DataFrame([{
        "scheme_code": int(last["scheme_code"]), "scheme_name": last["scheme_name"], "amc": last["amc"], "category": last["category"],
        "fund_type": last["fund_type"], "sub_category": last["sub_category"], "plan": last["plan"],
        "nav": float(nav.iloc[-1]), "nav_date": nav.index[-1].date(), "history_days": int(len(nav)),
        "ret_1m": float(nav.iloc[-1] / nav[nav.index <= nav.index[-1] - pd.DateOffset(months=1)].iloc[-1] - 1) if (nav.index <= nav.index[-1] - pd.DateOffset(months=1)).any() else None,
        "cagr_1y": cagr(nav, 1), "cagr_3y": cagr(nav, 3), "cagr_5y": cagr(nav, 5),
        "sip_xirr_1y": sip_xirr(nav, 1), "sip_xirr_3y": sip_xirr(nav, 3), "sip_xirr_5y": sip_xirr(nav, 5),
        "volatility_3y": float(rets.std() * math.sqrt(TD)) if len(rets) > 20 else None,
        "max_drawdown_3y": float(dd) if dd is not None and not np.isnan(dd) else None,
        "sharpe_3y": float((rets.mean() * TD - float(env("MARKETS_RISK_FREE", "0.065"))) / (rets.std() * math.sqrt(TD))) if len(rets) > 20 and rets.std() > 0 else None,
    }])


FUND_SCHEMA = ("scheme_code long, scheme_name string, amc string, category string, fund_type string, sub_category string, plan string, "
               "nav double, nav_date date, history_days double, ret_1m double, cagr_1y double, cagr_3y double, cagr_5y double, "
               "sip_xirr_1y double, sip_xirr_3y double, sip_xirr_5y double, volatility_3y double, max_drawdown_3y double, sharpe_3y double")


# ------------------------------------------------------------------ spark helpers
def table_format(spark):
    try:
        return "delta" if "delta" in (spark.conf.get("spark.sql.extensions", "") or "").lower() else "parquet"
    except Exception:  # noqa: BLE001
        return "parquet"


def table_exists(spark, name):
    try:
        return spark.catalog.tableExists(name)
    except Exception:  # noqa: BLE001
        db, t = name.split(".")
        return any(x.name == t for x in spark.catalog.listTables(db))


def max_date(spark, table, col):
    if not table_exists(spark, table):
        return None
    v = spark.sql(f"SELECT max({col}) AS m FROM {table}").collect()[0]["m"]
    return v


INT_COLS = {"scheme_code"}


def _normalise(pdf):
    """Stable column types across batches: numbers as float64 (ids as int64), text as plain Python strings, dates as dates."""
    pdf = pdf.copy()
    for c in pdf.columns:
        s = pdf[c]
        if c in INT_COLS:
            pdf[c] = pd.to_numeric(s, errors="coerce").astype("int64")
        elif pd.api.types.is_bool_dtype(s):
            continue
        elif pd.api.types.is_numeric_dtype(s):
            pdf[c] = s.astype("float64")
        elif pd.api.types.is_datetime64_any_dtype(s):
            continue
        else:
            pdf[c] = s.astype(object).where(s.notna(), None)
    return pdf


def _provider(spark, table):
    """Storage format of an existing table ('delta', 'parquet', 'hive', ...) or None if it doesn't exist."""
    if not table_exists(spark, table):
        return None
    try:
        for r in spark.sql(f"DESCRIBE TABLE EXTENDED {table}").collect():
            if (r[0] or "").strip().lower() == "provider":
                return (r[1] or "").strip().lower() or None
    except Exception:  # noqa: BLE001
        pass
    return "unknown"


def _location(spark, table):
    db, t = table.split(".")
    wh = spark.conf.get("spark.sql.warehouse.dir")
    return f"{wh.rstrip('/')}/{db}.db/{t}"


def save(spark, pdf_or_df, table, mode="append"):
    """Write a pandas or Spark DataFrame to a catalog table (Delta when available, else Parquet).

    overwrite: the table is replaced completely (schema included). If the existing table can't be overwritten in place —
               e.g. it was created as Parquet/Hive before Delta was switched on ("does not support truncate in batch
               mode") — it is dropped and created again.
    append:    rows are added using the table's existing format."""
    db = table.split(".")[0]
    spark.sql(f"CREATE DATABASE IF NOT EXISTS {db}")
    df = spark.createDataFrame(_normalise(pdf_or_df)) if isinstance(pdf_or_df, pd.DataFrame) else pdf_or_df
    fmt = table_format(spark)
    prov = _provider(spark, table)

    if mode == "overwrite":
        if prov and prov != fmt:
            spark.sql(f"DROP TABLE IF EXISTS {table}")          # different format (parquet/hive vs delta): start fresh
            prov = None
        try:
            df.write.format(fmt).mode("overwrite").option("overwriteSchema", "true").saveAsTable(table)
            return df
        except Exception as e:  # noqa: BLE001
            msg = str(e)
            if "does not support truncate" not in msg and "LOCATION_ALREADY_EXISTS" not in msg and "already exists" not in msg:
                raise
        # last resort: drop the table entry, overwrite its folder, register it again
        spark.sql(f"DROP TABLE IF EXISTS {table}")
        loc = _location(spark, table)
        df.write.format(fmt).mode("overwrite").option("overwriteSchema", "true").save(loc)
        spark.sql(f"CREATE TABLE IF NOT EXISTS {table} USING {fmt} LOCATION '{loc}'")
        spark.catalog.refreshTable(table)
        return df

    use = prov if prov in ("delta", "parquet") else fmt
    try:
        df.write.format(use).mode("append").saveAsTable(table)
    except Exception as e:  # noqa: BLE001
        if "LOCATION_ALREADY_EXISTS" not in str(e):
            raise
        # the table's folder exists but this session's catalog doesn't know it: append to the folder and register it
        loc = _location(spark, table)
        df.write.format(use).mode("append").save(loc)
        spark.sql(f"CREATE TABLE IF NOT EXISTS {table} USING {use} LOCATION '{loc}'")
        spark.catalog.refreshTable(table)
    return df


def read_table_pandas(spark, table, columns):
    """Read a catalog table into pandas straight from its Parquet/Delta files (no JVM-to-Python transfer); falls back to Spark."""
    try:
        from urllib.parse import urlparse
        from urllib.request import url2pathname
        files = [url2pathname(urlparse(f).path) if f.startswith("file:") else f for f in spark.table(table).inputFiles()]
        if files and all(not re.match(r"^[a-z]+://", f) for f in files):
            return pd.concat([pd.read_parquet(f, columns=columns) for f in files], ignore_index=True)
    except Exception as e:  # noqa: BLE001
        log("direct file read failed, using Spark:", e)
    return spark.table(table).select(*columns).toPandas()


def disclaimer():
    return ("Scores rank stocks and funds on past data to help people screen faster. They are not investment advice or a "
            "recommendation to buy or sell. Past performance does not guarantee future returns.")
