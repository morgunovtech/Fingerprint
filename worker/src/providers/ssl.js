/**
 * SSL certificate info via crt.sh (certificate transparency logs).
 * Note: Workers can't do raw TLS handshakes, so we use crt.sh + fetch headers.
 */

export async function fetchSsl(domain) {
  // Get cert info from crt.sh
  try {
    const resp = await fetch(
      `https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (resp.status !== 200) return null;
    const entries = await resp.json();
    if (!entries || entries.length === 0) return null;

    // Most recent certificate
    const latest = entries[0];
    const sanDomains = new Set();

    for (const entry of entries.slice(0, 20)) {
      for (const field of ['common_name', 'name_value']) {
        const val = entry[field] || '';
        for (const d of val.split('\n')) {
          const clean = d.trim().replace(/^\*\./, '');
          if (clean && clean.includes('.')) sanDomains.add(clean.toLowerCase());
        }
      }
    }

    return {
      issuer: latest.issuer_name || null,
      subject: latest.common_name || null,
      valid_from: latest.not_before ? latest.not_before.slice(0, 10) : null,
      valid_to: latest.not_after ? latest.not_after.slice(0, 10) : null,
      san_domains: [...sanDomains].sort(),
      serial: latest.serial_number || null,
      protocol: null, // Can't detect via crt.sh
    };
  } catch (e) {
    console.warn('ssl.crtsh_failed:', e.message);
    return null;
  }
}
