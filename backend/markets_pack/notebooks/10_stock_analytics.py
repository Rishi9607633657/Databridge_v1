# %% [md]
# # 10 · Stock analytics and scores
# 1. **Adjusted prices** — on the day of a split, bonus or rights issue NSE adjusts the *previous close*; the ratio between that and the
#    actual previous close is the adjustment factor, applied to all earlier prices so charts and returns aren't broken.
# 2. **Indicators** — returns (1 day to 3 years), 20/50/200-day averages, RSI(14), 1-year volatility, beta to NIFTY 50, biggest fall in a year,
#    52-week high/low, average traded value, delivery %.
# 3. **Scores 0–100**, ranked against the universe (NIFTY 500 by default):
#    trend 30% · momentum 30% · low risk 20% · liquidity 10% · delivery 10%.
#
# Scores are a screening aid built from past prices. They are **not investment advice**.
# %%
import os, sys
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml
from pyspark.sql import functions as F, Window as W

W1 = lambda n: W.partitionBy("symbol").orderBy("trade_date").rowsBetween(-(n - 1), 0)
by = W.partitionBy("symbol").orderBy("trade_date")
pref = F.when(F.col("series") == "EQ", 0).otherwise(1)
eod = (spark.table("market_raw.nse_equity_eod").withColumn("series", F.trim("series")).withColumn("symbol", F.trim("symbol"))
       .where(F.col("series").isin("EQ", "BE"))
       .withColumn("_r", F.row_number().over(W.partitionBy("symbol", "trade_date").orderBy(pref))).where("_r = 1").drop("_r"))
# %%
# adjustment factor for splits / bonus / rights
f = F.col("prev_close") / F.lag("close").over(by)
px = (eod.withColumn("factor", F.when(f.between(0.02, 0.998), f).otherwise(F.lit(1.0)))
      .withColumn("cum", F.coalesce(F.sum(F.log("factor")).over(by.rowsBetween(1, W.unboundedFollowing)), F.lit(0.0)))
      .withColumn("adj", F.exp("cum")))
for c in ("open", "high", "low", "close"):
    px = px.withColumn(f"adj_{c}", F.round(F.col(c) * F.col("adj"), 4))
px = px.withColumn("adj_volume", F.col("volume") / F.col("adj"))

# NIFTY 50 daily return for beta
idx = (spark.table("market_raw.nse_indices").withColumn("index_name", F.upper(F.trim("index_name")))
       .where(F.col("index_name") == "NIFTY 50")
       .withColumn("mkt_ret", F.col("close") / F.lag("close").over(W.orderBy("trade_date")) - 1)
       .select("trade_date", "mkt_ret"))
px = px.join(idx, "trade_date", "left")
# %%
c = F.col("adj_close")
lagc = lambda n: F.lag("adj_close", n).over(by)
px = (px.withColumn("ret_1d", c / lagc(1) - 1).withColumn("ret_1w", c / lagc(5) - 1).withColumn("ret_1m", c / lagc(21) - 1)
        .withColumn("ret_3m", c / lagc(63) - 1).withColumn("ret_6m", c / lagc(126) - 1).withColumn("ret_1y", c / lagc(252) - 1)
        .withColumn("ret_3y", c / lagc(756) - 1)
        .withColumn("n", F.row_number().over(by)))
for n in (20, 50, 200):
    px = px.withColumn(f"sma{n}", F.when(F.col("n") >= n, F.avg(c).over(W1(n))))
