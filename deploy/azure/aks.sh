#!/usr/bin/env bash
# DataBridge on Azure Kubernetes Service (AKS).
# Run from the DataBridge folder in Azure Cloud Shell (bash) — it already has az, kubectl and helm:
#   bash deploy/azure/aks.sh
# Re-running is safe: existing resources are kept, the image is rebuilt and the release upgraded.
# Change any setting by exporting it first, e.g.  export LOCATION=southindia SPARK_VM=Standard_E16s_v5
set -euo pipefail

RG="${RG:-databridge-rg}"
LOCATION="${LOCATION:-centralindia}"
AKS="${AKS:-databridge-aks}"
ACR="${ACR:-databridge$(echo -n "$RG" | md5sum | cut -c1-8)}"     # must be globally unique, letters+digits
TAG="${TAG:-$(date +%Y%m%d-%H%M)}"
NS="${NS:-databridge}"
SYSTEM_VM="${SYSTEM_VM:-Standard_D4s_v5}"     # runs DataBridge + notebook drivers (always on)
SPARK_VM="${SPARK_VM:-Standard_E8s_v5}"       # worker nodes for the "spark" node pool (scale 0..SPARK_MAX)
SPARK_MAX="${SPARK_MAX:-10}"
SPOT="${SPOT:-true}"                          # also create a "spark-spot" pool (up to ~80% cheaper, can be evicted)
STORAGE_CLASS="${STORAGE_CLASS:-azurefile-csi-premium}"   # shared ReadWriteMany disk for notebooks + Delta tables
HOST="${HOST:-}"                              # e.g. analytics.example.com -> public HTTPS ingress (optional)

say() { printf '\n\033[1;34m== %s\033[0m\n' "$*"; }
cd "$(dirname "$0")/../.."
[ -f Dockerfile ] || { echo "Run this from the DataBridge folder"; exit 1; }

say "Resource group $RG in $LOCATION"
az group create -n "$RG" -l "$LOCATION" -o none

say "Container registry $ACR"
az acr show -n "$ACR" -g "$RG" -o none 2>/dev/null || az acr create -n "$ACR" -g "$RG" --sku Basic -o none

say "Building the image in Azure (no Docker needed on your PC): $ACR.azurecr.io/databridge:$TAG"
az acr build -r "$ACR" -t "databridge:$TAG" -t databridge:latest . -o none

if ! az aks show -n "$AKS" -g "$RG" -o none 2>/dev/null; then
  say "AKS cluster $AKS (system pool: 1-2 x $SYSTEM_VM)"
  az aks create -n "$AKS" -g "$RG" -l "$LOCATION" \
    --nodepool-name system --node-vm-size "$SYSTEM_VM" --node-count 1 \
    --enable-cluster-autoscaler --min-count 1 --max-count 2 \
    --nodepool-labels databridge.io/pool=system \
    --attach-acr "$ACR" --enable-managed-identity --generate-ssh-keys \
    --cluster-autoscaler-profile scale-down-unneeded-time=5m scale-down-delay-after-add=5m scan-interval=20s \
    --tier free -o none
fi

add_pool() {   # name, extra args...
  local name="$1"; shift
  if az aks nodepool show -g "$RG" --cluster-name "$AKS" -n "$name" -o none 2>/dev/null; then
    echo "node pool $name exists"; return
  fi
  say "Node pool $name ($SPARK_VM, autoscale 0..$SPARK_MAX)"
  az aks nodepool add -g "$RG" --cluster-name "$AKS" -n "$name" --mode User \
    --node-vm-size "$SPARK_VM" --node-count 0 \
    --enable-cluster-autoscaler --min-count 0 --max-count "$SPARK_MAX" "$@" -o none
}
# Node pool names: lowercase letters/digits, max 12 chars. The label is what DataBridge clusters use (Node pool field).
add_pool spark --labels databridge.io/pool=spark
if [ "$SPOT" = "true" ]; then
  # AKS adds the taint kubernetes.azure.com/scalesetpriority=spot:NoSchedule; DataBridge adds the toleration for spot clusters
  add_pool sparkspot --priority Spot --eviction-policy Delete --spot-max-price -1 --labels databridge.io/pool=spark-spot
fi

say "kubectl credentials"
az aks get-credentials -n "$AKS" -g "$RG" --overwrite-existing
kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f -

INGRESS_ARGS=()
if [ -n "$HOST" ]; then
  say "Managed NGINX ingress (application routing) for https://$HOST"
  az aks approuting enable -g "$RG" -n "$AKS" -o none 2>/dev/null || true
  INGRESS_ARGS=(--set ingress.enabled=true --set ingress.className=webapprouting.kubernetes.azure.com --set ingress.host="$HOST")
fi

say "Installing DataBridge (Helm)"
helm upgrade --install databridge deploy/helm/databridge -n "$NS" \
  --set image.repository="$ACR.azurecr.io/databridge" --set image.tag="$TAG" \
  --set storage.storageClass="$STORAGE_CLASS" --set metastore.storageClass=managed-csi \
  --set-string 'nodeSelector.databridge\.io/pool=system' \
  "${INGRESS_ARGS[@]}" --wait --timeout 15m

say "Done"
cat <<MSG
1) Create the admin account (first sign-up becomes admin):
     kubectl -n $NS port-forward svc/databridge 8800:80      then open http://localhost:8800
2) Compute › Clusters › New cluster:
     Runs on: Azure (AKS)   Worker size: $SPARK_VM   Node pool: spark
     Tick "spot" to use the sparkspot pool. Price per node-hour: from the Azure price list for $SPARK_VM in $LOCATION.
3) Pick the cluster in a notebook header or a job's "Run on". Workers start on demand and the nodes
   scale back to zero after the cluster's auto-stop time + ~5 minutes.
MSG
if [ -n "$HOST" ]; then
  IP=$(kubectl get svc -n app-routing-system nginx -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || true)
  echo "4) Point DNS:  $HOST  A  ${IP:-<external IP of the app-routing nginx service>}   (add TLS: see deploy/kubernetes/README.md)"
fi
