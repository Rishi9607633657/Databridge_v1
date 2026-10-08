# Spark start-up for the DataBridge Windows installer (offline).
# Runs in every kernel. Uses the jars bundled at build time (no internet / Ivy downloads), keeps all
# temporary files inside the user's data folder, and connects to the bundled PostgreSQL metastore.
import builtins
import json
import os
import subprocess
import sys
from pathlib import Path

_DATA = Path(os.environ.get("DATABRIDGE_DATA") or os.getcwd())
_JARS = Path(os.environ.get("DATABRIDGE_JARS_DIR") or (Path(os.environ.get("STRATUM_ROOT", ".")) / "jars"))


def _read(name, default=None):
    f = os.getenv(name + "_FILE")
    if f:
        p = Path(f) if Path(f).is_absolute() else _DATA / f
        if p.exists():
            return p.read_text().strip()
    return os.getenv(name) or default


try:
    import pyspark
    from pyspark.sql import SparkSession, functions as F, types as T  # noqa: F401
except ImportError:
    print("pyspark not installed - kernel runs as plain Python.")
else:
    os.environ.pop("SPARK_HOME", None)                       # always use the bundled pyspark
    os.environ.setdefault("PYSPARK_PYTHON", sys.executable)
    os.environ.setdefault("PYSPARK_DRIVER_PYTHON", sys.executable)
    _tmp = _DATA / "tmp"
    _scratch = _tmp / "hive"
    for d in (_tmp / "spark", _scratch, _DATA / "workspace" / "spark-warehouse"):
        d.mkdir(parents=True, exist_ok=True)
    if os.name == "nt":
        _hh = os.environ.get("HADOOP_HOME", "")
        _winutils = Path(_hh) / "bin" / "winutils.exe"
        if _winutils.exists():                               # Hive needs a writable scratch dir
            subprocess.run([str(_winutils), "chmod", "-R", "777", str(_scratch)],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False,
                           creationflags=0x08000000)         # CREATE_NO_WINDOW

    jars = sorted(str(p) for p in _JARS.glob("*.jar"))
    if not jars:
        print(f"WARNING: no bundled jars found in {_JARS} - Delta Lake and the metastore will not work.")
    tz = _read("SPARK_TIMEZONE", "Asia/Kolkata")
    _b = (SparkSession.builder
          .appName(_read("SPARK_APP_NAME", "databridge"))
          .master(_read("SPARK_MASTER", "local[*]"))
          .config("spark.driver.host", _read("SPARK_DRIVER_HOST", "127.0.0.1"))
          .config("spark.driver.bindAddress", "127.0.0.1")
          .config("spark.ui.showConsoleProgress", "false")
          .config("spark.local.dir", (_tmp / "spark").as_posix())
          .config("spark.driver.extraJavaOptions", f"-Duser.timezone={tz} -Djava.io.tmpdir={(_tmp / 'spark').as_posix()}")
          .config("spark.executor.extraJavaOptions", f"-Duser.timezone={tz}")
          .config("spark.sql.session.timeZone", tz)
          .config("spark.sql.shuffle.partitions", _read("SPARK_SHUFFLE_PARTITIONS", "8"))
          .config("spark.databricks.delta.snapshotPartitions", "2")
          .config("spark.sql.warehouse.dir", (_DATA / "workspace" / "spark-warehouse").as_uri())
          .config("spark.sql.sources.default", "delta")
          .config("spark.sql.legacy.createHiveTableByDefault", "false")
          .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
          .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
          .config("spark.jars", ",".join(Path(j).as_uri() for j in jars))
          .config("spark.driver.extraClassPath", os.pathsep.join(jars))
          .config("spark.executor.extraClassPath", os.pathsep.join(jars))
          .config("spark.jars.ivy", (_tmp / "ivy").as_posix()))

    _acct, _key = _read("ADLS_ACCOUNT"), _read("ADLS_KEY")
    if _acct and _key:
        _b = _b.config(f"spark.hadoop.fs.azure.account.key.{_acct}.dfs.core.windows.net", _key)

    _hms = _read("HMS_JDBC_URL")
    if _hms:
        _b = (_b.enableHiveSupport()
              .config("spark.sql.catalogImplementation", "hive")
              .config("spark.hadoop.hive.exec.scratchdir", _scratch.as_uri())
              .config("spark.hadoop.hive.exec.local.scratchdir", _scratch.as_posix())
              .config("spark.hadoop.javax.jdo.option.ConnectionURL", _hms)
              .config("spark.hadoop.javax.jdo.option.ConnectionDriverName", "org.postgresql.Driver")
              .config("spark.hadoop.javax.jdo.option.ConnectionUserName", _read("HMS_USER", ""))
              .config("spark.hadoop.javax.jdo.option.ConnectionPassword", _read("HMS_PASSWORD", ""))
              .config("spark.hadoop.datanucleus.schema.autoCreateAll", _read("HMS_AUTO_CREATE", "false"))
              .config("spark.hadoop.datanucleus.connectionPool.maxPoolSize", "3")
              .config("spark.hadoop.datanucleus.connectionPool.minPoolSize", "0")
              .config("spark.hadoop.hive.metastore.schema.verification", "false"))
    else:
        _b = _b.config("spark.sql.catalogImplementation", "in-memory")

    for _k, _v in json.loads(os.getenv("STRATUM_SPARK_CONF") or "{}").items():
        _b = _b.config(_k, str(_v))

    spark = _b.getOrCreate()
    spark.sparkContext.setLogLevel("ERROR")
    BASE_PATH = _read("BASE_PATH", "")
    builtins.spark, builtins.BASE_PATH, builtins.F = spark, BASE_PATH, F
    print(f"Spark {spark.version} ready - master={spark.sparkContext.master} - "
          f"catalog={'hive' if _hms else 'in-memory'} - {len(jars)} bundled jars")
