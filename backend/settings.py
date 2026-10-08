"""Environment-driven settings. Any VAR can also be supplied as VAR_FILE=<path> (read from a file)."""
import os
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent          # program files (code)
# User data (.env, workspace, job history, revisions). Separate from the code in the Windows installer;
# defaults to the project folder so development setups keep working unchanged.
DATA_ROOT = Path(os.environ.get("DATABRIDGE_DATA") or ROOT).resolve()
DATA_ROOT.mkdir(parents=True, exist_ok=True)
load_dotenv(DATA_ROOT / ".env")


def env(name: str, default: str | None = None) -> str | None:
    file_path = os.getenv(f"{name}_FILE")
    if file_path:
        p = Path(file_path)
        if not p.is_absolute():
            p = DATA_ROOT / p
        if p.exists():
            return p.read_text(encoding="utf-8").strip()
    val = os.getenv(name)
    return val if val not in (None, "") else default


def _path(name: str, default: str, base: Path | None = None) -> Path:
    p = Path(env(name, default))
    return (p if p.is_absolute() else (base or DATA_ROOT) / p).resolve()


class Settings:
    host = env("STRATUM_HOST", "0.0.0.0")
    port = int(env("STRATUM_PORT", "8800"))
    workspace = _path("STRATUM_WORKSPACE", "./workspace")

    kernel_name = env("KERNEL_NAME", "python3")
    spark_auto_init = env("SPARK_AUTO_INIT", "true").lower() == "true"
    spark_init_file = _path("SPARK_INIT_FILE", "./config/spark_init.py", ROOT)
    runtime_file = _path("NOTEBOOK_RUNTIME_FILE", "./config/notebook_runtime.py", ROOT)
    bundled = env("DATABRIDGE_BUNDLED", "false").lower() == "true"     # running from the Windows installer
    sql_row_limit = int(env("SQL_ROW_LIMIT", "1000"))

    metastore_dsn = env("METASTORE_DSN")
    catalog_backend = env("CATALOG_BACKEND", "metastore" if env("METASTORE_DSN") else "spark")

    airflow_url = (env("AIRFLOW_URL") or "").rstrip("/")
    airflow_api = env("AIRFLOW_API_VERSION", "v2")
    airflow_user = env("AIRFLOW_USER", "admin")
    airflow_password = env("AIRFLOW_PASSWORD", "")

    k8s_enabled = env("K8S_ENABLED", "false").lower() == "true"
    spark_namespace = env("SPARK_NAMESPACE", "spark")


settings = Settings()
settings.workspace.mkdir(parents=True, exist_ok=True)
