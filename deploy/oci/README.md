# DataBridge free 24×7 on Oracle Cloud (Always Free) + Cloudflare Tunnel

Cost: ₹0. Always Free gives an Ampere A1 VM with **2 OCPU / 12 GB RAM** (Oracle reduced it from 4/24 in June 2026),
200 GB disk and 10 TB/month outbound. Keep the account on **Free Tier** (do not upgrade to Pay-As-You-Go) and
nothing can be billed.

## 1. Create the VM (Oracle Cloud console, once)
1. Sign up at cloud.oracle.com (card is only verified). Home region: Mumbai or Hyderabad (cannot change later).
2. Compute › Instances › Create:
   - Image: **Canonical Ubuntu 24.04** · Shape: **Ampere › VM.Standard.A1.Flex, 2 OCPU, 12 GB**
   - Boot volume: 100 GB · Download the SSH private key
   - "Out of capacity"? Try another availability domain or again later.
3. No ports to open — the tunnel connects outwards.

## 2. Copy DataBridge from Windows (PowerShell)
```powershell
cd C:\Users\Hp\Downloads\stratum
tar -czf databridge.tgz --exclude=stratum/.stratum --exclude=stratum/workspace --exclude=stratum/jars --exclude=stratum/secrets --exclude=stratum/.env --exclude=stratum/.venv --exclude=__pycache__ stratum
scp -i C:\path\to\ssh-key.key databridge.tgz ubuntu@<VM-IP>:~
scp -i C:\path\to\ssh-key.key C:\Users\Hp\.cloudflared\ea82be5d-c81d-42b2-be4e-7318883d531b.json ubuntu@<VM-IP>:~
```

## 3. Install and start (on the VM)
```bash
ssh -i C:\path\to\ssh-key.key ubuntu@<VM-IP>
tar -xzf databridge.tgz && mv stratum databridge
mkdir -p databridge/deploy/oci/cloudflared && mv ea82be5d-*.json databridge/deploy/oci/cloudflared/
bash databridge/deploy/oci/setup.sh          # asks for the admin user once; ~10 min the first time
```
Stop the tunnel on your Windows PC first (Ctrl+C, or `Stop-Service cloudflared`) — otherwise visitors are
split between the PC and the VM.

## Update later
Copy the new `databridge.tgz`, extract over `~/databridge` (`tar -xzf databridge.tgz && cp -r stratum/* databridge/`),
then `bash databridge/deploy/oci/setup.sh` again. Data lives in Docker volumes and `~/databridge/workspace`.

## Notes
- Oracle may reclaim an Always Free VM that is idle for 7 days (CPU p95 < 20%, network < 20% and memory < 20%).
  DataBridge keeps Spark and Postgres in memory, so it normally stays above that; a daily sync helps too.
- Dora uses Groq (free key at console.groq.com) — set DORA_API_KEY in Admin › Settings.
- `CONNECTORS_LICENSES=MIT` is set because a hosted service may not offer ELv2 library connectors;
  built-in Toast / Clover / R365 / Revel connectors are not affected.
