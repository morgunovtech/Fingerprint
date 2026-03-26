"""DNS resolution via dns.google public API."""

from __future__ import annotations

import structlog
import httpx

from fingerprint.models import DnsResult
from fingerprint.cache import get_cache, TTL_DNS

log = structlog.get_logger()

_RECORD_TYPES = {"A": 1, "AAAA": 28, "MX": 15, "TXT": 16, "CNAME": 5, "NS": 2}


async def _resolve(
    domain: str, rtype: str, client: httpx.AsyncClient
) -> list[str]:
    try:
        resp = await client.get(
            "https://dns.google/resolve",
            params={"name": domain, "type": rtype},
            timeout=8,
        )
        data = resp.json()
        answers = data.get("Answer", [])
        return [a["data"].rstrip(".") for a in answers if "data" in a]
    except Exception:
        return []


async def _ptr_lookup(ip: str, client: httpx.AsyncClient) -> str | None:
    """Reverse DNS (PTR) via dns.google."""
    parts = ip.split(".")
    if len(parts) == 4:
        arpa = ".".join(reversed(parts)) + ".in-addr.arpa"
    elif ":" in ip:
        # IPv6 — expand and reverse
        import ipaddress
        try:
            full = ipaddress.ip_address(ip).exploded.replace(":", "")
            arpa = ".".join(reversed(full)) + ".ip6.arpa"
        except ValueError:
            return None
    else:
        return None
    try:
        resp = await client.get(
            "https://dns.google/resolve",
            params={"name": arpa, "type": "PTR"},
            timeout=8,
        )
        data = resp.json()
        answers = data.get("Answer", [])
        if answers:
            return answers[0]["data"].rstrip(".")
        return None
    except Exception:
        return None


async def fetch_dns(
    domain: str | None,
    ip: str | None,
    client: httpx.AsyncClient,
) -> DnsResult | None:
    cache = get_cache()
    cache_key = f"dns:{domain or ip}"
    cached = await cache.get(cache_key)
    if cached:
        log.debug("dns.cache_hit", target=domain or ip)
        return DnsResult(**cached)

    result_data: dict = {}

    if domain:
        import asyncio
        tasks = {
            rtype: _resolve(domain, rtype, client)
            for rtype in _RECORD_TYPES
        }
        results = await asyncio.gather(*tasks.values(), return_exceptions=True)
        for rtype, res in zip(tasks.keys(), results):
            if isinstance(res, list):
                result_data[rtype.lower()] = res

    # PTR for IP
    if ip:
        ptr = await _ptr_lookup(ip, client)
        result_data["ptr"] = ptr

    if not result_data:
        return None

    result = DnsResult(**result_data)
    await cache.set(cache_key, result.model_dump(), TTL_DNS)
    return result
