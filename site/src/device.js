// Guesses about the device, OS and browser from the User-Agent, Client Hints and hardware signals.

/* ---- Browser ---- */

// The browser family for the uniqueness model and the server/browser comparison.
export function browserFamily(ua) {
  ua = ua || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if (/Chrome\//.test(ua)) return 'Chrome';
  return '__other';
}

// The group whose instructions the recommendation cards show.
export function detectBrowserGroup() {
  if (navigator.brave && typeof navigator.brave.isBrave === 'function') return 'brave';
  const ua = navigator.userAgent || '';
  if (/Firefox\//i.test(ua) && !/Seamonkey/i.test(ua)) return 'firefox';
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'safari';
  return 'chrome';
}

function browserVersionFromUa(ua) {
  const patterns = [
    { regex: /Arc\/([\d.]+)/i, name: 'Arc' },
    { regex: /Edg(?:e)?\/([\d.]+)/i, name: 'Edge' },
    { regex: /OPR\/([\d.]+)/i, name: 'Opera' },
    { regex: /YaBrowser\/([\d.]+)/i, name: 'Yandex Browser' },
    { regex: /Firefox\/([\d.]+)/i, name: 'Firefox' },
    { regex: /Brave\/([\d.]+)/i, name: 'Brave' },
    { regex: /Chrome\/([\d.]+)/i, name: 'Chrome' },
    { regex: /Version\/([\d.]+).*Safari\/([\d.]+)/i, name: 'Safari' },
    { regex: /Safari\/([\d.]+)/i, name: 'Safari' }
  ];
  for (const { regex, name } of patterns) {
    const match = ua.match(regex);
    if (match && (match[1] || match[2])) return { name, version: match[1] || match[2] };
  }
  return null;
}

function probableBrowsers(b) {
  const ua = b.userAgent || '';
  const brands = Array.isArray(b.uaBrands) ? b.uaBrands.map(item => (item?.brand || '').toLowerCase()) : [];
  const out = [];
  if (/Arc\//i.test(ua) || brands.some(name => name.includes('arc'))) out.push('Arc');
  if (/Edg\//.test(ua)) out.push('Edge');
  if (/OPR\//.test(ua)) out.push('Opera');
  if (/YaBrowser\//.test(ua)) out.push('Yandex Browser');
  if (/Firefox\//.test(ua)) out.push('Firefox');
  if (/Chrome\//.test(ua) && !/Edg\/|OPR\/|YaBrowser\//.test(ua)) { out.push('Chrome'); if (navigator.brave) out.push('Brave'); }
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) out.push('Safari');
  return out.length ? Array.from(new Set(out)).join(' / ') : '—';
}

// "Chrome 134", "Safari 17", … or '—'.
export function browserDisplayName(basic) {
  const ua = basic.userAgent || '';
  const versionInfo = browserVersionFromUa(ua);
  const guess = probableBrowsers(basic);
  const main = versionInfo?.name || (guess && guess !== '—' ? guess.split(' / ')[0] : null);
  let version = versionInfo?.version || basic.uaHighEntropy?.uaFullVersion || null;
  if (version && version.includes('.')) version = version.split('.')[0];
  if (main && version) return `${main} ${version}`;
  if (main) return main;
  return guess || '—';
}

/* ---- OS ---- */

function legacyOsFromUa(ua) {
  ua = ua || '';
  const mac = ua.match(/Mac OS X ([0-9_.]+)/i);
  if (mac) return 'macOS ' + mac[1].replace(/_/g, '.');
  const win = ua.match(/Windows NT ([0-9.]+)/i);
  if (win) {
    const map = { '10.0': 'Windows 10/11', '6.3': 'Windows 8.1', '6.2': 'Windows 8', '6.1': 'Windows 7' };
    return map[win[1]] || ('Windows NT ' + win[1]);
  }
  const ios = ua.match(/iPhone OS ([0-9_]+)/i) || ua.match(/CPU OS ([0-9_]+)/i);
  if (ios) return 'iOS ' + ios[1].replace(/_/g, '.');
  const android = ua.match(/Android ([0-9.]+)/i);
  if (android) return 'Android ' + android[1];
  if (/Linux/i.test(ua)) return 'Linux';
  return '';
}

// "macOS 15", "Windows 11", "iOS 17 (iPhone)", "Android 14 (arm)", "Linux (x86)", …
export function guessOSVersion(basic) {
  const ua = basic.userAgent || '';
  const platform = (basic.uaPlatform || basic.platform || '').toLowerCase();
  const hints = basic.uaHighEntropy || {};
  const pvString = hints.platformVersion || '';
  const pvMajor = parseInt(pvString.split('.')[0] || '', 10);
  const legacy = legacyOsFromUa(ua);
  if (platform.includes('mac')) {
    // Chromium reports the macOS version itself in platformVersion ("14.6.1", "26.0").
    if (pvMajor >= 11) return `macOS ${pvMajor}`;
    if (pvMajor === 10) return `macOS ${pvString.split('.').slice(0, 2).join('.')}`;
    // Every browser freezes the UA at 10.15.7, so that version means nothing.
    if (legacy && !/Mac OS X 10[_.]15[_.]7/.test(ua)) return legacy;
    return 'macOS';
  }
  if (platform.includes('ios') || /iPhone|iPad|iPod/i.test(ua)) {
    const model = hints.model || (/iPad|iPhone|iPod/i.exec(ua)?.[0] || '').trim();
    const iosVersion = !Number.isNaN(pvMajor) && pvMajor > 0 ? `iOS ${pvMajor}` : (legacy || 'iOS');
    return model ? `${iosVersion} (${model})` : iosVersion;
  }
  if (platform.includes('android')) {
    const versionMatch = ua.match(/Android ([0-9.]+)/i);
    const versionLabel = versionMatch ? `Android ${versionMatch[1]}` : (legacy || 'Android');
    return hints.architecture ? `${versionLabel} (${hints.architecture})` : versionLabel;
  }
  if (platform.includes('windows')) {
    const map = { 15: 'Windows 11', 14: 'Windows 10', 13: 'Windows 8.1', 12: 'Windows 8', 11: 'Windows 7' };
    if (map[pvMajor]) return map[pvMajor];
    if (pvMajor > 15) return 'Windows 11';
    return legacy || 'Windows';
  }
  if (platform.includes('chrome os')) return 'ChromeOS';
  if (platform.includes('linux')) {
    if (legacy && legacy.toLowerCase().startsWith('linux')) return legacy;
    return hints.architecture ? `Linux (${hints.architecture})` : 'Linux';
  }
  return legacy || basic.uaPlatform || basic.platform || 'OS';
}

/* ---- Device ---- */

export function guessAppleChip(renderer) {
  const m = (renderer || '').match(/Apple\s+M(\d)(?:\s*(Pro|Max|Ultra))?/i);
  return m ? 'Apple M' + m[1] + (m[2] ? ' ' + m[2] : '') : null;
}

// {name} for Apple hardware (model names are the same in every language) or {id} for a device
// class that t.deviceNames translates; null when nothing can be said.
export function guessDevice(b) {
  const ua = (b.userAgent || '').toLowerCase();
  const cores = b.hw?.hardwareConcurrency || 0;
  const mem = b.hw?.deviceMemory || 0;
  const touch = b.touch?.maxTouchPoints || 0;
  const w = b.screen?.w || 0;
  const h = b.screen?.h || 0;
  const dpr = b.screen?.pixelRatio || 1;
  const isMac = /mac os x|macintosh/.test(ua) || /macos/i.test(b.uaPlatform || '');
  const isWin = /windows nt/.test(ua) || /windows/i.test(b.uaPlatform || '');
  const isLinux = /linux/.test(ua) && !/android/.test(ua);
  const isIOS = /iphone|ipad/.test(ua);
  const isAndroid = /android/.test(ua);
  const chip = guessAppleChip(b.gl?.renderer || '') || '';
  const hasBattery = !!(b.battery && b.battery.level != null && !b.battery.unavailable);

  if (isIOS) {
    if (/ipad/.test(ua) || w >= 768) return { name: w >= 1024 && dpr >= 2 ? 'iPad Pro' : 'iPad' };
    if (w >= 430 || h >= 932) return { name: 'iPhone 15 Pro Max' };
    if (w >= 393 || h >= 852) return { name: 'iPhone 15 Pro' };
    return { name: 'iPhone' };
  }
  if (isAndroid) {
    if (touch > 0 && w < 768) return { id: mem >= 8 ? 'androidFlagship' : 'androidPhone' };
    return { id: touch > 0 ? 'androidTablet' : 'androidDevice' };
  }
  if (isMac) {
    if (/ultra/i.test(chip)) return { name: `Mac Studio (${chip})` };
    if (/max/i.test(chip)) return { name: `MacBook Pro ${cores >= 14 ? '16' : '14'}″ (${chip})` };
    if (/pro/i.test(chip)) return { name: `MacBook Pro ${cores >= 12 ? '16' : '14'}″ (${chip})` };
    if (hasBattery) return { name: `MacBook Air${chip ? ` (${chip})` : cores >= 8 && mem >= 16 ? ' (Apple Silicon)' : ''}` };
    if (cores >= 8 && chip) return { name: `iMac (${chip})` };
    if (cores >= 20) return { name: 'Mac Pro' };
    return { name: chip ? `Mac (${chip})` : 'Mac' };
  }
  if (isWin) {
    if (cores >= 16 && mem >= 32) return { id: 'windowsWorkstation' };
    if (cores >= 16 && mem >= 16) return { id: 'windowsPowerful' };
    if (cores >= 8) return { id: 'windowsPc' };
    if (mem <= 4 || cores <= 4) return { id: hasBattery ? 'windowsLaptop' : 'windowsBudget' };
    return { id: hasBattery ? 'windowsLaptop' : 'windowsPc' };
  }
  if (isLinux) return { id: 'linux' };
  return null;
}

// The device guess as text in the page's language.
export function deviceDisplayName(device, t) {
  if (!device) return null;
  if (device.name) return device.name;
  return t.deviceNames?.[device.id] || device.id;
}

export function deviceIcon(device) {
  if (!device) return '💻';
  if (device.id) return /phone|Tablet|Device/.test(device.id) ? '📱' : /Laptop/.test(device.id) ? '💻' : '🖥️';
  const lower = device.name.toLowerCase();
  if (/iphone|ipad/.test(lower)) return '📱';
  if (/macbook/.test(lower)) return '💻';
  return '🖥️';
}

const BROWSER_ICONS = { chrome: '🌐', firefox: '🦊', safari: '🧭', edge: '🌐', arc: '🌐', opera: '🌐', brave: '🦁' };
export function browserIcon(name) {
  const lower = (name || '').toLowerCase();
  for (const key of Object.keys(BROWSER_ICONS)) if (lower.includes(key)) return BROWSER_ICONS[key];
  return '';
}

// "ANGLE (Apple, Apple M2, OpenGL)" → "Apple M2"; "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)" → "NVIDIA, NVIDIA GeForce RTX 3060"
export function formatGpuRenderer(renderer) {
  if (!renderer) return '';
  const chip = guessAppleChip(renderer);
  if (chip) return chip;
  return renderer.replace(/^ANGLE \((.*)\)$/, '$1').replace(/Direct3D.+/i, '').replace(/OpenGL ES [0-9.]+/i, '').replace(/,\s*$/, '').trim();
}

/* ---- Places and flags ---- */

export const COUNTRY_NAMES = {
  US: { ru: 'США', en: 'USA', uz: 'AQSH' },
  GB: { ru: 'Великобритания', en: 'UK', uz: 'Buyuk Britaniya' },
  RU: { ru: 'Россия', en: 'Russia', uz: 'Rossiya' },
  UZ: { ru: 'Узбекистан', en: 'Uzbekistan', uz: 'Oʻzbekiston' },
  DE: { ru: 'Германия', en: 'Germany', uz: 'Germaniya' },
  FR: { ru: 'Франция', en: 'France', uz: 'Fransiya' },
  CN: { ru: 'Китай', en: 'China', uz: 'Xitoy' },
  IN: { ru: 'Индия', en: 'India', uz: 'Hindiston' },
  TR: { ru: 'Турция', en: 'Türkiye', uz: 'Turkiya' },
  KZ: { ru: 'Казахстан', en: 'Kazakhstan', uz: 'Qozogʻiston' },
  KG: { ru: 'Кыргызстан', en: 'Kyrgyzstan', uz: 'Qirgʻiziston' },
  TJ: { ru: 'Таджикистан', en: 'Tajikistan', uz: 'Tojikiston' }
};

export const CITY_NAMES = {
  Tashkent: { ru: 'Ташкент', uz: 'Toshkent' },
  Moscow: { ru: 'Москва', uz: 'Moskva' },
  Almaty: { ru: 'Алматы', uz: 'Olmaota' },
  Bishkek: { ru: 'Бишкек', uz: 'Bishkek' },
  'Saint Petersburg': { ru: 'Санкт-Петербург', uz: 'Sankt-Peterburg' }
};

const LANGUAGE_FLAGS = { en: '🇬🇧', ru: '🇷🇺', uz: '🇺🇿', uk: '🇺🇦', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', pt: '🇧🇷', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', ar: '🇸🇦', hi: '🇮🇳', tr: '🇹🇷', kk: '🇰🇿', ky: '🇰🇬', tg: '🇹🇯' };
export function langToFlag(code) {
  return LANGUAGE_FLAGS[String(code).split('-')[0].toLowerCase()] || '🏳️';
}

export function countryCodeToFlag(cc) {
  if (!cc || cc.length !== 2) return '';
  const a = cc.toUpperCase();
  return String.fromCodePoint(0x1F1E6 + a.charCodeAt(0) - 65, 0x1F1E6 + a.charCodeAt(1) - 65);
}
