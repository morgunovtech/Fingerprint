/**
 * Cloudflare Worker — Fingerprint API
 *
 * Served at https://fprint.morgunov.tech/api/ (a route on the site's own host) and at
 * https://fingerprint-api.xfxrrpkvr5.workers.dev; both answer the same paths.
 *
 * Routes:
 *   GET  /api/scan?target=example.com   — report for a domain (DNS, certificates, security headers)
 *   GET  /api/scan?target=8.8.8.8       — report for an IP (geolocation, reverse DNS, blocklists)
 *   GET  /api/whoami                     — what the server sees about the caller, as JSON; counts a visit
 *   GET  /api/check                      — the same, as plain text unless Accept asks for JSON
 *   GET  /api/stats                      — anonymous aggregate counters, filled by /api/whoami
 *   GET  /api/health                     — status and VERSION
 *   GET  /api/speedtest/ping             — "pong" for the latency test
 *   GET  /api/speedtest/download?size=N  — random bytes for the download test (100 KB to 25 MB)
 *   POST /api/speedtest/upload           — accepts any body, returns its size and server time
 *   OPTIONS *                            — CORS preflight
 */

import { collectFingerprint } from './collector.js';
import { buildWhoami, whoamiText } from './whoami.js';

// One version for the release: the same number as APP_VERSION in site/src/config.js,
// worker/package.json and the top entry of CHANGELOG.md.
const VERSION = '3.1.1';

const RATE_LIMIT_PER_MINUTE = 60;

const ENDPOINTS = {
  scan: 'GET /api/scan?target=example.com',
  whoami: 'GET /api/whoami',
  check: 'GET /api/check',
  stats: 'GET /api/stats',
  health: 'GET /api/health',
  speedtest: 'GET /api/speedtest/ping, GET /api/speedtest/download?size=N, POST /api/speedtest/upload',
};

/* ---- Anonymous visit stats: aggregate counters in KV, read by /api/stats ---- */

// A read-modify-write of one KV key: concurrent visits can lose an increment, so the counters
// are approximate. They are decoration ("X% of visitors"), not analytics.
async function trackVisitStats(whoami, env) {
  if (!env.CACHE) return;
  try {
    const stats = (await env.CACHE.get('stats', 'json')) || { total_visits: 0, browsers: {}, os: {}, countries: {}, tls_versions: {} };
    stats.total_visits++;
    const bump = (table, key) => { if (key) table[key] = (table[key] || 0) + 1; };
    const { browser, version, os } = whoami.ua_parsed || {};
    bump(stats.browsers, browser ? (version ? `${browser} ${version}` : browser) : null);
    bump(stats.os, os);
    bump(stats.countries, whoami.geo?.country);
    bump(stats.tls_versions, whoami.network?.tlsVersion);
    await env.CACHE.put('stats', JSON.stringify(stats));
  } catch (e) {
    console.warn('stats tracking error:', e.message);
  }
}

/* ---- Responses ---- */

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const isAllowed = allowed.includes(origin) || allowed.includes('*');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status, request, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request, env) },
  });
}

function textResponse(text, request, env, type = 'text/plain; charset=utf-8') {
  return new Response(text, {
    status: 200,
    headers: { 'Content-Type': type, 'Cache-Control': 'no-store', ...corsHeaders(request, env) },
  });
}

// crypto.getRandomValues fills at most 65536 bytes per call, so the body streams in chunks.
function randomBytes(size) {
  return new ReadableStream({
    start(controller) {
      let remaining = size;
      while (remaining > 0) {
        const buf = new Uint8Array(Math.min(65536, remaining));
        crypto.getRandomValues(buf);
        controller.enqueue(buf);
        remaining -= buf.length;
      }
      controller.close();
    },
  });
}

/* ---- Rate limit: a per-IP counter in KV that expires after a minute ---- */

async function rateLimited(request, env, ctx) {
  if (!env.CACHE) return false;
  const key = `rl:${request.headers.get('cf-connecting-ip') || '0.0.0.0'}`;
  const count = parseInt((await env.CACHE.get(key)) || '0', 10);
  if (count >= RATE_LIMIT_PER_MINUTE) return true;
  ctx.waitUntil(env.CACHE.put(key, String(count + 1), { expirationTtl: 60 }));
  return false;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (pathname.startsWith('/api/') && await rateLimited(request, env, ctx)) {
      return jsonResponse({ error: 'Rate limit exceeded', retry_after: 60 }, 429, request, env);
    }

    if (pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        version: VERSION,
        timestamp: new Date().toISOString(),
        kv_status: env.CACHE ? 'connected' : 'not configured',
      }, 200, request, env);
    }

    if (pathname === '/api/whoami') {
      const w = await buildWhoami(request);
      if (env.CACHE) ctx.waitUntil(trackVisitStats(w, env));
      return jsonResponse(w, 200, request, env);
    }

    if (pathname === '/api/check') {
      const w = await buildWhoami(request);
      if ((request.headers.get('Accept') || '').includes('application/json')) return jsonResponse(w, 200, request, env);
      return textResponse(whoamiText(w), request, env);
    }

    if (pathname === '/api/stats') {
      if (!env.CACHE) return jsonResponse({ error: 'KV not configured' }, 503, request, env);
      try {
        const stats = await env.CACHE.get('stats', 'json');
        return jsonResponse(stats || { total_visits: 0 }, 200, request, env);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, request, env);
      }
    }

    if (pathname === '/api/speedtest/ping') {
      return textResponse('pong', request, env, 'text/plain');
    }
    if (pathname === '/api/speedtest/download' && request.method === 'GET') {
      const size = Math.min(25_000_000, Math.max(100_000, parseInt(url.searchParams.get('size') || '2000000', 10) || 0));
      return new Response(randomBytes(size), {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': String(size),
          'Cache-Control': 'no-store',
          'X-Payload-Size': String(size),
          ...corsHeaders(request, env),
        },
      });
    }
    if (pathname === '/api/speedtest/upload' && request.method === 'POST') {
      const start = Date.now();
      const body = await request.arrayBuffer();
      return jsonResponse({ bytes: body.byteLength, server_elapsed_ms: Date.now() - start, timestamp: new Date().toISOString() }, 200, request, env);
    }

    if (pathname === '/api/scan' && request.method === 'GET') {
      const target = url.searchParams.get('target');
      if (!target) {
        return jsonResponse({ error: 'Missing "target" parameter. Usage: /api/scan?target=example.com' }, 400, request, env);
      }
      const cleaned = target.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
      if (cleaned.length > 253 || /[^a-z0-9.:/-]/.test(cleaned)) {
        return jsonResponse({ error: 'Invalid target. Provide a domain or an IP address.' }, 400, request, env);
      }
      try {
        return jsonResponse(await collectFingerprint(target, env), 200, request, env);
      } catch (e) {
        console.error('scan error:', e);
        return jsonResponse({ error: 'Internal error during scan', detail: e.message }, 500, request, env);
      }
    }

    return jsonResponse({ error: 'Not found', endpoints: ENDPOINTS }, 404, request, env);
  },
};
