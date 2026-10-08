# Copies .\dags into Airflow's shared DAGs volume. Usage: .\deploy-dags.ps1
param([string]$Src = ".\dags", [string]$Ns = "airflow")
$ErrorActionPreference = "Stop"

$pod = kubectl get pods -n $Ns -l component=dag-processor --field-selector=status.phase=Running -o jsonpath="{.items[0].metadata.name}"
if (-not $pod) { throw "No running dag-processor pod in namespace $Ns" }
Write-Host "Using pod $pod"

$root = (Resolve-Path $Src).Path
Push-Location $root
try {
    $files = Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '__pycache__|\.pyc$' }
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($root.Length).TrimStart('\').Replace('\', '/')
        $parts = $rel.Split('/')
        if ($parts.Length -gt 1) { $dir = "/opt/airflow/dags/" + ($parts[0..($parts.Length - 2)] -join '/') } else { $dir = "/opt/airflow/dags" }
        kubectl exec -n $Ns $pod -c dag-processor -- mkdir -p $dir | Out-Null
        kubectl cp $rel "${Ns}/${pod}:/opt/airflow/dags/$rel" -c dag-processor
        Write-Host "deployed $rel"
    }
} finally { Pop-Location }

Write-Host ""
Write-Host "Files in the DAGs volume:"
kubectl exec -n $Ns $pod -c dag-processor -- ls -R /opt/airflow/dags
Write-Host ""
Write-Host "Import errors (empty = good):"
kubectl exec -n $Ns $pod -c dag-processor -- airflow dags list-import-errors