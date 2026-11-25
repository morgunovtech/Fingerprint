// Collects what the browser reveals without asking (the "basic" signals) and hashes the
// combination. Everything here stays in memory; nothing is sent anywhere.

import { state, snapshot } from './state.js?v=3.3.2';

const TEXT_ENCODER = new TextEncoder();

export const LOCAL_TZ = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (_) { return null; } })();
export const IS_IOS = (() => {
  const ua = navigator.userAgent || '';
  return /iP(?:ad|hone|od)/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
})();
export const IS_ANDROID = /Android/i.test(navigator.userAgent || '');

export async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', TEXT_ENCODER.encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// A short deterministic hash of a string or byte sample, as 8 hex digits.
function shortHash(iterable) {
  let h = 0;
  for (const v of iterable) { h = ((h << 5) - h) + v; h = h & h; }
  return Math.abs(h).toString(16).padStart(8, '0');
}

function sortDeep(value) {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object') {
    const out = {};
    Object.keys(value).sort().forEach(k => { out[k] = sortDeep(value[k]); });
    return out;
  }
  return value;
}

/* ---- Individual signals ---- */

function hasStorage(type) {
  try {
    const x = '__fp__';
    window[type].setItem(x, x);
    const ok = window[type].getItem(x) === x;
    window[type].removeItem(x);
    return ok;
  } catch (_) { return false; }
}

export function detectPointerType() {
  try {
    if (window.matchMedia && window.matchMedia('(pointer:fine)').matches) return 'fine';
    if (window.matchMedia && window.matchMedia('(pointer:coarse)').matches) return 'coarse';
  } catch (_) { /* ignore */ }
  return 'none';
}

export function getLanguages() {
  try {
    const langs = Array.isArray(navigator.languages) ? navigator.languages.filter(Boolean) : [];
    if (langs.length) return langs;
    return navigator.language ? [navigator.language] : [];
  } catch (_) { return []; }
}

async function getUaHints(uaData) {
  if (!uaData?.getHighEntropyValues) return null;
  try {
    return await uaData.getHighEntropyValues(['architecture', 'bitness', 'model', 'platformVersion', 'uaFullVersion']);
  } catch (_) { return null; }
}

export function detectScreenSetup() {
  const scr = window.screen;
  if (!scr) return { mode: 'unknown', count: null };
  if (typeof scr.isExtended === 'boolean') return { mode: scr.isExtended ? 'multi' : 'single', count: scr.isExtended ? null : 1 };
  const extended = Boolean((typeof scr.availLeft === 'number' && scr.availLeft !== 0) || (typeof scr.availTop === 'number' && scr.availTop !== 0));
  return extended ? { mode: 'multi', count: null } : { mode: 'single', count: 1 };
}

function detectMemory() {
  const info = { deviceMemory: null, heapLimit: null };
  try {
    if (typeof navigator.deviceMemory === 'number' && !Number.isNaN(navigator.deviceMemory)) info.deviceMemory = Math.max(1, Math.round(navigator.deviceMemory));
  } catch (_) { /* ignore */ }
  try {
    const perf = performance?.memory;
    if (perf && typeof perf.jsHeapSizeLimit === 'number' && perf.jsHeapSizeLimit > 0) info.heapLimit = Math.max(1, Math.round(perf.jsHeapSizeLimit / (1024 * 1024 * 1024)));
  } catch (_) { /* ignore */ }
  return info;
}

async function canvasHash() {
  try {
    const c = document.createElement('canvas');
    c.width = 320; c.height = 120;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 320, 0);
    grad.addColorStop(0, '#000'); grad.addColorStop(1, '#0bf');
    g.fillStyle = grad; g.fillRect(0, 0, 320, 120);
    g.fillStyle = '#fff'; g.font = '16px Arial'; g.rotate(0.03);
    g.fillText('fp', 10, 24); g.fillText(navigator.userAgent, 10, 60);
    return sha256(c.toDataURL());
  } catch (_) { return ''; }
}

// One WebGL context for both the vendor/renderer strings and the render hash.
function getWebGLFingerprint() {
  let gl = null;
  try {
    const canvas = document.createElement('canvas');
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { supported: false, vendor: null, renderer: null };
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const extensions = gl.getSupportedExtensions() || [];
    canvas.width = 256; canvas.height = 256;
    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, 'attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}');
    gl.compileShader(vShader);
    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, 'precision mediump float;void main(){gl_FragColor=vec4(0.86,0.27,0.33,1.0);}');
    gl.compileShader(fShader);
    const prog = gl.createProgram();
    gl.attachShader(prog, vShader); gl.attachShader(prog, fShader); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.5, -0.5, 0.5, -0.5, 0, 0.5]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
    const pixels = new Uint8Array(256 * 256 * 4);
    gl.readPixels(0, 0, 256, 256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    const sample = [];
    for (let i = 0; i < pixels.length; i += 37) sample.push(pixels[i]);
    return { supported: true, vendor: vendor || null, renderer: renderer || null, extensionsCount: extensions.length, hash: shortHash(sample) };
  } catch (_) {
    return { supported: false, vendor: null, renderer: null };
  } finally {
    try { if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) { /* ignore */ }
  }
}

