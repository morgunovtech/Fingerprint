/**
 * Orchestrator — runs all providers in parallel, returns FingerprintReport.
 */

import { fetchGeolocation } from './providers/geolocation.js';
import { fetchWhois } from './providers/whois.js';
import { fetchDns } from './providers/dns.js';
import { fetchReputation } from './providers/reputation.js';
import { fetchSsl } from './providers/ssl.js';
import { fetchHttpHeaders } from './providers/headers.js';
import { cacheGet, cacheSet } from './cache.js';

function isIp(target) {
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(target)) return true;
  // IPv6
  if (target.includes(':') && /^[0-9a-fA-F:]+$/.test(target)) return true;
  return false;
}

function cleanTarget(raw) {
  let t = raw.trim().toLowerCase().replace(/\/+$/, '');
  for (const prefix of ['https://', 'http://', 'www.']) {
    if (t.startsWith(prefix)) t = t.slice(prefix.length);
  }
  return t;
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

async function runProvider(name, fn, env) {
  const cacheKey = `fp:${name}`;
  // We don't cache at orchestrator level — providers handle their own caching
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
    tasks.push(runProvider('geolocation', () => fetchGeolocation(resolvedIp), env));
  }
  tasks.push(runProvider('whois', () => fetchWhois(domain || resolvedIp || target), env));
  tasks.push(runProvider('dns', () => fetchDns(domain, resolvedIp), env));
  if (resolvedIp) {
    tasks.push(runProvider('reputation', () => fetchReputation(resolvedIp), env));
  }
  if (domain) {
    tasks.push(runProvider('ssl', () => fetchSsl(domain), env));
    tasks.push(runProvider('http_headers', () => fetchHttpHeaders(domain), env));
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

  // Cache the full report for 1 hour
  await cacheSet(topCacheKey, report, 'dns', env);

  return report;
}
