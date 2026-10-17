"""Presenter voice: human-like neural text-to-speech for dashboard presentations.

Engines (Admin › Settings › Voice):
  edge        Microsoft Edge neural voices via the free `edge-tts` package (no key; needs internet). Default.
  openai      OpenAI TTS (OPENAI_API_KEY) — gpt-4o-mini-tts follows speaking-style instructions.
  elevenlabs  ElevenLabs (ELEVENLABS_API_KEY) — most realistic, paid.
  browser     no server voice; the browser's own speech is used.
Audio is cached on disk by (engine, voice, speed, text), so replaying a deck is instant."""
import asyncio
import hashlib
import time

import httpx
from fastapi import HTTPException

from .settings import DATA_ROOT, env

CACHE = DATA_ROOT / ".stratum" / "tts_cache"
MAX_CHARS = 4000

EDGE_VOICES = [
    ("en-IN-NeerjaExpressiveNeural", "Neerja · Indian English · female · expressive"),
    ("en-IN-NeerjaNeural", "Neerja · Indian English · female"),
    ("en-IN-PrabhatNeural", "Prabhat · Indian English · male"),
    ("en-US-AvaMultilingualNeural", "Ava · US · female · warm"),
    ("en-US-EmmaMultilingualNeural", "Emma · US · female · friendly"),
    ("en-US-AndrewMultilingualNeural", "Andrew · US · male · confident"),
    ("en-US-BrianMultilingualNeural", "Brian · US · male · casual"),
    ("en-US-JennyNeural", "Jenny · US · female"),
    ("en-US-AriaNeural", "Aria · US · female · news"),
    ("en-GB-SoniaNeural", "Sonia · British · female"),
    ("en-GB-RyanNeural", "Ryan · British · male"),
    ("en-AU-NatashaNeural", "Natasha · Australian · female"),
    ("hi-IN-SwaraNeural", "Swara · Hindi · female"),
    ("hi-IN-MadhurNeural", "Madhur · Hindi · male"),
]
OPENAI_VOICES = [(v, f"{v.title()} · OpenAI") for v in ("nova", "shimmer", "coral", "sage", "alloy", "ash", "ballad", "echo", "fable", "onyx", "verse")]
ELEVEN_DEFAULT = [("21m00Tcm4TlvDq8ikWAM", "Rachel · calm narrator"), ("EXAVITQu4vr4xnSDxMaL", "Sarah · soft"), ("pNInz6obpgDQGcFmaJgB", "Adam · deep"),
                  ("ErXwobaYiN019PkySvjV", "Antoni · well-rounded")]
LABELS = {"edge": "Edge neural", "openai": "OpenAI", "elevenlabs": "ElevenLabs", "browser": "Browser"}
STYLE = ("Speak like a warm, confident business presenter giving a dashboard walkthrough to a leadership team: "
         "natural pace, clear numbers, slight emphasis on changes and key takeaways, short pauses between ideas.")
_eleven_cache = {"at": 0, "voices": None}


def engine():
    e = (env("TTS_ENGINE", "edge") or "edge").strip().lower()
    return e if e in LABELS else "edge"


def _available(e):
    if e == "edge":
        try:
            import edge_tts  # noqa: F401
            return True
        except ImportError:
            return False
    if e == "openai":
        return bool(env("OPENAI_API_KEY"))
    if e == "elevenlabs":
        return bool(env("ELEVENLABS_API_KEY"))
    return False


async def _voices(e):
    if e == "edge":
        return EDGE_VOICES
    if e == "openai":
        return OPENAI_VOICES
    if e == "elevenlabs":
        if _eleven_cache["voices"] and time.time() - _eleven_cache["at"] < 3600:
            return _eleven_cache["voices"]
        try:
            async with httpx.AsyncClient(timeout=10) as c:
                r = await c.get("https://api.elevenlabs.io/v1/voices", headers={"xi-api-key": env("ELEVENLABS_API_KEY") or ""})
            if r.status_code == 200:
                vs = [(v["voice_id"], f"{v.get('name')} · {((v.get('labels') or {}).get('accent') or '').strip() or 'ElevenLabs'}") for v in r.json().get("voices", [])]
                if vs:
                    _eleven_cache.update(at=time.time(), voices=vs)
                    return vs
        except httpx.HTTPError:
            pass
        return ELEVEN_DEFAULT
    return []


def _default_voice(e):
    v = env("TTS_VOICE")
    if e == "edge":
        return v if v and "Neural" in v else EDGE_VOICES[0][0]
    if e == "openai":
        return v if v in dict(OPENAI_VOICES) else "nova"
    if e == "elevenlabs":
        return env("ELEVENLABS_VOICE_ID") or ELEVEN_DEFAULT[0][0]
    return ""


async def status():
    e = engine()
    ok = _available(e)
    hint = None
    if not ok and e == "edge":
        hint = "Install the free neural voices on the server: pip install edge-tts (then restart)."
    elif not ok and e in ("openai", "elevenlabs"):
        hint = f"Set the {e} API key in Admin › Settings › Voice."
    return {"engine": e, "engine_label": LABELS[e], "available": ok, "hint": hint,
            "voices": [{"id": i, "label": l} for i, l in (await _voices(e) if ok else [])], "default_voice": _default_voice(e)}


