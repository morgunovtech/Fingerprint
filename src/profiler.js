/* eslint-disable no-console */
const MAC_DISPLAY_MAP = [
  { width: 3456, height: 2234, label: 'Apple MacBook Pro 16″' },
  { width: 3024, height: 1964, label: 'Apple MacBook Pro 14″' },
  { width: 2560, height: 1664, label: 'Apple MacBook Air 13″' },
  { width: 2732, height: 2048, label: 'Apple iPad Pro 12.9″' },
];

const FONT_CANDIDATES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Roboto',
  'Open Sans',
  'SF Pro Text',
  'Segoe UI',
  'Noto Sans',
];

const CLAMP = (value, min = 0, max = 1) => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

function detectGlRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const value = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return typeof value === 'string' ? value : null;
    }
    return null;
  } catch (error) {
    console.debug('GL renderer detection failed', error);
    return null;
  }
}

function collectDeviceSignals(ua) {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const doc = typeof document === 'undefined' ? undefined : document;
  const win = typeof window === 'undefined' ? undefined : window;
  const viewportWidth = doc?.documentElement?.clientWidth ?? win?.innerWidth ?? 0;
  const screenWidth = win?.screen?.width ?? viewportWidth;
  const screenHeight = win?.screen?.height ?? (win?.screen?.width ?? viewportWidth);
  const dpr = Number(win?.devicePixelRatio ?? 1) || 1;
  return {
    mobileFlag: ua?.mobile ?? nav?.userAgentData?.mobile ?? null,
    maxTouchPoints: nav?.maxTouchPoints ?? 0,
    viewportWidth,
    screenWidth,
    screenHeight,
    devicePixelRatio: dpr,
    hardwareConcurrency: nav?.hardwareConcurrency ?? null,
    deviceMemory: (nav && 'deviceMemory' in nav)
      ? Number(nav.deviceMemory ?? 0) || null
      : null,
    hasExternalScreen: (win && 'screen' in win && typeof win.screen?.availWidth === 'number')
      ? win.screen.availWidth > win.screen.width
      : undefined,
  };
}

function classifyDevice(signals) {
  const evidence = [];
  const { mobileFlag, maxTouchPoints, viewportWidth, screenWidth, devicePixelRatio, hardwareConcurrency, deviceMemory, hasExternalScreen } = signals;
  if (typeof mobileFlag === 'boolean') evidence.push(`ua.mobile=${mobileFlag}`);
  evidence.push(`touchPoints=${maxTouchPoints}`);
  evidence.push(`viewport=${viewportWidth}`);
  evidence.push(`screen=${screenWidth}`);
  evidence.push(`dpr=${devicePixelRatio}`);
  if (hardwareConcurrency != null) evidence.push(`cores=${hardwareConcurrency}`);
  if (deviceMemory != null) evidence.push(`memory=${deviceMemory}GB`);
  if (hasExternalScreen != null) evidence.push(`externalScreen=${hasExternalScreen}`);

  let value = 'desktop';
  let confidence = 0.5;
  if (mobileFlag) {
    value = 'mobile';
    confidence = 0.9;
  } else if (maxTouchPoints > 1 && viewportWidth < 800) {
    value = 'mobile';
    confidence = 0.8;
  } else if (viewportWidth < 1280 && maxTouchPoints <= 1 && !hasExternalScreen) {
    value = 'laptop';
    confidence = 0.7;
  } else if (hasExternalScreen || viewportWidth >= 1440 || screenWidth >= 1920) {
    value = 'desktop';
    confidence = 0.8;
  }

  return {
    key: 'device.class',
    label: 'Device class',
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: 'rule',
    limitations: 'Battery and charging status are ignored because many browsers reduce or fake those signals.',
  };
}

function inferModel({ ua, renderer, physicalWidth, physicalHeight }) {
  const evidence = [];
  const matches = [];
  let confidence = 0.2;

  if (ua?.model) {
    evidence.push(`ua.model=${ua.model}`);
    matches.push(ua.model);
    confidence = Math.max(confidence, 0.6);
  }

  if (renderer) {
    evidence.push(`webgl=${renderer}`);
    if (/Apple M\d/.test(renderer)) {
      matches.push('Apple Silicon GPU');
      confidence = Math.max(confidence, 0.5);
    }
  }

  const displayMatch = MAC_DISPLAY_MAP.find((entry) => {
    const deltaW = Math.abs(entry.width - physicalWidth);
    const deltaH = Math.abs(entry.height - physicalHeight);
    return deltaW <= 32 && deltaH <= 32;
  });
  if (displayMatch) {
    matches.push(displayMatch.label);
    confidence = Math.max(confidence, 0.7);
  }

  if (!matches.length) {
    if (!evidence.length) evidence.push('No high-entropy UA hints exposed');
    return null;
  }

  const value = `${matches[0]}${matches.length > 1 ? ' (approximate)' : ''}`;
  return {
    key: 'device.model',
    label: 'Device model (approximate)',
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: 'ua-ch',
    limitations: 'Manufacturers can mask the exact model; private browsing modes often blank these hints.',
  };
}

