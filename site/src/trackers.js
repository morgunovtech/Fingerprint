// The tracker simulation (three ad-blocker bait elements plus the DNT and GPC settings) and the
// consistency check of the browser's own data.

import { getEl } from './dom.js';
import { state } from './state.js';

// Each bait is a hidden element with the class names ad blockers hide; after half a second the
// element is either still laid out or hidden by a cosmetic filter. Nothing is loaded from anywhere.
function baitTest(id, setup) {
  return new Promise(resolve => {
    const el = document.createElement('div');
    setup(el);
    el.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;top:-9999px';
    document.body.appendChild(el);
    setTimeout(() => {
      let blocked = false;
      try {
        const cs = window.getComputedStyle(el);
        blocked = el.offsetHeight === 0 || el.clientHeight === 0 || cs.display === 'none' || cs.visibility === 'hidden';
      } catch (_) { /* treat as not blocked */ }
      document.body.removeChild(el);
      resolve({ id, blocked });
    }, 500);
  });
}

export async function runTrackerTests() {
  const results = [];
  results.push(await baitTest('pixel', el => { el.className = 'ad_banner ad-banner adsbygoogle'; }));
  results.push(await baitTest('analytics', el => { el.id = 'google_ads_frame'; el.className = 'adsbox'; el.innerHTML = '&nbsp;'; }));
  results.push(await baitTest('iframe', el => { el.className = 'ad-placement sponsored-banner'; el.innerHTML = '<span>ad</span>'; }));
  results.push({ id: 'dnt', blocked: navigator.doNotTrack === '1' || window.doNotTrack === '1' });
  results.push({ id: 'gpc', blocked: navigator.globalPrivacyControl === true });
  return results;
}

export function renderTrackerTests(results, t) {
  const section = getEl('trackerSection');
  const container = getEl('trackerResults');
  const tt = t.trackers;
  if (!section || !container || !tt) return;
  getEl('trackerTitle').textContent = tt.title;
  container.innerHTML = '';
  if (tt.description) {
    const descP = document.createElement('p');
    descP.className = 'small';
    descP.style.marginBottom = '12px';
    descP.textContent = tt.description;
    container.appendChild(descP);
  }
  let blockedCount = 0;
  for (const r of results) {
    const meta = tt[r.id];
    if (!meta) continue;
    if (r.blocked) blockedCount++;
    const row = document.createElement('div');
    row.className = 'tracker-row';
    const badge = document.createElement('span');
    badge.className = 'tracker-badge ' + (r.blocked ? 'tracker-badge--blocked' : 'tracker-badge--open');
    badge.textContent = r.blocked ? meta.blocked : meta.open;
    const textWrap = document.createElement('div');
    textWrap.className = 'tracker-text';
    const nameEl = document.createElement('div');
    nameEl.className = 'tracker-name';
    nameEl.textContent = meta.name;
    textWrap.appendChild(nameEl);
    const explain = tt[r.id + 'Explain'];
    if (explain) {
      const explainEl = document.createElement('div');
      explainEl.className = 'tracker-explain';
      explainEl.textContent = explain;
      textWrap.appendChild(explainEl);
    }
    row.appendChild(badge);
    row.appendChild(textWrap);
    container.appendChild(row);
  }
  const verdictEl = getEl('trackerVerdict');
  if (verdictEl && typeof tt.verdict === 'function') verdictEl.textContent = tt.verdict(blockedCount, results.length);
  section.style.display = '';
}

// Signs that the browser's data is spoofed or contradicts itself.
export function checkSpoofing() {
  const issues = [];
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const uaWin = /Windows/i.test(ua), uaMac = /Macintosh|Mac OS/i.test(ua), uaAndroid = /Android/i.test(ua);
  const uaLinux = /Linux/i.test(ua) && !uaAndroid;
  if ((uaWin && !/Win/i.test(platform)) || (uaMac && !/Mac/i.test(platform)) || (uaLinux && !/Linux/i.test(platform))) issues.push('ua_platform');
  // Canvas randomisation: the same drawing twice gives two different images.
  try {
    const draw = () => {
      const c = document.createElement('canvas');
      c.width = 200; c.height = 50;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#f60'; ctx.fillRect(10, 10, 100, 30);
      ctx.fillStyle = '#069'; ctx.font = '14px Arial'; ctx.fillText('Fingerprint test', 2, 15);
      return c.toDataURL();
    };
    if (draw() !== draw()) issues.push('canvas_randomized');
  } catch (_) { /* ignore */ }
  // The IP's time zone and the browser's are on different continents.
  const ipTz = state.serverData?.details?.timezone || '';
  let browserTz = '';
  try { browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) { /* ignore */ }
  if (ipTz && browserTz && (ipTz.split('/')[0] || '') !== (browserTz.split('/')[0] || '')) issues.push('tz_mismatch');
  const dpr = window.devicePixelRatio || 1;
  if (dpr >= 2 && (screen.width || 0) < 1000 && (screen.height || 0) < 700) issues.push('screen_dpr');
  if (navigator.webdriver === true) issues.push('webdriver');
  return { consistent: issues.length === 0, issues };
}
