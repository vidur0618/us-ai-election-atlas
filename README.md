# US AI Election Atlas — 2026

An interactive, state-by-state map of the 2026 US midterms and AI/data-centre policy. Explore local ballot votes, documented changes in state leadership and legislatures, selected election results, and relevant bills and proposals.

**Evidence cutoff: 13 November 2026.** This is a dated research inventory. Returns may be provisional, and the inventory is not a certified census of every municipal election. Every record retains its sources, dates and qualifications.

## Explore the atlas

- All 50 states plus Washington, DC, with Alaska and Hawaii insets.
- Three map layers: AI ballot activity, documented leadership changes, and the selected policy agenda.
- State panels for Overview, Ballots, Elections and Bills; Texas is selected initially.
- Election-period and topic filters, state and bill search, and shareable state-view links.
- Vote totals and percentages, valid-vote denominators, binding/advisory labels, and source details.
- Optional external candidate tracker with provisional statuses, aliases, position-only records and conflicting source snapshots preserved.
- Polling context, methodology, evidence gaps, and four original research downloads.

## Research inventory

| Record family | Retained records |
| --- | ---: |
| States and DC | 51 |
| Ballot questions | 67 |
| November 3 questions | 56 |
| Earlier / scheduled questions | 7 / 4 |
| Selected policy records | 138 |
| Selected candidate contests / choices | 21 / 90 |
| Recall records | 10 |
| Polling observations | 89 |
| Core source entries | 316 |

The broader tracker retains 1,064 result rows and 75 additional position-only rows. Record counts are not a count of independently verified unique winners or enacted laws. Unavailable results remain unknown rather than being converted to zero. A candidate victory does not isolate voter support for an AI policy.

## Files

- `index.html`, `assets/app.js`, `assets/panels.js`, `assets/styles.css`: the application.
- `assets/dashboard-data.json`: core research tables and presentation indexes.
- `assets/tracker-data.json`: optional candidate-tracker data, loaded when requested.
- `downloads/`: the original dossier, workbook, canonical JSON and ZIP export, unchanged.
- `research/ADAPTER_SCHEMA.md`: dataset structure and evidence-handling rules.
- `research/build_adapter.py` and `research/check_adapter.py`: portable adapter and integrity checks.

The canonical dataset is `downloads/ai_midterms_2026_data.json`, SHA-256 `31fa31c14f26ec3d9404c0c549d088dacfd4f8dcf70f8e8f7102dab77607114a`.

## Hosting with GitHub Pages

Publish this repository from **Settings → Pages → Deploy from a branch → main → /(root)**. The `.nojekyll` file enables direct static-file serving. The application uses relative URLs, so it works under a GitHub Pages project path as well as a domain root. No API keys, package installation, compilation or backend are required.

For local inspection, serve the repository through a static HTTP server; for example, run `python -m http.server 8000` and open `http://localhost:8000`. Opening `index.html` directly as a local file will prevent normal JSON fetching in browsers.

Run `python research/check_adapter.py` to compare the application datasets with the canonical research snapshot. Rebuild with `python research/build_adapter.py` only when intentionally regenerating those assets. Data refreshes should preserve prior versions and reconcile headline counts, source dates, state narratives and methodology together; hosting the site does not refresh its evidence.

## Map attribution

Geographic outlines derive from the U.S. Census Bureau 2017 cartographic boundaries via [us-atlas 3.0.1](https://github.com/topojson/us-atlas). Alaska and Hawaii are repositioned insets. The redistribution licence is retained in `assets/us-atlas-LICENSE.txt`. Source publications remain individually cited in the atlas and downloadable research files.
