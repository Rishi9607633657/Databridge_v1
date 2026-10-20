#!/usr/bin/env bash
# DataBridge on Amazon EKS.
# Needs: aws CLI v2 (signed in), eksctl, kubectl, helm, and Docker (Docker Desktop on your PC, or WSL).
#   bash deploy/aws/eks.sh
# Re-running is safe. Override settings by exporting them first, e.g.  export REGION=ap-south-1 SPARK_TYPE=r6i.2xlarge
set -euo pipefail

REGION="${REGION:-ap-south-1}"
CLUSTER="${CLUSTER:-databridge-eks}"
NS="${NS:-databridge}"
TAG="${TAG:-$(date +%Y%m%d-%H%M)}"
SYSTEM_TYPE="${SYSTEM_TYPE:-m6i.xlarge}"     # runs DataBridge + notebook drivers (always on)
SPARK_TYPE="${SPARK_TYPE:-m6i.2xlarge}"      # worker nodes for the "spark" pool (scale 0..SPARK_MAX)
SPARK_MAX="${SPARK_MAX:-10}"
SPOT="${SPOT:-true}"
HOST="${HOST:-}"                             # optional public host name (needs an ingress controller; see README)

say() { printf '\n\033[1;34m== %s\033[0m\n' "$*"; }
cd "$(dirname "$0")/../.."
[ -f Dockerfile ] || { echo "Run this from the DataBridge folder"; exit 1; }
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REPO="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/databridge"

say "Image $REPO:$TAG"
aws ecr describe-repositories --region "$REGION" --repository-names databridge >/dev/null 2>&1 || \
  aws ecr create-repository --region "$REGION" --repository-name databridge >/dev/null
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"
docker build --platform linux/amd64 -t "$REPO:$TAG" .
docker push "$REPO:$TAG"

if ! eksctl get cluster --region "$REGION" --name "$CLUSTER" >/dev/null 2>&1; then
  say "EKS cluster $CLUSTER (15-20 minutes)"
  SPOT_GROUP=""
  if [ "$SPOT" = "true" ]; then SPOT_GROUP=$(cat <<YAML
  - name: spark-spot
    instanceTypes: [$SPARK_TYPE, $(echo "$SPARK_TYPE" | sed 's/^m6i/m5/; s/^r6i/r5/; s/^c6i/c5/')]
    spot: true
    minSize: 0
    maxSize: $SPARK_MAX
    desiredCapacity: 0
    privateNetworking: true
    labels: {databridge.io/pool: spark-spot}
    taints: [{key: eks.amazonaws.com/capacityType, value: SPOT, effect: NoSchedule}]
    propagateASGTags: true
    iam: {withAddonPolicies: {autoScaler: true, efs: true}}
YAML
); fi
  cat > /tmp/databridge-eks.yaml <<YAML
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata: {name: $CLUSTER, region: $REGION}
iam: {withOIDC: true}
addons:
  - name: aws-efs-csi-driver
    wellKnownPolicies: {efsCSIController: true}
  - name: aws-ebs-csi-driver
    wellKnownPolicies: {ebsCSIController: true}
managedNodeGroups:
  - name: system
    instanceType: $SYSTEM_TYPE
    minSize: 1
    maxSize: 2
    desiredCapacity: 1
    privateNetworking: true
    labels: {databridge.io/pool: system}
    iam: {withAddonPolicies: {autoScaler: true, efs: true, ebs: true}}
  - name: spark
    instanceType: $SPARK_TYPE
    minSize: 0
    maxSize: $SPARK_MAX
    desiredCapacity: 0
    privateNetworking: true
    labels: {databridge.io/pool: spark}
    propagateASGTags: true
    iam: {withAddonPolicies: {autoScaler: true, efs: true}}
$SPOT_GROUP
YAML
  eksctl create cluster -f /tmp/databridge-eks.yaml
fi
aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER"

