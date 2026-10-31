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
 *
 * Requires img-probe.js to be loaded first (same-order <script defer> tag).
 */
(function () {
  function findImage(prefix, n) {
    return window.ImgProbe.findImage(`../assets/img/projects/${prefix}-${n}`);
  }

  async function initLeadImages() {
    const leads = document.querySelectorAll('[data-role="lead"][data-prefix]');
    await Promise.all([...leads].map(async (el) => {
      const prefix = el.dataset.prefix;
      // data-lead="N" picks which numbered image is the lead (default 1)
      const url = await findImage(prefix, parseInt(el.dataset.lead, 10) || 1);
      if (url) {
        const img = new Image();
        img.onload = () => {
          // Detect orientation so portrait photos (e.g. a shoulder pad
          // worn upright) don't get squashed/cropped into the default
          // landscape box. Portrait images get a taller box and
          // object-fit:contain so the full frame is always visible;
          // landscape/square images keep the original cover behavior.
          const isPortrait = img.naturalHeight > img.naturalWidth * 1.05;
          el.classList.add('has-image');
          if (isPortrait) el.classList.add('is-portrait');
          const leadImg = document.createElement('img');
          leadImg.src = url;
          leadImg.alt = el.dataset.alt || prefix;
          leadImg.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
          el.replaceChildren(leadImg);
          el.style.cursor = 'zoom-in';
          el.setAttribute('role', 'button');
          el.setAttribute('tabindex', '0');
          if (!el.hasAttribute('aria-label')) el.setAttribute('aria-label', `Enlarge ${el.dataset.alt || prefix}`);
          const activateLead = () => openLightbox(url, el.dataset.alt || prefix, el);
          el.addEventListener('click', activateLead);
          el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateLead(); }
          });
        };
        img.src = url;
      }
      // If no image found, the lead placeholder (already in the HTML) stays visible.
    }));
  }

  function buildTile(url, prefix) {
    // Orientation detected client-side once the browser has decoded the
    // image; portrait tiles get a narrower box + object-fit:contain so
    // nothing gets cropped into a square, instead of every tile being
    // forced into the same wide landscape box.
    return `<div class="gallery-item" data-full-src="${url}"><img src="${url}" alt="${prefix} project photo" loading="lazy" decoding="async" onload="
      if (this.naturalHeight > this.naturalWidth * 1.05) {
        this.parentElement.classList.add('is-portrait');
        this.style.objectFit = 'contain';
        this.style.background = 'var(--border)';
      }
    "></div>`;
  }

  // ── Lightbox: click any gallery tile to view it enlarged, click
  // anywhere on the overlay (or the image itself), press Escape, or use
  // the close button to dismiss it. One shared overlay is created lazily
  // on first use and reused for every gallery on the page. Minimal dialog
  // semantics: role="dialog", focus moves to the close button on open and
  // back to whichever tile opened it on close.
  let lightboxEl = null;
  let lightboxOpener = null;
  function getLightbox() {
    if (lightboxEl) return lightboxEl;
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'gallery-lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Enlarged photo');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'gallery-lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

    const img = document.createElement('img');
    img.alt = '';

    lightboxEl.append(closeBtn, img);
    lightboxEl.addEventListener('click', (e) => { if (e.target === lightboxEl) closeLightbox(); });
    document.body.appendChild(lightboxEl);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxEl.classList.contains('open')) closeLightbox();
    });
    return lightboxEl;
  }
  function openLightbox(src, alt, opener) {
    const box = getLightbox();
    box.querySelector('img').src = src;
    box.querySelector('img').alt = alt || '';
    box.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxOpener = opener || document.activeElement;
    box.querySelector('.gallery-lightbox-close').focus();
  }
  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('open');
    document.body.style.overflow = '';
    if (lightboxOpener && typeof lightboxOpener.focus === 'function') lightboxOpener.focus();
    lightboxOpener = null;
  }

  function wireLightboxClicks(gallery, prefix) {
    gallery.querySelectorAll('.gallery-item').forEach((tile) => {
      tile.style.cursor = 'zoom-in';
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      if (!tile.hasAttribute('aria-label')) tile.setAttribute('aria-label', `Enlarge ${prefix} project photo`);
      const activate = () => openLightbox(tile.dataset.fullSrc, `${prefix} project photo`, tile);
      tile.addEventListener('click', activate);
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
      });
    });
  }

  async function initGalleries() {
    const galleries = document.querySelectorAll('.auto-gallery[data-prefix]');
    await Promise.all([...galleries].map(async (gallery) => {
      const prefix = gallery.dataset.prefix;
      const max = parseInt(gallery.dataset.max || '12', 10);
      const skipFirst = gallery.dataset.skipLead === 'true'; // lead image (n=1) already shown elsewhere
      const start = skipFirst ? 2 : 1;

      // Probe every number in the range IN PARALLEL too — all numbers
      // fire at once instead of waiting for each one to finish before
      // starting the next. Results keep their original index so the
      // gallery order stays 1, 2, 3... even though requests finish
      // out of order.
      const numbers = [];
      for (let n = start; n <= max; n++) numbers.push(n);
      const results = await Promise.all(numbers.map((n) => findImage(prefix, n)));
      const found = results.filter((url) => url !== null);

      if (found.length === 0) {
        gallery.style.display = 'none';
        return;
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
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (track.scrollWidth > gallery.clientWidth + 4) {
          if (reduceMotion) {
            // No auto-scroll, no tile duplication — instead a plain
            // horizontally-scrollable, keyboard-focusable region so every
            // image stays reachable without relying on motion.
            gallery.classList.add('auto-gallery-manual');
            gallery.setAttribute('tabindex', '0');
            gallery.setAttribute('role', 'region');
            gallery.setAttribute('aria-label', prefix + ' project gallery, scroll horizontally');
          } else {
            // Duplicate the tiles once so the loop has a seamless second
            // copy to scroll into, then size the animation to exactly
            // the width of one copy for a perfectly seamless loop.
            track.innerHTML += track.innerHTML;
            const singleSetWidth = track.scrollWidth / 2;
            track.style.setProperty('--scroll-distance', `-${singleSetWidth}px`);
            gallery.classList.add('auto-gallery-scrolling');
            // Keyboard-accessible pause to match the existing hover-pause
            // (see .auto-gallery-scrolling:focus-within in project.css).
            gallery.setAttribute('tabindex', '0');
            gallery.setAttribute('role', 'region');
            gallery.setAttribute('aria-label', prefix + ' project gallery, auto-scrolling — focus to pause');
          }
        }
        // Wire click-to-enlarge AFTER any duplication above, so both
        // copies of the tiles (original + seamless-loop duplicate) open
        // the lightbox correctly.
        wireLightboxClicks(gallery, prefix);
      });
    }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLeadImages();
    initGalleries();
  });
})();

