"""ADF-style dynamic content:  "@pipeline().parameters.site"  and  "path/@{formatDateTime(utcNow(),'yyyy-MM-dd')}".

Supported: literals ('text', 12, 1.5, true, false, null), property access (.name, ['name'], [0]),
functions: pipeline, variables, activity, item, trigger, utcNow, formatDateTime, addDays, addHours, addMinutes,
addSeconds, startOfDay, concat, equals, not, and, or, greater, greaterOrEquals, less, lessOrEquals, if, coalesce,
string, int, float, bool, json, length, empty, contains, startsWith, endsWith, indexOf, toLower, toUpper, trim,
replace, substring, split, join, first, last, take, skip, createArray, range, add, sub, mul, div, mod, max, min,
guid, base64, uriComponent."""
import base64 as _b64
import json
import re
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import quote


class ExpressionError(Exception):
    pass


_TOKEN = re.compile(r"\s*(?:(?P<num>-?\d+(?:\.\d+)?)|(?P<str>'(?:[^']|'')*')|(?P<id>[A-Za-z_][\w]*)|(?P<p>[().,\[\]?]))")


def _tokens(src):
    pos, out = 0, []
    while pos < len(src):
        if src[pos:].strip() == "":
            break
        m = _TOKEN.match(src, pos)
        if not m or m.end() == pos:
            raise ExpressionError(f"Unexpected text in expression at: {src[pos:pos + 20]!r}")
        pos = m.end()
        kind = m.lastgroup
        val = m.group(kind)
        if kind == "num":
            out.append(("num", float(val) if "." in val else int(val)))
        elif kind == "str":
            out.append(("str", val[1:-1].replace("''", "'")))
        else:
            out.append((kind, val))
    return out


def _dotnet_fmt(fmt):
    """.NET date format -> strftime (the common ADF patterns)."""
    rep = [("yyyy", "%Y"), ("yy", "%y"), ("MMMM", "%B"), ("MMM", "%b"), ("MM", "%m"), ("dddd", "%A"), ("ddd", "%a"),
           ("dd", "%d"), ("HH", "%H"), ("hh", "%I"), ("mm", "%M"), ("ss", "%S"), ("fff", "%f"), ("tt", "%p")]
    out, i = "", 0
    while i < len(fmt):
        for k, v in rep:
            if fmt.startswith(k, i):
                out += v
                i += len(k)
                break
        else:
            out += fmt[i]
            i += 1
    return out


def _parse_ts(v):
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
    s = str(v).replace("Z", "+00:00")
    d = datetime.fromisoformat(s)
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def _fmt_ts(d, fmt=None):
    if not fmt:
        return d.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    s = d.strftime(_dotnet_fmt(fmt))
    return s.replace(d.strftime("%f"), d.strftime("%f")[:3]) if "fff" in fmt else s


def _get(obj, key):
    if obj is None:
        return None
    if isinstance(obj, dict):
        if key in obj:
            return obj[key]
        low = {str(k).lower(): v for k, v in obj.items()}
        return low.get(str(key).lower())
    if isinstance(obj, (list, tuple, str)) and isinstance(key, int):
        return obj[key] if -len(obj) <= key < len(obj) else None
    return getattr(obj, key, None)


