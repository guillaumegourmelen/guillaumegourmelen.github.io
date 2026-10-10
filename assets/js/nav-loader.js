/* ═══ Shared site navigation ═════════════════════════════════════
   Renders the same header (logo, theme toggle, CV/Short Bio/
   Consulting/Interprete pills, section links, mobile burger menu)
   into every <nav data-auto-nav> placeholder, on every page.

   This script is loaded WITHOUT `defer`, directly after the <nav>
   placeholder in the page markup, so it runs synchronously during
   parsing and the header is in place before anything below it is
   even parsed — no flash of an empty nav.

   data-root on the placeholder is the relative path back to the
   site root ("" on index.html/about.html/etc., "../" from /projects/).
   ══════════════════════════════════════════════════════════════ */
(function () {
  var nav = document.currentScript.previousElementSibling;
  if (!nav || !nav.hasAttribute('data-auto-nav')) {
    nav = document.querySelector('nav[data-auto-nav]');
  }
  if (!nav) return;

  var root = nav.getAttribute('data-root') || '';
  var here = (window.location.pathname.split('/').pop() || 'index.html');
  var onIndex = (here === '' || here === 'index.html');
  var ctaHref = nav.getAttribute('data-cta-href');
  var ctaLabel = nav.getAttribute('data-cta-label');

  function hashLink(id) {
    return onIndex ? ('#' + id) : (root + 'index.html#' + id);
  }
  function isCurrent(file) {
    return here === file;
  }

  var sunMoon =
    '<svg class="theme-icon-sun" width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="4.5" stroke="currentColor" stroke-width="1.4"/><path d="M10 1.5v2.5M10 16v2.5M2.6 10H5M15 10h2.4M4.5 4.5l1.8 1.8M13.7 13.7l1.8 1.8M15.5 4.5l-1.8 1.8M6.3 13.7l-1.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
    '<svg class="theme-icon-moon" width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M16.5 12.6A7.2 7.2 0 0 1 7.4 3.5a7.2 7.2 0 1 0 9.1 9.1Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';

  nav.innerHTML =
    '<a class="nav-logo" href="' + root + 'index.html">G. Gourmelen</a>' +
    '<button class="nav-burger" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav-links"><span></span><span></span><span></span></button>' +
    '<div class="nav-tools">' +
      '<button class="theme-toggle" aria-label="Toggle dark mode" onclick="toggleTheme()" title="Toggle dark mode">' + sunMoon + '</button>' +
      '<div class="nav-pills">' +
        '<a class="nav-pill" href="' + root + 'assets/data/main/CV-Gourmelen.pdf" target="_blank">CV &#8595;</a>' +
        '<a class="nav-pill' + (isCurrent('about.html') ? ' active' : '') + '" href="' + root + 'about.html">Short Bio &#8599;</a>' +
        '<a class="nav-pill nav-pill-accent2' + (isCurrent('consulting.html') ? ' active' : '') + '" href="' + root + 'consulting.html">Consulting</a>' +
        '<a class="nav-pill nav-pill-accent' + (isCurrent('interprete.html') ? ' active' : '') + '" href="' + root + 'interprete.html">Interpr&#233;tariat FR-JP</a>' +
        (ctaHref ? '<a class="nav-cta" href="' + ctaHref + '">' + ctaLabel + '</a>' : '') +
      '</div>' +
    '</div>' +
    '<ul class="nav-links" id="nav-links">' +
      '<li><a href="' + hashLink('research') + '">Research</a></li>' +
      '<li><a href="' + hashLink('about') + '">About</a></li>' +
      '<li><a href="' + hashLink('news') + '">News</a></li>' +
      '<li><a href="' + hashLink('publications') + '">Publications</a></li>' +
      '<li><a href="' + hashLink('experience') + '">Experience</a></li>' +
      '<li><a class="' + (isCurrent('service.html') ? 'active' : '') + '" href="' + root + 'service.html">Teaching, Talks &amp; Service</a></li>' +
      '<li><a href="' + hashLink('video-lab') + '">Videos</a></li>' +
      '<li><a href="' + hashLink('wip') + '">WIP</a></li>' +
      '<li><a href="' + hashLink('contact') + '">Contact</a></li>' +
      '<li class="mobile-only"><a class="' + (isCurrent('about.html') ? 'active' : '') + '" href="' + root + 'about.html">Short Bio &#8599;</a></li>' +
      '<li class="mobile-only"><a href="' + root + 'assets/data/main/CV-Gourmelen.pdf" target="_blank">CV Download</a></li>' +
      '<li class="mobile-only"><a class="' + (isCurrent('consulting.html') ? 'active' : '') + '" href="' + root + 'consulting.html">Consulting</a></li>' +
      '<li class="mobile-only"><a class="' + (isCurrent('interprete.html') ? 'active' : '') + '" href="' + root + 'interprete.html">Interpr&#233;tariat FR-JP</a></li>' +
      (ctaHref ? '<li class="mobile-only"><a href="' + ctaHref + '">' + ctaLabel + '</a></li>' : '') +
    '</ul>';

  var burger = nav.querySelector('.nav-burger');
  var links = nav.querySelector('#nav-links');

  function closeMenu() {
    links.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelectorAll('span').forEach(function (s) { s.style.transform = ''; s.style.opacity = ''; });
  }

  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    var bars = burger.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'translateY(5px) rotate(45deg)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'translateY(-5px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity = '';
      bars[2].style.transform = '';
    }
  });

  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
})();
