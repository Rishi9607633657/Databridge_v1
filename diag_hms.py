# Prints the real Java cause of Hive metastore errors. Run: python diag_hms.py
import os
from dotenv import load_dotenv

load_dotenv(".env")
os.environ["STRATUM_ROOT"] = os.getcwd()
exec(open("config/spark_init.py", encoding="utf-8").read())

try:
    ok = spark._jsparkSession.sharedState().externalCatalog().databaseExists("default")
    print("\nMETASTORE OK - default database exists:", ok)
    spark.sql("SHOW DATABASES").show()
except Exception as e:
    print("\n==== ROOT CAUSES ====")
    seen = set()
    for line in str(e).splitlines():
        line = line.strip()
        if (line.startswith("Caused by") or "Exception:" in line[:160]) and line not in seen:
            seen.add(line)
            print(line[:400])