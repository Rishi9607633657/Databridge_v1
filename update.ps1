# DataBridge updater - copies a release zip over this folder, keeping your config and data.
# Usage:  .\update.ps1                (uses the newest complete databridge-update*.zip in Downloads)
#         .\update.ps1 -Zip "C:\path\to\databridge-update.zip"
param([string]$Zip)
$ErrorActionPreference = "Stop"
$To = $PSScriptRoot
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Test-Zip($path) {
  try { $z = [System.IO.Compression.ZipFile]::OpenRead($path); $n = $z.Entries.Count; $z.Dispose(); return $n -gt 0 }
  catch { return $false }
}

if (-not $Zip) {
  $candidates = Get-ChildItem "$HOME\Downloads\databridge-update*.zip" | Sort-Object LastWriteTime -Descending
  $Zip = ($candidates | Where-Object { Test-Zip $_.FullName } | Select-Object -First 1).FullName
  $broken = $candidates | Where-Object { -not (Test-Zip $_.FullName) }
  foreach ($b in $broken) { Write-Host "Skipping incomplete download: $($b.Name)" -ForegroundColor Yellow }
  if (-not $Zip) { throw "No complete databridge-update*.zip found in Downloads. Download it again and wait until it finishes." }
}
if (-not (Test-Path $Zip)) { throw "Zip not found: $Zip" }
if (-not (Test-Zip $Zip)) { throw "The zip is incomplete or damaged: $Zip`nDownload it again and wait until the download finishes." }

$tmp = Join-Path $env:TEMP ("databridge-update-" + [guid]::NewGuid().ToString("N"))
[System.IO.Compression.ZipFile]::ExtractToDirectory($Zip, $tmp)
$From = if (Test-Path (Join-Path $tmp "stratum")) { Join-Path $tmp "stratum" } else { $tmp }
$files = Get-ChildItem $From -Recurse -File
if (-not $files) { Remove-Item $tmp -Recurse -Force; throw "The zip contained no files - nothing was updated." }

Write-Host "Updating $To from $(Split-Path $Zip -Leaf) ($($files.Count) files):" -ForegroundColor Cyan
$files | ForEach-Object { "  " + $_.FullName.Substring($From.Length + 1) }

robocopy $From $To /E /IS /IT /NJH /NJS /NP /NDL /NFL `
  /XD secrets workspace dags .stratum jars hms-schema .venv __pycache__ build dist `
  /XF .env airflow-values.yaml deploy-dags.ps1 spark_init.py | Out-Null
$code = $LASTEXITCODE
Remove-Item $tmp -Recurse -Force
if ($code -ge 8) { throw "Copy failed (robocopy code $code)" }

pip install -r (Join-Path $To "requirements.txt") --quiet --disable-pip-version-check
Write-Host "`nUpdated. Stop DataBridge (Ctrl+C), run .\run.bat, then press Ctrl+F5 in the browser." -ForegroundColor Green
