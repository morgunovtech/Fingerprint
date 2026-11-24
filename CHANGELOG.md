# Changelog

What changed for the people who use the page or call the Worker. The site's own changelog modal (the version badge in the footer) shows the same entries in Russian, English and Uzbek. Versions up to 2.1 had two parts and are kept as they were; from 2.2.0 they follow SemVer and every release is tagged `vX.Y.Z`.

## 3.1.1 — 2026-11-24

A returning visitor got today's page with yesterday's code. Fixed; nothing else changes.

- **The cause.** Since 2.5.0 the page is markup plus separate modules and a stylesheet, named by plain path. Cloudflare Pages sends the HTML with `max-age=0` and everything else with `max-age=2073600` (24 days), so a browser that had opened 2.5.0 or 3.0.0 took the new `index.html` and ran the modules and the stylesheet it had cached: the old strings in the new markup, the old look, and the walk never rendered because the old code looked for elements that are gone. The symptom lasted until the cache expired or the visitor hard-reloaded.
- **The fix, twice over.** `site/_headers` gives `/src/*` and `/assets/*` the same `Cache-Control: public, max-age=0, must-revalidate` as the page, so the browser asks every time and gets a 304 while nothing changed. And every script and stylesheet address the page uses, and every `import` between the modules, carries `?v=<release>` (`3.1.1` now), so a release is atomic: the new page can only load the new modules, whatever a browser or a proxy still holds. `selftest.js` fails when an import or a link lacks the current version, or when the cache rule is missing.
- Version 3.1.1 in the page, the in-page changelog, `CHANGELOG.md`, the Worker (number only) and now the asset addresses; README says where the number lives.

## 3.1.0 — 2026-11-24

The page wears the morgunov.tech design system. What the page checks and sends does not change.

- **Colours and type** come from the shared layer at https://s.morgunov.tech/ds/v1/ (`fonts`, `tokens` and `base` at their content-hashed addresses, the way Good Pass loads them; no `components.css`, the page keeps its own chrome). `site/assets/app.css` is rewritten on the `--v4-*` tokens: IBM Plex Sans and Mono, paper surfaces, square corners, no shadows or gradients, nothing heavier than 600, the DS button, menu, link and focus metrics. The light values stand in as fallbacks, so the page still reads if that origin is down. Status colours (safe / warning / danger) are the page's own, the values the TofsDevOps status page uses, 4.9:1 or better on the background and on the card in every theme; a status is a colour of text and a border, never a fill. The favicon is the orange mark with an "F".
- **Themes** switch the way every morgunov.tech page does: `data-theme` on `<html>` (`light`, `dark`, `high-contrast`; `auto` follows the system setting and changes with it), set before first paint by `site/src/theme-init.js`, a plain script in the `<head>`. The saved choice moves from `fp_theme` to `theme-preference` (`contrast` becomes `high-contrast`), read once and removed, so the theme picked here is the theme on s.morgunov.tech and back.
- **Chrome without emoji:** the language button shows the current code (RU / EN / UZ) and its menu names the languages in their own words, the theme menu says the words, the step number is a mono label instead of the watermark digit, the changelog's close button is a drawn cross. Flags inside the data (the languages row, the country of the IP) stay.
- **Privacy wording:** the intro's "what goes out" list (RU/EN/UZ), README (EN/RU), `llms.txt` and the Privacy section name s.morgunov.tech as the origin of the stylesheets and fonts: the author's site, which sees the IP as any server does, sets no cookies and runs no analytics, and those requests carry nothing about the fingerprint.
- "Print / Save" on a phone inlines the design-system stylesheets with absolute font addresses, so the saved file keeps the look.
- Version 3.1.0 in the page, the in-page changelog (RU/EN/UZ), `CHANGELOG.md` and the Worker (version number only; the Worker is deployed by hand).
- `selftest.js` checks the two theme attributes and the key migration, the four word-only theme options, the design-system links in the `<head>` of both pages (same files, same hashes), and that `app.css`, `index.html` and `404.html` carry no `border-radius`, `box-shadow`, gradient, `font-weight` above 600, theme classes or emoji.

