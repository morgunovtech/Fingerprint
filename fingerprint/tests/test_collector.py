"""Tests for fingerprint collector."""

import asyncio

import pytest

from fingerprint.collector import collect_fingerprint, _is_ip
from fingerprint.models import FingerprintReport
from fingerprint.cache import TTLCache


def test_is_ip():
    assert _is_ip("8.8.8.8") is True
    assert _is_ip("2001:4860:4860::8888") is True
    assert _is_ip("example.com") is False
    assert _is_ip("not-an-ip") is False


@pytest.mark.asyncio
async def test_collect_domain():
    """Integration test — collects data for example.com."""
    report = await collect_fingerprint("example.com")
    assert isinstance(report, FingerprintReport)
    assert report.target == "example.com"
    assert report.target_type == "domain"
    assert report.duration_ms > 0
    assert len(report.sources_ok) > 0
    # At least dns or http_headers should succeed
    assert report.dns is not None or report.http_headers is not None


@pytest.mark.asyncio
async def test_collect_ip():
    """Integration test — collects data for Google DNS."""
    report = await collect_fingerprint("8.8.8.8")
    assert isinstance(report, FingerprintReport)
    assert report.target == "8.8.8.8"
    assert report.target_type == "ip"
    assert report.resolved_ip == "8.8.8.8"
    assert report.geolocation is not None
    # IP targets should not have SSL/headers
    assert report.ssl is None
    assert report.http_headers is None


@pytest.mark.asyncio
async def test_collect_with_protocol():
    """Handles URLs with protocol prefix."""
    report = await collect_fingerprint("https://example.com")
    assert report.target == "example.com"
    assert report.target_type == "domain"


@pytest.mark.asyncio
async def test_graceful_degradation():
    """Non-existent domain should not crash — just report failures."""
    report = await collect_fingerprint("this-domain-definitely-does-not-exist-xyz123.com")
    assert isinstance(report, FingerprintReport)
    assert report.target_type == "domain"
    # Most sources will fail but report should still be valid
    assert report.duration_ms >= 0


@pytest.mark.asyncio
async def test_cache():
    """TTLCache basic operations."""
    c = TTLCache()
    await c.set("key1", {"data": 42}, ttl=10)
    val = await c.get("key1")
    assert val == {"data": 42}

    # Non-existent key
    val = await c.get("nonexistent")
    assert val is None

    # Clear
    await c.clear()
    val = await c.get("key1")
    assert val is None
