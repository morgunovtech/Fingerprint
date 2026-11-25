// The walk: six steps from opening the device to a loaded site, each on the visitor's real data,
// then the sum of who learned what and the raw data for the curious.

import { getEl, esc, mkRow } from './dom.js?v=3.3.0';
import { state, snapshot } from './state.js?v=3.3.0';
import { guessDevice, deviceDisplayName, deviceKind, osFamilyOf, osVendorKey, browserDisplayName, browserVendorKey, guessOSVersion, formatGpuRenderer, detectBrowserGroup, COUNTRY_NAMES, CITY_NAMES, countryCodeToFlag, langToFlag } from './device.js?v=3.3.0';
import { resolveCountryCode, getStatPercent } from './network.js?v=3.3.0';
import { blockerDetected, trackerRows } from './trackers.js?v=3.3.0';
import { LOCAL_TZ } from './signals.js?v=3.3.0';
import { resolveShareUrl } from './share.js?v=3.3.0';

const browserGroup = detectBrowserGroup();
// Which <details> the visitor opened, so a re-render keeps them open.
const openDetails = new Set();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function detailsBlock(id, summaryText, bodyText) {
  const details = el('details', 'step-expand');
  details.id = id;
  if (openDetails.has(id)) details.open = true;
  details.addEventListener('toggle', () => { if (details.open) openDetails.add(id); else openDetails.delete(id); });
  details.appendChild(el('summary', null, summaryText));
  details.appendChild(el('p', 'step-expand-body', bodyText));
  return details;
}

// One chip of "who learns this": a name and a short note.
function partyChip(name, note) {
  const chip = el('span', 'party');
  chip.appendChild(el('b', null, name));
  if (note) chip.appendChild(el('span', 'party-note', note));
  return chip;
}

// Appends rows to a group; rows: [label, value, opts] (a null value skips the row).
function appendRows(group, rows) {
  for (const [label, value, opts] of rows) {
    if (value == null || value === '') continue;
    group.appendChild(mkRow(label, value, opts));
  }
}

// A group of rows with a heading.
function rowGroup(title, rows, note) {
  const group = el('div', 'data-group');
  if (title) group.appendChild(el('h3', null, title));
  appendRows(group, rows);
  if (note) group.appendChild(el('p', 'group-note', note));
  return group;
}

function renderStep(container, step) {
  const section = el('section', 'step');
  section.id = `step-${step.num}`;
  section.setAttribute('data-step', step.num);
  const head = el('div', 'step-head');
  head.appendChild(el('div', 'step-num', step.label));
  head.appendChild(el('h2', 'step-title', step.title));
  if (step.subtitle) head.appendChild(el('p', 'step-subtitle', step.subtitle));
  section.appendChild(head);
  if (step.lead) section.appendChild(el('p', 'step-lead', step.lead));
  if (step.who?.length) {
    const who = el('div', 'step-who');
    who.appendChild(el('span', 'step-who-label', step.whoLabel));
    for (const [name, note] of step.who) who.appendChild(partyChip(name, note));
    section.appendChild(who);
  }
  for (const block of step.blocks || []) {
    if (block.node) section.appendChild(block.node);
    else section.appendChild(rowGroup(block.title, block.rows, block.note));
  }
  if (step.how) section.appendChild(detailsBlock(`s${step.num}-how`, step.howLabel, step.how));
  if (step.danger) section.appendChild(detailsBlock(`s${step.num}-danger`, step.dangerLabel, step.danger));
  if (step.action) {
    const action = el('div', 'step-action');
    action.appendChild(el('b', null, step.actionLabel));
    action.appendChild(el('p', null, step.action));
    section.appendChild(action);
  }
  container.appendChild(section);
}

/* ---- The data each step shows ---- */

function placeOfIp(t) {
  const d = state.serverData;
  if (!d) return null;
  const details = d.details || {};
  const rawCity = details.city || d.geo?.city || '';
  const rawCountry = details.country_name || d.geo?.country || '';
  const code = resolveCountryCode(details, d.raw, d.geo) || '';
  const city = CITY_NAMES[rawCity]?.[state.lang] || rawCity;
  const country = COUNTRY_NAMES[code.toUpperCase()]?.[state.lang] || rawCountry;
  if (!city && !country) return null;
  return `${code ? countryCodeToFlag(code) + ' ' : ''}${[city, country].filter(Boolean).join(', ')}`;
}

function ispName() {
  return state.scan?.geolocation?.isp || state.serverData?.details?.org || null;
}

