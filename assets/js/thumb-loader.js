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

  async function findThumb(prefix) {
    for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
      const url = `assets/img/projects/${prefix}-1.${ext}`;
      const found = await tryLoad(url);
      if (found) return found;
    }
    return null;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const tiles = document.querySelectorAll('.tile-static[data-prefix]');
    for (const tile of tiles) {
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
    }
  });
})();
