/* ═══ Project footer auto-loader ═══════════════════════════════
   Populates every <footer data-auto-footer> on a project page with
   the same "Back to home" line and a tagline. Pass data-tagline on
   the element to override the default tagline for that project.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var DEFAULT_TAGLINE = 'Robotics · Teleoperation · Embodiment';

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('footer[data-auto-footer]').forEach(function (footer) {
      var tagline = footer.getAttribute('data-tagline') || DEFAULT_TAGLINE;
      footer.innerHTML =
        '<span>Guillaume Gourmelen · <a href="../index.html">Back to home</a></span>' +
        '<span>' + tagline + '</span>';
    });
  });
})();
