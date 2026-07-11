/* ═══ Project sidebar auto-loader ═══════════════════════════════
   Populates every <aside class="project-sidebar" data-auto-sidebar>
   on the page from ../assets/data/main/projects.json (path is
   relative to /projects/, where every project page — including
   wip.html — now lives).

   To add a new project: add one entry to projects.json. Every
   existing project page's sidebar updates automatically, no need
   to touch each page's HTML.
   ══════════════════════════════════════════════════════════════ */
(function () {
  function currentFile() {
    var path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  function render(container, projects) {
    var here = currentFile();
    var label = document.createElement('span');
    label.className = 'sidebar-label';
    label.textContent = 'All Projects';
    container.appendChild(label);

    projects.forEach(function (p) {
      var a = document.createElement('a');
      a.href = p.file;
      a.className = 'sidebar-link' + (p.file === here ? ' current' : '');
      a.innerHTML = p.title;
      container.appendChild(a);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var containers = document.querySelectorAll('[data-auto-sidebar]');
    if (!containers.length) return;

    fetch('../assets/data/main/projects.json')
      .then(function (res) { return res.json(); })
      .then(function (projects) {
        containers.forEach(function (c) { render(c, projects); });
      })
      .catch(function (err) {
        console.error('Project sidebar failed to load:', err);
      });
  });
})();
