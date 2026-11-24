// The uniqueness model: each stable browser-side signal is weighted by how common it is, the
// information content H of the visitor's combination is summed, and H is ranked against 25,000
// browsers sampled from the same tables (so the percentile is relative to the model, not to real
// visitors). Correlated signals are counted once through the corrections at the end.

import { browserFamily } from './device.js';

// Frequency tables (StatCounter, Cover Your Tracks 2024, Steam hardware survey). Keys that are
// not listed fall back to __other.
export const FREQ = {
  'browser.family': { Chrome: 0.63, Safari: 0.20, Edge: 0.05, Firefox: 0.029, __other: 0.091 },
  'os.family': { Windows: 0.41, Android: 0.28, iOS: 0.17, macOS: 0.085, Linux: 0.032, ChromeOS: 0.015, unknown: 0.018, __other: 0.0 },
  'screen': { '1920x1080@1': 0.22, '1366x768@1': 0.09, '1512x982@2': 0.06, '2560x1600@2': 0.07, '2532x1170@3': 0.035, '2556x1179@3': 0.03, '2560x1440@1': 0.06, '3840x2160@2': 0.04, __other: 0.395 },
  'dpr': { '1': 0.33, '1.25': 0.02, '1.5': 0.03, '2': 0.47, '3': 0.12, '4': 0.02, __other: 0.0 },
  'langs.count': { '1': 0.49, '2': 0.31, '3': 0.14, '4+': 0.06, __other: 0.0 },
  'gpu.brand': { NVIDIA: 0.31, Intel: 0.29, AMD: 0.16, Apple: 0.20, __other: 0.04 },
  'memory.bucket': { unknown: 0.18, '≤4': 0.16, '5-8': 0.28, '9-16': 0.26, '17+': 0.12 },
  'cores.bucket': { unknown: 0.14, '≤4': 0.29, '5-8': 0.37, '9-16': 0.16, '17+': 0.04 },
  'has.canvas': { '1': 0.97, '0': 0.03 },
  'has.audio': { '1': 0.97, '0': 0.03 },
  'plugins.bucket': { '0': 0.74, '1-3': 0.18, '4+': 0.08 },
  'perm.bucket': { '0': 0.58, '1-3': 0.32, '4+': 0.10 },
  'storage.bucket': { full: 0.46, 'local+session': 0.22, partial: 0.12, 'cookies-only': 0.12, restricted: 0.06, unknown: 0.02 },
  'touch.bucket': { unknown: 0.08, none: 0.39, limited: 0.18, multi: 0.35 },
  'webgl.renderer': {
    'ANGLE (Apple, Apple M1, OpenGL)': 0.12,
    'ANGLE (Apple, Apple M2, OpenGL)': 0.06,
    'ANGLE (Apple, Apple M3, OpenGL)': 0.04,
    'ANGLE (Intel, Intel UHD Graphics, OpenGL)': 0.15,
    'ANGLE (NVIDIA, GeForce GTX 1650, OpenGL)': 0.05,
    'ANGLE (NVIDIA, GeForce RTX 3060, OpenGL)': 0.04,
    'ANGLE (AMD, Radeon RX 580, OpenGL)': 0.03,
    'Mali-G78': 0.08,
    'Adreno (TM) 730': 0.05,
    'Adreno (TM) 660': 0.06,
    'Apple GPU': 0.10,
    __other: 0.22
  },
  'audio.hash': { silent: 0.05, 'common-a': 0.18, 'common-b': 0.17, rare: 0.25, unique: 0.20, blocked: 0.08, __other: 0.07 },
  'fonts.bucket': { '0': 0.06, '1-5': 0.10, '6-10': 0.14, '11-15': 0.22, '16-20': 0.22, '21-25': 0.14, '26-30': 0.07, '31+': 0.05 }
};

const ALPHA = 1; // Laplace smoothing

// Tables normalised to sum to 1, with their size for the smoothing.
const FREQ_META = Object.fromEntries(Object.entries(FREQ).map(([name, table]) => {
  const entries = Object.entries(table).map(([k, v]) => [k, Math.max(v, 0)]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0) || 1;
  return [name, { table: Object.fromEntries(entries.map(([k, v]) => [k, v / total])), total: 1, size: entries.length }];
}));

