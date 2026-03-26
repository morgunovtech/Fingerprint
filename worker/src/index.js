/**
 * Cloudflare Worker — Fingerprint API
 *
 * Routes:
 *   GET  /api/scan?target=example.com   — full fingerprint report
 *   GET  /api/scan?target=8.8.8.8       — IP scan
 *   GET  /api/health                     — health check
 *   GET  /api/whoami                     — visitor's own fingerprint (from request)
 *   GET  /api/check                      — whoami with content negotiation
 *   OPTIONS *                            — CORS preflight
 */

import { collectFingerprint } from './collector.js';

/* ============ /api/whoami — build visitor profile from request ============ */

function parseUA(ua) {
  if (!ua) return { browser: null, version: null, os: null, os_version: null };
  let browser = null, version = null, os = null, os_version = null;
  // Browser detection
  const browsers = [
    [/Edg(?:e|A|iOS)?\/(\S+)/, 'Edge'],
    [/OPR\/(\S+)|Opera\/(\S+)/, 'Opera'],
    [/Brave\/(\S+)/, 'Brave'],
    [/Vivaldi\/(\S+)/, 'Vivaldi'],
    [/YaBrowser\/(\S+)/, 'Yandex'],
    [/SamsungBrowser\/(\S+)/, 'Samsung Internet'],
    [/Firefox\/(\S+)/, 'Firefox'],
    [/CriOS\/(\S+)/, 'Chrome iOS'],
    [/Chrome\/(\S+)/, 'Chrome'],
    [/Safari\/(\S+)/, 'Safari'],
  ];
  for (const [re, name] of browsers) {
    const m = ua.match(re);
    if (m) { browser = name; version = (m[1] || m[2] || '').split('.')[0]; break; }
  }
  // If Safari detected, check version from Version/X
  if (browser === 'Safari') {
    const vm = ua.match(/Version\/(\S+)/);
    if (vm) version = vm[1].split('.')[0];
  }
  // OS detection
  if (/Windows NT (\d+\.\d+)/.test(ua)) { os = 'Windows'; os_version = RegExp.$1; }
  else if (/Mac OS X ([\d_]+)/.test(ua)) { os = 'macOS'; os_version = RegExp.$1.replace(/_/g, '.'); }
  else if (/CrOS/.test(ua)) { os = 'ChromeOS'; }
  else if (/Android ([\d.]+)/.test(ua)) { os = 'Android'; os_version = RegExp.$1; }
  else if (/iPhone|iPad/.test(ua)) { os = 'iOS'; const m = ua.match(/OS ([\d_]+)/); if (m) os_version = m[1].replace(/_/g, '.'); }
  else if (/Linux/.test(ua)) { os = 'Linux'; }
  return { browser, version, os, os_version };
}