delta = c - lagc(1)
px = (px.withColumn("gain", F.greatest(delta, F.lit(0.0))).withColumn("loss", F.greatest(-delta, F.lit(0.0)))
        .withColumn("ag", F.avg("gain").over(W1(14))).withColumn("al", F.avg("loss").over(W1(14)))
        .withColumn("rsi_14", F.when(F.col("n") > 14, F.when(F.col("al") == 0, F.lit(100.0)).otherwise(100 - 100 / (1 + F.col("ag") / F.col("al")))))
        .withColumn("volatility_1y", F.when(F.col("n") > 60, F.stddev("ret_1d").over(W1(252)) * (252 ** 0.5)))
        .withColumn("beta_1y", F.when(F.col("n") > 60, F.covar_samp("ret_1d", "mkt_ret").over(W1(252)) / F.var_samp("mkt_ret").over(W1(252))))
        .withColumn("runmax", F.max(c).over(W1(252))).withColumn("dd", c / F.col("runmax") - 1)
        .withColumn("max_drawdown_1y", F.min("dd").over(W1(252)))
        .withColumn("high_52w", F.max("adj_high").over(W1(252))).withColumn("low_52w", F.min("adj_low").over(W1(252)))
        .withColumn("avg_value_3m", F.avg("traded_value").over(W1(63)))
        .withColumn("delivery_1m", F.avg("delivery_pct").over(W1(21)))
        .withColumn("sma200_prev", F.lag("sma200", 20).over(by)))
latest = px.agg(F.max("trade_date")).collect()[0][0]
px = px.withColumn("days_back", F.datediff(F.lit(latest), F.col("trade_date")))
cols = ["trade_date", "symbol", "series", "open", "high", "low", "close", "prev_close", "volume", "traded_value", "delivery_pct", "factor",
        "adj_open", "adj_high", "adj_low", "adj_close", "adj_volume", "ret_1d", "ret_1w", "ret_1m", "ret_3m", "ret_6m", "ret_1y", "ret_3y",
        "sma20", "sma50", "sma200", "rsi_14", "volatility_1y", "beta_1y", "max_drawdown_1y", "high_52w", "low_52w", "avg_value_3m",
        "delivery_1m", "sma200_prev", "n", "days_back"]
ml.save(spark, px.select(*cols), "market.stock_prices", mode="overwrite")
ml.log(f"market.stock_prices written up to {latest}")
# %%
sp = spark.table("market.stock_prices")
snap = sp.where(F.col("trade_date") == latest)
universe = os.environ.get("MARKETS_UNIVERSE", "nifty500").lower()
min_value = float(os.environ.get("MARKETS_MIN_VALUE_CR", "1")) * 1e7
has500 = ml.table_exists(spark, "market_raw.nifty500")
if has500:
    snap = snap.join(spark.table("market_raw.nifty500").select("symbol", "company", "industry", "isin"), "symbol", "left")
else:
    snap = snap.withColumn("company", F.lit(None).cast("string")).withColumn("industry", F.lit(None).cast("string")).withColumn("isin", F.lit(None).cast("string"))
snap = snap.withColumn("in_nifty500", F.col("industry").isNotNull())
eligible = (F.col("n") >= 252) & (F.col("avg_value_3m") >= min_value) & (F.col("in_nifty500") if (universe == "nifty500" and has500) else F.lit(True))
snap = snap.withColumn("eligible", eligible)
U = W.partitionBy("eligible")
pr = lambda col: F.percent_rank().over(U.orderBy(F.col(col).asc_nulls_first()))
s = snap.withColumn("dist200", F.col("adj_close") / F.col("sma200"))
s = (s.withColumn("p_dist200", pr("dist200"))
      .withColumn("trend_raw", 25 * (F.col("adj_close") > F.col("sma50")).cast("int") + 25 * (F.col("adj_close") > F.col("sma200")).cast("int")
                  + 25 * (F.col("sma50") > F.col("sma200")).cast("int") + 25 * (F.col("sma200") > F.col("sma200_prev")).cast("int"))
      .withColumn("trend_score", 0.5 * F.col("trend_raw") + 50 * F.col("p_dist200"))
      .withColumn("mom", (pr("ret_3m") + pr("ret_6m") + pr("ret_1y")) / 3))
s = (s.withColumn("p_mom", pr("mom"))
      .withColumn("momentum_score", F.greatest(F.lit(0.0), 100 * F.col("p_mom") - F.when(F.col("rsi_14") > 80, 10).otherwise(0)))
      .withColumn("neg_dd", -F.col("max_drawdown_1y"))
      .withColumn("risk", (pr("volatility_1y") + pr("neg_dd") + pr("beta_1y")) / 3))
