/**
 * Cloudflare Worker — Fingerprint API
 *
 * Routes:
 *   GET  /api/scan?target=example.com   — full fingerprint report
 *   GET  /api/scan?target=8.8.8.8       — IP scan
 *   GET  /api/health                     — health check
 *   OPTIONS *                            — CORS preflight
 */

import { collectFingerprint } from './collector.js';

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
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        kv_available: !!env.CACHE,
      }, 200, request, env);
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
