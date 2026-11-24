// What the Worker sees: the /api/scan rows added to the network group, the server-side
// fingerprint section (/api/whoami) and the comparison with the browser's own data.

import { getEl, esc, mkRow } from './dom.js';
import { state, snapshot } from './state.js';
import { browserFamily } from './device.js';
import { getStatPercent } from './network.js';
import { appendStatLabel } from './report.js';

// Adds ISP, ASN, connection type and reputation rows from the scan report to #groupNetwork.
export function renderScanRows(data, t) {
  const groupNet = getEl('groupNetwork');
  if (!groupNet || !data) return;
  const labels = t.osint || {};
  const geo = data.geolocation;
  const rep = data.reputation;
  const existingText = groupNet.textContent || '';
  if (geo) {
    if (geo.isp && !existingText.includes(geo.isp)) groupNet.appendChild(mkRow(labels.isp, geo.isp));
    if (geo.asn) groupNet.appendChild(mkRow(labels.asn, geo.asn, { code: true }));
    if (geo.connection_type) {
      const ct = String(geo.connection_type).toLowerCase();
      const tagClass = ct === 'residential' ? 'tag--ok' : ct === 'datacenter' ? 'tag--danger' : 'tag--warn';
      groupNet.appendChild(mkRow(labels.type, '<span class="tag ' + tagClass + '">' + esc(labels.connection?.[ct] || geo.connection_type) + '</span>', { html: true }));
    }
  }
  if (rep) {
    const text = rep.blacklisted ? labels.listed((rep.blacklist_hits || []).join(', ')) : labels.clean(rep.blacklists_checked);
    const tagClass = rep.blacklisted ? 'tag--danger' : 'tag--ok';
    groupNet.appendChild(mkRow(labels.rep, '<span class="tag tag--wrap ' + tagClass + '">' + esc(text) + '</span>', { html: true }));
  }
}

// The /api/whoami answer: {network:{tlsVersion,tlsCipher,httpProtocol,asn,asOrganization},
// headers:{header_order,client_hints}, header_hash, consistency, cross_check}.
export function renderServerFingerprint(whoami, t) {
  const section = getEl('serverFpSection');
  const group = getEl('groupServerFp');
  if (!section || !group || !whoami) return;
  section.style.display = '';
  getEl('serverFpTitle').textContent = t.serverFpTitle || '';
  getEl('serverFpDesc').textContent = t.serverFpDesc || '';
  group.innerHTML = '';
  const labels = t.serverFp || {};
  const network = whoami.network || {};
  const headers = whoami.headers || {};
  const hints = headers.client_hints || whoami.hints_parsed || {};

  if (network.tlsVersion || network.tlsCipher) {
    const row = mkRow(labels.tls, [network.tlsVersion, network.tlsCipher].filter(Boolean).join(' / '), { code: true });
    if (network.tlsVersion) appendStatLabel(row, getStatPercent('tls_versions', network.tlsVersion), t);
    group.appendChild(row);
  }
  if (network.httpProtocol) group.appendChild(mkRow(labels.http, network.httpProtocol, { code: true }));
  if (whoami.header_hash) group.appendChild(mkRow(labels.headerHash, whoami.header_hash, { code: true }));
  const order = headers.header_order;
  if (Array.isArray(order) && order.length) group.appendChild(mkRow(labels.headerOrder, order.slice(0, 8).join(', ') + (order.length > 8 ? ', …' : '')));
  if (hints.platform) group.appendChild(mkRow(labels.chPlatform, hints.platform));
  if (hints.mobile != null && hints.mobile !== '') group.appendChild(mkRow(labels.chMobile, String(hints.mobile)));
  if (hints.ua) group.appendChild(mkRow(labels.chBrowser, hints.ua, { code: true }));
  const asn = network.asn ? (String(network.asn).startsWith('AS') ? network.asn : 'AS' + network.asn) : '';
  const org = network.asOrganization || '';
  if (asn || org) group.appendChild(mkRow(labels.asn, [asn, org].filter(Boolean).join(' · '), { code: true }));
  renderContradictions(whoami, state.lang, t);
}

// Where the server's view disagrees with what the browser reports about itself.
export function renderContradictions(whoami, lang, t) {
  const container = getEl('contradictionsBlock');
  if (!container) return;
  container.innerHTML = '';
  const labels = t.contradictions || {};
  const cc = whoami.cross_check || {};
  const consistency = whoami.consistency || {};
  const basic = snapshot.value?.basic || null;
  const issues = [];

  let clientTz = '';
  try { clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) { /* ignore */ }
  const serverTz = cc.server_timezone || '';
  if (serverTz && clientTz && serverTz !== clientTz) issues.push({ field: labels.timezone, server: serverTz, client: clientTz });

  const serverPlatform = String(cc.server_platform || '');
  const clientPlatform = String(navigator.userAgentData?.platform || navigator.platform || '');
  if (serverPlatform && clientPlatform) {
    const sp = serverPlatform.toLowerCase(), cp = clientPlatform.toLowerCase();
    if (!cp.includes(sp) && !sp.includes(cp)) issues.push({ field: labels.platform, server: serverPlatform, client: clientPlatform });
  }

  const serverBrowser = String(cc.server_browser || '');
  const clientBrowser = browserFamily(basic?.userAgent || navigator.userAgent);
  if (serverBrowser && clientBrowser !== '__other') {
    const sb = serverBrowser.toLowerCase(), cb = clientBrowser.toLowerCase();
    if (!sb.includes(cb) && !cb.includes(sb)) issues.push({ field: labels.browser, server: serverBrowser, client: clientBrowser });
  }

  const uaIssues = consistency.issues || [];
  if (Array.isArray(uaIssues) && uaIssues.length) issues.push({ field: labels.uaConsistency, server: uaIssues.join('; '), client: '' });
  else if (consistency.consistent === false) issues.push({ field: labels.uaConsistency, server: 'mismatch', client: '' });

  const badgeCls = issues.length === 0 ? 'status-badge--safe' : issues.length <= 2 ? 'status-badge--warning' : 'status-badge--danger';
  const badgeText = issues.length === 0 ? labels.consistent : issues.length <= 2 ? labels.discrepancies : labels.significant;
  const titleDiv = document.createElement('div');
  titleDiv.className = 'contradictions-title';
  titleDiv.innerHTML = '<span class="contradictions-label">' + esc(labels.title) + '</span><span class="status-badge ' + badgeCls + '">' + esc(badgeText) + '</span>';
  container.appendChild(titleDiv);

  if (issues.length) {
    const issueGroup = document.createElement('div');
    issueGroup.className = 'data-group contradictions-issues';
    for (const issue of issues) {
      const valHtml = issue.client
        ? '<span class="contradiction-value"><code>' + esc(issue.server) + '</code> vs <code>' + esc(issue.client) + '</code></span>'
        : '<span class="contradiction-value contradiction-value--single"><code>' + esc(issue.server) + '</code></span>';
      issueGroup.appendChild(mkRow(issue.field, valHtml, { html: true }));
    }
    container.appendChild(issueGroup);
  }

  const details = document.createElement('details');
  details.className = 'contradictions-edu';
  const summary = document.createElement('summary');
  summary.textContent = labels.eduTitle || '';
  const eduP = document.createElement('p');
  eduP.className = 'small';
  eduP.textContent = labels.eduText || '';
  details.appendChild(summary);
  details.appendChild(eduP);
  container.appendChild(details);
}
