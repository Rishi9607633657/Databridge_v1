# %% [md]
# # 20 · Mutual fund and SIP analytics
# For every growth-option scheme: returns (1 month, CAGR 1/3/5 years), **SIP XIRR** for ₹10,000 invested on the first NAV day of each month
# over 1, 3 and 5 years, 3-year volatility, Sharpe ratio and biggest fall. Funds are then scored 0–100 **within their own category**:
# SIP XIRR 3Y 40% · CAGR 3Y 20% · smaller falls 20% · lower volatility 20%. Past returns are not a guarantee of future returns.
# %%
import os, sys
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml
from pyspark.sql import functions as F, Window as W

import pandas as pd
latest = spark.table("market_raw.amfi_nav").agg(F.max("nav_date")).collect()[0][0]
pdf = ml.read_table_pandas(spark, "market_raw.amfi_nav", ["scheme_code", "scheme_name", "amc", "category", "fund_type", "sub_category", "plan", "nav", "nav_date"])
pdf["nav_date"] = pd.to_datetime(pdf["nav_date"]).dt.date
pdf = pdf[pdf["nav_date"] >= latest - pd.Timedelta(days=365 * 5 + 40)].drop_duplicates(["scheme_code", "nav_date"], keep="last")
ml.log(f"{len(pdf):,} NAV rows for {pdf['scheme_code'].nunique():,} schemes")
metrics = pd.concat([ml.fund_metrics(g) for _, g in pdf.groupby("scheme_code", sort=False)], ignore_index=True)
del pdf
m = spark.createDataFrame(ml._normalise(metrics), schema=ml.FUND_SCHEMA)
active = (F.col("nav_date") >= F.date_sub(F.lit(latest), 10)) & F.col("category").startswith("Open Ended")
m = m.withColumn("active", active)
C = W.partitionBy("category", "plan", "eligible")      # direct and regular plans ranked separately
m = m.withColumn("eligible", F.col("active") & F.col("sip_xirr_3y").isNotNull())
pr = lambda c: F.percent_rank().over(C.orderBy(F.col(c).asc_nulls_first()))
s = (m.withColumn("p_sip", pr("sip_xirr_3y")).withColumn("p_cagr", pr("cagr_3y")).withColumn("p_dd", pr("max_drawdown_3y"))
      .withColumn("p_vol", pr("volatility_3y"))
      .withColumn("score", F.when(F.col("eligible"), F.round(100 * (0.4 * F.col("p_sip") + 0.2 * F.col("p_cagr") + 0.2 * F.col("p_dd") + 0.2 * (1 - F.col("p_vol"))), 0)))
      .withColumn("band", F.when(F.col("score") >= 75, "Strong").when(F.col("score") >= 60, "Good").when(F.col("score") >= 40, "Neutral").when(F.col("score").isNotNull(), "Weak"))
      .withColumn("category_rank", F.when(F.col("eligible"), F.row_number().over(C.orderBy(F.col("score").desc_nulls_last()))))
      .withColumn("funds_in_category", F.when(F.col("eligible"), F.count("*").over(C)))
      .drop("p_sip", "p_cagr", "p_dd", "p_vol"))
ml.save(spark, s, "market.fund_scores", mode="overwrite")
ml.log(f"market.fund_scores: {s.count()} schemes, {s.where('eligible').count()} scored, NAV date {latest}")
display(spark.sql("SELECT sub_category, category_rank, scheme_name, round(sip_xirr_3y*100,1) AS sip_xirr_3y_pct, score FROM market.fund_scores "
                  "WHERE eligible AND plan = 'Direct' AND category_rank <= 3 ORDER BY sub_category, category_rank"))
