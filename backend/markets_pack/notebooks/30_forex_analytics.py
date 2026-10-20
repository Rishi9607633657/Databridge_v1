# %% [md]
# # 30 · Forex analytics
# Daily rupee rates with 50/200-day averages, changes over 1 day, 1 month and 1 year, and 30-day annualised volatility.
# %%
import os, sys
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml
import pandas as pd, numpy as np

fx = spark.table("market_raw.fx_rates").toPandas().drop_duplicates(["pair", "rate_date"]).sort_values(["pair", "rate_date"])
out = []
for pair, g in fx.groupby("pair"):
    g = g.copy()
    g["sma50"] = g["rate"].rolling(50, min_periods=50).mean()
    g["sma200"] = g["rate"].rolling(200, min_periods=200).mean()
    g["chg_1d"] = g["rate"].pct_change()
    g["chg_1m"] = g["rate"] / g["rate"].shift(21) - 1
    g["chg_1y"] = g["rate"] / g["rate"].shift(252) - 1
    g["vol_30d"] = g["chg_1d"].rolling(30).std() * np.sqrt(252)
    out.append(g)
daily = pd.concat(out, ignore_index=True)
latest = daily["rate_date"].max()
daily["days_back"] = (pd.to_datetime(latest) - pd.to_datetime(daily["rate_date"])).dt.days
ml.save(spark, daily, "market.fx_daily", mode="overwrite")
ml.save(spark, daily.sort_values("rate_date").groupby("pair").tail(1), "market.fx_metrics", mode="overwrite")
display(spark.table("market.fx_metrics"))
