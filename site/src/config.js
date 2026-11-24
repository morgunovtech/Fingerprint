// Constants shared by the page modules. One version number names a release: the same string
// lives in worker/src/index.js (VERSION), worker/package.json and the top entry of CHANGELOG.md.
export const APP_VERSION = '3.1.1';

export const PERSONAL_URL = 'https://s.morgunov.tech';
export const CANONICAL_URL = 'https://fprint.morgunov.tech';

// The Worker answers on the site's own host (a route for fprint.morgunov.tech/api/*), so on the
// live site these calls are same-origin. The address is absolute rather than '/api' so a local
// copy on port 3000 still reaches the deployed Worker (CORS allows that origin).
export const WORKER_API = 'https://fprint.morgunov.tech';

export const LANGS = ['ru', 'en', 'uz'];
export const LOCALES = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' };

// Themes switch on data-theme on <html>, the attribute the morgunov.tech design system's tokens
// read: light, dark, high-contrast; "auto" follows the system setting. theme-preference is the
// key every morgunov.tech page shares, so a theme picked here is the theme on s.morgunov.tech
// too; fp_theme is the key this page used before 3.1.0, read once and moved (its "contrast" is
// "high-contrast"). src/theme-init.js reads the same keys before first paint.
export const THEMES = ['auto', 'light', 'dark', 'high-contrast'];
export const THEME_KEY = 'theme-preference';
export const LEGACY_THEME_KEY = 'fp_theme';
export const LANG_KEY = 'fp_lang';
