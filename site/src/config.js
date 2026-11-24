// Constants shared by the page modules. One version number names a release: the same string
// lives in worker/src/index.js (VERSION), worker/package.json and the top entry of CHANGELOG.md.
export const APP_VERSION = '3.0.0';

export const PERSONAL_URL = 'https://s.morgunov.tech';
export const CANONICAL_URL = 'https://fprint.morgunov.tech';

// The Worker answers on the site's own host (a route for fprint.morgunov.tech/api/*), so on the
// live site these calls are same-origin. The address is absolute rather than '/api' so a local
// copy on port 3000 still reaches the deployed Worker (CORS allows that origin).
export const WORKER_API = 'https://fprint.morgunov.tech';

export const LANGS = ['ru', 'en', 'uz'];
export const LOCALES = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' };
export const LANG_FLAGS = { ru: '🇷🇺', en: '🇬🇧', uz: '🇺🇿' };

export const THEME_KEY = 'fp_theme';
export const LANG_KEY = 'fp_lang';