function vpnLikely(basic) {
  const details = state.serverData?.details || {};
  const tzMismatch = details.timezone && basic.timezone && (details.timezone.split('/')[0] || '') !== (basic.timezone.split('/')[0] || '');
  return Boolean(tzMismatch || state.vpn?.status === 'likely' || ['vpn', 'datacenter'].includes(String(state.scan?.geolocation?.connection_type || '').toLowerCase()));
}

function connectionKind(basic) {
  const scanned = String(state.scan?.geolocation?.connection_type || '').toLowerCase();
  if (scanned === 'mobile') return 'cellular';
  const type = String(basic.net?.type || '').toLowerCase();
  if (type === 'cellular') return 'cellular';
  if (type === 'wifi') return 'wifi';
  return 'other';
}

function yesNo(t, value) {
  return value ? t.rows.yes : t.rows.no;
}

function buildSteps(basic, t) {
  const r = t.rows, p = t.parties, s = t.steps, labels = t.labels;
  const device = guessDevice(basic);
  const deviceName = deviceDisplayName(device, t) || '—';
  const kind = deviceKind(device, basic);
  const osLabel = guessOSVersion(basic);
  const family = osFamilyOf(basic);
  const osVendor = osVendorKey(family);
  const osVendorName = osVendor ? t.vendors[osVendor] : null;
  const browserFull = browserDisplayName(basic);
  const browserName = browserFull.replace(/\s+\d+$/, '');
  const browserVendor = browserVendorKey(browserName);
  const browserVendorName = browserVendor ? t.vendors[browserVendor] : null;
  const checked = Boolean(state.serverData);
  const isp = ispName();
  const hints = basic.uaHighEntropy || {};
  const net = state.whoamiData?.network || {};
  const whoHeaders = state.whoamiData?.headers || {};
  const ch = whoHeaders.client_hints || null;
  const conn = connectionKind(basic);
  const common = { whoLabel: labels.who, howLabel: labels.how, dangerLabel: labels.danger, actionLabel: labels.action };

  const steps = [];

  // 1. The device
  const batteryText = basic.battery && basic.battery.level != null && !basic.battery.unavailable
    ? `${Math.round(basic.battery.level * 100)}%${basic.battery.charging ? r.charging : ''}` : null;
  steps.push({
    ...common, num: 1, label: t.stepLabel(1), title: s.s1.title[kind] || s.s1.title.laptop, subtitle: s.s1.subtitle,
    who: [[p.nobody, p.nobodyNote]],
    blocks: [{ title: labels.measured, rows: [
      [r.device, deviceName],
      [r.screen, `${basic.screen.w}×${basic.screen.h}`],
      [r.gpu, formatGpuRenderer(basic.gl?.renderer) || null],
      [r.memory, basic.hw?.deviceMemory ? r.memoryValue(basic.hw.deviceMemory) : null],
      [r.cores, basic.hw?.hardwareConcurrency ? r.coresValue(basic.hw.hardwareConcurrency) : null],
      [r.battery, batteryText],
      [r.timezone, basic.timezone || null, { code: true }],
      [r.languages, (basic.languages || []).slice(0, 5).map(l => `${langToFlag(l)} ${esc(l)}`).join(', ') || null, { html: true }]
    ] }],
    how: s.s1.how, danger: s.s1.danger, action: s.s1.action
  });

  // 2. The operating system
  const arch = [hints.architecture, hints.bitness ? `${hints.bitness}-bit` : null].filter(Boolean).join(', ');
  steps.push({
    ...common, num: 2, label: t.stepLabel(2), title: s.s2.title, lead: s.s2.lead(osLabel, osVendorName),
    who: osVendorName ? [[osVendorName, p.osVendor]] : [[p.distro, p.distroNote]],
    blocks: [{ title: labels.measured, rows: [[r.os, osLabel], [r.vendor, osVendorName], [r.arch, arch || null]], note: labels.notVisible }],
    how: s.s2.how, danger: s.s2.danger, action: s.s2.action[family] || s.s2.action.other
  });

  // 3. The network: the one step with a button
  const networkBlocks = [];
  if (checked) {
    const details = state.serverData.details || {};
    const ct = String(state.scan?.geolocation?.connection_type || '').toLowerCase();
    const ipTz = details.timezone || null;
    const sameZone = ipTz && LOCAL_TZ && ipTz === LOCAL_TZ;
    networkBlocks.push({ title: labels.measured, rows: [
      [r.ip, state.serverData.ip, { code: true }],
      [r.isp, isp],
      [r.location, placeOfIp(t), { html: true }],
      [r.connection, t.connection[ct] || null],
      [r.vpn, vpnLikely(basic) ? r.detected : r.notDetected, { badge: vpnLikely(basic) ? 'danger' : 'safe' }],
      [r.ipTimezone, ipTz ? (sameZone ? r.same : r.mismatch(ipTz, LOCAL_TZ || '?')) : null]
    ] });
  }
  const checkBox = el('div', 'step-check');
  const button = el('button', 'v4-btn v4-btn-primary');
  button.type = 'button';
  button.dataset.action = 'check-network';
  button.textContent = state.networkStatus === 'loading' ? s.s3.check.loading : checked ? s.s3.check.recheck : s.s3.check.button;
  button.disabled = state.networkStatus === 'loading';
  checkBox.appendChild(button);
  checkBox.appendChild(el('p', 'step-check-note', state.networkStatus === 'failed' ? s.s3.check.failed : s.s3.check.note));
  networkBlocks.push({ node: checkBox });
  const who3 = [];
  who3.push(conn === 'cellular' ? [isp || p.carrier, isp ? p.carrier : null] : [isp || p.ispUnknown, isp ? p.isp : null]);
  if (conn !== 'cellular') who3.push([p.wifiOwner, p.wifiOwnerNote]);
  who3.push([p.everySite, p.everySiteNote]);
  steps.push({
    ...common, num: 3, label: t.stepLabel(3), title: s.s3.title[conn], subtitle: s.s3.subtitle,
    who: who3, blocks: networkBlocks, how: s.s3.how, danger: s.s3.danger, action: s.s3.action
  });

  // 4. The browser
  const granted = ['camera', 'microphone', 'geolocation'].filter(k => basic.perms?.[k] === 'granted').map(k => t.perms[k]);
  const browserRow = mkRow(r.browser, browserFull, { code: true });
  const share = getStatPercent('browsers', browserFull);
  if (share != null) {
    const stat = el('span', 'stat-share', `(${t.statVisitors(share)})`);
    browserRow.querySelector('.data-value').appendChild(stat);
  }
  const browserGroupNode = el('div', 'data-group');
  browserGroupNode.appendChild(el('h3', null, labels.measured));
  browserGroupNode.appendChild(browserRow);
  appendRows(browserGroupNode, [
    [r.vendor, browserVendorName],
    [r.blocker, state.trackerResults ? (blockerDetected(state.trackerResults) ? r.detected : r.notDetected) : r.notChecked, state.trackerResults ? { badge: blockerDetected(state.trackerResults) ? 'safe' : 'warning' } : {}],
    [r.dnt, basic.dnt === '1' ? r.on : r.off],
    [r.gpc, basic.gpc === true ? r.on : r.off],
    [r.permissions, granted.length ? granted.join(', ') : r.none, granted.length ? { badge: 'warning' } : {}],
    [r.cookies, basic.cookiesEnabled == null ? r.unknown : yesNo(t, basic.cookiesEnabled)]
  ]);
  steps.push({
    ...common, num: 4, label: t.stepLabel(4), title: s.s4.title(browserName), subtitle: s.s4.subtitle,
    who: [[browserVendorName || p.browserVendor, browserVendorName ? p.browserVendor : null], [p.extensions, p.extensionsNote]],
    blocks: [{ node: browserGroupNode }],
    how: s.s4.how, danger: s.s4.danger, action: s.s4.action[browserGroup] || s.s4.action.chrome
  });

  // 5. The address
  const colo = state.whoamiData?.geo?.colo || null;
  steps.push({
    ...common, num: 5, label: t.stepLabel(5), title: s.s5.title, subtitle: s.s5.subtitle,
    who: [[p.dns, isp || p.dnsDefault], [p.cloudflare, p.cloudflareNote]],
    blocks: [{ title: labels.measured, rows: [[r.host, 'Cloudflare']] },
      checked ? { title: labels.measured, rows: [[r.tls, [net.tlsVersion, net.tlsCipher].filter(Boolean).join(' / ') || null, { code: true }], [r.http, net.httpProtocol || null, { code: true }], [r.colo, colo, { code: true }]] }
        : { title: labels.afterCheck, rows: [[r.tls, '—'], [r.http, '—']] }],
    how: s.s5.how, danger: s.s5.danger, action: s.s5.action
  });

  // 6. The site
  const shortHash = h => (h ? h.slice(0, 8) : null);
  const webrtc = state.webrtc;
  const serverRows = checked ? [
    [r.userAgent, whoHeaders.user_agent || basic.userAgent, { code: true }],
    [r.acceptLanguage, whoHeaders.accept_language || null, { code: true }],
    [r.clientHints, ch ? [ch.platform, ch.mobile === '?1' ? 'mobile' : null, ch.browser].filter(Boolean).join(', ') : null],
    [r.headerOrder, Array.isArray(whoHeaders.header_order) ? String(whoHeaders.header_order.length) : null]
  ] : [[r.userAgent, '—'], [r.acceptLanguage, '—']];
  const scriptRows = [
    [r.canvas, shortHash(basic.hashes?.canvas) || r.none, basic.hashes?.canvas ? { code: true } : {}],
    [r.audio, basic.audioFp?.supported ? basic.audioFp.hash : r.none, basic.audioFp?.supported ? { code: true } : {}],
    [r.webgl, basic.webgl?.supported ? basic.webgl.hash : r.none, basic.webgl?.supported ? { code: true } : {}],
    [r.fonts, r.found(basic.fontsFp?.count || 0)],
    [r.webrtc, !webrtc || !webrtc.checked ? r.notChecked : webrtc.leak ? `${r.leak}: ${webrtc.ips.join(', ')}` : r.safe, webrtc?.checked ? { badge: webrtc.leak ? 'danger' : 'safe' } : {}],
    [r.thirdParty, String((basic.exposure?.resources || []).length)]
  ];
  const bait = el('div', 'data-group');
  bait.appendChild(el('h3', null, s.s6.baitTitle));
  if (state.trackerResults) bait.appendChild(trackerRows(state.trackerResults, t));
  else bait.appendChild(el('p', 'group-note', r.notChecked));
  bait.appendChild(el('p', 'group-note', s.s6.baitNote));
  steps.push({
    ...common, num: 6, label: t.stepLabel(6), title: s.s6.title, subtitle: s.s6.subtitle,
    who: [[p.siteOwner, p.siteOwnerNote], [p.adNetworks, p.adNetworksNote]],
    blocks: [{ title: checked ? s.s6.serverTitle : labels.afterCheck, rows: serverRows }, { title: s.s6.scriptsTitle, rows: scriptRows }, { node: bait }],
    how: s.s6.how, danger: s.s6.danger, action: s.s6.action[browserGroup] || s.s6.action.chrome
  });

  return { steps, deviceName, osVendorName, browserVendorName, isp, family };
}

