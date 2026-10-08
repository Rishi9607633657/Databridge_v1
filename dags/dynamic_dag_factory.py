"""
dynamic_dag_factory.py
======================
ONE file that creates ONE Airflow DAG per active row of the pipeline config.

  prod : rows come from PostgreSQL table  public.pipeline_config
  dev  : rows come from Excel             pipeline_config_dev.xlsx  (same column names)

  job_setting/domain.yaml : what each adaptor runs (steps) + default sizing
  spark_app.yaml          : one SparkApplication template filled for every step

DAG id = <meta_tenant_id>__<meta_business_entity_id>__<adaptor_id>

schedule_time (per row, every tenant can be different) accepts:
  "*/5 * * * *"     cron                       "@daily" / "@hourly"  Airflow presets
  "02:30"           every day at 02:30         "02:30,14:30"         twice a day (same minute)
  "5m" / "15 min"   every N minutes            "1h" / "2 hours"      every N hours
  "manual"          no schedule, trigger only  empty                 domain.yaml default
Time zone per tenant: parameters {"airflow": {"timezone": "America/New_York"}}  (default UTC)

Where values come from (low -> high, later wins):
  domain.yaml defaults -> adaptor -> step -> table "parameters" -> Airflow UI params

Airflow UI params (https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/params.html):
  * Trigger form shows every Spark / Job setting, pre-filled with the table's current value.
  * Change a value  -> used for that run only.
  * Tick "save_to_table" -> the changed values are also written into the table (permanent, prod only).
  * Backfill (Trigger -> Backfill -> Advanced Config) takes the same keys,
    e.g. {"spark.executor_instances": 4, "job.lookback_minutes": 60}
  * Scheduled runs use the table (re-read when the task starts).
  * Every run gets --data_interval_start / --data_interval_end, so backfill runs process their own window.
"""

import json                                                     # parse "parameters" JSON / build args
import os                                                       # read environment variables
import re                                                       # clean names for ids / k8s
import tempfile                                                 # OS temp folder (Linux /tmp, Windows %TEMP%)
from datetime import datetime, timedelta                        # DAG start_date / retry_delay
from pathlib import Path                                        # file paths

import pendulum                                                 # time-zone aware start_date (ships with Airflow)
import yaml                                                     # read domain.yaml
from jinja2 import StrictUndefined, Template                    # fill spark_app.yaml (error if a value is missing)
from airflow.providers.cncf.kubernetes.operators.spark_kubernetes import SparkKubernetesOperator  # submits SparkApplication

try:                                                            # Airflow 3.x imports
    from airflow.sdk import DAG, Param
except ImportError:                                             # Airflow 2.x imports
    from airflow import DAG
    from airflow.models.param import Param
try:                                                            # Airflow 3.x location
    from airflow.providers.standard.operators.python import PythonOperator
except ImportError:                                             # Airflow 2.x location
    from airflow.operators.python import PythonOperator

# -----------------------------------------------------------------------------
# 0. SETTINGS  (override with env vars in the Helm values, defaults work for dev)
# -----------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent                                          # folder of this file (dags/)
ENV = os.getenv("PIPELINE_ENV", "dev").lower()                                      # "prod" -> Postgres, else Excel
PG_CONN_ID = os.getenv("PIPELINE_CONFIG_CONN_ID", "pipeline_config_db")             # Airflow connection for the config DB
PG_TABLE = os.getenv("PIPELINE_CONFIG_TABLE", "public.pipeline_config")             # config table name
EXCEL_FILE = Path(os.getenv("PIPELINE_CONFIG_EXCEL", BASE_DIR / "pipeline_config_dev.xlsx"))  # dev config file
DOMAIN_YAML = BASE_DIR / "job_setting" / "domain.yaml"                              # adaptor/step settings
SPARK_TEMPLATE = BASE_DIR / "spark_app.yaml"                                        # SparkApplication template
K8S_CONN_ID = os.getenv("SPARK_K8S_CONN_ID", "kubernetes_default")                  # Airflow connection to AKS
CACHE_FILE = Path(tempfile.gettempdir()) / "pipeline_config_cache.json"             # last good rows (used if DB is down)
UI_SECTIONS = {"spark": "Spark settings", "job": "Job parameters"}                  # parameters sections shown in the UI


