/**
 * /api/scan: resolves the target, runs the providers in parallel and assembles the report.
 */

import { fetchGeolocation } from './providers/geolocation.js';
import { fetchDns } from './providers/dns.js';
import { fetchReputation } from './providers/reputation.js';
import { fetchSsl } from './providers/ssl.js';
import { fetchHttpHeaders } from './providers/headers.js';
import { cacheGet, cacheSet } from './cache.js';

// Digits only from `from` to the end (true for an empty tail). A loop, not a regex: see cleanTarget.
function isDigits(text, from) {
  for (let i = from; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 48 || c > 57) return false;
  }
  return true;
}

function isIp(target) {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(target)) return true;
  // IPv6: hex groups with at least two colons, so "host:port" leftovers ("abc:80") are never an IP.
  const colon = target.indexOf(':');
  return colon !== -1 && colon !== target.lastIndexOf(':') && /^[0-9a-f:]+$/i.test(target);
}

// What a caller typed or pasted, reduced to the host to look up, so a pasted address
// ("https://user@www.Example.com:8443/path?x=1#a") is scanned as its domain. Dropped, in this
// order: the scheme; everything from the first "/", "\", "?" or "#"; the userinfo before the last
// "@" (credentials never reach the report, the cache key or the log); the port; "www."; trailing
// dots. An IPv6 literal keeps its colons: bare ("2001:db8::1", several colons, so none of them is
// a port) or in brackets with an optional port ("[2001:db8::1]:443"). What cannot be a host
// returns "". Every step is one linear pass with no regular expression: the target comes straight
// from the query string.
export function cleanTarget(raw) {
  let t = raw.trim().toLowerCase();
  const scheme = t.indexOf('://');
  if (scheme > 0 && isSchemeName(t, scheme)) t = t.slice(scheme + 3);
  let end = t.length;
  for (const stop of ['/', '\\', '?', '#']) {
    const i = t.indexOf(stop);
    if (i !== -1 && i < end) end = i;
  }
  t = t.slice(0, end);
  const at = t.lastIndexOf('@');
  if (at !== -1) t = t.slice(at + 1);
  if (t.startsWith('[')) {
    const close = t.indexOf(']');
    if (close === -1) return '';
    const portOk = close === t.length - 1 || (t[close + 1] === ':' && isDigits(t, close + 2));
    const inner = t.slice(1, close);
    return portOk && inner.includes(':') && isIp(inner) ? inner : '';
  }
  const colon = t.indexOf(':');
  if (colon !== -1 && colon === t.lastIndexOf(':') && isDigits(t, colon + 1)) t = t.slice(0, colon);
  if (t.startsWith('www.')) t = t.slice(4);
  let last = t.length;
  while (last > 0 && t[last - 1] === '.') last--;
  return t.slice(0, last);
}

// "https", "ftp", "git+ssh": a letter, then letters, digits, "+", "-" or "." up to `end`.
function isSchemeName(text, end) {
  for (let i = 0; i < end; i++) {
    const c = text.charCodeAt(i);
    const letter = c >= 97 && c <= 122;
    const other = (c >= 48 && c <= 57) || c === 43 || c === 45 || c === 46;
    if (!(letter || (i > 0 && other))) return false;
  }
  return true;
}

// A cleaned target the scan can look up: an IP address, or a name of letters, digits, dots and
// hyphens within DNS's 253 characters. A colon is left only in an IPv6 address.
export function isScannableHost(host) {
  if (host.length === 0 || host.length > 253) return false;
  return isIp(host) || !/[^a-z0-9.-]/.test(host);
}

async function resolveDomain(domain) {
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await resp.json();
    for (const a of (data.Answer || [])) {
      const val = a.data || '';
      if (/^\d/.test(val) && val.includes('.')) return val;
    }
    return null;
  } catch {
    return null;
  }
}

async function runProvider(name, fn) {
  try {
    const start = Date.now();
    const result = await fn();
    const ms = Date.now() - start;
    console.log(`${name}: ${result ? 'OK' : 'null'} (${ms}ms)`);
    return { name, result, ok: result !== null };
  } catch (e) {
    console.warn(`${name}: FAILED — ${e.message}`);
    return { name, result: null, ok: false };
  }
}

export async function collectFingerprint(rawTarget, env) {
  const target = cleanTarget(rawTarget);
  const targetIsIp = isIp(target);
  const targetType = targetIsIp ? 'ip' : 'domain';
  const start = Date.now();

  // Check top-level cache
  const topCacheKey = `report:${target}`;
  const cached = await cacheGet(topCacheKey, env);
  if (cached) {
    console.log(`report cache hit: ${target}`);
    return { ...cached, _cached: true };
  }

  let resolvedIp = null;
  let domain = null;

  if (targetIsIp) {
    resolvedIp = target;
  } else {
    domain = target;
    resolvedIp = await resolveDomain(domain);
  }

  // Build parallel tasks
  const tasks = [];

  if (resolvedIp) {
    tasks.push(runProvider('geolocation', () => fetchGeolocation(resolvedIp)));
  }
  tasks.push(runProvider('dns', () => fetchDns(domain, resolvedIp)));
  if (resolvedIp) {
    tasks.push(runProvider('reputation', () => fetchReputation(resolvedIp)));
  }
  if (domain) {
    tasks.push(runProvider('ssl', () => fetchSsl(domain)));
    tasks.push(runProvider('http_headers', () => fetchHttpHeaders(domain)));
  }

  const results = await Promise.allSettled(tasks);
  const report = {
    target,
    target_type: targetType,
    resolved_ip: resolvedIp,
    collected_at: new Date().toISOString(),
    duration_ms: Date.now() - start,
    sources_ok: [],
    sources_failed: [],
    geolocation: null,
    // No WHOIS lookup since 2.2.1; the key stays null so API consumers keep the same shape.
    whois: null,
    dns: null,
    reputation: null,
    ssl: null,
    http_headers: null,
  };

  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    const { name, result, ok } = r.value;
    if (ok) {
      report.sources_ok.push(name);
      report[name] = result;
    } else {
      report.sources_failed.push(name);
    }
  }

  report.duration_ms = Date.now() - start;

  // The report is cached under the target for an hour.
  await cacheSet(topCacheKey, report, env);

  return report;
}
