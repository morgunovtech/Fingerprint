// Entry point: wires the controls, picks the language and theme, and renders the page.

import { APP_VERSION, LANG_FLAGS, LANG_KEY, THEME_KEY, VIEW_MODE_KEY } from './config.js';
import { getEl, esc } from './dom.js';
import { state, snapshot } from './state.js';
import { I18N, textsFor } from './i18n/index.js';
import { CHANGELOG } from './changelog.js';
import { getSnapshot } from './signals.js';
import { autoFetchIp, measureLatency, measureDownload, fetchScan, fetchVisitorStats, runWebRtcProbe } from './network.js';
import { runTrackerTests, renderTrackerTests } from './trackers.js';
import { updateHeroVerdict, renderDataRows, renderImplications, renderCards } from './report.js';
import { renderStoryMode } from './story.js';
import { renderScanRows, renderServerFingerprint } from './server-view.js';
import { resolveShareUrl, handleShareClick, handleSaveClick } from './share.js';

/* ---- Theme ---- */

const THEME_ICONS = { auto: '🌓', light: '☀️', dark: '🌙', contrast: '◑' };
let themePreference = 'auto';

function loadThemePreference() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored in THEME_ICONS) return stored;
  } catch (_) { /* ignore */ }
  return 'auto';
}

export function applyThemePreference(mode) {
  themePreference = mode in THEME_ICONS ? mode : 'auto';
  const root = document.documentElement;
  root.classList.remove('force-light', 'force-dark', 'force-contrast');
  if (themePreference !== 'auto') root.classList.add('force-' + themePreference);
  try { localStorage.setItem(THEME_KEY, themePreference); } catch (_) { /* ignore */ }
}

export function updateThemeButton(t) {
  const btn = getEl('themeBtn');
  if (!btn) return;
  const modes = t.theme?.modes || {};
  const prefix = t.theme?.label || 'Theme';
  btn.innerHTML = `<span class="menu-icon" aria-hidden="true">${THEME_ICONS[themePreference]}</span><span class="btn-text">${esc(prefix)}</span>`;
  btn.setAttribute('aria-label', `${prefix}: ${modes[themePreference] || themePreference}`);
  getEl('themeMenu')?.querySelectorAll('button[data-theme]').forEach(item => {
    const value = item.dataset.theme || '';
    item.setAttribute('aria-label', modes[value] || value);
    item.classList.toggle('active', value === themePreference);
  });
}

/* ---- Menus ---- */

const menus = { lang: false, theme: false };
function setMenu(name, open) {
  menus[name] = open;
  const btn = getEl(name + 'Btn');
  const menu = getEl(name + 'Menu');
  if (btn) btn.setAttribute('aria-expanded', String(open));
  if (menu) {
    menu.hidden = !open;
    menu.querySelectorAll('button').forEach(b => { b.tabIndex = open ? 0 : -1; });
  }
}

/* ---- Language ---- */

// /en/ is the English page (functions/en/index.js gives it English link-preview tags), so the
// address decides before a saved choice or the browser language.
export function langFromPath() {
  try { return /^\/en\/?$/.test(window.location.pathname) ? 'en' : null; } catch (_) { return null; }
}

// After an explicit choice the address follows it between / and /en/, so a copied or shared link
// opens with the preview in the language on screen.
export function syncLangPath(lang) {
  try {
    const { pathname, search, hash } = window.location;
    if (!/^\/(en\/?)?$/.test(pathname)) return;
    const next = lang === 'en' ? '/en/' : '/';
    if (next !== pathname) window.history.replaceState(null, '', next + search + hash);
  } catch (_) { /* ignore */ }
}

export function detectLang() {
  const fromPath = langFromPath();
  if (fromPath) return fromPath;
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) return saved;
    const n = navigator.language || 'ru';
    for (const code of ['ru', 'en', 'uz']) if (n.startsWith(code)) return code;
  } catch (_) { /* ignore */ }
  return 'ru';
}