async def speak(text: str, voice: str | None, rate: int = 0) -> bytes:
    e = engine()
    if e == "browser" or not _available(e):
        raise HTTPException(503, "Neural voice is not set up on the server")
    text = " ".join((text or "").split())[:MAX_CHARS]
    if not text:
        raise HTTPException(400, "Nothing to say")
    voice = (voice or _default_voice(e)).strip()
    rate = max(-50, min(50, int(rate or 0)))
    key = hashlib.sha256(f"{e}|{voice}|{rate}|{text}".encode()).hexdigest()[:40]
    f = CACHE / f"{key}.mp3"
    if f.exists():
        return f.read_bytes()
    if e == "edge":
        data = await _edge(text, voice, rate)
    elif e == "openai":
        data = await _openai(text, voice, rate)
    else:
        data = await _eleven(text, voice, rate)
    CACHE.mkdir(parents=True, exist_ok=True)
    f.write_bytes(data)
    _prune()
    return data


_BAD_VOICES = set()


async def _edge(text, voice, rate):
    import edge_tts
    if not voice.endswith("Neural") or voice in _BAD_VOICES:
        voice = "en-IN-NeerjaNeural"
    out = bytearray()
    err = None
    try:
        comm = edge_tts.Communicate(text, voice, rate=f"{rate:+d}%")
        async for chunk in comm.stream():
            if chunk.get("type") == "audio":
                out += chunk["data"]
    except Exception as e:  # noqa: BLE001
        err = e
    if not out:
        if voice != "en-IN-NeerjaNeural":            # voice not offered (any more): remember and use the standard Neerja
            _BAD_VOICES.add(voice)
            return await _edge(text, "en-IN-NeerjaNeural", rate)
        raise HTTPException(502, f"Edge neural voice failed (it needs internet access): {err or 'no audio'}")
    return bytes(out)


async def _openai(text, voice, rate):
    model = env("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
    body = {"model": model, "voice": voice or "nova", "input": text, "response_format": "mp3"}
    if model.startswith("gpt-4o"):
        body["instructions"] = env("TTS_STYLE") or STYLE
    if rate:
        body["speed"] = round(1 + rate / 100, 2)
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post("https://api.openai.com/v1/audio/speech", json=body,
                         headers={"Authorization": f"Bearer {env('OPENAI_API_KEY')}"})
    if r.status_code >= 400:
        raise HTTPException(502, f"OpenAI TTS: {r.text[:300]}")
    return r.content


async def _eleven(text, voice, rate):
    model = env("ELEVENLABS_MODEL", "eleven_multilingual_v2")
    body = {"text": text, "model_id": model,
            "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.3, "use_speaker_boost": True,
                               **({"speed": round(max(0.7, min(1.2, 1 + rate / 100)), 2)} if rate else {})}}
    async with httpx.AsyncClient(timeout=120) as c:
        r = await c.post(f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128", json=body,
                         headers={"xi-api-key": env("ELEVENLABS_API_KEY") or "", "Accept": "audio/mpeg"})
    if r.status_code >= 400:
        raise HTTPException(502, f"ElevenLabs: {r.text[:300]}")
    return r.content


def _prune(max_files=800):
    try:
        files = sorted(CACHE.glob("*.mp3"), key=lambda p: p.stat().st_mtime)
        for p in files[:-max_files]:
            p.unlink(missing_ok=True)
    except OSError:
        pass


# ---------------- saved dashboard themes (shared by all dashboards) ----------------
import json as _json  # noqa: E402
import re as _re  # noqa: E402
import uuid as _uuid  # noqa: E402

THEMES = DATA_ROOT / ".stratum" / "dashboard_themes.json"


def themes_list():
    try:
        return _json.loads(THEMES.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return []


def theme_save(body, user=None):
    name = (body.get("name") or "").strip()[:60]
    if not name:
        raise HTTPException(400, "Theme name is required")
    base = body.get("base") or "clean"
    if not _re.fullmatch(r"[a-z0-9-]{1,40}", base):
        raise HTTPException(400, "Bad base theme")
    custom = body.get("custom") or {}
    allowed = {"bg", "card", "text", "muted", "accent", "head", "headText", "line", "grid", "radius", "blur", "font", "surface", "palette", "dark", "headLight"}
    custom = {k: v for k, v in custom.items() if k in allowed}
    if len(_json.dumps(custom)) > 4000:
        raise HTTPException(400, "Theme is too large")
    items = themes_list()
    t = {"id": "u-" + _uuid.uuid4().hex[:8], "name": name, "base": base, "custom": custom, "user": user, "created": time.time()}
    items.append(t)
    THEMES.parent.mkdir(parents=True, exist_ok=True)
    THEMES.write_text(_json.dumps(items, indent=1), encoding="utf-8")
    return t


def theme_delete(tid):
    items = [t for t in themes_list() if t["id"] != tid]
    THEMES.write_text(_json.dumps(items, indent=1), encoding="utf-8")
    return {"ok": True}


_ = asyncio  # keep import for type checkers
