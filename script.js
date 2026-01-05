
// ===== Config you update monthly =====
const LAST_UPDATED = '2026-01-01'; // ISO date string
const DATA_URL = 'references.json'; // CSL-JSON with `tags` merged in (see merge-tags.mjs)

// ===== Utilities =====
const $ = sel => document.querySelector(sel);
const norm = s => (s || '').toString().toLowerCase().trim();
const siteUrl = () => location.href.replace(location.hash,'').replace(location.search,'');

// Set dates/URL
$('#lastUpdated').textContent = LAST_UPDATED;
$('#lastUpdatedCite').textContent = LAST_UPDATED;
$('#siteUrl').textContent = siteUrl();

// ===== Data loading & normalization =====
async function loadData() {
  const res = await fetch(DATA_URL, { cache: 'no-store' });
  const data = await res.json(); // CSL-JSON array
  return data.map(e => ({
    id: e.id || '',
    type: (e.type || '').toLowerCase(),
    title: e.title || '',
    author: (e.author || []).map(a => [a.family, a.given].filter(Boolean).join(', ')).join('; '),
    year: (e.issued?.['date-parts']?.[0]?.[0] || '').toString(),
    doi: e.DOI || '',
    url: e.URL || '',
    journal: e['container-title'] || e['collection-title'] || '',
    tags: Array.isArray(e.tags) ? e.tags : []
  }));
}

function populateYears(entries) {
  const years = Array.from(new Set(entries.map(e => e.year).filter(Boolean)))
    .sort((a, b) => b.localeCompare(a));
  const sel = $('#yearFilter');
  for (const y of years) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    sel.appendChild(opt);
  }
}


function render(entries) {
  const container = document.getElementById('entries');
  container.innerHTML = '';

  for (const e of entries) {
    const el = document.createElement('article');
    el.className = 'entry';
    el.setAttribute('role', 'listitem');

    // Title
    const title = document.createElement('div');
    title.className = 'entry-title';
    title.textContent = e.title || '(No title)';

    // Meta
    const meta = document.createElement('div');
    meta.className = 'entry-meta';
    meta.textContent = [e.author, e.journal, e.year].filter(Boolean).join(' • ');

    // Links (URL, DOI, BibTeX id)
    const links = document.createElement('div');
    links.className = 'entry-links';

    const parts = [];

    if (e.url) {
      const a = document.createElement('a');
      a.href = e.url;
      a.textContent = 'URL';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      parts.push(a);
    }

    if (e.doi) {
      const a = document.createElement('a');
      a.href = `https://doi.org/${encodeURIComponent(e.doi)}`;
      a.textContent = 'DOI';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      parts.push(a);
    }

    if (e.id) {
      const span = document.createElement('span');
      span.title = 'BibTeX key';
      span.textContent = e.id;
      parts.push(span);
    }

    // Join with separators: " | "
    for (let i = 0; i < parts.length; i++) {
      links.appendChild(parts[i]);
      if (i < parts.length - 1) {
        links.appendChild(document.createTextNode(' | '));
      }
    }

    // Tags row
    const tagRow = document.createElement('div');
    (e.tags || []).forEach(t => {
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = t;
      tagRow.appendChild(b);
    });

    // Assemble entry
    el.appendChild(title);
    el.appendChild(links);
    el.appendChild(meta);
    el.appendChild(tagRow);

    container.appendChild(el);
  }

  document.getElementById('count').textContent = `${entries.length} item(s)`;
}


let ALL = [];

function applyFilters() {
  const q = norm($('#search').value);
  const y = $('#yearFilter').value;
  const checkedTags = Array.from(document.querySelectorAll('#tagFilter input[type=checkbox]:checked'))
                           .map(el => el.value);

  let out = ALL.slice();

  if (y) out = out.filter(e => e.year === y);

  if (q) {
    out = out.filter(e =>
      norm(e.title).includes(q) ||
      norm(e.author).includes(q) ||
      norm(e.journal).includes(q) ||
      norm(e.doi).includes(q) ||
      norm(e.id).includes(q) ||
      norm(e.year).includes(q)
    );
  }

  // OR logic for tags: match any selected tag
  if (checkedTags.length) {
    out = out.filter(e => (e.tags || []).some(t => checkedTags.includes(t)));
  }

  // Sort: newest first, then title
  out.sort((a, b) => (b.year || '').localeCompare(a.year || '') || (a.title || '').localeCompare(b.title || ''));
  render(out);
}

loadData().then(entries => {
  ALL = entries;
  populateYears(ALL);
  applyFilters();
});

// Wire up events
['input', 'change'].forEach(evt => {
  $('#search').addEventListener(evt, applyFilters);
  $('#yearFilter').addEventListener(evt, applyFilters);
  $('#tagFilter').addEventListener(evt, applyFilters);
});
