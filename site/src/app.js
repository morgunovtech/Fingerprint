// Entry point: wires the controls, picks the language, and renders the walk.

import { APP_VERSION, LANG_KEY } from './config.js?v=3.3.3';
import { getEl, esc } from './dom.js?v=3.3.3';
import { state, snapshot } from './state.js?v=3.3.3';
import { I18N, textsFor } from './i18n/index.js?v=3.3.3';
import { getSnapshot } from './signals.js?v=3.3.3';
import { autoFetchIp, fetchScan, fetchVisitorStats, runWebRtcProbe } from './network.js?v=3.3.3';
import { runTrackerTests } from './trackers.js?v=3.3.3';
import { renderWalk } from './walk.js?v=3.3.3';
import { handleShareClick, handleSaveClick } from './share.js?v=3.3.3';

/* ---- The family chrome ---- */

// The bar, the language and theme menus and the footer are the morgunov.tech chrome (ds/v1/USAGE.md
// in about-me-page, "Service chrome"). src/chrome.js, a copy of the design system's script, opens
// and closes the menus and owns the theme: data-theme and data-theme-preference on <html>, the
// choice under the theme-preference key, the checked item of the theme menu. This module only puts
// the chrome's words into the page's language, which changes in place, and switches the language.
export function labelChrome(t) {
  const c = t.chrome || {};
  const skip = getEl('skipLink');
  if (skip) skip.textContent = c.skip || '';
  const code = state.lang.toUpperCase();
  const langCode = getEl('langCode');
  if (langCode) langCode.textContent = code;
  getEl('lang-toggle')?.setAttribute('aria-label', `${code} — ${c.changeLanguage || ''}`);
  getEl('lang-menu')?.querySelectorAll('[data-lang]').forEach(item => {
    item.setAttribute('aria-checked', String(item.dataset.lang === state.lang));
  });
  getEl('theme-toggle')?.setAttribute('aria-label', c.changeTheme || '');
  const modes = t.theme?.modes || {};
  getEl('theme-menu')?.querySelectorAll('[data-theme-value]').forEach(item => {
    const value = item.dataset.themeValue || '';
    item.textContent = modes[value] || value;
  });
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
  if (footerEl) footerEl.innerHTML = typeof t.footer === 'function' ? t.footer(APP_VERSION) : (t.footer || '');
  const note = getEl('pageNote');
  if (note) note.textContent = t.pageNote || '';
  updateFooterVisitCount(t);
}

function updateFooterVisitCount(t) {
  const n = state.stats?.total_visits || 0;
  const el = document.getElementById('footerVisitCount');
  if (!n || !el) return;
  el.textContent = typeof t.footerVisits === 'function' ? t.footerVisits(n) : String(n);
  el.hidden = false;
}

export async function render(lang) {
  const token = ++renderToken;
  state.lang = lang in I18N ? lang : 'ru';
  const t = textsFor(state.lang);
  document.documentElement.lang = state.lang;
  applyMeta(t);
  // The language button shows the current code; the menu names the languages in their own words
  // (the markup) and marks the current one.
  labelChrome(t);

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

/* ---- Start ---- */

export function initApp() {
  // The Russian intro is the one in the markup; the strings table reads it once from there.
  I18N.ru.introRichHtml = getEl('introText')?.innerHTML || '';
  const lang = detectLang();
  // Opening /en/ is not a choice: the saved language stays for the next visit to /.
  if (!langFromPath()) { try { localStorage.setItem(LANG_KEY, lang); } catch (_) { /* ignore */ } }

  // The language switches in place: the items for / and /en/ are links, but the page re-renders
  // instead of loading again, and the address follows. src/chrome.js closes the menu.
  getEl('lang-menu')?.querySelectorAll('[data-lang]').forEach(item => {
    item.addEventListener('click', event => {
      event.preventDefault();
      const value = item.dataset.lang;
      if (!value) return;
      try { localStorage.setItem(LANG_KEY, value); } catch (_) { /* ignore */ }
      syncLangPath(value);
      render(value).catch(e => console.error(e));
    });
  });
  // The walk re-renders itself, so its buttons are handled by their data-action, not by element.
  getEl('walk')?.addEventListener('click', event => {
    const btn = event.target?.closest?.('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'check-network') handleNetworkCheck().catch(e => console.error(e));
    else if (action === 'share') handleShareClick(btn).catch(() => {});
    else if (action === 'save') handleSaveClick().catch(() => {});
  });

  state.lang = lang;
  render(lang).catch(e => console.error(e));
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
