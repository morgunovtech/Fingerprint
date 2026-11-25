// Constants shared by the page modules. One version number names a release: the same string
// lives in worker/src/index.js (VERSION), worker/package.json and the top entry of CHANGELOG.md.
export const APP_VERSION = '3.3.1';

export const PERSONAL_URL = 'https://s.morgunov.tech';
export const CANONICAL_URL = 'https://fprint.morgunov.tech';
// The build mark of the family footer leads here: the history of versions on GitHub
// (ds/v1/USAGE.md in about-me-page, "Build mark").
export const CHANGELOG_URL = 'https://github.com/morgunovtech/Fingerprint/blob/main/CHANGELOG.md';

// The Worker answers on the site's own host (a route for fprint.morgunov.tech/api/*), so on the
// live site these calls are same-origin. The address is absolute rather than '/api' so a local
// copy on port 3000 still reaches the deployed Worker (CORS allows that origin).
export const WORKER_API = 'https://fprint.morgunov.tech';

export const LANGS = ['ru', 'en', 'uz'];
export const LOCALES = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' };

// The theme is the family chrome's: src/theme-init.js sets data-theme on <html> before first paint
// and src/chrome.js (a copy of the design system's script) switches it and keeps the choice under
// the theme-preference key. The key is per origin, so a theme picked here stays on this page.
export const LANG_KEY = 'fp_lang';
