# %% [md]
# # 01 · Ingest NSE end-of-day data
# Downloads the official NSE end-of-day files for every trading day since the last run (or since `MARKETS_START_DATE` on the first run):
# - `sec_bhavdata_full` — every security: open, high, low, close, previous close, volume, traded value and delivery %
# - `ind_close_all` — every NSE index
# - the NIFTY 500 list with each company's industry
#
# Files are fetched one at a time with a pause between requests. Days with no file (holidays) are skipped.
# NSE data is for use inside your organisation; selling it on to others needs an NSE data licence.
# %%
import os, sys, datetime as dt
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml
import pandas as pd

EQ, IDX, N500 = "market_raw.nse_equity_eod", "market_raw.nse_indices", "market_raw.nifty500"
last = ml.max_date(spark, EQ, "trade_date")
start = (last + dt.timedelta(days=1)) if last else ml.start_date()
end = dt.date.today()
ml.log(f"Loading NSE days {start} → {end} (last loaded: {last})")
# %%
eq_batch, ix_batch, loaded, holidays = [], [], 0, 0

def flush():
    global eq_batch, ix_batch
    if eq_batch:
        ml.save(spark, pd.concat(eq_batch, ignore_index=True), EQ)
    if ix_batch:
        ml.save(spark, pd.concat(ix_batch, ignore_index=True), IDX)
    eq_batch, ix_batch = [], []

for d in ml.weekdays(start, end):
    eq = ml.nse_equity_day(d)
    if eq is None:
        holidays += 1
        continue
    eq_batch.append(eq)
    ix = ml.nse_indices_day(d)
    if ix is not None:
        ix_batch.append(ix)
    loaded += 1
    if loaded % 25 == 0:
        flush()
        ml.log(f"{loaded} days loaded, up to {d}")
flush()
ml.log(f"Done: {loaded} trading days added, {holidays} days without a file")
# %%
n5 = ml.nifty500()
if n5 is not None and len(n5):
    ml.save(spark, n5, N500, mode="overwrite")
    ml.log(f"NIFTY 500 list: {len(n5)} companies")
else:
    ml.log("NIFTY 500 list not available today — keeping the previous one")
# %%
display(spark.sql(f"SELECT trade_date, count(*) AS securities FROM {EQ} GROUP BY trade_date ORDER BY trade_date DESC LIMIT 10"))
