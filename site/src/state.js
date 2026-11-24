// Mutable page state shared by the modules. Everything computed stays in memory: nothing here is
// sent anywhere, and a reload starts from scratch.
export const state = {
  lang: 'ru',
  // "Check network": the Worker's /api/whoami answer mapped to {ip, geo, raw, details, source},
  // or a public IP service's answer when the Worker is down.
  serverData: null,
  // The raw /api/whoami answer, for the server-side fingerprint section.
  whoamiData: null,
  ipFetchDone: false,
  networkStatus: 'idle', // idle | loading | done | failed
  vpn: { status: 'uncertain', reasons: [], checked: false },
  // null until the probe ran; then {checked, leak, ips}.
  webrtc: null,
  trackerResults: null,
  spoofing: null,
  // /api/stats, loaded once per page view.
  stats: null,
  // /api/scan report for the visitor's IP.
  scan: null
};

// The computed snapshot ({basic, fp, H, pct}) and the promise while it is being computed.
export const snapshot = { value: null, promise: null };

export function invalidateSnapshot() {
  snapshot.value = null;
  snapshot.promise = null;
}
