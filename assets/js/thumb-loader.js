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

  // Probe every extension for this tile IN PARALLEL — same fix already
  // applied in gallery-loader.js. Previously this awaited one extension
  // at a time, so any prefix not saved as .jpg (e.g. body-sublimation's
  // .png) paid for 1-2 full failed round-trips before finding the real
  // file. Now all candidates fire at once; whichever resolves first wins.
  async function findThumb(prefix) {
    const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const results = await Promise.all(
      exts.map((ext) => tryLoad(`assets/img/projects/${prefix}-1.${ext}`))
    );
    return results.find((url) => url !== null) || null;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tiles = document.querySelectorAll('.tile-static[data-prefix]');
    // Also run every tile's lookup in parallel instead of one-by-one —
    // previously the whole grid waited on tile 1 to fully resolve before
    // tile 2 even started probing.
    Promise.all([...tiles].map(async (tile) => {
      const prefix = tile.dataset.prefix;
      const url = await findThumb(prefix);
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
