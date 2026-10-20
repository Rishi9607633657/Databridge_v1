# %% [md]
# # 03 · Ingest forex rates
# Daily reference rates of the rupee against USD, EUR, GBP and JPY (per 100 yen), from the European Central Bank via the free Frankfurter API.
# Change the currencies with the `MARKETS_FX_CURRENCIES` setting.
# %%
import os, sys, datetime as dt
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml

FX = "market_raw.fx_rates"
last = ml.max_date(spark, FX, "rate_date")
start = (last + dt.timedelta(days=1)) if last else ml.start_date()
if start <= dt.date.today():
    df = ml.fx_rates(start, dt.date.today())
    if last is not None and len(df):
        df = df[df["rate_date"] > last]
    if len(df):
        ml.save(spark, df, FX)
    ml.log(f"{len(df)} rates added")
display(spark.sql(f"SELECT * FROM {FX} ORDER BY rate_date DESC, pair LIMIT 12"))
