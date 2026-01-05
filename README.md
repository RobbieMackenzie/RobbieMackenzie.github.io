
# Bibliography Website (GitHub Pages + Custom Domain)

Simple, responsive bibliography site:
- Hosted on **GitHub Pages**
- **Custom domain** supported
- **Search + Year + OR-logic Tag** filtering
- Data source: **BibTeX → CSL-JSON** (manual conversion monthly)
- Tags are **hard-coded in the UI** and **merged per-entry** via a local script

## 1) Prerequisites
- [Pandoc](https://pandoc.org/installing.html) (for BibTeX → CSL-JSON)
- Node.js 18+ (to run the tags merge script)

## 2) Monthly Update Workflow

1. Edit `references.bib` (your master bibliography) locally.
2. Convert to CSL-JSON:
   ```bash
   pandoc --from=biblatex --to=csljson references.bib -o references.json