function applyMeta(t) {
  const meta = t.meta || {};
  document.title = `${meta.title} — morgunov.tech`;
  for (const [id, value] of [['metaDescription', meta.description], ['ogTitle', meta.title], ['ogDescription', meta.description], ['twTitle', meta.title], ['twDescription', meta.description]]) {
    const el = document.getElementById(id);
    if (el) el.content = value || '';
  }
}

/* ---- Render ---- */

let renderToken = 0;
let probesStarted = false;

// Re-renders the parts that depend on data arriving later (IP, speed, trackers, WebRTC).
function renderDynamic(t) {
  const basic = snapshot.value?.basic;
  if (!basic) return;
  renderDataRows(basic, t);
  if (state.scan) renderScanRows(state.scan, t);
  renderImplications(basic, t);
  if (state.trackerResults) renderTrackerTests(state.trackerResults, t);
  if (state.viewMode === 'story') renderStoryMode(basic, t, snapshot.value);
}

// The tracker bait and the WebRTC probe run once per page view, after the first snapshot.
function startProbes() {
  if (probesStarted) return;
  probesStarted = true;
  runTrackerTests().then(results => { state.trackerResults = results; renderDynamic(textsFor(state.lang)); })
    .catch(err => console.warn('tracker tests failed', err));
  runWebRtcProbe().then(result => { state.webrtc = result; renderDynamic(textsFor(state.lang)); })
    .catch(err => console.warn('WebRTC probe failed', err));
}

function renderFooter(t) {
  const footerEl = getEl('footerText');
  if (!footerEl) return;
  footerEl.innerHTML = typeof t.footer === 'function' ? t.footer(APP_VERSION) : (t.footer || '');
  document.getElementById('versionBtn')?.addEventListener('click', e => { e.preventDefault(); openChangelog(); });
  updateFooterVisitCount(t);
}

function updateFooterVisitCount(t) {
  const n = state.stats?.total_visits || 0;
  const el = document.getElementById('footerVisitCount');
  if (!n || !el) return;
  el.textContent = typeof t.footerVisits === 'function' ? t.footerVisits(n) : String(n);
  el.style.display = '';
}

