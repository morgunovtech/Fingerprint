const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { performance } = require('node:perf_hooks');
const { webcrypto } = require('node:crypto');

function assertNoMergeMarkers(text, label) {
  const patterns = [
    /^<<<<<<< /m,
    /^=======$/m,
    /^>>>>>>> /m
  ];
  patterns.forEach(pattern => {
    if (pattern.test(text)) {
      throw new Error(`Merge conflict marker ${pattern.source} found in ${label}`);
    }
  });
}

// The site Pages serves lives in site/ (wrangler.toml → pages_build_output_dir).
const html = fs.readFileSync(path.join(__dirname, 'site', 'index.html'), 'utf8');
assertNoMergeMarkers(html, 'site/index.html');
const match = html.match(/<script>([\s\S]*)<\/script>/);
if (!match) {
  throw new Error('Failed to extract inline script');
}
const script = match[1];
assertNoMergeMarkers(script, 'inline script');

class Element {
  constructor(id = null, tagName = 'div') {
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
    this.classList = {
      _set: new Set(),
      add: (...cls) => cls.forEach(c => this.classList._set.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList._set.delete(c)),
      contains: c => this.classList._set.has(c),
      toggle: (cls, force) => {
        if (force === undefined) {
          if (this.classList._set.has(cls)) {
            this.classList._set.delete(cls);
            return false;
          }
          this.classList._set.add(cls);
          return true;
        }
        if (force) {
          this.classList._set.add(cls);
          return true;
        }
        this.classList._set.delete(cls);
        return false;
      }
    };
    this.disabled = false;
    this.value = '';
    this.hidden = false;
  }
  set textContent(value) {
    this._textContent = value;
    this.children = [];
  }
  get textContent() {
    return this._textContent;
  }
  set innerHTML(value) {
    this._innerHTML = value;
    this.children = [];
  }
  get innerHTML() {
    return this._innerHTML;
  }
  appendChild(child) {
    if (!child) return child;
    if (child._isFragment) {
      child.children.forEach(node => this.appendChild(node));
      return child;
    }
    this.children.push(child);
    if (typeof child === 'object') {
      child.parentNode = this;
    }
    return child;
  }
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx >= 0) this.children.splice(idx, 1);
  }
  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }
  getAttribute(name) {
    return this.attributes[name] ?? null;
  }
  removeAttribute(name) {
    delete this.attributes[name];
  }
  addEventListener(event, cb) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(cb);
  }
  focus() {
    this._focused = true;
  }
  contains(node) {
    if (node === this) return true;
    if (!Array.isArray(this.children)) return false;
    return this.children.some(child => (typeof child === 'object' && typeof child.contains === 'function') ? child.contains(node) : child === node);
  }
  querySelectorAll(selector) {
    const results = [];
    const match = (node) => {
      if (!node || typeof node !== 'object') return;
      if (selector === 'button[data-lang]') {
        if (node.tagName === 'BUTTON' && node.dataset && Object.prototype.hasOwnProperty.call(node.dataset, 'lang')) {
          results.push(node);
        }
      }
      if (selector === 'button[data-theme]') {
        if (node.tagName === 'BUTTON' && node.dataset && Object.prototype.hasOwnProperty.call(node.dataset, 'theme')) {
          results.push(node);
        }
      }
      const dataAttr = /^\[data-([a-z-]+)="([^"]*)"\]$/.exec(selector);
      if (dataAttr) {
        const key = dataAttr[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        if (node.dataset && node.dataset[key] === dataAttr[2]) results.push(node);
      }
      if (/^\.[\w-]+$/.test(selector)) {
        const cls = selector.slice(1);
        if (node.classList._set.has(cls) || String(node.className).split(/\s+/).includes(cls)) results.push(node);
      }
      if (Array.isArray(node.children)) {
        node.children.forEach(child => match(child));
      }
    };
    match(this);
    return results;
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }
  click() {
    const event = {
      type: 'click',
      stopPropagation() {},
      preventDefault() {},
      target: this,
      currentTarget: this
    };
    (this.listeners.click || []).forEach(cb => cb(event));
  }
  get clientWidth() {
    if (this.style && typeof this.style.width === 'string') {
      const parsed = parseInt(this.style.width, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return 100;
  }
  get clientHeight() {
    if (this.style && typeof this.style.height === 'string') {
      const parsed = parseInt(this.style.height, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return 20;
  }
  get offsetParent() {
    if (this.style && (this.style.display === 'none' || this.style.visibility === 'hidden')) return null;
    return this.parentNode || null;
  }
}

class DocumentFragment {
  constructor() {
    this._isFragment = true;
    this.children = [];
  }
  appendChild(child) {
    if (!child) return child;
    this.children.push(child);
    return child;
  }
}

function extractText(node) {
  if (!node || typeof node !== 'object') return '';
  let text = '';
  if (typeof node._textContent === 'string' && node._textContent) {
    text += ` ${node._textContent}`;
  }
  if (typeof node._innerHTML === 'string' && node._innerHTML) {
    text += ` ${node._innerHTML}`;
  }
  if (Array.isArray(node.children)) {
    node.children.forEach(child => {
      text += ` ${extractText(child)}`;
    });
  }
  return text;
}

class Canvas2DContextStub {
  constructor() {
    this.fillStyle = '#000';
    this.font = '10px sans-serif';
  }
  createLinearGradient() {
    return { addColorStop: () => {} };
  }
  fillRect() {}
  fillText() {}
  rotate() {}
  measureText() {
    const parts = String(this.font || '').split(',');
    const cleaned = parts[0].replace(/['"]/g, '').trim();
    const primary = cleaned.replace(/^\d+px\s*/,'').trim() || 'sans-serif';
    const fallbackRaw = parts[parts.length - 1] || '';
    const fallback = fallbackRaw.replace(/['"]/g, '').trim() || primary;
    const base = fallback === 'monospace' ? 90 : fallback === 'serif' ? 100 : 110;
    const extra = availableFonts.has(primary) ? 15 : 0;
    return { width: base + extra };
  }
}

class WebGLContextStub {
  constructor() {
    this.VENDOR = 'vendor';
    this.RENDERER = 'renderer';
  }
  getExtension(name) {
    if (name === 'WEBGL_debug_renderer_info') {
      return {
        UNMASKED_VENDOR_WEBGL: 'UNMASKED_VENDOR_WEBGL',
        UNMASKED_RENDERER_WEBGL: 'UNMASKED_RENDERER_WEBGL'
      };
    }
    return null;
  }
  getParameter(param) {
    if (param === 'UNMASKED_VENDOR_WEBGL' || param === this.VENDOR) return 'Apple Inc.';
    if (param === 'UNMASKED_RENDERER_WEBGL' || param === this.RENDERER) return 'Apple GPU';
    return '';
  }
}

class LinkElement extends Element {
  constructor() {
    super(null, 'a');
    this.href = '';
    this.download = '';
    this.clicked = false;
  }
  click() {
    this.clicked = true;
    downloads.push({ href: this.href, download: this.download });
  }
}

class TextAreaElement extends Element {
  constructor() {
    super(null, 'textarea');
    this.value = '';
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  select() {
    this.selected = true;
  }
}

const downloads = [];
const clipboardWrites = [];
const sharePayloads = [];
const alerts = [];
let printed = false;

const availableFonts = new Set(['Arial', 'Roboto', 'Times New Roman']);

const elements = new Map();
const elementIds = [
  'langBtn','langMenu','themeBtn','themeMenu','introTitle','introText','uniqLine','uniqWarning','uniqPracticeTitle','uniqPracticeList','uniqRisksTitle','uniqRisksList','uniqAdviceTitle','uniqAdvice','uniqOutcome','shockSection','shock','shockList','ipInfo','speedResult','detailTitle','cards','methodSummary','methodText','footerText','shareBtn','printBtn','ipBtn','shockTitle','profilingSummary'
];

for (const id of elementIds) {
  elements.set(id, new Element(id));
}

const shareBtnEl = elements.get('shareBtn');
shareBtnEl.tagName = 'BUTTON';
const printBtnEl = elements.get('printBtn');
printBtnEl.tagName = 'BUTTON';
const ipBtnEl = elements.get('ipBtn');
ipBtnEl.tagName = 'BUTTON';
elements.get('langBtn').tagName = 'BUTTON';
elements.get('themeBtn').tagName = 'BUTTON';
elements.get('langMenu').tagName = 'DIV';
elements.get('themeMenu').tagName = 'DIV';
elements.get('shockSection').tagName = 'SECTION';
elements.get('uniqPracticeList').tagName = 'UL';
elements.get('uniqRisksList').tagName = 'UL';
elements.get('uniqAdvice').tagName = 'UL';
elements.get('shockList').tagName = 'UL';
elements.get('profilingSummary').tagName = 'DIV';

const langMenuEl = elements.get('langMenu');
['ru','en','uz'].forEach(code => {
  const btn = new Element(null, 'button');
  btn.dataset.lang = code;
  langMenuEl.appendChild(btn);
});
const themeMenuEl = elements.get('themeMenu');
['auto','light','dark'].forEach(mode => {
  const btn = new Element(null, 'button');
  btn.dataset.theme = mode;
  themeMenuEl.appendChild(btn);
});

const docClassTokens = new Set();
const documentElement = {
  outerHTML: html,
  lang: 'ru',
  classList: {
    add(...tokens) {
      tokens.forEach(token => docClassTokens.add(token));
    },
    remove(...tokens) {
      tokens.forEach(token => docClassTokens.delete(token));
    },
    toggle(token, force) {
      if (force === undefined) {
        if (docClassTokens.has(token)) {
          docClassTokens.delete(token);
          return false;
        }
        docClassTokens.add(token);
        return true;
      }
      if (force) {
        docClassTokens.add(token);
        return true;
      }
      docClassTokens.delete(token);
      return false;
    },
    contains(token) {
      return docClassTokens.has(token);
    }
  }
};
const bodyEl = new Element('body', 'body');
const cookieStore = new Map();

const documentStub = {
  documentElement,
  body: bodyEl,
  _domReady: null,
  addEventListener(event, cb) {
    if (event === 'DOMContentLoaded') {
      this._domReady = cb;
    }
  },
  createElement(tag) {
    const lower = String(tag).toLowerCase();
    if (lower === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext(type) {
          if (type === '2d') return new Canvas2DContextStub();
          if (type === 'webgl' || type === 'experimental-webgl') return new WebGLContextStub();
          return null;
        },
        toDataURL() { return 'data:image/png;base64,'; }
      };
    }
    if (lower === 'a') return new LinkElement();
    if (lower === 'textarea') return new TextAreaElement();
    if (lower === 'li' || lower === 'div' || lower === 'span' || lower === 'p' || lower === 'strong' || lower === 'button') {
      return new Element(null, tag);
    }
    if (lower === 'option') {
      return { value: '', textContent: '' };
    }
    return new Element(null, tag);
  },
  createTextNode(text) {
    return { nodeType: 3, textContent: text };
  },
  createDocumentFragment() {
    return new DocumentFragment();
  },
  getElementById(id) {
    if (!elements.has(id)) {
      elements.set(id, new Element(id));
    }
    return elements.get(id);
  },
  execCommand(cmd) {
    return cmd === 'copy';
  },
  removeEventListener() {},
};

documentStub.body.appendChild = function appendChild(child) {
  Element.prototype.appendChild.call(bodyEl, child);
  return child;
};

documentStub.body.removeChild = function removeChild(child) {
  bodyEl.removeChild(child);
};

documentStub.createComment = () => ({ nodeType: 8, textContent: '' });

// Records any script the page adds to <head>; it should add none (no third-party scripts).
const headScripts = [];
documentStub.head = {
  appendChild(child) {
    headScripts.push(child.src || '');
    return child;
  }
};

documentStub.createRange = () => ({ createContextualFragment: () => new DocumentFragment() });

documentStub.documentElement = documentElement;

Object.defineProperty(documentStub, 'cookie', {
  get() {
    return Array.from(cookieStore.entries()).map(([key, value]) => `${key}=${value}`).join('; ');
  },
  set(value) {
    if (!value) return;
    const [pair, ...attrs] = String(value).split(';');
    const [name, rawVal = ''] = pair.split('=');
    if (!name) return;
    const trimmedName = name.trim();
    const trimmedValue = rawVal.trim();
    const expiresAttr = attrs.find(attr => attr.trim().toLowerCase().startsWith('expires='));
    if (expiresAttr && expiresAttr.toLowerCase().includes('1970')) {
      cookieStore.delete(trimmedName);
    } else {
      cookieStore.set(trimmedName, trimmedValue);
    }
  }
});

const localStore = new Map();
const sessionStore = new Map();
const indexedDbStore = new Map();
const storageAPI = store => ({
  getItem: key => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => { store.set(key, String(value)); },
  removeItem: key => { store.delete(key); }
});

const performanceStub = {
  _now: 0,
  now() {
    this._now += 50;
    return this._now;
  },
  memory: { jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 },
  getEntriesByType: () => [],
  getEntriesByName: () => []
};

class OfflineAudioContextStub {
  constructor() {
    this.destination = {};
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createDynamicsCompressor() {
    return { connect: () => {} };
  }
  startRendering() {
    return Promise.resolve({
      getChannelData: () => new Float32Array(256).fill(0.5)
    });
  }
}

class RTCPeerConnectionStub {
  constructor() {
    this._listeners = {};
    setTimeout(() => {
      this._emit('icecandidate', { candidate: { candidate: 'candidate:0 1 udp 2113937151 10.0.0.2 5000 typ host' } });
      this._emit('icecandidate', { candidate: null });
    }, 20);
  }
  createDataChannel() {
    return {};
  }
  addEventListener(type, cb) {
    if (!this._listeners[type]) this._listeners[type] = [];
    this._listeners[type].push(cb);
  }
  set onicecandidate(cb) {
    this._listeners.icecandidate = cb ? [cb] : [];
  }
  async createOffer() {
    return {};
  }
  async setLocalDescription() {}
  close() {}
  _emit(type, event) {
    const list = this._listeners[type] || [];
    list.forEach(cb => {
      try {
        cb(event);
      } catch (error) {
        console.error('RTC listener error', error);
      }
    });
  }
}

const fetchLog = [];
// A /api/whoami body while the Worker is up; null makes the Worker unreachable.
let workerWhoami = null;
const BYTES = 2_000_000;
function makeHeaders(map) {
  const lower = {};
  Object.entries(map || {}).forEach(([key, value]) => {
    lower[key.toLowerCase()] = String(value);
  });
  return {
    get(name) {
      if (!name) return null;
      const norm = String(name).toLowerCase();
      return lower[norm] ?? null;
    }
  };
}
function makeJsonResponse(data, headers = {}) {
  const base = {
    ok: true,
    status: 200,
    headers: makeHeaders(headers),
    json: async () => data,
    arrayBuffer: async () => Buffer.from(JSON.stringify(data)),
    body: null
  };
  base.clone = () => makeJsonResponse(data, headers);
  return base;
}
function makeBinaryResponse(size = BYTES) {
  const base = {
    ok: true,
    status: 200,
    headers: makeHeaders({ 'content-length': String(size) }),
    json: async () => ({}),
    arrayBuffer: async () => Buffer.alloc(size),
    body: null
  };
  base.clone = () => makeBinaryResponse(size);
  return base;
}

async function fetchStub(url, options = {}) {
  const target = typeof url === 'string' ? url : String(url);
  fetchLog.push({ url: target, options });
  if (target.endsWith('/api/whoami')) {
    if (!workerWhoami) throw new Error('Worker unreachable');
    return makeJsonResponse(workerWhoami);
  }
  if (target.startsWith('https://ipapi.co')) {
    return makeJsonResponse({
      ip: '198.51.100.2',
      region: 'Tashkent',
      country_name: 'Uzbekistan',
      timezone: 'Asia/Tashkent',
      country_calling_code: '+998',
      org: 'Uzbektelekom Joint Stock Company'
    });
  }
  if (target.startsWith('https://api64.ipify.org')) {
    return makeJsonResponse({ ip: '198.51.100.2' });
  }
  if (target.startsWith('https://api.myip.com')) {
    return makeJsonResponse({ ip: '198.51.100.2', country: 'Uzbekistan', cc: 'UZ' });
  }
  if (target.includes('share-card.svg')) {
    return makeBinaryResponse(4096);
  }
  throw new Error(`Unexpected fetch URL: ${target}`);
}

const navigatorStub = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  platform: 'MacIntel',
  languages: ['ru-RU', 'en-US'],
  language: 'ru-RU',
  maxTouchPoints: 0,
  clipboard: {
    writeText: async text => {
      clipboardWrites.push(text);
    }
  },
  permissions: {
    query: async () => ({ state: 'prompt' })
  },
  mediaDevices: {
    enumerateDevices: async () => [
      { kind: 'audioinput', label: 'Mic' },
      { kind: 'videoinput', label: 'Camera' }
    ]
  },
  plugins: [{ name: 'Test Plugin' }],
  connection: { downlink: 85, rtt: 30, effectiveType: '4g' },
  hardwareConcurrency: 8,
  deviceMemory: 16,
  cookieEnabled: true,
  doNotTrack: '1',
  getBattery: async () => ({ level: 0.76, charging: true }),
  share: async payload => {
    sharePayloads.push(payload);
  },
  canShare: () => true,
  userAgentData: {
    brands: [{ brand: 'Safari', version: '17' }],
    mobile: false,
    platform: 'macOS',
    getHighEntropyValues: async () => ({
      architecture: 'arm',
      bitness: '64',
      model: '',
      platformVersion: '17.0.0',
      uaFullVersion: '17.0.0'
    })
  }
};

const windowStub = {
  document: documentStub,
  navigator: navigatorStub,
  localStorage: storageAPI(localStore),
  sessionStorage: storageAPI(sessionStore),
  indexedDB: {
    open(name) {
      const request = { result: null };
      setTimeout(() => {
        request.result = { close: () => {} };
        if (typeof request.onupgradeneeded === 'function') request.onupgradeneeded({ target: { result: request.result } });
        if (typeof request.onsuccess === 'function') request.onsuccess({ target: { result: request.result } });
      }, 0);
      return request;
    },
    deleteDatabase(name) {
      indexedDbStore.delete(name);
      const req = {};
      setTimeout(() => {
        if (typeof req.onsuccess === 'function') req.onsuccess({});
      }, 0);
      return req;
    }
  },
  devicePixelRatio: 2,
  screen: { width: 1512, height: 982, colorDepth: 24, isExtended: false, availLeft: 0, availTop: 0 },
  matchMedia: query => ({
    media: query,
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {}
  }),
  getComputedStyle: el => ({
    display: el.style?.display ?? 'block',
    visibility: el.style?.visibility ?? 'visible'
  }),
  location: { origin: 'https://example.com', pathname: '/fingerprint/index.html', href: 'https://example.com/fingerprint/index.html' },
  setTimeout,
  clearTimeout,
  alert: msg => alerts.push(msg),
  URL: {
    createObjectURL: () => 'blob:test',
    revokeObjectURL: () => {}
  },
  Blob: class BlobShim {
    constructor(parts, options = {}) {
      this.parts = parts;
      this.type = options.type || '';
    }
  },
  File: class FileShim {
    constructor(parts, name, options = {}) {
      this.parts = parts;
      this.name = name;
      this.type = options.type || '';
    }
  },
  fetch: fetchStub,
  OfflineAudioContext: OfflineAudioContextStub,
  RTCPeerConnection: RTCPeerConnectionStub,
  print: () => { printed = true; }
};

const sandbox = {
  console,
  window: windowStub,
  document: documentStub,
  navigator: navigatorStub,
  screen: windowStub.screen,
  localStorage: windowStub.localStorage,
  sessionStorage: windowStub.sessionStorage,
  performance: performanceStub,
  TextEncoder,
  crypto: webcrypto,
  URL: windowStub.URL,
  URLSearchParams,
  RTCPeerConnection: windowStub.RTCPeerConnection,
  Blob: windowStub.Blob,
  File: windowStub.File,
  fetch: fetchStub,
  setTimeout,
  clearTimeout,
  alert: windowStub.alert,
  OfflineAudioContext: OfflineAudioContextStub,
  AbortController
};

// The live clock ticks on an interval; unref it so the test process can exit.
const unrefInterval = (fn, ms) => {
  const id = setInterval(fn, ms);
  if (id && typeof id.unref === 'function') id.unref();
  return id;
};
sandbox.setInterval = unrefInterval;
sandbox.clearInterval = clearInterval;

sandbox.window.window = sandbox.window;
sandbox.window.setTimeout = setTimeout;
sandbox.window.clearTimeout = clearTimeout;
sandbox.window.setInterval = unrefInterval;
sandbox.window.clearInterval = clearInterval;

vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: 'index-inline.js' });
const stateRef = vm.runInContext('state', sandbox);
const invalidateSnapshot = () => vm.runInContext('snapshotCache = null; snapshotPromise = null;', sandbox);
const I18N = vm.runInContext('I18N', sandbox);

(async () => {
  const profilerModule = await import(new URL('./site/src/profiler.js', `file://${__dirname}/`).href);
  sandbox.__profilerModule = profilerModule;
  sandbox.window.__profilerModule = profilerModule;

  // Worker geolocation: ipquery.io, then ipinfo.io when it fails; HTTPS only.
  const { fetchGeolocation } = await import(new URL('./worker/src/providers/geolocation.js', `file://${__dirname}/`).href);
  const geoUrls = [];
  let ipqueryUp = true;
  const realFetch = globalThis.fetch;
  const realWarn = console.warn;
  globalThis.fetch = async url => {
    const target = String(url);
    geoUrls.push(target);
    if (target.startsWith('https://api.ipquery.io/')) {
      if (!ipqueryUp) return { ok: false, status: 503, json: async () => ({}) };
      return makeJsonResponse({
        ip: '198.51.100.2',
        isp: { asn: 'AS8193', org: 'Uzbektelekom', isp: 'Uzbektelekom' },
        location: { country: 'Uzbekistan', country_code: 'UZ', city: 'Tashkent', state: 'Tashkent', latitude: 41.3, longitude: 69.2 },
        risk: { is_mobile: true, is_vpn: false, is_tor: false, is_proxy: false, is_datacenter: false }
      });
    }
    if (target.startsWith('https://ipinfo.io/')) {
      return makeJsonResponse({ ip: '198.51.100.2', city: 'Tashkent', region: 'Tashkent', country: 'UZ', loc: '41.3,69.2', org: 'AS8193 Uzbektelekom' });
    }
    throw new Error(`Unexpected Worker fetch: ${target}`);
  };
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
    globalThis.fetch = realFetch;
    console.warn = realWarn;
  }

  assert.equal(typeof sandbox.detectPointerType, 'function');
  assert.equal(sandbox.detectPointerType(), 'none');
  assert.deepEqual(sandbox.getLanguages(), ['ru-RU', 'en-US']);
  const screenInfo = sandbox.detectScreenSetup();
  assert.equal(screenInfo.mode, 'single');

  const hash = await sandbox.sha256('test');
  assert.equal(hash.length, 64);
  assert.equal(sandbox.canonicalOsFamily('Windows 11 Pro'), 'Windows');
  assert.equal(sandbox.bucketDeviceMemory(12), '9-16');
  assert.equal(sandbox.bucketCoreCount(4), '≤4');
  assert.equal(sandbox.bucketSpeedValue({ status: 'done', mbps: 5 }), 'slow');
  assert.equal(sandbox.bucketLatencyValue({ status: 'done', latency: 45 }), 'moderate');
  assert.equal(sandbox.normalizeCallingCode(' +998 '), '+998');
  const details = sandbox.extractCanonicalDetailsFromPayload({
    region_name: 'Tashkent',
    country_name: 'Uzbekistan',
    timezone: 'Asia/Tashkent',
    country_calling_code: '+998',
    org: 'Uzbektelekom Joint Stock Company'
  });
  assert.equal(details.org, 'Uzbektelekom Joint Stock Company');
  assert.equal(sandbox.categorizeIpDetail(details), 'rich');

  // "Check network": a Worker answer is final; public IP services are only the fallback.
  const publicIpServices = /ipapi\.co|freeipapi\.com|ipify\.org|myip\.com/;
  const publicIpCalls = from => fetchLog.slice(from).map(entry => entry.url).filter(url => publicIpServices.test(url));
  workerWhoami = {
    ip: '198.51.100.2',
    geo: { country: 'UZ', region: 'Tashkent', city: 'Tashkent', timezone: 'Asia/Tashkent' },
    network: { asn: 8193, asOrganization: 'Uzbektelekom' }
  };
  let logStart = fetchLog.length;
  const fromWorker = await sandbox.fetchIpData();
  assert.equal(fromWorker.source, 'worker');
  assert.equal(fromWorker.details.region, 'Tashkent');
  assert.deepEqual(publicIpCalls(logStart), []);
  workerWhoami = null;
  stateRef.whoamiData = null;
  logStart = fetchLog.length;
  const fromFallback = await sandbox.fetchIpData();
  assert.equal(fromFallback.source, 'ipapi');
  assert.equal(fromFallback.details.country_calling_code, '+998');
  assert.ok(publicIpCalls(logStart).some(url => url.startsWith('https://ipapi.co')));
  const H = sandbox.entropyFromFeatures({
    browser: 'Safari',
    osFamily: 'macOS',
    screen: '1512x982@2',
    dpr: '2',
    langsCount: '2',
    gpuBrand: 'Apple',
    memoryBucket: '9-16',
    coresBucket: '5-8',
    hasCanvas: '1',
    hasAudio: '1',
    pluginsBucket: '1-3',
    permBucket: '1-3',
    storageBucket: 'full',
    touchBucket: 'none',
    ipDetail: 'rich',
    ipCountry: 'US',
    speedBucket: 'mid',
    latencyBucket: 'moderate'
  });
  assert.ok(H > 0);
  const pct = sandbox.percentileFromH(H);
  assert.ok(pct >= 0 && pct <= 100);
  assert.equal(sandbox.resolveShareUrl(), 'https://example.com/fingerprint');

  const svg = sandbox.createShareCardSvg({ pct: 56, headline: 'Test headline', note: 'Note', tagline: 'Tag', url: 'https://example.com' }, { share: { tagline: 'Preview tag' } });
  assert.ok(svg.includes('<svg'));

  const baseKeys = Object.keys(I18N.ru);
  for (const [lang, dict] of Object.entries(I18N)) {
    const missing = baseKeys.filter(key => !(key in dict));
    assert.deepEqual(missing, [], `Missing localization keys for ${lang}`);
  }

  if (typeof documentStub._domReady === 'function') {
    await documentStub._domReady();
  }
  invalidateSnapshot();
  const shareBtnEl = elements.get('shareBtn');
  const initialRender = sandbox.render('ru');
  assert.equal(shareBtnEl.dataset.ready, '0');
  assert.equal(shareBtnEl.getAttribute('aria-disabled'), 'true');
  await initialRender;
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(shareBtnEl.dataset.ready, '1');
  assert.equal(shareBtnEl.getAttribute('aria-disabled'), null);
  const langBtnEl = elements.get('langBtn');
  assert.ok(langBtnEl.textContent.includes('Язык'), 'langBtn should contain language label');
  const langMenuEl = elements.get('langMenu');
  assert.equal(langMenuEl.hidden, true);
  langBtnEl.click();
  assert.equal(langMenuEl.hidden, false);
  const langOptions = langMenuEl.querySelectorAll('button[data-lang]');
  assert.equal(langOptions.length, 3);
  langOptions[0].click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(langMenuEl.hidden, true);
  assert.ok(langBtnEl.textContent.includes('Язык'), 'langBtn should contain language label');
  const themeBtnEl = elements.get('themeBtn');
  assert.ok(themeBtnEl.innerHTML.includes('Тема'));
  const themeMenuEl = elements.get('themeMenu');
  assert.equal(themeMenuEl.hidden, true);
  themeBtnEl.click();
  assert.equal(themeMenuEl.hidden, false);
  const darkOption = themeMenuEl.querySelectorAll('button[data-theme]').find(btn => btn.dataset.theme === 'dark');
  assert.ok(darkOption);
  darkOption.click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(themeMenuEl.hidden, true);
  assert.ok(documentElement.classList.contains('force-dark'));
  assert.ok(themeBtnEl.innerHTML.includes('🌙'));
  vm.runInContext("applyThemePreference('light')", sandbox);
  vm.runInContext('updateThemeButton(I18N[currentLang])', sandbox);
  assert.ok(documentElement.classList.contains('force-light'));
  assert.ok(themeBtnEl.innerHTML.includes('☀️'));
  vm.runInContext("applyThemePreference('dark')", sandbox);
  vm.runInContext('updateThemeButton(I18N[currentLang])', sandbox);
  assert.ok(documentElement.classList.contains('force-dark'));
  assert.ok(!documentElement.classList.contains('force-light'));
  assert.ok(themeBtnEl.innerHTML.includes('🌙'));
  vm.runInContext("applyThemePreference('auto')", sandbox);
  vm.runInContext('updateThemeButton(I18N[currentLang])', sandbox);
  assert.ok(!documentElement.classList.contains('force-dark'));
  assert.ok(themeBtnEl.innerHTML.includes('🌓'));

  const savedSharePayload = stateRef.sharePayload;
  shareBtnEl.textContent = shareBtnEl.dataset.label;
  stateRef.sharePayload = null;
  await sandbox.handleShareClick();
  assert.equal(shareBtnEl.textContent, I18N.ru.share.unavailable);
  stateRef.sharePayload = savedSharePayload;
  shareBtnEl.textContent = shareBtnEl.dataset.label;

  const shockListEl = elements.get('shockList');
  const collectShockText = () => Array.from(shockListEl.children || [])
    .map(item => extractText(item).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  for (let i = 0; i < 200 && collectShockText().length === 0; i += 1) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  const initialShockEntries = collectShockText();
  assert.ok(initialShockEntries.length >= 1);
  assert.ok(initialShockEntries.some(text => /Устройство|Браузер/i.test(text)));
  const initialShare = stateRef.sharePayload;
  assert.ok(initialShare);
  assert.equal(elements.get('shareBtn').dataset.ready, '1');
  await sandbox.handleShareClick();
  assert.equal(sharePayloads.length, 1);
  await sandbox.handleSaveClick();
  assert.ok(printed || downloads.length > 0);
  await sandbox.render('en');
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(documentElement.lang, 'en');
  assert.ok(elements.get('introTitle').textContent.length > 0);
  assert.ok(elements.get('langBtn').textContent.includes('Language'));
  let englishShock = '';
  for (let i = 0; i < 200; i += 1) {
    englishShock = collectShockText().join(' ');
    if (/Looks like you|Detecting your location/i.test(englishShock)) break;
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.ok(/Looks like you|Detecting your location/i.test(englishShock), 'English shock should contain new-style insights');
  await sandbox.render('uz');
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(documentElement.lang, 'uz');
  assert.ok(elements.get('introTitle').textContent.length > 0);
  assert.ok(elements.get('langBtn').textContent.includes('Til'));
  let uzbekShock = '';
  for (let i = 0; i < 200; i += 1) {
    uzbekShock = collectShockText().join(' ');
    if (/Ehtimol siz|Joylashuvingiz aniqlanmoqda/i.test(uzbekShock)) break;
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.ok(/Ehtimol siz|Joylashuvingiz aniqlanmoqda/i.test(uzbekShock), 'Uzbek shock should contain new-style insights');
  await sandbox.autoFetchIp();
  await sandbox.render('ru');
  await new Promise(resolve => setTimeout(resolve, 0));
  for (let i = 0; i < 20 && !/Tashkent|\u0422\u0430\u0448\u043a\u0435\u043d\u0442/i.test(collectShockText().join(' ')); i += 1) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.ok(stateRef.serverData);
  assert.equal(stateRef.serverData.details.region, 'Tashkent');
  assert.ok(/Tashkent|\u0422\u0430\u0448\u043a\u0435\u043d\u0442|Uzbekistan|\u0423\u0437\u0431\u0435\u043a\u0438\u0441\u0442\u0430\u043d/i.test(collectShockText().join(' ')), 'exposure list should mention updated region');
  assert.ok(stateRef.sharePayload);
  assert.deepEqual(headScripts, []);

  console.log('Self-test completed successfully');
})();
