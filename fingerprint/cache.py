"""In-memory TTL cache with optional Redis backend."""

from __future__ import annotations

import asyncio
import json
import time
from typing import Any, Optional


class TTLCache:
    """Simple in-memory cache with per-key TTL."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> Optional[Any]:
        async with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if time.monotonic() > expires_at:
                del self._store[key]
                return None
            return value

    async def set(self, key: str, value: Any, ttl: int) -> None:
        async with self._lock:
            self._store[key] = (time.monotonic() + ttl, value)

    async def clear(self) -> None:
        async with self._lock:
            self._store.clear()


class RedisCache:
    """Redis-backed cache. Falls back to TTLCache if unavailable."""

    def __init__(self, url: str = "redis://localhost:6379") -> None:
        self._url = url
        self._redis: Any = None
        self._fallback = TTLCache()
        self._available: Optional[bool] = None

    async def _connect(self) -> bool:
        if self._available is not None:
            return self._available
        try:
            import redis.asyncio as aioredis
            self._redis = aioredis.from_url(self._url, decode_responses=True)
            await self._redis.ping()
            self._available = True
        except Exception:
            self._available = False
        return self._available

    async def get(self, key: str) -> Optional[Any]:
        if await self._connect() and self._redis:
            try:
                raw = await self._redis.get(key)
                if raw is not None:
                    return json.loads(raw)
                return None
            except Exception:
                pass
        return await self._fallback.get(key)

    async def set(self, key: str, value: Any, ttl: int) -> None:
        if await self._connect() and self._redis:
            try:
                await self._redis.setex(key, ttl, json.dumps(value, default=str))
                return
            except Exception:
                pass
        await self._fallback.set(key, value, ttl)

    async def clear(self) -> None:
        if self._redis:
            try:
                await self._redis.flushdb()
            except Exception:
                pass
        await self._fallback.clear()


# Default cache instance — auto-falls back to in-memory
_cache: Optional[TTLCache | RedisCache] = None


def get_cache(redis_url: Optional[str] = None) -> TTLCache | RedisCache:
    global _cache
    if _cache is None:
        if redis_url:
            _cache = RedisCache(redis_url)
        else:
            _cache = TTLCache()
    return _cache


# TTL constants (seconds)
TTL_GEO = 86400       # 24h
TTL_WHOIS = 604800    # 7d
TTL_DNS = 3600        # 1h
TTL_REPUTATION = 21600  # 6h
TTL_SSL = 86400       # 24h
TTL_HEADERS = 3600    # 1h
