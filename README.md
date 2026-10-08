# Stratum — lakehouse workspace

Notebooks, catalog, SQL, workflows and compute in one UI, on top of Spark + Delta + Hive Metastore + Airflow + Spark Operator on Kubernetes.

## Quick start (local, Windows or Linux)

Requires Python 3.10+ and Java 17 (for Spark).

```bash
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
# edit .env, put credentials in ./secrets/
run.bat                     # or ./run.sh
```
Open http://localhost:8800

## Configuration (.env)

Any variable can also be read from a file with `VAR_FILE=./secrets/...`, so secrets stay out of `.env`.

| Area | Variables |
|---|---|
| Server | `STRATUM_HOST`, `STRATUM_PORT`, `STRATUM_WORKSPACE` (where notebooks are stored) |
| Notebooks | `KERNEL_NAME`, `SPARK_AUTO_INIT`, `SPARK_INIT_FILE`, `SQL_ROW_LIMIT` |
| Spark session | `SPARK_MASTER`, `BASE_PATH`, `ADLS_ACCOUNT`, `ADLS_KEY_FILE`, `HMS_JDBC_URL`, `HMS_USER`, `HMS_PASSWORD_FILE` |
| Catalog | `CATALOG_BACKEND` = `metastore` (reads Hive Metastore Postgres directly, fast) or `spark` (SHOW/DESCRIBE); `METASTORE_DSN` |
| Workflows | `AIRFLOW_URL`, `AIRFLOW_API_VERSION` (`v2` = Airflow 3.x, `v1` = Airflow 2.x), `AIRFLOW_USER`, `AIRFLOW_PASSWORD_FILE` |
| Compute | `K8S_ENABLED`, `SPARK_NAMESPACE` (uses in-cluster config, else `~/.kube/config`) |

`config/spark_init.py` runs in every new kernel. It builds the Spark session (Delta + external Hive Metastore on PostgreSQL + ADLS key)
and exposes `spark`, `F`, `BASE_PATH` as builtins, so Databricks-style code such as `init_refs(spark)` works unchanged. Edit it for your cluster.
When pointing at a real cluster, set `SPARK_MASTER` (e.g. `k8s://https://<aks-api>:443`) and add the matching Spark K8s configs there.

## Features

- **Workspace / Notebooks** — folders and `.ipynb` notebooks; one Jupyter kernel per notebook with live-streamed output (WebSocket);
  Shift+Enter run & advance, Ctrl+Enter run, Run all (stops on error), interrupt, restart, clear outputs, markdown cells,
  move/insert/delete cells, HTML/image/traceback outputs, autosave every 30 s and Ctrl+S.
- **Catalog** — schemas and tables from the Hive Metastore; columns (incl. Spark/Delta schemas stored in table params), partitions,
  details, sample data, Delta history, DDL, create schema, drop table, "Query" into the SQL editor.
- **SQL Editor** — Spark SQL, multi-statement, run selection, row limit, cancel, CSV download, history, schema browser.
- **Workflows** — Airflow DAGs with recent-run strip, pause/unpause, Run now / Run with config (JSON), task graph coloured by state,
  task logs, Repair run (clear failed tasks), auto-refresh while running.
- **Compute** — notebook kernels (interrupt/restart/shut down) and Spark Operator `SparkApplication`s (state, executors, autoscaling,
  driver log, delete).
- **Search** (Ctrl+K) across notebooks and tables.

## Layout

```
backend/   FastAPI app: main.py (routes), kernels.py (Jupyter kernels + SQL runner), workspace.py (notebooks),
           catalog.py (metastore/Spark), airflow.py (Airflow REST), compute.py (Spark Operator), settings.py
frontend/  index.html, styles.css, app.js (no build step), vendor/ (CodeMirror, marked, DOMPurify — no CDN needed)
config/    spark_init.py
secrets/   credential files (git-ignored)
workspace/ notebooks (git-ignored)
```

## Docker / AKS

```bash
docker build -t <acr>.azurecr.io/stratum:latest .
docker run -p 8800:8800 --env-file .env -v $PWD/workspace:/app/workspace -v $PWD/secrets:/app/secrets <image>
```
On AKS: mount `workspace` on a PersistentVolume, secrets from a Kubernetes Secret, set `K8S_ENABLED=true`,
and give the pod's service account `get/list/delete` on `sparkapplications` and `get` on `pods/log` in `SPARK_NAMESPACE`.

## Security

There is no login yet and notebooks execute arbitrary code on the server. Run it behind an authenticated ingress
(e.g. oauth2-proxy with Entra ID) or on a private network only.

## Notes

- Kernels are in memory: restarting the server stops them (notebook files are safe on disk).
- The SQL editor splits statements on `;`, so avoid `;` inside string literals.
- Tested end to end with PySpark 3.5 (Spark catalog mode) and the Airflow v2 API; the direct-Postgres metastore reader targets the standard Hive 2.3/3.x schema.
