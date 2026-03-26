"""Fingerprint — IP/domain public data collector."""

from fingerprint.collector import collect_fingerprint
from fingerprint.models import FingerprintReport

__all__ = ["collect_fingerprint", "FingerprintReport"]