Left as is, on purpose: `share-card.svg`, `share-card-en.svg` and the PNG previews, brand assets to redraw together in the DS palette.

## 3.0.0 — 2026-11-24

A new product on the same data. The page is one walk of six steps, from opening the device to a loaded site, for people who are not technical: at each step, what was measured right now, who learns it (by name, from the data: the makers of the system and the browser, your provider, Cloudflare), how it works, why it matters and one thing to do. The scanner it used to be (a uniqueness percentage, 22 cards of hashes, a speed test, two modes) is gone. The Worker's API keeps its shape.

**The page**
- Six steps: you opened the laptop (or unlocked the phone: the wording follows the device), the operating system started, you went online, you opened the browser (named), you typed the site's address, the site loaded. Then the sum: who learned what, a checklist with one action per step, "Share" with a text built from your data, "Print / Save".
- Three tiers of honesty on every step: "Measured right now" rows, rows that appear after the check at step 3, and "how it works" for what a web page cannot see (what the OS maker gets at boot, what the DNS server logs). The page no longer says "TLS fingerprint" where it only has a version and a cipher, nor "ad pixel not blocked" where no pixel was loaded: the bait check is called a bait check.
- The network check is the button at step 3, with a plain description of the one request that leaves the page and what it sends. After it, steps 3, 5 and 6 fill in: IP, provider, where the IP places you, connection type, VPN signs and the time zone of the IP; TLS version and cipher, HTTP protocol, the nearest Cloudflare node; what the server got before any script (User-Agent, languages, Client Hints, the number of headers).
- "Who learns this" names parties from the data: Apple, Microsoft or Google for the system; Google, Apple, Mozilla, Brave, Yandex, Microsoft, Opera, Samsung, Vivaldi or The Browser Company for the browser; the provider by name after the check; the DNS server (the provider's by default); Cloudflare; the site owner; ad networks (none on this page, 10 to 30 on a typical site).
- Actions are specific to the system (macOS, iOS, Windows, Android, ChromeOS, Linux) and the browser (Chrome, Firefox, Brave, Safari).
- "Everything the browser handed over" at the bottom keeps the raw data for the curious: device, browser, network, what the server saw, the fingerprints (Canvas, audio, WebGL, fonts, the SHA-256 of the whole snapshot).
- New in the copy, in Russian, English and Uzbek: the operating-system step, the plain-language row labels, the named parties, the sum and the checklist. The Uzbek copy was written with the other two and would benefit from a native speaker's pass.

**Removed**
- The uniqueness percentage and its model (`entropy.js`): it ranked the visitor against a distribution sampled from hand-typed frequency tables, not against people, and the footer's "N fingerprints checked" next to it read as if it did. The methodology modal went with it.
- The 22 detail cards with their "how it is used / example / advice" texts, Report and Story modes and the toggle between them, the speed test (the Worker's `/api/speedtest/*` endpoints stay for API users), the risk cards and the two recommendation lists (their content lives in the steps' "why it matters" and "what to do"), the server-vs-browser consistency block, the SVG share card generated on the fly.
- From the page's own strings: everything the removed sections used; the three language files are a third of their size.

**Links and previews**
- The page's title and descriptions, the JSON-LD description and the English texts of `/en/` say what the page is now. The preview cards (`share-card.svg`, `share-card-en.svg` and their PNGs) carry the new headline instead of "99%".

## 2.5.0 — 2026-11-24

An audit and a rewrite of the page's code: the single 7,400-line `index.html` is now markup plus a stylesheet and ES modules, the dead code and the unused strings are gone, and four things that were silently broken work. The Worker's API keeps its shape.

**Fixed on the page**
- Story Mode shows real data: device, screen, GPU, the Canvas/Audio/WebGL hashes, the number of blocked trackers and, after "Check network", the IP, ISP and TLS version. It used to read fields that never existed on the snapshot and showed `?`, `undefinedxundefined` and `[object Object]`.
- The "Server fingerprint" section shows the TLS version and cipher, the HTTP protocol, the header order and the Client Hints. The Worker sent them; the page read a different shape and showed only the header hash and the ASN.
- The WebRTC leak check works: the "WebRTC" row and the advice about the leak come from an actual probe (ICE host candidates without a STUN server, so nothing leaves the machine). The row used to read "Safe" whatever happened, because the value it looked at was never set.
- The "What the site knows about you" block takes the full width of the page instead of a third: the grid was laid out for three groups and only one is rendered.
- macOS version from Client Hints: Chromium reports the macOS version itself in `platformVersion`, which the page read as a Darwin kernel number and printed "macOS (Darwin 14.6.1)". It prints "macOS 14" now.
- "Print / Save" on a phone saves a static snapshot of the page (the stylesheet inlined, the scripts removed). The saved file used to carry the whole script and ran a new check when opened.
- The audio fingerprint bucket of the uniqueness model emits only keys the frequency table knows; three of its seven outputs used to fall through to "other", so the percentage may shift by a point or two.
- The contrast theme has its own icon in the theme button.

**Removed**
- `site/src/profiler.js` (1,267 lines). It ran on every render, twice per render, downloaded `share-card.svg` three times for a bandwidth estimate, wrote test cookies, opened and deleted an IndexedDB database, enumerated 48 fonts and probed WebRTC, and the page displayed none of its findings: the only field it read from the result was never set, and the "basic" signals it expected on `globalThis` were removed in March. The WebRTC probe lives on as `src/network.js`.
- From the page's code: 17 unused functions and constants, the hidden "old-style" list and the hidden `#uniqLine`, `#ipRow`, `#speedResult` and `#osintResults` elements kept for an older self-test, the second audio rendering and the second WebGL context (each signal is now sampled once), and some 450 lines of strings in each language that nothing read (the profiling block, the IP block, the advice generator, the `uniqMeaning` structure of which only the headline was used).
- The page no longer fetches `share-card.svg`; the file stays as the source of the link-preview card.

**Code**
- `site/index.html` is markup only (270 lines). Styles are in `site/assets/app.css`; the code is in `site/src/`: `app.js` (start-up, controls, render), `config.js`, `state.js`, `dom.js`, `i18n/{ru,en,uz}.js`, `changelog.js`, `signals.js` (collection and the snapshot), `entropy.js` (the uniqueness model), `device.js` (device, OS and browser guesses), `network.js` (the Worker, the public IP services, the speed test, the WebRTC probe), `trackers.js`, `report.js`, `story.js`, `server-view.js`, `share.js`. No build step: the browser loads the modules as they are.
- Every string of the interface is in the three language files; the row labels, badges and messages that were Russian/English/Uzbek literals inside the code moved there, and `selftest.js` checks that the three files carry the same keys and that every key the modules read exists.
- The Worker: `whoami.js` holds the request parsing (`/api/whoami`, `/api/check`), `index.js` is the router; the legacy `RegExp.$1` statics are gone; `/api/scan` caches under one TTL; the 404 answer lists every endpoint.
- `selftest.js` installs the browser stubs on `globalThis` and imports the modules; it also covers the Worker's `whoami`, the network check end to end (IP, speed, scan rows, the server fingerprint section), the WebRTC row and advice, Story Mode's values and the language switch after a check.

## 2.4.1 — 2026-11-24

`ai-train=yes`: the owner allows AI training. What the page checks and sends does not change.

- Every group in `robots.txt` now gives the Content Signals `search=yes, ai-input=yes, ai-train=yes` (https://contentsignals.org): besides search results and AI answers, the page may be used to train AI models. In 2.2.2 `ai-train` was left unset until the owner decided. The comment above the first group says the same.
- `selftest.js` expects `ai-train=yes` in every group and exactly one `Content-Signal` line per group.
- The Worker has no change but the version number it reports at `/api/health`.

## 2.4.0 — 2026-11-24

An English address for links shared on LinkedIn and elsewhere, and a link preview those sites can show. What the page checks and sends does not change.

- https://fprint.morgunov.tech/en/ is the same page in English, with English link-preview tags: title, description, image, `og:locale` `en_US` and its own canonical address. A Pages Function, `functions/en/index.js`, rewrites the tags in the `<head>` of `site/index.html` on the way out, so there is still one page; `/en` redirects to `/en/`. The English description is the one the project uses elsewhere: "Shows what any website learns about you the moment you open it, how unique your browser is, and how to hide." The page sets the same title and description for itself when it switches to English.
- On `/en/` the page opens in English over a saved choice or the browser language, and opening it does not change the language saved for `/`. A language picked in the menu moves the address between `/` and `/en/` (Uzbek stays on `/`), so a copied or shared link previews in the language on screen.
- The link preview is a 1200×630 PNG, `share-card.png` for `/` and `share-card-en.png` for `/en/`, with `og:image:type`, `width`, `height` and `alt`. It used to be `share-card.svg`, which LinkedIn and most messengers do not show, so links went out without a picture. The SVGs stay as the sources, laid out again: the headline ran into the "99%" circle. `share-card.svg` is still the file the network test downloads.
- The `<head>` links the two addresses with `hreflang` (`ru`, `en`, `x-default` → `/`); `sitemap.xml` and `llms.txt` list `/en/`.
- The page imports `src/profiler.js` and the network test fetches `share-card.svg` by absolute path, so both work from `/en/`.
- `selftest.js` checks that both preview images are 1200×630 PNGs, runs the Function's rewrite over `site/index.html` (every tag it rewrites must be there, no Cyrillic left in the preview tags of `/en/`, nothing but the `<head>` changes), compares its English texts with the ones the page sets for itself, and checks the language pick from the address.
- The Worker has no change but the version number it reports at `/api/health`.

## 2.3.0 — 2026-11-24

The API has a new public address on the site's own host; the old one keeps working.

- The Worker answers at https://fprint.morgunov.tech/api/ with the same paths as before (`/api/check`, `/api/whoami`, `/api/scan`, `/api/stats`, `/api/health`, `/api/speedtest/*`): a route `fprint.morgunov.tech/api/*` on the `morgunov.tech` zone. `https://fingerprint-api.xfxrrpkvr5.workers.dev` answers the same way for everyone who already calls it.
- The page calls its own host: the stats on load, "Check network" and the speed test go to https://fprint.morgunov.tech/api/, same-origin, so no CORS. The hostname the browser talks to changes; what it sends does not.
- README.md and README.ru.md: an API section with `curl` examples at the new address; the Privacy section names the host and says the workers.dev address still answers. `llms.txt` gives the new API address too.

## 2.2.2 — 2026-11-24

Search engines and AI assistants can find and cite the page; nothing changes in what it checks or sends.

- The page's `<head>` carries the Yandex Webmaster verification meta for fprint.morgunov.tech (Google verifies the whole morgunov.tech domain by DNS) and a JSON-LD `WebApplication`: name, canonical URL, the README's first sentence, `SecurityApplication`, free, Russian, English and Uzbek, the GitHub repository, and the author as the same `Person` that s.morgunov.tech declares. It is a data block the browser never runs.
- `robots.txt` gives the Content Signals `search=yes, ai-input=yes` (https://contentsignals.org) in every group — a crawler with its own group ignores `*` — so search results and AI answers may use the page. There is no `ai-train` signal either way.
- `llms.txt`: what the page checks, what stays in the browser and what reaches a server, the Worker's API, the languages and the links, in plain text for AI assistants.
- The technical Pages hosts (`fingerprint-66l.pages.dev` and the per-deployment preview hosts) send `X-Robots-Tag: noindex`, so search engines index only https://fprint.morgunov.tech.
- `selftest.js` checks the new static files: the JSON-LD parses and names the canonical address, every `robots.txt` group has the signals, `llms.txt` links the site, the repository and the author.

## 2.2.1 — 2026-11-24

A privacy fix and corrections; the `/api/scan` response keeps its shape.

- No WHOIS lookup. whoisjson.com needs an API key the Worker never had, so the call returned nothing, yet the visitor's IP was sent there on every "Check network". The provider is gone; `/api/scan` keeps the `whois` field, always `null`, and no longer lists `whois` in `sources_ok`. The privacy texts in Russian, English and Uzbek and both READMEs no longer name whoisjson.com.
- The social preview card (`share-card.svg`) and the fallback share link show https://fprint.morgunov.tech instead of `morgunov.tech/fingerprint`, which does not open.
- The `/api/scan` error for an invalid target asks for "a domain or an IP address": IPv6 is accepted too.
- Unused code removed (an unused Telegram link constant, unused parameters in the Worker's collector) and code comments that referred to an internal plan rewritten as plain descriptions.

## 2.2.0 — 2026-11-24

Everything shipped since 2.1: the Cloudflare Worker and the server-side view, Story Mode, the cleanup of 2026-11-03, and the first release with one version number across the page, the Worker and this file.

**Worker and server-side view**
- Cloudflare Worker `fingerprint-api` (`worker/`, plain JavaScript, Workers KV): `/api/scan` for an IP or a domain — geolocation, ISP and connection type, DNS records with the reverse record, four DNS blocklists, certificates from the certificate transparency logs and security headers (domains only); `/api/whoami` and `/api/check` (plain text for `curl`) with what the server sees before any JavaScript runs; `/api/speedtest/*`; a KV cache of scan reports; anonymous aggregate counters readable at `/api/stats`; a 60-requests-per-minute rate limit per IP.
- The page asks the Worker instead of third-party IP APIs; the public IP services remain only as a fallback for when the Worker is down.
- A server-side fingerprint section on the page: IP, ISP and ASN, TLS version, HTTP protocol, header order and Client Hints, with the places where the server's view contradicts the browser's.
- A real speed test through the Worker instead of `navigator.connection`.

**Page**
- Story Mode (`?mode=story`, also a toggle in the header): the same data told as one day, from opening the laptop to watching a video.
- Unified cards, visitor percentages from the live stats, and the UI and audit fixes of March 2026.
- `robots.txt`, `sitemap.xml`, a real 404 page and an intro that renders without JavaScript (2026-09-26).

**Cleanup of 2026-11-03**
- Duplicate code and leftover files removed; wrangler 4; `selftest.js` runs again against the current page.
- CI on every PR (selftest, Worker dry-run build, `npm audit`, gitleaks), Dependabot with auto-merge of minor and patch updates, `_headers` for Pages; Pages serves only `site/`, so the Worker source and the self-test are not public.
- README and the MIT license.
- The privacy texts in Russian, English and Uzbek say what the code does; FingerprintJS Pro removed.
- IP geolocation via ipquery.io over HTTPS with ipinfo.io as fallback, so the visitor's IP never travels unencrypted.
- DNS blocklists reduced to the four that answer public resolvers (Barracuda, SpamCop, UCEPROTECT, PSBL); Spamhaus's refusal codes are no longer read as a listing, which fixes the false "blacklisted" verdict.

**Release**
- One version in four places: `APP_VERSION` in the page, `VERSION` in the Worker (reported by `/api/health`), `worker/package.json` and this file. README documents the rule; wrangler bumped by Dependabot along the way.

## 2.1 — 2026-03-25

- New signals: WebGL, AudioContext, font fingerprinting.
- Tracker simulation (5 tests).
- Browser data spoofing detection.
- Browser-specific recommendations.
- VPN risk card.
- Methodology modal.

## 2.0 — 2026-03-25

- Full redesign: verdict-first architecture.
- Data grouping: identity, device, network.
- Risk cards and personal recommendations.
- Entropy frequency table normalization.
- Collapsible details block.

## 1.5 — 2025-12-15

- New signals: speech synthesis voices, CSS media features, JS math fingerprint.
- Font detection list expanded from 10 to 48 fonts.
- High contrast theme added (◑).
- Global Privacy Control (GPC) replacing legacy DNT.
- VPN detector improved: removed false positives for Google/Amazon/Azure users.
- Fixed advice text: Canvas protection, WebRTC blocking, Battery API deprecation notice.
- Renamed "Save PDF" button to "Print / Save".

## 1.1 — 2025-10-11

- Added battery detector (Battery API).
- Improved device detection accuracy.
- Minor UI bug fixes.

## 1.0 — 2025-10-07

- Initial public release.
- Canvas, Audio, WebGL fingerprinting.
- IP detection with 5-source fallback.
- VPN, AdBlock, WebRTC detection.
- PDF export and Share function.
- RU / EN / UZ language support.
