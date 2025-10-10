const fs = require('node:fs');
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

const html = fs.readFileSync('index.html', 'utf8');
assertNoMergeMarkers(html, 'index.html');
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
      contains: c => this.classList._set.has(c)
    };
    this.disabled = false;
    this.value = '';
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
  click() {
    (this.listeners.click || []).forEach(cb => cb({ type: 'click' }));
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

const elements = new Map();
const elementIds = [
  'lang','introTitle','introText','legend','uniqLine','uniqExample','uniqAdviceTitle','uniqAdvice','shock','shockList','ipInfo','speedResult','advancedPanel','detailTitle','cards','methodSummary','methodText','policySummary','policyText','footerText','shareBtn','printBtn','ipBtn','advancedBtn','shockTitle','profilingBlock','profilingTitle','profilingIntro','profilingList'
];

for (const id of elementIds) {
  elements.set(id, new Element(id));
}

const selectEl = elements.get('lang');
selectEl.tagName = 'SELECT';
selectEl.options = [
  { value: 'ru', textContent: '' },
  { value: 'en', textContent: '' },
  { value: 'uz', textContent: '' }
];
selectEl.value = 'ru';

const shareBtnEl = elements.get('shareBtn');
shareBtnEl.tagName = 'BUTTON';
const printBtnEl = elements.get('printBtn');
printBtnEl.tagName = 'BUTTON';
const ipBtnEl = elements.get('ipBtn');
ipBtnEl.tagName = 'BUTTON';
const advBtnEl = elements.get('advancedBtn');
advBtnEl.tagName = 'BUTTON';
elements.get('profilingBlock').tagName = 'SECTION';
elements.get('profilingList').tagName = 'UL';

const documentElement = { outerHTML: html, lang: 'ru' };
const bodyEl = new Element('body', 'body');

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

documentStub.createRange = () => ({ createContextualFragment: () => new DocumentFragment() });

documentStub.documentElement = documentElement;

const localStore = new Map();
const sessionStore = new Map();
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

const fetchLog = [];
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
  if (target === '/headers') {
    return makeJsonResponse({
      ip: '198.51.100.2',
      headers: {
        'CF-IPCountry': 'UZ',
        'CF-IPCity': 'Tashkent',
        'CF-Timezone': 'Asia/Tashkent',
        'CF-Connecting-IP': '198.51.100.2'
      }
    });
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
  if (target.startsWith('https://ipwho.is')) {
    return makeJsonResponse({
      success: true,
      ip: '198.51.100.2',
      city: 'Tashkent',
      country: 'Uzbekistan',
      connection: { org: 'Uzbektelekom Joint Stock Company', isp: 'Uzbektelekom' },
      timezone: { id: 'Asia/Tashkent' }
    });
  }
  if (target.startsWith('https://api64.ipify.org')) {
    return makeJsonResponse({ ip: '198.51.100.2' });
  }
  if (target.startsWith('https://api.myip.com')) {
    return makeJsonResponse({ ip: '198.51.100.2', country: 'Uzbekistan', cc: 'UZ' });
  }
  if (target.startsWith('https://speed.cloudflare.com') || target.startsWith('https://httpbin.org/bytes')) {
    return makeBinaryResponse();
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
  indexedDB: {},
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
  Blob: windowStub.Blob,
  File: windowStub.File,
  fetch: fetchStub,
  setTimeout,
  clearTimeout,
  alert: windowStub.alert,
  OfflineAudioContext: OfflineAudioContextStub,
  AbortController
};

sandbox.window.window = sandbox.window;
sandbox.window.setTimeout = setTimeout;
sandbox.window.clearTimeout = clearTimeout;

vm.createContext(sandbox);
vm.runInContext(script, sandbox, { filename: 'index-inline.js' });
const stateRef = vm.runInContext('state', sandbox);

(async () => {
  const profilerModule = await import(new URL('./src/profiler.js', `file://${__dirname}/`).href);
  sandbox.__profilerModule = profilerModule;
  sandbox.window.__profilerModule = profilerModule;
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

  if (typeof documentStub._domReady === 'function') {
    await documentStub._domReady();
  }
  await sandbox.render('ru');
  await new Promise(resolve => setTimeout(resolve, 0));
  const profilingSection = elements.get('profilingBlock');
  assert.equal(profilingSection.style.display, 'block');
  const profilingIntroEl = elements.get('profilingIntro');
  assert.ok(profilingIntroEl.children.length >= 1);
  const profilingListEl = elements.get('profilingList');
  for (let i = 0; i < 10 && profilingListEl.children.length < 3; i += 1) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.ok(profilingListEl.children.length >= 3);
  const profilingTexts = Array.from(profilingListEl.children).map(extractText);
  assert.ok(profilingTexts.some(text => text.includes('VPN')));
  const initialShare = stateRef.sharePayload;
  assert.ok(initialShare);
  assert.equal(elements.get('shareBtn').dataset.ready, '1');
  await sandbox.handleShareClick();
  assert.equal(sharePayloads.length, 1);
  await sandbox.handleSaveClick();
  assert.ok(printed || downloads.length > 0);
  await sandbox.detectIpAndSpeed();
  await sandbox.render('ru');
  await new Promise(resolve => setTimeout(resolve, 0));
  const profListAfter = elements.get('profilingList');
  for (let i = 0; i < 10 && profListAfter.children.length < 3; i += 1) {
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  assert.ok(stateRef.serverData);
  assert.equal(stateRef.serverData.details.region, 'Tashkent');
  assert.equal(stateRef.speed.status, 'done');
  assert.ok(Array.from(profListAfter.children).some(node => extractText(node).includes('Tashkent')));
  assert.ok(stateRef.sharePayload);

  console.log('Self-test completed successfully');
})();
