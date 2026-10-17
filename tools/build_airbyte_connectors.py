"""Build DataBridge's Airbyte connector catalog from GitHub — same as Data Hub › Connector catalog › Build, from the command line.

  python tools/build_airbyte_connectors.py                 # clone/update github.com/airbytehq/airbyte (definitions only) + index
  python tools/build_airbyte_connectors.py --install-runner # also pip-install the shared runner for the ~500 API connectors
  python tools/build_airbyte_connectors.py --install stripe hubspot faker   # prepare specific connectors (pip / docker pull)
  python tools/build_airbyte_connectors.py --list shopify   # search the built catalog

Settings come from .env (AIRBYTE_REPO_URL, AIRBYTE_REPO_BRANCH, AIRBYTE_CDK_SPEC, AIRBYTE_PYTHON)."""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend import airbyte_local  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--install-runner", action="store_true", help="install the shared runner (airbyte-cdk) for API connectors")
    ap.add_argument("--install", nargs="*", default=[], metavar="CONNECTOR", help="prepare these connectors (e.g. stripe faker)")
    ap.add_argument("--list", nargs="?", const="", metavar="SEARCH", help="list connectors in the built catalog")
    ap.add_argument("--skip-build", action="store_true", help="don't pull from GitHub")
    a = ap.parse_args()
    if a.list is not None:
        for c in airbyte_local.catalog():
            if a.list.lower() in f"{c['id']} {c['name']}".lower():
                print(f"{c['id']:<34} {c['runtime']:<9} {c['support']:<10} {c['name']}")
        return
    if not a.skip_build:
        airbyte_local.build_catalog()
        print("\n".join(airbyte_local._jobs["build"]["log"]))
        if airbyte_local._jobs["build"]["state"] != "done":
            sys.exit(1)
    todo = list(a.install)
    if a.install_runner:
        first_api = next((c["id"] for c in airbyte_local.catalog() if c["runtime"] == "manifest"), None)
        if first_api:
            todo.insert(0, first_api)
    for cid in todo:
        airbyte_local.install(cid)
        j = airbyte_local._jobs[f"install:{cid}"]
        print("\n".join(j["log"]))
        if j["state"] != "done":
            sys.exit(1)


if __name__ == "__main__":
    main()
