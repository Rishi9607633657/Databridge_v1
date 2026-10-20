# DataBridge on Kubernetes: Azure AKS, AWS EKS and Oracle OKE

DataBridge runs as one pod: the web app plus each notebook's Spark driver.
Spark **executors** run as separate pods on autoscaled node pools.

You create *clusters* in the UI (**Compute › Clusters**). Each cluster sets:

- worker size
- min and max workers
- auto-stop
- spot
- price per node-hour
- markup

A notebook or job picks its cluster from a drop-down, just like Databricks. Nobody edits YAML after the install.

```
                ┌──────────── Kubernetes ─────────────────────────────────────────┐
 browser ──▶ ingress ──▶ DataBridge pod (system pool, always on)                    │
                │          web app · notebook kernels = Spark drivers               │
                │             │  creates executor pods for the chosen cluster       │
                │             ▼                                                     │
                │   spark pool       (0..N nodes, autoscaled)  ← normal clusters    │
                │   spark-spot pool  (0..N nodes, autoscaled)  ← "spot" clusters    │
                │   shared ReadWriteMany disk: notebooks + Delta tables             │
                │   Postgres: Hive metastore (table catalog)                        │
                └─────────────────────────────────────────────────────────────────┘
```

## How the cost automation works

1. A notebook attaches to a cluster, for example "Analytics (AKS)": E8s_v5 workers, 0–10, spot, 20 min auto-stop.
2. Spark asks for executor pods. They are *pending*, so the cloud's cluster autoscaler adds nodes to `spark-spot`.
3. When the work stops, executors idle out after the cluster's **auto-stop** minutes. The autoscaler removes the empty nodes about 5 minutes later. An idle cluster costs nothing.
4. Every minute, DataBridge records kernel-minutes and running executor pods per cluster and per user. There is one executor per node, so executor-minutes are node-minutes.
5. **Compute › Usage and cost** shows node-hours × your price per node-hour = cloud cost, plus your markup % = the charge. **Download CSV** gives you the data for invoices.

> The price per node-hour is the number you type into the cluster, from the cloud price list. DataBridge doesn't read your cloud bill. Check it against the bill each month and adjust the price if needed.

## 1. Build the Docker image

One image does both jobs: it runs the DataBridge server and the Spark executors. Notebooks and executors therefore always have the same Python, pyspark and libraries.

- **Azure:** `aks.sh` builds the image in Azure with `az acr build`, so you don't need Docker on your PC.
- **AWS and Oracle:** build on your PC with Docker Desktop (PowerShell, in the DataBridge folder).

```powershell
cd C:\Users\Hp\Downloads\stratum\stratum
docker build -t databridge:1.0 .

# try it locally first (http://localhost:8800)
docker run --rm -p 8800:8800 -v ${PWD}\workspace:/app/workspace databridge:1.0

# AWS ECR
aws ecr create-repository --repository-name databridge --region ap-south-1
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.ap-south-1.amazonaws.com
docker tag databridge:1.0 <account>.dkr.ecr.ap-south-1.amazonaws.com/databridge:1.0
docker push <account>.dkr.ecr.ap-south-1.amazonaws.com/databridge:1.0

# Oracle OCIR (user = <tenancy-namespace>/<user>, password = an Auth token)
docker login bom.ocir.io
docker tag databridge:1.0 bom.ocir.io/<tenancy-namespace>/databridge:1.0
docker push bom.ocir.io/<tenancy-namespace>/databridge:1.0
```

For Oracle Ampere (ARM) workers, build both architectures:

```
docker buildx build --platform linux/amd64,linux/arm64 -t <repo>:1.0 --push .
```

## 2. Create the Kubernetes cluster and install

Each script creates:

- a registry
- the Kubernetes cluster with a small always-on **system** pool
- a **spark** pool and a **spark-spot** pool that scale from 0
- the cluster autoscaler
- a shared ReadWriteMany disk
- DataBridge itself, via Helm

The scripts are safe to re-run; re-running is also how you upgrade.

| Cloud | Run in | Command |
|---|---|---|
| **Azure AKS** | Azure Cloud Shell (bash) | `bash deploy/azure/aks.sh` |
| **AWS EKS** | WSL / Git Bash with aws, eksctl, kubectl, helm, docker | `bash deploy/aws/eks.sh` |
| **Oracle OKE** | OCI Cloud Shell (create the cluster with *Quick create* first) | `bash deploy/oracle/oke.sh` |

To get the DataBridge folder into Cloud Shell, use **Upload** for `databridge-update.zip` and run `unzip databridge-update.zip && cd stratum`. Or clone your Git repo.

Settings are environment variables at the top of each script. Examples:

```bash
export LOCATION=southindia SPARK_VM=Standard_E16s_v5 SPARK_MAX=20 HOST=analytics.example.com
bash deploy/azure/aks.sh
```

Defaults:

| | Azure | AWS | Oracle |
|---|---|---|---|
| Region | centralindia | ap-south-1 | home region |
| System node | Standard_D4s_v5 | m6i.xlarge | Quick-create node |
| Spark workers | Standard_E8s_v5 (8 vCPU / 64 GB) | m6i.2xlarge (8 vCPU / 32 GB) | E5.Flex 4 OCPU / 32 GB |
| Shared disk | Azure Files Premium | EFS | OCI File Storage |
| Metastore disk | managed-csi | gp3 | oci-bv |

**New subscriptions have small vCPU quotas.** Raise them first: in Azure under *Quotas* (including the "Spot vCPUs" quota), in AWS under *Service Quotas › EC2*, in OCI under *Limits*.

