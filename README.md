# Fingerprint audit page

Static single-page application that calculates browser fingerprint entropy locally. The project is prepared for deployment on Cloudflare Pages.

## Development

```bash
npm run build
```

The build script copies everything from `src` into the `dist` folder. Deploy the `dist` directory on Cloudflare Pages and optionally wire a `/headers` endpoint (for example via Cloudflare Pages Functions) that returns request headers as JSON so the optional IP-based geo section works.
