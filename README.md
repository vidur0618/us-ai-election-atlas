# AI Midterm, mapped — 2026

A state-by-state research atlas of AI and data-centre ballot votes, selected election results, incoming leadership, and policy proposals.

**Reviewed 16 November 2026.** This branch is a pre-deployment review. Source snapshots retain their own dates and verification limits. It is a research inventory rather than a certified nationwide census or a live results feed.

## Explore

- All 50 states and DC, with a prominent state selector and three map layers: AI Ballot, Elections and Bills.
- Light mode by default, optional dark mode, a blueprint layout and an orange Bills palette.
- All recorded dates, ballot-topic filters, interactive result/status charts, policy search and shareable state links.
- Called seats, uncalled seats and separate projections; incoming control remains distinct from current officeholding.
- Binding/advisory labels, explicit denominators, source snapshots and field-specific review notes.
- Compact Research notes with current JSON and a complete fact-check log.
- A separately labeled external candidate tracker, preserving unresolved statuses and source conflicts.

## Reviewed inventory

| Record family | Count |
|---|---:|
| State/DC index | 51 |
| Ballot records | 71 |
| November 3 / earlier / scheduled | 60 / 7 / 4 |
| Selected policy records | 149 |
| Selected candidate contests / choices | 22 / 95 |
| Recall/replacement records | 10 |
| Control-change records / chamber snapshots | 16 / 14 |
| Poll observations | 89 |
| Source entries | 385 |

All 353 pre-existing core research records have a field-specific audit disposition. Eighteen core records were added. The external tracker retains 1,064 result rows and 892 position rows, including 75 position-only rows; it was not independently re-audited row by row in this pass. Record counts are not counts of unique voters, independently verified winners or enacted laws.

The comparable November development cohort remains 48 questions, with 46 more-restrictive winning positions, including advisory preferences. An advisory preference does not enact a legal ban. Unknown counts remain null.

## Files and review

Static files live in `dist/` in the Sites checkout and at the repository root in the GitHub Pages export.

- `index.html`, `assets/app.js`, `assets/panels.js`, `assets/styles.css`: application.
- `downloads/ai_midterms_2026_data.json`: current canonical research data.
- `downloads/review-2026-11-16.json`: applied changes and complete coverage ledgers.
- `assets/dashboard-data.json`: canonical core records plus derived display indexes.
- `assets/tracker-data.json`: optional external tracker, loaded on demand.
- `research/reviews/2026-11-16/ATLAS_REVIEW_AND_OPTIONS.md`: full audit findings and four next-pass implementation options.
- `research/ADAPTER_SCHEMA.md`: data contracts and safeguards.
- `research/adapter-validation.json`: integrity receipt and exact hashes.

The original DOCX, XLSX and ZIP are historical 13 November exports. They have not been refreshed and are not presented as current downloads in Research notes.

## Rebuild and validate

No runtime package installation, API key or backend is required. Native JavaScript modules use relative asset URLs.

Run `python research/build_adapter.py` after changing the canonical JSON, then `python research/check_adapter.py`. Both scripts support either repository layout. The current receipt passes 2,679 integrity assertions. Arithmetic and schema checks do not replace source review.

The date-specific migration in the Sites source uses immutable baseline provenance. Review the stored patches and evidence before applying a future refresh. Preserve prior values, correct derived totals, and avoid combining different snapshot dates or denominators.

## Hosting

The existing GitHub Pages production target is `main` at `/(root)`; `.nojekyll` enables direct static serving. This review branch does not change that production target. Merging reviewed changes to the configured publishing branch is a separate release step.

In the Sites checkout, `.openai/hosting.json` declares `dist/`. Use the managed Sites preview and version workflow there. The current review is saved without deployment.

## Map attribution

Geographic outlines derive from the U.S. Census Bureau 2017 cartographic boundaries via [us-atlas 3.0.1](https://github.com/topojson/us-atlas). The redistribution licence is retained in `assets/us-atlas-LICENSE.txt`. Source publications remain individually linked in the atlas and research files.
