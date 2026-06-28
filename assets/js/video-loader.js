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
function loadVid(el, url) {
  const wrap = el.parentElement;
  // referrerpolicy + youtube-nocookie.com avoid the "Error 153: Video player
  // configuration error" that YouTube throws when it can't see a valid
  // referrer/origin header (common on static sites with strict referrer
  // policies). Nothing to change on the YouTube/Studio side for this.
  wrap.innerHTML = `<iframe src="${url}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
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
    el.addEventListener('click', () => loadVid(el, `https://www.youtube-nocookie.com/embed/${id}`));
  });
});
