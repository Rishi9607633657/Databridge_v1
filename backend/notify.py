"""Notifications: e-mail (SMTP), Slack and Microsoft Teams incoming webhooks.

Used by budgets, SQL alerts, data quality and jobs. Settings live in Admin › Settings › Notifications.
A destination is a dict: {"emails": ["a@x.com", ...], "slack": "<webhook url>" | "default" | "", "teams": ... }.
"default" means the webhook URL from settings."""
import json
import logging
import re
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr

import httpx

from .settings import env

log = logging.getLogger("databridge")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")


def public_url(path=""):
    base = (env("PUBLIC_URL", "") or "").rstrip("/")
    return f"{base}{path}" if base else ""


def configured():
    return {"email": bool(env("SMTP_HOST")), "slack": bool(env("NOTIFY_SLACK_WEBHOOK")), "teams": bool(env("NOTIFY_TEAMS_WEBHOOK"))}


def clean_dest(d):
    d = d or {}
    emails = d.get("emails") or []
    if isinstance(emails, str):
        emails = [x.strip() for x in re.split(r"[,;\s]+", emails) if x.strip()]
    bad = [e for e in emails if not _EMAIL.match(e)]
    if bad:
        from fastapi import HTTPException
        raise HTTPException(400, f"Not an e-mail address: {', '.join(bad)}")
    out = {"emails": emails[:50]}
    for k in ("slack", "teams"):
        v = (d.get(k) or "").strip()
        if v and v != "default" and not v.startswith("https://"):
            from fastapi import HTTPException
            raise HTTPException(400, f"{k.title()} webhook must be an https:// URL (or 'default')")
        out[k] = v
    return out


def _webhook(kind, v):
    if not v:
        return ""
    return (env("NOTIFY_SLACK_WEBHOOK" if kind == "slack" else "NOTIFY_TEAMS_WEBHOOK", "") or "") if v == "default" else v


def send_email(to, subject, text, html=None):
    host = env("SMTP_HOST")
    if not host:
        raise RuntimeError("E-mail is not set up (Admin › Settings › Notifications › SMTP server)")
    port = int(env("SMTP_PORT", "587") or 587)
    mode = (env("SMTP_SECURITY", "starttls") or "starttls").lower()
    sender = env("SMTP_FROM") or env("SMTP_USER") or "databridge@localhost"
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = formataddr((env("SMTP_FROM_NAME", "DataBridge") or "DataBridge", sender))
    msg["To"] = ", ".join(to)
    msg.set_content(text)
    if html:
        msg.add_alternative(html, subtype="html")
    ctx = ssl.create_default_context()
    if mode == "ssl":
        s = smtplib.SMTP_SSL(host, port, timeout=20, context=ctx)
    else:
        s = smtplib.SMTP(host, port, timeout=20)
    try:
        if mode == "starttls":
            s.starttls(context=ctx)
        if env("SMTP_USER"):
            s.login(env("SMTP_USER"), env("SMTP_PASSWORD", "") or "")
        s.send_message(msg)
    finally:
        try:
            s.quit()
        except Exception:  # noqa: BLE001
            pass


def send_slack(url, subject, text, link=None):
    body = {"text": f"*{subject}*\n{text}" + (f"\n<{link}|Open in DataBridge>" if link else "")}
    r = httpx.post(url, json=body, timeout=15)
    if r.status_code >= 300:
        raise RuntimeError(f"Slack answered {r.status_code}: {r.text[:200]}")


def send_teams(url, subject, text, link=None):
    """Teams 'Workflows' webhook (Post to a channel when a webhook request is received): an Adaptive Card."""
    card = {"type": "AdaptiveCard", "$schema": "http://adaptivecards.io/schemas/adaptive-card.json", "version": "1.4",
            "body": [{"type": "TextBlock", "size": "Medium", "weight": "Bolder", "text": subject, "wrap": True},
                     {"type": "TextBlock", "text": text, "wrap": True}]}
    if link:
        card["actions"] = [{"type": "Action.OpenUrl", "title": "Open in DataBridge", "url": link}]
    body = {"type": "message", "attachments": [{"contentType": "application/vnd.microsoft.card.adaptive", "content": card}]}
    r = httpx.post(url, json=body, timeout=15)
    if r.status_code >= 300:
        raise RuntimeError(f"Teams answered {r.status_code}: {r.text[:200]}")


def send(dest, subject, text, link=None, html=None):
    """Send to every channel in dest. Returns {"sent": [...], "errors": [...]} — never raises."""
    dest = dest or {}
    link = link if (link or "").startswith("http") else (public_url(link) if link else "")
    sent, errors = [], []
    full = text + (f"\n\n{link}" if link else "")
    if dest.get("emails"):
        try:
            send_email(dest["emails"], subject, full, html)
            sent.append("email")
        except Exception as e:  # noqa: BLE001
            errors.append(f"e-mail: {e}")
    for kind, fn in (("slack", send_slack), ("teams", send_teams)):
        url = _webhook(kind, dest.get(kind))
        if dest.get(kind) and not url:
            errors.append(f"{kind}: no default webhook set in Admin › Settings › Notifications")
        elif url:
            try:
                fn(url, subject, text, link or None)
                sent.append(kind)
            except Exception as e:  # noqa: BLE001
                errors.append(f"{kind}: {e}")
    if errors:
        log.warning("notification problems for %r: %s", subject, json.dumps(errors))
    return {"sent": sent, "errors": errors}
