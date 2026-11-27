// Cloudflare Pages Function for /en/: the same page as /, in English for a reader that runs no
// JavaScript. LinkedIn, Telegram and other link previews read the og: tags without running the
// page's script, and so do search engines and AI assistants that fetch the HTML and read it as it
// is (GPTBot, ClaudeBot, PerplexityBot run no scripts): until 3.3.4 they got the English <title>
// over a Russian heading and a Russian intro under <html lang="en">. site/index.html carries the
// Russian page, so this rewrites it on the way out: the head tags, the family chrome's labels, the
// heading, the intro and the JSON-LD description. The page itself picks English from the address
// (langFromPath in site/src/app.js) and sets the same words after load.
// The words of the body come from site/src/i18n/en.js itself, fetched from the site's own assets
// (englishStrings), so the English text has one home; the head tags are the EN table below.
// selftest.js runs englishPage() over site/index.html and fails when a tag it rewrites has
// changed, checks that englishStrings() reads exactly the strings the module exports, that EN
// matches the English strings the page sets for itself (meta in site/src/i18n/en.js) and that the
// <title> is the one the script sets.

const SITE = 'https://fprint.morgunov.tech';

export const EN = {
  title: 'Fingerprint — who learns what about you while you open a website',
  description: 'Six steps from opening your laptop to a loaded website: who learns what about you at each one, on your real data, and what to do about it.',
  imageAlt: 'Fingerprint by morgunov.tech — who learns what about you while you open a website'
};

const text = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const attr = value => text(value).replace(/"/g, '&quot;');
// A JSON string literal, for the JSON-LD block: "<" escaped as well, so it can never close the script.
const json = value => JSON.stringify(String(value)).replace(/</g, '\\u003c');

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
  ['twitter:image', /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${SITE}/share-card-en.png" />`],
  // The WebApplication's description, in the page's language. Its url stays the one address of the app.
  ['JSON-LD description', /(<script type="application\/ld\+json">[\s\S]*?\n {6}"description": )"[^"\n]*"/, (_, before) => `${before}${json(EN.description)}`]
];

// The body of /en/ in the strings of site/src/i18n/en.js (englishStrings). The Russian intro moves
// into a <template lang="ru"> at the start of the intro block: the page reads the Russian copy from
// the markup (russianIntro in site/src/app.js), so switching to Russian in place still has it,
// and a <template> is never rendered or read as the page's text.
const BODY = s => [
  ['skip link', /<a href="#main" class="skip-link" id="skipLink">[^<]*<\/a>/, `<a href="#main" class="skip-link" id="skipLink">${text(s.skip)}</a>`],
  ['language button', /aria-label="RU — [^"]*"><span id="langCode">RU<\/span>/, `aria-label="EN — ${attr(s.changeLanguage)}"><span id="langCode">EN</span>`],
  ['Русский item', /role="menuitemradio" aria-checked="true" href="\/" hreflang="ru"/, 'role="menuitemradio" aria-checked="false" href="/" hreflang="ru"'],
  ['English item', /role="menuitemradio" aria-checked="false" href="\/en\/" hreflang="en"/, 'role="menuitemradio" aria-checked="true" href="/en/" hreflang="en"'],
  ['theme button', /id="theme-toggle" aria-label="[^"]*"/, `id="theme-toggle" aria-label="${attr(s.changeTheme)}"`],
  ...Object.entries(s.modes).map(([value, label]) => [
    `theme ${value}`,
    new RegExp(`(data-theme-value="${value}" aria-checked="false">)[^<]*(</button>)`),
    (_, open, close) => `${open}${text(label)}${close}`
  ]),
  ['heading', /<h1 id="introTitle" class="intro-title">[^<]*<\/h1>/, `<h1 id="introTitle" class="intro-title">${text(s.introTitle)}</h1>`],
  ['intro', /(<div id="introText" class="small intro-content--rich">)([\s\S]*?)(<\/div>\n {2}<\/section>)/,
    (_, open, ru, close) => `${open}<template lang="ru">${ru}</template>${s.introRichHtml}${close}`]
];

// The page with the English tags, and the names of the tags it could not find. Without `strings`
// only the head changes.
export function englishPage(html, strings = null) {
  const missing = [];
  let out = html;
  for (const [name, pattern, tag] of strings ? [...REWRITES, ...BODY(strings)] : REWRITES) {
    if (pattern.test(out)) out = out.replace(pattern, typeof tag === 'function' ? tag : () => tag);
    else missing.push(name);
  }
  return { html: out, missing };
}

// The strings of the body, read from the source of site/src/i18n/en.js: plain quoted literals and
// the intro's template literal (no ${} in it). null when one is missing, so a reformatted module
// leaves /en/ with the Russian body rather than with a broken one; selftest.js fails first.
export function englishStrings(source) {
  const src = String(source);
  const chrome = src.match(/\n {2}chrome: \{ skip: '([^'\\]*)', changeLanguage: '([^'\\]*)', changeTheme: '([^'\\]*)' \},\n/);
  const modes = src.match(/\n {2}theme: \{ modes: \{ light: '([^'\\]*)', dark: '([^'\\]*)', auto: '([^'\\]*)', 'high-contrast': '([^'\\]*)' \} \},\n/);
  const title = src.match(/\n {2}introTitle: '([^'\\]*)',\n/);
  const intro = src.match(/\n {2}introRichHtml: \/\* html \*\/`([^`$\\]*)`,\n/);
  if (!chrome || !modes || !title || !intro) return null;
  return {
    skip: chrome[1], changeLanguage: chrome[2], changeTheme: chrome[3],
    modes: { light: modes[1], dark: modes[2], auto: modes[3], 'high-contrast': modes[4] },
    introTitle: title[1],
    introRichHtml: intro[1]
  };
}

export async function onRequest({ request, env, next }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  const url = new URL(request.url);
  // One address for the page: /en → /en/ (the page's share link drops the trailing slash).
  if (url.pathname === '/en') return Response.redirect(`${url.origin}/en/${url.search}`, 301);
  const [page, module] = await Promise.all([
    env.ASSETS.fetch(new URL('/', url)),
    env.ASSETS.fetch(new URL('/src/i18n/en.js', url)).catch(() => null)
  ]);
  if (!page.ok) return page;
  const strings = module && module.ok ? englishStrings(await module.text()) : null;
  const headers = new Headers(page.headers);
  headers.delete('content-length');
  headers.delete('etag');
  return new Response(englishPage(await page.text(), strings).html, { status: page.status, headers });
}
