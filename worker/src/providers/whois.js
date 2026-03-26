/**
 * WHOIS lookup via whoisjson.com API.
 * CLI fallback is not available in Workers — API only.
 */

const PERSON_RE = /^[A-Z][a-z]+ [A-Z][a-z]+$/;

function maskIfPerson(value) {
  if (!value) return value;
  if (PERSON_RE.test(value.trim())) return '[REDACTED — personal name]';
  return value;
}

export async function fetchWhois(target) {
  try {
    const resp = await fetch(
      `https://whoisjson.com/api/v1/whois?domain=${encodeURIComponent(target)}`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (resp.status !== 200) return null;
    const raw = await resp.json();

    return {
      registrar: raw.registrar || null,
      created: raw.creation_date ? String(raw.creation_date).slice(0, 10) : null,
      expires: raw.expiration_date ? String(raw.expiration_date).slice(0, 10) : null,
      updated: raw.updated_date ? String(raw.updated_date).slice(0, 10) : null,
      registrant_org: maskIfPerson(raw.registrant_org || raw.registrant || null),
      name_servers: raw.name_servers || [],
      status: Array.isArray(raw.status) ? raw.status : [],
    };
  } catch (e) {
    console.warn('whois.failed:', e.message);
    return null;
  }
}
