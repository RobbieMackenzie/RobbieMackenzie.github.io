
// ===== Config you update monthly =====
const LAST_UPDATED = '2026-02-03'; // ISO date string
const DATA_URL = 'radiovoltaics-bibliography.json'; // CSL-JSON with `tags` merged in (see merge-tags.mjs)

// ===== Utilities =====
const $ = sel => document.querySelector(sel);
const norm = s => (s || '').toString().toLowerCase().trim();
const siteUrl = () => location.href.replace(location.hash,'').replace(location.search,'');

// Set dates/URL (guard elements in case some pages don't include them)
const _el = id => document.querySelector(id);
const _setText = (id, val) => { const el = _el(id); if (el) el.textContent = val; };
_setText('#lastUpdated', LAST_UPDATED);
_setText('#lastUpdatedCite', LAST_UPDATED);
_setText('#siteUrl', siteUrl());

// ===== Data loading & normalization =====
// Format author names as "Initials Surname" and apply "et al." for >3 authors
function initialsFrom(given) {
  if (!given) return '';
  // remove periods, split on whitespace, take first letter of each part
  const parts = String(given).replace(/\./g, '').split(/\s+/).filter(Boolean);
  return parts.map(p => (p[0] || '').toUpperCase() + '.').join(' ');
}

function formatAuthorObj(a) {
  const family = a?.family || '';
  const given = a?.given || '';
  const initials = initialsFrom(given);
  return (initials ? `${initials} ${family}` : family).trim();
}

function formatAuthors(list) {
  if (!Array.isArray(list)) return '';
  const formatted = list.map(formatAuthorObj).filter(Boolean);
  if (formatted.length > 3) return `${formatted[0]} et al.`;
  return formatted.join('; ');
}

async function loadData() {
  const res = await fetch(DATA_URL, { cache: 'no-store' });
  const data = await res.json(); // CSL-JSON array
  return data.map(e => ({
    id: e.id || '',
    type: (e.type || '').toLowerCase(),
    title: e.title || '',
    author: formatAuthors(e.author || []),
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
  const container = $('#entries');
  container.innerHTML = '';
  for (const e of entries) {
    const el = document.createElement('article');
    el.className = 'entry';
    el.setAttribute('role', 'listitem');

    const title = document.createElement('div');
    title.className = 'entry-title';
    if (e.doi) {
      title.innerHTML = `<a href="https://doi.org/${e.doi}">${e.title}</a>`;
    }
    else {if (e.url) {
      title.innerHTML = `<a href="${e.url}">${e.title}</a>`;
    }}

    const meta = document.createElement('div');
    meta.className = 'entry-meta';
    meta.textContent = [e.author, e.journal, e.year].filter(Boolean).join(' • ');

    const links = document.createElement('div');
    links.className = 'entry-links';
    const parts = [];
    
    links.innerHTML = parts.join(' &nbsp;|&nbsp; ');

    const tagRow = document.createElement('div');
    (e.tags || []).forEach(t => {
      const b = document.createElement('span');
      b.className = 'badge';
      b.textContent = t;
      tagRow.appendChild(b);
    });

    el.appendChild(title);
    el.appendChild(links);
    el.appendChild(meta);
    el.appendChild(tagRow);
    container.appendChild(el);
  }
  $('#count').textContent = `${entries.length} item(s)`;
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
