// Everything that leaves the browser: the Worker (whoami, scan, stats, speed test), the public IP
// services used only when the Worker is down, and the WebRTC probe (which sends nothing).

import { WORKER_API } from './config.js';
import { state } from './state.js';
import { LOCAL_TZ } from './signals.js';

export async function fetchWithTimeout(url, { timeout = 6000, ...options } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal });
    if (!resp.ok) throw new Error(resp.statusText || `HTTP ${resp.status}`);
    return resp;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/* ---- Country and language helpers ---- */

const COUNTRY_NAME_TO_CODE = {
  'united states': 'US', usa: 'US', 'united kingdom': 'GB', 'great britain': 'GB', russia: 'RU', 'russian federation': 'RU',
  china: 'CN', "people's republic of china": 'CN', india: 'IN', brazil: 'BR', indonesia: 'ID', nigeria: 'NG',
  japan: 'JP', germany: 'DE', 'federal republic of germany': 'DE', france: 'FR', uzbekistan: 'UZ'
};

// Languages one expects in a country; a browser language outside the list is a VPN hint.
const COUNTRY_LANG_MAP = {
  ru: ['ru'], uz: ['uz', 'ru'], ua: ['uk', 'ru'], by: ['be', 'ru'], kz: ['kk', 'ru'], kg: ['ky', 'ru'], tj: ['tg', 'ru'], az: ['az', 'ru'], am: ['hy', 'ru'], ge: ['ka', 'ru'],
  ee: ['et', 'ru'], lv: ['lv', 'ru'], lt: ['lt', 'ru'], pl: ['pl'], de: ['de'], fr: ['fr'], es: ['es', 'ca'], it: ['it'], tr: ['tr'], cn: ['zh'], jp: ['ja'], kr: ['ko'],
  vn: ['vi'], th: ['th'], id: ['id'], in: ['hi', 'en'], us: ['en'], gb: ['en'], ca: ['en', 'fr'], au: ['en'], nz: ['en'], ie: ['en'], sg: ['en', 'ms', 'zh', 'ta'], hk: ['zh', 'en'],
  br: ['pt'], mx: ['es'], ar: ['es'], ch: ['de', 'fr', 'it'], se: ['sv'], no: ['no', 'nn'], fi: ['fi', 'sv'], dk: ['da'], nl: ['nl'], be: ['nl', 'fr', 'de'], pt: ['pt'], ro: ['ro'],
  bg: ['bg'], hu: ['hu'], cz: ['cs'], sk: ['sk'], rs: ['sr'], si: ['sl'], hr: ['hr'], gr: ['el'], il: ['he', 'ar'], ae: ['ar'], sa: ['ar'], ir: ['fa'], pk: ['ur', 'en'], bd: ['bn'],
  my: ['ms', 'en'], ph: ['en', 'tl'], za: ['en', 'af', 'zu', 'xh']
};

const VPN_KEYWORDS = ['vpn', 'virtual private network', 'nordvpn', 'expressvpn', 'surfshark', 'protonvpn', 'mullvad', 'privateinternetaccess', 'tunnelbear', 'cyberghost', 'tor exit', 'tor-exit', 'socks proxy', 'proxy service', 'anonymizer', 'hosting', 'datacenter', 'data center', 'ovh', 'digitalocean', 'linode', 'leaseweb', 'm247', 'hetzner', 'contabo', 'colo', 'fastly', 'akamai', 'cloudflare-warp'];

export function normalizeCallingCode(code) {
  if (code == null) return null;
  let str = String(code).trim().replace(/[^0-9+]/g, '');
  while (str.startsWith('+')) str = str.slice(1);
  return str ? `+${str}` : null;
}

export function normalizeCountryCodeValue(code) {
  if (!code && code !== 0) return null;
  const norm = String(code).trim().toUpperCase();
  return norm && norm.length <= 3 ? norm : null;
}

export function resolveCountryCode(details, raw, geo) {
  const candidates = [details?.country_code, raw?.country_code, raw?.countryCode, raw?.country_code2, raw?.cc, geo?.country_code, geo?.countryCode];
  for (const cand of candidates) {
    const norm = normalizeCountryCodeValue(cand);
    if (norm) return norm;
  }
  const names = [details?.country_name, raw?.country_name, raw?.country, geo?.country];
  for (const name of names) {
    const key = name && COUNTRY_NAME_TO_CODE[String(name).trim().toLowerCase()];
    if (key) return key;
  }
  return null;
}

