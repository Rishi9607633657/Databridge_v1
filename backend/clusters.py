"""Clusters (Databricks-style): named Spark compute that notebooks, the SQL editor and jobs attach to.

A cluster is a definition, not a running VM. When a kernel attaches to it, DataBridge starts that kernel's Spark driver
with the cluster's settings:
  local       Spark local[N] on the DataBridge machine (desktop, single VM)
  kubernetes  Spark client mode on Kubernetes (AKS, EKS, OKE or any cluster): executors are pods on the cluster's node
              pool, scaled by dynamic allocation between min and max workers; idle executors are removed after
              auto_stop_minutes, and the cloud's node-pool autoscaler then removes the empty nodes, so an idle cluster
              costs nothing.
Usage metering: every minute DataBridge records how many executors (≈ nodes) each cluster runs and for whom, so cost
per cluster / user / month = node-hours × price per node-hour × (1 + markup) — the basis for charging customers."""
import json
import os
import threading
import time
import uuid

from fastapi import HTTPException

from .jobs import store
from .settings import DATA_ROOT, ROOT, env

store.db.executescript("""
CREATE TABLE IF NOT EXISTS clusters (id TEXT PRIMARY KEY, name TEXT UNIQUE, spec TEXT, owner TEXT, created REAL, updated REAL);
CREATE TABLE IF NOT EXISTS cluster_usage (day TEXT, cluster_id TEXT, user TEXT, kernel_minutes REAL DEFAULT 0,
  executor_minutes REAL DEFAULT 0, PRIMARY KEY (day, cluster_id, user));
""")
store.db.commit()

# Node types offered in the UI per cloud (vCPU, memory GB). Prices are NOT built in — they change by region and over
# time; enter your price per node-hour on the cluster (from your cloud's price list or your contract).
NODE_TYPES = {
    "azure": [("Standard_D4s_v5", 4, 16), ("Standard_D8s_v5", 8, 32), ("Standard_D16s_v5", 16, 64),
              ("Standard_E4s_v5", 4, 32), ("Standard_E8s_v5", 8, 64), ("Standard_E16s_v5", 16, 128),
              ("Standard_F8s_v2", 8, 16), ("Standard_L8s_v3", 8, 64)],
    "aws": [("m6i.xlarge", 4, 16), ("m6i.2xlarge", 8, 32), ("m6i.4xlarge", 16, 64), ("r6i.xlarge", 4, 32),
            ("r6i.2xlarge", 8, 64), ("r6i.4xlarge", 16, 128), ("c6i.2xlarge", 8, 16), ("i4i.2xlarge", 8, 64)],
    "oracle": [("VM.Standard.E5.Flex 4 OCPU", 8, 32), ("VM.Standard.E5.Flex 8 OCPU", 16, 64),
               ("VM.Standard.A1.Flex 4 OCPU", 4, 24), ("VM.Standard.A1.Flex 8 OCPU", 8, 48),
               ("VM.Standard3.Flex 4 OCPU", 8, 64)],
    "local": [("This machine", os.cpu_count() or 4, 16)],
}
CLOUDS = {"local": "This machine", "azure": "Azure (AKS)", "aws": "AWS (EKS)", "oracle": "Oracle Cloud (OKE)", "kubernetes": "Other Kubernetes"}
SPOT_TAINTS = {"azure": ("kubernetes.azure.com/scalesetpriority", "spot"), "aws": ("eks.amazonaws.com/capacityType", "SPOT"),
               "oracle": ("oci.oraclecloud.com/preemptible", "true"), "kubernetes": ("databridge.io/spot", "true")}

DEFAULT = {"name": "", "cloud": "local", "node_type": "This machine", "vcpu": 4, "memory_gb": 16, "driver_memory": "2g",
           "min_workers": 0, "max_workers": 4, "spot": False, "auto_stop_minutes": 30, "node_pool": "spark",
           "price_per_node_hour": 0.0, "markup_pct": 0.0, "currency": "₹", "spark_conf": {}, "tags": {}, "description": ""}


def _now():
    return time.time()


def _row(r):
    spec = {**DEFAULT, **json.loads(r["spec"] or "{}")}
    return {"id": r["id"], **spec, "name": r["name"], "owner": r["owner"], "created": r["created"], "updated": r["updated"]}


