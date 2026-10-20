# DataBridge image — runs on x86_64 and on ARM (Oracle Cloud Ampere A1, Raspberry Pi 5, Apple Silicon).
# The same image is the server and, on Kubernetes, the Spark executor pods (docker/entrypoint.sh picks the role),
# so notebooks and executors always have the same Python, pyspark and libraries.
FROM python:3.11-slim-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jre-headless procps git curl \
    && rm -rf /var/lib/apt/lists/* \
    && ln -s "/usr/lib/jvm/java-17-openjdk-$(dpkg --print-architecture)" /usr/lib/jvm/java-17
ENV JAVA_HOME=/usr/lib/jvm/java-17 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend backend
COPY frontend frontend
COPY config config
# update.ps1 never overwrites your local spark_init.py, so release zips ship the current one as spark_init.latest.py
RUN if [ -f config/spark_init.latest.py ]; then mv config/spark_init.latest.py config/spark_init.py; fi
COPY hms-schema hms-schema
COPY docker/entrypoint.sh /usr/local/bin/databridge-entrypoint
RUN chmod +x /usr/local/bin/databridge-entrypoint && mkdir -p /app/workspace /app/secrets /app/jars /app/.stratum
ENV STRATUM_ROOT=/app STRATUM_HOST=0.0.0.0 STRATUM_PORT=8800
EXPOSE 8800
ENTRYPOINT ["databridge-entrypoint"]