function inferOS({ ua, userAgent }) {
  const evidence = [];
  let value = 'Unknown OS';
  let confidence = 0.3;
  let method = 'rule';

  if (ua?.platform) {
    evidence.push(`platform=${ua.platform}`);
    const versionLabel = ua.platformVersion ? `${ua.platform} ${ua.platformVersion}` : ua.platform;
    value = versionLabel;
    confidence = Math.max(confidence, 0.6);
    if (ua.architecture) {
      value += ` (${ua.architecture}`;
      if (ua.bitness) value += `, ${ua.bitness}-bit`;
      value += ')';
    }
    method = 'ua-ch';
  } else if (userAgent) {
    evidence.push(`ua=${userAgent}`);
    if (/Windows NT 10/.test(userAgent)) {
      value = 'Windows 10/11 (userAgent)';
    } else if (/Mac OS X 1[4-9]/.test(userAgent)) {
      value = 'macOS (userAgent reduced)';
    } else if (/Android/.test(userAgent)) {
      value = 'Android (userAgent)';
    }
  }

  return {
    key: 'os.platform',
    label: 'Operating system',
    value,
    confidence: CLAMP(confidence),
    evidence,
    method,
    limitations: 'Browsers may reduce OS version precision for privacy, so treat this as an estimate.',
  };
}

function inferBrowser({ ua, brands }) {
  const evidence = [];
  let value = 'Unknown browser';
  let confidence = 0.3;
  let method = ua ? 'ua-ch' : 'rule';

  if (brands && brands.length) {
    evidence.push(`brands=${brands.map((b) => `${b.brand} ${b.version}`).join(', ')}`);
    const primary = brands.find((b) => /Chrome|Chromium|Firefox|Safari|Edg/i.test(b.brand)) ?? brands[0];
    const engine = brands.some((b) => /Chrom/i.test(b.brand)) ? 'Chromium'
      : brands.some((b) => /Firefox|Gecko/i.test(b.brand)) ? 'Gecko'
        : 'WebKit';
    const version = primary?.version ? primary.version.split('.')[0] : 'unknown';
    value = `${engine} • ${primary?.brand ?? 'Unknown'} ${version}`;
    confidence = Math.max(confidence, 0.6);
  }

  let arcEvidence = false;
  if (typeof document !== 'undefined') {
    const arcVar = getComputedStyle(document.documentElement).getPropertyValue('--arc-palette-background');
    if (arcVar) {
      evidence.push('cssVar=--arc-palette-background');
      arcEvidence = true;
    }
  }
  if (arcEvidence) {
    value += ' + Arc (heuristic)';
    confidence = Math.min(0.4, confidence);
  }

  if (!evidence.length && typeof navigator !== 'undefined') {
    evidence.push(`ua=${navigator.userAgent}`);
  }

  return {
    key: 'browser.engine',
    label: 'Browser & engine',
    value,
    confidence: CLAMP(confidence),
    evidence,
    method,
    limitations: 'Chromium forks often reuse Chrome branding, so sites may treat them as Google Chrome.',
  };
}

function summariseNetwork(samples) {
  if (!samples.length) {
    return { samples, meanMbps: null, ciLow: null, ciHigh: null, latencyMs: null };
  }
  const mean = samples.reduce((sum, s) => sum + s.mbps, 0) / samples.length;
  let ciLow = null;
  let ciHigh = null;
  if (samples.length > 1) {
    const variance = samples.reduce((sum, s) => sum + (s.mbps - mean) ** 2, 0) / (samples.length - 1);
    const std = Math.sqrt(Math.max(variance, 0));
    const margin = 1.96 * (std / Math.sqrt(samples.length));
    ciLow = Math.max(mean - margin, 0);
    ciHigh = Math.max(mean + margin, 0);
  }
  const latencyMs = samples.reduce((sum, s) => sum + s.latency, 0) / samples.length;
  return {
    samples,
    meanMbps: mean,
    ciLow,
    ciHigh,
    latencyMs,
  };
}