def list_clusters():
    return [_row(r) for r in store.q("SELECT * FROM clusters ORDER BY name")]


def get(cid):
    r = store.one("SELECT * FROM clusters WHERE id=? OR name=?", (cid, cid))
    if not r:
        raise HTTPException(404, "Cluster not found")
    return _row(r)


def _clean(body):
    s = {**DEFAULT, **{k: v for k, v in (body or {}).items() if k in DEFAULT}}
    s["name"] = str(s["name"]).strip()
    if not s["name"]:
        raise HTTPException(400, "Give the cluster a name")
    if s["cloud"] not in CLOUDS:
        raise HTTPException(400, f"cloud must be one of {', '.join(CLOUDS)}")
    for k in ("vcpu", "min_workers", "max_workers", "auto_stop_minutes"):
        s[k] = max(0, int(s[k] or 0))
    s["vcpu"] = max(1, s["vcpu"])
    s["memory_gb"] = max(1.0, float(s["memory_gb"] or 1))
    s["max_workers"] = max(s["max_workers"], s["min_workers"], 1 if s["cloud"] != "local" else 0)
    s["price_per_node_hour"] = max(0.0, float(s["price_per_node_hour"] or 0))
    s["markup_pct"] = max(0.0, float(s["markup_pct"] or 0))
    s["spot"] = bool(s["spot"])
    if not isinstance(s["spark_conf"], dict):
        raise HTTPException(400, "Spark settings must be key: value pairs")
    s["spark_conf"] = {str(k): str(v) for k, v in s["spark_conf"].items() if str(k).strip()}
    return s


def save(body, cid=None, user=""):
    s = _clean(body)
    if cid:
        get(cid)
        try:
            store.x("UPDATE clusters SET name=?, spec=?, updated=? WHERE id=?", (s["name"], json.dumps(s), _now(), cid))
        except Exception:
            raise HTTPException(409, f"A cluster named {s['name']!r} already exists")
        return get(cid)
    cid = uuid.uuid4().hex[:10]
    try:
        store.x("INSERT INTO clusters (id, name, spec, owner, created, updated) VALUES (?,?,?,?,?,?)",
                (cid, s["name"], json.dumps(s), user, _now(), _now()))
    except Exception:
        raise HTTPException(409, f"A cluster named {s['name']!r} already exists")
    return get(cid)


def delete(cid):
    c = get(cid)
    store.x("DELETE FROM clusters WHERE id=?", (c["id"],))


def default_id():
    d = env("DEFAULT_CLUSTER", "")
    if d:
        try:
            return get(d)["id"]
        except HTTPException:
            return None
    return None


# ------------------------------------------------------------------ Spark settings for a kernel
def _gb(x):
    return f"{max(1, int(x))}g"


