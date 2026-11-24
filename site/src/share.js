// The "Share" and "Print / Save" buttons.

import { CANONICAL_URL } from './config.js';
import { getEl, svgEscape, copyText } from './dom.js';
import { state } from './state.js';
import { textsFor } from './i18n/index.js';
import { IS_IOS, IS_ANDROID } from './signals.js';

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

export function createShareCardSvg(payload, t) {
  const width = 1200, height = 630;
  const pct = Math.round(payload.pct || 0);
  const font = "font-family=\"'Inter','Segoe UI',sans-serif\"";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0f172a" />
      <stop offset="1" stop-color="#111827" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="36" fill="url(#bg)" />
  <text x="72" y="120" fill="#60a5fa" font-size="42" ${font} font-weight="600">${svgEscape(t.share?.tagline || 'Fingerprint by morgunov.tech')}</text>
  <text x="72" y="210" fill="#f8fafc" font-size="64" ${font} font-weight="700">${svgEscape(payload.headline || 'Fingerprint snapshot')}</text>
  <text x="72" y="280" fill="#cbd5f5" font-size="30" ${font} font-weight="500">${svgEscape(payload.tagline || '')}</text>
  <g>
    <circle cx="1020" cy="240" r="140" fill="rgba(96,165,250,0.15)" />
    <text x="940" y="250" fill="#60a5fa" font-size="120" ${font} font-weight="700">${pct}%</text>
  </g>
  <text x="72" y="520" fill="#64748b" font-size="26" ${font}>${svgEscape(payload.url || CANONICAL_URL)}</text>
</svg>`;
}

function flashMessage(btn, message, isError) {
  const original = btn.dataset.label || btn.textContent;
  btn.textContent = message;
  btn.style.background = isError ? 'var(--warning,#f59e0b)' : 'var(--success,#22c55e)';
  btn.style.color = '#fff';
  setTimeout(() => {
    btn.textContent = btn.dataset.label || original;
    btn.style.background = '';
    btn.style.color = '';
  }, 2000);
}

let cachedCard = { key: null, file: null };

export async function handleShareClick() {
  const btn = getEl('shareBtn');
  if (!btn || btn.getAttribute('aria-disabled') === 'true') return;
  const t = textsFor(state.lang);
  const payload = state.sharePayload;
  if (!payload) {
    flashMessage(btn, t.share?.unavailable || t.saveButton, true);
    return;
  }
  btn.disabled = true;
  const shareText = `${payload.text}\n${payload.url}`;
  // Copy first, while the user activation is still alive (Arc and Chromium drop it after an await).
  let clipboardOk = false;
  try { await copyText(shareText); clipboardOk = true; } catch (_) { /* try again below */ }
  try {
    let shared = false;
    if (typeof navigator.share === 'function') {
      const baseData = { title: payload.title, text: payload.text, url: payload.url };
      let file = null;
      if (typeof File === 'function') {
        try {
          const key = `${payload.pct}|${payload.headline}|${state.lang}`;
          if (cachedCard.key !== key) cachedCard = { key, file: new File([createShareCardSvg(payload, t)], 'fingerprint-share.svg', { type: 'image/svg+xml' }) };
          file = cachedCard.file;
        } catch (_) { file = null; }
      }
      if (file) {
        const richData = { ...baseData, files: [file] };
        try {
          if (typeof navigator.canShare === 'function' && navigator.canShare(richData)) { await navigator.share(richData); shared = true; }
        } catch (_) { /* fall through to the plain share */ }
      }
      if (!shared) {
        try { await navigator.share(baseData); shared = true; } catch (_) { /* fall through to the clipboard */ }
      }
    }
    if (shared) { flashMessage(btn, t.share?.shared || t.copy?.done || 'Shared!'); return; }
    if (!clipboardOk) await copyText(shareText);
    flashMessage(btn, t.share?.copied || t.copy?.done || 'Copied!');
  } catch (err) {
    if (clipboardOk) flashMessage(btn, t.share?.copied || t.copy?.done || 'Copied!');
    else { console.error('share failed', err); flashMessage(btn, t.share?.error || 'Error', true); }
  } finally {
    btn.disabled = false;
  }
}

// A static copy of the page as it is now: the stylesheet inlined, the scripts dropped, so the
// saved file shows this report instead of running a new check.
async function snapshotHtml() {
  const doc = document.documentElement.cloneNode(true);
  doc.querySelectorAll('script').forEach(el => el.remove());
  for (const link of doc.querySelectorAll('link[rel="stylesheet"]')) {
    try {
      const css = await (await fetch(link.getAttribute('href'))).text();
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
      const payload = file ? { files: [file], title: 'Fingerprint snapshot' } : { title: 'Fingerprint snapshot', text: html };
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
