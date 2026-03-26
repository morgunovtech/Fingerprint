/**
 * IP geolocation via ip-api.com (primary) + ipinfo.io (fallback).
 */

function classifyConnection(data) {
  if (data.proxy) return 'vpn';
  if (data.hosting) return 'datacenter';
  if (data.mobile) return 'mobile';
  return 'residential';
}

export async function fetchGeolocation(ip) {
  // Primary: ip-api.com
  try {
    const fields = 'status,message,country,countryCode,regionName,city,lat,lon,isp,org,as,mobile,proxy,hosting,query';
    const resp = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data = await resp.json();
    if (data.status === 'success') {
      return {
        country: data.country || null,
        country_code: data.countryCode || null,
        city: data.city || null,
        region: data.regionName || null,
        lat: data.lat || null,
        lon: data.lon || null,
        isp: data.isp || null,
        org: data.org || null,
        asn: data.as ? data.as.split(' ')[0] : null,
        connection_type: classifyConnection(data),
      };
    }
  } catch (e) {
    console.warn('geolocation.ipapi_failed:', e.message);
  }

  // Fallback: ipinfo.io
  try {
    const resp = await fetch(`https://ipinfo.io/${ip}/json`, {
      signal: AbortSignal.timeout(8000),
    });
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
