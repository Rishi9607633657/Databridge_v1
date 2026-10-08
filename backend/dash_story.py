"""AI dashboard presenter: turns a dashboard page into slides with narration.
The browser sends facts it already computed (KPI values, chart stats, Smart Insights); we ask Dora's model for a story
as JSON, and fall back to a rule-based narrator so it always works without an AI key."""
import json
import re

from . import assistant

SYSTEM = """You are a senior business analyst presenting a dashboard to the business owner.
Return ONLY a JSON object (no prose, no markdown fences) with this shape:
{"title": str, "subtitle": str, "summary": str,
 "kpi": {"headline": str, "narration": str},
 "slides": [{"id": "<widget id from the input>", "headline": str, "narration": str, "bullets": [str], "action": str}],
 "closing": {"headline": str, "bullets": [str]}}
Rules:
- Use ONLY the numbers given. Never invent values, dates or causes; say "the data suggests" when inferring.
- summary: 3 conversational sentences — how things went overall, the biggest change, the main risk or opportunity.
- One slide per chart widget id given, in the same order. headline: max 10 words, states the finding (not the chart name).
- narration: 2-4 warm, conversational sentences a human presenter would SAY — explain what happened, why it matters and what it means for the business (e.g. "Sales climbed steadily through the month, and West carried most of that growth."). Never read out chart titles, axis labels or lists; round numbers naturally ("about ₹38 lakh"). bullets: 2-3 short key numbers for the slide. action: one practical next step.
- closing: 3 concrete next steps.
- Use the currency and units exactly as provided. Plain English for a non-technical owner."""


def _fmt_pct(x):
    return f"{x * 100:+.1f}%" if isinstance(x, (int, float)) else "n/a"


def rule_story(b):
    name = b.get("name") or "Dashboard"
    kpis = [f for f in b.get("facts", []) if f.get("type") == "kpi"]
    charts = [f for f in b.get("facts", []) if f.get("type") != "kpi"]
    ins = b.get("insights") or []
    moved = sorted([k for k in kpis if isinstance(k.get("change"), (int, float)) and abs(k["change"]) >= 0.01], key=lambda k: -abs(k["change"]))
    good = [k for k in moved if (k["change"] > 0) != bool(k.get("lowerBetter"))]
    bad = [k for k in moved if k not in good]
    summ = []
    if kpis:
        lead = kpis[0]
        ch = lead.get("change")
        summ.append(f"{lead['title']} is {lead.get('value', '')}" + (f", {_fmt_pct(ch)} vs {lead.get('compare', 'the previous period')}." if isinstance(ch, (int, float)) and abs(ch) >= 0.01 else (", unchanged from the previous period." if isinstance(ch, (int, float)) else ".")))
    if moved:
        m = moved[0]
        summ.append(f"The biggest move is {m['title']} ({_fmt_pct(m['change'])}).")
    elif kpis:
        summ.append("The headline numbers are steady compared with the previous period.")
    bad_ins = [i for i in ins if not i.get("good")]
    if bad_ins:
        summ.append(f"Watch: {bad_ins[0].get('title')}.")
    elif ins:
        summ.append(f"Highlight: {ins[0].get('title')}.")
    slides = []
    for c in charts:
        st = c.get("stats") or {}
        bullets, narr = [], []
        if st.get("time"):
            flat = st.get("peak") and st.get("low") and st["peak"][1] == st["low"][1]
            if flat:
                narr.append(f"{c['title']} held steady at {st.get('last_fmt')} throughout the period.")
                bullets.append(f"Every point: {st.get('last_fmt')}")
            else:
                if st.get("first") is not None and st.get("last") is not None:
                    narr.append(f"{c['title']} moved from {st.get('first_fmt')} to {st.get('last_fmt')} over the period ({_fmt_pct(st.get('trend'))}).")
                if st.get("peak"):
                    bullets.append(f"Peak: {st['peak'][1]} on {st['peak'][0]}")
                if st.get("low"):
                    bullets.append(f"Lowest: {st['low'][1]} on {st['low'][0]}")
            head = ("Rising" if (st.get("trend") or 0) > 0.02 else "Falling" if (st.get("trend") or 0) < -0.02 else "Steady") + f" {c.get('metric', c['title']).lower()}"
            action = ("Stable — set a target so changes stand out." if flat else "Check what drove the peak and repeat it; investigate the lowest days.") if (st.get("trend") or 0) >= 0 else "Find the cause of the decline before it compounds — compare the worst days with normal ones."
        elif st.get("top"):
            share = st.get("top_share")
            narr.append(f"{st['top'][0]} leads with {st['top'][1]}" + (f", {share * 100:.0f}% of the total." if isinstance(share, (int, float)) else "."))
            if st.get("bottom") and st.get("count", 0) > 1:
                narr.append(f"{st['bottom'][0]} is lowest at {st['bottom'][1]}.")
            bullets = [f"Total: {st.get('total_fmt')}", f"{st.get('count')} {c.get('dimension') or 'group'}{'' if st.get('count') == 1 else 's'}"]
            head = f"{st['top'][0]} leads {c.get('metric', c['title']).lower()}"
            action = f"Use what works in {st['top'][0]} to lift {st['bottom'][0]}." if st.get("bottom") else "Focus effort where the share is highest."
        else:
            narr.append(f"{c['title']} on this page.")
            head, action = c["title"], "Review the details with the team."
        rel = [i for i in ins if i.get("widget") == c.get("id")][:1]
        if rel:
            narr.append(rel[0].get("text", ""))
        slides.append({"id": c["id"], "headline": head[:80], "narration": " ".join(narr), "bullets": bullets[:3], "action": action})
    closing = []
    for k in bad[:2]:
        closing.append(f"Act on {k['title']} ({_fmt_pct(k['change'])}) — find the driver this week.")
    for i in bad_ins[:2]:
        closing.append(f"Follow up: {i.get('title')}.")
    for k in good[:1]:
        closing.append(f"Keep doing what lifted {k['title']} ({_fmt_pct(k['change'])}).")
    if not closing:
        closing = ["Review the top and bottom performers with the team.", "Set targets for next period.", "Re-check this dashboard next week."]
    return {"title": name, "subtitle": b.get("period") or "", "summary": " ".join(summ) or f"An overview of {name}.",
            "kpi": {"headline": "Headline numbers", "narration": " ".join(f"{k['title']}: {k.get('value', '')}" + (f" ({_fmt_pct(k['change'])})" if isinstance(k.get("change"), (int, float)) else "") + "." for k in kpis[:6])},
            "slides": slides, "closing": {"headline": "What to do next", "bullets": closing[:4]}, "used_ai": False}


