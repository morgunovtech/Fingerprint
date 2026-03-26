"""Pydantic models for IP/domain fingerprint data."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class GeolocationResult(BaseModel):
    country: Optional[str] = None
    country_code: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    isp: Optional[str] = None
    org: Optional[str] = None
    asn: Optional[str] = None
    connection_type: Optional[str] = None  # residential / datacenter / mobile / vpn


class WhoisResult(BaseModel):
    registrar: Optional[str] = None
    created: Optional[str] = None
    expires: Optional[str] = None
    updated: Optional[str] = None
    registrant_org: Optional[str] = None
    name_servers: list[str] = Field(default_factory=list)
    status: list[str] = Field(default_factory=list)
    # IP/ASN WHOIS
    netname: Optional[str] = None
    net_range: Optional[str] = None
    abuse_contact: Optional[str] = None


class DnsResult(BaseModel):
    a: list[str] = Field(default_factory=list)
    aaaa: list[str] = Field(default_factory=list)
    mx: list[str] = Field(default_factory=list)
    txt: list[str] = Field(default_factory=list)
    cname: list[str] = Field(default_factory=list)
    ns: list[str] = Field(default_factory=list)
    ptr: Optional[str] = None


class ReputationResult(BaseModel):
    blacklisted: bool = False
    blacklist_hits: list[str] = Field(default_factory=list)
    blacklists_checked: int = 0
    fraud_score: Optional[float] = None


class SslResult(BaseModel):
    issuer: Optional[str] = None
    subject: Optional[str] = None
    valid_from: Optional[str] = None
    valid_to: Optional[str] = None
    san_domains: list[str] = Field(default_factory=list)
    serial: Optional[str] = None
    protocol: Optional[str] = None


class SecurityHeaders(BaseModel):
    strict_transport_security: bool = False
    content_security_policy: bool = False
    x_frame_options: bool = False
    x_content_type_options: bool = False
    referrer_policy: bool = False
    permissions_policy: bool = False


class HttpHeadersResult(BaseModel):
    server: Optional[str] = None
    powered_by: Optional[str] = None
    security_headers: SecurityHeaders = Field(default_factory=SecurityHeaders)


class FingerprintReport(BaseModel):
    target: str
    target_type: str  # "ip" or "domain"
    resolved_ip: Optional[str] = None
    collected_at: datetime = Field(default_factory=datetime.utcnow)
    duration_ms: int = 0
    sources_ok: list[str] = Field(default_factory=list)
    sources_failed: list[str] = Field(default_factory=list)
    geolocation: Optional[GeolocationResult] = None
    whois: Optional[WhoisResult] = None
    dns: Optional[DnsResult] = None
    reputation: Optional[ReputationResult] = None
    ssl: Optional[SslResult] = None
    http_headers: Optional[HttpHeadersResult] = None