# -----------------------------------------------------------------------------
# 1. READ CONFIG ROWS
# -----------------------------------------------------------------------------
def _empty(value):                                                      # True for None / NaN / blank text
    if value is None:                                                   # SQL NULL
        return True
    if isinstance(value, float) and value != value:                     # pandas NaN (NaN != NaN)
        return True
    return str(value).strip() in ("", "NaT", "None")                    # blank cell / empty date


def _first_value(raw, *columns):                                        # first non-empty column (supports old names)
    for col in columns:
        if not _empty(raw.get(col)):
            return str(raw[col]).strip()
    return None


def _clean_row(raw):                                                    # make one row clean & same shape for Postgres/Excel
    params = raw.get("parameters")                                      # dict from Postgres JSONB, text from Excel
    if _empty(params):                                                  # nothing given
        params = {}                                                     # -> empty dict
    elif isinstance(params, str):                                       # Excel gives JSON as text
        params = json.loads(params)                                     # -> dict
    active = raw.get("is_active")                                       # bool from Postgres, text from Excel
    if isinstance(active, str):                                         # Excel: "true"/"1"/"yes"
        active = active.strip().lower() in ("true", "1", "yes", "y")    # -> bool
    return {                                                            # cleaned row used everywhere below
        "uuid": "" if _empty(raw.get("uuid")) else str(raw["uuid"]),
        "tenant_id": str(raw["meta_tenant_id"]).strip(),
        "business_entity_id": str(raw["meta_business_entity_id"]).strip(),
        "adaptor_id": str(raw["adaptor_id"]).strip(),
        "schedule": _first_value(raw, "schedule_time", "schedule_cron", "scheduledTime"),  # any of these column names
        "start_date": None if _empty(raw.get("start_date")) else str(raw["start_date"])[:10],
        "parameters": params,
        "is_active": bool(active),
    }


def _pg_hook():                                                         # Postgres hook (imported only in prod)
    from airflow.providers.postgres.hooks.postgres import PostgresHook
    return PostgresHook(postgres_conn_id=PG_CONN_ID)


def read_rows():                                                        # all rows from Postgres (prod) or Excel (dev)
    try:
        if ENV == "prod":                                               # prod -> Postgres table
            df = _pg_hook().get_pandas_df(f"SELECT * FROM {PG_TABLE}")  # whole table as DataFrame
        else:                                                           # dev -> Excel sheet
            import pandas as pd                                         # imported only when needed
            df = pd.read_excel(EXCEL_FILE, dtype=str, keep_default_na=False)  # read everything as text
        rows = [_clean_row(r) for r in df.to_dict("records")]           # clean every row
        CACHE_FILE.write_text(json.dumps(rows))                         # remember last good result
        return rows
    except Exception as err:                                            # DB down / bad Excel
        print(f"[dag_factory] config read failed: {err} -> using last cache")
        return json.loads(CACHE_FILE.read_text()) if CACHE_FILE.exists() else []  # keep DAGs alive


def dag_id_of(row):                                                     # tenant__businessEntity__adaptor
    raw_id = f"{row['tenant_id']}__{row['business_entity_id']}__{row['adaptor_id']}"
    return re.sub(r"[^A-Za-z0-9_.-]", "_", raw_id)                      # only Airflow-safe characters


def find_row(dag_id):                                                   # fresh row for one DAG (used at run time)
    for row in read_rows():                                             # read table again
        if dag_id_of(row) == dag_id:                                    # matching tenant/entity/adaptor
            return row
    raise ValueError(f"No config row found for {dag_id}")               # row was deleted


