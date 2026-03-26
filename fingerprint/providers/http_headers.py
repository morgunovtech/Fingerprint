"""HTTP response headers collection via HEAD request."""

from __future__ import annotations

import structlog
import httpx

from fingerprint.models import HttpHeadersResult, SecurityHeaders
from fingerprint.cache import get_cache, TTL_HEADERS

log = structlog.get_logger()

_SECURITY_HEADERS_MAP = {
    "strict-transport-security": "strict_transport_security",
    "content-security-policy": "content_security_policy",
    "x-frame-options": "x_frame_options",
    "x-content-type-options": "x_content_type_options",
    "referrer-policy": "referrer_policy",
    "permissions-policy": "permissions_policy",
}


async def fetch_http_headers(
    domain: str, client: httpx.AsyncClient
) -> HttpHeadersResult | None:
    cache = get_cache()
    cache_key = f"headers:{domain}"
    cached = await cache.get(cache_key)
    if cached:
        log.debug("http_headers.cache_hit", domain=domain)
        return HttpHeadersResult(**cached)

    for scheme in ("https", "http"):
        try:
            resp = await client.head(
                f"{scheme}://{domain}",
                timeout=10,
                follow_redirects=True,
            )
            headers = {k.lower(): v for k, v in resp.headers.items()}

            sec = {}
            for header_name, field_name in _SECURITY_HEADERS_MAP.items():
                sec[field_name] = header_name in headers

            result = HttpHeadersResult(
                server=headers.get("server"),
                powered_by=headers.get("x-powered-by"),
                security_headers=SecurityHeaders(**sec),
            )
            await cache.set(cache_key, result.model_dump(), TTL_HEADERS)
            return result
        except Exception as e:
            log.debug("http_headers.failed", domain=domain, scheme=scheme, error=str(e))
            continue

    return None
