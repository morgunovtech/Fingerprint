# Fingerprint

A privacy check for everyday users: it shows what any website learns about your browser the moment you open it, how unique that makes you, and how to be harder to track.

**Live:** https://fprint.morgunov.tech · **License:** [MIT](LICENSE)

## What it does

- **What a site sees instantly.** Browser and OS, screen and monitors, GPU, CPU cores and memory, languages and timezone, fonts, Canvas and audio hashes, storage, permissions, battery, media devices. No prompts needed. A profile section turns these into plain guesses: device model, likely region, VPN likelihood, WebRTC IP leak.
- **Uniqueness estimate.** Each signal is weighted by how common it is (frequency tables based on EFF Panopticlick and FingerprintJS research, with correlated signals counted once), and the result is ranked against 25,000 simulated browsers.
- **Tips to protect yourself.** Advice matched to what was found, such as a timezone that doesn't match your IP, a WebRTC leak or an exposed Canvas fingerprint, with steps for Chrome, Firefox, Brave and Safari.
- **Tracker simulation.** Five checks: three ad-blocker bait elements (tracking pixel, analytics script, ad frame), Do Not Track and Global Privacy Control.
- **Server-side view.** Click "Check network" and the Worker shows what a server sees before any JavaScript runs (IP, ISP and ASN, TLS version, HTTP protocol, header order, Client Hints), and the page flags where that disagrees with the browser. You also get connection type (home, mobile, data center, VPN), a check against 8 DNS blocklists, reverse DNS and a speed test. The Worker's `/api/scan` also accepts a domain (DNS, WHOIS, certificates from CT logs, security headers); the page itself only scans your IP.
- **Story Mode.** The same data told as a walk from opening your laptop to watching a YouTube video: who sees what at each step, why it matters, what to do. Toggle it in the header or open `?mode=story`.
- Russian, English and Uzbek; light, dark and high-contrast themes; share and print.

## Privacy

- **Computed in your browser:** all fingerprint signals, the uniqueness score, the profile and the tracker checks. The page does not upload them, and no third party sees your fingerprint. The only outside script is Cloudflare's page-view counter (below), which Pages adds.
- **The Worker** gets your IP and request headers, as any server does. On page load the page only reads aggregate stats from it. A per-IP rate-limit counter lives in Workers KV and expires after 60 seconds.
- **"Check network"** calls `/api/whoami` (your IP, Cloudflare's location and ASN for it, your headers; returned to you, not stored), the speed test, and `/api/scan` for your IP. The scan queries ipquery.io (ipinfo.io as fallback), whoisjson.com and Google DNS (records and blocklists); the report is cached in KV under your IP for one hour. Only if the Worker is down does the browser ask public IP services directly: ipapi.co and freeipapi.com, then ipify.org and myip.com if those fail too.
- **Anonymous stats:** each `/api/whoami` call adds one to aggregate counters: total checks, browser and major version, OS, country, TLS version. No IP, no ID, no timestamps. The page uses them for the "fingerprints checked" footer and the "X% of visitors" hints (after 100 checks). Anyone can read them at `/api/stats`.
- **Cloudflare Web Analytics** counts page views without cookies.

## How it's built

- `site/` is what Cloudflare Pages serves. No build step, no framework, no npm. `index.html` is the whole app: markup, styles and one inline script with the RU/EN/UZ strings, the uniqueness model and Story Mode. `src/profiler.js` is an ES module the page imports for the profile. Plus `_headers`, `404.html`, `robots.txt`, `sitemap.xml` and `share-card.svg`.
- `worker/` is the Cloudflare Worker `fingerprint-api` in plain JavaScript, no runtime dependencies: `/api/whoami`, `/api/check` (plain text for `curl`), `/api/scan`, `/api/speedtest/*`, `/api/stats`, `/api/health`. Workers KV holds the scan cache, the stats and the rate limit (60 requests per minute per IP).
- `selftest.js` runs the inline script and `profiler.js` in a Node `vm` sandbox with a stub DOM and checks the helpers, the score, translation key parity and the UI controls. CI runs it on every PR, along with a Worker dry-run build, `npm audit` and gitleaks.

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

The page talks to the deployed Worker (`WORKER_API` in `site/index.html`). Port 3000 is in the Worker's `ALLOWED_ORIGINS`; on the default port 8788 CORS blocks those calls. To try your local Worker, point `WORKER_API` at `http://localhost:8787`.

## Deploy

- **Site:** Cloudflare Pages deploys `main` and serves `site/` (`pages_build_output_dir` in the root `wrangler.toml`).
- **Worker:** deployed by hand with `cd worker && npm run deploy` (runs `wrangler deploy`). `worker/wrangler.toml` holds the `CACHE` KV binding and `ALLOWED_ORIGINS`.

For your own copy: create a KV namespace (`npx wrangler kv namespace create CACHE`), put its id in `worker/wrangler.toml`, set `ALLOWED_ORIGINS` to your site, and in `site/index.html` point `WORKER_API` at your Worker. The Worker needs no API keys or secrets: every outside service it calls is free and keyless.

---
Built by [Semyon Morgunov](https://s.morgunov.tech) with Claude Code as pair programmer.