# -----------------------------------------------------------------------------
# 1b. SCHEDULE  (turn any supported format into an Airflow schedule)
# -----------------------------------------------------------------------------
def parse_schedule(value):                                              # returns cron text, timedelta or None
    if value is None:                                                   # not set
        return None
    text = str(value).strip()
    lower = text.lower()
    if lower in ("manual", "none", "off"):                              # trigger only
        return None
    if text.startswith("@"):                                            # @daily, @hourly, @once ...
        return text
    if len(text.split()) == 5:                                          # cron: min hour day month weekday
        from croniter import croniter                                   # comes with Airflow
        if not croniter.is_valid(text):
            raise ValueError(f"invalid cron '{text}'")
        return text
    times = re.fullmatch(r"\s*(\d{1,2}:\d{2})(\s*,\s*\d{1,2}:\d{2})*\s*", text)  # "02:30" or "02:30,14:30"
    if times:
        pairs = [t.strip().split(":") for t in text.split(",")]          # [["02","30"], ["14","30"]]
        hours = [int(h) for h, _ in pairs]
        minutes = {int(m) for _, m in pairs}
        if len(minutes) > 1:                                            # cron can't mix minutes in one line
            raise ValueError(f"times in '{text}' must use the same minute (e.g. 02:30,14:30)")
        minute = minutes.pop()
        if minute > 59 or any(h > 23 for h in hours):
            raise ValueError(f"invalid time in '{text}'")
        return f"{minute} {','.join(str(h) for h in sorted(hours))} * * *"   # daily at those times
    every = re.fullmatch(r"(?:every\s*)?(\d+)\s*(m|min|mins|minute|minutes|h|hr|hrs|hour|hours)", lower)  # "5m", "2 hours"
    if every:
        number, unit = int(every.group(1)), every.group(2)
        if number <= 0:
            raise ValueError(f"interval must be > 0 in '{text}'")
        if unit.startswith("m"):                                        # minutes
            return f"*/{number} * * * *" if 60 % number == 0 else timedelta(minutes=number)
        return f"0 */{number} * * *" if 24 % number == 0 else timedelta(hours=number)   # hours
    raise ValueError(f"unknown schedule format '{text}' (use cron, HH:MM, 5m, 1h, @daily or manual)")


# -----------------------------------------------------------------------------
# 2. MERGE  domain.yaml + table + UI params
# -----------------------------------------------------------------------------
def build_config(row, ui_changes=None):                                 # final settings for one DAG
    domain = yaml.safe_load(DOMAIN_YAML.read_text())                    # read domain.yaml
    adaptors = {str(k): v for k, v in domain["adaptors"].items()}       # keys as text (adaptor_id is text)
    adaptor = adaptors.get(row["adaptor_id"])                           # settings of this row's adaptor
    if adaptor is None:                                                 # adaptor not configured
        raise ValueError(f"adaptor_id '{row['adaptor_id']}' not found in {DOMAIN_YAML.name}")

    defaults = domain.get("defaults", {})                               # global defaults
    table = row["parameters"]                                           # table "parameters" JSON
    ui = ui_changes or {}                                               # values changed in the UI for this run

    def yaml_part(section):                                             # YAML layers (lower priority)
        return {**defaults.get(section, {}), **adaptor.get(section, {})}

    def top_part(section):                                              # table -> UI (higher priority)
        return {**table.get(section, {}), **ui.get(section, {})}

    return {
        "dag_id": dag_id_of(row),
        "tenant_id": row["tenant_id"],
        "business_entity_id": row["business_entity_id"],
        "adaptor_id": row["adaptor_id"],
        "uuid": row["uuid"],
        "schedule": parse_schedule(row["schedule"] or adaptor.get("schedule") or defaults.get("schedule")),  # table first
        "start_date": row["start_date"] or "2026-01-01",                # table first
        "airflow": {**yaml_part("airflow"), **top_part("airflow")},     # retries, max_active_runs, ...
        "job": {**yaml_part("job"), **top_part("job")},                 # args for the PySpark script
        "spark_yaml": yaml_part("spark"),                               # spark sizing from YAML
        "spark_top": top_part("spark"),                                 # spark sizing from table/UI
        "steps": adaptor.get("steps", []),                              # steps from domain.yaml
    }


