/**
 * /api/whoami and /api/check: what a server learns from the request alone, before any
 * JavaScript runs. Nothing here is stored; trackVisitStats in index.js keeps aggregate counters.
 */

const BROWSERS = [
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

export function parseUA(ua) {
  if (!ua) return { browser: null, version: null, os: null, os_version: null };
  let browser = null, version = null, os = null, os_version = null;
  for (const [re, name] of BROWSERS) {
    const m = ua.match(re);
    if (m) { browser = name; version = (m[1] || m[2] || '').split('.')[0]; break; }
  }
  // Safari carries its version in Version/X, not after Safari/.
  if (browser === 'Safari') {
    const vm = ua.match(/Version\/(\S+)/);
    if (vm) version = vm[1].split('.')[0];
  }
  let m;
  if ((m = ua.match(/Windows NT (\d+\.\d+)/))) { os = 'Windows'; os_version = m[1]; }
  else if ((m = ua.match(/Mac OS X ([\d_]+)/))) { os = 'macOS'; os_version = m[1].replace(/_/g, '.'); }
  else if (/CrOS/.test(ua)) { os = 'ChromeOS'; }
  else if ((m = ua.match(/Android ([\d.]+)/))) { os = 'Android'; os_version = m[1]; }
  else if (/iPhone|iPad/.test(ua)) { os = 'iOS'; const v = ua.match(/OS ([\d_]+)/); if (v) os_version = v[1].replace(/_/g, '.'); }
  else if (/Linux/.test(ua)) { os = 'Linux'; }
  return { browser, version, os, os_version };
}

// The Client Hints the browser sends on its own (the low-entropy ones; the page asks for more).
export function parseHints(headers) {
  const ua = headers.get('sec-ch-ua') || null;
  const platform = headers.get('sec-ch-ua-platform') || null;
  if (!ua && !platform) return null;
  const unquote = v => (v ? v.replace(/"/g, '') : null);
  let browser = null;
  if (ua) {
    // "Chromium";v="134", "Google Chrome";v="134", "Not A(Brand";v="99"
    for (const [, name] of ua.matchAll(/"([^"]+)";v="([^"]+)"/g)) {
      if (!name.startsWith('Not')) { browser = name; break; }
    }
  }
  return {
    ua,
    platform: unquote(platform),
    mobile: headers.get('sec-ch-ua-mobile') || null,
    model: unquote(headers.get('sec-ch-ua-model')),
    platform_version: unquote(headers.get('sec-ch-ua-platform-version')),
    browser,
  };
}

// A short hash of the header names in order plus the values of the four that identify a client.
async function hashHeaders(headerOrder, headers) {
  const signalHeaders = ['accept', 'accept-language', 'accept-encoding', 'user-agent'];
  const parts = headerOrder.map(h => h.toLowerCase() + ':' + (signalHeaders.includes(h.toLowerCase()) ? headers.get(h) || '' : ''));
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts.join('|')));
  return [...new Uint8Array(hash)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Does the User-Agent agree with the Client Hints?
export function checkConsistency(uaParsed, hintsParsed) {
  if (!uaParsed || !hintsParsed) return { consistent: true, issues: [], details: 'Insufficient data for cross-check' };
  const issues = [];
  if (hintsParsed.browser && uaParsed.browser) {
    const hb = hintsParsed.browser.toLowerCase();
    const ub = uaParsed.browser.toLowerCase();
    if (!hb.includes(ub) && !ub.includes(hb) && !(hb.includes('chrom') && ub.includes('chrom'))) {
      issues.push(`UA says ${uaParsed.browser}, hints say ${hintsParsed.browser}`);
    }
  }
  if (hintsParsed.platform && uaParsed.os) {
    const families = ['windows', 'macos', 'linux', 'android', 'ios', 'chromeos'];
    const hp = hintsParsed.platform.toLowerCase();
    const uo = uaParsed.os.toLowerCase();
    if ((families.find(k => hp.includes(k)) || hp) !== (families.find(k => uo.includes(k)) || uo)) {
      issues.push(`UA says ${uaParsed.os}, hints say ${hintsParsed.platform}`);
    }
  }
  if (hintsParsed.mobile && uaParsed.os) {
    const isMobileUA = ['android', 'ios'].includes(uaParsed.os.toLowerCase());
    const isMobileHint = hintsParsed.mobile === '?1';
    if (isMobileUA !== isMobileHint) issues.push(`UA ${isMobileUA ? 'mobile' : 'desktop'}, hints ${isMobileHint ? 'mobile' : 'desktop'}`);
  }
  return { consistent: issues.length === 0, issues, details: issues.join('; ') || 'All checks passed' };
}

export async function buildWhoami(request) {
  const cf = request.cf || {};
  const headers = request.headers;
  const ip = headers.get('cf-connecting-ip') || '0.0.0.0';
  // The header order as Cloudflare hands it over: an approximation, but a stable one per client.
  const headerOrder = [];
  for (const [key] of headers.entries()) {
    if (!key.startsWith('cf-') && key !== 'x-real-ip' && key !== 'x-forwarded-for') headerOrder.push(key);
  }
  const uaParsed = parseUA(headers.get('user-agent') || '');
  const hintsParsed = parseHints(headers);
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
    ua_parsed: uaParsed,
    hints_parsed: hintsParsed,
    header_hash: await hashHeaders(headerOrder, headers),
    consistency: checkConsistency(uaParsed, hintsParsed),
    // Server-side values the page compares with what the browser reports about itself.
    cross_check: {
      server_timezone: cf.timezone || null,
      server_country: cf.country || null,
      server_platform: uaParsed.os || null,
      server_browser: uaParsed.browser ? `${uaParsed.browser} ${uaParsed.version || ''}`.trim() : null,
      server_accept_language: headers.get('accept-language') || null,
    },
  };
}

// The same report as plain text, for curl.
export function whoamiText(w) {
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
  if (w.consistency && !w.consistency.consistent) lines.push(`⚠ Mismatch: ${w.consistency.details}`);
  return lines.join('\n') + '\n';
}
