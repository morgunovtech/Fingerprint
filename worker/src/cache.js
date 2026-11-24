/**
 * Scan report cache: Workers KV when the binding exists, otherwise an in-memory Map that lives
 * as long as the isolate (fine for `wrangler dev` without KV).
 */

export const REPORT_TTL_SECONDS = 3600;

const memCache = new Map();

export async function cacheGet(key, env) {
  if (env?.CACHE) {
    try {
      const val = await env.CACHE.get(key, 'json');
      if (val) return val;
    } catch { /* fall through to memory */ }
  }
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memCache.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key, value, env, ttl = REPORT_TTL_SECONDS) {
  if (env?.CACHE) {
    try {
      await env.CACHE.put(key, JSON.stringify(value), { expirationTtl: ttl });
    } catch { /* keep the memory copy */ }
  }
  memCache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
}
