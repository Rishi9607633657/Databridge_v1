"""Demo seeding: copy sample notebooks into Shared/DataBridge Demo and create sample tables (demo.sales, demo.sales_daily)."""
import asyncio
import logging
import os
import shutil
from pathlib import Path

from .kernels import SqlError, run_sql
from .workspace import ROOT

log = logging.getLogger("databridge")
SAMPLES = Path(__file__).resolve().parent.parent / "samples" / "demo"

SALES_SQL = """SELECT id AS order_id,
  date_add(current_date(), -CAST(120 - id % 120 AS INT)) AS order_date,
  element_at(array('North','South','East','West'), CAST(id % 4 AS INT) + 1) AS region,
  element_at(array('Online','Store','Phone'), CAST((id / 4) % 3 AS INT) + 1) AS channel,
  element_at(array('Grocery','Dairy','Snacks','Beverages','Household'), CAST((id * 7) % 5 AS INT) + 1) AS category,
  CAST(id % 900 + 1 AS INT) AS customer_id,
  CAST(id % 5 + 1 AS INT) AS quantity,
  ROUND(40 + (id * 37) % 460, 2) AS unit_price,
  ROUND(CASE WHEN id % 6 = 0 THEN (40 + (id * 37) % 460) * 0.1 ELSE 0 END, 2) AS discount,
  ROUND((id % 5 + 1) * (40 + (id * 37) % 460) - CASE WHEN id % 6 = 0 THEN (40 + (id * 37) % 460) * 0.1 ELSE 0 END, 2) AS net_sales
FROM range(6000)"""

DAILY_SQL = """SELECT order_date, region, channel, category, ROUND(SUM(net_sales), 2) AS net_sales, COUNT(*) AS orders,
  ROUND(SUM(discount), 2) AS discount, ROUND(SUM(net_sales) * 0.68, 2) AS cost
FROM demo.sales GROUP BY order_date, region, channel, category"""


def seed_files():
    dest = ROOT / "Shared" / "DataBridge Demo"
    dest.mkdir(parents=True, exist_ok=True)
    for f in SAMPLES.glob("*.ipynb"):
        if not (dest / f.name).exists():
            shutil.copy2(f, dest / f.name)


async def _exists(t):
    try:
        await run_sql(f"SELECT 1 FROM {t} LIMIT 1", 1)
        return True
    except SqlError:
        return False


async def seed_tables():
    try:
        await run_sql("CREATE DATABASE IF NOT EXISTS demo", 1)
        for name, sql in (("demo.sales", SALES_SQL), ("demo.sales_daily", DAILY_SQL)):
            if await _exists(name):
                continue
            try:
                await run_sql(f"CREATE TABLE {name} USING DELTA AS {sql}", 1)
            except SqlError:
                await run_sql(f"CREATE TABLE {name} USING PARQUET AS {sql}", 1)
            log.info("demo table %s created", name)
    except Exception as e:  # noqa: BLE001
        log.warning("demo tables not created: %s", e)


def start():
    if os.getenv("DEMO_SEED", "true").lower() == "false":
        return
    try:
        seed_files()
    except Exception as e:  # noqa: BLE001
        log.warning("demo notebooks not copied: %s", e)
    asyncio.get_event_loop().create_task(seed_tables())
