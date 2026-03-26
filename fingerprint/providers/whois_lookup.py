"""WHOIS lookup for domains and IPs via whoisjson.com + CLI fallback."""

from __future__ import annotations

import asyncio
import re

import structlog
import httpx

from fingerprint.models import WhoisResult
from fingerprint.cache import get_cache, TTL_WHOIS

log = structlog.get_logger()

# Personal name pattern for masking
_PERSON_RE = re.compile(r"^[A-Z][a-z]+ [A-Z][a-z]+$")


def _mask_if_person(value: str | None) -> str | None:
    """Mask registrant if it looks like a personal name."""
    if not value:
        return value
    if _PERSON_RE.match(value.strip()):
        return "[REDACTED — personal name]"
    return value


async def _whois_cli(target: str) -> dict | None:
    """Run whois CLI and parse key fields."""
    try:
        proc = await asyncio.create_subprocess_exec(
            "whois", target,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, _ = await asyncio.wait_for(proc.communicate(), timeout=15)
        text = stdout.decode("utf-8", errors="replace")
        result: dict = {}
        ns_list: list[str] = []
        status_list: list[str] = []
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("%") or line.startswith("#"):
                continue
            if ":" not in line:
                continue
            key, _, val = line.partition(":")
            key = key.strip().lower()
            val = val.strip()
            if not val:
                continue
            if key in ("registrar", "registrar name"):
                result.setdefault("registrar", val)
            elif key in ("creation date", "created", "registered"):
                result.setdefault("created", val[:10])
            elif key in ("registry expiry date", "expiry date", "expires", "paid-till"):
                result.setdefault("expires", val[:10])
            elif key in ("updated date", "last updated"):
                result.setdefault("updated", val[:10])
            elif key in ("registrant organization", "registrant", "org-name", "org"):
                result.setdefault("registrant_org", val)
            elif key in ("name server", "nserver"):
                ns_list.append(val.split()[0].rstrip(".").lower())
            elif key in ("domain status", "status"):
                status_list.append(val.split()[0])
            elif key in ("netname",):
                result.setdefault("netname", val)
            elif key in ("inetnum", "netrange", "cidr"):
                result.setdefault("net_range", val)
            elif key in ("abuse-mailbox", "orgabuseemail"):
                result.setdefault("abuse_contact", val)
        if ns_list:
            result["name_servers"] = ns_list
        if status_list:
            result["status"] = status_list
        return result if result else None
    except Exception as e:
        log.warning("whois.cli_failed", target=target, error=str(e))
        return None


async def fetch_whois(target: str, client: httpx.AsyncClient) -> WhoisResult | None:
    cache = get_cache()
    cache_key = f"whois:{target}"
    cached = await cache.get(cache_key)
    if cached:
        log.debug("whois.cache_hit", target=target)
        return WhoisResult(**cached)

    # Try whoisjson.com (free tier: 500 req/month)
    data: dict | None = None
    try:
        resp = await client.get(
            f"https://whoisjson.com/api/v1/whois",
            params={"domain": target},
            timeout=12,
        )
        if resp.status_code == 200:
            raw = resp.json()
            data = {
                "registrar": raw.get("registrar"),
                "created": str(raw.get("creation_date", ""))[:10] or None,
                "expires": str(raw.get("expiration_date", ""))[:10] or None,
                "updated": str(raw.get("updated_date", ""))[:10] or None,
                "registrant_org": raw.get("registrant_org") or raw.get("registrant"),
                "name_servers": raw.get("name_servers", []),
                "status": raw.get("status", []) if isinstance(raw.get("status"), list) else [],
            }
    except Exception as e:
        log.warning("whois.api_failed", target=target, error=str(e))

    # Fallback: CLI
    if not data:
        data = await _whois_cli(target)

    if not data:
        return None

    # Mask personal names
    data["registrant_org"] = _mask_if_person(data.get("registrant_org"))

    result = WhoisResult(**data)
    await cache.set(cache_key, result.model_dump(), TTL_WHOIS)
    return result
