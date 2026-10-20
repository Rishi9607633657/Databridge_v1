#!/usr/bin/env bash
# DataBridge on a free Oracle Cloud VM (Ubuntu 22.04/24.04, Ampere A1 or AMD) — one command:
#     bash deploy/oci/setup.sh
# Re-run it any time (after copying a new version of the code): it rebuilds and restarts, keeping all data.
set -euo pipefail
cd "$(dirname "$0")/../.."
ROOT="$(pwd)"
OCI="$ROOT/deploy/oci"
say() { printf '\n\033[1;36m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*"; }

# files copied from Windows may have CRLF line endings
sed -i 's/\r$//' "$OCI/hms-init.sh" "$OCI/setup.sh" 2>/dev/null || true

# 1. swap: Spark + Postgres on 12 GB is comfortable with a 4 GB safety net
if ! swapon --show | grep -q .; then
  say "Adding 4 GB swap"
  sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile >/dev/null && sudo swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# 2. Docker
if ! command -v docker >/dev/null; then
  say "Installing Docker"
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER" || true
fi
DC="sudo docker compose -f $OCI/docker-compose.yml --env-file $OCI/.env.oci"

# 3. folders + settings (created once, never overwritten)
mkdir -p workspace secrets jars
if [ ! -f .env ]; then
  say "Creating .env"
  cat > .env <<'ENV'
STRATUM_WORKSPACE=./workspace
KERNEL_NAME=python3
SPARK_AUTO_INIT=true
SPARK_INIT_FILE=./config/spark_init.py
SPARK_APP_NAME=databridge
SPARK_MASTER=local[2]
SQL_ROW_LIMIT=1000
AUTH_ENABLED=true
# Dora: free cloud model (a 2-core VM is too slow for a local model). Key: https://console.groq.com/keys
DORA_BASE_URL=https://api.groq.com/openai/v1
DORA_MODEL=openai/gpt-oss-120b
DORA_API_KEY=
# Hosted for customers: library connectors under ELv2 may not be offered as a service. Built-in POS connectors are always on.
CONNECTORS_LICENSES=MIT
ENV
fi
if [ ! -f "$OCI/.env.oci" ]; then
  echo "HMS_PASSWORD=$(openssl rand -hex 16)" > "$OCI/.env.oci"
  echo "SPARK_DRIVER_MEMORY=2g" >> "$OCI/.env.oci"
  chmod 600 "$OCI/.env.oci"
fi

# 4. Cloudflare Tunnel: reuse the tunnel you created on Windows (copy C:\Users\Hp\.cloudflared\<id>.json here)
CRED=$(sudo sh -c "ls '$OCI'/cloudflared/*.json 2>/dev/null" | head -1 || true)
HOST="${DATABRIDGE_HOSTNAME:-app.databridge-analytics.in}"
if [ -n "$CRED" ]; then
  ID=$(basename "$CRED" .json)
  sudo tee "$OCI/cloudflared/config.yml" >/dev/null <<CFG
tunnel: $ID
credentials-file: /etc/cloudflared/$ID.json
no-autoupdate: true
ingress:
  - hostname: $HOST
    service: http://databridge:8800
    originRequest:
      connectTimeout: 30s
  - hostname: spark.${HOST#*.}
    service: http://databridge:4040
  - service: http_status:404
CFG
  sudo chown -R 65532:65532 "$OCI/cloudflared" && sudo chmod 600 "$OCI"/cloudflared/*
else
  warn "No tunnel credentials in deploy/oci/cloudflared/ — DataBridge will run, but only on this VM (no public URL yet)."
fi

# 5. build + start the catalog database and DataBridge (first build ~5-10 min on ARM)
say "Building and starting DataBridge"
$DC up -d --build hms databridge
printf 'Waiting for DataBridge'
for i in $(seq 1 90); do
  if curl -fsS http://127.0.0.1:8800/api/auth/me >/dev/null 2>&1; then echo " up"; break; fi
  printf '.'; sleep 5
done
curl -fsS http://127.0.0.1:8800/api/auth/me >/dev/null || { echo; warn "DataBridge did not start. Logs:"; $DC logs --tail 80 databridge; exit 1; }

# 6. first admin is created HERE, before the site is public (nobody else can claim it)
if curl -fsS http://127.0.0.1:8800/api/auth/me | grep -q '"needs_setup": *true'; then
  say "Create the DataBridge super admin"
  read -rp "Username: " U
  while true; do
    read -rsp "Password (10+ chars, letters and digits): " P; echo
    read -rsp "Repeat password: " P2; echo
    [ "$P" = "$P2" ] && break; warn "Passwords differ, try again."
  done
  BODY=$(python3 -c 'import json,sys; print(json.dumps({"username": sys.argv[1], "password": sys.argv[2], "name": sys.argv[1]}))' "$U" "$P")
  curl -fsS -X POST http://127.0.0.1:8800/api/auth/setup -H 'Content-Type: application/json' -d "$BODY" >/dev/null \
    && echo "Admin '$U' created." || { warn "Could not create the admin (password rules?). Re-run setup.sh."; exit 1; }
fi

# 7. go public
if [ -n "$CRED" ]; then
  $DC up -d cloudflared
  sleep 6
  $DC logs --tail 20 cloudflared | grep -i -E "registered|error" || true
  say "DataBridge is live: https://$HOST"
else
  say "DataBridge is running on this VM: http://127.0.0.1:8800  (copy the tunnel .json into deploy/oci/cloudflared/ and re-run to go public)"
fi
echo "Logs:    $DC logs -f databridge"
echo "Restart: $DC restart databridge"
echo "Stop:    $DC down        (data is kept in Docker volumes + ./workspace)"