// One OfflineAudioContext render gives both the sha256 over the whole signal (the "audio hash" of
// the detail cards) and the short hash of a window of samples (the fingerprint row and the model).
async function getAudioFingerprint() {
  try {
    const AudioCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!AudioCtx) return { supported: false, hash: null, full: '' };
    const context = new AudioCtx(1, 44100, 44100);
    const osc = context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(10000, context.currentTime);
    const comp = context.createDynamicsCompressor();
    comp.threshold.setValueAtTime(-50, context.currentTime);
    comp.knee.setValueAtTime(40, context.currentTime);
    comp.ratio.setValueAtTime(12, context.currentTime);
    comp.attack.setValueAtTime(0, context.currentTime);
    comp.release.setValueAtTime(0.25, context.currentTime);
    osc.connect(comp); comp.connect(context.destination); osc.start(0);
    const buffer = await context.startRendering();
    const data = buffer.getChannelData(0);
    let acc = 0;
    for (let i = 0; i < data.length; i += 64) acc += Math.abs(data[i]);
    const window_ = [];
    for (let i = 4500; i < Math.min(5000, data.length); i++) window_.push(Math.round(data[i] * 1000000));
    return { supported: true, hash: shortHash(window_), full: await sha256(String(acc)) };
  } catch (_) { return { supported: false, hash: null, full: '' }; }
}

const TEST_FONTS = ['Arial', 'Verdana', 'Times New Roman', 'Georgia', 'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Arial Black', 'Palatino', 'Lucida Console', 'Tahoma', 'Helvetica', 'Calibri', 'Cambria', 'Segoe UI', 'Optima', 'Futura', 'Gill Sans', 'Candara', 'Century Gothic', 'Garamond', 'Book Antiqua', 'Franklin Gothic Medium', 'Consolas', 'Menlo', 'Monaco', 'SF Pro Text', 'Roboto', 'Noto Sans'];

// Which of 30 common fonts are installed, by measuring text width against the generic families.
function getFontFingerprint() {
  try {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return { count: 0, hash: '0', list: [] };
    const testStr = 'mmmmmmmmmmlli';
    const size = '72px';
    const baseWidths = {};
    for (const base of baseFonts) { ctx.font = `${size} ${base}`; baseWidths[base] = ctx.measureText(testStr).width; }
    const detected = [];
    for (const font of TEST_FONTS) {
      for (const base of baseFonts) {
        ctx.font = `${size} '${font}', ${base}`;
        if (ctx.measureText(testStr).width !== baseWidths[base]) { detected.push(font); break; }
      }
    }
    const s = detected.join(',');
    return { count: detected.length, hash: shortHash(Array.from(s, ch => ch.charCodeAt(0))), list: detected };
  } catch (_) { return { count: 0, hash: '0', list: [] }; }
}

async function getBattery() {
  try {
    if (navigator.getBattery) {
      const b = await navigator.getBattery();
      return { level: b.level, charging: b.charging };
    }
  } catch (_) { /* ignore */ }
  return { unavailable: true };
}

const PERMISSION_NAMES = ['geolocation', 'notifications', 'camera', 'microphone', 'clipboard-read', 'clipboard-write', 'persistent-storage'];
async function getPermissions() {
  const out = {};
  if (!navigator.permissions) return out;
  await Promise.all(PERMISSION_NAMES.map(async n => {
    try { out[n] = (await navigator.permissions.query({ name: n })).state; } catch (_) { out[n] = 'error'; }
  }));
  return out;
}

async function getMediaDevices() {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const list = await navigator.mediaDevices.enumerateDevices();
    return list.map(d => ({ kind: d.kind, label: !!d.label }));
  } catch (_) { return []; }
}

function getPlugins() {
  try { return Array.from(navigator.plugins || []).map(p => p.name); } catch (_) { return []; }
}

export function netInfo() {
  try {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return {};
    return { downlink: c.downlink, rtt: c.rtt, effectiveType: c.effectiveType, type: c.type };
  } catch (_) { return {}; }
}

