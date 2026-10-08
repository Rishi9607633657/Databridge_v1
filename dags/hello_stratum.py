from datetime import datetime

from airflow.sdk import DAG
from airflow.providers.standard.operators.bash import BashOperator

with DAG(
    dag_id="hello_stratum",
    schedule=None,
    start_date=datetime(2026, 9, 1),
    catchup=False,
    tags=["demo"],
) as dag:
    extract = BashOperator(task_id="extract", bash_command="echo extracting; sleep 5")
    transform = BashOperator(task_id="transform", bash_command="echo transforming; sleep 5")
    load = BashOperator(task_id="load", bash_command="echo loading; sleep 5")
    extract >> transform >> load