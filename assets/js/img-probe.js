/**
 * Shared image-extension prober used by thumb-loader.js and gallery-loader.js.
 * Given a base path with no extension, tries every candidate extension in
 * parallel and resolves to the first URL that actually loads, or null.
 */
(function () {
  const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  function tryLoad(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }

  async function findImage(base) {
    const results = await Promise.all(EXTS.map((ext) => tryLoad(`${base}.${ext}`)));
    return results.find((url) => url !== null) || null;
  }

  window.ImgProbe = { tryLoad, findImage };
})();