const TRACKER_PATTERNS = ['analytics', 'googletagmanager', 'doubleclick', 'facebook', 'pixel', 'metrics', 'metrika', 'hotjar', 'mixpanel', 'segment', 'amplitude', 'sentry', 'datadog', 'newrelic', 'bugsnag', 'smartlook', 'fullstory', 'clarity', 'telemetry', 'tracking', 'yandex', 'googleads', 'statcounter', 'plausible'];

// Third-party hosts this page itself loaded (from the resource timing entries): fonts, anything
// that looks like a tracker, and everything else. On this site the list is normally empty.
function collectExposureData() {
  const fonts = new Set(), trackers = new Set(), resources = new Set();
  try {
    for (const entry of performance?.getEntriesByType?.('resource') || []) {
      const name = entry?.name;
      if (!name || typeof name !== 'string' || name.startsWith('data:')) continue;
      let url;
      try { url = new URL(name, location.href); } catch (_) { continue; }
      if (url.origin === location.origin) continue;
      const host = url.host;
      const initiator = entry.initiatorType || 'resource';
      resources.add(`${host} (${initiator})`);
      if (initiator.toLowerCase() === 'font') fonts.add(host);
      const hostLower = host.toLowerCase();
      const pathLower = url.pathname.toLowerCase();
      if (TRACKER_PATTERNS.some(p => hostLower.includes(p) || pathLower.includes(p))) trackers.add(host);
    }
  } catch (_) { /* ignore */ }
  return { fonts: [...fonts], trackers: [...trackers], resources: [...resources] };
}

/* ---- Snapshot ---- */

// The signals that must not be sampled twice (Canvas and audio rendering, permissions queries):
// collected once per page view.
let stableSignals = null;
async function getStableSignals() {
  if (stableSignals) return stableSignals;
  const uaData = navigator.userAgentData;
  const memoryInfo = detectMemory();
  const hw = {
    deviceMemory: memoryInfo.deviceMemory ?? null,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    memoryLimitGb: memoryInfo.heapLimit ?? null
  };
  const [cv, perms, media, bat, uaHints, audio] = await Promise.all([
    canvasHash(), getPermissions(), getMediaDevices(), getBattery(), getUaHints(uaData), getAudioFingerprint()
  ]);
  const webgl = getWebGLFingerprint();
  stableSignals = {
    uaData, hw, cv, perms, media, bat, uaHints, webgl, audio,
    fontsFp: getFontFingerprint(),
    languages: getLanguages(),
    screenSetup: detectScreenSetup(),
    pointer: detectPointerType()
  };
  return stableSignals;
}

export async function computeSnapshot() {
  const { uaData, hw, cv, perms, media, bat, uaHints, webgl, audio, fontsFp, languages, screenSetup, pointer } = await getStableSignals();
  const pixelRatio = Number(window.devicePixelRatio || 1) || 1;
  const basic = {
    userAgent: navigator.userAgent,
    uaBrands: uaData?.brands || null,
    uaMobile: uaData?.mobile ?? null,
    uaPlatform: uaData?.platform || null,
    uaHighEntropy: uaHints,
    platform: navigator.platform || null,
    languages,
    screen: { w: screen.width, h: screen.height, colorDepth: screen.colorDepth, pixelRatio, monitors: screenSetup },
    timezone: LOCAL_TZ,
    tzOffsetMinutes: new Date().getTimezoneOffset(),
    cookiesEnabled: navigator.cookieEnabled ?? null,
    dnt: navigator.doNotTrack || null,
    gpc: typeof navigator.globalPrivacyControl !== 'undefined' ? Boolean(navigator.globalPrivacyControl) : null,
    storage: { local: hasStorage('localStorage'), session: hasStorage('sessionStorage'), indexedDB: !!window.indexedDB },
    touch: { maxTouchPoints: navigator.maxTouchPoints || 0, ontouchstart: 'ontouchstart' in window },
    pointer,
    hw,
    gl: { vendor: webgl.vendor, renderer: webgl.renderer },
    net: netInfo(),
    perms,
    media,
    plugins: getPlugins(),
    battery: bat,
    hashes: { canvas: cv, audio: audio.full },
    webgl,
    audioFp: { supported: audio.supported, hash: audio.hash },
    fontsFp,
    exposure: collectExposureData()
  };
  const fp = await sha256(JSON.stringify(sortDeep(basic)));
  return { basic, fp };
}

// The snapshot ({basic, fp}), computed once; concurrent callers share the same promise.
export function getSnapshot() {
  if (snapshot.value) return Promise.resolve(snapshot.value);
  if (snapshot.promise) return snapshot.promise;
  snapshot.promise = computeSnapshot().then(result => { snapshot.value = result; snapshot.promise = null; return result; })
    .catch(err => { snapshot.promise = null; throw err; });
  return snapshot.promise;
}

export { state };
