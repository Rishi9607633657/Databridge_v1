# %% [md]
# # 02 · Ingest mutual fund NAVs (AMFI)
# First run: NAV history for every scheme since `MARKETS_START_DATE`, in 90-day pieces (AMFI's limit).
# After that: the daily `NAVAll.txt`. Only growth options are kept (IDCW / dividend options are skipped) — that is what SIP returns need.
# %%
import os, sys, datetime as dt
sys.path.insert(0, os.environ.get("STRATUM_ROOT", ".."))
from backend.markets_pack import market_lib as ml

NAV = "market_raw.amfi_nav"
last = ml.max_date(spark, NAV, "nav_date")
today = dt.date.today()
added = 0
if last is None or (today - last).days > 5:
    frm = (last + dt.timedelta(days=1)) if last else ml.start_date()
    while frm <= today:
        to = min(frm + dt.timedelta(days=89), today)
        df = ml.amfi_history(frm, to)
        if df is not None and len(df):
            ml.save(spark, df, NAV)
            added += len(df)
        ml.log(f"{frm} → {to}: {0 if df is None else len(df):,} NAV rows")
        frm = to + dt.timedelta(days=1)
else:
    df = ml.amfi_latest()
    if df is not None:
        df = df[df["nav_date"] > last]
        if len(df):
            ml.save(spark, df, NAV)
            added = len(df)
ml.log(f"Done: {added:,} NAV rows added (last loaded before: {last})")
# %%
display(spark.sql(f"SELECT nav_date, count(*) AS schemes FROM {NAV} GROUP BY nav_date ORDER BY nav_date DESC LIMIT 10"))
