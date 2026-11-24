# Fingerprint

A privacy check for everyday users: it shows what any website learns about your browser the moment you open it, how unique that makes you, and how to be harder to track.

**Live:** https://fprint.morgunov.tech (in English: https://fprint.morgunov.tech/en/) · **API:** https://fprint.morgunov.tech/api/ · **License:** [MIT](LICENSE) · 🇷🇺 [По-русски](README.ru.md)

## What it does

- **What a site sees instantly.** Browser and OS, screen and monitors, GPU, CPU cores and memory, languages and timezone, fonts, Canvas and audio hashes, storage, permissions, battery, media devices. No prompts needed. A profile section turns these into plain guesses: device model, likely region, VPN likelihood, WebRTC IP leak.
- **Uniqueness estimate.** Each signal is weighted by how common it is (frequency tables based on EFF Panopticlick and FingerprintJS research, with correlated signals counted once), and the result is ranked against 25,000 simulated browsers.
- **Tips to protect yourself.** Advice matched to what was found, such as a timezone that doesn't match your IP, a WebRTC leak or an exposed Canvas fingerprint, with steps for Chrome, Firefox, Brave and Safari.
- **Tracker simulation.** Five checks. Three of them are ad-blocker bait: the page inserts three hidden `<div>`s with the class names ad blockers hide (`ad_banner adsbygoogle`, `adsbox` with the id `google_ads_frame`, `ad-placement sponsored-banner`) and after half a second checks whether each one is still visible; the UI labels them "ad pixel", "analytics script" and "ad frame", but no pixel, script or frame is actually loaded from anywhere. The other two read your Do Not Track and Global Privacy Control settings.
- **Server-side view.** Click "Check network" and the Worker shows what a server sees before any JavaScript runs (IP, ISP and ASN, TLS version, HTTP protocol, header order, Client Hints), and the page flags where that disagrees with the browser. You also get connection type (home, mobile, data center, VPN), a check against 4 DNS blocklists (Barracuda, SpamCop, UCEPROTECT, PSBL), reverse DNS and a speed test. The Worker's `/api/scan` also accepts a domain (DNS records, certificates from CT logs, security headers; there is no WHOIS lookup, and the `whois` field stays `null` for compatibility); the page itself only scans your IP.
- **Story Mode.** The same data told as a walk from opening your laptop to watching a YouTube video: who sees what at each step, why it matters, what to do. Toggle it in the header or open `?mode=story`.
- Russian, English and Uzbek; light, dark and high-contrast themes; share and print.

## API

The Worker behind "Check network" is public at **https://fprint.morgunov.tech/api/**, on the site's own host: no key, no sign-up, 60 requests per minute per IP. Its original address, `https://fingerprint-api.xfxrrpkvr5.workers.dev`, answers the same paths and keeps working.

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

`/api/whoami` is what the page calls: the same JSON as `/api/check`, and each call adds one to the anonymous stats. The speed test uses `/api/speedtest/ping`, `/api/speedtest/download?size=N` (100 KB to 25 MB) and `POST /api/speedtest/upload`.

## Privacy

