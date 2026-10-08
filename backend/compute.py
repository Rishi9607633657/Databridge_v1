"""Compute: Spark applications managed by the Kubeflow Spark Operator on Kubernetes."""
from fastapi import HTTPException

from .settings import settings

GROUP, VERSION, PLURAL = "sparkoperator.k8s.io", "v1beta2", "sparkapplications"
_api = None


def _clients():
    global _api
    if not settings.k8s_enabled:
        raise HTTPException(503, "Kubernetes is not enabled (set K8S_ENABLED=true)")
    if _api is None:
        from kubernetes import client, config
        try:
            config.load_incluster_config()
        except Exception:  # noqa: BLE001
            config.load_kube_config()
        _api = (client.CustomObjectsApi(), client.CoreV1Api())
    return _api


def spark_apps():
    co, _ = _clients()
    items = co.list_namespaced_custom_object(GROUP, VERSION, settings.spark_namespace, PLURAL)["items"]
    out = []
    for a in items:
        spec, st = a.get("spec", {}), a.get("status", {})
        ex = spec.get("executor", {})
        dyn = spec.get("dynamicAllocation", {})
        out.append({
            "name": a["metadata"]["name"], "created": a["metadata"].get("creationTimestamp"),
            "state": (st.get("applicationState") or {}).get("state", "PENDING"),
            "error": (st.get("applicationState") or {}).get("errorMessage"),
            "image": spec.get("image"), "spark_version": spec.get("sparkVersion"), "mode": spec.get("mode"),
            "main": spec.get("mainApplicationFile"),
            "driver": {"cores": spec.get("driver", {}).get("cores"), "memory": spec.get("driver", {}).get("memory")},
            "executor": {"instances": ex.get("instances"), "cores": ex.get("cores"), "memory": ex.get("memory")},
            "autoscale": {"enabled": dyn.get("enabled", False), "min": dyn.get("minExecutors"), "max": dyn.get("maxExecutors")},
            "executors_running": sum(1 for s in (st.get("executorState") or {}).values() if s == "RUNNING"),
            "driver_pod": (st.get("driverInfo") or {}).get("podName"),
            "ui": (st.get("driverInfo") or {}).get("webUIIngressAddress"),
        })
    out.sort(key=lambda a: a["created"] or "", reverse=True)
    return out


def driver_log(name, tail=500):
    co, core = _clients()
    app = co.get_namespaced_custom_object(GROUP, VERSION, settings.spark_namespace, PLURAL, name)
    pod = (app.get("status", {}).get("driverInfo") or {}).get("podName")
    if not pod:
        raise HTTPException(404, "Driver pod not created yet")
    try:
        return core.read_namespaced_pod_log(pod, settings.spark_namespace, tail_lines=tail)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(404, f"Driver log unavailable: {e}")


def delete_app(name):
    co, _ = _clients()
    co.delete_namespaced_custom_object(GROUP, VERSION, settings.spark_namespace, PLURAL, name)
    return {"ok": True}
