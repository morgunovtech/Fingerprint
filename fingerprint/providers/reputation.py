"""IP reputation check via DNSBL queries."""

from __future__ import annotations

import asyncio

import structlog
import httpx

from fingerprint.models import ReputationResult
from fingerprint.cache import get_cache, TTL_REPUTATION

log = structlog.get_logger()

# Common DNSBLs to check
_DNSBLS = [
    "zen.spamhaus.org",
    "b.barracudacentral.org",
    "bl.spamcop.net",
    "dnsbl.sorbs.net",
    "dnsbl-1.uceprotect.net",
    "spam.dnsbl.sorbs.net",
    "cbl.abuseat.org",
    "psbl.surriel.com",
]


async def _check_dnsbl(
    ip: str, dnsbl: str, client: httpx.AsyncClient
) -> str | None:
    """Check single DNSBL via dns.google. Returns dnsbl name if listed."""
    parts = ip.split(".")
    if len(parts) != 4:
        return None  # IPv6 not supported by most DNSBLs
    query = ".".join(reversed(parts)) + "." + dnsbl
    try:
        resp = await client.get(
            "https://dns.google/resolve",
            params={"name": query, "type": "A"},
            timeout=6,
        )
        data = resp.json()
        # If there's an answer with 127.x.x.x, the IP is listed
        answers = data.get("Answer", [])
        for a in answers:
            if a.get("data", "").startswith("127."):
                return dnsbl
        return None
    except Exception:
        return None


async def fetch_reputation(
    ip: str, client: httpx.AsyncClient
) -> ReputationResult | None:
    cache = get_cache()
    cache_key = f"rep:{ip}"
    cached = await cache.get(cache_key)
    if cached:
        log.debug("reputation.cache_hit", ip=ip)
        return ReputationResult(**cached)

    try:
        tasks = [_check_dnsbl(ip, dnsbl, client) for dnsbl in _DNSBLS]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        hits = [r for r in results if isinstance(r, str)]
        checked = len(_DNSBLS)
        result = ReputationResult(
            blacklisted=len(hits) > 0,
            blacklist_hits=hits,
            blacklists_checked=checked,
        )
        await cache.set(cache_key, result.model_dump(), TTL_REPUTATION)
        return result
    except Exception as e:
        log.warning("reputation.failed", ip=ip, error=str(e))
        return None
