#!/usr/bin/env bash
# DataBridge on Oracle Container Engine for Kubernetes (OKE).
#
# Before running:
#   1. OCI Console › Developer Services › Kubernetes Clusters › Create cluster › Quick create
#      (Enhanced cluster, public API endpoint, private workers, 1 node of VM.Standard.E5.Flex 2 OCPU / 16 GB).
#      Copy the cluster OCID.
#   2. Run in OCI Cloud Shell (has oci, kubectl, helm) or anywhere with those tools + Docker:
#        export CLUSTER_ID=ocid1.cluster.oc1....  COMPARTMENT_ID=ocid1.compartment.oc1....
#        export OCIR_USER='<tenancy-namespace>/<your user or email>'  OCIR_TOKEN='<auth token>'   # Profile › Auth tokens
#        bash deploy/oracle/oke.sh
#   Build the image on a machine with Docker (Cloud Shell can't): set BUILD=false here and push it first, see README.
set -euo pipefail

: "${CLUSTER_ID:?export CLUSTER_ID (OKE cluster OCID)}"
: "${COMPARTMENT_ID:?export COMPARTMENT_ID}"
REGION="${REGION:-$(oci iam region-subscription list --query 'data[?"is-home-region"]|[0]."region-name"' --raw-output)}"
NS="${NS:-databridge}"
TAG="${TAG:-$(date +%Y%m%d-%H%M)}"
BUILD="${BUILD:-true}"
SPARK_SHAPE="${SPARK_SHAPE:-VM.Standard.E5.Flex}"   # A1 (Ampere ARM) also works: VM.Standard.A1.Flex (build the image for arm64)
SPARK_OCPUS="${SPARK_OCPUS:-4}"                      # E5: 1 OCPU = 2 vCPU  -> 4 OCPU = 8 vCPU
SPARK_MEM_GB="${SPARK_MEM_GB:-32}"
SPARK_MAX="${SPARK_MAX:-8}"
SPOT="${SPOT:-true}"                                 # preemptible pool (50% cheaper, can be reclaimed)
HOST="${HOST:-}"

say() { printf '\n\033[1;34m== %s\033[0m\n' "$*"; }
cd "$(dirname "$0")/../.."
[ -f Dockerfile ] || { echo "Run this from the DataBridge folder"; exit 1; }
TENANCY_NS=$(oci os ns get --query data --raw-output)
REGION_KEY=$(oci iam region list --query "data[?name=='$REGION'].key | [0]" --raw-output | tr 'A-Z' 'a-z')
REPO="$REGION_KEY.ocir.io/$TENANCY_NS/databridge"

if [ "$BUILD" = "true" ]; then
  say "Image $REPO:$TAG"
  echo "$OCIR_TOKEN" | docker login "$REGION_KEY.ocir.io" -u "$OCIR_USER" --password-stdin
  ARCH=linux/amd64; [[ "$SPARK_SHAPE" == *A1* ]] && ARCH=linux/amd64,linux/arm64   # system node is x86, workers ARM
  docker buildx build --platform "$ARCH" -t "$REPO:$TAG" --push .
fi

say "kubectl credentials"
oci ce cluster create-kubeconfig --cluster-id "$CLUSTER_ID" --region "$REGION" --token-version 2.0.0 \
  --kube-endpoint PUBLIC_ENDPOINT --overwrite >/dev/null
kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f -
if [ -n "${OCIR_TOKEN:-}" ]; then
  kubectl -n "$NS" create secret docker-registry ocir-secret --docker-server="$REGION_KEY.ocir.io" \
    --docker-username="$OCIR_USER" --docker-password="$OCIR_TOKEN" --dry-run=client -o yaml | kubectl apply -f -
fi

