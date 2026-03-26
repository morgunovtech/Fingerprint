/**
 * DNS resolution via dns.google public API.
 */

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS'];

async function resolve(domain, rtype) {
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${rtype}`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await resp.json();
    const answers = data.Answer || [];
    return answers.map(a => (a.data || '').replace(/\.$/,'')).filter(Boolean);
  } catch {
    return [];
  }
}

async function ptrLookup(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null; // IPv6 PTR not supported here
  const arpa = parts.reverse().join('.') + '.in-addr.arpa';
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(arpa)}&type=PTR`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await resp.json();
    const answers = data.Answer || [];
    return answers.length > 0 ? answers[0].data.replace(/\.$/, '') : null;
  } catch {
    return null;
  }
}

export async function fetchDns(domain, ip) {
  const result = { a: [], aaaa: [], mx: [], txt: [], cname: [], ns: [], ptr: null };

  if (domain) {
    const tasks = RECORD_TYPES.map(async (rtype) => {
      const records = await resolve(domain, rtype);
      result[rtype.toLowerCase()] = records;
    });
    await Promise.allSettled(tasks);
  }

  if (ip) {
    result.ptr = await ptrLookup(ip);
  }

  // Check if we got anything
  const hasData = Object.values(result).some(v =>
    Array.isArray(v) ? v.length > 0 : v !== null
  );
  return hasData ? result : null;
}
