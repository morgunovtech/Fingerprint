// Cloudflare Pages Function for /en/: the same page as /, with the English <title> and English
// link-preview tags. LinkedIn, Telegram and other link previews read the og: tags without running
// the page's script, search engines and readers without JavaScript read the <title> the same way,
// and site/index.html carries the Russian ones, so this rewrites them on the way out. The page
// itself picks English from the address (langFromPath in site/src/app.js) and sets the same title
// after load (applyMeta there).
// selftest.js runs englishPage() over site/index.html and fails when a tag it rewrites has
// changed, checks that EN matches the English strings the page sets for itself (meta in
// site/src/i18n/en.js) and that the <title> is the one the script sets.

const SITE = 'https://fprint.morgunov.tech';

export const EN = {
  title: 'Fingerprint — who learns what about you while you open a website',
  description: 'Six steps from opening your laptop to a loaded website: who learns what about you at each one, on your real data, and what to do about it.',
  imageAlt: 'Fingerprint by morgunov.tech — who learns what about you while you open a website'
};

const text = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const attr = value => text(value).replace(/"/g, '&quot;');

// [what, the tag in site/index.html, the tag on /en/]
const REWRITES = [
  ['html lang', /<html lang="ru">/, '<html lang="en">'],
  // The document title the page's script sets for English (applyMeta in site/src/app.js): the
  // meta title plus the site's name.
  ['title', /<title id="pageTitle">[^<]*<\/title>/, `<title id="pageTitle">${text(EN.title)} — morgunov.tech</title>`],
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
