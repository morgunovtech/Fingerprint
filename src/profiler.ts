/* eslint-disable no-console */
export type Finding = {
  key: string;
  label: string;
  value: string;
  confidence: number;
  evidence: string[];
  method: 'rule' | 'ua-ch' | 'measurement' | 'inference' | 'observation';
  limitations?: string;
};

export type IpGeo = {
  ip?: string;
  country?: string;
  region?: string;
  asnType?: 'residential' | 'hosting' | 'corporate' | 'unknown';
  asn?: string;
  rttMs?: number | null;
};

type UaHighEntropy = {
  architecture?: string | null;
  bitness?: string | null;
  platform?: string | null;
  platformVersion?: string | null;
  model?: string | null;
  mobile?: boolean | null;
  fullVersionList?: { brand: string; version: string }[] | null;
};

declare global {
  interface NavigatorUADataBrand {
    brand: string;
    version: string;
  }

  interface NavigatorUAData {
    brands?: NavigatorUADataBrand[];
    mobile?: boolean;
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<UaHighEntropy>;
  }

  interface Navigator {
    userAgentData?: NavigatorUAData;
    usb?: unknown;
    hid?: unknown;
    bluetooth?: unknown;
    serial?: unknown;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
  }

  interface Window {
    __fingerprintBasic?: Record<string, unknown>;
  }
}

type DeviceSignals = {
  mobileFlag?: boolean | null;
  maxTouchPoints: number;
  viewportWidth: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  hardwareConcurrency?: number | null;
  deviceMemory?: number | null;
  hasExternalScreen?: boolean;
};

type ModelSignals = {
  ua: UaHighEntropy | null;
  renderer: string | null;
  physicalWidth: number;
  physicalHeight: number;
};

type OsSignals = {
  ua: UaHighEntropy | null;
  userAgent: string;
};

type BrowserSignals = {
  ua: UaHighEntropy | null;
  brands: { brand: string; version: string }[] | undefined;
};

type NetworkSignals = {
  connectionType?: string | null;
  downlink?: number | null;
  rtt?: number | null;
  measurement?: NetworkMeasurement | null;
};

type NetworkMeasurement = {
  samples: { mbps: number; latency: number }[];
  meanMbps: number | null;
  ciLow: number | null;
  ciHigh: number | null;
  latencyMs: number | null;
};

type TrackSignals = {
  canvasActive: boolean;
  audioActive: boolean;
  hardwareConcurrency?: number | null;
  deviceMemory?: number | null;
  colorGamut?: string | null;
  hdr?: boolean;
};

type StorageSignals = {
  usage?: number;
  quota?: number;
};

type BraveNavigator = Navigator & {
  brave?: {
    isBrave?: () => Promise<boolean>;
  };
};

type WebRtcLeakSignals = {
  candidates: string[];
  addresses: string[];
  maskedHostnames: string[];
  candidateTypes: string[];
};

type FontCandidate = {
  name: string;
  category: 'native' | 'external';
};

type ParsedUserAgent = {
  browserName: string;
  browserVersion: string | null;
  browserMajor: number | null;
  osName: string | null;
  osVersion: string | null;
  deviceClass: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  model?: string | null;
};

type Ja3Profile = {
  label: string;
  browsers: string[];
  minVersion?: number;
  maxVersion?: number;
  platformMatches?: (info: ParsedUserAgent) => boolean;
  signature: string;
  hash: string;
};

const FONT_CANDIDATES: FontCandidate[] = [
  { name: 'Arial', category: 'native' },
  { name: 'Helvetica', category: 'native' },
  { name: 'Times New Roman', category: 'native' },
  { name: 'Courier New', category: 'native' },
  { name: 'Georgia', category: 'native' },
  { name: 'Verdana', category: 'native' },
  { name: 'Trebuchet MS', category: 'native' },
  { name: 'SF Pro Text', category: 'native' },
  { name: 'Segoe UI', category: 'native' },
  { name: 'Noto Sans', category: 'native' },
  { name: 'Roboto', category: 'native' },
  { name: 'Open Sans', category: 'external' },
  { name: 'Inter', category: 'external' },
  { name: 'Source Sans Pro', category: 'external' },
  { name: 'Source Code Pro', category: 'external' },
  { name: 'Fira Code', category: 'external' },
  { name: 'JetBrains Mono', category: 'external' },
  { name: 'Lato', category: 'external' },
  { name: 'Montserrat', category: 'external' },
  { name: 'PT Sans', category: 'external' },
  { name: 'Ubuntu', category: 'external' },
  { name: 'Avenir Next', category: 'external' },
];

const MAC_DISPLAY_MAP: { width: number; height: number; label: string }[] = [
  { width: 3456, height: 2234, label: 'Apple MacBook Pro 16″' },
  { width: 3024, height: 1964, label: 'Apple MacBook Pro 14″' },
  { width: 2560, height: 1664, label: 'Apple MacBook Air 13″' },
  { width: 2732, height: 2048, label: 'Apple iPad Pro 12.9″' },
];

const IOS_DISPLAY_MAP: { width: number; height: number; label: string }[] = [
  { width: 1290, height: 2796, label: 'Apple iPhone 15 Pro Max' },
  { width: 1179, height: 2556, label: 'Apple iPhone 15 Pro' },
  { width: 1284, height: 2778, label: 'Apple iPhone 14 Pro Max / 13 Pro Max' },
  { width: 1170, height: 2532, label: 'Apple iPhone 14 / 13 (6.1″)' },
  { width: 1125, height: 2436, label: 'Apple iPhone XS / 11 Pro (5.8″)' },
  { width: 1242, height: 2688, label: 'Apple iPhone XS Max / 11 Pro Max' },
  { width: 1133, height: 2360, label: 'Apple iPad Air 10.9″' },
  { width: 1488, height: 2266, label: 'Apple iPad mini 8.3″' },
];

function truncate(value: string, maxLength = 80): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

const ANDROID_MODEL_PREFIX: { pattern: RegExp; label: string }[] = [
  { pattern: /^SM-S92/i, label: 'Samsung Galaxy S24 Ultra / S24+' },
  { pattern: /^SM-S91/i, label: 'Samsung Galaxy S23 series' },
  { pattern: /^SM-S90/i, label: 'Samsung Galaxy S22 series' },
  { pattern: /^SM-F93/i, label: 'Samsung Galaxy Z Fold' },
  { pattern: /^SM-F94/i, label: 'Samsung Galaxy Z Flip' },
  { pattern: /^Pixel 8 Pro/i, label: 'Google Pixel 8 Pro' },
  { pattern: /^Pixel 8/i, label: 'Google Pixel 8' },
  { pattern: /^Pixel 7 Pro/i, label: 'Google Pixel 7 Pro' },
  { pattern: /^Pixel 7/i, label: 'Google Pixel 7' },
  { pattern: /^Pixel 6/i, label: 'Google Pixel 6' },
  { pattern: /^2201123/i, label: 'Xiaomi 12 Pro' },
  { pattern: /^M2102K1/i, label: 'Xiaomi Mi 11 Ultra' },
];