/* ---- The sum ---- */

function renderSummary(container, basic, t, ctx) {
  const su = t.summary;
  const section = el('section', 'step step--summary');
  section.id = 'summary';
  section.appendChild(el('h2', 'step-title', su.title));
  section.appendChild(el('p', 'step-lead', su.lead));
  const list = el('ul', 'summary-parties');
  const names = [];
  if (ctx.osVendorName) { list.appendChild(el('li', null, su.parties.os(ctx.osVendorName))); names.push(ctx.osVendorName); }
  if (ctx.isp) { list.appendChild(el('li', null, su.parties.isp(ctx.isp))); names.push(ctx.isp); }
  else list.appendChild(el('li', 'summary-pending', su.parties.ispPending));
  if (ctx.browserVendorName) { list.appendChild(el('li', null, su.parties.browser(ctx.browserVendorName))); if (!names.includes(ctx.browserVendorName)) names.push(ctx.browserVendorName); }
  list.appendChild(el('li', null, su.parties.dns(ctx.isp || t.parties.dnsDefault)));
  list.appendChild(el('li', null, su.parties.cloudflare));
  names.push('Cloudflare');
  const items = [];
  if (basic.hashes?.canvas) items.push('Canvas');
  if (basic.audioFp?.supported) items.push('Audio');
  if (basic.webgl?.supported) items.push('WebGL');
  if (basic.fontsFp?.count) items.push(t.rows.fontsFound(basic.fontsFp.count));
  list.appendChild(el('li', null, su.parties.site(items.join(', ') || '—')));
  section.appendChild(list);

  section.appendChild(el('h3', 'summary-checklist-title', su.checklistTitle));
  const checklist = el('ol', 'summary-checklist');
  for (const step of ctx.steps.slice(1)) {
    const li = el('li');
    li.appendChild(el('b', null, step.title));
    li.appendChild(el('span', null, ' ' + step.action));
    checklist.appendChild(li);
  }
  section.appendChild(checklist);

  const actions = el('div', 'summary-actions');
  const shareBtn = el('button', 'v4-btn v4-btn-primary', su.shareButton);
  shareBtn.type = 'button';
  shareBtn.id = 'shareBtn';
  shareBtn.dataset.action = 'share';
  shareBtn.dataset.label = su.shareButton;
  const saveBtn = el('button', 'v4-btn', su.saveButton);
  saveBtn.type = 'button';
  saveBtn.id = 'printBtn';
  saveBtn.dataset.action = 'save';
  actions.appendChild(shareBtn);
  actions.appendChild(saveBtn);
  section.appendChild(actions);
  container.appendChild(section);

  const url = resolveShareUrl();
  state.sharePayload = { url, title: su.share.title, text: su.share.text({ device: ctx.deviceName, parties: names.join(', '), url }) };
}