def spark_settings(c, app_name="databridge", user=""):
    """(master, conf) for a kernel attached to cluster c."""
    conf = {}
    if c["cloud"] == "local":
        cores = max(1, int(c["vcpu"]))
        conf["spark.driver.memory"] = c.get("driver_memory") or "2g"
        conf.update(c["spark_conf"])
        return f"local[{cores}]", conf

    # one executor per node: leave ~1 vCPU and ~25% memory for the OS, kubelet and memory overhead
    ex_cores = max(1, int(c["vcpu"]) - 1)
    ex_mem = max(1, int(float(c["memory_gb"]) * 0.75) - 1)
    ns = env("SPARK_NAMESPACE", "spark")
    conf.update({
        "spark.kubernetes.namespace": ns,
        "spark.kubernetes.container.image": env("SPARK_EXECUTOR_IMAGE", env("DATABRIDGE_IMAGE", "databridge-spark:latest")),
        "spark.kubernetes.container.image.pullPolicy": env("SPARK_IMAGE_PULL_POLICY", "IfNotPresent"),
        **({"spark.kubernetes.container.image.pullSecrets": env("SPARK_IMAGE_PULL_SECRETS")} if env("SPARK_IMAGE_PULL_SECRETS") else {}),
        "spark.kubernetes.authenticate.driver.serviceAccountName": env("SPARK_SERVICE_ACCOUNT", "databridge-spark"),
        "spark.kubernetes.executor.label.databridge-cluster": c["id"],
        "spark.kubernetes.executor.label.databridge-user": (user or "system")[:63].replace("@", "_at_"),
        "spark.kubernetes.executor.deleteOnTermination": "true",
        "spark.kubernetes.executor.podNamePrefix": f"db-{c['id']}-{uuid.uuid4().hex[:6]}",
        "spark.driver.memory": c.get("driver_memory") or "2g",
        "spark.driver.bindAddress": "0.0.0.0",
        "spark.executor.cores": str(ex_cores),
        "spark.executor.memory": _gb(ex_mem),
        "spark.dynamicAllocation.enabled": "true",
        "spark.dynamicAllocation.shuffleTracking.enabled": "true",
        "spark.dynamicAllocation.minExecutors": str(c["min_workers"]),
        "spark.dynamicAllocation.initialExecutors": str(c["min_workers"]),
        "spark.dynamicAllocation.maxExecutors": str(c["max_workers"]),
        "spark.dynamicAllocation.executorIdleTimeout": f"{max(1, c['auto_stop_minutes']) * 60}s",
        "spark.dynamicAllocation.shuffleTracking.timeout": f"{max(1, c['auto_stop_minutes']) * 60}s",
        "spark.sql.shuffle.partitions": str(max(8, ex_cores * max(1, c["max_workers"]) * 2)),
    })
    pod_ip = os.environ.get("POD_IP")
    if pod_ip:
        conf["spark.driver.host"] = pod_ip                     # executors call back to the kernel inside the DataBridge pod
    if os.environ.get("POD_NAME") and os.environ.get("POD_NAMESPACE") == ns:
        conf["spark.kubernetes.driver.pod.name"] = os.environ["POD_NAME"]   # executors are deleted if the DataBridge pod goes away
    conf["spark.kubernetes.executor.podTemplateFile"] = str(_pod_template(c))
    if env("SPARK_SHARED_PVC"):
        conf["spark.kubernetes.executor.podTemplateContainerName"] = "spark-kubernetes-executor"
    conf.update(c["spark_conf"])
    master = env("SPARK_K8S_MASTER", "k8s://https://kubernetes.default.svc:443")
    return master, conf


def _pod_template(c):
    """Executor pod template: run on the cluster's node pool (and tolerate spot/preemptible nodes when asked)."""
    label = env("SPARK_NODE_LABEL", "databridge.io/pool")
    pool = (c.get("node_pool") or "spark") + ("-spot" if c["spot"] else "")
    lines = ["apiVersion: v1", "kind: Pod", "spec:", "  nodeSelector:", f"    {label}: \"{pool}\""]
    if c["spot"]:
        key, val = SPOT_TAINTS.get(c["cloud"], SPOT_TAINTS["kubernetes"])
        lines += ["  tolerations:", f"  - key: \"{key}\"", "    operator: \"Equal\"", f"    value: \"{val}\"", "    effect: \"NoSchedule\""]
    pvc = env("SPARK_SHARED_PVC")
    if pvc:   # same shared disk as the DataBridge pod, so local table paths (workspace/spark-warehouse) work on executors
        mount = env("SPARK_SHARED_MOUNT", str(ROOT / "workspace"))
        sub = env("SPARK_SHARED_SUBPATH", "workspace")
        lines += ["  volumes:", "  - name: databridge-shared", "    persistentVolumeClaim:", f"      claimName: \"{pvc}\"",
                  "  containers:", "  - name: spark-kubernetes-executor", "    volumeMounts:", "    - name: databridge-shared",
                  f"      mountPath: \"{mount}\""] + ([f"      subPath: \"{sub}\""] if sub else [])
    d = DATA_ROOT / ".stratum" / "podtemplates"
    d.mkdir(parents=True, exist_ok=True)
    p = d / f"{c['id']}.yaml"
    p.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return p


def kernel_env(cid, app_name="databridge", user=""):
    """Environment for a kernel attached to cluster `cid` (consumed by config/spark_init.py)."""
    c = get(cid)
    master, conf = spark_settings(c, app_name, user)
    return {"SPARK_MASTER": master, "STRATUM_SPARK_CONF": json.dumps(conf), "SPARK_APP_NAME": f"{app_name}"[:60],
            "DATABRIDGE_CLUSTER_ID": c["id"], "DATABRIDGE_CLUSTER_USER": user or ""}