export async function render(lang) {
  const token = ++renderToken;
  const firstRender = renderToken === 1;
  const prevLang = state.lang;
  state.lang = lang in I18N ? lang : 'ru';
  const t = textsFor(state.lang);
  document.documentElement.lang = state.lang;
  applyMeta(t);
  if (prevLang !== state.lang) menus.lang = false;
  setMenu('lang', menus.lang);
  setMenu('theme', menus.theme);

  const langBtn = getEl('langBtn');
  if (langBtn) {
    langBtn.textContent = `${LANG_FLAGS[state.lang] || ''} ${t.langButton || 'Language'}`;
    langBtn.setAttribute('aria-label', t.langButton || 'Language');
  }
  getEl('langMenu')?.querySelectorAll('button[data-lang]').forEach(btn => {
    const value = btn.dataset.lang;
    btn.setAttribute('aria-label', t.langLabels?.[value] || btn.getAttribute('aria-label') || value);
    btn.classList.toggle('active', value === state.lang);
  });
  updateThemeButton(t);

  const shareBtn = getEl('shareBtn');
  if (shareBtn) {
    shareBtn.textContent = t.shareButton;
    shareBtn.dataset.label = t.shareButton;
    shareBtn.setAttribute('aria-label', t.shareButton);
    shareBtn.dataset.ready = '0';
    shareBtn.setAttribute('aria-disabled', 'true');
  }
  state.sharePayload = null;

  // The intro: the Russian copy lives in the markup (readable without JavaScript); the other
  // languages swap it in from their strings.
  const introTitleEl = getEl('introTitle');
  introTitleEl.textContent = t.introTitle || '';
  introTitleEl.classList.add('sr-only');
  getEl('introText').innerHTML = t.introRichHtml || '';

  getEl('detailTitle').textContent = t.detailTitle;
  getEl('shockTitle').textContent = t.shock.title;
  getEl('networkTitle').textContent = t.networkTitle || '';
  getEl('networkDesc').textContent = t.networkDesc || '';
  const netBtn = getEl('networkBtn');
  if (netBtn && !netBtn.disabled) netBtn.textContent = state.ipFetchDone ? (t.networkRecheck || '') : (t.networkButton || '');
  getEl('methodologyBtn').textContent = t.methodologyButton || '';
  getEl('printBtn').textContent = t.saveButton;
  getEl('printBtn').dataset.label = t.saveButton;
  renderFooter(t);
  setViewModeButton(t);
  fetchVisitorStats().then(() => { if (token === renderToken) { updateFooterVisitCount(t); renderDynamic(t); } });

  try {
    const snap = await getSnapshot();
    if (token !== renderToken) return;
    const { headline } = updateHeroVerdict(snap.pct, t, firstRender);
    renderDynamic(t);
    renderCards(snap, t);
    if (state.whoamiData) renderServerFingerprint(state.whoamiData, t);
    startProbes();

    const shareConfig = t.share || {};
    const url = resolveShareUrl();
    const pct = snap.pct;
    const text = typeof shareConfig.text === 'function' ? shareConfig.text({ pct, headline, url }) : `${headline}. ${shareConfig.tagline || ''}`.trim();
    const title = typeof shareConfig.title === 'function' ? shareConfig.title({ pct, headline }) : (shareConfig.title || shareConfig.tagline || headline);
    state.sharePayload = { pct, headline, text, url, title, tagline: shareConfig.tagline || '' };
    if (shareBtn) {
      shareBtn.dataset.ready = '1';
      shareBtn.removeAttribute('aria-disabled');
      shareBtn.setAttribute('aria-label', typeof shareConfig.aria === 'function' ? shareConfig.aria({ pct, headline }) : title);
    }
  } catch (e) {
    if (token !== renderToken) return;
    console.error(e);
    alert(t.errorMessage(e.message || String(e)));
  }
}

/* ---- Network check: IP, speed, scan, server fingerprint ---- */

function animateSpeedHero(targetMbps, latency, t) {
  const heroNumber = getEl('speedHeroNumber');
  const heroLabel = getEl('speedHeroLabel');
  const heroLatency = getEl('speedHeroLatency');
  if (!heroNumber) return;
  if (heroLabel) heroLabel.textContent = t.units?.mbps || 'Mbps';
  if (heroLatency && latency) heroLatency.textContent = `${t.speedTest?.latency || 'Latency'}: ${latency} ms`;
  const duration = 800;
  const start = performance.now();
  const from = parseFloat(heroNumber.textContent) || 0;
  const step = now => {
    const progress = Math.min((now - start) / duration, 1);
    const current = from + (targetMbps - from) * (1 - Math.pow(1 - progress, 3));
    heroNumber.textContent = (progress < 1 ? current : targetMbps).toFixed(1);
    if (progress < 1) requestAnimationFrame(step);
  };
  if (typeof requestAnimationFrame === 'function') requestAnimationFrame(step);
  else heroNumber.textContent = targetMbps.toFixed(1);
}

async function runSpeedTest(t) {
  const heroArea = getEl('speedHeroArea');
  const heroNumber = getEl('speedHeroNumber');
  const heroLabel = getEl('speedHeroLabel');
  const heroLatency = getEl('speedHeroLatency');
  if (!heroArea || !heroNumber) return;
  heroArea.style.display = '';
  heroNumber.textContent = '...';
  heroNumber.style.opacity = '0.5';
  if (heroLabel) heroLabel.textContent = t.speedTest?.testing || '';
  if (heroLatency) heroLatency.textContent = '';
  state.speed = { status: 'running', mbps: null, latency: null };
  try {
    const latency = await measureLatency();
    if (heroLatency) heroLatency.textContent = `${t.speedTest?.latency || 'Latency'}: ${latency} ms`;
    const mbps = await measureDownload(current => { heroNumber.textContent = current.toFixed(1); });
    heroNumber.style.opacity = '1';
    animateSpeedHero(mbps, latency, t);
    state.speed = { status: 'done', mbps, latency };
  } catch (e) {
    heroNumber.textContent = '—';
    heroNumber.style.opacity = '1';
    if (heroLabel) heroLabel.textContent = t.speedTest?.failed || 'Error';
    state.speed = { status: 'error', mbps: null, latency: null };
    console.warn('speed test failed:', e);
  }
}

