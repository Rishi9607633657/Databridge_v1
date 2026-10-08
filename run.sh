#!/usr/bin/env bash
# Start Stratum (reads .env). Open http://localhost:8800
set -e
cd "$(dirname "$0")"
[ -f .env ] || cp .env.example .env
python -m backend.main
