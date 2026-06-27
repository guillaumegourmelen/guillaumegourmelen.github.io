/**
 * Auto-detecting project gallery, rendered as a horizontal auto-scroll
 * ticker (images drift left continuously, pause on hover, loop seamlessly).
 *
 * Usage in HTML — just declare the prefix, nothing else:
 *   <div class="auto-gallery" data-prefix="colimbs" data-max="12"></div>
 *
 * On load, this probes ../assets/img/projects/<prefix>-1.jpg,
 * <prefix>-2.jpg, ... up to data-max (default 12), trying several
 * extensions for each number, and renders only the ones that exist.
 * No empty boxes, no manual placeholder divs — to add a picture, just
 * drop "colimbs-5.jpg" in assets/img/projects/ and reload the page.
 *
 * If the found images are wider than the container, they scroll
 * automatically (CSS animation, GPU-friendly, pauses on hover/focus).
 * If they fit without overflow, the track just sits still — no motion
 * for motion's sake.
 *
 * The very first image found (e.g. colimbs-1.jpg) is also used as the
 * "lead" image next to the intro text, via data-role="lead" elements
 * that share the same data-prefix.
 */
(function () {
  function tryLoad(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function findImage(prefix, n) {
    const base = `../assets/img/projects/${prefix}-${n}`;
    for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
      const url = `${base}.${ext}`;
      const found = await tryLoad(url);
      if (found) return found;
    }
    return null;
  }

  async function initLeadImages() {
    const leads = document.querySelectorAll('[data-role="lead"][data-prefix]');
    for (const el of leads) {
      const prefix = el.dataset.prefix;
      const url = await findImage(prefix, 1);
      if (url) {
        el.innerHTML = `<img src="${url}" alt="${el.dataset.alt || prefix}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
        el.classList.add('has-image');
      }
      // If no image found, the lead placeholder (already in the HTML) stays visible.
    }
  }

  function buildTile(url, prefix) {
    return `<div class="gallery-item"><img src="${url}" alt="${prefix} project photo" loading="lazy"></div>`;
  }

  async function initGalleries() {
    const galleries = document.querySelectorAll('.auto-gallery[data-prefix]');
    for (const gallery of galleries) {
      const prefix = gallery.dataset.prefix;
      const max = parseInt(gallery.dataset.max || '12', 10);
      const skipFirst = gallery.dataset.skipLead === 'true'; // lead image (n=1) already shown elsewhere
      const start = skipFirst ? 2 : 1;
      const found = [];
      for (let n = start; n <= max; n++) {
        const url = await findImage(prefix, n);
        if (url) found.push(url);
        else if (n > start + 1 && found.length === 0) break; // no images at all, stop probing early
      }
      if (found.length === 0) {
        gallery.style.display = 'none';
        continue;
      }

      // Build the scrolling track. Wrap in an outer mask + inner track
      // so the CSS animation only needs to move the track, not manage
      // visibility — overflow:hidden on the mask handles clipping.
      gallery.classList.add('auto-gallery-ready');
      gallery.innerHTML = `
        <div class="gallery-track">
          ${found.map((url) => buildTile(url, prefix)).join('')}
        </div>`;

      // Only enable the scrolling animation if the track is actually
      // wider than its container — otherwise leave it static.
      requestAnimationFrame(() => {
        const track = gallery.querySelector('.gallery-track');
        if (track.scrollWidth > gallery.clientWidth + 4) {
          // Duplicate the tiles once so the loop has a seamless second
          // copy to scroll into, then size the animation to exactly
          // the width of one copy for a perfectly seamless loop.
          track.innerHTML += track.innerHTML;
          const singleSetWidth = track.scrollWidth / 2;
          track.style.setProperty('--scroll-distance', `-${singleSetWidth}px`);
          gallery.classList.add('auto-gallery-scrolling');
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLeadImages();
    initGalleries();
  });
})();