function parseHints(headers) {
  const ua = headers.get('sec-ch-ua') || null;
  const platform = headers.get('sec-ch-ua-platform') || null;
  const mobile = headers.get('sec-ch-ua-mobile') || null;
  const model = headers.get('sec-ch-ua-model') || null;
  const pv = headers.get('sec-ch-ua-platform-version') || null;
  if (!ua && !platform) return null;
  // Parse brand from hints
  let browser = null;
  if (ua) {
    // "Chromium";v="134", "Google Chrome";v="134"
    const brands = [...ua.matchAll(/"([^"]+)";v="([^"]+)"/g)];
    for (const [, name] of brands) {
      if (name !== 'Not A(Brand' && name !== 'Not/A)Brand' && !name.startsWith('Not')) {
        browser = name; break;
      }
    }
  }
  return {
    ua: ua,
    platform: platform ? platform.replace(/"/g, '') : null,
    mobile: mobile || null,
    model: model ? model.replace(/"/g, '') : null,
    platform_version: pv ? pv.replace(/"/g, '') : null,
    browser,
  };
}

async function hashHeaders(headerOrder, headers) {
  // Build canonical string from header names + select values
  const signalHeaders = ['accept', 'accept-language', 'accept-encoding', 'user-agent'];
  const parts = headerOrder.map(h => {
    const val = signalHeaders.includes(h.toLowerCase()) ? headers.get(h) || '' : '';
    return h.toLowerCase() + ':' + val;
  });
  const data = new TextEncoder().encode(parts.join('|'));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

function checkConsistency(uaParsed, hintsParsed) {
  if (!uaParsed || !hintsParsed) return { consistent: true, details: 'Insufficient data for cross-check' };
  const issues = [];
  // Browser check
  if (hintsParsed.browser && uaParsed.browser) {
    const hb = hintsParsed.browser.toLowerCase();
    const ub = uaParsed.browser.toLowerCase();
    if (!hb.includes(ub) && !ub.includes(hb) && !(hb.includes('chrom') && ub.includes('chrom'))) {
      issues.push(`UA says ${uaParsed.browser}, hints say ${hintsParsed.browser}`);
    }
  }
  // Platform check
  if (hintsParsed.platform && uaParsed.os) {
    const hp = hintsParsed.platform.toLowerCase();
    const uo = uaParsed.os.toLowerCase();
    const platformMap = { 'windows': 'windows', 'macos': 'macos', 'linux': 'linux', 'android': 'android', 'ios': 'ios', 'chromeos': 'chromeos' };
    const hpNorm = Object.keys(platformMap).find(k => hp.includes(k)) || hp;
    const uoNorm = Object.keys(platformMap).find(k => uo.includes(k)) || uo;
    if (hpNorm !== uoNorm) {
      issues.push(`UA says ${uaParsed.os}, hints say ${hintsParsed.platform}`);
    }
  }
  // Mobile check
  if (hintsParsed.mobile && uaParsed.os) {
    const isMobileUA = ['android', 'ios'].includes(uaParsed.os.toLowerCase());
    const isMobileHint = hintsParsed.mobile === '?1';
    if (isMobileUA !== isMobileHint) {
      issues.push(`UA ${isMobileUA ? 'mobile' : 'desktop'}, hints ${isMobileHint ? 'mobile' : 'desktop'}`);
    }
  }
  return {
    consistent: issues.length === 0,
    issues,
    details: issues.join('; ') || 'All checks passed',
  };
}

function buildWhoami(request) {
  const cf = request.cf || {};
  const headers = request.headers;
  const ip = headers.get('cf-connecting-ip') || headers.get('x-real-ip') || '0.0.0.0';

  // Collect header order (approximation — CF may reorder, but it's the best we have)
  const headerOrder = [];
  for (const [key] of headers.entries()) {
    if (!key.startsWith('cf-') && key !== 'x-real-ip' && key !== 'x-forwarded-for') {
      headerOrder.push(key);
    }
  }

  const uaParsed = parseUA(headers.get('user-agent') || '');
  const hintsParsed = parseHints(headers);
  const consistency = checkConsistency(uaParsed, hintsParsed);

  // Cross-check data (for frontend to compare with client-side)
  const crossCheck = {
    server_timezone: cf.timezone || null,
    server_country: cf.country || null,
    server_platform: uaParsed.os || null,
    server_browser: uaParsed.browser ? `${uaParsed.browser} ${uaParsed.version || ''}`.trim() : null,
    server_accept_language: headers.get('accept-language') || null,
  };

  return {
    ip,
    geo: {
      country: cf.country || null,
      city: cf.city || null,
      region: cf.region || null,
      timezone: cf.timezone || null,
      colo: cf.colo || null,
      continent: cf.continent || null,
      latitude: cf.latitude || null,
      longitude: cf.longitude || null,
      is_eu: cf.isEUCountry || false,
    },
    network: {
      asn: cf.asn || null,
      asOrganization: cf.asOrganization || null,
      httpProtocol: cf.httpProtocol || null,
      tlsVersion: cf.tlsVersion || null,
      tlsCipher: cf.tlsCipher || null,
    },
    headers: {
      user_agent: headers.get('user-agent') || null,
      accept_language: headers.get('accept-language') || null,
      accept_encoding: headers.get('accept-encoding') || null,
      dnt: headers.get('dnt') || null,
      client_hints: hintsParsed,
      header_order: headerOrder,
    },
    // Phase 1.1: computed fields
    ua_parsed: uaParsed,
    hints_parsed: hintsParsed,
    header_hash: null, // will be filled async — see below
    consistency,
    // Phase 1.2: cross-check
    cross_check: crossCheck,
  };
}

// Async wrapper that fills header_hash
async function buildWhoamiAsync(request) {
  const result = buildWhoami(request);
  const headerOrder = result.headers.header_order;
  result.header_hash = await hashHeaders(headerOrder, request.headers);
  return result;
}

/* ============ Anonymous visit stats (Phase 3.2) ============ */
async function trackVisitStats(whoami, env) {
  if (!env.CACHE) return;
  try {
    const stats = await env.CACHE.get('stats', 'json') || {
      total_visits: 0,
      browsers: {},
      os: {},
      countries: {},
      tls_versions: {},
    };
    stats.total_visits++;
    // Browser (e.g., "Chrome 134")
    const br = whoami.ua_parsed?.browser;
    const brVer = whoami.ua_parsed?.version;
    if (br) {
      const brKey = brVer ? `${br} ${brVer}` : br;
      stats.browsers[brKey] = (stats.browsers[brKey] || 0) + 1;
    }
    // OS
    const os = whoami.ua_parsed?.os;
    if (os) stats.os[os] = (stats.os[os] || 0) + 1;
    // Country
    const cc = whoami.geo?.country;
    if (cc) stats.countries[cc] = (stats.countries[cc] || 0) + 1;
    // TLS
    const tls = whoami.network?.tlsVersion;
    if (tls) stats.tls_versions[tls] = (stats.tls_versions[tls] || 0) + 1;
    await env.CACHE.put('stats', JSON.stringify(stats));
  } catch (e) {
    console.warn('stats tracking error:', e.message);
  }
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim());
  // Allow the origin if it matches, or allow all in dev
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
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request, env),
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Rate limiting (60 req/min per IP, skip OPTIONS and static)
    if (env.CACHE && request.method !== 'OPTIONS' && url.pathname.startsWith('/api/')) {
      const clientIp = request.headers.get('cf-connecting-ip') || '0.0.0.0';
      const rlKey = `rl:${clientIp}`;
      const rlVal = parseInt(await env.CACHE.get(rlKey) || '0', 10);
      if (rlVal >= 60) {
        return jsonResponse(
          { error: 'Rate limit exceeded', retry_after: 60 },
          429, request, env
        );
      }
      ctx.waitUntil(env.CACHE.put(rlKey, String(rlVal + 1), { expirationTtl: 60 }));
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    // Health check
    if (url.pathname === '/api/health') {
      return jsonResponse({
        status: 'ok',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        kv_status: env.CACHE ? 'connected' : 'not configured',
      }, 200, request, env);
    }

    // === /api/whoami — visitor's own fingerprint from request metadata ===
    if (url.pathname === '/api/whoami') {
      const w = await buildWhoamiAsync(request);
      // Track anonymous stats in background (don't await — fire and forget)
      if (env.CACHE) ctx.waitUntil(trackVisitStats(w, env));
      return jsonResponse(w, 200, request, env);
    }

    // === /api/stats — anonymous aggregate statistics ===
    if (url.pathname === '/api/stats') {
      if (!env.CACHE) return jsonResponse({ error: 'KV not configured' }, 503, request, env);
      try {
        const stats = await env.CACHE.get('stats', 'json');
        return jsonResponse(stats || { total_visits: 0 }, 200, request, env);
      } catch (e) {
        return jsonResponse({ error: e.message }, 500, request, env);
      }
    }

    // === /api/check — same as whoami, with content negotiation ===
    if (url.pathname === '/api/check') {
      const accept = request.headers.get('Accept') || '';
      const w = await buildWhoamiAsync(request);
      if (accept.includes('application/json')) {
        return jsonResponse(w, 200, request, env);
      }
      // Plain text for curl
      const lines = [
        `IP:        ${w.ip}`,
        `Country:   ${w.geo.country || '—'}`,
        `City:      ${w.geo.city || '—'}`,
        `Region:    ${w.geo.region || '—'}`,
        `Timezone:  ${w.geo.timezone || '—'}`,
        `ASN:       ${w.network.asn || '—'}`,
        `Colo:      ${w.geo.colo || '—'}`,
        `TLS:       ${w.network.tlsVersion || '—'} / ${w.network.tlsCipher || '—'}`,
        `HTTP:      ${w.network.httpProtocol || '—'}`,
        `Browser:   ${w.headers.user_agent || '—'}`,
        `Languages: ${w.headers.accept_language || '—'}`,
        `Header#:   ${w.header_hash || '—'}`,
      ];
      if (w.consistency && !w.consistency.consistent) {
        lines.push(`⚠ Mismatch: ${w.consistency.details}`);
      }
      return new Response(lines.join('\n') + '\n', {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders(request, env) },
      });
    }

    // Speed test — download endpoint (serves random bytes for measuring throughput)
    if (url.pathname === '/api/speedtest/download' && request.method === 'GET') {
      const sizeParam = parseInt(url.searchParams.get('size') || '2000000', 10);
      // Clamp between 100KB and 25MB
      const size = Math.min(25_000_000, Math.max(100_000, sizeParam));
      // crypto.getRandomValues has 65536 byte limit per call — stream chunks
      const stream = new ReadableStream({
        start(controller) {
          const CHUNK = 65536;
          let remaining = size;
          while (remaining > 0) {
            const len = Math.min(CHUNK, remaining);
            const buf = new Uint8Array(len);
            crypto.getRandomValues(buf);
            controller.enqueue(buf);
            remaining -= len;
          }
          controller.close();
        }
      });
      return new Response(stream, {
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

    // Speed test — upload endpoint (accepts POST body, returns timing)
    if (url.pathname === '/api/speedtest/upload' && request.method === 'POST') {
      const start = Date.now();
      const body = await request.arrayBuffer();
      const elapsed = Date.now() - start;
      return jsonResponse({
        bytes: body.byteLength,
        server_elapsed_ms: elapsed,
        timestamp: new Date().toISOString(),
      }, 200, request, env);
    }

    // Speed test — ping (minimal response for latency measurement)
    if (url.pathname === '/api/speedtest/ping') {
      return new Response('pong', {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-store',
          ...corsHeaders(request, env),
        },
      });
    }

    // Main scan endpoint
    if (url.pathname === '/api/scan' && request.method === 'GET') {
      const target = url.searchParams.get('target');
      if (!target) {
        return jsonResponse(
          { error: 'Missing "target" parameter. Usage: /api/scan?target=example.com' },
          400, request, env
        );
      }

      // Basic input validation
      const cleaned = target.trim().toLowerCase();
      if (cleaned.length > 253 || /[^a-z0-9.:\/\-]/.test(cleaned.replace(/^https?:\/\//, '').replace(/^www\./, ''))) {
        return jsonResponse(
          { error: 'Invalid target. Provide a domain or IPv4 address.' },
          400, request, env
        );
      }

      try {
        const report = await collectFingerprint(target, env);
        return jsonResponse(report, 200, request, env);
      } catch (e) {
        console.error('scan error:', e);
        return jsonResponse(
          { error: 'Internal error during scan', detail: e.message },
          500, request, env
        );
      }
    }

    // 404
    return jsonResponse({
      error: 'Not found',
      endpoints: {
        scan: 'GET /api/scan?target=example.com',
        health: 'GET /api/health',
      }
    }, 404, request, env);
  },
};
