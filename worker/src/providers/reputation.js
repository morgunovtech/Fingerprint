/**
 * IP reputation check via DNSBL queries through dns.google.
 *
 * Only lists that answer queries from public resolvers are used: each one returns
 * 127.0.0.2 for its test entry (2.0.0.127.<list>) through dns.google. Spamhaus
 * (zen, and cbl.abuseat.org, now part of it) refuses public resolvers and answers
 * with 127.255.255.x error codes, and SORBS is shut down, so they are not queried.
 */

export const DNSBLS = [
  'b.barracudacentral.org',
  'bl.spamcop.net',
  'dnsbl-1.uceprotect.net',
  'psbl.surriel.com',
];

// A listing is an A record in 127.0.0.2–127.0.0.255. Anything else (127.255.255.x
// error codes, 127.0.0.1, addresses outside 127.0.0.0/24) is not an answer we can trust.
function isListingCode(address) {
  const m = /^127\.0\.0\.(\d{1,3})$/.exec(address || '');
  return Boolean(m) && Number(m[1]) >= 2 && Number(m[1]) <= 255;
}

// 'listed', 'clean' (NXDOMAIN or no A record), or 'error' (no usable answer).
export async function checkDnsbl(ip, dnsbl) {
  const query = ip.split('.').reverse().join('.') + '.' + dnsbl;
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(query)}&type=A`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (!resp.ok) return 'error';
    const data = await resp.json();
    if (data.Status === 3) return 'clean';
    if (data.Status !== 0) return 'error';
    const addresses = (data.Answer || []).filter(a => a.type === 1).map(a => a.data);
    if (addresses.length === 0) return 'clean';
    return addresses.every(isListingCode) ? 'listed' : 'error';
  } catch {
    return 'error';
  }
}

export async function fetchReputation(ip) {
  // The lists are IPv4-only.
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return null;
  const results = await Promise.all(DNSBLS.map(dnsbl => checkDnsbl(ip, dnsbl)));
  const checked = results.filter(r => r !== 'error').length;
  // No list answered: report the check as unavailable rather than "clean, 0 checked".
  if (checked === 0) return null;
  const hits = DNSBLS.filter((_, i) => results[i] === 'listed');
  return {
    blacklisted: hits.length > 0,
    blacklist_hits: hits,
    blacklists_checked: checked,
    fraud_score: null,
  };
}
