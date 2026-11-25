// Self-test: runs the page's modules (site/src/*.js) in Node with a stub DOM and browser APIs,
// checks the helpers, the score, the strings' parity across languages and the UI controls, then
// the static files, the /en/ Pages Function and the Worker's providers. No install needed:
//   node selftest.js

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { webcrypto, createHash } = require('node:crypto');

const SITE = path.join(__dirname, 'site');
const read = rel => fs.readFileSync(path.join(__dirname, rel), 'utf8');
// The release number, read from the source so the static checks can use it before any module loads.
const APP_VERSION = read('site/src/config.js').match(/export const APP_VERSION = '([^']+)';/)[1];
// The page's modules are imported the way the page imports them, with ?v=<release>: Node keeps one
// module instance per URL, and the test must share the page's state rather than hold a second copy.
const moduleUrl = rel => new URL(rel, `file://${__dirname}/`).href + (rel.includes('/site/src/') ? `?v=${APP_VERSION}` : '');

function assertNoMergeMarkers(text, label) {
  for (const pattern of [/^<<<<<<< /m, /^=======$/m, /^>>>>>>> /m]) {
    if (pattern.test(text)) throw new Error(`Merge conflict marker ${pattern.source} found in ${label}`);
  }
}

const html = read('site/index.html');
assertNoMergeMarkers(html, 'site/index.html');
for (const dir of ['site/src', 'site/src/i18n', 'worker/src', 'worker/src/providers']) {
  for (const file of fs.readdirSync(path.join(__dirname, dir))) {
    if (file.endsWith('.js')) assertNoMergeMarkers(read(`${dir}/${file}`), `${dir}/${file}`);
  }
}