export async function handleNetworkCheck() {
  const btn = getEl('networkBtn');
  const t = textsFor(state.lang);
  if (btn) { btn.disabled = true; btn.textContent = t.networkLoading || '…'; }
  const resultsEl = getEl('networkResults');
  if (resultsEl) resultsEl.style.display = '';
  try {
    const speedPromise = runSpeedTest(t);
    await autoFetchIp();
    state.ipFetchDone = true;
    renderDynamic(t);
    await speedPromise;
    renderDynamic(t);
    const ip = state.serverData?.ip || null;
    if (ip) {
      try {
        await fetchScan(ip);
        renderDynamic(t);
      } catch (e) {
        console.warn('scan failed:', e.message);
        const note = document.createElement('p');
        note.className = 'small network-error';
        note.textContent = t.osint?.error || '';
        getEl('groupNetwork')?.appendChild(note);
      }
    }
    if (state.whoamiData) renderServerFingerprint(state.whoamiData, t);
  } catch (e) {
    state.ipFetchDone = true;
    if (resultsEl) resultsEl.innerHTML = '<p class="small network-error">' + esc(t.networkError || e.message) + '</p>';
  } finally {
    if (btn) { btn.textContent = t.networkRecheck || t.networkButton || ''; btn.disabled = false; }
  }
}

/* ---- Changelog and methodology modals ---- */

function renderChangelog(lang) {
  const t = textsFor(lang);
  const content = document.getElementById('changelogContent');
  const heading = document.getElementById('changelogTitle');
  if (heading) heading.textContent = t.changelogTitle || '';
  if (!content) return;
  const frag = document.createDocumentFragment();
  for (const entry of CHANGELOG) {
    const section = document.createElement('div');
    section.className = 'changelog-entry';
    const header = document.createElement('div');
    header.className = 'changelog-header';
    const ver = document.createElement('strong');
    ver.textContent = `v${entry.version}`;
    const date = document.createElement('span');
    date.textContent = entry.date;
    header.appendChild(ver);
    header.appendChild(date);
    section.appendChild(header);
    const ul = document.createElement('ul');
    for (const item of entry.changes[lang] || entry.changes.en || []) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    }
    section.appendChild(ul);
    frag.appendChild(section);
  }
  content.innerHTML = '';
  content.appendChild(frag);
}

function openChangelog() {
  const modal = document.getElementById('changelogModal');
  if (!modal) return;
  renderChangelog(state.lang);
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  document.getElementById('changelogClose')?.focus();
}