def spark_settings(cfg, step=None):                                     # spark values for one step
    step_spark = (step or {}).get("spark", {})                          # step-level sizing from YAML
    return {**cfg["spark_yaml"], **step_spark, **cfg["spark_top"]}      # YAML -> step -> table/UI


# -----------------------------------------------------------------------------
# 3. AIRFLOW UI PARAMS  (trigger form / backfill conf)
# -----------------------------------------------------------------------------
def _param_for(key, value):                                             # one form field, type from the value
    section, name = key.split(".", 1)                                   # "spark.executor_memory" -> spark, executor_memory
    if value is None:                                                   # no default -> optional text box
        schema = {"type": ["null", "string"]}
    elif isinstance(value, bool):                                       # bool before int (bool is an int in Python)
        schema = {"type": "boolean"}                                    # toggle
    elif isinstance(value, int):
        schema = {"type": "integer", "minimum": 0}                      # number box
    elif isinstance(value, float):
        schema = {"type": "number"}
    elif isinstance(value, dict):
        schema = {"type": "object"}                                     # JSON box (e.g. spark_conf)
    elif isinstance(value, list):
        schema = {"type": "array"}                                      # one value per line
    else:
        schema = {"type": "string"}                                     # text box
        if name.endswith("_memory"):                                    # spark memory like 2g / 512m
            schema["pattern"] = "^[0-9]+[mMgG]$"
    return Param(value, title=name, section=UI_SECTIONS[section],
                 description=f"Current value from table / domain.yaml. Changing it affects this run only "
                             f"(unless save_to_table is ticked).", **schema)


def build_ui_params(cfg):                                               # all form fields for one DAG
    params = {}
    for name, value in spark_settings(cfg).items():                     # Spark section
        params[f"spark.{name}"] = _param_for(f"spark.{name}", value)
    for name, value in cfg["job"].items():                              # Job section
        params[f"job.{name}"] = _param_for(f"job.{name}", value)
    params["save_to_table"] = Param(                                    # make UI change permanent
        False, type="boolean", title="Save changed values to pipeline_config table",
        description="ON: changed values are written into the table 'parameters' column (prod). "
                    "OFF: changes are for this run only.")
    return params


def ui_changes(context):                                                # what the user changed for this run
    defaults = context["dag"].params                                    # form defaults (= table at parse time)
    chosen = context["params"]                                          # values for this run (form / backfill conf)
    changes = {"spark": {}, "job": {}}                                  # same shape as table "parameters"
    for key in chosen:                                                  # every param of this run
        value = chosen[key]
        if "." not in key or value is None:                             # skip save_to_table / empty fields
            continue
        section, name = key.split(".", 1)                               # "job.lookback_minutes" -> job, lookback_minutes
        if section not in changes:                                      # unknown prefix -> ignore
            continue
        if key not in defaults or value != defaults[key]:               # new key or value differs from default
            changes[section][name] = value                              # -> user changed it
    return changes


# -----------------------------------------------------------------------------
# 4. CHECK + FILL spark_app.yaml FOR ONE STEP
# -----------------------------------------------------------------------------
def _k8s_name(text, max_len):                                           # lowercase, a-z0-9 and '-'
    clean = re.sub(r"[^a-z0-9-]", "-", text.lower())                    # replace invalid chars
    return re.sub(r"-+", "-", clean)[:max_len].strip("-")               # no double '-', cut length


