<#
DataBridge on your own domain with a named Cloudflare Tunnel (config file on this PC, no token, no Docker).
DataBridge must already be running (.\run.bat, port 8800) and the domain must use Cloudflare DNS
(GoDaddy > databridge-analytics.in > Nameservers > the two Cloudflare nameservers shown in the Cloudflare dashboard).

  .\named-tunnel.ps1                                   # https://app.databridge-analytics.in, runs in this window
  .\named-tunnel.ps1 -Service                          # same, installed as a Windows service (starts with Windows) - run as Administrator
  .\named-tunnel.ps1 -Hostname analytics.databridge-analytics.in -Name databridge-prod -Port 8800
  .\named-tunnel.ps1 -Uninstall                        # remove the Windows service (tunnel and DNS record stay)
#>
param(
  [string]$Hostname = "app.databridge-analytics.in",
  [string]$Name = "databridge",
  [int]$Port = 8800,
  [switch]$Service,
  [switch]$Uninstall
)
$ErrorActionPreference = "Stop"
$Hostname = ($Hostname -replace '^[a-z]+://', '').TrimEnd('/')     # route dns wants a bare hostname, no https://
$Home2 = Join-Path $env:USERPROFILE ".cloudflared"
$Dir = Join-Path $env:ProgramData "DataBridge\cloudflared"         # readable by the Windows service (LocalSystem)
$Cfg = Join-Path $Dir "config.yml"

function Get-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  Write-Host "Installing cloudflared..." -ForegroundColor Cyan
  winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements | Out-Null
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  foreach ($g in @("C:\Program Files (x86)\cloudflared\cloudflared.exe", "C:\Program Files\cloudflared\cloudflared.exe")) { if (Test-Path $g) { return $g } }
  throw "cloudflared not found. Install it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ and run again."
}
function Test-Admin { ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator) }

$cf = Get-Cloudflared

if ($Uninstall) {
  if (-not (Test-Admin)) { throw "Open PowerShell as Administrator to remove the service." }
  & $cf service uninstall
  Write-Host "Service removed. Delete the tunnel too with:  cloudflared tunnel delete $Name" -ForegroundColor Green
  exit 0
}
if ($Service -and -not (Test-Admin)) { throw "Open PowerShell as Administrator to install the tunnel as a service." }

# 1. DataBridge must answer locally
try { Invoke-WebRequest "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 5 | Out-Null }
catch { throw "DataBridge is not answering on http://localhost:$Port. Start it with .\run.bat first." }

# 2. sign in to Cloudflare once (opens the browser: pick databridge-analytics.in)
if (-not (Test-Path (Join-Path $Home2 "cert.pem"))) {
  Write-Host "Opening the browser: sign in to Cloudflare and authorise the zone for $Hostname ..." -ForegroundColor Cyan
  & $cf tunnel login
  if (-not (Test-Path (Join-Path $Home2 "cert.pem"))) { throw "Cloudflare sign-in did not finish (no cert.pem). Run the script again." }
}

# 3. create the tunnel once (reuse it if it already exists)
$list = (& $cf tunnel list --output json | Out-String) | ConvertFrom-Json
$t = $list | Where-Object { $_.name -eq $Name } | Select-Object -First 1
if (-not $t) {
  Write-Host "Creating tunnel '$Name'..." -ForegroundColor Cyan
  & $cf tunnel create $Name | Out-Host
  $t = ((& $cf tunnel list --output json | Out-String) | ConvertFrom-Json) | Where-Object { $_.name -eq $Name } | Select-Object -First 1
}
if (-not $t) { throw "Tunnel '$Name' was not created." }
$id = $t.id
$cred = Join-Path $Home2 "$id.json"
if (-not (Test-Path $cred)) {
  throw "Credentials for tunnel '$Name' ($id) are not on this PC ($cred). Use another -Name, or delete it with: cloudflared tunnel delete $Name"
}

# 4. DNS: CNAME  $Hostname -> <id>.cfargotunnel.com  (proxied). --overwrite-dns replaces an old record with the same name.
Write-Host "Pointing $Hostname at the tunnel..." -ForegroundColor Cyan
& $cf tunnel route dns --overwrite-dns $Name $Hostname | Out-Host

# 5. config file + credentials in a folder the service can read
New-Item -ItemType Directory -Force -Path $Dir | Out-Null
Copy-Item $cred (Join-Path $Dir "$id.json") -Force
$credOut = (Join-Path $Dir "$id.json")
@"
tunnel: $id
credentials-file: $credOut
no-autoupdate: true

ingress:
  - hostname: $Hostname
    service: http://localhost:$Port
    originRequest:
      connectTimeout: 30s
      keepAliveTimeout: 90s
  - service: http_status:404
"@ | Set-Content -Path $Cfg -Encoding ascii
& $cf tunnel --config $Cfg ingress validate | Out-Host

Write-Host @"
Before sharing the link:
  - keep AUTH_ENABLED=true (Admin > Settings) and strong passwords; public sign-up only with SIGNUP_ROLE=viewer
  - optional extra lock: Cloudflare Zero Trust > Access > Applications > add $Hostname (email OTP / Google login)
  - Cloudflare limits: 100 MB per upload, 100 s per request (long syncs keep running in DataBridge, only the page waits)
"@ -ForegroundColor Yellow

# 6. run it
if ($Service) {
  if (Get-Service cloudflared -ErrorAction SilentlyContinue) { & $cf service uninstall | Out-Null; Start-Sleep -Seconds 2 }
  & $cf service install | Out-Host
  # make the service start this tunnel with this config
  Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\cloudflared" -Name ImagePath -Value "`"$cf`" --config `"$Cfg`" tunnel run $Name"
  Restart-Service cloudflared
  Start-Sleep -Seconds 4
  Get-Service cloudflared | Format-Table Name, Status, StartType
  Write-Host "Running as a Windows service: https://$Hostname" -ForegroundColor Green
} else {
  Write-Host "Starting the tunnel: https://$Hostname  (Ctrl+C to stop; use -Service to keep it running after logoff)" -ForegroundColor Green
  & $cf tunnel --config $Cfg run $Name
}
