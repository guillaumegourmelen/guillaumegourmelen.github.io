/* ═══ Shared dark-mode toggle ═══════════════════════════════════
   Used by the theme-toggle button on every page (see nav-loader.js).
   The anti-flash theme-DETECTION script in each page's <head> stays
   inline on purpose — it must run before first paint, so it can't
   wait on an external file — but this toggle only runs on click,
   so it's safe to share from one file.
   ══════════════════════════════════════════════════════════════ */
function toggleTheme(){
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
}
