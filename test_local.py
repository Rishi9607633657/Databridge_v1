"""
test_local.py  -  test the dynamic DAG factory on your machine. NO Kubernetes / Spark needed.

Put this file NEXT TO the dags folder (not inside it):
    ProjectPOC/
    ├── dags/
    │   ├── dynamic_dag_factory.py
    │   ├── spark_app.yaml
    │   └── job_setting/domain.yaml
    └── test_local.py          <- this file

Run (Airflow must be installed - easiest inside your local Airflow Docker container):
    python test_local.py
    # or in Docker:
    docker cp test_local.py <airflow-container>:/opt/airflow/test_local.py
    docker exec -it <airflow-container> python /opt/airflow/test_local.py
    # other dags path:  DAGS_DIR=/opt/airflow/dags python test_local.py

What it does:
    1. creates a small dev Excel (dags/pipeline_config_dev.xlsx) if it is missing
    2. loads the DAGs exactly like Airflow does and prints them
    3. simulates 3 runs of one DAG:  scheduled  /  manual trigger with UI change  /  backfill
    4. instead of sending to Spark, writes each filled SparkApplication YAML to ./test_output/
"""

import copy                                                     # copy DAG params for a fake run
import logging                                                  # hide Airflow log noise
import tempfile                                                 # OS temp folder
import os                                                       # env vars
import sys                                                      # import path
from datetime import datetime, timezone                         # fake run time window
from pathlib import Path                                        # file paths

# ---------------------------------------------------------------- 1. settings
ROOT = Path(__file__).resolve().parent                          # ProjectPOC/
DAGS_DIR = Path(os.getenv("DAGS_DIR", ROOT / "dags"))           # where the factory lives
EXCEL = DAGS_DIR / "pipeline_config_dev.xlsx"                   # dev config file
OUT_DIR = ROOT / "test_output"                                  # rendered YAMLs go here
TEST_DAG = "T001__BE01__toast"                                  # DAG we simulate runs for

os.environ["PIPELINE_ENV"] = "dev"                              # read Excel, not Postgres
os.environ["PIPELINE_CONFIG_EXCEL"] = str(EXCEL)                # which Excel
sys.path.insert(0, str(DAGS_DIR))                               # so "import dynamic_dag_factory" works


# ---------------------------------------------------------------- 2. dev Excel
def create_excel():                                             # sample rows, same columns as the table
    import pandas as pd
    rows = [
        # good row: table overrides executor count/memory + one job param
        {"id": 1, "uuid": "u-1", "meta_tenant_id": "T001", "meta_business_entity_id": "BE01",
         "adaptor_id": "toast", "schedule_cron": "*/5 * * * *", "start_date": "2026-10-01",
         "parameters": '{"spark": {"executor_instances": 2, "executor_memory": "6g"}, "job": {"lookback_minutes": 15}}',
         "is_active": "true"},
        # good row: empty parameters -> everything from domain.yaml
        {"id": 2, "uuid": "u-2", "meta_tenant_id": "T002", "meta_business_entity_id": "BE07",
         "adaptor_id": "powr", "schedule_cron": "", "start_date": "2026-10-01",
         "parameters": "", "is_active": "true"},
        # bad row: adaptor not in domain.yaml -> shows as config-error DAG
        {"id": 3, "uuid": "u-3", "meta_tenant_id": "T003", "meta_business_entity_id": "BE01",
         "adaptor_id": "ncr", "schedule_cron": "", "start_date": "2026-10-01",
         "parameters": "", "is_active": "true"},
        # inactive row -> no DAG at all
        {"id": 4, "uuid": "u-4", "meta_tenant_id": "T004", "meta_business_entity_id": "BE01",
         "adaptor_id": "toast", "schedule_cron": "", "start_date": "2026-10-01",
         "parameters": "", "is_active": "false"},
    ]
    pd.DataFrame(rows).to_excel(EXCEL, index=False)             # write the sheet
    print(f"Created {EXCEL}")


if not EXCEL.exists():                                          # keep your own Excel if it already exists
    create_excel()
(Path(tempfile.gettempdir()) / "pipeline_config_cache.json").unlink(missing_ok=True)  # force fresh read


