from datetime import datetime

from airflow.sdk import DAG
from airflow.providers.cncf.kubernetes.operators.spark_kubernetes import SparkKubernetesOperator

default_args = {"retries": 2}

with DAG(
    dag_id="medallion_refresh",
    schedule="0 2 * * *",
    start_date=datetime(2026, 9, 1),
    catchup=False,
    default_args=default_args,
    tags=["medallion"],
    template_searchpath=["/opt/airflow/dags/repo/dags/spark_apps"],
) as dag:
    bronze = SparkKubernetesOperator(
        task_id="bronze_ingest",
        namespace="spark",
        application_file="bronze_ingest.yaml",
        get_logs=True,
        delete_on_termination=True,
    )