# Copy placement (subnet, availability domains) and image from the Quick-create node pool
FIRST_POOL=$(oci ce node-pool list --compartment-id "$COMPARTMENT_ID" --cluster-id "$CLUSTER_ID" --query 'data[0].id' --raw-output)
oci ce node-pool get --node-pool-id "$FIRST_POOL" > /tmp/databridge-pool.json
SUBNET=$(python3 -c "import json;d=json.load(open('/tmp/databridge-pool.json'))['data'];print(d['node-config-details']['placement-configs'][0]['subnet-id'])")
K8S_VER=$(python3 -c "import json;print(json.load(open('/tmp/databridge-pool.json'))['data']['kubernetes-version'])")
K8S_NUM="${K8S_VER#v}"
AD=$(python3 -c "import json;d=json.load(open('/tmp/databridge-pool.json'))['data'];print(d['node-config-details']['placement-configs'][0]['availability-domain'])")
oci ce node-pool update --node-pool-id "$FIRST_POOL" --initial-node-labels '[{"key":"databridge.io/pool","value":"system"}]' --force >/dev/null || true
kubectl label nodes -l '!databridge.io/pool' databridge.io/pool=system   # the nodes that already exist
IMAGE=$(oci ce node-pool-options get --node-pool-option-id "$CLUSTER_ID" --query \
  "data.sources[?contains(\"source-name\", 'Oracle-Linux-8') && contains(\"source-name\", '$K8S_NUM') && !contains(\"source-name\", 'GPU') && !contains(\"source-name\", 'aarch64')] | [0].\"image-id\"" --raw-output)
[[ "$SPARK_SHAPE" == *A1* ]] && IMAGE=$(oci ce node-pool-options get --node-pool-option-id "$CLUSTER_ID" --query \
  "data.sources[?contains(\"source-name\", 'aarch64') && contains(\"source-name\", '$K8S_NUM') && !contains(\"source-name\", 'GPU')] | [0].\"image-id\"" --raw-output)

pool_id() { oci ce node-pool list --compartment-id "$COMPARTMENT_ID" --cluster-id "$CLUSTER_ID" --name "$1" --query 'data[0].id' --raw-output 2>/dev/null || true; }
add_pool() {   # name label preemptible
  local id; id=$(pool_id "$1")
  if [ -n "$id" ] && [ "$id" != "null" ]; then echo "node pool $1 exists"; return; fi
  say "Node pool $1 ($SPARK_SHAPE $SPARK_OCPUS OCPU / $SPARK_MEM_GB GB, 0..$SPARK_MAX)"
  local placement="[{\"availabilityDomain\":\"$AD\",\"subnetId\":\"$SUBNET\"}]"
  [ "$3" = "true" ] && placement="[{\"availabilityDomain\":\"$AD\",\"subnetId\":\"$SUBNET\",\"preemptibleNodeConfig\":{\"preemptionAction\":{\"type\":\"TERMINATE\",\"isPreserveBootVolume\":false}}}]"
  oci ce node-pool create --cluster-id "$CLUSTER_ID" --compartment-id "$COMPARTMENT_ID" --name "$1" \
    --kubernetes-version "$K8S_VER" --node-shape "$SPARK_SHAPE" \
    --node-shape-config "{\"ocpus\":$SPARK_OCPUS,\"memoryInGBs\":$SPARK_MEM_GB}" \
    --node-source-details "{\"sourceType\":\"IMAGE\",\"imageId\":\"$IMAGE\"}" \
    --placement-configs "$placement" --size 0 \
    --initial-node-labels "[{\"key\":\"databridge.io/pool\",\"value\":\"$2\"}]" --wait-for-state SUCCEEDED >/dev/null
}
add_pool spark spark false
[ "$SPOT" = "true" ] && add_pool spark-spot spark-spot true

say "Cluster autoscaler add-on (scales the spark pools 0..$SPARK_MAX)"
NODES="0:$SPARK_MAX:$(pool_id spark)"
[ "$SPOT" = "true" ] && NODES="$NODES,0:$SPARK_MAX:$(pool_id spark-spot)"
CFG="[{\"key\":\"nodes\",\"value\":\"$NODES\"},{\"key\":\"authType\",\"value\":\"workload\"},{\"key\":\"scaleDownUnneededTime\",\"value\":\"5m\"},{\"key\":\"scaleDownDelayAfterAdd\",\"value\":\"5m\"}]"
oci ce cluster install-addon --cluster-id "$CLUSTER_ID" --addon-name ClusterAutoscaler --configurations "$CFG" >/dev/null 2>&1 || \
  oci ce cluster update-addon --cluster-id "$CLUSTER_ID" --addon-name ClusterAutoscaler --configurations "$CFG" >/dev/null