# ---------------------------------------------------------------- 3. load DAGs like Airflow
try:                                                            # Airflow 2.x
    from airflow.models import DagBag
    dagbag = DagBag(str(DAGS_DIR), include_examples=False)
except TypeError:                                               # Airflow 3.x
    from airflow.dag_processing.dagbag import DagBag
    dagbag = DagBag(str(DAGS_DIR))

print("\n=== DAGs found ===")
print("import errors:", dagbag.import_errors or "none")         # Python errors in the dags folder
for dag_id, dag in sorted(dagbag.dags.items()):
    flow = {t.task_id: sorted(t.upstream_task_ids) for t in dag.tasks}  # task -> what it waits for
    print(f"- {dag_id}  schedule={dag.schedule_interval if hasattr(dag, 'schedule_interval') else dag.schedule}")
    print(f"    tasks: {flow}")
    if "config-error" in dag.tags:                              # show why a row is broken
        print(f"    ERROR: {dag.doc_md}")

dag = dagbag.dags[TEST_DAG]                                     # DAG used for the run simulation
print(f"\n=== UI form fields of {TEST_DAG} (default = table value) ===")
for key in dag.params:
    print(f"  {key:30} = {dag.params[key]}")


# ---------------------------------------------------------------- 4. simulate runs
import dynamic_dag_factory as factory                           # the file under test
from airflow.providers.cncf.kubernetes.operators.spark_kubernetes import SparkKubernetesOperator

SparkKubernetesOperator.execute = lambda self, context: "skipped (local test)"  # don't call Kubernetes
logging.disable(logging.CRITICAL)                               # keep the output readable (Airflow 2)
try:                                                            # Airflow 3 logs through structlog
    import structlog
    structlog.configure(wrapper_class=structlog.make_filtering_bound_logger(logging.CRITICAL))
except ImportError:
    pass
OUT_DIR.mkdir(exist_ok=True)


class FakeDagRun:                                               # only what the factory reads from dag_run
    triggering_user_name = "rishi_local"


def simulate(name, ui_values, start, end):                      # one fake DAG run
    print(f"\n=== RUN: {name} ===")
    params = copy.deepcopy(dag.params)                          # start from the form defaults
    params.update(ui_values)                                    # values typed in UI / backfill conf
    params.validate()                                           # same validation Airflow does
    context = {                                                 # minimal Airflow task context
        "dag": dag,
        "params": params,
        "run_id": f"{name}__{start.isoformat()}",
        "data_interval_start": start,
        "data_interval_end": end,
        "dag_run": FakeDagRun(),
    }
    factory.save_ui_params(TEST_DAG, **context)                 # task 1: apply_ui_params
    for task in dag.tasks:                                      # Spark tasks
        if task.task_id == "apply_ui_params":
            continue
        task.execute(context)                                   # renders the YAML (Spark call is skipped)
        out_file = OUT_DIR / f"{name}__{task.task_id}.yaml"
        out_file.write_text(task.application_file)              # full YAML for you to inspect
        lines = task.application_file.splitlines()
        executor = lines.index("  executor:")                   # print the important parts only
        print(f"  {task.task_id}: {next(l.strip() for l in lines if 'arguments:' in l)[:200]}")
        print(f"      executor -> {lines[executor + 1].strip()}, {lines[executor + 3].strip()}   ({out_file.name})")


# A) scheduled run: nothing changed in UI -> table values
simulate("scheduled", {},
         datetime(2026, 10, 6, 10, 0, tzinfo=timezone.utc), datetime(2026, 10, 6, 10, 5, tzinfo=timezone.utc))

# B) manual trigger: user changed 2 fields in the form (this run only)
simulate("manual", {"spark.executor_instances": 4, "job.lookback_minutes": 60},
         datetime(2026, 10, 6, 10, 0, tzinfo=timezone.utc), datetime(2026, 10, 6, 10, 5, tzinfo=timezone.utc))

# C) backfill: Advanced Config JSON for an old window
simulate("backfill", {"spark.executor_memory": "8g", "job.full_reload": True},
         datetime(2026, 9, 1, 0, 0, tzinfo=timezone.utc), datetime(2026, 9, 1, 0, 5, tzinfo=timezone.utc))

print(f"\nDone. Full SparkApplication YAMLs are in {OUT_DIR}")
