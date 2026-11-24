// Cloudflare Pages Function for /en/: the same page as /, with English link-preview tags.
// LinkedIn, Telegram and other link previews read the og: tags without running the page's
// script, and site/index.html carries the Russian ones, so this rewrites them on the way out.
// The page itself picks English from the address (langFromPath in site/src/app.js).
// selftest.js runs englishPage() over site/index.html and fails when a tag it rewrites has
// changed, and checks that EN matches the English strings the page sets for itself (meta in
// site/src/i18n/en.js).

const SITE = 'https://fprint.morgunov.tech';

export const EN = {
  title: 'Fingerprint — how anonymous are you online',
  description: 'Shows what any website learns about you the moment you open it, how unique your browser is, and how to hide.',
  imageAlt: 'Fingerprint by morgunov.tech — how anonymous are you online?'
};

const attr = value => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// [what, the tag in site/index.html, the tag on /en/]
const REWRITES = [
  ['html lang', /<html lang="ru">/, '<html lang="en">'],
  ['description', /<meta id="metaDescription" name="description" content="[^"]*" \/>/, `<meta id="metaDescription" name="description" content="${attr(EN.description)}" />`],
  ['canonical', /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${SITE}/en/" />`],
  ['og:title', /<meta id="ogTitle" property="og:title" content="[^"]*" \/>/, `<meta id="ogTitle" property="og:title" content="${attr(EN.title)}" />`],
  ['og:description', /<meta id="ogDescription" property="og:description" content="[^"]*" \/>/, `<meta id="ogDescription" property="og:description" content="${attr(EN.description)}" />`],
  ['og:url', /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${SITE}/en/" />`],
  ['og:image', /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${SITE}/share-card-en.png" />`],
  ['og:image:alt', /<meta property="og:image:alt" content="[^"]*" \/>/, `<meta property="og:image:alt" content="${attr(EN.imageAlt)}" />`],
  ['og:locale', /<meta property="og:locale" content="ru_RU" \/>/, '<meta property="og:locale" content="en_US" />'],
  ['og:locale:alternate', /<meta property="og:locale:alternate" content="en_US" \/>/, '<meta property="og:locale:alternate" content="ru_RU" />'],
  ['twitter:title', /<meta id="twTitle" name="twitter:title" content="[^"]*" \/>/, `<meta id="twTitle" name="twitter:title" content="${attr(EN.title)}" />`],
  ['twitter:description', /<meta id="twDescription" name="twitter:description" content="[^"]*" \/>/, `<meta id="twDescription" name="twitter:description" content="${attr(EN.description)}" />`],
  ['twitter:image', /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${SITE}/share-card-en.png" />`]
];

// The page with the English tags, and the names of the tags it could not find.
export function englishPage(html) {
  const missing = [];
  let out = html;
  for (const [name, pattern, tag] of REWRITES) {
    if (pattern.test(out)) out = out.replace(pattern, () => tag);
    else missing.push(name);
  }
  return { html: out, missing };
}

export async function onRequest({ request, env, next }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  const url = new URL(request.url);
  // One address for the page: /en → /en/ (the page's share link drops the trailing slash).
  if (url.pathname === '/en') return Response.redirect(`${url.origin}/en/${url.search}`, 301);
  const page = await env.ASSETS.fetch(new URL('/', url));
  if (!page.ok) return page;
  const headers = new Headers(page.headers);
  headers.delete('content-length');
  headers.delete('etag');
  return new Response(englishPage(await page.text()).html, { status: page.status, headers });
}
