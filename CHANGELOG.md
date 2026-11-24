# Changelog

What changed for the people who use the page or call the Worker. The site's own changelog modal (the version badge in the footer) shows the same entries in Russian, English and Uzbek. Versions up to 2.1 had two parts and are kept as they were; from 2.2.0 they follow SemVer and every release is tagged `vX.Y.Z`.

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
