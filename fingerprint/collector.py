"""Orchestrator — collects fingerprint data from all providers in parallel."""

from __future__ import annotations

import asyncio
import ipaddress
import time
from datetime import datetime, timezone

import structlog
import httpx

from fingerprint.models import FingerprintReport
from fingerprint.providers.geolocation import fetch_geolocation
from fingerprint.providers.whois_lookup import fetch_whois
from fingerprint.providers.dns_resolver import fetch_dns
from fingerprint.providers.reputation import fetch_reputation
from fingerprint.providers.ssl_checker import fetch_ssl
from fingerprint.providers.http_headers import fetch_http_headers

log = structlog.get_logger()


def _is_ip(target: str) -> bool:
    """Check if target is an IP address."""
    try:
        ipaddress.ip_address(target)
        return True
    except ValueError:
        return False


async def _resolve_domain(domain: str, client: httpx.AsyncClient) -> str | None:
    """Resolve domain to its first A record via dns.google."""
    try:
        resp = await client.get(
            "https://dns.google/resolve",
            params={"name": domain, "type": "A"},
            timeout=8,
        )
        data = resp.json()
        answers = data.get("Answer", [])
        for a in answers:
            val = a.get("data", "")
            # Accept any answer that looks like an IPv4 address
            if val and val[0].isdigit() and "." in val:
                return val
        return None
    except Exception:
        return None


async def collect_fingerprint(target: str) -> FingerprintReport:
    """Main entry point. Accepts an IP or domain, runs all checks in parallel.

    Returns a FingerprintReport with all collected data.
    Graceful degradation — one failed provider doesn't break the report.
    """
    target = target.strip().lower().rstrip("/")
    # Strip protocol if provided
    for prefix in ("https://", "http://", "www."):
        if target.startswith(prefix):
            target = target[len(prefix):]

    is_ip = _is_ip(target)
    target_type = "ip" if is_ip else "domain"
    start = time.monotonic()

    log.info("collector.start", target=target, target_type=target_type)

    async with httpx.AsyncClient(
        headers={"User-Agent": "Fingerprint/1.0 (https://fprint.morgunov.tech)"},
        follow_redirects=True,
    ) as client:
        # Resolve domain to IP if needed
        resolved_ip: str | None = None
        domain: str | None = None

        if is_ip:
            resolved_ip = target
        else:
            domain = target
            resolved_ip = await _resolve_domain(domain, client)

        # Build task list based on target type
        sources: dict[str, asyncio.Task] = {}

        # Geolocation — always (needs IP)
        if resolved_ip:
            sources["geolocation"] = asyncio.create_task(
                fetch_geolocation(resolved_ip, client)
            )

        # WHOIS — for both domain and IP
        sources["whois"] = asyncio.create_task(
            fetch_whois(domain or resolved_ip or target, client)
        )

        # DNS — domain gets full records; IP gets PTR only
        sources["dns"] = asyncio.create_task(
            fetch_dns(domain, resolved_ip, client)
        )

        # Reputation — needs IP
        if resolved_ip:
            sources["reputation"] = asyncio.create_task(
                fetch_reputation(resolved_ip, client)
            )

        # SSL — only for domains
        if domain:
            sources["ssl"] = asyncio.create_task(
                fetch_ssl(domain, client)
            )

        # HTTP headers — only for domains
        if domain:
            sources["http_headers"] = asyncio.create_task(
                fetch_http_headers(domain, client)
            )

        # Await all tasks
        results: dict = {}
        sources_ok: list[str] = []
        sources_failed: list[str] = []

        for name, task in sources.items():
            try:
                result = await task
                if result is not None:
                    results[name] = result
                    sources_ok.append(name)
                else:
                    sources_failed.append(name)
            except Exception as e:
                log.warning("collector.provider_failed", provider=name, error=str(e))
                sources_failed.append(name)

    duration_ms = int((time.monotonic() - start) * 1000)

    report = FingerprintReport(
        target=target,
        target_type=target_type,
        resolved_ip=resolved_ip,
        collected_at=datetime.now(timezone.utc),
        duration_ms=duration_ms,
        sources_ok=sources_ok,
        sources_failed=sources_failed,
        geolocation=results.get("geolocation"),
        whois=results.get("whois"),
        dns=results.get("dns"),
        reputation=results.get("reputation"),
        ssl=results.get("ssl"),
        http_headers=results.get("http_headers"),
    )

    log.info(
        "collector.done",
        target=target,
        duration_ms=duration_ms,
        ok=len(sources_ok),
        failed=len(sources_failed),
    )
    return report