async function measureNetwork(probeUrl) {
  if (typeof fetch === 'undefined' || typeof performance === 'undefined') {
    return null;
  }
  const target = probeUrl || (typeof location !== 'undefined' ? new URL('share-card.svg', location.href).toString() : null);
  if (!target) return null;
  const samples = [];
  const attempts = 3;
  for (let i = 0; i < attempts; i += 1) {
    const url = `${target}${target.includes('?') ? '&' : '?'}cacheBust=${Math.random().toString(36).slice(2)}`;
    const start = performance.now();
    try {
      const response = await fetch(url, { cache: 'no-store', mode: 'cors' });
      const clone = response.clone();
      const buffer = await clone.arrayBuffer();
      const end = performance.now();
      const entry = performance.getEntriesByName(url).pop();
      const latency = entry ? Math.max(entry.responseStart - entry.startTime, 0) : end - start;
      const durationSeconds = Math.max((end - start) / 1000, 0.001);
      const mbps = (buffer.byteLength * 8) / (durationSeconds * 1_000_000);
      samples.push({ mbps, latency });
    } catch (error) {
      console.debug('Network probe failed', error);
    }
  }
  if (!samples.length) return null;
  return summariseNetwork(samples);
}

function buildNetworkFinding(signals) {
  const evidence = [];
  const parts = [];
  let confidence = 0.3;
  let method = 'observation';

  if (signals.connectionType) {
    evidence.push(`connection.effectiveType=${signals.connectionType}`);
    parts.push(signals.connectionType);
    confidence = Math.max(confidence, 0.4);
  }
  if (signals.downlink) {
    evidence.push(`connection.downlink=${signals.downlink}`);
  }
  if (signals.rtt) {
    evidence.push(`connection.rtt=${signals.rtt}`);
  }
  if (signals.measurement) {
    method = 'measurement';
    const { meanMbps, ciLow, ciHigh, latencyMs } = signals.measurement;
    if (meanMbps != null) {
      parts.push(`${meanMbps.toFixed(1)} Mbps`);
      confidence = Math.max(confidence, 0.6);
    }
    if (ciLow != null && ciHigh != null) {
      parts.push(`CI ${ciLow.toFixed(1)}–${ciHigh.toFixed(1)} Mbps`);
    }
    if (latencyMs != null) {
      parts.push(`latency ≈ ${latencyMs.toFixed(0)} ms`);
    }
  }

  if (!parts.length) return null;

  return {
    key: 'network.profile',
    label: 'Network type & speed',
    value: parts.join(' • '),
    confidence: CLAMP(confidence),
    evidence,
    method,
    limitations: 'Short probes fluctuate; mobile networks especially vary over time.',
  };
}

function probVPN({ tzDiff, asnDC, highRTT, desktopLike }) {
  const score = -1.2
    + 1.2 * (tzDiff ? 1 : 0)
    + 1.0 * (asnDC ? 1 : 0)
    + 0.6 * (highRTT ? 1 : 0)
    + 0.4 * (desktopLike ? 1 : 0);
  return 1 / (1 + Math.exp(-score));
}

function buildVpnFinding(probability, evidence) {
  const value = probability >= 0.65 ? 'VPN/proxy likely' : probability <= 0.35 ? 'VPN/proxy unlikely' : 'VPN status unclear';
  return {
    key: 'vpn.probability',
    label: 'VPN or proxy detection',
    value,
    confidence: CLAMP(probability),
    evidence,
    method: 'inference',
    limitations: 'Roaming users or corporate networks can trigger false positives, while stealth VPNs may evade detection.',
  };
}

function buildLocationFinding(timeZone, languages, ip) {
  const evidence = [];
  if (timeZone) evidence.push(`timeZone=${timeZone}`);
  if (languages.length) evidence.push(`languages=${languages.join(',')}`);
  if (ip?.country) evidence.push(`ip.country=${ip.country}`);
  if (ip?.region) evidence.push(`ip.region=${ip.region}`);

  let value = 'Region unclear';
  let confidence = 0.3;
  if (ip?.country && timeZone && timeZone.toLowerCase().includes(ip.country.toLowerCase())) {
    value = `${ip.country} (local & IP agree)`;
    confidence = 0.7;
  } else if (ip?.country && timeZone) {
    value = `${timeZone} locally • IP says ${ip.country}`;
    confidence = 0.5;
  } else if (timeZone) {
    value = `Local time zone ${timeZone}`;
    confidence = 0.4;
  } else if (ip?.country) {
    value = `IP country ${ip.country}`;
    confidence = 0.4;
  }

  return {
    key: 'location.region',
    label: 'Likely region',
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: 'inference',
    limitations: 'Time zones and IP exits can differ when travelling or using VPNs; city-level accuracy is intentionally avoided.',
  };
}

