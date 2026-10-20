# %% [md]
# # 40 · Live quotes from your broker
# Uses **your own** broker API key (Admin › Settings › Markets) to fetch quotes for your watchlist (`MARKETS_WATCHLIST`).
# Set `MARKETS_BROKER` to `kite` (Zerodha Kite Connect), `upstox` or `dhan`. Broker data is for the account holder's own use
# under the broker's API terms — don't redistribute it.
# The job **Markets — live quotes** runs this every 5 minutes during market hours; it is paused until you switch it on.
# %%
import os, sys, datetime as dt
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml
import pandas as pd

broker = os.environ.get("MARKETS_BROKER", "").lower()
syms = ml.watchlist()
if broker == "kite":
    rows = ml.kite_quotes(syms)
elif broker == "upstox":
    isin = {}
    if ml.table_exists(spark, "market_raw.nifty500"):
        isin = {r["symbol"]: r["isin"] for r in spark.table("market_raw.nifty500").collect()}
    rows = ml.upstox_quotes(syms, isin)
elif broker == "dhan":
    rows = ml.dhan_quotes(syms)
else:
    rows = None
if rows is None:
    dbutils.notebook.exit("No broker configured: set MARKETS_BROKER and the broker's API key in Admin › Settings › Markets")
df = pd.DataFrame(rows)
df["broker"] = broker
df["fetched_at"] = pd.Timestamp.now(tz="Asia/Kolkata").tz_localize(None)
for c in ("ltp", "open", "high", "low", "prev_close", "volume"):
    df[c] = pd.to_numeric(df[c], errors="coerce")
df["exchange_ts"] = df["exchange_ts"].astype(str)
df["change_pct"] = (df["ltp"] / df["prev_close"] - 1) * 100
ml.save(spark, df, "market_raw.live_quotes")
ml.save(spark, df, "market.live_latest", mode="overwrite")
display(df)
