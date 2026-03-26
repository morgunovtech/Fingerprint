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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
