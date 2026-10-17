<#
DataBridge + Cloudflare Tunnel on Windows WITHOUT Docker (DataBridge already running with .\run.bat on port 8800).

  .\start-tunnel.ps1 -Quick                 # instant test URL https://<random>.trycloudflare.com (no account, changes every time)
  .\start-tunnel.ps1 -Token <TUNNEL_TOKEN>  # your own domain, installed as a Windows service (starts with Windows)
  .\start-tunnel.ps1 -Uninstall             # remove the service
#>
param([switch]$Quick, [string]$Token, [switch]$Uninstall, [int]$Port = 8800)
$ErrorActionPreference = "Stop"

function Get-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  Write-Host "Installing cloudflared..." -ForegroundColor Cyan
  winget install --id Cloudflare.cloudflared -e --accept-source-agreements --accept-package-agreements | Out-Null
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $guess = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
  if (Test-Path $guess) { return $guess }
  throw "cloudflared not found. Install it from https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/ and run again."
}

# DataBridge must be up first
try { Invoke-WebRequest "http://localhost:$Port/" -UseBasicParsing -TimeoutSec 5 | Out-Null }
catch { if (-not $Uninstall) { throw "DataBridge is not answering on http://localhost:$Port. Start it with .\run.bat first." } }

$cf = Get-Cloudflared

if ($Uninstall) {
  & $cf service uninstall
  Write-Host "Tunnel service removed." -ForegroundColor Green
  exit 0
}

if ($Quick) {
  Write-Host "Starting a temporary tunnel. Copy the https://....trycloudflare.com address it prints. Ctrl+C to stop." -ForegroundColor Yellow
  & $cf tunnel --no-autoupdate --url "http://localhost:$Port"
  exit 0
}

if (-not $Token) { throw "Pass -Quick for a test URL, or -Token <TUNNEL_TOKEN> for your own domain." }

# must run as Administrator to install a Windows service
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) { throw "Open PowerShell as Administrator to install the tunnel service." }

& $cf service install $Token
Start-Sleep -Seconds 3
Get-Service cloudflared | Format-Table Name, Status, StartType
Write-Host "Tunnel installed. In Cloudflare Zero Trust > Networks > Tunnels > your tunnel > Public hostname:" -ForegroundColor Green
Write-Host "   Service = HTTP   URL = localhost:$Port" -ForegroundColor Green
