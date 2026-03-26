"""SSL/TLS certificate inspection via crt.sh + direct TLS connection."""

from __future__ import annotations

import asyncio
import ssl

import structlog
import httpx

from fingerprint.models import SslResult
from fingerprint.cache import get_cache, TTL_SSL

log = structlog.get_logger()


async def _check_tls_direct(domain: str) -> dict | None:
    """Connect to domain:443 and extract certificate info."""
    try:
        ctx = ssl.create_default_context()
        reader, writer = await asyncio.wait_for(
            asyncio.open_connection(domain, 443, ssl=ctx),
            timeout=10,
        )
        ssl_obj = writer.get_extra_info("ssl_object")
        if not ssl_obj:
            writer.close()
            return None
        cert = ssl_obj.getpeercert()
        writer.close()
        await writer.wait_closed()

        if not cert:
            return None

        # Extract issuer
        issuer_parts = dict(x[0] for x in cert.get("issuer", ()))
        issuer = issuer_parts.get("organizationName", issuer_parts.get("commonName"))

        # Extract subject
        subject_parts = dict(x[0] for x in cert.get("subject", ()))
        subject = subject_parts.get("commonName")

        # SAN domains
        san = [
            val for typ, val in cert.get("subjectAltName", ())
            if typ == "DNS"
        ]

        return {
            "issuer": issuer,
            "subject": subject,
            "valid_from": cert.get("notBefore"),
            "valid_to": cert.get("notAfter"),
            "san_domains": san,
            "serial": cert.get("serialNumber"),
            "protocol": ssl_obj.version() if hasattr(ssl_obj, "version") else None,
        }
    except Exception as e:
        log.debug("ssl.tls_direct_failed", domain=domain, error=str(e))
        return None


async def _check_crtsh(domain: str, client: httpx.AsyncClient) -> list[str]:
    """Query crt.sh for SAN domains from certificate transparency logs."""
    try:
        resp = await client.get(
            "https://crt.sh/",
            params={"q": domain, "output": "json"},
            timeout=12,
        )
        if resp.status_code != 200:
            return []
        entries = resp.json()
        # Deduplicate common_name / name_value
        domains: set[str] = set()
        for entry in entries[:50]:  # Limit to recent 50
            for field in ("common_name", "name_value"):
                val = entry.get(field, "")
                for d in val.split("\n"):
                    d = d.strip().lstrip("*.")
                    if d and "." in d:
                        domains.add(d.lower())
        return sorted(domains)
    except Exception as e:
        log.debug("ssl.crtsh_failed", domain=domain, error=str(e))
        return []


async def fetch_ssl(
    domain: str, client: httpx.AsyncClient
) -> SslResult | None:
    cache = get_cache()
    cache_key = f"ssl:{domain}"
    cached = await cache.get(cache_key)
    if cached:
        log.debug("ssl.cache_hit", domain=domain)
        return SslResult(**cached)

    tls_data = await _check_tls_direct(domain)
    if not tls_data:
        return None

    # Enrich SAN from crt.sh if direct TLS gave few SANs
    if len(tls_data.get("san_domains", [])) <= 2:
        crtsh_domains = await _check_crtsh(domain, client)
        if crtsh_domains:
            existing = set(tls_data.get("san_domains", []))
            tls_data["san_domains"] = sorted(existing | set(crtsh_domains))

    result = SslResult(**tls_data)
    await cache.set(cache_key, result.model_dump(), TTL_SSL)
    return result