function inferWorkspace(signals) {
  const evidence = [];
  if (signals.hasExternalScreen != null) evidence.push(`externalScreen=${signals.hasExternalScreen}`);
  evidence.push(`viewport=${signals.viewportWidth}`);
  if (signals.connectionType) evidence.push(`connection=${signals.connectionType}`);

  let value = 'Environment unclear (hypothesis)';
  let confidence = 0.2;
  if (signals.hasExternalScreen) {
    value = 'Likely office/home setup (hypothesis)';
    confidence = 0.5;
  } else if (signals.connectionType && signals.connectionType.includes('cellular') && signals.viewportWidth < 900) {
    value = 'Portable / public network (hypothesis)';
    confidence = 0.4;
  }

  return {
    key: 'workspace.context',
    label: 'Workspace context',
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: 'inference',
    limitations: 'Detailed workspace detection needs user-granted screen or device permissions; without them we only provide hypotheses.',
  };
}

function buildPeripheralsFinding() {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const evidence = [];
  if (nav) {
    evidence.push(`usb=${'usb' in nav}`);
    evidence.push(`hid=${'hid' in nav}`);
    evidence.push(`bluetooth=${'bluetooth' in nav}`);
    evidence.push(`serial=${'serial' in nav}`);
  }
  const parts = [];
  if (nav?.usb) parts.push('WebUSB');
  if (nav?.hid) parts.push('WebHID');
  if (nav?.bluetooth) parts.push('WebBluetooth');
  if (nav?.serial) parts.push('Serial');
  const value = parts.length ? `Capabilities: ${parts.join(', ')}` : 'No special peripheral APIs exposed';
  return {
    key: 'device.peripherals',
    label: 'Screens & peripherals',
    value,
    confidence: parts.length ? 0.5 : 0.3,
    evidence,
    method: 'observation',
    limitations: 'APIs may exist but still require permission; we never request access without a user gesture.',
  };
}

async function buildStorageFinding() {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    const evidence = [];
    if (typeof usage === 'number') evidence.push(`usage=${usage}`);
    if (typeof quota === 'number') evidence.push(`quota=${quota}`);
    let value = 'Storage information unavailable';
    if (usage != null && quota != null && quota > 0) {
      const percent = (usage / quota) * 100;
      value = `Using ${(usage / (1024 ** 2)).toFixed(1)} MB of ${(quota / (1024 ** 2)).toFixed(1)} MB (${percent.toFixed(1)}%)`;
    }
    return {
      key: 'storage.quota',
      label: 'Storage quota',
      value,
      confidence: 0.5,
      evidence,
      method: 'measurement',
      limitations: 'This reflects browser quota for this site, not your physical disk capacity.',
    };
  } catch (error) {
    console.debug('Storage estimate failed', error);
    return null;
  }
}

function collectTrackSignals(basic, deviceSignals) {
  const canvasActive = Boolean(basic?.hashes?.canvas);
  const audioActive = Boolean(basic?.hashes?.audio);
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  let colorGamut = null;
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const gamuts = ['rec2020', 'p3', 'srgb'];
      colorGamut = gamuts.find((g) => window.matchMedia(`(color-gamut: ${g})`).matches) ?? null;
    }
  } catch (error) {
    console.debug('color-gamut detection failed', error);
  }
  let hdr = false;
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      hdr = window.matchMedia('(dynamic-range: high)').matches;
    }
  } catch (error) {
    console.debug('HDR detection failed', error);
  }
  return {
    canvasActive,
    audioActive,
    hardwareConcurrency: deviceSignals.hardwareConcurrency ?? nav?.hardwareConcurrency ?? null,
    deviceMemory: deviceSignals.deviceMemory ?? ((nav && 'deviceMemory' in nav) ? Number(nav.deviceMemory ?? 0) || null : null),
    colorGamut,
    hdr,
  };
}

function buildTrackabilityFinding(signals) {
  const evidence = [];
  if (signals.canvasActive) evidence.push('canvas hash active');
  if (signals.audioActive) evidence.push('audio hash active');
  if (signals.hardwareConcurrency != null) evidence.push(`cores=${signals.hardwareConcurrency}`);
  if (signals.deviceMemory != null) evidence.push(`memory=${signals.deviceMemory}`);
  if (signals.colorGamut) evidence.push(`color-gamut=${signals.colorGamut}`);
  if (signals.hdr != null) evidence.push(`hdr=${signals.hdr}`);

  let level = 'low';
  if ((signals.canvasActive || signals.audioActive) && ((signals.hardwareConcurrency ?? 0) >= 8 || (signals.deviceMemory ?? 0) >= 8)) {
    level = 'high';
  } else if (signals.canvasActive || signals.audioActive) {
    level = 'medium';
  }
  let value = 'Trackability low';
  if (level === 'high') value = 'High trackability without cookies';
  else if (level === 'medium') value = 'Medium trackability without cookies';

  return {
    key: 'fingerprint.trackability',
    label: 'Trackability without cookies',
    value,
    confidence: level === 'high' ? 0.8 : level === 'medium' ? 0.6 : 0.4,
    evidence,
    method: 'inference',
    limitations: 'Fingerprinting is probabilistic; privacy modes or anti-fingerprinting tools can change these signals quickly.',
  };
}

