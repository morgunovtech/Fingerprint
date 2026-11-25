# Fingerprint

An educational page about online privacy for people who are not technical: six steps from opening your laptop to a loaded website, and at each step, on your real data, who learns what about you and what to do about it.

**Live:** https://fprint.morgunov.tech (in English: https://fprint.morgunov.tech/en/) · **API:** https://fprint.morgunov.tech/api/ · **License:** [MIT](LICENSE) · 🇷🇺 [По-русски](README.ru.md)

## What it does

The page is one walk. Each step is a card with the same parts: what was measured right now (rows of your real data), who learns it (named from the data: Apple, Microsoft or Google for the system; Google, Apple, Mozilla, Brave and others for the browser; your provider by name; Cloudflare; the site owner), how it works, why it matters, and one thing to do, specific to your system and browser.

1. **You opened your laptop** (or unlocked your phone; the wording follows the device). Model, screen, graphics card, memory, cores, battery, time zone, system languages. Nobody has this yet, but the browser will hand it to every site at step 6.
2. **The operating system started.** The system and its version, its maker, the architecture. What the maker learns at boot is explained, not measured: a web page cannot see it.
3. **You went online.** The one step with a button: "See what the provider sees" sends a single request to the site's own Worker and explains what it sends. After it: your IP, the provider's name, where the IP places you, the connection type, VPN signs, the IP's time zone.
4. **You opened the browser.** Its name and version (and the share of visitors with the same one), its maker, whether an ad blocker is at work, Do Not Track, Global Privacy Control, granted permissions, cookies.
5. **You typed the site's address.** What the DNS server logs and what the connection reveals; after the check, the TLS version and cipher, the HTTP protocol and the nearest Cloudflare node.
6. **The site loaded.** What the server got before any script (User-Agent, languages, Client Hints, the number of headers), what this page's scripts collected (the Canvas, audio and WebGL fingerprints, the fonts, a WebRTC address leak, third-party resources on this page) and the bait check for ad blockers.

Then **the sum**: who learned what, a checklist with one action per step, "Share" (a text built from your data) and "Print / Save". At the bottom, "Everything the browser handed over" keeps the raw data for the curious, including the fingerprint hashes. Russian, English and Uzbek; light, dark and high-contrast themes.