// The fields the page needs, from whatever shape an IP service answers with.
export function extractCanonicalDetailsFromPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const details = {};
  const region = payload.region_name || payload.region || payload.state_prov || payload.state || payload.province || payload.regionName || null;
  if (region) details.region = String(region);
  const countryName = payload.country_name || payload.country || payload.countryName || payload.country_long || payload.country_full || null;
  if (countryName) details.country_name = String(countryName);
  const countryCode = payload.country_code || payload.countryCode || payload.country_code2 || payload.cc || null;
  if (countryCode) details.country_code = String(countryCode).toUpperCase();
  let timezone = null;
  if (typeof payload.timezone === 'string') timezone = payload.timezone;
  else if (payload.timezone && typeof payload.timezone === 'object') timezone = payload.timezone.id || payload.timezone.name || null;
  else if (typeof payload.time_zone === 'string') timezone = payload.time_zone;
  else if (payload.time_zone && typeof payload.time_zone === 'object') timezone = payload.time_zone.name || payload.time_zone.id || null;
  if (timezone) details.timezone = String(timezone);
  const calling = normalizeCallingCode(payload.country_calling_code || payload.calling_code || payload.phone_prefix || null);
  if (calling) details.country_calling_code = calling;
  const org = payload.org || payload.organization || (payload.connection && (payload.connection.org || payload.connection.isp)) || payload.isp || payload.as || payload.company || null;
  if (org) details.org = String(org);
  if (payload.city) details.city = String(payload.city);
  return Object.keys(details).length ? details : null;
}

/* ---- The visitor's IP: the Worker first, public services only when it is down ---- */

async function fetchIpFromWorker() {
  const resp = await fetchWithTimeout(WORKER_API + '/api/whoami', { timeout: 8000, mode: 'cors', cache: 'no-store' });
  const data = await resp.json();
  if (!data || !data.ip) throw new Error('empty whoami');
  const geo = data.geo || {};
  const raw = {
    ip: data.ip, country_code: geo.country || '', country_name: geo.country || '', region: geo.region || '', city: geo.city || '',
    timezone: geo.timezone || '', org: data.network?.asOrganization || '', asn: data.network?.asn ? 'AS' + data.network.asn : '',
    latitude: geo.latitude || null, longitude: geo.longitude || null, continent_code: geo.continent || ''
  };
  const details = {
    region: geo.region || '', country_name: geo.country || '', country_code: geo.country || '', timezone: geo.timezone || '',
    country_calling_code: null, org: data.network?.asOrganization || '', city: geo.city || '', ip: data.ip
  };
  state.whoamiData = data;
  return { ip: data.ip, geo: { city: geo.city || '', country: geo.country || '' }, raw, source: 'worker', details, detailSource: 'worker' };
}

async function fetchIpFromIpapi() {
  const data = await (await fetchWithTimeout('https://ipapi.co/json/', { mode: 'cors', cache: 'no-store' })).json();
  if (!data?.ip) throw new Error('empty');
  return { ip: data.ip, geo: { city: data.city || '', country: data.country_name || data.country || '' }, raw: data, source: 'ipapi' };
}

async function fetchIpFromFreeipapi() {
  const data = await (await fetchWithTimeout('https://freeipapi.com/api/json', { mode: 'cors', cache: 'no-store' })).json();
  if (!data?.ipAddress) throw new Error('empty');
  const raw = { ...data, ip: data.ipAddress, country_name: data.countryName, country_code: data.countryCode, region: data.regionName, city: data.cityName, timezone: data.timeZone, org: data.isp || null };
  return { ip: data.ipAddress, geo: { city: data.cityName || '', country: data.countryName || data.countryCode || '' }, raw, source: 'freeipapi' };
}

async function fetchIpFromIpify() {
  const data = await (await fetchWithTimeout('https://api64.ipify.org?format=json', { mode: 'cors', cache: 'no-store', credentials: 'omit' })).json();
  if (!data?.ip) throw new Error('empty');
  return { ip: data.ip, geo: { city: '', country: '' }, raw: data, source: 'ipify' };
}

async function fetchIpFromMyip() {
  const data = await (await fetchWithTimeout('https://api.myip.com', { mode: 'cors', cache: 'no-store', credentials: 'omit', headers: { Accept: 'application/json' } })).json();
  if (!data?.ip) throw new Error('empty');
  return { ip: data.ip, geo: { city: '', country: data.country || data.cc || '' }, raw: data, source: 'myip' };
}