function detectSystemFonts() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof ctx.measureText !== 'function') return null;
    const sample = 'mmmmmmmmmmlli';
    const size = '72px';
    const baselines = new Map();
    ['monospace', 'serif', 'sans-serif'].forEach((fallback) => {
      ctx.font = `${size} ${fallback}`;
      baselines.set(fallback, ctx.measureText(sample).width);
    });
    const detected = [];
    const evidence = [];
    FONT_CANDIDATES.forEach((font) => {
      const matched = ['monospace', 'serif', 'sans-serif'].some((fallback) => {
        ctx.font = `${size} '${font}', ${fallback}`;
        const width = ctx.measureText(sample).width;
        const baseline = baselines.get(fallback) ?? width;
        return Math.abs(width - baseline) > 0.1;
      });
      if (matched) {
        detected.push(font);
        evidence.push(`${font}=present`);
      }
    });
    const value = detected.length ? `Detected fonts: ${detected.join(', ')}` : 'System fonts not observable';
    return {
      key: 'fingerprint.fonts',
      label: 'System fonts',
      value,
      confidence: detected.length ? CLAMP(0.4 + detected.length * 0.05, 0, 0.75) : 0.3,
      evidence,
      method: 'measurement',
      limitations: 'Font detection is approximate; browsers can mask or reduce this signal to limit fingerprinting.',
    };
  } catch (error) {
    console.debug('Font detection failed', error);
    return null;
  }
}