Three tiers of honesty run through every step: rows under "Measured right now" are real values from your browser; rows that need the server appear after the button at step 3; what a web page cannot see (the OS maker's telemetry, the DNS log) is explained under "How it works" and never dressed up as a measurement. The ad-blocker check is called a bait check: three hidden elements with the class names blockers hide, plus the DNT and GPC signals; nothing is loaded from anywhere.

## API

The Worker behind the button at step 3 is public at **https://fprint.morgunov.tech/api/**, on the site's own host: no key, no sign-up, 60 requests per minute per IP. Its original address, `https://fingerprint-api.xfxrrpkvr5.workers.dev`, answers the same paths and keeps working.

```sh
# What a server sees about you before any JavaScript runs, as plain text
curl https://fprint.morgunov.tech/api/check

# The same as JSON
curl -H 'Accept: application/json' https://fprint.morgunov.tech/api/check

# A report for an IP or a domain (for a domain also certificates and security headers)
curl 'https://fprint.morgunov.tech/api/scan?target=example.com'

# Anonymous aggregate stats; the deployed version
curl https://fprint.morgunov.tech/api/stats
curl https://fprint.morgunov.tech/api/health
```

`/api/whoami` is what the page calls: the same JSON as `/api/check`, and each call adds one to the anonymous stats. `/api/speedtest/ping`, `/api/speedtest/download?size=N` (100 KB to 25 MB) and `POST /api/speedtest/upload` stay for API users; the page no longer runs a speed test.

## Privacy

- **Computed in your browser:** every row of the walk, the device and OS guesses, the bait check and the WebRTC probe (it gathers ICE host candidates with no STUN server, so it sends nothing). The page does not upload them, and no third party sees them. The only outside script is Cloudflare's page-view counter (below), which Pages adds.
- **The Worker** answers at https://fprint.morgunov.tech/api/, the same host as the page, and gets your IP and request headers, as any server does. On page load the page only reads aggregate stats from it. A per-IP rate-limit counter lives in Workers KV and expires after 60 seconds.
- **The button at step 3** calls `/api/whoami` (your IP, Cloudflare's location and ASN for it, your headers; returned to you, not stored) and `/api/scan` for your IP. The scan sends your IP to ipquery.io (ipinfo.io as fallback) for location, ISP and connection type, and to Google DNS (`dns.google`) for the reverse record and four blocklist lookups. The report is cached in KV under your IP for one hour. Only if the Worker is down does the browser ask public IP services directly: ipapi.co and freeipapi.com, then ipify.org and myip.com if those fail too.
- **Scanning a domain** (`/api/scan?target=example.com`, API only; the page never sends one) also asks Google DNS for the domain's records, crt.sh for its certificates (certificate transparency logs), and sends a `HEAD` request to the domain itself over https, then http if that fails, following redirects, to read its security headers: a domain that redirects gets more than one request, and the headers are read from the final address. Those services see the scanned domain, and ipquery.io and the blocklists see its resolved address, not yours. There is no WHOIS lookup; the `whois` field stays `null` for compatibility.
- **Anonymous stats:** each `/api/whoami` call adds one to aggregate counters: total checks, browser and major version, OS, country, TLS version. No IP, no ID, no timestamps. The page uses them for the "checked N times" footer and the "N% of visitors" note on the browser row (after 100 checks). Anyone can read them at `/api/stats`. The counters are a read-modify-write of one KV key, so concurrent visits can lose an increment: they are decoration, not analytics.
- **Cloudflare Web Analytics** counts page views without cookies.
- **Stylesheets and fonts** (the morgunov.tech design system, IBM Plex) load from https://s.morgunov.tech/ds/v1/, the author's own site: as any server it sees your IP and browser, it sets no cookies and runs no analytics, and those requests carry nothing about the fingerprint. If that host is unreachable the page keeps working on the system font.

## How it's built

- `site/` is what Cloudflare Pages serves. No build step, no framework, no npm: the browser loads the ES modules as they are. `index.html` is the markup (the intro in Russian, readable without JavaScript, and the JSON-LD block), `assets/app.css` the styles, built on the tokens of the morgunov.tech design system (`https://s.morgunov.tech/ds/v1/`: `fonts`, `tokens` and `base` are linked from the `<head>` at their content-hashed addresses; the guide is `ds/v1/USAGE.md` in [about-me-page](https://github.com/morgunovtech/about-me-page); the page keeps its own layout and chrome, square corners, no shadows, nothing heavier than 600, no emoji in the chrome), and `src/` the code:
  - `app.js` — start-up, the language and theme controls, the render flow, the button at step 3, the changelog modal; `config.js` (addresses, `APP_VERSION`), `state.js` (what the page knows so far), `dom.js` (helpers).
  - `theme-init.js` — a plain script in the `<head>`, not a module: the theme before first paint (`data-theme` on `<html>`, the attribute the tokens switch on; `auto` follows the system setting) from `theme-preference`, the key every morgunov.tech page shares, so a theme picked here is the theme on s.morgunov.tech and back.
  - `walk.js` — the six steps, the sum and the raw-data section, built from the snapshot and the state.
  - `i18n/ru.js`, `en.js`, `uz.js` — every string of the page, the same keys in each file; `changelog.js` — the entries of the changelog modal.
  - `signals.js` — the signals the browser reveals, sampled once per page view (Canvas, one audio rendering, one WebGL context, fonts, permissions, …), the snapshot and its hash.
  - `device.js` — device, OS and browser guesses from the User-Agent, Client Hints and hardware signals, and the named parties behind them.
  - `network.js` — everything that leaves the browser: the Worker (`/api/whoami`, `/api/scan`, `/api/stats`), the public IP services used only when the Worker is down, the VPN heuristics and the WebRTC probe.
  - `trackers.js` (the bait check and the browser-data consistency check), `share.js` (share and save).
  Plus `_headers`, `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` and the link-preview cards.
- **`/en/` and link previews.** LinkedIn, Telegram and other link previews read the `og:` tags without running the page, so the English page needs English tags in the HTML itself. `functions/en/index.js` is a Pages Function that serves `/en/` as `site/index.html` with its `<head>` tags rewritten in English (`html lang`, description, canonical, `og:title`, `og:url`, image, `og:locale` and the `twitter:` twins). It rewrites the `<title>` element too (since 3.1.2), with the string the page's script sets for English after load, so search engines and readers without JavaScript get the English title on `/en/`. The page picks English from the address. The cards are PNG, 1200×630, because LinkedIn and most messengers do not show SVG: `share-card.png` for `/`, `share-card-en.png` for `/en/`. Their sources are `share-card.svg` and `share-card-en.svg`; after changing one, render it again from the repo root with headless Chrome:

  ```sh
  for card in share-card share-card-en; do
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
      --user-data-dir="$(mktemp -d)" --hide-scrollbars --force-device-scale-factor=1 \
      --window-size=1200,630 --screenshot="$PWD/site/$card.png" "file://$PWD/site/$card.svg"
  done
  ```
- **For search engines and AI assistants:** the `<head>` of `index.html` carries the Yandex Webmaster verification meta and a JSON-LD `WebApplication` block (data the browser never runs; the author is the same `Person` as on s.morgunov.tech); every group in `robots.txt` gives the Content Signals `search=yes, ai-input=yes, ai-train=yes` ([contentsignals.org](https://contentsignals.org)), because a crawler with its own group ignores `*`; `llms.txt` describes the page, its privacy and the API in plain text.
- `worker/` is the Cloudflare Worker `fingerprint-api` in plain JavaScript, no runtime dependencies: `src/index.js` is the router (`/api/scan`, `/api/speedtest/*`, `/api/stats`, `/api/health`), `src/whoami.js` builds `/api/whoami` and `/api/check` (plain text for `curl`) from the request, `src/collector.js` runs the `providers/` for a scan. Workers KV holds the scan cache (one hour), the stats and the rate limit (60 requests per minute per IP).
- `selftest.js` imports the page's modules into Node with a stub DOM and browser APIs and checks the helpers, the strings (the same keys in the three languages, every key the modules read present), the walk (six steps with real values, the named parties, the controls, the languages), the check from the button at step 3 end to end (steps 3, 5 and 6, the sum, the share text, the raw data), the Worker's `whoami`, providers and scan, plus the static files: the JSON-LD parses and names the canonical address, every `robots.txt` group has the content signals, `llms.txt` links the site, the repository and the author, both preview cards are 1200×630 PNGs, and the `/en/` Function finds every tag it rewrites, leaves no Russian in the English preview tags and uses the same English texts as the page. CI runs it on every PR, along with a Worker dry-run build, `npm audit` and gitleaks.
- **Versions.** One number names a release and lives in five places that must agree: `APP_VERSION` in `site/src/config.js` (the footer badge; the changelog modal's entries are in `site/src/changelog.js`, the same ones as here in RU/EN/UZ), `VERSION` in `worker/src/index.js` (what `/api/health` reports), `version` in `worker/package.json`, the top entry of [CHANGELOG.md](CHANGELOG.md), and the `?v=` of every script and stylesheet address in `index.html` and `404.html` and of every `import` between the modules, so a release is atomic for a browser that cached the previous one (`site/_headers` also makes `/src/*` and `/assets/*` revalidate on every visit, like the page). `selftest.js` fails when any of them disagrees. To bump the addresses: `sed -E -i '' "s/\?v=[0-9]+\.[0-9]+\.[0-9]+/?v=X.Y.Z/g" site/index.html site/404.html site/src/*.js site/src/i18n/*.js` (macOS sed; GNU sed takes `-i` without the empty argument — the pattern touches only release numbers, not the design-system hashes). Releases are tagged `vX.Y.Z` on `main`; versions follow SemVer from 2.2.0 (earlier ones had two parts).

## Run locally

Wrangler needs Node.js 22 or newer.

```sh
# Site: serves site/ at http://localhost:3000
npx wrangler pages dev --port 3000

# Worker: http://localhost:8787, KV simulated locally
cd worker && npm ci && npx wrangler dev

# Self-test: no install needed
node selftest.js
```

The page talks to the deployed Worker at https://fprint.morgunov.tech (`WORKER_API` in `site/src/config.js`). From `localhost` that is a cross-origin call: port 3000 is in the Worker's `ALLOWED_ORIGINS`; on the default port 8788 CORS blocks those calls. To try your local Worker, point `WORKER_API` at `http://localhost:8787`.

## Deploy

- **Site:** Cloudflare Pages deploys `main` and serves `site/` (`pages_build_output_dir` in the root `wrangler.toml`), plus the Function in `functions/` for `/en/`.
- **Worker:** deployed by hand with `cd worker && npm run deploy` (runs `wrangler deploy`). `worker/wrangler.toml` holds the `CACHE` KV binding, `ALLOWED_ORIGINS` and the two hosts the Worker answers on: its workers.dev address and the route `fprint.morgunov.tech/api/*`, which sends `/api/` on the site's own host to the Worker instead of Pages.

For your own copy: create a KV namespace (`npx wrangler kv namespace create CACHE`), put its id in `worker/wrangler.toml`, set `ALLOWED_ORIGINS` to your site, replace the route with one on your own zone or delete it (the Worker then answers on workers.dev only), and in `site/src/config.js` point `WORKER_API` at your Worker. There are no secrets to configure: ipquery.io, ipinfo.io, Google DNS and crt.sh are used without a key.

## What it creates outside the repo

- A Cloudflare Pages project `fingerprint` (the root `wrangler.toml`), serving `main` on the custom domain fprint.morgunov.tech; its DNS record is in the morgunov.tech zone. https://fingerprint-66l.pages.dev is the project's technical Cloudflare host: it keeps working, and `site/_headers` tells search engines not to index it. The Function in `functions/en/` deploys with the project. Teardown: delete the project and the DNS record in the Cloudflare dashboard.
- A Cloudflare Worker `fingerprint-api` (`worker/wrangler.toml`) on the route `fprint.morgunov.tech/api/*` and on https://fingerprint-api.xfxrrpkvr5.workers.dev, with the KV namespace bound as `CACHE` (its id is in `worker/wrangler.toml`). Teardown: `cd worker && npx wrangler delete` removes the Worker and its route; then delete the KV namespace (`npx wrangler kv namespace delete --namespace-id <id>`, or the dashboard).
- A Cloudflare Web Analytics site for the page: Pages injects the beacon, nothing in the repo refers to it. Remove it in the Cloudflare dashboard.
- Search consoles: Yandex Webmaster (the `yandex-verification` meta in `site/index.html`) and Google Search Console (a URL-prefix property, verified through the morgunov.tech domain property; no tag in the repo). Remove the properties there.
- On GitHub: branch protection on `main` with the required checks `selftest · worker` and `secrets`, «Allow auto-merge» for the Dependabot workflow, Dependabot itself.
- No API keys anywhere: ipquery.io, ipinfo.io, Google DNS and crt.sh are used without a key.

---
Built by [Semyon Morgunov](https://s.morgunov.tech) with Claude Code as pair programmer.
