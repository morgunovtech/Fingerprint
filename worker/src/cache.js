/**
 * Cache layer — uses Cloudflare KV if available, otherwise in-memory Map.
 * In-memory cache resets on cold starts, which is fine for edge workers.
 */

const TTL = {
  geo: 86400,        // 24h
  whois: 604800,     // 7d
  dns: 3600,         // 1h
  reputation: 21600, // 6h
  ssl: 86400,        // 24h
  headers: 3600,     // 1h
};

// In-memory fallback (per-isolate, survives warm requests)
const memCache = new Map();

export async function cacheGet(key, env) {
  // Try KV first
  if (env?.CACHE) {
    try {
      const val = await env.CACHE.get(key, 'json');
      if (val) return val;
    } catch { /* fall through */ }
  }
  // In-memory fallback
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key, value, provider, env) {
  const ttl = TTL[provider] || 3600;
  // KV
  if (env?.CACHE) {
    try {
      await env.CACHE.put(key, JSON.stringify(value), { expirationTtl: ttl });
    } catch { /* fall through */ }
  }
  // In-memory
  memCache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
}

export { TTL };
