# Deploy DataBridge with Cloudflare

DataBridge is a Python + Spark server, so it can't run *on* Cloudflare Workers/Pages. Cloudflare **Tunnel** puts it on
your domain with HTTPS while it runs on your own machine, VM or server: no open ports, no public IP, free.

```
Browser ──https──> Cloudflare (your-domain) ──tunnel──> cloudflared ──> DataBridge :8800 (your PC / VM)
```

## Option A — Docker (server or VM, recommended)
1. Cloudflare dashboard → **Zero Trust → Networks → Tunnels → Create a tunnel → Cloudflared**, name it `databridge`, copy the **token**.
2. In the tunnel → **Public hostname → Add**: Subdomain `databridge`, Domain `yourdomain.com`, Service **HTTP** `databridge:8800`.
3. On the server (DataBridge folder must have a `.env` — `cp .env.example .env` if not):
   ```bash
   cd deploy/cloudflare
   cp .env.cloudflare.example .env.cloudflare      # paste TUNNEL_TOKEN
   docker compose --env-file .env.cloudflare up -d --build
   docker compose logs -f cloudflared             # "Registered tunnel connection" = live
   ```
4. Open `https://databridge.yourdomain.com`. On first start DataBridge asks you to create the admin.

## Option B — Windows PC, no Docker (DataBridge started with `.\run.bat`)
```powershell
cd deploy\cloudflare
.\start-tunnel.ps1 -Quick                    # test now: prints https://<random>.trycloudflare.com
.\start-tunnel.ps1 -Token <TUNNEL_TOKEN>     # Admin PowerShell: permanent, runs as a Windows service
```
For `-Token`, set the Public hostname service to **HTTP** `localhost:8800`. Also add `FORWARDED_ALLOW_IPS=127.0.0.1` to `.env` (that's the default).

## Lock it down (do this before sharing the link)
- **Sign-in stays on** (`AUTH_ENABLED=true`). Create users in Admin › Users; give demo users the **viewer** role.
- **Cloudflare Access (free up to 50 users):** Zero Trust → Access → Applications → Add → Self-hosted → `databridge.yourdomain.com`,
  policy *Allow* → *Emails* (or *Emails ending in* `@yourcompany.com`). People get a one-time code by email before they even see DataBridge.
- **Sync webhooks** (`/api/datahub/hooks/...`) must skip Access: add a second Access application for path `databridge.yourdomain.com/api/datahub/hooks/*` with policy **Bypass → Everyone**. The long token in the URL is the secret.
- Don't expose secrets: keep keys in `secrets/` or Admin › Settings, not in notebooks.

## Cloudflare limits that matter
| Limit (free plan) | Effect on DataBridge | What to do |
|---|---|---|
| 100 s per HTTP request (error **524**) | A very slow SQL query or AI call through the browser can time out | Use the DuckDB dashboard engine (default), LIMIT big queries, run heavy work as Jobs |
| 100 MB per upload | Data Hub › Import file larger than 100 MB fails | Use a Folder/SFTP connection or split the file |
| WebSockets | Supported (notebooks work) | — |

## Update
```bash
docker compose --env-file .env.cloudflare up -d --build    # after applying databridge-update.zip
```
