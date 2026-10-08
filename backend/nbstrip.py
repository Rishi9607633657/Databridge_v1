"""Git clean filter for notebooks: commit code only (no outputs / execution counts).

Called by git as:  nbstrip.py <path>   (stdin = working file, stdout = what gets committed)
- If the code is unchanged compared with HEAD (only outputs/run counts differ), emit HEAD's exact bytes,
  so running cells or re-saving never shows up as a change.
- Otherwise write the stripped notebook in the same JSON style as the committed version (indent, key order,
  trailing newline), so diffs only show real edits. New notebooks use the standard nbformat style."""
import json
import subprocess
import sys

TRANSIENT = ("execution", "collapsed", "scrolled", "databridge_display_id")


def strip(nb):
    for c in nb.get("cells", []):
        if c.get("cell_type") == "code":
            c["outputs"] = []
            c["execution_count"] = None
        md = c.get("metadata")
        if isinstance(md, dict):
            for k in TRANSIENT:
                md.pop(k, None)
    return nb


def essence(nb):
    """What a reviewer cares about: each cell's type and code. Ignores ids, outputs, run counts and line splitting."""
    out = []
    for c in nb.get("cells", []):
        src = c.get("source", "")
        out.append((c.get("cell_type"), "".join(src) if isinstance(src, list) else src))
    return out


def style_of(raw):
    """Find the json.dumps settings that reproduce the committed file exactly."""
    try:
        obj = json.loads(raw)
    except ValueError:
        return None
    for indent in (1, 2, 4, None):
        for sort in (True, False):
            for nl in (True, False):
                txt = json.dumps(obj, indent=indent, sort_keys=sort, ensure_ascii=False) + ("\n" if nl else "")
                if txt == raw:
                    return {"indent": indent, "sort_keys": sort, "nl": nl}
    return None


def main():
    data = sys.stdin.buffer.read()
    try:
        nb = strip(json.loads(data.decode("utf-8")))
    except Exception:  # noqa: BLE001  not a notebook we understand: pass through unchanged
        sys.stdout.buffer.write(data)
        return
    head = b""
    if len(sys.argv) > 1:
        try:
            head = subprocess.run(["git", "show", f"HEAD:{sys.argv[1]}"], capture_output=True, timeout=30).stdout
        except Exception:  # noqa: BLE001
            head = b""
    if head:
        try:
            if essence(json.loads(head.decode("utf-8"))) == essence(nb):
                sys.stdout.buffer.write(head)              # only outputs changed: nothing to commit
                return
        except Exception:  # noqa: BLE001
            pass
    st = style_of(head.decode("utf-8", "replace")) if head else None
    st = st or {"indent": 1, "sort_keys": True, "nl": True}   # nbformat's standard style
    out = json.dumps(nb, indent=st["indent"], sort_keys=st["sort_keys"], ensure_ascii=False) + ("\n" if st["nl"] else "")
    sys.stdout.buffer.write(out.encode("utf-8"))


if __name__ == "__main__":
    main()
