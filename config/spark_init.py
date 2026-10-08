# Runs automatically in every new notebook kernel, the SQL editor kernel and every job task.
# Builds a Spark session with Delta Lake (+ external Hive Metastore on PostgreSQL when HMS_JDBC_URL is set),
# reading secrets from files (see .env / secrets/). Job clusters pass extra settings via STRATUM_SPARK_CONF.
import builtins
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path

_ROOT = Path(os.getenv("STRATUM_ROOT", os.getcwd()))

# Extra Maven jars. Must go through configure_spark_with_delta_pip(extra_packages=...),
# because it overwrites spark.jars.packages.
EXTRA_PACKAGES = [
    "org.apache.hadoop:hadoop-azure:3.3.4",   # abfss:// (ADLS Gen2)
    "org.postgresql:postgresql:42.7.3",       # Hive Metastore on PostgreSQL
]

# JDBC drivers the Hive metastore client needs on the *driver JVM classpath* (not just --packages).
LOCAL_JARS = {
    "postgresql-42.7.3.jar": "https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.3/postgresql-42.7.3.jar",
}


def _read(name, default=None):
    f = os.getenv(name + "_FILE")
    if f:
        p = Path(f) if Path(f).is_absolute() else _ROOT / f
        if p.exists():
            return p.read_text().strip()
    return os.getenv(name) or default


def _ensure_local_jars():
    jar_dir = _ROOT / "jars"
    jar_dir.mkdir(parents=True, exist_ok=True)
    for name, url in LOCAL_JARS.items():
        target = jar_dir / name
        if not target.exists():
            try:
                print(f"Downloading {name} ...")
                urllib.request.urlretrieve(url, target)
            except Exception as e:  # noqa: BLE001
                print(f"WARNING: could not download {name}: {e}. Put it in {jar_dir} manually.")
    return sorted(str(p) for p in jar_dir.glob("*.jar"))


def _prepare_windows_hive_scratch():
    """Hive refuses to start on Windows unless /tmp/hive exists and is writable (via winutils)."""
    scratch = Path(r"C:\tmp\hive")
    scratch.mkdir(parents=True, exist_ok=True)
    winutils = Path(os.environ.get("HADOOP_HOME", r"C:\hadoop")) / "bin" / "winutils.exe"
    if winutils.exists():
        subprocess.run([str(winutils), "chmod", "-R", "777", str(scratch)],
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)


try:
    import pyspark
    from pyspark.sql import SparkSession, functions as F, types as T  # noqa: F401
    from delta import configure_spark_with_delta_pip
except ImportError:
    print("pyspark / delta-spark not installed - kernel runs as plain Python.")
else:
    # Use the Spark that ships with pip pyspark, not a separately installed SPARK_HOME of another version
    _sh = os.environ.get("SPARK_HOME", "")
    if _sh and pyspark.__version__ not in _sh:
        os.environ.pop("SPARK_HOME", None)
    os.environ.setdefault("PYSPARK_PYTHON", sys.executable)
    os.environ.setdefault("PYSPARK_DRIVER_PYTHON", sys.executable)
    if os.name == "nt":  # Windows needs winutils.exe + hadoop.dll
        _hh = os.environ.setdefault("HADOOP_HOME", r"C:\hadoop")
        os.environ["PATH"] = str(Path(_hh) / "bin") + os.pathsep + os.environ.get("PATH", "")

    _warehouse = (_ROOT / "workspace" / "spark-warehouse").as_posix()
    _b = (SparkSession.builder
          .appName(_read("SPARK_APP_NAME", "stratum-notebook"))
          .master(_read("SPARK_MASTER", "local[*]"))
          .config("spark.driver.host", _read("SPARK_DRIVER_HOST", "localhost"))
          .config("spark.ui.showConsoleProgress", "false")
          .config("spark.driver.extraJavaOptions", f"-Duser.timezone={_read('SPARK_TIMEZONE', 'Asia/Kolkata')}")
          .config("spark.executor.extraJavaOptions", f"-Duser.timezone={_read('SPARK_TIMEZONE', 'Asia/Kolkata')}")
          .config("spark.sql.session.timeZone", _read("SPARK_TIMEZONE", "Asia/Kolkata"))
            .config("spark.driver.extraJavaOptions", f"-Duser.timezone={_read('SPARK_TIMEZONE', 'Asia/Kolkata')}")
          .config("spark.executor.extraJavaOptions", f"-Duser.timezone={_read('SPARK_TIMEZONE', 'Asia/Kolkata')}")
          .config("spark.sql.session.timeZone", _read("SPARK_TIMEZONE", "Asia/Kolkata"))
          .config("spark.sql.warehouse.dir", _warehouse)
          .config("spark.sql.sources.default", "delta")
          .config("spark.sql.legacy.createHiveTableByDefault", "false")
          .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
          .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog"))

    _acct, _key = _read("ADLS_ACCOUNT"), _read("ADLS_KEY")
    if _acct and _key:
        _b = _b.config(f"spark.hadoop.fs.azure.account.key.{_acct}.dfs.core.windows.net", _key)

    _hms = _read("HMS_JDBC_URL")
    if _hms:
        if os.name == "nt":
            _prepare_windows_hive_scratch()
        _b = (_b.enableHiveSupport()
              .config("spark.sql.catalogImplementation", "hive")
              .config("spark.hadoop.javax.jdo.option.ConnectionURL", _hms)
              .config("spark.hadoop.javax.jdo.option.ConnectionDriverName", "org.postgresql.Driver")
              .config("spark.hadoop.javax.jdo.option.ConnectionUserName", _read("HMS_USER", ""))
              .config("spark.hadoop.javax.jdo.option.ConnectionPassword", _read("HMS_PASSWORD", ""))
              .config("spark.hadoop.datanucleus.schema.autoCreateAll", _read("HMS_AUTO_CREATE", "false"))
            .config("spark.hadoop.hive.metastore.schema.verification", "false")
              .config("spark.hadoop.datanucleus.connectionPool.maxPoolSize", "3")
              .config("spark.hadoop.datanucleus.connectionPool.minPoolSize", "0"))
    else:
        _b = _b.config("spark.sql.catalogImplementation", "in-memory")

    # Local jars (JDBC drivers) on the driver/executor classpath - required by the Hive metastore client
    _jars = _ensure_local_jars()
    if _jars:
        _b = (_b.config("spark.driver.extraClassPath", os.pathsep.join(_jars))
                .config("spark.executor.extraClassPath", os.pathsep.join(_jars))
                .config("spark.jars", ",".join(Path(j).as_uri() for j in _jars)))

    # Job cluster settings (driver/executor sizing, autoscaling, extra conf) from the job definition
    for _k, _v in json.loads(os.getenv("STRATUM_SPARK_CONF") or "{}").items():
        _b = _b.config(_k, str(_v))

    spark = configure_spark_with_delta_pip(_b, extra_packages=EXTRA_PACKAGES).getOrCreate()
    BASE_PATH = _read("BASE_PATH", "")
    # Databricks-style globals so existing code (e.g. init_refs(spark)) keeps working
    builtins.spark, builtins.BASE_PATH, builtins.F = spark, BASE_PATH, F
    print(f"Spark {spark.version} ready - master={spark.sparkContext.master} - "
          f"catalog={'hive' if _hms else 'in-memory'}")
