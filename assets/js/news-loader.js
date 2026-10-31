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
    const month = parts.length === 2 ? MONTHS[parts[0].slice(0, 3).toLowerCase()] : undefined;
    const year = parts.length === 2 ? parseInt(parts[1], 10) : NaN;
    if (parts.length !== 2 || month === undefined || Number.isNaN(year)) {
      console.warn(`[news-loader] Unparseable date "${dateStr}" (expected "Mon YYYY") — sorting as oldest.`);
      return new Date(0);
    }
    return new Date(year, month, 1);
  }

  const CATEGORIES = ['talk', 'chair', 'misc'];

  // Only allow a safe http(s) URL through to an href — rejects
  // javascript:, data:, and anything malformed, by resolving against the
  // page URL and checking the resulting protocol (not the raw string).
  function safeUrl(value) {
    try {
      const url = new URL(String(value), location.href);
      return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : null;
    } catch {
      return null;
    }
  }

  function buildNewsItem(item) {
    const category = CATEGORIES.includes(item.category) ? item.category : 'misc';

    const el = document.createElement('div');
    el.className = 'news-item';

    const date = document.createElement('div');
    date.className = 'news-date';
    date.textContent = String(item.date ?? '');
    el.appendChild(date);

    const dot = document.createElement('div');
    dot.className = 'news-dot ' + category;
    el.appendChild(dot);

    const content = document.createElement('div');
    content.className = 'news-content';

    const tag = document.createElement('span');
    tag.className = 'news-tag ' + category;
    tag.textContent = String(item.tag ?? '');
    content.appendChild(tag);

    const headline = document.createElement('span');
    headline.className = 'news-headline';
    headline.textContent = String(item.headline ?? '');
    content.appendChild(headline);

    const href = item.link_url ? safeUrl(item.link_url) : null;
    if (href) {
      const sub = document.createElement('span');
      sub.className = 'news-sub';
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = (item.link_label || 'Link') + ' ↗';
      sub.appendChild(a);
      content.appendChild(sub);
    }

    el.appendChild(content);
    return el;
  }

  async function loadNews() {
    const container = document.querySelector('.news-list[data-source="news.json"]');
    if (!container) return;
    try {
      const res = await fetch('assets/data/main/news.json');
      if (!res.ok) throw new Error('news.json fetch failed: ' + res.status);
      const items = await res.json();
      if (!Array.isArray(items)) throw new Error('news.json did not contain an array');
      items.sort((a, b) => parseDate(b.date) - parseDate(a.date));

      container.replaceChildren(...items.map(buildNewsItem));
    } catch (err) {
      console.error('[news-loader] Failed to load news.json:', err);
      const fallback = document.createElement('p');
      fallback.style.fontSize = '12px';
      fallback.style.color = 'var(--muted)';
      fallback.textContent = 'Updates temporarily unavailable.';
      container.replaceChildren(fallback);
    }
  }

  document.addEventListener('DOMContentLoaded', loadNews);
})();