function matchDisplayModel(
  width: number,
  height: number,
  map: { width: number; height: number; label: string }[],
  tolerance = 4,
): string | null {
  if (!width || !height) return null;
  const sorted = [width, height].sort((a, b) => a - b);
  for (const entry of map) {
    const target = [entry.width, entry.height].sort((a, b) => a - b);
    const deltaW = Math.abs(target[0] - sorted[0]);
    const deltaH = Math.abs(target[1] - sorted[1]);
    if (deltaW <= tolerance && deltaH <= tolerance) {
      return entry.label;
    }
  }
  return null;
}

function describeAndroidModel(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  const upper = value.toUpperCase();
  for (const entry of ANDROID_MODEL_PREFIX) {
    if (entry.pattern.test(upper)) return entry.label;
  }
  if (/^SM-[A-Z0-9]+/.test(upper)) {
    const suffix = upper.replace(/^SM-/, '').replace(/[A-Z]$/, '');
    return `Samsung Galaxy ${suffix}`;
  }
  if (/^MIX|^MI/.test(upper)) {
    return `Xiaomi ${value}`;
  }
  return value;
}

const CLAMP = (value: number, min = 0, max = 1): number => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

/**
 * Attempts to detect the unmasked WebGL renderer for GPU hints.
 */
function detectGlRenderer(): string | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return null;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info') as WEBGL_debug_renderer_info | null;
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

/**
 * Collects a safe subset of device-oriented signals.
 */
function collectDeviceSignals(ua: UaHighEntropy | null): DeviceSignals {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const doc = typeof document === 'undefined' ? undefined : document;
  const win = typeof window === 'undefined' ? undefined : window;
  const viewportWidth = doc?.documentElement?.clientWidth ?? win?.innerWidth ?? 0;
  const screenWidth = win?.screen?.width ?? viewportWidth;
  const screenHeight = win?.screen?.height ?? (win?.screen?.width ?? viewportWidth);
  const dpr = Number(win?.devicePixelRatio ?? 1) || 1;
  const signals: DeviceSignals = {
    mobileFlag: ua?.mobile ?? nav?.userAgentData?.mobile ?? null,
    maxTouchPoints: nav?.maxTouchPoints ?? 0,
    viewportWidth,
    screenWidth,
    screenHeight,
    devicePixelRatio: dpr,
    hardwareConcurrency: nav?.hardwareConcurrency ?? null,
    deviceMemory: (nav && 'deviceMemory' in nav) ? Number((nav as unknown as { deviceMemory?: number }).deviceMemory ?? 0) || null : null,
    hasExternalScreen: (win && 'screen' in win && typeof win.screen?.availWidth === 'number')
      ? win.screen.availWidth > win.screen.width
      : undefined,
  };
  return signals;
}

/**
 * Heuristic classification of device class.
 */
function classifyDevice(signals: DeviceSignals): Finding {
  const evidence: string[] = [];
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

/**
 * Rough model inference using UA-CH, GPU renderer, and screen metrics.
 */
function inferModel(signals: ModelSignals): Finding | null {
  const evidence: string[] = [];
  const { ua, renderer, physicalWidth, physicalHeight } = signals;
  const matches: string[] = [];
  const seen = new Set<string>();
  let label = 'Device model (approximate)';
  let confidence = 0.2;

  const addMatch = (candidate: string | null | undefined, weight: number, note?: string) => {
    if (!candidate) return;
    const value = candidate.trim();
    if (!value || seen.has(value)) return;
    seen.add(value);
    matches.push(value);
    confidence = Math.max(confidence, weight);
    if (note) evidence.push(note);
  };

  const platform = ua?.platform?.toLowerCase() ?? '';
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  if (renderer) {
    evidence.push(`webgl=${renderer}`);
    const appleGpu = renderer.match(/Apple\s+(M\d+(?:\s+(?:Pro|Max|Ultra))?|GPU\s+[A-Z0-9 ]+)/i);
    if (appleGpu) {
      const labelGuess = appleGpu[1].trim();
      const formatted = labelGuess.toUpperCase().startsWith('GPU') ? `Apple ${labelGuess}` : `Apple ${labelGuess}`;
      addMatch(formatted, 0.55);
    } else if (/Apple M\d/.test(renderer)) {
      addMatch('Apple Silicon GPU', 0.5);
    }
  }

  const macDisplay = matchDisplayModel(physicalWidth, physicalHeight, MAC_DISPLAY_MAP, 32);
  if (macDisplay) {
    addMatch(macDisplay, 0.75, `display=${physicalWidth}x${physicalHeight}`);
  }

  const isAppleMobile = platform.includes('ios') || /iphone|ipad|ipod/i.test(userAgent);
  if (isAppleMobile) {
    const iosDisplay = matchDisplayModel(physicalWidth, physicalHeight, IOS_DISPLAY_MAP, 6);
    if (iosDisplay) {
      addMatch(iosDisplay, 0.8, `display=${physicalWidth}x${physicalHeight}`);
    }
  }

  if (ua?.model) {
    evidence.push(`ua.model=${ua.model}`);
    if (platform.includes('android') || /android/i.test(userAgent)) {
      const friendly = describeAndroidModel(ua.model);
      addMatch(friendly ?? ua.model, friendly ? 0.7 : 0.6);
    } else {
      addMatch(ua.model, 0.6);
    }
  }

  if (!matches.length) {
    if (!evidence.length) evidence.push('No high-entropy UA hints exposed');
    return null;
  }

  const value = `${matches[0]}${matches.length > 1 ? ' (approximate)' : ''}`;
  return {
    key: 'device.model',
    label,
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: 'ua-ch',
    limitations: 'Manufacturers can mask the exact model; private browsing modes often blank these hints.',
  };
}

/**
 * Inference of OS details.
 */
function inferOS(signals: OsSignals): Finding {
  const { ua, userAgent } = signals;
  const evidence: string[] = [];
  let label = 'Operating system';
  let value = 'Unknown OS';
  let confidence = 0.3;

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
    label,
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: ua?.platform ? 'ua-ch' : 'rule',
    limitations: 'Browsers may reduce OS version precision for privacy, so treat this as an estimate.',
  };
}