class Evaluator:
    def __init__(self, ctx):
        self.ctx = ctx  # dict with pipeline, variables, activity(fn), item, trigger

    def fn(self, name, args):
        n = name.lower()
        c = self.ctx
        now = datetime.now(timezone.utc)
        f = {
            "pipeline": lambda: c.get("pipeline", {}),
            "variables": lambda k: c.get("variables", {}).get(k),
            "activity": lambda k: c["activity"](k),
            "item": lambda: c.get("item"),
            "trigger": lambda: c.get("trigger", {}),
            "utcnow": lambda fmt=None: _fmt_ts(now, fmt),
            "formatdatetime": lambda ts, fmt=None: _fmt_ts(_parse_ts(ts), fmt),
            "adddays": lambda ts, n, fmt=None: _fmt_ts(_parse_ts(ts) + timedelta(days=n), fmt),
            "addhours": lambda ts, n, fmt=None: _fmt_ts(_parse_ts(ts) + timedelta(hours=n), fmt),
            "addminutes": lambda ts, n, fmt=None: _fmt_ts(_parse_ts(ts) + timedelta(minutes=n), fmt),
            "addseconds": lambda ts, n, fmt=None: _fmt_ts(_parse_ts(ts) + timedelta(seconds=n), fmt),
            "startofday": lambda ts, fmt=None: _fmt_ts(_parse_ts(ts).replace(hour=0, minute=0, second=0, microsecond=0), fmt),
            "concat": lambda *a: "".join("" if x is None else (json.dumps(x) if isinstance(x, (dict, list)) else str(x)) for x in a),
            "equals": lambda a, b: a == b,
            "not": lambda a: not a,
            "and": lambda *a: all(a),
            "or": lambda *a: any(a),
            "greater": lambda a, b: a > b, "greaterorequals": lambda a, b: a >= b,
            "less": lambda a, b: a < b, "lessorequals": lambda a, b: a <= b,
            "if": lambda cond, a, b: a if cond else b,
            "coalesce": lambda *a: next((x for x in a if x is not None), None),
            "string": lambda a: json.dumps(a) if isinstance(a, (dict, list)) else ("" if a is None else str(a)),
            "int": lambda a: int(float(a)), "float": lambda a: float(a),
            "bool": lambda a: a if isinstance(a, bool) else str(a).lower() in ("true", "1", "yes"),
            "json": lambda a: json.loads(a) if isinstance(a, str) else a,
            "length": lambda a: len(a or []), "empty": lambda a: not a,
            "contains": lambda a, b: (b in a) if a is not None else False,
            "startswith": lambda a, b: str(a).lower().startswith(str(b).lower()),
            "endswith": lambda a, b: str(a).lower().endswith(str(b).lower()),
            "indexof": lambda a, b: str(a).lower().find(str(b).lower()),
            "tolower": lambda a: str(a).lower(), "toupper": lambda a: str(a).upper(), "trim": lambda a: str(a).strip(),
            "replace": lambda a, o, nw: str(a).replace(str(o), str(nw)),
            "substring": lambda a, s, ln=None: str(a)[s:] if ln is None else str(a)[s:s + ln],
            "split": lambda a, d: str(a).split(d), "join": lambda a, d: str(d).join(str(x) for x in a),
            "first": lambda a: a[0] if a else None, "last": lambda a: a[-1] if a else None,
            "take": lambda a, n: a[:n], "skip": lambda a, n: a[n:],
            "createarray": lambda *a: list(a), "range": lambda s, cnt: list(range(s, s + cnt)),
            "add": lambda a, b: a + b, "sub": lambda a, b: a - b, "mul": lambda a, b: a * b,
            "div": lambda a, b: a // b if isinstance(a, int) and isinstance(b, int) else a / b, "mod": lambda a, b: a % b,
            "max": lambda *a: max(a[0] if len(a) == 1 else a), "min": lambda *a: min(a[0] if len(a) == 1 else a),
            "guid": lambda: str(uuid.uuid4()), "base64": lambda a: _b64.b64encode(str(a).encode()).decode(),
            "uricomponent": lambda a: quote(str(a), safe=""),
        }.get(n)
        if f is None:
            raise ExpressionError(f"Unknown function {name}()")
        try:
            return f(*args)
        except ExpressionError:
            raise
        except Exception as e:  # noqa: BLE001
            raise ExpressionError(f"{name}(): {e}")

    def evaluate(self, src):
        self.toks = _tokens(src)
        self.i = 0
        v = self._expr()
        if self.i != len(self.toks):
            raise ExpressionError(f"Unexpected {self.toks[self.i][1]!r} in expression")
        return v

    def _peek(self, v=None):
        if self.i >= len(self.toks):
            return None
        t = self.toks[self.i]
        return t if v is None or t[1] == v else None

    def _eat(self, v):
        if not self._peek(v):
            raise ExpressionError(f"Expected {v!r}")
        self.i += 1

    def _expr(self):
        t = self._peek()
        if t is None:
            raise ExpressionError("Unexpected end of expression")
        self.i += 1
        if t[0] in ("num", "str"):
            val = t[1]
        elif t[0] == "id" and self._peek("("):
            self._eat("(")
            args = []
            if not self._peek(")"):
                args.append(self._expr())
                while self._peek(","):
                    self._eat(",")
                    args.append(self._expr())
            self._eat(")")
            val = self.fn(t[1], args)
        elif t[0] == "id" and t[1].lower() in ("true", "false", "null"):
            val = {"true": True, "false": False, "null": None}[t[1].lower()]
        else:
            raise ExpressionError(f"Unexpected {t[1]!r}")
        while True:
            if self._peek("?"):
                self._eat("?")
            if self._peek("."):
                self._eat(".")
                name = self._peek()
                if not name or name[0] != "id":
                    raise ExpressionError("Expected a property name after '.'")
                self.i += 1
                val = _get(val, name[1])
            elif self._peek("["):
                self._eat("[")
                key = self._expr()
                self._eat("]")
                val = _get(val, key)
            else:
                return val


def evaluate(value, ctx):
    """Evaluate dynamic content recursively in strings, lists and dicts."""
    if isinstance(value, dict):
        if set(value.keys()) == {"value", "type"} and value.get("type") == "Expression":
            return evaluate(value["value"], ctx)
        return {k: evaluate(v, ctx) for k, v in value.items()}
    if isinstance(value, list):
        return [evaluate(v, ctx) for v in value]
    if not isinstance(value, str):
        return value
    if value.startswith("@@"):
        return value[1:]
    if value.startswith("@") and not value.startswith("@{"):
        return Evaluator(ctx).evaluate(value[1:])
    if "@{" not in value:
        return value

    def rep(m):
        v = Evaluator(ctx).evaluate(m.group(1))
        return json.dumps(v) if isinstance(v, (dict, list)) else ("" if v is None else str(v))
    return re.sub(r"@\{((?:[^{}']|'(?:[^']|'')*')*)\}", rep, value)
