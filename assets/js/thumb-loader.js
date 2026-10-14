/**
 * Auto-loads showcase tile thumbnails on the index page from the same
 * numbered images used on each project's page — no separate "showcase"
 * image set to maintain. Drop "colimbs-1.jpg" in assets/img/projects/
 * and it becomes both the project page's lead image AND its index tile
 * thumbnail automatically.
 *
 * Usage in HTML:
 *   <div class="tile-static" data-prefix="colimbs">
 *     <div class="tile-placeholder">...</div>  <!-- stays as fallback -->
 *   </div>
 *
 * Requires img-probe.js to be loaded first (same-order <script defer> tag).
 */
(function () {
  function findThumb(prefix, n) {
    return window.ImgProbe.findImage(`assets/img/projects/${prefix}-${n || 1}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile-static[data-prefix]');
    // Run every tile's lookup in parallel instead of one-by-one — otherwise
    // the whole grid would wait on tile 1 to fully resolve before tile 2
    // even started probing.
    Promise.all([...tiles].map(async (tile) => {
      const prefix = tile.dataset.prefix;
      const url = await findThumb(prefix, parseInt(tile.dataset.lead, 10) || 1);
      if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = tile.dataset.alt || prefix;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        tile.insertBefore(img, tile.firstChild);
        tile.classList.add('has-thumb');
      }
      // If no image found, the existing .tile-placeholder stays visible.
    }));
  });
})();