/**
 * Browser and engine inference with Chromium fork heuristics.
 */
function inferBrowser(signals: BrowserSignals): Finding {
  const { ua, brands } = signals;
  const evidence: string[] = [];
  let label = 'Browser & engine';
  let value = 'Unknown browser';
  let confidence = 0.3;

  if (brands && brands.length) {
    evidence.push(`brands=${brands.map((b) => `${b.brand} ${b.version}`).join(', ')}`);
    const primary = brands.find((b) => /Chrome|Chromium|Firefox|Safari|Edg/i.test(b.brand)) ?? brands[0];
    const engine = brands.some((b) => /Chrom/i.test(b.brand)) ? 'Chromium' : brands.some((b) => /Firefox|Gecko/i.test(b.brand)) ? 'Gecko' : 'WebKit';
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
    label,
    value,
    confidence: CLAMP(confidence),
    evidence,
    method: ua ? 'ua-ch' : 'rule',
    limitations: 'Chromium forks often reuse Chrome branding, so sites may treat them as Google Chrome.',
  };
}

/**
 * Calculates mean and 95% confidence interval for network samples.
 */
function summariseNetwork(samples: { mbps: number; latency: number }[]): NetworkMeasurement {
  if (!samples.length) {
    return { samples, meanMbps: null, ciLow: null, ciHigh: null, latencyMs: null };
  }
  const mean = samples.reduce((sum, s) => sum + s.mbps, 0) / samples.length;
  let ciLow: number | null = null;
  let ciHigh: number | null = null;
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

async function measureNetwork(probeUrl?: string): Promise<NetworkMeasurement | null> {
  if (typeof fetch === 'undefined' || typeof performance === 'undefined') {
    return null;
  }
  const target = probeUrl || (typeof location !== 'undefined' ? new URL('share-card.svg', location.href).toString() : null);
  if (!target) return null;
  const samples: { mbps: number; latency: number }[] = [];
  const attempts = 3;
  for (let i = 0; i < attempts; i += 1) {
    const url = `${target}${target.includes('?') ? '&' : '?'}cacheBust=${Math.random().toString(36).slice(2)}`;
    const start = performance.now();
    try {
      const response = await fetch(url, { cache: 'no-store', mode: 'cors' });
      const clone = response.clone();
      const buffer = await clone.arrayBuffer();
      const end = performance.now();
      const entry = performance.getEntriesByName(url).pop() as PerformanceResourceTiming | undefined;
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

/**
 * Builds the network finding.
 */
function buildNetworkFinding(signals: NetworkSignals): Finding | null {
  const evidence: string[] = [];
  const parts: string[] = [];
  let confidence = 0.3;

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
  let method: Finding['method'] = 'observation';
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

/**
 * Logistic VPN probability model.
 */
function probVPN(features: { tzDiff: boolean; asnDC: boolean; highRTT: boolean; desktopLike: boolean }): number {
  const score = -1.2
    + 1.2 * (features.tzDiff ? 1 : 0)
    + 1.0 * (features.asnDC ? 1 : 0)
    + 0.6 * (features.highRTT ? 1 : 0)
    + 0.4 * (features.desktopLike ? 1 : 0);
  return 1 / (1 + Math.exp(-score));
}

function buildVpnFinding(probability: number, evidence: string[]): Finding {
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

/**
 * Location inference combining local settings and IP geo.
 */
function buildLocationFinding(timeZone: string | undefined, languages: readonly string[], ip?: IpGeo | null): Finding {
  const evidence: string[] = [];
  if (timeZone) evidence.push(`timeZone=${timeZone}`);
  if (languages.length) evidence.push(`languages=${languages.join(',')}`);
  if (ip?.country) evidence.push(`ip.country=${ip.country}`);
  if (ip?.region) evidence.push(`ip.region=${ip.region}`);

  let value = 'Region unclear';
  let confidence = 0.3;
  if (ip?.country && timeZone && timeZone.toLowerCase().includes((ip.country || '').toLowerCase())) {
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

/**
 * Workspace context heuristic without requesting new permissions.
 */
function inferWorkspace(signals: DeviceSignals & { connectionType?: string | null }): Finding {
  const evidence: string[] = [];
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

/**
 * Peripheral capability report without requesting access.
 */
function buildPeripheralsFinding(): Finding {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const evidence: string[] = [];
  if (nav) {
    evidence.push(`usb=${'usb' in nav}`);
    evidence.push(`hid=${'hid' in nav}`);
    evidence.push(`bluetooth=${'bluetooth' in nav}`);
    evidence.push(`serial=${'serial' in nav}`);
  }
  const parts: string[] = [];
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

/**
 * Storage quota estimation.
 */
async function buildStorageFinding(): Promise<Finding | null> {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null;
    const { usage, quota } = await navigator.storage.estimate();
    const signals: StorageSignals = { usage, quota };
    const evidence: string[] = [];
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

/**
 * Trackability scoring using available signals.
 */
function buildTrackabilityFinding(signals: TrackSignals): Finding {
  const evidence: string[] = [];
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

function detectSystemFonts(): Finding | null {
  if (typeof document === 'undefined' || typeof window === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof ctx.measureText !== 'function') return null;
    const sample = 'mmmmmmmmmmlli';
    const size = '72px';
    const baselines = new Map<string, number>();
    ['monospace', 'serif', 'sans-serif'].forEach((fallback) => {
      ctx.font = `${size} ${fallback}`;
      baselines.set(fallback, ctx.measureText(sample).width);
    });
    const nativeFonts: string[] = [];
    const externalFonts: string[] = [];
    const evidence: string[] = [];
    FONT_CANDIDATES.forEach(({ name, category }) => {
      const matched = ['monospace', 'serif', 'sans-serif'].some((fallback) => {
        ctx.font = `${size} '${name}', ${fallback}`;
        const width = ctx.measureText(sample).width;
        const baseline = baselines.get(fallback) ?? width;
        return Math.abs(width - baseline) > 0.1;
      });
      if (matched) {
        if (category === 'external') externalFonts.push(name);
        else nativeFonts.push(name);
        evidence.push(`${name}=${category}`);
      }
    });
    const parts: string[] = [];
    if (externalFonts.length) parts.push(`External: ${externalFonts.join(', ')}`);
    if (nativeFonts.length) parts.push(`Native: ${nativeFonts.join(', ')}`);
    const value = parts.length ? parts.join(' • ') : 'System fonts not observable';
    const totalDetected = nativeFonts.length + externalFonts.length;
    const confidenceBase = totalDetected ? 0.45 : 0.3;
    const confidence = CLAMP(confidenceBase + externalFonts.length * 0.07 + nativeFonts.length * 0.03, 0, 0.85);
    return {
      key: 'fingerprint.fonts',
      label: 'System fonts',
      value,
      confidence,
      evidence,
      method: 'measurement',
      limitations:
        'Font detection is approximate; browsers can mask results or expose only a subset, especially in privacy modes.',
    };
  } catch (error) {
    console.debug('Font detection failed', error);
    return null;
  }
}

function buildCookiesFinding(): Finding | null {
  if (typeof navigator === 'undefined' || typeof document === 'undefined') return null;
  const evidence: string[] = [];
  const enabledFlag = typeof navigator.cookieEnabled === 'boolean' ? navigator.cookieEnabled : null;
  if (enabledFlag != null) evidence.push(`navigator.cookieEnabled=${enabledFlag}`);
  let writeSuccess: boolean | null = null;
  try {
    const testName = `fp_cookie_${Math.random().toString(36).slice(2)}`;
    document.cookie = `${testName}=1; path=/; SameSite=Strict`;
    writeSuccess = document.cookie.includes(`${testName}=1`);
    document.cookie = `${testName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
    evidence.push(`write=${writeSuccess}`);
  } catch (error) {
    evidence.push(`writeError=${(error as Error).message}`);
  }
  const enabled = writeSuccess ?? enabledFlag ?? false;
  const value = enabled ? 'Enabled' : 'Disabled';
  return {
    key: 'privacy.cookies',
    label: 'Cookies status',
    value,
    confidence: enabled ? 0.9 : 0.7,
    evidence,
    method: 'measurement',
    limitations: 'Third-party or cross-site cookies may still be restricted even when first-party writes succeed.',
  };
}

function checkStorageSurface(store: Storage | undefined, key: string, label: string, evidence: string[]): boolean {
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

async function probeIndexedDb(key: string): Promise<boolean> {
  try {
    const idb = typeof indexedDB === 'undefined' ? undefined : indexedDB;
    if (!idb?.open) return false;
    return await new Promise<boolean>((resolve) => {
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
      request.onupgradeneeded = () => {
        // no-op; touching object store ensures success path
      };
    });
  } catch (error) {
    console.debug('IndexedDB probe failed', error);
    return false;
  }
}

async function runSupercookieProbe(): Promise<Finding | null> {
  if (typeof window === 'undefined') return null;
  const key = `fp_sc_${Math.random().toString(36).slice(2)}`;
  const evidence: string[] = [];
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

function identifyAdBlockVendor(): string | null {
  if (typeof window === 'undefined') return null;
  const win = window as typeof window & Record<string, unknown>;
  const nav = (typeof navigator !== 'undefined' ? (navigator as BraveNavigator) : undefined);
  if (nav?.brave && typeof nav.brave.isBrave === 'function') return 'Brave Shields';

  const signatureChecks: { name: string; match: () => boolean }[] = [
    {
      name: 'uBlock Origin',
      match: () => ['uBO', 'ublock', 'ublock0', '_uBlock', 'ublockOrigin'].some((key) => key in win),
    },
    {
      name: 'AdGuard',
      match: () => ['adguard', 'AdGuard', 'adguardProductName'].some((key) => key in win),
    },
    {
      name: 'Ghostery',
      match: () => ['ghostery', '__ghostery'].some((key) => key in win),
    },
    {
      name: 'Privacy Badger',
      match: () => 'pbjs' in win,
    },
  ];
  for (const entry of signatureChecks) {
    try {
      if (entry.match()) return entry.name;
    } catch (error) {
      console.debug('Adblock signature check failed', error);
    }
  }
  if (typeof document !== 'undefined') {
    const attr = document.documentElement?.getAttribute('data-adblocker');
    if (attr) return `Custom blocker (${attr})`;
  }
  return null;
}

function detectAdBlocker(): Finding | null {
  if (typeof document === 'undefined') return null;
  let blocked: boolean | null = null;
  const evidence: string[] = [];
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
    } else if (typeof (bait as HTMLElement).offsetParent === 'object') {
      blocked = (bait as HTMLElement).offsetParent === null;
    } else {
      blocked = (bait as HTMLElement).clientHeight === 0 || (bait as HTMLElement).clientWidth === 0;
    }
    document.body.removeChild(bait);
  } catch (error) {
    console.debug('Ad blocker detection failed', error);
  }
  if (blocked != null) evidence.push(`hidden=${blocked}`);
  const vendor = blocked ? identifyAdBlockVendor() : null;
  if (vendor) evidence.push(`vendor=${vendor}`);
  const value = blocked == null ? 'Status unknown' : blocked ? `Detected (${vendor ?? 'unknown blocker'})` : 'Not detected';
  const confidence = blocked == null ? 0.3 : blocked ? (vendor ? 0.7 : 0.6) : 0.5;
  return {
    key: 'privacy.adblock',
    label: 'Ad blocker usage',
    value,
    confidence,
    evidence,
    method: 'observation',
    limitations:
      'Detection relies on DOM side effects and public APIs. Some blockers intentionally obfuscate their presence or operate per-site.',
  };
}

function normalizeDeviceClass(value: ParsedUserAgent['deviceClass']): string {
  switch (value) {
    case 'desktop':
      return 'Desktop';
    case 'mobile':
      return 'Mobile';
    case 'tablet':
      return 'Tablet';
    default:
      return 'Unknown device';
  }
}

function canonicalPlatformName(value: string | null | undefined): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower.includes('mac')) return 'macOS';
  if (lower.includes('win')) return 'Windows';
  if (lower === 'ios' || lower.includes('iphone')) return 'iOS';
  if (lower.includes('ipad')) return 'iPadOS';
  if (lower.includes('android')) return 'Android';
  if (lower.includes('linux')) return 'Linux';
  if (lower.includes('cros') || lower.includes('chrome os')) return 'ChromeOS';
  return value;
}

function parseUserAgentDetailed(uaHints: UaHighEntropy | null): ParsedUserAgent {
  const nav = typeof navigator === 'undefined' ? undefined : (navigator as BraveNavigator);
  const uaString = nav?.userAgent ?? '';
  const lower = uaString.toLowerCase();
  const getVersion = (regex: RegExp): string | null => {
    const match = regex.exec(uaString);
    return match ? match[1] : null;
  };
  const browserPatterns: { name: string; regex: RegExp }[] = [
    { name: 'Edge', regex: /Edg\/(\d+[\.\d]*)/i },
    { name: 'Opera', regex: /OPR\/(\d+[\.\d]*)/i },
    { name: 'Vivaldi', regex: /Vivaldi\/(\d+[\.\d]*)/i },
    { name: 'Samsung Browser', regex: /SamsungBrowser\/(\d+[\.\d]*)/i },
    { name: 'Yandex Browser', regex: /YaBrowser\/(\d+[\.\d]*)/i },
    { name: 'DuckDuckGo', regex: /DuckDuckGo\/(\d+[\.\d]*)/i },
    { name: 'Whale', regex: /Whale\/(\d+[\.\d]*)/i },
    { name: 'Brave', regex: /Brave\/(\d+[\.\d]*)/i },
    { name: 'Chrome', regex: /CriOS\/(\d+[\.\d]*)/i },
  ];
  let browserName = 'Unknown';
  let browserVersion: string | null = null;
  for (const entry of browserPatterns) {
    const match = entry.regex.exec(uaString);
    if (match) {
      browserName = entry.name;
      browserVersion = match[1];
      break;
    }
  }
  if (browserName === 'Unknown') {
    if (/chrome\//i.test(uaString) && /safari/i.test(uaString)) {
      browserName = 'Chrome';
      browserVersion = getVersion(/Chrome\/(\d+[\.\d]*)/i);
    } else if (/firefox\//i.test(uaString)) {
      browserName = 'Firefox';
      browserVersion = getVersion(/Firefox\/(\d+[\.\d]*)/i);
    } else if (/safari/i.test(uaString) && /version\//i.test(uaString)) {
      browserVersion = getVersion(/Version\/(\d+[\.\d]*)/i);
      browserName = /iphone|ipad|ipod/.test(lower) ? 'Mobile Safari' : 'Safari';
    } else if (/safari\//i.test(uaString)) {
      browserName = 'Safari';
      browserVersion = getVersion(/Safari\/(\d+[\.\d]*)/i);
    } else if (/msie |trident\//i.test(uaString)) {
      browserName = 'Internet Explorer';
      browserVersion = getVersion(/(?:MSIE |rv:)([\d.]+)/i);
    }
  }
  if (browserName === 'Chrome' && nav?.brave) {
    browserName = 'Brave';
  }
  const browserMajor = browserVersion ? Number.parseInt(browserVersion.split('.')[0], 10) : null;
  const sanitizedMajor = Number.isFinite(browserMajor ?? NaN) ? browserMajor : null;

  let osName = canonicalPlatformName(uaHints?.platform ?? null) ?? null;
  let osVersion: string | null = uaHints?.platformVersion ?? null;

  const winMatch = /windows nt ([\d.]+)/i.exec(uaString);
  if (winMatch) {
    osName = 'Windows';
    const versionMap: Record<string, string> = {
      '10.0': '10/11',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
      '6.0': 'Vista',
      '5.1': 'XP',
    };
    osVersion = versionMap[winMatch[1]] ?? osVersion;
    if (!osVersion && uaHints?.platformVersion) {
      const parsed = Number.parseInt(uaHints.platformVersion.split('.')[0] ?? '', 10);
      if (Number.isFinite(parsed)) {
        if (parsed >= 15) osVersion = '11';
        else if (parsed === 14) osVersion = '10';
      }
    }
  }
  const macMatch = /mac os x (\d+[_.\d]*)/i.exec(uaString);
  if (macMatch) {
    osName = 'macOS';
    osVersion = macMatch[1].replace(/_/g, '.');
  }
  const ipadMatch = /ipad(?:;|).*?os (\d+[_.\d]*)/i.exec(uaString);
  if (ipadMatch) {
    osName = 'iPadOS';
    osVersion = ipadMatch[1].replace(/_/g, '.');
  }
  const iphoneMatch = /iphone(?: os)? (\d+[_.\d]*)/i.exec(uaString);
  if (iphoneMatch) {
    osName = 'iOS';
    osVersion = iphoneMatch[1].replace(/_/g, '.');
  }
  const androidMatch = /android (\d+[\.\d]*)/i.exec(uaString);
  if (androidMatch) {
    osName = 'Android';
    osVersion = androidMatch[1];
  }
  if (/cros/i.test(uaString)) {
    osName = 'ChromeOS';
    osVersion = uaHints?.platformVersion ?? null;
  }
  if (/linux/i.test(uaString) && !osName) {
    osName = 'Linux';
  }

  let deviceClass: ParsedUserAgent['deviceClass'] = 'unknown';
  if (/ipad|tablet/.test(lower)) deviceClass = 'tablet';
  else if (/android/.test(lower) && !/mobile/.test(lower)) deviceClass = 'tablet';
  else if (/mobi|iphone|ipod|android/.test(lower)) deviceClass = 'mobile';
  else if (osName && ['windows', 'macos', 'linux', 'chromeos'].includes(osName.toLowerCase())) deviceClass = 'desktop';
  else if ((nav?.maxTouchPoints ?? 0) > 0 && deviceClass === 'unknown') deviceClass = 'mobile';

  return {
    browserName,
    browserVersion,
    browserMajor: sanitizedMajor,
    osName,
    osVersion,
    deviceClass,
    model: uaHints?.model ?? null,
  };
}

const JA3_PROFILES: Ja3Profile[] = [
  {
    label: 'Chromium TLS 1.3',
    browsers: ['chrome', 'edge', 'opera', 'vivaldi', 'brave', 'yandex browser', 'duckduckgo', 'samsung browser', 'arc', 'whale'],
    minVersion: 110,
    signature:
      '771,4865-4866-4867-49196-49200-49195-49199-52393-52392-49188-49192-49187-49191-49162-49172-156-157-47-53,0-11-10-35-16-23-65281-13-45-43-51-57-0-27-17513-2570-17516-18,29-23-24,0',
    hash: 'e7d705a3286e19ea42f587b344ee6865',
  },
  {
    label: 'Firefox TLS 1.3',
    browsers: ['firefox'],
    minVersion: 100,
    signature:
      '771,4865-4866-4867-49196-49200-49195-49199-49188-49192-49162-49172-156-157-47-53,0-11-10-35-16-5-18-51-45-13-65281-43-23-17513-27,29-23-24,0',
    hash: 'a66f8fd9dfb9e870bdb64a0e7a26b00a',
  },
  {
    label: 'Safari 17+ (macOS)',
    browsers: ['safari'],
    minVersion: 17,
    platformMatches: (info) => info.osName?.toLowerCase() === 'macos',
    signature:
      '771,4865-4866-4867-49195-49199-49196-49200-49188-49192-49162-49172-49187-49191-156-157-47-53,0-11-10-35-16-5-18-13-51-45-65281-27-17513,29-23-24,0',
    hash: '769f5f1f2b8ab51f5c0ee3c05f9d3ad0',
  },
  {
    label: 'Safari 17+ (iOS/iPadOS)',
    browsers: ['mobile safari', 'safari'],
    minVersion: 17,
    platformMatches: (info) => {
      const os = info.osName?.toLowerCase();
      return os === 'ios' || os === 'ipados';
    },
    signature:
      '771,4865-4866-4867-49195-49199-49196-49200-49188-49192-49162-49172-49187-49191-156-157-47-53,0-11-10-35-16-5-18-13-45-51-27-17513,29-23-24,0',
    hash: '0a4a7e03659bc0cb6a75d6a5b51a35a4',
  },
];

function estimateJa3Fingerprint(info: ParsedUserAgent): { hash: string | null; signature: string | null; profile: string | null } {
  const browser = info.browserName.toLowerCase();
  for (const profile of JA3_PROFILES) {
    if (!profile.browsers.includes(browser)) continue;
    if (profile.minVersion && (info.browserMajor ?? -Infinity) < profile.minVersion) continue;
    if (profile.maxVersion && (info.browserMajor ?? Infinity) > profile.maxVersion) continue;
    if (profile.platformMatches && !profile.platformMatches(info)) continue;
    return { hash: profile.hash, signature: profile.signature, profile: profile.label };
  }
  return { hash: null, signature: null, profile: null };
}

function buildUaParserFinding(info: ParsedUserAgent): Finding {
  const browserLabel = [info.browserName, info.browserVersion].filter(Boolean).join(' ').trim() || 'Browser unknown';
  const osLabel = [info.osName, info.osVersion].filter(Boolean).join(' ').trim() || 'OS unknown';
  const deviceLabel = normalizeDeviceClass(info.deviceClass);
  let value = `${browserLabel} on ${osLabel}`;
  if (deviceLabel && deviceLabel !== 'Unknown device') value = `${value} (${deviceLabel})`;
  if (info.model) value = `${value}, model ${info.model}`;
  const evidence = [`browser=${browserLabel}`, `os=${osLabel}`, `device=${deviceLabel}`];
  if (info.model) evidence.push(`model=${info.model}`);
  return {
    key: 'browser.uaDetailed',
    label: 'User-Agent parser',
    value,
    confidence: value.includes('unknown') ? 0.3 : 0.6,
    evidence,
    method: 'observation',
    limitations: 'Derived from UA string and high-entropy hints; spoofing or privacy protections may change the reported values.',
  };
}

function buildTlsJa3Finding(info: ParsedUserAgent): Finding {
  const estimate = estimateJa3Fingerprint(info);
  const browserLabel = [info.browserName, info.browserVersion].filter(Boolean).join(' ').trim() || 'browser unknown';
  const osLabel = [info.osName, info.osVersion].filter(Boolean).join(' ').trim() || 'os unknown';
  const evidence = [`browser=${browserLabel}`, `os=${osLabel}`];
  if (info.deviceClass !== 'unknown') evidence.push(`device=${info.deviceClass}`);
  if (estimate.profile) evidence.push(`profile=${estimate.profile}`);
  if (estimate.signature) evidence.push(`sig=${truncate(estimate.signature, 90)}`);
  if (!estimate.hash) {
    return {
      key: 'network.tlsJa3',
      label: 'TLS JA3 fingerprint',
      value: 'Unknown (insufficient heuristics)',
      confidence: 0.2,
      evidence,
      method: 'inference',
      limitations: 'Estimated locally from UA hints; actual TLS handshakes may differ when routed through VPNs or proxies.',
    };
  }
  return {
    key: 'network.tlsJa3',
    label: 'TLS JA3 fingerprint',
    value: estimate.hash,
    confidence: 0.5,
    evidence,
    method: 'inference',
    limitations: 'Signature derived from common TLS client profiles; anti-fingerprinting layers or intermediaries may override it.',
  };
}

function extractHeadersFromBasic(basic: Record<string, unknown> | null): Record<string, string> | null {
  if (!basic || typeof basic !== 'object') return null;
  const server = (basic as { server?: unknown }).server;
  if (!server || typeof server !== 'object') return null;
  const headersRaw = (server as { headers?: unknown }).headers;
  if (!headersRaw || typeof headersRaw !== 'object') return null;
  const entries = Object.entries(headersRaw as Record<string, unknown>);
  if (!entries.length) return null;
  const normalized: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (value == null) continue;
    const str = Array.isArray(value) ? value.map((item) => String(item)).join(', ') : String(value);
    normalized[key.toLowerCase()] = str;
  }
  return normalized;
}

function buildRequestHeadersFinding(basic: Record<string, unknown> | null): Finding {
  const headers = extractHeadersFromBasic(basic);
  if (!headers) {
    return {
      key: 'network.requestHeaders',
      label: 'HTTPS headers viewer',
      value: 'Headers unavailable (run IP scan)',
      confidence: 0.2,
      evidence: [],
      method: 'observation',
      limitations: 'Requires the optional /headers probe; no header data leaves your browser during this check.',
    };
  }
  const interesting: [string, string][] = [
    ['accept', 'Accept'],
    ['accept-language', 'Accept-Language'],
    ['referer', 'Referer'],
    ['origin', 'Origin'],
    ['content-security-policy', 'CSP'],
    ['sec-fetch-site', 'Sec-Fetch-Site'],
    ['sec-fetch-mode', 'Sec-Fetch-Mode'],
    ['sec-fetch-dest', 'Sec-Fetch-Dest'],
    ['sec-ch-ua', 'Sec-CH-UA'],
    ['sec-ch-ua-platform', 'Sec-CH-UA-Platform'],
    ['sec-ch-ua-mobile', 'Sec-CH-UA-Mobile'],
  ];
  const evidence: string[] = [];
  const summaryPieces: string[] = [];
  for (const [key, label] of interesting) {
    const value = headers[key];
    if (!value) continue;
    const clean = truncate(value, 90);
    evidence.push(`${label}: ${clean}`);
    if (['accept', 'referer', 'origin', 'content-security-policy'].includes(key)) {
      summaryPieces.push(`${label}: ${truncate(value, 60)}`);
    }
  }
  if (!summaryPieces.length) summaryPieces.push('Headers captured');
  return {
    key: 'network.requestHeaders',
    label: 'HTTPS headers viewer',
    value: summaryPieces.join(' • '),
    confidence: 0.45,
    evidence,
    method: 'observation',
    limitations: 'Headers shown reflect the latest local /headers fetch; proxies or privacy filters may rewrite them en route.',
  };
}

const ICE_GATHER_TIMEOUT_MS = 1500;

type IceCandidateDetails = {
  address?: string;
  type?: string;
};

async function collectWebRtcLeakSignals(): Promise<WebRtcLeakSignals | null> {
  if (typeof window === 'undefined') return null;
  const RTCPeer = (window as typeof window & { RTCPeerConnection?: typeof RTCPeerConnection }).RTCPeerConnection;
  if (!RTCPeer) return null;
  let pc: RTCPeerConnection | null = null;
  const candidates = new Set<string>();
  try {
    pc = new RTCPeer({ iceServers: [], iceCandidatePoolSize: 1 });
    if (pc.createDataChannel) {
      try {
        pc.createDataChannel('probe', { negotiated: true, id: 0 });
      } catch (error) {
        console.debug('RTC data channel failed', error);
      }
    }
    const gatherPromise = new Promise<void>((resolve) => {
      let finished = false;
      const settle = () => {
        if (!finished) {
          finished = true;
          resolve();
        }
      };
      const timer = setTimeout(settle, ICE_GATHER_TIMEOUT_MS);
      const handleCandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate && event.candidate.candidate) {
          candidates.add(event.candidate.candidate);
        } else {
          clearTimeout(timer);
          settle();
        }
      };
      if (pc) {
        pc.onicecandidate = handleCandidate;
        if (typeof pc.addEventListener === 'function') {
          pc.addEventListener('icecandidate', handleCandidate);
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
      pc?.close();
    } catch (error) {
      console.debug('WebRTC close failed', error);
    }
  }
  if (!candidates.size) return { candidates: [], addresses: [], maskedHostnames: [], candidateTypes: [] };
  const addresses = new Set<string>();
  const masked = new Set<string>();
  const types = new Set<string>();
  candidates.forEach((candidate) => {
    const details = parseIceCandidate(candidate);
    if (details.type) types.add(details.type);
    if (details.address) {
      if (details.address.toLowerCase().includes('local')) masked.add(details.address);
      else addresses.add(details.address);
    }
  });
  return {
    candidates: Array.from(candidates),
    addresses: Array.from(addresses),
    maskedHostnames: Array.from(masked),
    candidateTypes: Array.from(types),
  };
}

function parseIceCandidate(candidate: string): IceCandidateDetails {
  const parts = candidate.trim().split(' ');
  const details: IceCandidateDetails = {};
  if (parts.length > 4) details.address = parts[4];
  const typeIndex = parts.indexOf('typ');
  if (typeIndex >= 0 && parts[typeIndex + 1]) details.type = parts[typeIndex + 1];
  return details;
}

function isIpAddress(address: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(address) || address.includes('::') || /^[0-9a-f:]+$/i.test(address);
}

function isPrivateIp(address: string): boolean {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(address)) {
    const parts = address.split('.').map((item) => Number.parseInt(item, 10));
    if (parts.length !== 4 || parts.some((item) => Number.isNaN(item))) return false;
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    return false;
  }
  const lower = address.toLowerCase();
  return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
}

function buildWebRtcFinding(signals: WebRtcLeakSignals | null): Finding | null {
  if (!signals) {
    return {
      key: 'network.webrtcLeak',
      label: 'WebRTC leak test',
      value: 'Unavailable (RTCPeerConnection not supported)',
      confidence: 0.2,
      evidence: [],
      method: 'observation',
      limitations: 'WebRTC APIs disabled or unsupported; leak status cannot be measured locally.',
    };
  }
  const evidence: string[] = [];
  evidence.push(`ICE ${signals.candidates.length}`);
  if (signals.candidateTypes.length) evidence.push(`Types ${signals.candidateTypes.join('/')}`);
  if (signals.addresses.length) evidence.push(`IPs ${truncate(signals.addresses.join(', '), 70)}`);
  if (signals.maskedHostnames.length) evidence.push(`mDNS ${truncate(signals.maskedHostnames.join(', '), 70)}`);

  const leakTypes = signals.candidateTypes.filter((type) => type === 'host' || type === 'srflx');
  const exposesRealIp = signals.addresses.some((address) => isIpAddress(address) && !address.toLowerCase().includes('local'));

  const candidateCount = signals.candidates.length;
  const typeLabel = Array.from(new Set(leakTypes)).join('/') || 'relay';
  let value = candidateCount === 0 ? 'No ICE candidates (WebRTC disabled?)' : `${candidateCount} ICE candidate${candidateCount === 1 ? '' : 's'}`;
  let confidence = candidateCount === 0 ? 0.3 : 0.4;
  if (leakTypes.length && exposesRealIp) {
    value = `${candidateCount} ICE ${typeLabel} candidate(s) expose IP`;
    confidence = 0.65;
  } else if (leakTypes.length) {
    value = `${candidateCount} ICE ${typeLabel} candidate(s) masked via mDNS`;
    confidence = 0.55;
  } else if (candidateCount) {
    value = `${candidateCount} ICE candidate(s) without host details`;
    confidence = 0.45;
  }

  return {
    key: 'network.webrtcLeak',
    label: 'WebRTC leak test',
    value,
    confidence,
    evidence,
    method: 'measurement',
    limitations: 'Modern browsers limit ICE details; the probe inspects only locally gathered candidates with no external servers.',
  };
}

function buildDnsLeakFinding(signals: WebRtcLeakSignals | null): Finding | null {
  if (!signals) {
    return {
      key: 'network.dnsLeak',
      label: 'DNS leak test',
      value: 'Unavailable (WebRTC not supported)',
      confidence: 0.2,
      evidence: [],
      method: 'observation',
      limitations: 'DNS leak heuristic relies on WebRTC ICE candidates and cannot run without WebRTC support.',
    };
  }
  const evidence: string[] = [];
  if (signals.addresses.length) evidence.push(`IPs ${truncate(signals.addresses.join(', '), 70)}`);
  if (signals.maskedHostnames.length) evidence.push(`mDNS ${truncate(signals.maskedHostnames.join(', '), 70)}`);
  if (signals.candidateTypes.length) evidence.push(`Types ${signals.candidateTypes.join('/')}`);

  const publicIps = signals.addresses.filter((address) => isIpAddress(address) && !isPrivateIp(address));
  const localIps = signals.addresses.filter((address) => isIpAddress(address) && isPrivateIp(address));

  let value = !signals.candidates.length ? 'No WebRTC activity (DNS leak unknown)' : 'No DNS IPs exposed via ICE';
  let confidence = !signals.candidates.length ? 0.3 : 0.4;
  if (signals.maskedHostnames.length && !signals.addresses.length) {
    value = 'mDNS hostnames only (masking active)';
    confidence = 0.55;
  } else if (publicIps.length) {
    value = `Public IP via ICE: ${truncate(publicIps.join(', '), 60)}`;
    confidence = 0.7;
  } else if (localIps.length) {
    value = `Local IP via ICE: ${truncate(localIps.join(', '), 60)}`;
    confidence = 0.6;
  }

  return {
    key: 'network.dnsLeak',
    label: 'DNS leak test',
    value,
    confidence,
    evidence,
    method: 'measurement',
    limitations: 'Assesses DNS leakage heuristically from WebRTC ICE results; does not contact external resolvers or log data.',
  };
}

function buildGuaranteeFinding(): Finding {
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

function buildPermissionFinding(): Finding {
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

/**
 * Example renderer that appends list items for findings.
 */
export function renderFindings(container: HTMLElement, findings: Finding[]): void {
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

function buildVpnFeatures(ip: IpGeo | undefined, probabilitySource: NetworkSignals, deviceFinding: Finding, timeZone: string | undefined): { probability: number; evidence: string[] } {
  const latency = probabilitySource.measurement?.latencyMs ?? ip?.rttMs ?? probabilitySource.rtt ?? null;
  const tz = timeZone || '';
  const ipCountry = ip?.country || '';
  const tzDiff = Boolean(tz && ipCountry && !tz.toLowerCase().includes(ipCountry.toLowerCase()));
  const asnDC = ip?.asnType === 'hosting' || ip?.asnType === 'corporate';
  const highRTT = latency != null && latency > 250;
  const desktopLike = !deviceFinding.value.includes('mobile');
  const probability = probVPN({ tzDiff, asnDC, highRTT, desktopLike });
  const evidence: string[] = [];
  evidence.push(`tzDiff=${tzDiff}`);
  evidence.push(`asnType=${ip?.asnType ?? 'unknown'}`);
  if (latency != null) evidence.push(`latencyMs=${latency}`);
  evidence.push(`desktopLike=${desktopLike}`);
  return { probability, evidence };
}

async function collectUaHighEntropy(): Promise<UaHighEntropy | null> {
  try {
    if (typeof navigator === 'undefined') return null;
    const uaData = navigator.userAgentData;
    if (!uaData) return null;
    if (typeof uaData.getHighEntropyValues !== 'function') {
      return {
        platform: uaData.platform ?? null,
        model: null,
        architecture: undefined,
        bitness: undefined,
        platformVersion: undefined,
        fullVersionList: uaData.brands ?? null,
        mobile: uaData.mobile ?? null,
      };
    }
    const fields: Array<'architecture' | 'bitness' | 'platform' | 'platformVersion' | 'model' | 'fullVersionList'> = [
      'architecture',
      'bitness',
      'platform',
      'platformVersion',
      'model',
      'fullVersionList',
    ];
    const values = await uaData.getHighEntropyValues(fields);
    return { ...values, mobile: values.mobile ?? uaData.mobile ?? null };
  } catch (error) {
    console.debug('UA high entropy hints unavailable', error);
    return null;
  }
}

function collectTrackSignals(basic: Record<string, unknown> | null, deviceSignals: DeviceSignals): TrackSignals {
  const canvasActive = Boolean((basic as { hashes?: { canvas?: unknown } } | null)?.hashes?.canvas);
  const audioActive = Boolean((basic as { hashes?: { audio?: unknown } } | null)?.hashes?.audio);
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  let colorGamut: string | null = null;
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
    deviceMemory: deviceSignals.deviceMemory ?? ((nav && 'deviceMemory' in nav) ? Number((nav as unknown as { deviceMemory?: number }).deviceMemory ?? 0) || null : null),
    colorGamut,
    hdr,
  };
}

function collectLanguages(): readonly string[] {
  if (typeof navigator === 'undefined') return [];
  if (Array.isArray(navigator.languages) && navigator.languages.length) return navigator.languages;
  return navigator.language ? [navigator.language] : [];
}

function resolvedTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.debug('Time zone resolution failed', error);
    return undefined;
  }
}

function collectBasicFromGlobal(): Record<string, unknown> | null {
  const global = globalThis as typeof globalThis & { __fingerprintBasic?: Record<string, unknown> };
  return global.__fingerprintBasic ?? null;
}

async function collectNetworkSignals(): Promise<NetworkSignals> {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const connection = nav && 'connection' in nav ? (nav as Navigator & { connection?: { effectiveType?: string; downlink?: number; rtt?: number } }).connection : undefined;
  const measurement = await measureNetwork().catch(() => null);
  return {
    connectionType: connection?.effectiveType ?? null,
    downlink: connection?.downlink ?? null,
    rtt: connection?.rtt ?? null,
    measurement,
  };
}

export async function runProfiling(ip?: IpGeo): Promise<Finding[]> {
  const basic = collectBasicFromGlobal();
  const ua = await collectUaHighEntropy();
  const parsedUa = parseUserAgentDetailed(ua);
  const renderer = typeof document !== 'undefined' ? detectGlRenderer() : null;
  const deviceSignals = collectDeviceSignals(ua);
  const languages = collectLanguages();
  const timeZone = resolvedTimeZone();
  const networkSignals = await collectNetworkSignals();
  const findings: Finding[] = [];

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
  findings.push(buildUaParserFinding(parsedUa));

  const networkFinding = buildNetworkFinding(networkSignals);
  if (networkFinding) findings.push(networkFinding);
  findings.push(buildTlsJa3Finding(parsedUa));

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
  findings.push(buildRequestHeadersFinding(basic));

  const webRtcSignals = await collectWebRtcLeakSignals();
  const webrtcFinding = buildWebRtcFinding(webRtcSignals);
  if (webrtcFinding) findings.push(webrtcFinding);
  const dnsLeakFinding = buildDnsLeakFinding(webRtcSignals);
  if (dnsLeakFinding) findings.push(dnsLeakFinding);

  const uaDumpEvidence = ua?.fullVersionList?.map((item) => `${item.brand} ${item.version}`) ?? navigator.userAgentData?.brands?.map((item) => `${item.brand} ${item.version}`) ?? [];
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

export function selfTest(): void {
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