function buildCookiesFinding() {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return null;
  const evidence = [];
  const enabledFlag = typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : null;
  if (enabledFlag != null) evidence.push(`navigator.cookieEnabled=${enabledFlag}`);
  let writeSuccess = null;
  try {
    const testName = `fp_cookie_${Math.random().toString(36).slice(2)}`;
    document.cookie = `${testName}=1; path=/; SameSite=Strict`;
    writeSuccess = document.cookie.includes(`${testName}=1`);
    document.cookie = `${testName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    evidence.push(`write=${writeSuccess}`);
  } catch (error) {
    evidence.push(`writeError=${error?.message ?? 'failed'}`);
  }
  const enabled = writeSuccess ?? enabledFlag ?? false;
  const value = enabled ? 'Cookies enabled' : 'Cookies blocked or disabled';
  return {
    key: 'privacy.cookies',
    label: 'Cookies enabled',
    value,
    confidence: enabled ? 0.9 : 0.7,
    evidence,
    method: 'measurement',
    limitations: 'Third-party or cross-site cookies may still be restricted even when first-party writes succeed.',
  };
}

function checkStorageSurface(store, key, label, evidence) {
  if (!store) {
    evidence.push(`${label}=unavailable`);
    return false;
  }
  try {
    store.setItem(key, '1');
    const success = store.getItem(key) === '1';
    store.removeItem(key);
    evidence.push(`${label}=${success}`);
    return success;
  } catch (error) {
    evidence.push(`${label}=error`);
    return false;
  }
}

async function probeIndexedDb(key) {
  try {
    const idb = typeof indexedDB === 'undefined' ? undefined : indexedDB;
    if (!idb?.open) return false;
    return await new Promise((resolve) => {
      let settled = false;
      const request = idb.open(key, 1);
      request.onerror = () => {
        if (!settled) resolve(false);
        settled = true;
      };
      request.onsuccess = () => {
        try {
          request.result.close();
        } catch (error) {
          console.debug('IndexedDB close failed', error);
        }
        try {
          idb.deleteDatabase(key);
        } catch (error) {
          console.debug('IndexedDB delete failed', error);
        }
        if (!settled) resolve(true);
        settled = true;
      };
      request.onupgradeneeded = () => {};
    });
  } catch (error) {
    console.debug('IndexedDB probe failed', error);
    return false;
  }
}

async function runSupercookieProbe() {
  if (typeof window === 'undefined') return null;
  const key = `fp_sc_${Math.random().toString(36).slice(2)}`;
  const evidence = [];
  const local = checkStorageSurface(window.localStorage, key, 'localStorage', evidence);
  const session = checkStorageSurface(window.sessionStorage, key, 'sessionStorage', evidence);
  const indexed = await probeIndexedDb(key);
  evidence.push(`indexedDB=${indexed}`);
  const available = [local, session, indexed].filter(Boolean).length;
  let value = 'Supercookie surfaces blocked or unavailable';
  let confidence = 0.6;
  if (available >= 2) {
    value = 'Multiple supercookie surfaces available';
    confidence = 0.7;
  } else if (available === 1) {
    value = 'Single supercookie surface available';
    confidence = 0.65;
  }
  return {
    key: 'privacy.supercookie',
    label: 'Limited supercookie test',
    value,
    confidence,
    evidence,
    method: 'measurement',
    limitations: 'Checks only first-party storage APIs; cross-site partitioning or purging policies may differ.',
  };
}

function detectAdBlocker() {
  if (typeof document === 'undefined') return null;
  let blocked = null;
  const evidence = [];
  try {
    const bait = document.createElement('div');
    bait.className = 'ads banner ad-unit advert advertisement';
    bait.textContent = '\u00a0';
    bait.style.position = 'absolute';
    bait.style.top = '-9999px';
    bait.style.left = '-9999px';
    bait.style.width = '728px';
    bait.style.height = '90px';
    document.body.appendChild(bait);
    const win = typeof window === 'undefined' ? undefined : window;
    const computed = win?.getComputedStyle ? win.getComputedStyle(bait) : null;
    if (computed) {
      blocked = computed.display === 'none' || computed.visibility === 'hidden';
    } else if (typeof bait.offsetParent !== 'undefined') {
      blocked = bait.offsetParent === null;
    } else {
      blocked = bait.clientHeight === 0 || bait.clientWidth === 0;
    }
    document.body.removeChild(bait);
  } catch (error) {
    console.debug('Ad blocker detection failed', error);
  }
  if (blocked != null) evidence.push(`hidden=${blocked}`);
  const value = blocked == null ? 'Ad blocker status unknown' : blocked ? 'Ad blocker likely enabled' : 'Ad blocker unlikely';
  const confidence = blocked == null ? 0.3 : blocked ? 0.6 : 0.5;
  return {
    key: 'privacy.adblock',
    label: 'Ad blocker usage',
    value,
    confidence,
    evidence,
    method: 'observation',
    limitations: 'Some blockers hide their presence and some privacy browsers block only remote trackers.',
  };
}

async function runWebRtcLeakTest() {
  if (typeof window === 'undefined') return null;
  const RTCPeer = window?.RTCPeerConnection;
  if (!RTCPeer) return null;
  let pc = null;
  const candidates = new Set();
  try {
    pc = new RTCPeer({ iceServers: [] });
    if (pc.createDataChannel) {
      try {
        pc.createDataChannel('probe');
      } catch (error) {
        console.debug('RTC data channel failed', error);
      }
    }
    const gatherPromise = new Promise((resolve) => {
      let resolved = false;
      const finish = () => {
        if (!resolved) {
          resolved = true;
          resolve(candidates);
        }
      };
      const timer = setTimeout(finish, 1500);
      const handleCandidate = (event) => {
        if (event?.candidate && event.candidate.candidate) {
          candidates.add(event.candidate.candidate);
        } else {
          clearTimeout(timer);
          finish();
        }
      };
      if (pc) {
        if (typeof pc.addEventListener === 'function') {
          pc.addEventListener('icecandidate', handleCandidate);
        } else {
          pc.onicecandidate = handleCandidate;
        }
      }
    });
    const offer = await pc.createOffer({ offerToReceiveAudio: false, offerToReceiveVideo: false });
    await pc.setLocalDescription(offer);
    await gatherPromise;
  } catch (error) {
    console.debug('WebRTC leak probe failed', error);
  } finally {
    try {
      if (pc?.close) pc.close();
    } catch (error) {
      console.debug('WebRTC close failed', error);
    }
  }
  const ips = new Set();
  const types = new Set();
  candidates.forEach((candidate) => {
    const parts = candidate.split(' ');
    if (parts.length > 4) {
      ips.add(parts[4]);
      const typeIndex = parts.indexOf('typ');
      if (typeIndex >= 0 && parts[typeIndex + 1]) types.add(parts[typeIndex + 1]);
    }
  });
  const evidence = [];
  evidence.push(`candidates=${candidates.size}`);
  if (types.size) evidence.push(`types=${Array.from(types).join('/')}`);
  if (ips.size) evidence.push(`ips=${Array.from(ips).join(',')}`);
  let value = 'No local WebRTC addresses observed';
  let confidence = 0.5;
  if (Array.from(types).some((type) => type === 'host' || type === 'srflx')) {
    value = 'Local/WebRTC IP exposure detected (hypothesis)';
    confidence = 0.6;
  }
  return {
    key: 'network.webrtcLeak',
    label: 'WebRTC / DNS leak test',
    value,
    confidence,
    evidence,
    method: 'measurement',
    limitations: 'Modern browsers restrict ICE details; this probe checks only local candidates without sending data to servers.',
  };
}

function buildGuaranteeFinding() {
  return {
    key: 'privacy.local',
    label: 'Privacy guarantee',
    value: 'All computations stay local in your browser.',
    confidence: 1,
    evidence: ['No outbound requests other than optional IP lookup passed by caller'],
    method: 'rule',
    limitations: 'Reload clears the in-memory profile. No data is uploaded unless you explicitly share it.',
  };
}

function buildPermissionFinding() {
  return {
    key: 'privacy.permissions',
    label: 'Permissions policy',
    value: 'Advanced insights need your explicit permission; otherwise we skip them.',
    confidence: 1,
    evidence: ['No calls to getScreenDetails() or enumerateDevices() without gesture'],
    method: 'rule',
    limitations: 'Granting extra permissions reveals more about your setup to sites in general, not just this page.',
  };
}

export function renderFindings(container, findings) {
  container.innerHTML = '';
  findings.forEach((finding) => {
    const item = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${finding.label}: ${finding.value}`;
    item.appendChild(title);
    const meta = document.createElement('div');
    meta.textContent = `confidence ${(finding.confidence * 100).toFixed(0)}% • method ${finding.method}`;
    meta.style.fontSize = '12px';
    item.appendChild(meta);
    if (finding.evidence.length) {
      const evidenceList = document.createElement('ul');
      finding.evidence.forEach((ev) => {
        const li = document.createElement('li');
        li.textContent = ev;
        evidenceList.appendChild(li);
      });
      item.appendChild(evidenceList);
    }
    if (finding.limitations) {
      const hint = document.createElement('em');
      hint.textContent = finding.limitations;
      item.appendChild(hint);
    }
    container.appendChild(item);
  });
}