s = (s.withColumn("low_risk_score", 100 * (1 - pr("risk")))
      .withColumn("liquidity_score", 100 * pr("avg_value_3m"))
      .withColumn("delivery_score", 100 * pr("delivery_1m")))
score = 0.3 * F.col("trend_score") + 0.3 * F.col("momentum_score") + 0.2 * F.col("low_risk_score") + 0.1 * F.col("liquidity_score") + 0.1 * F.col("delivery_score")
s = (s.withColumn("score", F.when(F.col("eligible"), F.round(score, 0)))
      .withColumn("band", F.when(F.col("score") >= 75, "Strong").when(F.col("score") >= 60, "Good").when(F.col("score") >= 40, "Neutral")
                  .when(F.col("score").isNotNull(), "Weak"))
      .withColumn("rank", F.when(F.col("eligible"), F.row_number().over(U.orderBy(F.col("score").desc_nulls_last())))))
for k in ("trend_score", "momentum_score", "low_risk_score", "liquidity_score", "delivery_score"):
    s = s.withColumn(k, F.when(F.col("eligible"), F.round(k, 0)))
out = s.select("trade_date", "symbol", "company", "industry", "isin", "in_nifty500", "eligible", "rank", "score", "band",
               "trend_score", "momentum_score", "low_risk_score", "liquidity_score", "delivery_score",
               F.col("adj_close").alias("close"), "ret_1d", "ret_1w", "ret_1m", "ret_3m", "ret_6m", "ret_1y", "ret_3y",
               "sma50", "sma200", "rsi_14", "volatility_1y", "beta_1y", "max_drawdown_1y", "high_52w", "low_52w",
               (F.col("adj_close") / F.col("high_52w") - 1).alias("from_52w_high"),
               (F.col("avg_value_3m") / 1e7).alias("avg_value_cr"), "delivery_1m", "n")
ml.save(spark, out, "market.stock_scores", mode="overwrite")
ml.log(f"market.stock_scores: {out.count()} stocks, {out.where('eligible').count()} scored")
# %%
# market summary tables for the dashboards
uni = spark.table("market.stock_scores").where("eligible")
ml.save(spark, uni.where(F.col("industry").isNotNull()).groupBy("industry").agg(
    F.count("*").alias("stocks"), F.round(F.expr("percentile_approx(ret_1m, 0.5)") * 100, 2).alias("ret_1m_pct"),
    F.round(F.expr("percentile_approx(ret_1y, 0.5)") * 100, 2).alias("ret_1y_pct"), F.round(F.avg("score"), 0).alias("avg_score")),
    "market.sector_returns", mode="overwrite")
elig = uni.select("symbol")
br = (sp.join(elig, "symbol").where("days_back <= 400").groupBy("trade_date", "days_back").agg(
        F.sum(F.when(F.col("ret_1d") > 0, 1).otherwise(0)).alias("advancing"),
        F.sum(F.when(F.col("ret_1d") < 0, 1).otherwise(0)).alias("declining"),
        F.round(100 * F.avg(F.when(F.col("sma200").isNotNull(), (F.col("adj_close") > F.col("sma200")).cast("int"))), 1).alias("pct_above_200dma")))
ml.save(spark, br, "market.breadth", mode="overwrite")
iw = W.partitionBy("index_name").orderBy("trade_date")
ix = (spark.table("market_raw.nse_indices").withColumn("index_name", F.upper(F.trim("index_name")))
      .withColumn("sma50", F.avg("close").over(iw.rowsBetween(-49, 0))).withColumn("sma200", F.avg("close").over(iw.rowsBetween(-199, 0)))
      .withColumn("ret_1y", F.col("close") / F.lag("close", 252).over(iw) - 1)
      .withColumn("days_back", F.datediff(F.lit(latest), F.col("trade_date"))))
ml.save(spark, ix, "market.index_prices", mode="overwrite")
ml.save(spark, spark.table("market.index_prices").where("days_back = 0"), "market.index_latest", mode="overwrite")
display(spark.sql("SELECT rank, symbol, company, industry, score, band, round(ret_1y*100,1) AS ret_1y_pct FROM market.stock_scores WHERE eligible ORDER BY rank LIMIT 20"))
