// Small DOM helpers used by the render modules.

const cache = Object.create(null);

// document.getElementById with a cache: the page's elements never change identity.
export function getEl(id) {
  return cache[id] || (cache[id] = document.getElementById(id));
}

export function esc(value) {
  if (value == null || value === '') return '';
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function svgEscape(value) {
  return String(value || '').replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

// One "label: value" row of a data group. opts: {code} wraps the value in <code>, {badge: safe|warning|danger}
// shows it as a status badge, {html} inserts the value as given (already escaped by the caller).
export function mkRow(label, value, opts = {}) {
  const div = document.createElement('div');
  div.className = opts.badge ? 'data-row data-row--status' : 'data-row';
  const labelEl = document.createElement('span');
  labelEl.className = 'data-label';
  labelEl.textContent = label == null ? '' : String(label);
  const valueEl = document.createElement('span');
  valueEl.className = 'data-value';
  if (opts.html) valueEl.innerHTML = value;
  else if (opts.code) valueEl.innerHTML = '<code>' + esc(value) + '</code>';
  else if (opts.badge) {
    const cls = opts.badge === 'safe' ? 'status-badge--safe' : opts.badge === 'danger' ? 'status-badge--danger' : 'status-badge--warning';
    valueEl.innerHTML = '<span class="status-badge ' + cls + '">' + esc(value) + '</span>';
  } else valueEl.textContent = value == null ? '' : String(value);
  div.appendChild(labelEl);
  div.appendChild(valueEl);
  return div;
}

export function setText(id, text) {
  const el = getEl(id);
  if (el) el.textContent = text == null ? '' : String(text);
}

export function show(id, visible, display = '') {
  const el = getEl(id);
  if (el) el.style.display = visible ? display : 'none';
}

export async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  // Fallback for non-secure contexts (a local copy over http).
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    if (!document.execCommand('copy')) throw new Error('execCommand failed');
  } finally {
    document.body.removeChild(textarea);
  }
}