function buildVpnFeatures(ip, probabilitySource, deviceFinding, timeZone) {
  const latency = probabilitySource.measurement?.latencyMs ?? ip?.rttMs ?? probabilitySource.rtt ?? null;
  const tz = timeZone || '';
  const ipCountry = ip?.country || '';
  const tzDiff = Boolean(tz && ipCountry && !tz.toLowerCase().includes(ipCountry.toLowerCase()));
  const asnDC = ip?.asnType === 'hosting' || ip?.asnType === 'corporate';
  const highRTT = latency != null && latency > 250;
  const desktopLike = !deviceFinding.value.includes('mobile');
  const probability = probVPN({ tzDiff, asnDC, highRTT, desktopLike });
  const evidence = [];
  evidence.push(`tzDiff=${tzDiff}`);
  evidence.push(`asnType=${ip?.asnType ?? 'unknown'}`);
  if (latency != null) evidence.push(`latencyMs=${latency}`);
  evidence.push(`desktopLike=${desktopLike}`);
  return { probability, evidence };
}

async function collectUaHighEntropy() {
  try {
    if (typeof navigator === 'undefined') return null;
    const uaData = navigator.userAgentData;
    if (!uaData?.getHighEntropyValues) {
      return uaData
        ? {
            platform: uaData.platform,
            model: null,
            architecture: undefined,
            bitness: undefined,
            platformVersion: undefined,
            fullVersionList: uaData.brands ?? null,
          }
        : null;
    }
    const values = await uaData.getHighEntropyValues([
      'architecture',
      'bitness',
      'platform',
      'platformVersion',
      'model',
      'fullVersionList',
    ]);
    return values;
  } catch (error) {
    console.debug('UA high entropy hints unavailable', error);
    return null;
  }
}

function collectLanguages() {
  if (typeof navigator === 'undefined') return [];
  if (Array.isArray(navigator.languages) && navigator.languages.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
}

function resolvedTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.debug('Time zone resolution failed', error);
    return undefined;
  }
}

function collectBasicFromGlobal() {
  const global = globalThis;
  return global.__fingerprintBasic ?? null;
}

async function collectNetworkSignals() {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const connection = nav && 'connection' in nav ? nav.connection : undefined;
  const measurement = await measureNetwork().catch(() => null);
  return {
    connectionType: connection?.effectiveType ?? null,
    downlink: connection?.downlink ?? null,
    rtt: connection?.rtt ?? null,
    measurement,
  };
}

