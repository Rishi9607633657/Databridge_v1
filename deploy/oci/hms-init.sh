#!/bin/sh
# Runs once, when the metastore database is created: loads the Hive 2.3 schema (it includes the txn schema itself).
set -e
cd /hms-schema
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f hive-schema-2.3.0.postgres.sql
