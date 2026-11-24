// Entry point: wires the controls, picks the language and theme, and renders the walk.

import { APP_VERSION, LANG_FLAGS, LANG_KEY, THEME_KEY } from './config.js';
import { getEl, esc } from './dom.js';
import { state, snapshot } from './state.js';
import { I18N, textsFor } from './i18n/index.js';
import { CHANGELOG } from './changelog.js';
import { getSnapshot } from './signals.js';
import { autoFetchIp, fetchScan, fetchVisitorStats, runWebRtcProbe } from './network.js';
import { runTrackerTests } from './trackers.js';
import { renderWalk } from './walk.js';
import { handleShareClick, handleSaveClick } from './share.js';

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

// The ad-blocker check and the WebRTC probe run once per page view, after the first snapshot.
function startProbes() {
  if (probesStarted) return;
  probesStarted = true;
  runTrackerTests().then(results => { state.trackerResults = results; renderWalk(textsFor(state.lang)); })
    .catch(err => console.warn('tracker tests failed', err));
  runWebRtcProbe().then(result => { state.webrtc = result; renderWalk(textsFor(state.lang)); })
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

  // The intro: the Russian copy lives in the markup (readable without JavaScript); the other
  // languages swap it in from their strings.
  const introTitleEl = getEl('introTitle');
  if (introTitleEl) introTitleEl.textContent = t.introTitle || '';
  const introTextEl = getEl('introText');
  if (introTextEl) introTextEl.innerHTML = t.introRichHtml || '';
  const detailTitle = getEl('detailTitle');
  if (detailTitle) detailTitle.textContent = t.details.title;
  renderFooter(t);
  state.sharePayload = null;
  fetchVisitorStats().then(() => { if (token === renderToken && snapshot.value) { updateFooterVisitCount(t); renderWalk(t); } });

  try {
    await getSnapshot();
    if (token !== renderToken) return;
    renderWalk(t);
    startProbes();
  } catch (e) {
    if (token !== renderToken) return;
    console.error(e);
    alert(t.errorMessage(e.message || String(e)));
  }
}

/* ---- The network check (the button at step 3) ---- */

export async function handleNetworkCheck() {
  if (state.networkStatus === 'loading') return;
  const t = textsFor(state.lang);
  state.networkStatus = 'loading';
  renderWalk(t);
  try {
    state.serverData = null;
    state.scan = null;
    const data = await autoFetchIp();
    if (!data) throw new Error('no answer');
    state.ipFetchDone = true;
    try { await fetchScan(data.ip); } catch (e) { console.warn('scan failed:', e.message); }
    state.networkStatus = 'done';
  } catch (e) {
    state.networkStatus = 'failed';
    console.warn('network check failed:', e.message);
  }
  renderWalk(textsFor(state.lang));
  if (state.networkStatus === 'done') getEl('step-3')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
}

/* ---- Changelog modal ---- */

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

/* ---- Start ---- */

export function initApp() {
  // The Russian intro is the one in the markup; the strings table reads it once from there.
  I18N.ru.introRichHtml = getEl('introText')?.innerHTML || '';
  applyThemePreference(loadThemePreference());
  const lang = detectLang();
  // Opening /en/ is not a choice: the saved language stays for the next visit to /.
  if (!langFromPath()) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ } }

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

  // The walk re-renders itself, so its buttons are handled by their data-action, not by element.
  getEl('walk')?.addEventListener('click', event => {
    const btn = event.target?.closest?.('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'check-network') handleNetworkCheck();
    else if (action === 'share') handleShareClick(btn).catch(() => {});
    else if (action === 'save') handleSaveClick().catch(() => {});
  });

  state.lang = lang;
  render(lang);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