export async function runProfiling(ip) {
  const basic = collectBasicFromGlobal();
  const ua = await collectUaHighEntropy();
  const renderer = typeof document !== 'undefined' ? detectGlRenderer() : null;
  const deviceSignals = collectDeviceSignals(ua);
  const languages = collectLanguages();
  const timeZone = resolvedTimeZone();
  const networkSignals = await collectNetworkSignals();
  const findings = [];

  const deviceFinding = classifyDevice(deviceSignals);
  findings.push(deviceFinding);

  const modelFinding = inferModel({
    ua,
    renderer,
    physicalWidth: Math.round(deviceSignals.screenWidth * deviceSignals.devicePixelRatio),
    physicalHeight: Math.round(deviceSignals.screenHeight * deviceSignals.devicePixelRatio),
  });
  if (modelFinding) findings.push(modelFinding);

  findings.push(inferOS({ ua, userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '' }));
  findings.push(inferBrowser({ ua, brands: ua?.fullVersionList ?? navigator.userAgentData?.brands }));

  const networkFinding = buildNetworkFinding(networkSignals);
  if (networkFinding) findings.push(networkFinding);

  const vpnFeatures = buildVpnFeatures(ip, networkSignals, deviceFinding, timeZone);
  findings.push(buildVpnFinding(vpnFeatures.probability, vpnFeatures.evidence));

  findings.push(buildLocationFinding(timeZone, languages, ip));
  findings.push(inferWorkspace({ ...deviceSignals, connectionType: networkSignals.connectionType }));
  findings.push(buildPeripheralsFinding());

  const storageFinding = await buildStorageFinding();
  if (storageFinding) findings.push(storageFinding);

  const trackSignals = collectTrackSignals(basic, deviceSignals);
  findings.push(buildTrackabilityFinding(trackSignals));

  const fontsFinding = detectSystemFonts();
  if (fontsFinding) findings.push(fontsFinding);

  const cookiesFinding = buildCookiesFinding();
  if (cookiesFinding) findings.push(cookiesFinding);

  const supercookieFinding = await runSupercookieProbe();
  if (supercookieFinding) findings.push(supercookieFinding);

  const adblockFinding = detectAdBlocker();
  if (adblockFinding) findings.push(adblockFinding);

  const webrtcFinding = await runWebRtcLeakTest();
  if (webrtcFinding) findings.push(webrtcFinding);

  const uaDumpEvidence = ua?.fullVersionList?.map((item) => `${item.brand} ${item.version}`)
    ?? navigator.userAgentData?.brands?.map((item) => `${item.brand} ${item.version}`)
    ?? [];
  findings.push({
    key: 'browser.uaCh',
    label: 'UA-CH transparency',
    value: uaDumpEvidence.length ? uaDumpEvidence.join(', ') : (typeof navigator !== 'undefined' ? navigator.userAgent : 'UA unavailable'),
    confidence: 0.5,
    evidence: uaDumpEvidence,
    method: uaDumpEvidence.length ? 'ua-ch' : 'observation',
    limitations: 'These are the exact hints sites can already read for compatibility or fingerprinting.',
  });

  findings.push(buildGuaranteeFinding());
  findings.push(buildPermissionFinding());

  return findings;
}

export function selfTest() {
  const vpnHigh = probVPN({ tzDiff: true, asnDC: true, highRTT: true, desktopLike: true });
  console.assert(vpnHigh > 0.8, 'VPN score should be high');
  const mobile = classifyDevice({ mobileFlag: true, maxTouchPoints: 5, viewportWidth: 390, screenWidth: 390, screenHeight: 800, devicePixelRatio: 3, hasExternalScreen: false });
  console.assert(mobile.value === 'mobile', 'Expected mobile classification');
  const os = inferOS({ ua: { platform: 'macOS', platformVersion: '15.1', architecture: 'arm', bitness: '64', model: null, fullVersionList: null }, userAgent: 'Mozilla/5.0' });
  console.assert(os.confidence >= 0.6, 'macOS confidence should be >= 0.6');
  runProfiling().then((result) => {
    console.assert(Array.isArray(result), 'runProfiling should resolve array');
    const keys = new Set(result.map((item) => item.key));
    console.assert(keys.has('privacy.cookies'), 'Cookies finding expected');
    console.assert(keys.has('privacy.supercookie'), 'Supercookie finding expected');
  }).catch((error) => {
    console.error('runProfiling self test failed', error);
  });
}

if (typeof window !== 'undefined' && window.location?.hash.includes('debug')) {
  setTimeout(() => {
    try {
      selfTest();
    } catch (error) {
      console.error('Profiler selfTest error', error);
    }
  }, 0);
}