/* ---- The raw data ---- */

function renderDetails(basic, t, ctx) {
  const body = getEl('detailsBody');
  if (!body) return;
  body.innerHTML = '';
  const r = t.rows, g = t.details.groups;
  const pending = [[t.details.pending, '']];
  const hints = basic.uaHighEntropy || {};
  const net = state.whoamiData?.network || {};
  const wh = state.whoamiData?.headers || {};
  const details = state.serverData?.details || {};
  const groups = [
    [g.device, [
      [r.device, ctx.deviceName], [r.os, guessOSVersion(basic)], [r.screen, `${basic.screen.w}×${basic.screen.h} @${basic.screen.pixelRatio}, ${basic.screen.colorDepth}-bit`],
      [r.gpu, basic.gl?.renderer || null, { code: true }], [r.memory, basic.hw?.deviceMemory ? r.memoryValue(basic.hw.deviceMemory) : null], [r.cores, basic.hw?.hardwareConcurrency || null],
      [r.timezone, basic.timezone || null, { code: true }], [r.languages, (basic.languages || []).join(', ') || null], [r.arch, [hints.architecture, hints.bitness].filter(Boolean).join(', ') || null]
    ]],
    [g.browser, [
      [r.browser, browserDisplayName(basic)], [r.userAgent, basic.userAgent, { code: true }], [r.dnt, basic.dnt === '1' ? r.on : r.off], [r.gpc, basic.gpc === true ? r.on : r.off],
      [r.cookies, basic.cookiesEnabled == null ? r.unknown : yesNo(t, basic.cookiesEnabled)], [r.storage, ['localStorage', 'sessionStorage', 'IndexedDB'].filter((_, i) => [basic.storage?.local, basic.storage?.session, basic.storage?.indexedDB][i]).join(', ') || r.none],
      [r.permissions, Object.entries(basic.perms || {}).map(([k, v]) => `${k}: ${v}`).join(', ') || r.none]
    ]],
    [g.network, state.serverData ? [
      [r.ip, state.serverData.ip, { code: true }], [r.isp, ctx.isp], [r.location, placeOfIp(t), { html: true }], [r.ipTimezone, details.timezone || null, { code: true }],
      [r.connection, t.connection[String(state.scan?.geolocation?.connection_type || '').toLowerCase()] || null], ['ASN', state.scan?.geolocation?.asn || null, { code: true }]
    ] : pending],
    [g.server, state.whoamiData ? [
      [r.tls, [net.tlsVersion, net.tlsCipher].filter(Boolean).join(' / ') || null, { code: true }], [r.http, net.httpProtocol || null, { code: true }], [r.colo, state.whoamiData.geo?.colo || null, { code: true }],
      [r.acceptLanguage, wh.accept_language || null, { code: true }], [r.clientHints, wh.client_hints?.ua || null, { code: true }], [r.headerOrder, Array.isArray(wh.header_order) ? wh.header_order.join(', ') : null, { code: true }],
      ['Header hash', state.whoamiData.header_hash || null, { code: true }]
    ] : pending],
    [g.fingerprint, [
      [r.canvas, basic.hashes?.canvas || null, { code: true }], [r.audio, basic.audioFp?.hash || null, { code: true }], [r.webgl, basic.webgl?.hash || null, { code: true }],
      [r.fonts, (basic.fontsFp?.list || []).join(', ') || null], ['SHA-256', snapshot.value?.fp || null, { code: true }]
    ]]
  ];
  for (const [title, rows] of groups) body.appendChild(rowGroup(title, rows));
}

// Renders everything below the intro from the current state.
export function renderWalk(t) {
  const basic = snapshot.value?.basic;
  const walk = getEl('walk');
  if (!walk || !basic) return;
  walk.innerHTML = '';
  const ctx = buildSteps(basic, t);
  for (const step of ctx.steps) renderStep(walk, step);
  renderSummary(walk, basic, t, ctx);
  renderDetails(basic, t, ctx);
}