## 3. First sign-in, then clusters

1. Create the admin account **before** exposing DataBridge. The first person to sign up becomes the admin.
   ```
   kubectl -n databridge port-forward svc/databridge 8800:80
   ```
   Then open http://localhost:8800 and sign up.
2. Go to **Compute › Clusters › New cluster**:
   - **Runs on:** Azure (AKS), AWS (EKS) or Oracle Cloud (OKE)
   - **Worker size:** the VM size of the node pool. Executors are sized to fill one node: vCPU − 1 cores and about 75% of the RAM.
   - **Node pool:** `spark`. Tick **spot** to run on `spark-spot`.
   - **Min / max workers:** 0 = scale to zero.
   - **Auto-stop:** idle minutes before workers are removed.
   - **Price per node-hour**, **markup %**, **currency**
3. In a notebook, pick the cluster in the header drop-down. For a job, pick it under **Run on**.
4. Set **Admin › Settings › Kubernetes › Default cluster** so new notebooks use it automatically.

### More worker sizes

The **Worker size** in the UI must match the VM size of the pool it runs on. To offer a second size, add a pool with its own label and use that label as the cluster's **Node pool**. Example for Azure:

```bash
az aks nodepool add -g databridge-rg --cluster-name databridge-aks -n big --mode User \
  --node-vm-size Standard_E16s_v5 --node-count 0 --enable-cluster-autoscaler --min-count 0 --max-count 10 \
  --labels databridge.io/pool=big
# spot version: add  --priority Spot --eviction-policy Delete --spot-max-price -1  and label databridge.io/pool=big-spot
```

- AWS: add a nodegroup with `eksctl create nodegroup`, using the same labels.
- Oracle: create a node pool with the initial label `databridge.io/pool=big`, then add it to the ClusterAutoscaler add-on's `nodes` setting.

## 4. Public URL (HTTPS)

**Azure:** run with `HOST=analytics.example.com`. The script turns on the managed NGINX ingress, then you point DNS at the IP it prints. For HTTPS, install cert-manager and add a TLS secret:

```bash
helm upgrade databridge deploy/helm/databridge -n databridge --reuse-values \
  --set 'ingress.tls[0].secretName=databridge-tls' --set 'ingress.tls[0].hosts[0]=analytics.example.com' \
  --set 'ingress.annotations.cert-manager\.io/cluster-issuer=letsencrypt'
```

**AWS / Oracle:** install ingress-nginx first, then run the script with `HOST=...`:

```bash
helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx -n ingress-nginx --create-namespace
```

**Without a load balancer:** the Cloudflare Tunnel setup in `deploy/cloudflare` also works. Point it at `http://databridge.databridge.svc:80`.

Sign-in is always on (`AUTH_ENABLED=true`). Never turn it off on a public URL.

## 5. Data in object storage (optional)

Tables on the shared disk work out of the box. For lake storage, use full paths in notebooks:

- **Azure ADLS Gen2:** `abfss://container@account.dfs.core.windows.net/...`. Add the key to the install:
  ```
  --set extraSecretEnv.ADLS_ACCOUNT=<account> --set extraSecretEnv.ADLS_KEY=<key>
  ```
- **AWS S3:** `s3a://bucket/...`. The scripts already add `hadoop-aws`. Give the node role S3 access, or set `extraSecretEnv.S3_ACCESS_KEY` / `S3_SECRET_KEY`.
- **OCI Object Storage:** `s3a://bucket/...` through the S3-compatible API:
  ```
  --set extraSecretEnv.S3_ENDPOINT=https://<namespace>.compat.objectstorage.<region>.oraclecloud.com \
  --set extraSecretEnv.S3_ACCESS_KEY=... --set extraSecretEnv.S3_SECRET_KEY=...
  ```
  Create the keys in *Profile › Customer secret keys*.

## Upgrade, back up, remove

- **Upgrade:** re-run the script. It builds a new image tag and runs `helm upgrade`. Data stays on the shared disk.
- **Back up:**
  - The shared disk holds notebooks, tables, users and settings: back it up with Azure Files backup, AWS Backup for EFS, or OCI FSS snapshots.
  - Also back up the metastore volume (`pg-databridge-metastore-0`) or dump it:
    ```
    kubectl exec -n databridge databridge-metastore-0 -- pg_dump -U hive hive_metastore > hms.sql
    ```
- **Remove:** `helm uninstall databridge -n databridge` keeps the data disk, because it is annotated "keep". To delete everything:
  - Azure: `az group delete -n databridge-rg`
  - AWS: `eksctl delete cluster`, then delete the EFS file system
  - Oracle: delete the cluster in the Console

## Troubleshooting

| Symptom | Fix |
|---|---|
| Executors stay `Pending` | `kubectl -n databridge describe pod <executor>`. "Insufficient cpu/memory" means the cluster's Worker size is bigger than the pool's VM. "didn't match node selector" means no pool has that `databridge.io/pool` label. Check the autoscaler max and the cloud quota. |
| `ImagePullBackOff` on executors | On OKE, the `ocir-secret` must exist in the namespace (the script creates it from `OCIR_USER` / `OCIR_TOKEN`). |
| Table written but executors can't read it | The shared disk must be ReadWriteMany (`kubectl get pvc -n databridge`). |
| Notebook "Starting Spark…" for minutes | The first start downloads the Delta and Hadoop jars into the shared disk. Later starts are fast. |
| Usage shows hours but no node-hours | Executors only run while Spark has work, and then auto-stop. Node-hours stay at 0 for a cluster that never started workers. |
