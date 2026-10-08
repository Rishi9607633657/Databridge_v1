import os
from dotenv import load_dotenv
load_dotenv(".env")
os.environ["STRATUM_ROOT"] = os.getcwd()
print("HMS_JDBC_URL =", os.getenv("HMS_JDBC_URL"), "| HMS_USER =", os.getenv("HMS_USER"),
      "| password set:", bool(os.getenv("HMS_PASSWORD") or os.getenv("HMS_PASSWORD_FILE")),
      "| HMS_AUTO_CREATE =", os.getenv("HMS_AUTO_CREATE"))
exec(open("config/spark_init.py", encoding="utf-8").read())
from py4j.protocol import Py4JJavaError
try:
    spark._jsparkSession.sharedState().externalCatalog().databaseExists("default")
    print("\nMETASTORE OK")
except Py4JJavaError as e:
    print("\n==== JAVA CAUSE CHAIN ====")
    t, seen = e.java_exception, 0
    while t is not None and seen < 15:
        print("-", t.getClass().getName(), ":", str(t.getMessage())[:300])
        t, seen = t.getCause(), seen + 1