/* ============ Static files: the page's head, robots.txt, llms.txt ============ */
{
  const head = html.slice(0, html.indexOf('</head>'));
  assert.match(head, /<meta name="yandex-verification" content="33eb7fdb9bb757df" \/>/);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1, 'one JSON-LD block');
  // The page's scripts are its own files: the theme before first paint, the family chrome and the
  // module entry point; no inline code, no script from another origin. src/chrome.js is a copy of
  // https://s.morgunov.tech/ds/v1/chrome.js, named by the content hash the design system gives
  // that file (the first eight hex digits of its SHA-1), so a copy that drifted fails here.
  const chromeHash = createHash('sha1').update(fs.readFileSync(path.join(SITE, 'src/chrome.js'))).digest('hex').slice(0, 8);
  const chromeScript = `<script defer src="/src/chrome.js?v=${chromeHash}">`;
  const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map(m => m[0]);
  assert.deepEqual(scripts, [`<script src="/src/theme-init.js?v=${APP_VERSION}">`, '<script type="application/ld+json">', chromeScript, `<script type="module" src="/src/app.js?v=${APP_VERSION}">`], scripts.join(' '));
  assert.ok(read('site/src/chrome.js').startsWith('/* morgunov.tech design system — v1 — chrome.js'), 'src/chrome.js is the design system\'s file');
  // The morgunov.tech design system from its origin, fonts → tokens → base → components, pinned by
  // content hash, then the page's own stylesheet; 404.html links the same four files with the same hashes.
  const sheets = [...head.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)].map(m => m[1]);
  assert.deepEqual(sheets.map(href => href.replace(/\?v=[0-9a-f]{8}$/, '')), ['https://s.morgunov.tech/ds/v1/fonts.css', 'https://s.morgunov.tech/ds/v1/tokens.css', 'https://s.morgunov.tech/ds/v1/base.css', 'https://s.morgunov.tech/ds/v1/components.css', `/assets/app.css?v=${APP_VERSION}`], sheets.join(' '));
  assert.ok(sheets.slice(0, 4).every(href => /\?v=[0-9a-f]{8}$/.test(href)), 'the design-system files are pinned by content hash');
  const notFound = read('site/404.html');
  assert.deepEqual([...notFound.matchAll(/<link rel="stylesheet" href="([^"]+)" \/>/g)].map(m => m[1]), sheets.slice(0, 4), '404.html: the same design-system files');
  assert.ok(notFound.includes(`<script src="/src/theme-init.js?v=${APP_VERSION}"></script>`), '404.html loads theme-init.js at the release address');
  assert.ok(notFound.includes(`${chromeScript}</script>`), '404.html runs the same chrome script');

  // The family chrome (ds/v1/USAGE.md in about-me-page, "Service chrome"): every part is in the
  // markup of both pages, the theme menu has the four themes in the family's order, and the page
  // keeps no header, menu or button styles of its own.
  for (const [file, text] of [['site/index.html', html], ['site/404.html', notFound]]) {
    for (const part of ['class="skip-link"', '<div class="v4-root">', '<header class="v4-bar"', '<a class="v4-service" href="https://s.morgunov.tech/">', '<div class="v4-dropdown v4-theme">', '<main id="main">', '<footer class="v4-foot"']) {
      assert.ok(text.includes(part), `${file}: ${part}`);
    }
    assert.deepEqual([...text.matchAll(/data-theme-value="([a-z-]+)"/g)].map(m => m[1]), ['light', 'dark', 'auto', 'high-contrast'], `${file}: the theme menu`);
  }
  assert.ok(html.includes('<div class="v4-dropdown v4-lang">'), 'the language menu');
  assert.deepEqual([...html.matchAll(/class="v4-menu-item v4-lang-link"[^>]*data-lang="([a-z]+)"/g)].map(m => m[1]), ['ru', 'en', 'uz']);
  assert.ok(html.indexOf('v4-dropdown v4-lang') < html.indexOf('v4-dropdown v4-theme'), 'language, then theme at the edge');
  const appCss = read('site/assets/app.css');
  for (const own of [/^header\{/m, /^footer\{/m, /^\.btn\{/m, /\.menu-panel/, /\.toolbar/, /\.lang-switcher/, /\.theme-switcher/]) assert.ok(!own.test(appCss), `app.css: ${own.source}`);
  assert.match(head, /<meta name="theme-color" content="#edeae5" media="\(prefers-color-scheme: light\)" \/>/);

  // The theme before first paint: data-theme on <html> from theme-preference (the key every
  // morgunov.tech page shares), with the page's old key read as a fallback; a plain script, not a module.
  const themeInit = read('site/src/theme-init.js');
  for (const needle of ["'theme-preference'", "'fp_theme'", "'high-contrast'", "'data-theme'", "'data-theme-preference'", 'prefers-color-scheme: dark']) assert.ok(themeInit.includes(needle), `theme-init.js: ${needle}`);
  assert.ok(!/^\s*(import|export)\b/m.test(themeInit), 'theme-init.js is a plain script');

  // The design system's rules: square corners, no shadows or gradients, nothing heavier than 600, no
  // theme classes, no emoji in the chrome and the strings (the data may carry flags: device.js is not checked).
  for (const file of ['site/assets/app.css', 'site/index.html', 'site/404.html']) {
    const text = read(file);
    for (const pattern of [/border-radius/, /box-shadow/, /gradient\(/, /font-weight:\s*[789]00/, /\bforce-(light|dark|contrast)\b/]) assert.ok(!pattern.test(text), `${file}: ${pattern.source}`);
  }
  const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
  for (const file of ['site/index.html', 'site/404.html', 'site/src/app.js', 'site/src/config.js', 'site/src/walk.js', 'site/src/i18n/ru.js', 'site/src/i18n/en.js', 'site/src/i18n/uz.js']) {
    assert.ok(!emoji.test(read(file)), `${file}: no emoji in the chrome and the strings`);
  }

  // Every import between the modules names the release (?v=), as the page's own asset links do, so a
  // browser that cached an earlier release never runs its modules under today's markup; and _headers
  // makes the scripts and the stylesheet revalidate on every visit, like the page.
  for (const dir of ['site/src', 'site/src/i18n']) {
    for (const file of fs.readdirSync(path.join(__dirname, dir)).filter(f => f.endsWith('.js'))) {
      for (const [, spec] of read(`${dir}/${file}`).matchAll(/\bfrom '([^']+)'/g)) {
        if (spec.startsWith('.')) assert.ok(spec.endsWith(`?v=${APP_VERSION}`), `${dir}/${file} imports ${spec} without ?v=${APP_VERSION}`);
      }
    }
  }
  const headersFile = read('site/_headers');
  for (const prefix of ['/src/*', '/assets/*']) {
    assert.ok(headersFile.includes(`\n${prefix}\n  Cache-Control: public, max-age=0, must-revalidate\n`), `_headers: ${prefix} revalidates on every visit`);
  }
  const data = JSON.parse(blocks[0][1]);
  assert.equal(data['@type'], 'WebApplication');
  assert.equal(data.url, head.match(/<link rel="canonical" href="([^"]+)"/)[1]);
  assert.equal(data.applicationCategory, 'SecurityApplication');
  assert.equal(data.isAccessibleForFree, true);
  assert.deepEqual(data.inLanguage, ['ru', 'en', 'uz']);
  assert.equal(data.sameAs, 'https://github.com/morgunovtech/Fingerprint');
  assert.equal(data.author['@id'], 'https://s.morgunov.tech/#person');

  // A crawler that matches a named group ignores the * group, so every group carries the signals.
  const robots = read('site/robots.txt');
  const groups = robots.split(/\n(?=User-agent:)/).filter(group => group.startsWith('User-agent:'));
  assert.ok(groups.length > 1);
  groups.forEach(group => assert.match(group, /^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m, group.split('\n')[0]));
  assert.equal((robots.match(/^Content-Signal:/gm) || []).length, groups.length, 'one Content-Signal line per group');

  const llms = read('site/llms.txt');
  assert.match(llms, /^# Fingerprint/);
  assert.match(llms, /^> /m);
  for (const url of ['https://fprint.morgunov.tech/', 'https://github.com/morgunovtech/Fingerprint', 'https://s.morgunov.tech/']) {
    assert.ok(llms.includes(`(${url})`), url);
  }

  // Every id the modules look up exists in the markup.
  const srcText = fs.readdirSync(path.join(SITE, 'src')).filter(f => f.endsWith('.js')).map(f => read(`site/src/${f}`)).join('\n');
  const ids = new Set([...srcText.matchAll(/(?:getEl|getElementById)\('([A-Za-z-]+)'\)/g)].map(m => m[1]));
  const dynamicIds = new Set(['versionBtn', 'footerVisitCount', 'step-3', 'shareBtn', 'printBtn']); // rendered by the footer string and the walk
  for (const id of ids) {
    if (dynamicIds.has(id)) continue;
    assert.ok(html.includes(`id="${id}"`), `site/index.html has no element with id="${id}"`);
  }
}

/* ============ Stub DOM and browser APIs on globalThis ============ */

class Element {
  constructor(tagName = 'div', id = null) {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.dataset = Object.create(null);
    this.style = {};
    this.attributes = Object.create(null);
    this.listeners = Object.create(null);
    this._textContent = '';
    this._innerHTML = '';
    this.className = '';
    this.disabled = false;
    this.hidden = false;
    this.content = '';
    const set = new Set();
    this.classList = {
      _set: set,
      add: (...cls) => cls.forEach(c => set.add(c)),
      remove: (...cls) => cls.forEach(c => set.delete(c)),
      contains: c => set.has(c),
      toggle: (cls, force) => {
        const on = force === undefined ? !set.has(cls) : Boolean(force);
        if (on) set.add(cls); else set.delete(cls);
        return on;
      }
    };
  }
  set textContent(value) { this._textContent = String(value); this.children = []; }
  get textContent() { return this._textContent + this.children.map(c => (typeof c === 'object' ? c.textContent : '')).join(''); }
  set innerHTML(value) { this._innerHTML = String(value); this.children = []; }
  get innerHTML() { return this._innerHTML; }
  appendChild(child) {
    if (!child) return child;
    if (child._isFragment) { child.children.forEach(node => this.appendChild(node)); return child; }
    this.children.push(child);
    if (typeof child === 'object') child.parentNode = this;
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
  }
  remove() { this.parentNode?.removeChild(this); }
  replaceWith(node) {
    const parent = this.parentNode;
    if (!parent) return;
    parent.children.splice(parent.children.indexOf(this), 1, node);
    node.parentNode = parent;
  }
  cloneNode() { return this; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] ?? null; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(event, cb) { (this.listeners[event] = this.listeners[event] || []).push(cb); }
  focus() { this._focused = true; }
  contains(node) {
    if (node === this) return true;
    return this.children.some(child => (typeof child === 'object' && typeof child.contains === 'function') ? child.contains(node) : child === node);
  }
  hasClass(cls) { return this.classList._set.has(cls) || String(this.className).split(/\s+/).includes(cls); }
  querySelectorAll(selector) {
    const results = [];
    const classes = [...selector.matchAll(/\.([\w-]+)/g)].map(m => m[1]);
    const dataAttr = /^(\w+)?\[data-([a-z-]+)(?:="([^"]*)")?\]$/.exec(selector);
    const tag = /^([a-z]+)(?:[.[]|$)/i.exec(selector)?.[1];
    const match = node => {
      if (!node || typeof node !== 'object') return;
      let ok = true;
      if (dataAttr) {
        const key = dataAttr[2].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        ok = (!dataAttr[1] || node.tagName === dataAttr[1].toUpperCase()) && node.dataset && Object.prototype.hasOwnProperty.call(node.dataset, key)
          && (dataAttr[3] === undefined || node.dataset[key] === dataAttr[3]);
      } else if (classes.length) {
        ok = classes.every(c => node.hasClass(c)) && (!tag || selector.startsWith('.') || node.tagName === tag.toUpperCase());
      } else if (tag) {
        ok = node.tagName === tag.toUpperCase();
      } else ok = false;
      if (ok && node !== this) results.push(node);
      node.children.forEach(match);
    };
    match(this);
    return results;
  }
  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  click() {
    const event = { type: 'click', stopPropagation() {}, preventDefault() {}, target: this, currentTarget: this };
    (this.listeners.click || []).forEach(cb => cb(event));
  }
  get clientWidth() { const v = parseInt(this.style.width, 10); return Number.isNaN(v) ? 100 : v; }
  get clientHeight() { const v = parseInt(this.style.height, 10); return Number.isNaN(v) ? 20 : v; }
  get offsetHeight() { return this.clientHeight; }
  get offsetParent() { return this.style.display === 'none' || this.style.visibility === 'hidden' ? null : this.parentNode || null; }
}

class DocumentFragment {
  constructor() { this._isFragment = true; this.children = []; }
  appendChild(child) { if (child) this.children.push(child); return child; }
}

class Canvas2DContextStub {
  constructor() { this.fillStyle = '#000'; this.font = '10px sans-serif'; }
  createLinearGradient() { return { addColorStop: () => {} }; }
  fillRect() {}
  fillText() {}
  rotate() {}
  measureText() {
    const parts = String(this.font || '').split(',');
    const primary = parts[0].replace(/['"]/g, '').trim().replace(/^\d+px\s*/, '').trim() || 'sans-serif';
    const fallback = (parts[parts.length - 1] || '').replace(/['"]/g, '').trim() || primary;
    const base = fallback === 'monospace' ? 90 : fallback === 'serif' ? 100 : 110;
    return { width: base + (availableFonts.has(primary) ? 15 : 0) };
  }
}

class WebGLContextStub {
  constructor() { this.VENDOR = 'vendor'; this.RENDERER = 'renderer'; this.VERTEX_SHADER = 1; this.FRAGMENT_SHADER = 2; this.ARRAY_BUFFER = 3; this.STATIC_DRAW = 4; this.FLOAT = 5; this.COLOR_BUFFER_BIT = 6; this.TRIANGLES = 7; this.RGBA = 8; this.UNSIGNED_BYTE = 9; }
  getExtension(name) {
    if (name === 'WEBGL_debug_renderer_info') return { UNMASKED_VENDOR_WEBGL: 'UNMASKED_VENDOR_WEBGL', UNMASKED_RENDERER_WEBGL: 'UNMASKED_RENDERER_WEBGL' };
    return null;
  }
  getParameter(param) {
    if (param === 'UNMASKED_VENDOR_WEBGL' || param === this.VENDOR) return 'Apple Inc.';
    if (param === 'UNMASKED_RENDERER_WEBGL' || param === this.RENDERER) return 'Apple GPU';
    return '';
  }
  getSupportedExtensions() { return ['OES_texture_float']; }
  createShader() { return {}; } shaderSource() {} compileShader() {} createProgram() { return {}; } attachShader() {} linkProgram() {} useProgram() {}
  createBuffer() { return {}; } bindBuffer() {} bufferData() {} getAttribLocation() { return 0; } enableVertexAttribArray() {} vertexAttribPointer() {}
  clearColor() {} clear() {} drawArrays() {}
  readPixels(x, y, w, h, fmt, type, pixels) { for (let i = 0; i < pixels.length; i += 4) { pixels[i] = 219; pixels[i + 1] = 69; pixels[i + 2] = 84; pixels[i + 3] = 255; } }
}

class LinkElement extends Element {
  constructor() { super('a'); this.href = ''; this.download = ''; }
  click() { downloads.push({ href: this.href, download: this.download }); }
}

const downloads = [];
const clipboardWrites = [];
const sharePayloads = [];
const alerts = [];
let printed = false;
const availableFonts = new Set(['Arial', 'Roboto', 'Times New Roman']);

// The elements of site/index.html by id, with the menus' buttons.
const elements = new Map();
for (const [, tag, id] of html.matchAll(/<([a-z0-9]+)\b[^>]*\bid="([A-Za-z-]+)"/g)) elements.set(id, new Element(tag, id));
const introSource = html.match(/<div id="introText"[^>]*>([\s\S]*?)<\/div>\n  <\/section>/)[1];
elements.get('introText')._innerHTML = introSource;
for (const [menuId, attr, values] of [['lang-menu', 'lang', ['ru', 'en', 'uz']], ['theme-menu', 'themeValue', ['light', 'dark', 'auto', 'high-contrast']]]) {
  for (const value of values) {
    const btn = new Element('button');
    btn.dataset[attr] = value;
    elements.get(menuId).appendChild(btn);
  }
}

// <html>: the theme lives in its data-theme and data-theme-preference attributes.
const documentElement = new Element('html');
documentElement.lang = 'ru';
const bodyEl = new Element('body', 'body');
const cookieStore = new Map();

const documentStub = {
  documentElement,
  body: bodyEl,
  readyState: 'loading',
  title: '',
  _domReady: null,
  addEventListener(event, cb) { if (event === 'DOMContentLoaded') this._domReady = cb; },
  removeEventListener() {},
  createElement(tag) {
    const lower = String(tag).toLowerCase();
    if (lower === 'canvas') {
      return {
        width: 0, height: 0,
        getContext(type) {
          if (type === '2d') return new Canvas2DContextStub();
          if (type === 'webgl' || type === 'experimental-webgl') return new WebGLContextStub();
          return null;
        },
        toDataURL() { return 'data:image/png;base64,'; }
      };
    }
    if (lower === 'a') return new LinkElement();
    return new Element(tag);
  },
  createDocumentFragment() { return new DocumentFragment(); },
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, new Element('div', id));
    return elements.get(id);
  },
  execCommand(cmd) { return cmd === 'copy'; },
};
Object.defineProperty(documentStub, 'cookie', {
  get() { return Array.from(cookieStore.entries()).map(([k, v]) => `${k}=${v}`).join('; '); },
  set(value) {
    const [pair, ...attrs] = String(value).split(';');
    const [name, rawVal = ''] = pair.split('=');
    if (!name) return;
    if (attrs.some(a => a.trim().toLowerCase().startsWith('expires=') && a.includes('1970'))) cookieStore.delete(name.trim());
    else cookieStore.set(name.trim(), rawVal.trim());
  }
});

const localStore = new Map();
const sessionStore = new Map();
const storageAPI = store => ({
  getItem: key => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => { store.set(key, String(value)); },
  removeItem: key => { store.delete(key); }
});

const performanceStub = {
  _now: 0,
  now() { this._now += 50; return this._now; },
  memory: { jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 },
  getEntriesByType: () => [],
  getEntriesByName: () => []
};

class OfflineAudioContextStub {
  constructor() { this.destination = {}; this.currentTime = 0; }
  createOscillator() { return { type: 'sine', frequency: { setValueAtTime: () => {} }, connect: () => {}, start: () => {}, stop: () => {} }; }
  createDynamicsCompressor() {
    const param = { setValueAtTime: () => {} };
    return { threshold: param, knee: param, ratio: param, attack: param, release: param, connect: () => {} };
  }
  startRendering() { return Promise.resolve({ getChannelData: () => new Float32Array(44100).fill(0.5) }); }
}

// A peer connection that reports one host candidate with a real local address: a leak.
let webrtcCandidate = 'candidate:0 1 udp 2113937151 10.0.0.2 5000 typ host';
class RTCPeerConnectionStub {
  constructor() {
    setTimeout(() => {
      if (webrtcCandidate) this.onicecandidate?.({ candidate: { candidate: webrtcCandidate } });
      this.onicecandidate?.({ candidate: null });
    }, 5);
  }
  createDataChannel() { return {}; }
  async createOffer() { return {}; }
  async setLocalDescription() {}
  close() {}
}

const fetchLog = [];
// A /api/whoami body while the Worker is up; null makes the Worker unreachable.
let workerWhoami = null;
let workerScan = null;
let workerStats = null;
function makeHeaders(map) {
  const lower = Object.fromEntries(Object.entries(map || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
  return { get: name => (name ? lower[String(name).toLowerCase()] ?? null : null) };
}
function makeJsonResponse(data, headers = {}) {
  const base = { ok: true, status: 200, headers: makeHeaders(headers), json: async () => data, text: async () => JSON.stringify(data), arrayBuffer: async () => Buffer.from(JSON.stringify(data)), body: null };
  base.clone = () => makeJsonResponse(data, headers);
  return base;
}
function makeBinaryResponse(size) {
  return { ok: true, status: 200, headers: makeHeaders({ 'content-length': String(size) }), json: async () => ({}), arrayBuffer: async () => Buffer.alloc(size), body: null };
}

async function fetchStub(url, options = {}) {
  const target = String(url);
  fetchLog.push({ url: target, options });
  if (target.endsWith('/api/whoami')) {
    if (!workerWhoami) throw new Error('Worker unreachable');
    return makeJsonResponse(workerWhoami);
  }
  if (target.endsWith('/api/stats')) {
    if (!workerStats) throw new Error('Worker unreachable');
    return makeJsonResponse(workerStats);
  }
  if (target.includes('/api/scan?target=')) {
    if (!workerScan) throw new Error('Worker unreachable');
    return makeJsonResponse(workerScan);
  }
  if (target.endsWith('/api/speedtest/ping')) return makeBinaryResponse(4);
  if (target.includes('/api/speedtest/download?size=')) return makeBinaryResponse(Number(target.split('size=')[1]));
  if (target.startsWith('https://ipapi.co')) {
    return makeJsonResponse({ ip: '198.51.100.2', region: 'Tashkent', city: 'Tashkent', country_name: 'Uzbekistan', country_code: 'UZ', timezone: 'Asia/Tashkent', country_calling_code: '+998', org: 'Uzbektelekom Joint Stock Company' });
  }
  if (target.startsWith('https://api64.ipify.org')) return makeJsonResponse({ ip: '198.51.100.2' });
  if (target.startsWith('https://api.myip.com')) return makeJsonResponse({ ip: '198.51.100.2', country: 'Uzbekistan', cc: 'UZ' });
  throw new Error(`Unexpected fetch URL: ${target}`);
}

const navigatorStub = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  platform: 'MacIntel',
  languages: ['ru-RU', 'en-US'],
  language: 'ru-RU',
  maxTouchPoints: 0,
  clipboard: { writeText: async text => { clipboardWrites.push(text); } },
  permissions: { query: async () => ({ state: 'prompt' }) },
  mediaDevices: { enumerateDevices: async () => [{ kind: 'audioinput', label: 'Mic' }, { kind: 'videoinput', label: 'Camera' }] },
  plugins: [{ name: 'Test Plugin' }],
  connection: { downlink: 85, rtt: 30, effectiveType: '4g', type: 'wifi' },
  hardwareConcurrency: 8,
  deviceMemory: 16,
  cookieEnabled: true,
  doNotTrack: '1',
  getBattery: async () => ({ level: 0.76, charging: true }),
  share: async payload => { sharePayloads.push(payload); },
  canShare: () => true,
  userAgentData: {
    brands: [{ brand: 'Safari', version: '17' }],
    mobile: false,
    platform: 'macOS',
    getHighEntropyValues: async () => ({ architecture: 'arm', bitness: '64', model: '', platformVersion: '17.0.0', uaFullVersion: '17.0.0' })
  }
};

const windowStub = {
  document: documentStub,
  navigator: navigatorStub,
  localStorage: storageAPI(localStore),
  sessionStorage: storageAPI(sessionStore),
  indexedDB: {},
  devicePixelRatio: 2,
  screen: { width: 1512, height: 982, colorDepth: 24, isExtended: false, availLeft: 0, availTop: 0 },
  matchMedia: query => ({ media: query, matches: false, addEventListener() {}, removeEventListener() {} }),
  getComputedStyle: el => ({ display: el.style?.display ?? 'block', visibility: el.style?.visibility ?? 'visible' }),
  location: { origin: 'https://example.com', pathname: '/fingerprint/index.html', href: 'https://example.com/fingerprint/index.html', search: '', hash: '' },
  history: { replaceState: () => {} },
  isSecureContext: true,
  setTimeout, clearTimeout,
  alert: msg => alerts.push(msg),
  URL: { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} },
  fetch: fetchStub,
  OfflineAudioContext: OfflineAudioContextStub,
  RTCPeerConnection: RTCPeerConnectionStub,
  print: () => { printed = true; }
};
windowStub.window = windowStub;
// The live clock ticks on an interval; unref it so the test process can exit.
const nodeSetInterval = setInterval;
const unrefInterval = (fn, ms) => { const id = nodeSetInterval(fn, ms); id.unref?.(); return id; };
windowStub.setInterval = unrefInterval;
windowStub.clearInterval = clearInterval;

class BlobShim { constructor(parts, options = {}) { this.parts = parts; this.type = options.type || ''; } }
class FileShim extends BlobShim { constructor(parts, name, options = {}) { super(parts, options); this.name = name; } }

const globals = {
  window: windowStub, document: documentStub, navigator: navigatorStub, screen: windowStub.screen,
  localStorage: windowStub.localStorage, sessionStorage: windowStub.sessionStorage, performance: performanceStub,
  crypto: webcrypto, fetch: fetchStub, alert: windowStub.alert, location: windowStub.location, history: windowStub.history,
  OfflineAudioContext: OfflineAudioContextStub, RTCPeerConnection: RTCPeerConnectionStub,
  setInterval: unrefInterval, clearInterval, Blob: BlobShim, File: FileShim, URL: windowStub.URL, requestAnimationFrame: undefined
};
// URL is also the constructor the modules use for new URL(...): keep Node's and add the blob helpers.
globals.URL = Object.assign(URL, windowStub.URL);
for (const [name, value] of Object.entries(globals)) {
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}

/* ============ Static-file checks that need a module: the /en/ Function ============ */

// A PNG of 1200×630 in site/: the size LinkedIn, Telegram and X show in full.
function assertPreviewPng(url) {
  const prefix = 'https://fprint.morgunov.tech/';
  assert.ok(url.startsWith(prefix) && url.endsWith('.png'), url);
  const png = fs.readFileSync(path.join(SITE, url.slice(prefix.length)));
  assert.equal(png.toString('ascii', 1, 4), 'PNG', url);
  assert.equal(png.readUInt32BE(16), 1200, url);
  assert.equal(png.readUInt32BE(20), 630, url);
}
const metaContent = (page, attrName, key) => {
  const found = page.match(new RegExp(`<meta (?:id="\\w+" )?${attrName}="${key}" content="([^"]*)" />`));
  assert.ok(found, `${attrName}=${key}`);
  return found[1];
};

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const settle = async (n = 20) => { for (let i = 0; i < n; i++) await tick(); };
// Polls a condition (the bait tests take half a second each) for up to three seconds.
const waitFor = async (cond, label) => {
  for (let i = 0; i < 150; i++) { if (cond()) return; await new Promise(resolve => setTimeout(resolve, 20)); }
  throw new Error(`timed out waiting for ${label}`);
};

(async () => {
  // The <title> /en/ serves; the English render further down must set the same one.
  let enPageTitle;
  {
    const head = html.slice(0, html.indexOf('</head>'));
    ['og:image', 'twitter:image'].forEach(key => assertPreviewPng(metaContent(head, key.startsWith('og:') ? 'property' : 'name', key)));
    assert.equal(metaContent(head, 'property', 'og:image:width'), '1200');
    assert.equal(metaContent(head, 'property', 'og:image:height'), '630');
    assert.match(head, /<link rel="alternate" hreflang="en" href="https:\/\/fprint\.morgunov\.tech\/en\/" \/>/);
    assert.match(head, /<link rel="alternate" hreflang="x-default" href="https:\/\/fprint\.morgunov\.tech\/" \/>/);
    const { englishPage, EN } = await import(moduleUrl('./functions/en/index.js'));
    const { html: en, missing } = englishPage(html);
    assert.deepEqual(missing, [], 'functions/en/index.js could not find these tags in site/index.html');
    const enHead = en.slice(0, en.indexOf('</head>'));
    assert.match(enHead, /<html lang="en">/);
    // The <title> is rewritten too: search engines and readers without JavaScript never see the
    // script set the English one.
    const titleTag = enHead.match(/<title id="pageTitle">([^<]*)<\/title>/);
    assert.ok(titleTag, '/en/ keeps <title id="pageTitle">');
    assert.equal(titleTag[1], `${EN.title} — morgunov.tech`);
    enPageTitle = titleTag[1];
    assert.match(enHead, /<link rel="canonical" href="https:\/\/fprint\.morgunov\.tech\/en\/" \/>/);
    assert.equal(metaContent(enHead, 'property', 'og:url'), 'https://fprint.morgunov.tech/en/');
    assert.equal(metaContent(enHead, 'property', 'og:title'), EN.title);
    assert.equal(metaContent(enHead, 'property', 'og:description'), EN.description);
    assert.equal(metaContent(enHead, 'name', 'twitter:title'), EN.title);
    assert.equal(metaContent(enHead, 'name', 'twitter:description'), EN.description);
    assert.equal(metaContent(enHead, 'property', 'og:locale'), 'en_US');
    ['og:image', 'twitter:image'].forEach(key => {
      const url = metaContent(enHead, key.startsWith('og:') ? 'property' : 'name', key);
      assert.match(url, /-en\.png$/);
      assertPreviewPng(url);
    });
    // Only the JSON-LD block and the page body may stay Russian on /en/: no Cyrillic in the <title>
    // or in any <meta> tag.
    const headTags = enHead.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '').match(/<title\b[^>]*>[^<]*<\/title>|<meta [^>]*>/g);
    assert.ok(headTags.some(tag => tag.startsWith('<title')), '<title> is among the checked tags');
    headTags.forEach(tag => assert.doesNotMatch(tag, /[Ѐ-ӿ]/, tag));
    assert.equal(en.slice(enHead.length), html.slice(head.length), 'only the head changes');
    // The tags the page sets for English match the ones /en/ serves to link previews.
    const { I18N } = await import(moduleUrl('./site/src/i18n/index.js'));
    assert.equal(I18N.en.meta.title, EN.title);
    assert.equal(I18N.en.meta.description, EN.description);
  }

  /* ============ Worker providers ============ */
  const realFetch = globalThis.fetch;
  const realWarn = console.warn;
  const realLog = console.log;
  const setFetch = fn => Object.defineProperty(globalThis, 'fetch', { value: fn, configurable: true, writable: true });

  // Geolocation: ipquery.io, then ipinfo.io when it fails; HTTPS only.
  {
    const { fetchGeolocation } = await import(moduleUrl('./worker/src/providers/geolocation.js'));
    const geoUrls = [];
    let ipqueryUp = true;
    setFetch(async url => {
      const target = String(url);
      geoUrls.push(target);
      if (target.startsWith('https://api.ipquery.io/')) {
        if (!ipqueryUp) return { ok: false, status: 503, json: async () => ({}) };
        return makeJsonResponse({ ip: '198.51.100.2', isp: { asn: 'AS8193', org: 'Uzbektelekom', isp: 'Uzbektelekom' }, location: { country: 'Uzbekistan', country_code: 'UZ', city: 'Tashkent', state: 'Tashkent', latitude: 41.3, longitude: 69.2 }, risk: { is_mobile: true, is_vpn: false, is_tor: false, is_proxy: false, is_datacenter: false } });
      }
      if (target.startsWith('https://ipinfo.io/')) return makeJsonResponse({ ip: '198.51.100.2', city: 'Tashkent', region: 'Tashkent', country: 'UZ', loc: '41.3,69.2', org: 'AS8193 Uzbektelekom' });
      throw new Error(`Unexpected Worker fetch: ${target}`);
    });
    console.warn = () => {};
    try {
      const fromIpquery = await fetchGeolocation('198.51.100.2');
      assert.equal(fromIpquery.asn, 'AS8193');
      assert.equal(fromIpquery.region, 'Tashkent');
      assert.equal(fromIpquery.connection_type, 'mobile');
      ipqueryUp = false;
      const fromIpinfo = await fetchGeolocation('198.51.100.2');
      assert.equal(fromIpinfo.asn, 'AS8193');
      assert.equal(fromIpinfo.org, 'Uzbektelekom');
      assert.equal(fromIpinfo.connection_type, null);
      assert.ok(geoUrls.length === 3 && geoUrls.every(url => url.startsWith('https://')), geoUrls.join(' '));
    } finally {
      setFetch(realFetch);
      console.warn = realWarn;
    }
  }

  // Reputation: only 127.0.0.2–127.0.0.255 is a listing; 127.255.255.x is an error code
  // (Spamhaus refusing a public resolver) and the list is then not counted as checked.
  {
    const { DNSBLS, checkDnsbl, fetchReputation } = await import(moduleUrl('./worker/src/providers/reputation.js'));
    let dnsblAnswers = {};
    setFetch(async url => {
      const name = new URL(String(url)).searchParams.get('name');
      const list = DNSBLS.find(dnsbl => name.endsWith('.' + dnsbl));
      const answer = dnsblAnswers[list];
      if (answer === 'down') throw new Error('DoH unreachable');
      if (answer === 'nxdomain') return makeJsonResponse({ Status: 3 });
      return makeJsonResponse({ Status: 0, Answer: [{ name, type: 1, data: answer }] });
    });
    try {
      dnsblAnswers = { [DNSBLS[0]]: '127.0.0.2', [DNSBLS[1]]: '127.255.255.254' };
      assert.equal(await checkDnsbl('198.51.100.2', DNSBLS[0]), 'listed');
      assert.equal(await checkDnsbl('198.51.100.2', DNSBLS[1]), 'error');
      dnsblAnswers = { [DNSBLS[0]]: '127.0.0.2', [DNSBLS[1]]: '127.255.255.254', [DNSBLS[2]]: 'nxdomain', [DNSBLS[3]]: 'down' };
      const listed = await fetchReputation('198.51.100.2');
      assert.deepEqual([listed.blacklisted, listed.blacklist_hits, listed.blacklists_checked], [true, [DNSBLS[0]], 2]);
      dnsblAnswers = Object.fromEntries(DNSBLS.map(dnsbl => [dnsbl, '127.255.255.254']));
      assert.equal(await fetchReputation('198.51.100.2'), null);
      dnsblAnswers = Object.fromEntries(DNSBLS.map(dnsbl => [dnsbl, 'nxdomain']));
      const clean = await fetchReputation('198.51.100.2');
      assert.deepEqual([clean.blacklisted, clean.blacklists_checked], [false, DNSBLS.length]);
      assert.equal(await fetchReputation('2001:db8::1'), null);
    } finally {
      setFetch(realFetch);
    }
  }

  // Scan of an IP: geolocation, reverse DNS and blocklists only. No WHOIS lookup; the whois key
  // stays null so the /api/scan shape is unchanged.
  {
    const { collectFingerprint } = await import(moduleUrl('./worker/src/collector.js'));
    const scanUrls = [];
    setFetch(async url => {
      const target = String(url);
      scanUrls.push(target);
      if (target.startsWith('https://api.ipquery.io/')) return makeJsonResponse({ ip: '198.51.100.7', isp: { asn: 'AS8193', org: 'Uzbektelekom', isp: 'Uzbektelekom' }, location: { country_code: 'UZ' }, risk: {} });
      if (target.startsWith('https://dns.google/')) return makeJsonResponse({ Status: 3 });
      throw new Error(`Unexpected Worker fetch: ${target}`);
    });
    console.log = () => {};
    try {
      const scan = await collectFingerprint('198.51.100.7', {});
      assert.ok('whois' in scan);
      assert.equal(scan.whois, null);
      assert.ok(!scan.sources_ok.includes('whois') && !scan.sources_failed.includes('whois'));
      assert.ok(scan.sources_ok.includes('geolocation'));
      assert.ok(scanUrls.every(url => url.startsWith('https://api.ipquery.io/') || url.startsWith('https://dns.google/')), scanUrls.join(' '));
    } finally {
      setFetch(realFetch);
      console.log = realLog;
    }
  }

  // /api/whoami: the shape the page's server-fingerprint section reads.
  {
    const { buildWhoami, parseUA, checkConsistency, whoamiText } = await import(moduleUrl('./worker/src/whoami.js'));
    const headers = new Map([
      ['cf-connecting-ip', '198.51.100.2'], ['user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'],
      ['accept', 'text/html'], ['accept-language', 'ru-RU,ru;q=0.9'], ['accept-encoding', 'gzip'],
      ['sec-ch-ua', '"Chromium";v="134", "Google Chrome";v="134", "Not A(Brand";v="99"'], ['sec-ch-ua-platform', '"Windows"'], ['sec-ch-ua-mobile', '?0']
    ]);
    const request = { headers: { get: k => headers.get(k) ?? null, entries: () => headers.entries() }, cf: { country: 'UZ', city: 'Tashkent', timezone: 'Asia/Tashkent', asn: 8193, asOrganization: 'Uzbektelekom', httpProtocol: 'HTTP/2', tlsVersion: 'TLSv1.3', tlsCipher: 'AEAD-AES128-GCM-SHA256' } };
    const w = await buildWhoami(request);
    assert.equal(w.ip, '198.51.100.2');
    assert.equal(w.network.tlsVersion, 'TLSv1.3');
    assert.equal(w.network.httpProtocol, 'HTTP/2');
    assert.deepEqual(w.headers.header_order.slice(0, 2), ['user-agent', 'accept']);
    assert.equal(w.headers.client_hints.platform, 'Windows');
    assert.equal(w.headers.client_hints.browser, 'Chromium');
    assert.equal(w.header_hash.length, 16);
    assert.equal(w.consistency.consistent, true);
    assert.equal(w.cross_check.server_browser, 'Chrome 134');
    assert.deepEqual(parseUA('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'), { browser: 'Safari', version: '17', os: 'iOS', os_version: '17.0' });
    assert.equal(checkConsistency({ browser: 'Firefox', os: 'Linux' }, { browser: 'Chromium', platform: 'Windows', mobile: '?1' }).issues.length, 3);
    assert.match(whoamiText(w), /^IP:\s+198\.51\.100\.2\n/);
  }

  /* ============ The page's modules ============ */
  const signals = await import(moduleUrl('./site/src/signals.js'));
  const device = await import(moduleUrl('./site/src/device.js'));
  const network = await import(moduleUrl('./site/src/network.js'));
  const share = await import(moduleUrl('./site/src/share.js'));
  const { state, snapshot } = await import(moduleUrl('./site/src/state.js'));
  const { I18N } = await import(moduleUrl('./site/src/i18n/index.js'));

  assert.equal(signals.detectPointerType(), 'none');
  assert.deepEqual(signals.getLanguages(), ['ru-RU', 'en-US']);
  assert.equal(signals.detectScreenSetup().mode, 'single');
  assert.equal((await signals.sha256('test')).length, 64);
  assert.equal(network.normalizeCallingCode(' +998 '), '+998');
  const details = network.extractCanonicalDetailsFromPayload({ region_name: 'Tashkent', country_name: 'Uzbekistan', timezone: 'Asia/Tashkent', country_calling_code: '+998', org: 'Uzbektelekom Joint Stock Company' });
  assert.equal(details.org, 'Uzbektelekom Joint Stock Company');
  assert.equal(network.resolveCountryCode(details, {}, {}), 'UZ');
  assert.equal(device.browserDisplayName({ userAgent: navigatorStub.userAgent, uaBrands: navigatorStub.userAgentData.brands }), 'Safari 17');
  assert.equal(device.guessOSVersion({ userAgent: navigatorStub.userAgent, uaPlatform: 'macOS', uaHighEntropy: { platformVersion: '14.0.0' } }), 'macOS 14');
  assert.deepEqual(device.guessDevice({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/134', hw: { deviceMemory: 8 }, touch: { maxTouchPoints: 5 }, screen: { w: 412, h: 915, pixelRatio: 2.6 } }), { id: 'androidFlagship' });
  assert.equal(device.deviceKind({ id: 'androidFlagship' }), 'phone');
  assert.equal(device.deviceKind({ name: 'MacBook Air (Apple M2)' }), 'laptop');
  assert.equal(device.deviceKind({ name: 'iPad' }), 'tablet');
  assert.equal(device.osFamilyOf({ userAgent: navigatorStub.userAgent, uaPlatform: 'macOS' }), 'mac');
  assert.equal(device.osVendorKey('android'), 'google');
  assert.equal(device.osVendorKey('linux'), null);
  assert.equal(device.browserVendorKey('Yandex Browser'), 'yandex');
  assert.equal(device.browserVendorKey('Safari'), 'apple');
  assert.equal(device.formatGpuRenderer('ANGLE (Apple, Apple M2, OpenGL)'), 'Apple M2');

  // The IP lookup: a Worker answer is final; public IP services are only the fallback.
  const publicIpServices = /ipapi\.co|freeipapi\.com|ipify\.org|myip\.com/;
  const publicIpCalls = from => fetchLog.slice(from).map(entry => entry.url).filter(url => publicIpServices.test(url));
  const WHOAMI = {
    ip: '198.51.100.2',
    geo: { country: 'UZ', region: 'Tashkent', city: 'Tashkent', timezone: 'Asia/Tashkent', colo: 'TAS' },
    network: { asn: 8193, asOrganization: 'Uzbektelekom', httpProtocol: 'HTTP/2', tlsVersion: 'TLSv1.3', tlsCipher: 'AEAD-AES128-GCM-SHA256' },
    headers: { user_agent: navigatorStub.userAgent, accept_language: 'ru-RU,ru;q=0.9', header_order: ['user-agent', 'accept', 'accept-language'], client_hints: { ua: '"Chromium";v="134"', platform: 'macOS', mobile: '?0', browser: 'Chromium' } },
    header_hash: '0123456789abcdef',
    consistency: { consistent: true, issues: [] },
    cross_check: { server_timezone: 'Asia/Tashkent', server_platform: 'macOS', server_browser: 'Safari 17' }
  };
  workerWhoami = WHOAMI;
  let logStart = fetchLog.length;
  const fromWorker = await network.fetchIpData();
  assert.equal(fromWorker.source, 'worker');
  assert.equal(fromWorker.details.region, 'Tashkent');
  assert.deepEqual(publicIpCalls(logStart), []);
  assert.ok(fetchLog.slice(logStart).some(entry => entry.url === 'https://fprint.morgunov.tech/api/whoami'));
  assert.ok(!fetchLog.some(entry => entry.url.includes('workers.dev')), 'no calls to the workers.dev address');
  workerWhoami = null;
  state.whoamiData = null;
  logStart = fetchLog.length;
  const fromFallback = await network.fetchIpData();
  assert.equal(fromFallback.source, 'ipapi');
  assert.equal(fromFallback.details.country_calling_code, '+998');
  assert.ok(publicIpCalls(logStart).some(url => url.startsWith('https://ipapi.co')));
  assert.equal(share.resolveShareUrl(), 'https://example.com/fingerprint');

  // The same keys in every language, all the way down (functions compared by arity).
  const walk = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) => {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) return [p, ...walk(v, p)];
    return [typeof v === 'function' ? `${p}()` : p];
  });
  const baseKeys = walk(I18N.ru).filter(k => k !== 'introRichHtml');
  for (const [lang, dict] of Object.entries(I18N)) {
    const keys = new Set(walk(dict));
    const missing = baseKeys.filter(key => !keys.has(key));
    assert.deepEqual(missing, [], `Missing localization keys for ${lang}`);
    const extra = walk(dict).filter(key => key !== 'introRichHtml' && !baseKeys.includes(key));
    assert.deepEqual(extra, [], `Extra localization keys in ${lang}`);
  }
  // Every t.<key> the modules read exists in the strings.
  {
    const srcText = ['app', 'walk', 'share', 'trackers'].map(f => read(`site/src/${f}.js`)).join('\n');
    const known = new Set([...walk(I18N.ru).map(k => k.replace(/\(\)$/, '')), 'introRichHtml']);
    const used = new Set([...srcText.matchAll(/\bt\.([a-zA-Z]+(?:\.[a-zA-Z]+)*)/g)].map(m => m[1]));
    const unknown = [...used].filter(k => !known.has(k) && !known.has(k.split('.').slice(0, -1).join('.')));
    assert.deepEqual(unknown, [], 'strings the modules read but ru.js lacks');
  }

  /* ============ The page: start-up, the walk, controls, languages, the network check ============ */
  const app = await import(moduleUrl('./site/src/app.js'));
  assert.equal(typeof documentStub._domReady, 'function', 'app.js waits for DOMContentLoaded');
  workerStats = { total_visits: 1000, browsers: { 'Safari 17': 300 }, os: { macOS: 500 }, countries: { UZ: 400 }, tls_versions: { 'TLSv1.3': 950 } };
  // A theme saved under the page's old key moves to the shared one before first paint
  // (src/theme-init.js): "contrast" is "high-contrast". The family chrome's script takes it from there.
  localStore.set('fp_theme', 'contrast');
  new Function(read('site/src/theme-init.js'))();
  assert.equal(localStore.get('theme-preference'), 'high-contrast', 'fp_theme moved to theme-preference');
  assert.equal(localStore.has('fp_theme'), false, 'the old key is removed');
  assert.equal(documentElement.getAttribute('data-theme'), 'high-contrast');
  assert.equal(documentElement.getAttribute('data-theme-preference'), 'high-contrast');
  documentStub._domReady();
  await settle(40);
  assert.equal(documentElement.lang, 'ru');
  assert.ok(snapshot.value, 'the snapshot is computed');
  assert.equal(elements.get('introText').innerHTML, introSource, 'the Russian intro is the one from the markup');
  assert.deepEqual(alerts, []);

  // All the text a node holds: its own, its innerHTML and its children's.
  const textOf = node => (!node || typeof node !== 'object') ? '' : [node._textContent, node._innerHTML, ...node.children.map(textOf)].filter(Boolean).join(' ');
  const walkEl = elements.get('walk');
  const stepEl = n => walkEl.children.find(c => c.id === `step-${n}`);
  const stepText = n => textOf(stepEl(n)).replace(/<[^>]+>/g, ' ').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
  const titles = () => [1, 2, 3, 4, 5, 6].map(n => stepEl(n).querySelector('.step-title').textContent);
  assert.equal(walkEl.children.filter(c => c.hasClass('step')).length, 7, 'six steps and the sum');
  assert.deepEqual(titles(), ['Вы открыли ноутбук', 'Запустилась операционная система', 'Вы подключились к Wi-Fi', 'Вы открыли Safari', 'Вы ввели адрес сайта', 'Сайт открылся']);
  assert.ok(/MacBook/.test(stepText(1)) && /1512×982/.test(stepText(1)) && /Apple GPU/.test(stepText(1)), stepText(1));
  assert.ok(/macOS 17/.test(stepText(2)) && /Apple/.test(stepText(2)), stepText(2));
  assert.ok(stepEl(3).querySelector('[data-action="check-network"]'), 'the network button sits in step 3');
  assert.ok(/ваш интернет-провайдер/.test(stepText(3)), 'the provider is unnamed before the check');
  assert.ok(/Safari 17/.test(stepText(4)) && /у 30% посетителей/.test(stepText(4)), stepText(4));
  assert.ok(/Cloudflare/.test(stepText(5)));
  assert.ok(/Шрифты/.test(stepText(6)));
  const summaryEl = () => walkEl.children.find(c => c.id === 'summary');
  assert.ok(/Apple: устройство включено/.test(textOf(summaryEl())));
  assert.ok(/Нажмите кнопку на шаге 3/.test(textOf(summaryEl())), 'the sum says the provider is unknown until the check');
  assert.ok(state.sharePayload && state.sharePayload.text.includes('https://example.com/fingerprint'));

  // The probes ran once: the blocker row and the five bait rows, and the WebRTC stub's host candidate is a leak.
  await waitFor(() => state.trackerResults && state.webrtc, 'the tracker tests and the WebRTC probe');
  await settle();
  assert.equal(state.trackerResults.length, 5);
  assert.equal(stepEl(6).querySelectorAll('.tracker-row').length, 5);
  assert.deepEqual(state.webrtc, { checked: true, leak: true, ips: ['10.0.0.2'] });
  assert.ok(/виден адрес: 10\.0\.0\.2/.test(stepText(6)), stepText(6));
  assert.ok(/Блокировщик рекламы/.test(stepText(4)));

  // The family chrome's words follow the page's language; src/chrome.js opens the menus and
  // switches the theme (its behaviour is checked where it is written, in about-me-page).
  const langToggleEl = elements.get('lang-toggle');
  const langCodeEl = elements.get('langCode');
  const themeToggleEl = elements.get('theme-toggle');
  const themeOptions = elements.get('theme-menu').querySelectorAll('[data-theme-value]');
  const langOptions = elements.get('lang-menu').querySelectorAll('[data-lang]');
  const checkedLang = () => langOptions.filter(b => b.getAttribute('aria-checked') === 'true').map(b => b.dataset.lang);
  assert.equal(langCodeEl.textContent, 'RU');
  assert.equal(langToggleEl.getAttribute('aria-label'), 'RU — сменить язык');
  assert.equal(elements.get('skipLink').textContent, 'Перейти к основному содержимому');
  assert.equal(themeToggleEl.getAttribute('aria-label'), 'Сменить тему оформления');
  assert.deepEqual(themeOptions.map(b => b.textContent), ['Светлая', 'Тёмная', 'Авто', 'Высокий контраст']);
  assert.equal(langOptions.length, 3);
  assert.deepEqual(checkedLang(), ['ru']);
  // A language item switches in place: the link is not followed, the choice is saved.
  let followed = true;
  (langOptions[1].listeners.click || []).forEach(cb => cb({ type: 'click', preventDefault() { followed = false; }, target: langOptions[1], currentTarget: langOptions[1] }));
  await settle();
  assert.equal(followed, false, 'the language link is handled in place');
  assert.equal(documentElement.lang, 'en');
  assert.deepEqual(checkedLang(), ['en']);
  assert.equal(localStore.get('fp_lang'), 'en');
  langOptions[0].click();
  await settle();
  assert.equal(documentElement.lang, 'ru');
  assert.deepEqual(checkedLang(), ['ru']);

  // Share and save (the buttons live in the sum and are handled by data-action)
  const shareBtnEl = summaryEl().querySelector('[data-action="share"]');
  assert.ok(shareBtnEl);
  const savedSharePayload = state.sharePayload;
  state.sharePayload = null;
  await share.handleShareClick(shareBtnEl);
  assert.equal(shareBtnEl.textContent, I18N.ru.summary.share.unavailable);
  state.sharePayload = savedSharePayload;
  shareBtnEl.textContent = shareBtnEl.dataset.label;
  await share.handleShareClick(shareBtnEl);
  assert.equal(sharePayloads.length, 1);
  assert.ok(clipboardWrites[0].includes('Apple') && clipboardWrites[0].includes('https://example.com/fingerprint'));
  await share.handleSaveClick();
  assert.ok(printed || downloads.length > 0);

  // English and Uzbek
  await app.render('en');
  await settle();
  assert.equal(documentElement.lang, 'en');
  assert.equal(documentStub.title, enPageTitle, 'the <title> /en/ serves is the one the script sets for English');
  assert.equal(elements.get('ogTitle').content, I18N.en.meta.title);
  assert.equal(elements.get('ogDescription').content, I18N.en.meta.description);
  assert.equal(elements.get('twTitle').content, I18N.en.meta.title);
  assert.ok(elements.get('introTitle').textContent.length > 0);
  assert.equal(langCodeEl.textContent, 'EN');
  assert.equal(langToggleEl.getAttribute('aria-label'), 'EN — change language');
  assert.equal(themeToggleEl.getAttribute('aria-label'), 'Change colour theme');
  assert.deepEqual(themeOptions.map(b => b.textContent), ['Light', 'Dark', 'Auto', 'High contrast']);
  assert.deepEqual(titles().slice(0, 2), ['You opened your laptop', 'The operating system started']);
  assert.ok(/an address is visible: 10\.0\.0\.2/.test(stepText(6)));
  await app.render('uz');
  await settle();
  assert.equal(documentElement.lang, 'uz');
  assert.equal(langCodeEl.textContent, 'UZ');
  assert.equal(langToggleEl.getAttribute('aria-label'), 'UZ — tilni oʻzgartirish');
  assert.deepEqual(themeOptions.map(b => b.textContent), ['Yorugʻ', 'Qorongʻi', 'Avto', 'Yuqori kontrast']);
  assert.equal(titles()[0], 'Siz noutbukni ochdingiz');

  // /en/ opens in English over a saved Russian choice; a language picked there moves the
  // address back to / (and English to /en/), so a shared link previews in that language.
  {
    const realLocation = windowStub.location;
    const replaced = [];
    windowStub.history = { replaceState: (_, __, url) => replaced.push(url) };
    const savedLang = localStore.get('fp_lang');
    localStore.set('fp_lang', 'ru');
    windowStub.location = { origin: 'https://fprint.morgunov.tech', pathname: '/en/', search: '', hash: '' };
    assert.equal(app.detectLang(), 'en');
    app.syncLangPath('ru');
    windowStub.location = { origin: 'https://fprint.morgunov.tech', pathname: '/', search: '?x=1', hash: '' };
    assert.equal(app.detectLang(), 'ru');
    app.syncLangPath('en');
    app.syncLangPath('ru');
    windowStub.location = realLocation;
    app.syncLangPath('en');
    assert.deepEqual(replaced, ['/', '/en/?x=1'], 'the address changes only between / and /en/');
    windowStub.history = { replaceState: () => {} };
    if (savedLang === undefined) localStore.delete('fp_lang'); else localStore.set('fp_lang', savedLang);
  }

  // The network check from the button at step 3, in Russian: steps 3, 5 and 6 and the sum fill in.
  await app.render('ru');
  await settle();
  workerWhoami = WHOAMI;
  workerScan = { resolved_ip: '198.51.100.2', geolocation: { isp: 'Uzbektelekom JSC', asn: 'AS8193', connection_type: 'mobile' }, reputation: { blacklisted: false, blacklists_checked: 4, blacklist_hits: [] } };
  state.serverData = null;
  state.whoamiData = null;
  // The button's click is delegated through #walk, which the stub DOM does not bubble; call the handler.
  assert.ok(stepEl(3).querySelector('[data-action="check-network"]'));
  const checking = app.handleNetworkCheck();
  await waitFor(() => state.networkStatus === 'done', 'the network check');
  await checking;
  await settle();
  assert.ok(state.serverData && state.serverData.details.region === 'Tashkent');
  const s3 = stepText(3);
  assert.ok(/198\.51\.100\.2/.test(s3) && /Uzbektelekom JSC/.test(s3) && /Ташкент/.test(s3) && /мобильная сеть/.test(s3), s3);
  assert.equal(stepEl(3).querySelector('.step-title').textContent, 'Вы вышли в сеть через мобильного оператора', 'a mobile connection changes the wording');
  assert.ok(/совпадает с устройством/.test(s3) || /по IP Asia\/Tashkent/.test(s3));
  assert.equal(stepEl(3).querySelector('[data-action="check-network"]').textContent, I18N.ru.steps.s3.check.recheck);
  const s5 = stepText(5);
  assert.ok(/TLSv1\.3 \/ AEAD-AES128-GCM-SHA256/.test(s5) && /HTTP\/2/.test(s5) && /TAS/.test(s5), s5);
  assert.ok(/Uzbektelekom JSC/.test(textOf(stepEl(5).querySelector('.step-who'))), 'the DNS party names the provider');
  const s6 = stepText(6);
  assert.ok(/ru-RU,ru;q=0\.9/.test(s6) && /macOS, Chromium/.test(s6) && /Заголовков в запросе 3/.test(s6), s6);
  const sum = textOf(summaryEl());
  assert.ok(/Uzbektelekom JSC: ваш IP-адрес/.test(sum) && /DNS-сервер \(Uzbektelekom JSC\)/.test(sum) && /Apple: устройство/.test(sum), sum);
  assert.ok(state.sharePayload.text.includes('Uzbektelekom JSC'));
  const detailsText = textOf(elements.get('detailsBody')).replace(/<[^>]+>/g, ' ');
  assert.ok(/AS8193/.test(detailsText) && /0123456789abcdef/.test(detailsText) && /SHA-256/.test(detailsText), 'the details hold the raw data');
  assert.ok(!/undefined|\[object Object\]|NaN/.test(textOf(walkEl)), 'no placeholders in the walk');

  // A language switch after the check keeps every section filled.
  await app.render('en');
  await settle();
  assert.ok(/Uzbektelekom JSC/.test(stepText(3)) && /mobile network/.test(stepText(3)));
  assert.ok(/TLSv1\.3/.test(stepText(5)));
  assert.ok(!fetchLog.some(entry => entry.url.includes('workers.dev')));

  console.log('Self-test completed successfully');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
