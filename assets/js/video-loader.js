/**
 * Shared YouTube embed loader for project pages.
 * Depends on assets/js/videos.js being loaded first (defines VIDEO_LIBRARY).
 *
 * Usage in HTML:
 *   <div class="video-placeholder" data-video-key="colimbs.demo">...</div>
 *
 * On page load, any .video-placeholder with a data-video-key:
 *   1. Gets YouTube's own real thumbnail set as its background image
 *      (the exact image YouTube shows — maxresdefault.jpg, falling back
 *      to hqdefault.jpg if the video wasn't uploaded in HD).
 *   2. Gets a click handler that swaps in the live embedded player.
 * No inline onclick / hardcoded URL needed in the HTML.
 */
// Standard YouTube video ID shape — anything else is rejected rather than
// used to build an embed URL, however unlikely a bad value is here (IDs
// come from the repo-controlled VIDEO_LIBRARY in videos.js, not user input).
const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

function videoTitleFor(el) {
  const card = el.closest('.video-card');
  const label = card && card.querySelector('.video-card-title');
  if (label && label.textContent.trim()) return label.textContent.trim();
  const pageTitle = document.title.split('—')[0].trim();
  return (pageTitle || 'Project') + ' — demo video';
}

function loadVid(el, id) {
  if (!YOUTUBE_ID_RE.test(id)) {
    console.warn(`[video-loader] Rejected malformed video id "${id}"`);
    return;
  }
  const wrap = el.parentElement;
  const iframe = document.createElement('iframe');
  // referrerpolicy + youtube-nocookie.com avoid the "Error 153: Video player
  // configuration error" that YouTube throws when it can't see a valid
  // referrer/origin header (common on static sites with strict referrer
  // policies). Nothing to change on the YouTube/Studio side for this.
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  iframe.title = videoTitleFor(el);
  iframe.allow = 'autoplay;fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  wrap.replaceChildren(iframe);
}

function setThumbnail(el, id) {
  // Try maxresdefault first (the real, full-quality YouTube thumbnail);
  // if that 404s (common for older/lower-res uploads), fall back to
  // hqdefault, which YouTube generates for every video without exception.
  const probe = new Image();
  probe.onload = () => {
    // maxresdefault 404s render as a small grey placeholder (120x90) on
    // some CDNs instead of a real 404 — treat anything that small as a miss.
    const url = (probe.naturalWidth > 120)
      ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
      : `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    el.style.backgroundImage = `url('${url}')`;
  };
  probe.onerror = () => {
    el.style.backgroundImage = `url('https://img.youtube.com/vi/${id}/hqdefault.jpg')`;
  };
  probe.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-placeholder[data-video-key]').forEach(el => {
    const key = el.dataset.videoKey;
    const id = (typeof VIDEO_LIBRARY !== 'undefined') ? VIDEO_LIBRARY[key] : undefined;
    if (!id) {
      console.warn(`[video-loader] No video found for key "${key}" in videos.js`);
      return;
    }
    el.style.cursor = 'pointer';
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    setThumbnail(el, id);

    // Keyboard-operable launcher: a <button> would be the simplest way to
    // get this for free, but these placeholders are styled/positioned divs
    // across many pages — role+tabindex+key handling gets the same Tab/
    // Enter/Space behavior without restructuring every page's markup.
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', 'Play ' + videoTitleFor(el));
    const activate = () => loadVid(el, id);
    el.addEventListener('click', activate);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
});
