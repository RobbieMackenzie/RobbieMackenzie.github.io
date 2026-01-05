
# Bibliography Website (GitHub Pages + Custom Domain)

Simple, responsive bibliography site:
- Hosted on **GitHub Pages**
- **Custom domain** supported
- **Search + Year + OR-logic Tag** filtering
- Data source: **BibTeX → CSL-JSON** (manual conversion monthly)
- Tags are **hard-coded in the UI** and **merged per-entry** via a local script

## 1) Prerequisites
- [Pandoc](https://pandoc.org/installing.html) (for BibTeX → CSL-JSON conversion)
- [Node.js](https://nodejs.org/en/download) 18+ (to run the tags merge script)
- bibtexparser (`pip install bibtexparser`)

## 2) Monthly Update Workflow

1. Add new BibTeX entries to `radiovoltaics-bibliography.bib` locally.
2. Remove abstracts, filepaths and personal notes:
   ```
   python remove_bib_fields.py
   ```
3. Convert to CSL-JSON:
   ```
   pandoc --from=bibtex --to=csljson radiovoltaics-bibliography.bib -o radiovoltaics-bibliography.json
   ```
4. Add the entry ids and the relevant tags to `tags.json`
5. Merge in the tags:
   ```
   node merge-tags.mjs
   ```
6. Change the `LAST_UPDATED` in `script.js` to the present date.
7. Commit and push to the repo, wait a minute, then check the site to make sure it's updated correctly.
