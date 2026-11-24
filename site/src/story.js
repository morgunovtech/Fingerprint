// Story Mode: the same data told as a day, from opening the laptop to watching a video.

import { getEl, esc } from './dom.js';
import { state } from './state.js';
import { guessDevice, deviceDisplayName, browserDisplayName, formatGpuRenderer } from './device.js';

export function renderStoryMode(basic, t, snapshot) {
  const container = getEl('storyMode');
  const st = t?.story;
  if (!container || !st) return;
  container.innerHTML = '';
  const rows = st.rows || {};

  const diffBadge = diff => {
    const map = st.difficulty || { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    const cls = diff === 'easy' ? 'diff-easy' : diff === 'medium' ? 'diff-medium' : 'diff-hard';
    return '<span class="difficulty-badge ' + cls + '">' + esc(map[diff] || diff) + '</span>';
  };

  // One stage: a header, who sees the data, the YouTube example, the data rows and the two
  // expandable blocks. dataRows: [label, value, asCode?].
  function mkStage(num, cfg, dataRows, youtubeText) {
    const div = document.createElement('div');
    div.className = 'story-stage';
    div.setAttribute('data-stage-num', num);
    let html = '<div class="story-stage-header">';
    html += '<div class="story-stage-num">' + esc(st.stage || 'Stage') + ' ' + num + '</div>';
    html += '<h2 class="story-stage-title">' + esc(cfg.title || '') + '</h2>';
    html += '<p class="story-stage-subtitle">' + esc(cfg.subtitle || '') + '</p>';
    html += '</div>';
    if (cfg.who) html += '<div class="story-who-sees"><b>' + esc(st.whoSees || '') + '</b> ' + esc(cfg.who) + '</div>';
    if (youtubeText) html += '<div class="story-youtube-example">' + esc(youtubeText) + '</div>';
    const shown = (dataRows || []).filter(row => row[1] != null && row[1] !== '');
    if (shown.length) {
      html += '<div class="story-data-grid">';
      for (const [label, value, asCode] of shown) {
        html += '<div class="story-data-item"><span class="sdl">' + esc(label) + '</span><span class="sdv">' + (asCode ? '<code>' + esc(value) + '</code>' : esc(value)) + '</span></div>';
      }
      html += '</div>';
    }
    if (cfg.isInfo) html += '<div class="story-info-block"><span class="info-icon">ℹ️</span>' + (cfg.danger || '') + '</div>';
    else if (cfg.danger) html += '<div class="story-expand story-expand--danger"><details><summary>' + esc(st.dangerTitle || '') + '</summary><div class="expand-body">' + esc(cfg.danger) + '</div></details></div>';
    if (cfg.action) html += '<div class="story-expand story-expand--action"><details><summary>' + esc(st.actionTitle || '') + diffBadge(cfg.actionDiff) + '</summary><div class="expand-body">' + cfg.action + '</div></details></div>';
    div.innerHTML = html;
    return div;
  }
  const text = (cfg, ...args) => (typeof cfg.youtube === 'function' ? cfg.youtube(...args) : cfg.youtube);
  const needsNetwork = st.needsNetwork || '—';
  const yesNo = v => (v ? st.yes : st.no);

  // Stage 0: the device
  const device = deviceDisplayName(guessDevice(basic), t) || '?';
  const screenStr = `${basic.screen.w}×${basic.screen.h}`;
  const gpu = formatGpuRenderer(basic.gl?.renderer) || basic.gl?.vendor || '?';
  container.appendChild(mkStage(0, st.s0, [[rows.device, device], [rows.screen, screenStr], [rows.gpu, gpu], [rows.dpr, String(basic.screen.pixelRatio)]], text(st.s0, device, screenStr, gpu)));

  // Stage 1: the network (known after "Check network")
  const server = state.serverData;
  const ip = server?.ip || needsNetwork;
  const isp = server?.details?.org || (server ? '?' : needsNetwork);
  const vpnLikely = state.vpn?.status === 'likely';
  container.appendChild(mkStage(1, st.s1, [[rows.ip, ip], [rows.isp, isp], [rows.vpn, server ? yesNo(vpnLikely) : needsNetwork]], text(st.s1, isp, ip)));

  // Stage 2: the browser
  const browser = browserDisplayName(basic);
  const dnt = basic.dnt === '1';
  const gpc = basic.gpc === true;
  container.appendChild(mkStage(2, st.s2, [[rows.browser, browser], [rows.dnt, dnt ? st.on : st.off], [rows.gpc, gpc ? st.on : st.off]], text(st.s2, browser, dnt, gpc)));

  // Stage 3: DNS (an explanation; the page measures nothing here)
  container.appendChild(mkStage(3, st.s3, [], st.s3.youtube));

  // Stage 4: TLS, from the Worker's view of the connection
  const net = state.whoamiData?.network || {};
  const tls = net.tlsVersion || needsNetwork;
  container.appendChild(mkStage(4, st.s4, [[rows.tls, tls], [rows.cipher, net.tlsCipher || null, true]], text(st.s4, tls)));

  // Stage 5: HTTP headers
  const langs = (basic.languages || []).join(', ') || '?';
  container.appendChild(mkStage(5, st.s5, [[rows.acceptLanguage, langs], [rows.ua, browser]], text(st.s5, langs)));

  // Stage 6: Canvas, audio, WebGL, WebRTC
  const short = h => (h ? h.slice(0, 8) + '…' : '—');
  const canvasHash = short(basic.hashes?.canvas);
  const audioHash = basic.audioFp?.supported ? basic.audioFp.hash : '—';
  const webglHash = basic.webgl?.supported ? basic.webgl.hash : '—';
  const webrtc = state.webrtc;
  const webrtcText = webrtc && webrtc.checked ? yesNo(webrtc.leak) : (st.notChecked || '—');
  container.appendChild(mkStage(6, st.s6, [[rows.canvas, canvasHash, true], [rows.audio, audioHash, true], [rows.webgl, webglHash, true], [rows.webrtc, webrtcText]], text(st.s6, canvasHash, audioHash)));

  // Stage 7: trackers
  const results = state.trackerResults || [];
  const blocked = results.filter(r => r.blocked).length;
  container.appendChild(mkStage(7, st.s7, [[rows.trackers, results.length ? `${blocked} / ${results.length}` : (st.notChecked || '—')]], text(st.s7, blocked, results.length)));

  // The verdict
  const vd = st.verdict;
  if (vd) {
    const pct = snapshot?.pct;
    const vDiv = document.createElement('div');
    vDiv.className = 'story-verdict';
    let html = pct != null ? '<div class="sv-pct">' + Math.round(pct) + '%</div>' : '';
    html += '<div class="sv-text">' + esc(vd.title || '') + '</div>';
    html += '<p class="sv-desc">' + esc(vd.subtitle || '') + '</p>';
    html += '<div class="story-verdict-recs">';
    for (const [heading, list] of [[vd.now, vd.nowList], [vd.weekend, vd.weekendList], [vd.advanced, vd.advancedList]]) {
      if (heading) html += '<h4>' + esc(heading) + '</h4><ul>' + (list || []).map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>';
    }
    html += '</div>';
    vDiv.innerHTML = html;
    container.appendChild(vDiv);
  }
}
