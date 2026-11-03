/**
 * IP geolocation via ipquery.io (primary) + ipinfo.io (fallback), both over HTTPS
 * and without an API key, so the visitor's IP never travels unencrypted.
 */

function classifyConnection(risk) {
  if (risk.is_vpn || risk.is_proxy || risk.is_tor) return 'vpn';
  if (risk.is_datacenter) return 'datacenter';
  if (risk.is_mobile) return 'mobile';
  return 'residential';
}

export async function fetchGeolocation(ip) {
  // Primary: ipquery.io (location, ISP and VPN/proxy/hosting/mobile flags)
  try {
    const resp = await fetch(`https://api.ipquery.io/${encodeURIComponent(ip)}?format=json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const isp = data.isp || {};
    const location = data.location || {};
    return {
      country: location.country || null,
      country_code: location.country_code || null,
      city: location.city || null,
      region: location.state || null,
      lat: location.latitude || null,
      lon: location.longitude || null,
      isp: isp.isp || null,
      org: isp.org || null,
      asn: isp.asn || null,
      connection_type: data.risk ? classifyConnection(data.risk) : null,
    };
  } catch (e) {
    console.warn('geolocation.ipquery_failed:', e.message);
  }

  // Fallback: ipinfo.io (no connection type)
  try {
    const resp = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const asnStr = data.org || '';
    const asn = asnStr.startsWith('AS') ? asnStr.split(' ')[0] : null;
    const org = asn ? asnStr.split(' ').slice(1).join(' ') : asnStr;
    const loc = (data.loc || '').split(',');
    return {
      country: data.country || null,
      country_code: data.country || null,
      city: data.city || null,
      region: data.region || null,
      lat: loc.length === 2 ? parseFloat(loc[0]) : null,
      lon: loc.length === 2 ? parseFloat(loc[1]) : null,
      isp: org || null,
      org: org || null,
      asn,
      connection_type: null,
    };
  } catch (e) {
    console.warn('geolocation.ipinfo_failed:', e.message);
  }

  return null;
}