cat <<MSG
   One-time IAM policy (Identity › Policies, in the root compartment) so the autoscaler may resize node pools:
     Allow any-user to manage cluster-node-pools in compartment id $COMPARTMENT_ID where ALL {request.principal.type='workload', request.principal.namespace='kube-system', request.principal.service_account='cluster-autoscaler', request.principal.cluster_id='$CLUSTER_ID'}
     Allow any-user to manage instance-family in compartment id $COMPARTMENT_ID where ALL {request.principal.type='workload', request.principal.namespace='kube-system', request.principal.service_account='cluster-autoscaler', request.principal.cluster_id='$CLUSTER_ID'}
     Allow any-user to use subnets in compartment id $COMPARTMENT_ID where ALL {request.principal.type='workload', request.principal.namespace='kube-system', request.principal.service_account='cluster-autoscaler', request.principal.cluster_id='$CLUSTER_ID'}
     Allow any-user to read virtual-network-family in compartment id $COMPARTMENT_ID where ALL {request.principal.type='workload', request.principal.namespace='kube-system', request.principal.service_account='cluster-autoscaler', request.principal.cluster_id='$CLUSTER_ID'}
     Allow any-user to use vnics in compartment id $COMPARTMENT_ID where ALL {request.principal.type='workload', request.principal.namespace='kube-system', request.principal.service_account='cluster-autoscaler', request.principal.cluster_id='$CLUSTER_ID'}
     Allow any-user to inspect compartments in compartment id $COMPARTMENT_ID where ALL {request.principal.type='workload', request.principal.namespace='kube-system', request.principal.service_account='cluster-autoscaler', request.principal.cluster_id='$CLUSTER_ID'}
MSG

say "Shared File Storage (ReadWriteMany) for notebooks and Delta tables"
kubectl apply -f - <<YAML
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: {name: oci-fss}
provisioner: fss.csi.oraclecloud.com
parameters:
  availabilityDomain: "$AD"
  mountTargetSubnetOcid: "$SUBNET"
  compartmentOcid: "$COMPARTMENT_ID"
YAML
echo "   File Storage also needs an IAM policy for the cluster:  Allow any-user to manage file-family in compartment id $COMPARTMENT_ID where request.principal.type = 'cluster'"
echo "   and NFS open inside the worker subnet (Quick create allows all traffic between workers already)."

say "Installing DataBridge (Helm)"
INGRESS_ARGS=()
[ -n "$HOST" ] && INGRESS_ARGS=(--set ingress.enabled=true --set ingress.className=nginx --set ingress.host="$HOST")
PULL_ARGS=()
[ -n "${OCIR_TOKEN:-}" ] && PULL_ARGS=(--set 'imagePullSecrets[0].name=ocir-secret')
helm upgrade --install databridge deploy/helm/databridge -n "$NS" \
  --set image.repository="$REPO" --set image.tag="$TAG" \
  --set storage.storageClass=oci-fss --set storage.size=50Gi --set metastore.storageClass=oci-bv \
  --set metastore.size=50Gi --set spark.extraPackages=org.apache.hadoop:hadoop-aws:3.3.4 \
  --set-string 'nodeSelector.databridge\.io/pool=system' \
  "${PULL_ARGS[@]}" "${INGRESS_ARGS[@]}" --wait --timeout 20m

say "Done"
cat <<MSG
1) Create the admin account (first sign-up becomes admin):
     kubectl -n $NS port-forward svc/databridge 8800:80      then open http://localhost:8800
2) Compute › Clusters › New cluster:
     Runs on: Oracle Cloud (OKE)   Worker size: $SPARK_SHAPE $SPARK_OCPUS OCPU   Node pool: spark   (spot = spark-spot)
     Price per node-hour: OCPU price x $SPARK_OCPUS + memory price x $SPARK_MEM_GB from the OCI price list.
MSG
