// The theme before first paint, the way every morgunov.tech page does it (ds/v1/USAGE.md in
// about-me-page): data-theme on <html> is the attribute the design system's tokens switch on
// (light, dark, high-contrast), and data-theme-preference keeps the choice itself, "auto"
// included. A plain script in the <head>, not a module, so it runs before the stylesheets arrive
// and the first paint already has the right colours. theme-preference is the key every
// morgunov.tech page shares; fp_theme is the key this page used before 3.1.0 (its "contrast" is
// "high-contrast"), read here as a fallback and moved to the shared key by src/app.js.
(function () {
  var root = document.documentElement;
  var pref = null;
  try {
    pref = localStorage.getItem('theme-preference');
    if (!pref) {
      pref = localStorage.getItem('fp_theme');
      if (pref === 'contrast') pref = 'high-contrast';
    }
  } catch (e) { /* storage blocked (Chrome "block all cookies", some webviews): the system setting decides */ }
  if (pref !== 'light' && pref !== 'dark' && pref !== 'high-contrast') pref = 'auto';
  var dark = false;
  try { dark = window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { /* no matchMedia: light */ }
  root.setAttribute('data-theme', pref === 'auto' ? (dark ? 'dark' : 'light') : pref);
  root.setAttribute('data-theme-preference', pref);
})();
