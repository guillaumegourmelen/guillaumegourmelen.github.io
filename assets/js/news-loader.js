/**
 * Loads the "Updates" timeline from assets/data/news.json so it can be
 * edited as plain text/JSON without touching index.html or any other
 * page. Add a new entry to news.json (copy the shape of an existing
 * one) and it appears here automatically, already sorted newest-first.
 *
 * news.json fields:
 *   date       - display string, e.g. "May 2026" (also used for sorting,
 *                so keep it parseable as "Mon YYYY")
 *   tag        - short label shown on the entry, e.g. "Talk", "Paper"
 *   category   - one of "talk" | "chair" | "misc" (controls the dot/tag color)
 *   headline   - the main text of the entry
 *   link_url   - optional; leave "" for no link
 *   link_label - optional; text for the link, e.g. "ACM DL", "Program"
 */
(function () {
  const MONTHS = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  function parseDate(dateStr) {
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length !== 2) return new Date(0);
    const month = MONTHS[parts[0].slice(0, 3).toLowerCase()] ?? 0;
    const year = parseInt(parts[1], 10) || 0;
    return new Date(year, month, 1);
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;');
  }

  async function loadNews() {
    const container = document.querySelector('.news-list[data-source="news.json"]');
    if (!container) return;
    try {
      const res = await fetch('assets/data/news.json');
      if (!res.ok) throw new Error('news.json fetch failed: ' + res.status);
      const items = await res.json();
      items.sort((a, b) => parseDate(b.date) - parseDate(a.date));

      container.innerHTML = items.map(item => {
        const linkHtml = item.link_url
          ? `<span class="news-sub"><a href="${escapeAttr(item.link_url)}" target="_blank">${item.link_label || 'Link'} ↗</a></span>`
          : '';
        return `
    <div class="news-item">
      <div class="news-date">${item.date}</div><div class="news-dot ${item.category}"></div>
      <div class="news-content">
        <span class="news-tag ${item.category}">${item.tag}</span>
        <span class="news-headline">${item.headline}</span>
        ${linkHtml}
      </div>
    </div>`;
      }).join('');
    } catch (err) {
      console.error('[news-loader] Failed to load news.json:', err);
      container.innerHTML = '<p style="font-size:12px;color:var(--muted);">Updates temporarily unavailable.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadNews);
})();
