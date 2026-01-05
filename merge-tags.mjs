
import fs from 'fs';

const refs = JSON.parse(fs.readFileSync('radiovoltaics-bibliography.json', 'utf8'));
const tags = JSON.parse(fs.readFileSync('tags.json', 'utf8'));

const allowed = new Set(tags.allowedTags || []);
const byId = tags.byId || {};

function normTag(t) { return String(t || '').trim(); }

// Validate tags against the controlled vocabulary
for (const [id, tagList] of Object.entries(byId)) {
  for (const t of tagList) {
    if (!allowed.has(t)) {
      console.warn(`WARNING: tag "${t}" for id "${id}" is not in allowedTags`);
    }
  }
}

// Merge tags into CSL-JSON entries
const out = refs.map(e => {
  const id = e.id || '';
  const raw = byId[id] || [];
  const merged = [...new Set(raw.map(normTag).filter(t => allowed.has(t)))];
  return { ...e, tags: merged };
});

// Warn if tags.json references a missing id
const refIds = new Set(refs.map(e => e.id));
for (const key of Object.keys(byId)) {
  if (!refIds.has(key)) {
    console.warn(`WARNING: tags contain id "${key}" but no such entry exists in radiovoltaics-bibliography.json`);
  }
}

fs.writeFileSync('radiovoltaics-bibliography.json', JSON.stringify(out, null, 2));
console.log(`Merged tags into radiovoltaics-bibliography.json (${out.length} entries).`);