function closeChangelog() {
  const modal = document.getElementById('changelogModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ---- View mode ---- */

function setViewModeButton(t) {
  const btn = getEl('viewModeBtn');
  if (!btn) return;
  const story = t.story || {};
  const label = state.viewMode === 'report' ? (story.toggleStory || '📖 Story') : (story.toggleReport || '📊 Report');
  btn.textContent = label;
  btn.classList.toggle('view-mode-active', state.viewMode === 'story');
}

function setViewMode(mode) {
  state.viewMode = mode === 'story' ? 'story' : 'report';
  try { localStorage.setItem(VIEW_MODE_KEY, state.viewMode); } catch (_) { /* ignore */ }
  const reportEl = getEl('reportMode');
  const storyEl = getEl('storyMode');
  if (reportEl) reportEl.style.display = state.viewMode === 'report' ? '' : 'none';
  if (storyEl) storyEl.style.display = state.viewMode === 'story' ? '' : 'none';
  const t = textsFor(state.lang);
  setViewModeButton(t);
  if (state.viewMode === 'story' && snapshot.value) renderStoryMode(snapshot.value.basic, t, snapshot.value);
}

/* ---- Start ---- */

export function initApp() {
  // The Russian intro is the one in the markup; the strings table reads it once from there.
  I18N.ru.introRichHtml = getEl('introText')?.innerHTML || '';
  applyThemePreference(loadThemePreference());
  const lang = detectLang();
  // Opening /en/ is not a choice: the saved language stays for the next visit to /.
  if (!langFromPath()) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ } }

  getEl('shareBtn')?.addEventListener('click', () => { handleShareClick().catch(() => {}); });
  getEl('printBtn')?.addEventListener('click', () => { handleSaveClick().catch(() => {}); });

  const langBtn = getEl('langBtn');
  const langMenu = getEl('langMenu');
  if (langBtn && langMenu) {
    langBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setMenu('theme', false);
      setMenu('lang', !menus.lang);
    });
    langMenu.querySelectorAll('button[data-lang]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        const value = btn.dataset.lang;
        if (!value) return;
        setMenu('lang', false);
        try { localStorage.setItem(LANG_KEY, value); } catch (_) { /* ignore */ }
        syncLangPath(value);
        langBtn.focus({ preventScroll: true });
        render(value);
      });
    });
  }
  const themeBtn = getEl('themeBtn');
  const themeMenu = getEl('themeMenu');
  if (themeBtn && themeMenu) {
    themeBtn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      setMenu('lang', false);
      setMenu('theme', !menus.theme);
    });
    themeMenu.querySelectorAll('button[data-theme]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (!btn.dataset.theme) return;
        applyThemePreference(btn.dataset.theme);
        updateThemeButton(textsFor(state.lang));
        setMenu('theme', false);
        themeBtn.focus({ preventScroll: true });
      });
    });
  }
  document.addEventListener('click', event => {
    if (menus.lang && langMenu && !(langMenu.contains(event.target) || event.target === langBtn)) setMenu('lang', false);
    if (menus.theme && themeMenu && !(themeMenu.contains(event.target) || event.target === themeBtn)) setMenu('theme', false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { setMenu('lang', false); setMenu('theme', false); closeChangelog(); }
  });
  document.getElementById('changelogClose')?.addEventListener('click', closeChangelog);
  document.getElementById('changelogModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeChangelog(); });

  const methodBtn = getEl('methodologyBtn');
  const methodModal = getEl('methodologyModal');
  if (methodBtn) {
    methodBtn.style.display = 'inline-flex';
    methodBtn.addEventListener('click', () => {
      const t = textsFor(state.lang);
      // Both texts come from the page's own strings, not from user input.
      getEl('methodologyTitle').innerHTML = t.methodSummary || '';
      getEl('methodologyBody').innerHTML = t.methodText || '';
      if (methodModal) methodModal.style.display = 'flex';
    });
  }
  getEl('methodologyClose')?.addEventListener('click', () => { if (methodModal) methodModal.style.display = 'none'; });
  methodModal?.addEventListener('click', e => { if (e.target === methodModal) methodModal.style.display = 'none'; });

  getEl('networkBtn')?.addEventListener('click', handleNetworkCheck);

  try { const saved = localStorage.getItem(VIEW_MODE_KEY); if (saved === 'story' || saved === 'report') state.viewMode = saved; } catch (_) { /* ignore */ }
  if (new URLSearchParams(window.location.search).get('mode') === 'story') state.viewMode = 'story';
  getEl('viewModeBtn')?.addEventListener('click', () => setViewMode(state.viewMode === 'report' ? 'story' : 'report'));
  state.lang = lang;
  setViewMode(state.viewMode);
  render(lang);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