const FREQ_SAMPLERS = Object.fromEntries(Object.entries(FREQ_META).map(([name, meta]) => {
  let acc = 0;
  const cdf = Object.entries(meta.table).map(([key, val]) => { acc += val; return { key, threshold: acc }; });
  return [name, { cdf, total: acc || 1 }];
}));

function pFrom(table, key) {
  const meta = FREQ_META[table];
  if (!meta) return 1;
  const { table: freq, total, size } = meta;
  const fallback = freq.__other ?? 0;
  const value = Object.prototype.hasOwnProperty.call(freq, key) ? freq[key] : fallback;
  return (value + ALPHA) / (total + ALPHA * size);
}

/* ---- Buckets: raw signals → table keys ---- */

export function canonicalOsFamily(osLabel) {
  const label = (osLabel || '').toLowerCase();
  if (!label) return 'unknown';
  if (label.includes('windows')) return 'Windows';
  if (label.includes('android')) return 'Android';
  if (label.includes('ios') || label.includes('ipad') || label.includes('iphone')) return 'iOS';
  if (label.includes('mac')) return 'macOS';
  if (label.includes('chromeos') || label.includes('chrome os')) return 'ChromeOS';
  if (label.includes('linux')) return 'Linux';
  return '__other';
}
export function bucketDeviceMemory(mem) {
  if (!mem || Number.isNaN(mem)) return 'unknown';
  if (mem <= 4) return '≤4';
  if (mem <= 8) return '5-8';
  if (mem <= 16) return '9-16';
  return '17+';
}
export function bucketCoreCount(cores) {
  if (!cores || Number.isNaN(cores)) return 'unknown';
  if (cores <= 4) return '≤4';
  if (cores <= 8) return '5-8';
  if (cores <= 16) return '9-16';
  return '17+';
}
function bucketSmallCount(n) { return n <= 0 ? '0' : n <= 3 ? '1-3' : '4+'; }
function bucketFontsCount(n) {
  if (n <= 0) return '0';
  if (n <= 5) return '1-5';
  if (n <= 10) return '6-10';
  if (n <= 15) return '11-15';
  if (n <= 20) return '16-20';
  if (n <= 25) return '21-25';
  if (n <= 30) return '26-30';
  return '31+';
}
function storageBucketKey(storage, cookiesEnabled) {
  if (!storage) return 'unknown';
  const { local, session, indexedDB } = storage;
  if (local && session && indexedDB) return 'full';
  if (local && session) return 'local+session';
  if (local || session || indexedDB) return 'partial';
  if (cookiesEnabled) return 'cookies-only';
  return 'restricted';
}
function touchBucketKey(touch) {
  if (!touch) return 'unknown';
  const maxPoints = Number(touch.maxTouchPoints || 0);
  if (maxPoints <= 0) return 'none';
  if (maxPoints <= 2) return 'limited';
  return 'multi';
}
export function brandFromRenderer(r) {
  r = (r || '').toLowerCase();
  if (r.includes('nvidia')) return 'NVIDIA';
  if (r.includes('intel')) return 'Intel';
  if (r.includes('amd') || r.includes('ati')) return 'AMD';
  if (r.includes('apple')) return 'Apple';
  return '__other';
}
// The audio hash itself is unique per device class; the model only knows how "usual" a hash is,
// so the first hex digit picks one of the table's buckets deterministically.
function audioHashBucket(audioFp) {
  if (!audioFp) return 'silent';
  if (!audioFp.supported) return 'blocked';
  const h = audioFp.hash || '';
  if (!h) return 'silent';
  return ['common-a', 'common-b', 'rare', 'unique'][(h.charCodeAt(0) || 0) % 4];
}

