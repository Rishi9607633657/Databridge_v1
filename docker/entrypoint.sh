#!/bin/bash
# One image for both roles:
#   (no args)   the DataBridge server
#   executor    a Spark executor pod started by a notebook/job kernel on Kubernetes (Spark passes "executor")
set -e
if [ "$1" = "executor" ]; then
  shift
  SPARK_HOME="${SPARK_HOME:-$(python -c 'import os, pyspark; print(os.path.dirname(pyspark.__file__))')}"
  export SPARK_HOME
  # spark.executor.extraJavaOptions arrive as SPARK_JAVA_OPT_0, _1, ...
  mapfile -t JOPTS < <(env | grep '^SPARK_JAVA_OPT_' | sort -t_ -k4 -n | sed 's/[^=]*=\(.*\)/\1/')
  CP="${SPARK_CLASSPATH:+$SPARK_CLASSPATH:}${SPARK_HOME}/jars/*"
  [ -n "$SPARK_EXTRA_CLASSPATH" ] && CP="$CP:$SPARK_EXTRA_CLASSPATH"
  [ -d /app/jars ] && CP="$CP:/app/jars/*"
  export PYSPARK_PYTHON="${PYSPARK_PYTHON:-python}"
  exec "${JAVA_HOME}/bin/java" "${JOPTS[@]}" \
    -Xms"$SPARK_EXECUTOR_MEMORY" -Xmx"$SPARK_EXECUTOR_MEMORY" \
    -cp "$CP" \
    org.apache.spark.scheduler.cluster.k8s.KubernetesExecutorBackend \
    --driver-url "$SPARK_DRIVER_URL" --executor-id "$SPARK_EXECUTOR_ID" --cores "$SPARK_EXECUTOR_CORES" \
    --app-id "$SPARK_APPLICATION_ID" --hostname "$SPARK_EXECUTOR_POD_IP" \
    --resourceProfileId "${SPARK_RESOURCE_PROFILE_ID:-0}" --podName "$SPARK_EXECUTOR_POD_NAME" "$@"
fi
if [ "$#" -gt 0 ]; then exec "$@"; fi
# Admin › Settings writes /app/.env; keep it on the persistent disk (mounted at /app/.stratum) on Kubernetes
if [ -d /app/.stratum ] && [ ! -e /app/.env ] && [ "${DATABRIDGE_PERSIST_ENV:-true}" = "true" ]; then
  touch /app/.stratum/app.env && ln -s /app/.stratum/app.env /app/.env
fi
exec python -m backend.main