def render_spark_app(cfg, step, run_args=None):                         # SparkApplication YAML text
    args = [                                                            # always-sent identity args
        "--tenant_id", cfg["tenant_id"],
        "--business_entity_id", cfg["business_entity_id"],
        "--adaptor_id", cfg["adaptor_id"],
        "--step", step["name"],
    ] + (run_args or [])                                                # run_id + data interval (at run time)
    for key, value in cfg["job"].items():                               # job params -> --key value
        if value is not None:                                           # skip empty values
            args += [f"--{key}", value if isinstance(value, str) else json.dumps(value)]

    spark = spark_settings(cfg, step)                                   # merged spark values for this step
    spark["max_executors"] = max(spark["max_executors"], spark["executor_instances"])  # max >= start count
    spark["min_executors"] = min(spark["min_executors"], spark["executor_instances"])  # min <= start count

    template = Template(SPARK_TEMPLATE.read_text(), undefined=StrictUndefined)  # fail if a value is missing
    return template.render(
        app_name=_k8s_name(f"{cfg['adaptor_id']}-{cfg['tenant_id']}-{step['name']}", 45),
        label_tenant=_k8s_name(cfg["tenant_id"], 63),                   # k8s label values max 63 chars
        label_business_entity=_k8s_name(cfg["business_entity_id"], 63),
        label_adaptor=_k8s_name(cfg["adaptor_id"], 63),
        label_step=_k8s_name(step["name"], 63),
        main_file=step["main_file"],
        args=args,
        **spark,                                                        # namespace, image, cores, memory, ...
    )


def validate(cfg):                                                      # list of problems (empty = OK)
    errors = []
    names = [s.get("name") for s in cfg["steps"]]                       # all step names
    if not names:
        errors.append(f"adaptor '{cfg['adaptor_id']}' has no steps")
    if not SPARK_TEMPLATE.exists():
        errors.append(f"template missing: {SPARK_TEMPLATE}")
    for step in cfg["steps"]:
        if not step.get("name") or not step.get("main_file"):
            errors.append(f"step needs name and main_file: {step}")
            continue                                                    # can't render without name/main_file
        for dep in step.get("depends_on", []):
            if dep not in names:
                errors.append(f"step '{step.get('name')}' depends on unknown step '{dep}'")
        if SPARK_TEMPLATE.exists():                                     # test-fill the template now,
            try:                                                        # so build_dag never fails halfway
                render_spark_app(cfg, step)
            except Exception as err:
                errors.append(f"step '{step['name']}' template error: {err}")
    try:                                                                # time zone name must exist
        pendulum.timezone(cfg["airflow"].get("timezone", "UTC"))
    except Exception:
        errors.append(f"unknown timezone '{cfg['airflow'].get('timezone')}' (use e.g. Asia/Kolkata, America/New_York)")
    try:                                                                # check table values are valid UI params
        for p in build_ui_params(cfg).values():
            p.resolve()
    except Exception as err:
        errors.append(f"invalid value in parameters: {err}")
    return errors


# -----------------------------------------------------------------------------
# 5. TASKS
# -----------------------------------------------------------------------------
def save_ui_params(config_dag_id, **context):                           # first task of every DAG
    changes = ui_changes(context)                                       # what the user changed
    if not any(changes.values()):                                       # nothing changed (scheduled run)
        print("No UI changes - using table values.")
        return
    if not context["params"].get("save_to_table"):                      # one-off change
        print(f"UI changes for THIS run only: {changes}")
        return
    if ENV != "prod":                                                   # Excel is not written back
        print(f"Dev mode: update the Excel sheet manually with {changes}")
        return
    row = find_row(config_dag_id)                                       # current table row
    new_params = dict(row["parameters"])                                # copy current parameters JSON
    for section, values in changes.items():                             # merge changed keys per section
        if values:
            new_params[section] = {**new_params.get(section, {}), **values}
    user = getattr(context["dag_run"], "triggering_user_name", None) or "airflow_ui"  # who triggered
    _pg_hook().run(                                                     # write back to the table
        f"UPDATE {PG_TABLE} SET parameters = %s::jsonb, updated_on = now(), updated_by = %s "
        f"WHERE meta_tenant_id = %s AND meta_business_entity_id = %s AND adaptor_id = %s",
        parameters=(json.dumps(new_params), user, row["tenant_id"], row["business_entity_id"], row["adaptor_id"]),
    )
    print(f"Saved to table by {user}: {new_params}")