// The Worker's answer is final. When it is unreachable, the two services that return location
// details race first; ipify and myip (an IP and a country at most) only when those fail too.
export async function fetchIpData() {
  try { return await fetchIpFromWorker(); } catch (_) { /* fall back to the public services */ }
  const errors = [];
  for (const group of [[fetchIpFromIpapi, fetchIpFromFreeipapi], [fetchIpFromIpify, fetchIpFromMyip]]) {
    try {
      const result = await Promise.any(group.map(fn => fn()));
      result.details = extractCanonicalDetailsFromPayload(result.raw);
      result.detailSource = result.source;
      return result;
    } catch (e) {
      errors.push(...(e.errors || [e]).map(err => err.message || String(err)));
    }
  }
  const e = new Error(errors.join('; '));
  e.attempts = errors;
  throw e;
}

/* ---- VPN heuristics ---- */

function providerLooksLikeVpn(details, raw) {
  const lower = s => String(s || '').toLowerCase();
  const candidates = [details?.org, raw?.org, raw?.isp, raw?.as, raw?.company, raw?.connection?.isp, raw?.connection?.org, raw?.asn?.org, raw?.asn?.name].map(lower).filter(Boolean);
  if (candidates.some(org => VPN_KEYWORDS.some(key => org.includes(key)))) return true;
  const security = raw?.security || raw?.threat || {};
  if ([security.vpn, security.proxy, security.relay, security.tor, raw?.proxy, raw?.vpn, raw?.tor].some(v => v === true)) return true;
  const type = lower(raw?.connection?.type || raw?.type);
  return Boolean(type && (type.includes('hosting') || type.includes('datacenter') || type.includes('data center')));
}

function primaryLanguageCode() {
  const langs = navigator.languages;
  const first = langs && langs.length ? langs[0] : navigator.language || '';
  return String(first).split('-')[0].toLowerCase();
}

function languageMismatch(langCode, countryCode) {
  if (!langCode || !countryCode || langCode === 'en') return false;
  const allowed = COUNTRY_LANG_MAP[countryCode.toLowerCase()];
  return Boolean(allowed) && !allowed.includes(langCode);
}

export function evaluateVpnState(serverData) {
  const unknown = { status: 'uncertain', reasons: [], checked: false };
  if (!serverData) return unknown;
  const details = serverData.details || extractCanonicalDetailsFromPayload(serverData.raw);
  if (!details) return unknown;
  const raw = serverData.raw || {};
  const reasons = new Set();
  const norm = tz => String(tz || '').trim().toLowerCase();
  if (details.timezone && LOCAL_TZ && norm(details.timezone) !== norm(LOCAL_TZ)) reasons.add('timezone');
  const countryCode = normalizeCountryCodeValue(details.country_code || raw.country_code || raw.countryCode || raw.cc);
  if (languageMismatch(primaryLanguageCode(), countryCode)) reasons.add('language');
  if (providerLooksLikeVpn(details, raw)) reasons.add('asn');
  if (raw.proxy === true || raw.vpn === true || raw.tor === true) reasons.add('forwarded');
  let score = 0;
  for (const reason of reasons) score += reason === 'asn' || reason === 'forwarded' ? 3 : reason === 'timezone' ? 1.5 : 1;
  const connectionType = String(raw?.connection?.type || '').toLowerCase();
  const asType = String(raw?.asn?.type || '').toLowerCase();
  const looksResidential = [connectionType, asType].some(v => /residential|consumer|isp|mobile|cellular/.test(v));
  let status = 'uncertain';
  if (score >= 2.5) status = 'likely';
  else if (score === 0 && (details.timezone || details.country_name)) status = 'unlikely';
  else if (looksResidential && score < 2) status = 'unlikely';
  return { status, reasons: [...reasons], checked: true };
}

let ipFetchPromise = null;
// Fills state.serverData and state.vpn once; later calls return the stored answer.
export function autoFetchIp() {
  if (state.serverData) return Promise.resolve(state.serverData);
  if (ipFetchPromise) return ipFetchPromise;
  ipFetchPromise = (async () => {
    try {
      const data = await fetchIpData();
      if (!data || typeof data !== 'object') return null;
      state.serverData = data;
      state.vpn = evaluateVpnState(data);
      return data;
    } catch (e) {
      console.warn('IP lookup failed:', e.message);
      return null;
    } finally {
      ipFetchPromise = null;
    }
  })();
  return ipFetchPromise;
}

