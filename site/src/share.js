// The "Share" and "Print / Save" buttons.

import { CANONICAL_URL } from './config.js?v=3.3.0';
import { copyText } from './dom.js?v=3.3.0';
import { state } from './state.js?v=3.3.0';
import { textsFor } from './i18n/index.js?v=3.3.0';
import { IS_IOS, IS_ANDROID } from './signals.js?v=3.3.0';

// The page's own address without index.html or a trailing slash, for the share text.
export function resolveShareUrl() {
  try {
    const { origin, pathname } = window.location;
    if (origin && origin !== 'null' && origin.startsWith('http')) {
      const base = `${origin}${pathname.replace(/index\.html$/, '')}`.replace(/\/$/, '');
      return base || origin;
    }
  } catch (_) { /* ignore */ }
  return CANONICAL_URL;
}

function flashMessage(btn, message, isError) {
  const original = btn.dataset.label || btn.textContent;
  btn.textContent = message;
  btn.classList.add(isError ? 'btn--flash-error' : 'btn--flash-ok');
  setTimeout(() => {
    btn.textContent = btn.dataset.label || original;
    btn.classList.remove('btn--flash-error', 'btn--flash-ok');
  }, 2000);
}

// state.sharePayload: {text, title, url}, set by the walk once the summary is rendered. The walk
// re-renders its buttons, so the one that was clicked comes from the event, not from a cache.
export async function handleShareClick(clicked) {
  const btn = clicked || document.getElementById('shareBtn');
  if (!btn) return;
  const t = textsFor(state.lang);
  const payload = state.sharePayload;
  if (!payload) {
    flashMessage(btn, t.summary.share.unavailable, true);
    return;
  }
  btn.disabled = true;
  // Copy first, while the user activation is still alive (Arc and Chromium drop it after an await).
  let clipboardOk = false;
  try { await copyText(payload.text); clipboardOk = true; } catch (_) { /* try again below */ }
  try {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: payload.title, text: payload.text, url: payload.url });
        flashMessage(btn, t.summary.share.shared);
        return;
      } catch (_) { /* fall through to the clipboard */ }
    }
    if (!clipboardOk) await copyText(payload.text);
    flashMessage(btn, t.summary.share.copied);
  } catch (err) {
    if (clipboardOk) flashMessage(btn, t.summary.share.copied);
    else { console.error('share failed', err); flashMessage(btn, t.summary.share.error, true); }
  } finally {
    btn.disabled = false;
  }
}

// A static copy of the page as it is now: the stylesheet inlined, the scripts dropped, so the
// saved file shows this walk instead of running a new one.
async function snapshotHtml() {
  const doc = document.documentElement.cloneNode(true);
  doc.querySelectorAll('script').forEach(el => el.remove());
  for (const link of doc.querySelectorAll('link[rel="stylesheet"]')) {
    try {
      const href = link.getAttribute('href');
      let css = await (await fetch(href)).text();
      // The design system's stylesheets come from s.morgunov.tech and name their fonts by absolute
      // path; in the saved file those paths get the stylesheet's origin, so the fonts still load.
      const origin = new URL(href, window.location.href).origin;
      if (origin !== window.location.origin) css = css.replace(/url\((['"]?)\//g, `url($1${origin}/`);
      const style = document.createElement('style');
      style.textContent = css;
      link.replaceWith(style);
    } catch (_) { /* keep the link */ }
  }
  return '<!DOCTYPE html>\n' + doc.outerHTML;
}

export async function handleSaveClick() {
  const filename = `fingerprint-${new Date().toISOString().slice(0, 10)}.html`;
  if (!IS_IOS && !IS_ANDROID && typeof window.print === 'function') {
    try { window.print(); return; } catch (_) { /* fall back to a download */ }
  }
  const html = await snapshotHtml();
  const blob = new Blob([html], { type: 'text/html' });
  if (IS_IOS && typeof navigator.share === 'function') {
    try {
      const file = typeof File === 'function' ? new File([blob], filename, { type: 'text/html' }) : null;
      const payload = file ? { files: [file], title: 'Fingerprint' } : { title: 'Fingerprint', text: html };
      let canShare = true;
      if (typeof navigator.canShare === 'function') { try { canShare = navigator.canShare(payload); } catch (_) { canShare = false; } }
      if (canShare) { await navigator.share(payload); return; }
    } catch (_) { /* fall back to a download */ }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