def _parse(text):
    t = text.strip()
    t = re.sub(r"^```(?:json)?|```$", "", t, flags=re.M).strip()
    a, z = t.find("{"), t.rfind("}")
    return json.loads(t[a:z + 1])


async def story(b):
    base = rule_story(b)
    if b.get("use_ai") is False:
        return base
    try:
        st = await assistant.status()
        if not st.get("ok"):
            return {**base, "note": "AI is not configured (Admin › Settings › Dora) — narrated by the built-in presenter."}
        facts = {"dashboard": b.get("name"), "period": b.get("period"), "currency": b.get("currency", "₹"),
                 "kpis": [{k: f.get(k) for k in ("title", "value", "previous", "change", "compare", "lowerBetter")} for f in b.get("facts", []) if f.get("type") == "kpi"],
                 "charts": [{"id": f["id"], "title": f["title"], "type": f.get("type"), "stats": f.get("stats"), "data": (f.get("summary") or "")[:1500]}
                            for f in b.get("facts", []) if f.get("type") != "kpi"],
                 "insights": [{k: i.get(k) for k in ("tag", "title", "text")} for i in (b.get("insights") or [])[:10]]}
        out = await assistant.complete([{"role": "system", "content": SYSTEM},
                                        {"role": "user", "content": json.dumps(facts, default=str)[:24000]}], max_tokens=3000)
        ai = _parse(out)
        ids = {s["id"] for s in base["slides"]}
        by_id = {s.get("id"): s for s in ai.get("slides", []) if s.get("id") in ids}
        slides = []
        for s in base["slides"]:                         # keep the dashboard's order; fill gaps with the rule-based slide
            a = by_id.get(s["id"]) or {}
            slides.append({"id": s["id"], "headline": str(a.get("headline") or s["headline"])[:100], "narration": str(a.get("narration") or s["narration"])[:900],
                           "bullets": [str(x)[:140] for x in (a.get("bullets") or s["bullets"])][:4], "action": str(a.get("action") or s["action"])[:240]})
        return {"title": str(ai.get("title") or base["title"])[:100], "subtitle": str(ai.get("subtitle") or base["subtitle"])[:140],
                "summary": str(ai.get("summary") or base["summary"])[:1200],
                "kpi": {"headline": str((ai.get("kpi") or {}).get("headline") or base["kpi"]["headline"])[:100],
                        "narration": str((ai.get("kpi") or {}).get("narration") or base["kpi"]["narration"])[:900]},
                "slides": slides,
                "closing": {"headline": str((ai.get("closing") or {}).get("headline") or base["closing"]["headline"])[:100],
                            "bullets": [str(x)[:200] for x in ((ai.get("closing") or {}).get("bullets") or base["closing"]["bullets"])][:5]},
                "used_ai": True}
    except Exception as e:  # noqa: BLE001
        return {**base, "note": f"AI story failed ({str(e)[:120]}) — narrated by the built-in presenter."}