/* ---- Speed test through the Worker ---- */

export async function measureLatency() {
  const pings = [];
  for (let i = 0; i < 3; i++) {
    const t0 = performance.now();
    await fetch(WORKER_API + '/api/speedtest/ping', { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    pings.push(performance.now() - t0);
  }
  return Math.round(Math.min(...pings));
}

// Three downloads: a 500 KB warm-up, then 2 MB and 5 MB; the best throughput counts.
export async function measureDownload(onProgress) {
  const rounds = [{ size: 500000, warmup: true }, { size: 2000000 }, { size: 5000000 }];
  let best = 0;
  for (const round of rounds) {
    const t0 = performance.now();
    const resp = await fetch(WORKER_API + '/api/speedtest/download?size=' + round.size, { cache: 'no-store', signal: AbortSignal.timeout(30000) });
    const data = await resp.arrayBuffer();
    const seconds = (performance.now() - t0) / 1000;
    const mbps = (data.byteLength * 8) / (seconds * 1000000);
    if (mbps > best) best = mbps;
    if (!round.warmup && onProgress) onProgress(mbps);
  }
  return Number(best.toFixed(1));
}

/* ---- /api/scan for the visitor's own IP ---- */

export async function fetchScan(ip) {
  if (state.scan && state.scan.resolved_ip === ip) return state.scan;
  const resp = await fetch(WORKER_API + '/api/scan?target=' + encodeURIComponent(ip), { signal: AbortSignal.timeout(20000) });
  if (!resp.ok) throw new Error('API ' + resp.status);
  state.scan = await resp.json();
  return state.scan;
}

/* ---- /api/stats: anonymous aggregate counters ---- */

export async function fetchVisitorStats() {
  if (state.stats) return state.stats;
  try {
    const resp = await fetch(WORKER_API + '/api/stats', { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (resp.ok) state.stats = await resp.json();
  } catch (_) { /* the stats are decoration; the page works without them */ }
  return state.stats;
}

// The share (0–100) of visitors in a category whose key matches, or null below 100 visits.
export function getStatPercent(category, key) {
  const stats = state.stats;
  if (!stats || (stats.total_visits || 0) < 100) return null;
  const catData = stats[category];
  if (!catData) return null;
  let count = catData[key];
  if (count == null) {
    const lkey = (key || '').toLowerCase();
    for (const k of Object.keys(catData)) {
      if (k.toLowerCase().startsWith(lkey) || lkey.startsWith(k.toLowerCase())) { count = catData[k]; break; }
    }
  }
  if (count == null) return null;
  const pct = Math.round(count * 100 / (stats.total_visits || 1));
  return pct > 0 ? pct : null;
}

/* ---- WebRTC probe ---- */

// Gathers ICE host candidates without any STUN server, so no packet leaves the machine. Modern
// browsers hide local addresses behind mDNS names (xxx.local); a real IP in a candidate is what a
// tracker can read, and what a VPN does not hide.
export async function runWebRtcProbe() {
  const RTCPeer = window.RTCPeerConnection;
  if (!RTCPeer) return { checked: false, leak: false, ips: [] };
  const candidates = new Set();
  let pc = null;
  try {
    pc = new RTCPeer({ iceServers: [] });
    try { pc.createDataChannel('probe'); } catch (_) { /* ignore */ }
    const gathered = new Promise(resolve => {
      const timer = setTimeout(resolve, 1500);
      pc.onicecandidate = event => {
        if (event.candidate && event.candidate.candidate) candidates.add(event.candidate.candidate);
        else { clearTimeout(timer); resolve(); }
      };
    });
    await pc.setLocalDescription(await pc.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false }));
    await gathered;
  } catch (_) {
    return { checked: false, leak: false, ips: [] };
  } finally {
    try { pc?.close(); } catch (_) { /* ignore */ }
  }
  const ips = new Set();
  for (const candidate of candidates) {
    const parts = candidate.split(' ');
    const address = parts[4];
    if (address && !address.endsWith('.local') && /^[0-9a-f.:]+$/i.test(address)) ips.add(address);
  }
  return { checked: true, leak: ips.size > 0, ips: [...ips] };
}