say "Cluster autoscaler (adds worker nodes when executors are pending, removes idle ones)"
helm repo add autoscaler https://kubernetes.github.io/autoscaler >/dev/null 2>&1 || true
helm repo update autoscaler >/dev/null
helm upgrade --install cluster-autoscaler autoscaler/cluster-autoscaler -n kube-system \
  --set autoDiscovery.clusterName="$CLUSTER" --set awsRegion="$REGION" \
  --set extraArgs.scale-down-unneeded-time=5m --set extraArgs.scale-down-delay-after-add=5m \
  --set extraArgs.balance-similar-node-groups=true --set extraArgs.skip-nodes-with-system-pods=false \
  --set-string 'nodeSelector.databridge\.io/pool=system' >/dev/null

say "Shared EFS disk (ReadWriteMany) for notebooks and Delta tables"
VPC=$(aws eks describe-cluster --region "$REGION" --name "$CLUSTER" --query cluster.resourcesVpcConfig.vpcId --output text)
CIDR=$(aws ec2 describe-vpcs --region "$REGION" --vpc-ids "$VPC" --query 'Vpcs[0].CidrBlock' --output text)
FS=$(aws efs describe-file-systems --region "$REGION" --query "FileSystems[?Name=='$CLUSTER-data'].FileSystemId | [0]" --output text)
if [ "$FS" = "None" ] || [ -z "$FS" ]; then
  FS=$(aws efs create-file-system --region "$REGION" --encrypted --performance-mode generalPurpose --throughput-mode elastic \
       --tags Key=Name,Value="$CLUSTER-data" --query FileSystemId --output text)
  SG=$(aws ec2 create-security-group --region "$REGION" --vpc-id "$VPC" --group-name "$CLUSTER-efs" \
       --description "NFS from $CLUSTER" --query GroupId --output text)
  aws ec2 authorize-security-group-ingress --region "$REGION" --group-id "$SG" --protocol tcp --port 2049 --cidr "$CIDR" >/dev/null
  until [ "$(aws efs describe-file-systems --region "$REGION" --file-system-id "$FS" --query 'FileSystems[0].LifeCycleState' --output text)" = available ]; do sleep 5; done
  for SUB in $(aws ec2 describe-subnets --region "$REGION" --filters Name=vpc-id,Values="$VPC" Name=tag:kubernetes.io/role/internal-elb,Values=1 --query 'Subnets[].SubnetId' --output text); do
    aws efs create-mount-target --region "$REGION" --file-system-id "$FS" --subnet-id "$SUB" --security-groups "$SG" >/dev/null
  done
fi
kubectl apply -f - <<YAML
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: {name: efs-sc}
provisioner: efs.csi.aws.com
parameters: {provisioningMode: efs-ap, fileSystemId: $FS, directoryPerms: "777", uid: "0", gid: "0"}
YAML
kubectl apply -f - <<YAML
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata: {name: gp3}
provisioner: ebs.csi.aws.com
volumeBindingMode: WaitForFirstConsumer
parameters: {type: gp3}
YAML

say "Installing DataBridge (Helm)"
kubectl create namespace "$NS" --dry-run=client -o yaml | kubectl apply -f -
INGRESS_ARGS=()
[ -n "$HOST" ] && INGRESS_ARGS=(--set ingress.enabled=true --set ingress.className=nginx --set ingress.host="$HOST")
helm upgrade --install databridge deploy/helm/databridge -n "$NS" \
  --set image.repository="$REPO" --set image.tag="$TAG" \
  --set storage.storageClass=efs-sc --set metastore.storageClass=gp3 \
  --set spark.extraPackages=org.apache.hadoop:hadoop-aws:3.3.4 \
  --set-string 'nodeSelector.databridge\.io/pool=system' \
  "${INGRESS_ARGS[@]}" --wait --timeout 15m

say "Done"
cat <<MSG
1) Create the admin account (first sign-up becomes admin):
     kubectl -n $NS port-forward svc/databridge 8800:80      then open http://localhost:8800
2) Compute › Clusters › New cluster:
     Runs on: AWS (EKS)   Worker size: $SPARK_TYPE   Node pool: spark   (tick spot for the spark-spot group)
     Price per node-hour: the EC2 price for $SPARK_TYPE in $REGION (On-Demand or Spot).
3) Workers start on demand; nodes go back to zero after auto-stop + ~5 minutes.
MSG
