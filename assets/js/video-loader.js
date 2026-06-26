/**
 * Shared YouTube embed loader for project pages.
 * Depends on assets/js/videos.js being loaded first (defines VIDEO_LIBRARY).
 *
 * Usage in HTML:
 *   <div class="video-placeholder" data-video-key="colimbs.demo">...</div>
 *
 * On page load, any .video-placeholder with a data-video-key gets its click
 * handler wired up automatically — no inline onclick / hardcoded URL needed.
 */
function loadVid(el, url) {
  const wrap = el.parentElement;
  // referrerpolicy + youtube-nocookie.com avoid the "Error 153: Video player
  // configuration error" that YouTube throws when it can't see a valid
  // referrer/origin header (common on static sites with strict referrer
  // policies). Nothing to change on the YouTube/Studio side for this.
  wrap.innerHTML = `<iframe src="${url}?autoplay=1" allow="autoplay;fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
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
    el.addEventListener('click', () => loadVid(el, `https://www.youtube-nocookie.com/embed/${id}`));
  });
});
