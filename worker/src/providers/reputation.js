/**
 * IP reputation check via DNSBL queries through dns.google.
 */

const DNSBLS = [
  'zen.spamhaus.org',
  'b.barracudacentral.org',
  'bl.spamcop.net',
  'dnsbl.sorbs.net',
  'dnsbl-1.uceprotect.net',
  'spam.dnsbl.sorbs.net',
  'cbl.abuseat.org',
  'psbl.surriel.com',
];

async function checkDnsbl(ip, dnsbl) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  const query = parts.reverse().join('.') + '.' + dnsbl;
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(query)}&type=A`,
      { signal: AbortSignal.timeout(6000) }
    );
    const data = await resp.json();
    const answers = data.Answer || [];
    for (const a of answers) {
      if (a.data && a.data.startsWith('127.')) return dnsbl;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchReputation(ip) {
  try {
    const results = await Promise.allSettled(
      DNSBLS.map(dnsbl => checkDnsbl(ip, dnsbl))
    );
    const hits = results
      .filter(r => r.status === 'fulfilled' && typeof r.value === 'string')
      .map(r => r.value);

    return {
      blacklisted: hits.length > 0,
      blacklist_hits: hits,
      blacklists_checked: DNSBLS.length,
      fraud_score: null,
    };
  } catch (e) {
    console.warn('reputation.failed:', e.message);
    return null;
  }
}