# ------------------------------------------------------------------ usage metering
_meter_lock = threading.Lock()


def _add_usage(day, cid, user, kernel_min=0.0, exec_min=0.0):
    with _meter_lock:
        store.x("INSERT INTO cluster_usage (day, cluster_id, user, kernel_minutes, executor_minutes) VALUES (?,?,?,?,?) "
                "ON CONFLICT(day, cluster_id, user) DO UPDATE SET kernel_minutes = kernel_minutes + excluded.kernel_minutes, "
                "executor_minutes = executor_minutes + excluded.executor_minutes", (day, cid, user, kernel_min, exec_min))


def _running_executors():
    """{(cluster_id, user): running executor pods} from Kubernetes, or {} when not on Kubernetes."""
    try:
        from kubernetes import client, config
        try:
            config.load_incluster_config()
        except Exception:  # noqa: BLE001
            config.load_kube_config()
        pods = client.CoreV1Api().list_namespaced_pod(env("SPARK_NAMESPACE", "spark"), label_selector="databridge-cluster,spark-role=executor")
    except Exception:  # noqa: BLE001
        return {}
    out = {}
    for p in pods.items:
        if (p.status.phase or "") != "Running":
            continue
        lb = p.metadata.labels or {}
        k = (lb.get("databridge-cluster"), lb.get("databridge-user", "system"))
        out[k] = out.get(k, 0) + 1
    return out


def meter_tick(kernel_sessions):
    """Called once a minute: one kernel-minute per live attached kernel, one executor-minute per running executor pod."""
    day = time.strftime("%Y-%m-%d")
    for ks in kernel_sessions:
        cid = (ks.extra_env or {}).get("DATABRIDGE_CLUSTER_ID")
        if cid:
            _add_usage(day, cid, (ks.extra_env or {}).get("DATABRIDGE_CLUSTER_USER") or "system", kernel_min=1)
    for (cid, user), n in _running_executors().items():
        if cid:
            _add_usage(day, cid, user, exec_min=n)


def usage(month=None):
    """Rows per cluster and user for a month (YYYY-MM): node-hours and cost."""
    month = month or time.strftime("%Y-%m")
    cl = {c["id"]: c for c in list_clusters()}
    rows = []
    for r in store.q("SELECT cluster_id, user, sum(kernel_minutes) AS km, sum(executor_minutes) AS em FROM cluster_usage "
                     "WHERE day LIKE ? GROUP BY cluster_id, user ORDER BY cluster_id, user", (f"{month}%",)):
        c = cl.get(r["cluster_id"]) or {"name": f"(deleted {r['cluster_id']})", "cloud": "", "price_per_node_hour": 0, "markup_pct": 0, "currency": "₹"}
        node_hours = (r["em"] or 0) / 60.0
        base = node_hours * float(c["price_per_node_hour"] or 0)
        rows.append({"cluster_id": r["cluster_id"], "cluster": c["name"], "cloud": c["cloud"], "user": r["user"],
                     "attached_hours": round((r["km"] or 0) / 60.0, 2), "node_hours": round(node_hours, 2),
                     "cost": round(base, 2), "charge": round(base * (1 + float(c["markup_pct"] or 0) / 100), 2), "currency": c["currency"]})
    return {"month": month, "rows": rows}


def live_status(kernel_sessions):
    ex = _running_executors()
    out = {}
    for c in list_clusters():
        kn = [ks for ks in kernel_sessions if (ks.extra_env or {}).get("DATABRIDGE_CLUSTER_ID") == c["id"]]
        out[c["id"]] = {"kernels": len(kn), "executors": sum(n for (cid, _), n in ex.items() if cid == c["id"]),
                        "state": "Running" if kn else "Idle (no cost)" if c["cloud"] != "local" else "Idle"}
    return out


def catalog():
    return {"clouds": CLOUDS, "node_types": {k: [{"name": n, "vcpu": v, "memory_gb": m} for n, v, m in t] for k, t in NODE_TYPES.items()},
            "default_cluster": default_id(), "on_kubernetes": bool(os.environ.get("KUBERNETES_SERVICE_HOST"))}
