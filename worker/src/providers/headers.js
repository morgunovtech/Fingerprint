/**
 * HTTP response headers collection via fetch.
 */

const SECURITY_HEADERS = {
  'strict-transport-security': 'strict_transport_security',
  'content-security-policy': 'content_security_policy',
  'x-frame-options': 'x_frame_options',
  'x-content-type-options': 'x_content_type_options',
  'referrer-policy': 'referrer_policy',
  'permissions-policy': 'permissions_policy',
};

export async function fetchHttpHeaders(domain) {
  for (const scheme of ['https', 'http']) {
    try {
      const resp = await fetch(`${scheme}://${domain}`, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });

      const sec = {};
      for (const [header, field] of Object.entries(SECURITY_HEADERS)) {
        sec[field] = resp.headers.has(header);
      }

      return {
        server: resp.headers.get('server') || null,
        powered_by: resp.headers.get('x-powered-by') || null,
        security_headers: sec,
      };
    } catch (e) {
      console.warn(`http_headers.${scheme}_failed:`, e.message);
      continue;
    }
  }
  return null;
}