- **Computed in your browser:** all fingerprint signals, the uniqueness score, the profile and the tracker checks. The page does not upload them, and no third party sees your fingerprint. The only outside script is Cloudflare's page-view counter (below), which Pages adds.
- **The Worker** answers at https://fprint.morgunov.tech/api/, the same host as the page, and gets your IP and request headers, as any server does. Until 2.3.0 the page called it at `fingerprint-api.xfxrrpkvr5.workers.dev`: the move changed the hostname your browser talks to, not what it sends, and that address still answers. On page load the page only reads aggregate stats from it. A per-IP rate-limit counter lives in Workers KV and expires after 60 seconds.
- **"Check network"** calls `/api/whoami` (your IP, Cloudflare's location and ASN for it, your headers; returned to you, not stored), the speed test, and `/api/scan` for your IP. The scan sends your IP to ipquery.io (ipinfo.io as fallback) for location, ISP and connection type, to Google DNS (`dns.google`) for the reverse record and the four blocklist lookups. There is no WHOIS lookup. The report is cached in KV under your IP for one hour. Only if the Worker is down does the browser ask public IP services directly: ipapi.co and freeipapi.com, then ipify.org and myip.com if those fail too.
- **Scanning a domain** (`/api/scan?target=example.com`, API only; the page never sends one) also asks Google DNS for the domain's records, crt.sh for its certificates (certificate transparency logs), and sends one `HEAD` request to the domain itself over https, then http if that fails, to read its security headers. Those services see the scanned domain, and ipquery.io and the blocklists see its resolved address, not yours.
- **Anonymous stats:** each `/api/whoami` call adds one to aggregate counters: total checks, browser and major version, OS, country, TLS version. No IP, no ID, no timestamps. The page uses them for the "fingerprints checked" footer and the "X% of visitors" hints (after 100 checks). Anyone can read them at `/api/stats`.
- **Cloudflare Web Analytics** counts page views without cookies.

## How it's built

- `site/` is what Cloudflare Pages serves. No build step, no framework, no npm. `index.html` is the whole app: markup, styles and one inline script with the RU/EN/UZ strings, the uniqueness model and Story Mode. `src/profiler.js` is an ES module the page imports for the profile. Plus `_headers`, `404.html`, `robots.txt`, `sitemap.xml`, `llms.txt` and the link-preview cards.
- **`/en/` and link previews.** LinkedIn, Telegram and other link previews read the `og:` tags without running the page, so the English page needs English tags in the HTML itself. `functions/en/index.js` is a Pages Function that serves `/en/` as `site/index.html` with its `<head>` tags rewritten in English (title, description, canonical, `og:url`, image, `og:locale`); the page picks English from the address. The cards are PNG, 1200×630, because LinkedIn and most messengers do not show SVG: `share-card.png` for `/`, `share-card-en.png` for `/en/`. Their sources are `share-card.svg` (also the file the network test downloads) and `share-card-en.svg`; after changing one, render it again from the repo root with headless Chrome:

  ```sh
  for card in share-card share-card-en; do
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
      --user-data-dir="$(mktemp -d)" --hide-scrollbars --force-device-scale-factor=1 \
      --window-size=1200,630 --screenshot="$PWD/site/$card.png" "file://$PWD/site/$card.svg"
  done
  ```
- **For search engines and AI assistants:** the `<head>` of `index.html` carries the Yandex Webmaster verification meta and a JSON-LD `WebApplication` block (data the browser never runs; the author is the same `Person` as on s.morgunov.tech); every group in `robots.txt` gives the Content Signals `search=yes, ai-input=yes, ai-train=yes` ([contentsignals.org](https://contentsignals.org): search results, AI answers and AI training may use the page), because a crawler with its own group ignores `*`; `llms.txt` describes the page, its privacy and the API in plain text.
- `worker/` is the Cloudflare Worker `fingerprint-api` in plain JavaScript, no runtime dependencies: `/api/whoami`, `/api/check` (plain text for `curl`), `/api/scan`, `/api/speedtest/*`, `/api/stats`, `/api/health`. Workers KV holds the scan cache, the stats and the rate limit (60 requests per minute per IP).
- `selftest.js` runs the inline script and `profiler.js` in a Node `vm` sandbox with a stub DOM and checks the helpers, the score, translation key parity and the UI controls, plus the static files: the JSON-LD parses and names the canonical address, every `robots.txt` group has the content signals, one line each, `llms.txt` links the site, the repository and the author, both preview cards are 1200×630 PNGs, and the `/en/` Function finds every tag it rewrites, leaves no Russian in the English preview tags and uses the same English texts as the page. CI runs it on every PR, along with a Worker dry-run build, `npm audit` and gitleaks.
- **Versions.** One number names a release and lives in four places that must agree: `APP_VERSION` in `site/index.html` (the footer badge and the changelog modal, which carries the same entries in RU/EN/UZ), `VERSION` in `worker/src/index.js` (what `/api/health` reports), `version` in `worker/package.json`, and the top entry of [CHANGELOG.md](CHANGELOG.md). Releases are tagged `vX.Y.Z` on `main`; versions follow SemVer from 2.2.0 (earlier ones had two parts).

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

The page talks to the deployed Worker at https://fprint.morgunov.tech (`WORKER_API` in `site/index.html`). From `localhost` that is a cross-origin call: port 3000 is in the Worker's `ALLOWED_ORIGINS`; on the default port 8788 CORS blocks those calls. To try your local Worker, point `WORKER_API` at `http://localhost:8787`.

## Deploy

- **Site:** Cloudflare Pages deploys `main` and serves `site/` (`pages_build_output_dir` in the root `wrangler.toml`), plus the Function in `functions/` for `/en/`.
- **Worker:** deployed by hand with `cd worker && npm run deploy` (runs `wrangler deploy`). `worker/wrangler.toml` holds the `CACHE` KV binding, `ALLOWED_ORIGINS` and the two hosts the Worker answers on: its workers.dev address and the route `fprint.morgunov.tech/api/*`, which sends `/api/` on the site's own host to the Worker instead of Pages.

For your own copy: create a KV namespace (`npx wrangler kv namespace create CACHE`), put its id in `worker/wrangler.toml`, set `ALLOWED_ORIGINS` to your site, replace the route with one on your own zone or delete it (the Worker then answers on workers.dev only), and in `site/index.html` point `WORKER_API` at your Worker. There are no secrets to configure: ipquery.io, ipinfo.io, Google DNS and crt.sh are used without a key.

---
Built by [Semyon Morgunov](https://s.morgunov.tech) with Claude Code as pair programmer.