class TenantSparkOperator(SparkKubernetesOperator):
    """Re-reads the table when it runs, then applies the UI changes of this run."""

    def __init__(self, *, config_dag_id, step, **kwargs):
        super().__init__(**kwargs)                                      # normal SparkKubernetesOperator setup
        self.config_dag_id = config_dag_id                              # which config row this task belongs to
        self.step = step                                                # step definition from domain.yaml

    def execute(self, context):
        cfg = build_config(find_row(self.config_dag_id), ui_changes(context))  # table + this run's UI changes
        run_args = ["--run_id", context["run_id"]]                      # which Airflow run started the job
        for name in ("data_interval_start", "data_interval_end"):       # time window of this run (backfill!)
            if context.get(name):
                run_args += [f"--{name}", context[name].isoformat()]
        self.application_file = render_spark_app(cfg, self.step, run_args)  # fresh SparkApplication YAML
        self.log.info("SparkApplication:\n%s", self.application_file)   # visible in task log
        return super().execute(context)                                 # submit to Spark Operator & wait


# -----------------------------------------------------------------------------
# 6. BUILD DAGS
# -----------------------------------------------------------------------------
def _fail(message):                                                     # task body of a config-error DAG
    raise ValueError(message)


def build_error_dag(dag_id, errors):                                    # bad row -> red DAG in UI, not invisible
    with DAG(dag_id=dag_id, schedule=None, start_date=datetime(2026, 1, 1),
             catchup=False, tags=["config-error"], doc_md="\n\n".join(errors)) as dag:
        PythonOperator(task_id="config_error", python_callable=_fail, op_args=["; ".join(errors)])
    return dag


def build_dag(cfg):                                                     # one DAG for one config row
    af = cfg["airflow"]                                                 # airflow settings shortcut
    with DAG(
        dag_id=cfg["dag_id"],
        schedule=cfg["schedule"],                                       # cron or None (manual only)
        start_date=pendulum.parse(cfg["start_date"], tz=af.get("timezone", "UTC")),  # schedule runs in tenant's time zone
        catchup=af["catchup"],
        max_active_runs=af["max_active_runs"],
        tags=[f"tenant:{cfg['tenant_id']}", f"entity:{cfg['business_entity_id']}", f"adaptor:{cfg['adaptor_id']}"],
        default_args={"owner": "data-eng", "retries": af["retries"],
                      "retry_delay": timedelta(minutes=af["retry_delay_min"])},
        params=build_ui_params(cfg),                                    # trigger form / backfill conf
        doc_md=f"Config row uuid `{cfg['uuid']}`. Edit the pipeline_config table, "
               f"or change values in the Trigger form (tick save_to_table to keep them).",
    ) as dag:
        save_task = PythonOperator(                                     # handles save_to_table first
            task_id="apply_ui_params",
            python_callable=save_ui_params,
            op_kwargs={"config_dag_id": cfg["dag_id"]},
        )
        tasks = {}                                                      # step name -> task
        for step in cfg["steps"]:
            tasks[step["name"]] = TenantSparkOperator(
                task_id=step["name"],
                config_dag_id=cfg["dag_id"],
                step=step,
                namespace=spark_settings(cfg, step)["namespace"],
                application_file=render_spark_app(cfg, step),           # parse-time render (checks template)
                kubernetes_conn_id=K8S_CONN_ID,
                get_logs=True,                                          # driver logs in Airflow UI
                delete_on_termination=True,                             # clean SparkApplication after run
            )
        for step in cfg["steps"]:                                       # wire dependencies
            if not step.get("depends_on"):                              # first steps run after apply_ui_params
                save_task >> tasks[step["name"]]
            for dep in step.get("depends_on", []):
                tasks[dep] >> tasks[step["name"]]
    return dag


for _row in read_rows():                                                # runs every time Airflow parses this file
    if not _row["is_active"]:                                           # is_active = false -> no DAG
        continue
    _dag_id = dag_id_of(_row)
    try:
        _cfg = build_config(_row)                                       # merge settings
        _errors = validate(_cfg)                                        # check steps/template/values
        globals()[_dag_id] = build_error_dag(_dag_id, _errors) if _errors else build_dag(_cfg)
    except Exception as _err:                                           # any bad row -> error DAG
        globals()[_dag_id] = build_error_dag(_dag_id, [repr(_err)])