// The 17 features of the model from a snapshot's basic signals. osFamily comes from the caller
// (device.js knows how to read the OS from UA and Client Hints).
export function featuresOf(basic, osLabel) {
  const langCount = (basic.languages || []).length;
  return {
    browser: browserFamily(basic.userAgent),
    osFamily: canonicalOsFamily(osLabel),
    screen: `${basic.screen.w}x${basic.screen.h}@${basic.screen.pixelRatio}`,
    dpr: String(basic.screen.pixelRatio),
    langsCount: langCount >= 4 ? '4+' : String(langCount || 0),
    gpuBrand: brandFromRenderer(basic.gl?.renderer || ''),
    memoryBucket: bucketDeviceMemory(basic.hw.deviceMemory),
    coresBucket: bucketCoreCount(basic.hw.hardwareConcurrency),
    hasCanvas: basic.hashes.canvas ? '1' : '0',
    hasAudio: basic.hashes.audio ? '1' : '0',
    pluginsBucket: bucketSmallCount((basic.plugins || []).length),
    permBucket: bucketSmallCount(Object.keys(basic.perms || {}).length),
    storageBucket: storageBucketKey(basic.storage, basic.cookiesEnabled),
    touchBucket: touchBucketKey(basic.touch),
    webglRenderer: basic.webgl && basic.webgl.supported ? basic.webgl.renderer : '__other',
    audioHash: audioHashBucket(basic.audioFp),
    fontsBucket: bucketFontsCount((basic.fontsFp && basic.fontsFp.count) || 0)
  };
}

const FEATURE_TABLES = {
  browser: 'browser.family', osFamily: 'os.family', screen: 'screen', dpr: 'dpr', langsCount: 'langs.count',
  gpuBrand: 'gpu.brand', memoryBucket: 'memory.bucket', coresBucket: 'cores.bucket', hasCanvas: 'has.canvas',
  hasAudio: 'has.audio', pluginsBucket: 'plugins.bucket', permBucket: 'perm.bucket', storageBucket: 'storage.bucket',
  touchBucket: 'touch.bucket', webglRenderer: 'webgl.renderer', audioHash: 'audio.hash', fontsBucket: 'fonts.bucket'
};

// Information content in bits of a feature combination. Only stable browser-side signals: IP,
// speed and latency arrive later and would make the score jump mid-session.
export function entropyFromFeatures(f) {
  let H = 0;
  for (const [feature, table] of Object.entries(FEATURE_TABLES)) H += -Math.log2(pFrom(table, f[feature]));
  // Correlation corrections: these pairs mostly say the same thing.
  if (f.browser === 'Safari' && f.gpuBrand === 'Apple') H -= 1.0;
  if (f.browser === 'Safari' && f.osFamily !== 'macOS' && f.osFamily !== 'iOS') H -= 0.5;
  if ((f.dpr === '2' || f.dpr === '3') && String(f.screen).endsWith('@' + f.dpr)) H -= 0.5;
  if (f.osFamily === 'Android' && f.touchBucket === 'none') H -= 0.5;
  if (f.gpuBrand && f.webglRenderer && f.webglRenderer !== '__other' && f.gpuBrand === (f.webglRenderer.split('/')[0] || '').trim()) H -= 0.5;
  return Math.max(0, H);
}

// Deterministic PRNG (mulberry32): the same seed gives the same reference distribution every run.
function mulberry32(seed) {
  let t = seed | 0;
  return function () {
    t = t + 0x6D2B79F5 | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleFromTable(table, rng) {
  const sampler = FREQ_SAMPLERS[table];
  if (!sampler) return '__other';
  const target = rng() * sampler.total;
  for (const entry of sampler.cdf) if (target <= entry.threshold) return entry.key;
  return sampler.cdf[sampler.cdf.length - 1]?.key || '__other';
}

export function buildEntropyDistribution(samples = 25000) {
  const rng = mulberry32(42);
  const dist = [];
  for (let i = 0; i < samples; i++) {
    const f = {};
    for (const [feature, table] of Object.entries(FEATURE_TABLES)) f[feature] = sampleFromTable(table, rng);
    dist.push(entropyFromFeatures(f));
  }
  return dist.sort((a, b) => a - b);
}

let distribution = null;

// The share of sampled browsers whose H is at or below the given one, 0–100.
export function percentileFromH(H) {
  if (!distribution) distribution = buildEntropyDistribution();
  let lo = 0, hi = distribution.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (distribution[mid] <= H) lo = mid + 1; else hi = mid;
  }
  return Math.min(100, Math.max(0, Math.round(100 * lo / distribution.length)));
}

export function uniquenessLevel(pct) {
  return pct >= 70 ? 'high' : pct >= 40 ? 'med' : 'low';
}
