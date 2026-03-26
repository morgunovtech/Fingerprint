"""IP geolocation via ip-api.com (free, 45 req/min) with ipinfo.io fallback."""

from __future__ import annotations

import structlog
import httpx

from fingerprint.models import GeolocationResult
from fingerprint.cache import get_cache, TTL_GEO

log = structlog.get_logger()

_IPAPI_FIELDS = (
    "status,message,country,countryCode,regionName,city,lat,lon,"
    "isp,org,as,mobile,proxy,hosting,query"
)


def _classify_connection(data: dict) -> str:
    if data.get("proxy"):
        return "vpn"
    if data.get("hosting"):
        return "datacenter"
    if data.get("mobile"):
        return "mobile"
    return "residential"


async def fetch_geolocation(ip: str, client: httpx.AsyncClient) -> GeolocationResult | None:
    cache = get_cache()
    cache_key = f"geo:{ip}"
    cached = await cache.get(cache_key)
    if cached:
        log.debug("geolocation.cache_hit", ip=ip)
        return GeolocationResult(**cached)

    # Primary: ip-api.com (HTTP only on free tier, but server-side is OK)
    try:
        resp = await client.get(
            f"http://ip-api.com/json/{ip}",
            params={"fields": _IPAPI_FIELDS},
            timeout=8,
        )
        data = resp.json()
        if data.get("status") == "success":
            result = GeolocationResult(
                country=data.get("country"),
                country_code=data.get("countryCode"),
                city=data.get("city"),
                region=data.get("regionName"),
                lat=data.get("lat"),
                lon=data.get("lon"),
                isp=data.get("isp"),
                org=data.get("org"),
                asn=data.get("as", "").split()[0] if data.get("as") else None,
                connection_type=_classify_connection(data),
            )
            await cache.set(cache_key, result.model_dump(), TTL_GEO)
            return result
    except Exception as e:
        log.warning("geolocation.ipapi_failed", ip=ip, error=str(e))

    # Fallback: ipinfo.io
    try:
        resp = await client.get(f"https://ipinfo.io/{ip}/json", timeout=8)
        data = resp.json()
        asn_str = data.get("org", "")
        asn = asn_str.split()[0] if asn_str.startswith("AS") else None
        org = " ".join(asn_str.split()[1:]) if asn else asn_str
        loc = data.get("loc", "").split(",")
        result = GeolocationResult(
            country=data.get("country"),
            city=data.get("city"),
            region=data.get("region"),
            lat=float(loc[0]) if len(loc) == 2 else None,
            lon=float(loc[1]) if len(loc) == 2 else None,
            isp=org or None,
            org=org or None,
            asn=asn,
        )
        await cache.set(cache_key, result.model_dump(), TTL_GEO)
        return result
    except Exception as e:
        log.warning("geolocation.ipinfo_failed", ip=ip, error=str(e))

    return None
