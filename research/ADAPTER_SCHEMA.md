# US AI Election Atlas data adapter

## Files

- `../assets/dashboard-data.json`: approximately 774 KB, initial application payload. Every non-tracker canonical key and record is preserved verbatim. Adds display views and per-state aggregates.
- `../assets/tracker-data.json`: approximately 3.34 MB, optional lazy-loaded candidate discovery layer. All six canonical `tracker_*` tables/objects are preserved verbatim.
- `build_adapter.py`: rebuilds both payloads from `../downloads/ai_midterms_2026_data.json`.
- `check_adapter.py`: checks lossless migration against the canonical source, denominators, selected difficult records, source links and joins. Run from the repository root with `python research/check_adapter.py` after rebuilding. The scripts use paths relative to their own location.
- `adapter-validation.json`: current validation receipt and hashes.

These are application build inputs. The canonical research snapshot and its original four downloadable files remain authoritative.

## Canonical keys retained in the main payload

`metadata`, `states`, `ballots`, `control_changes`, `chamber_snapshots`, `elections`, `election_choices`, `recalls`, `policies`, `polls`, `exclusions`, `gaps`, `data_dictionary`, `dashboard_spec`, `sources`, `source_conflicts`.

All raw vote counts, source URLs, date/status strings, component returns, historical versions and notes remain unchanged. Presentation code should escape raw text and permit only HTTP(S) external links. Every source-registry URL passes the HTTP(S) scheme check.

`metadata.base_census` documents an earlier component of the reconciled inventory. Its 47-question/62-record counters are intentionally preserved as source provenance. Use the top-level `metadata.nov3_development_cohort_questions` (48), `metadata.nov3_questions_all_scopes` (56), and `metadata.ballot_records` (67) for the reconciled headline totals.

## Added fields

### `adapter_meta`

Includes schema version, canonical filename and SHA-256, election day, source data cutoff, build timestamp, preservation rule, percentage scale, optional tracker filename and original artifact filenames/sizes/hashes. `adapter_built_at` is a build timestamp, not a new election-data refresh. `data_as_of` remains **2026-11-13**.

### `state_summaries[]`

Exactly one row for each of the 50 states plus DC:

| Field | Meaning |
| --- | --- |
| `state`, `state_name` | Canonical two-letter code and name; join map geometry by `state` |
| `coverage_statement`, `control_context` | Original state-level qualifications |
| `ballot_record_ids`, `policy_record_ids`, `election_record_ids`, `recall_record_ids`, `poll_record_ids` | Complete IDs for canonical state records |
| `control_changes`, `chamber_snapshots` | Original records for the state, repeated for convenience |
| `leadership` | Documented classification, label, explanation, election year and source IDs/URLs |
| `counts` | Ballot, policy, election, recall, polling, tracker and conflict record counts |
| `ballot_counts_by_period` | `nov3`, `earlier`, `upcoming`, `all` totals |
| `ballot_counts_by_period_and_topic` | Same periods, each split by five UI topics |
| `source_ids`, `source_urls` | Deduplicated relevant state sources |

Leadership keys:

- `new_democratic_trifecta`: AZ, MI, MN, NV, PA, WI.
- `democratic_gain_divided`: GA, IA, NH, OH, TX.
- `democratic_house_gain_senate_unresolved`: NC.
- `prior_year_change`: VA; explicitly 2025, not a 2026 flip.
- `democratic_hold`: KS governor.
- `no_retained_control_record`: 37 remaining state/DC rows. It does not mean Republican control, no actual change, or a verified absence of change.

`leadership_legend` holds the labels and explanations keyed by these values.

### `ballot_views[record_id]`

Computed presentation fields only:

- `period`: `nov3` = 2026-11-03; `earlier` = before election day; `upcoming` = after 2026-11-13. There are no intervening November 4–13 records in this snapshot. `all` is a filter, not a record period.
- `topic`: `development`, `ai_governance`, `surveillance`, `adjacent`, or `finance`.
- `topic_label`, `legal_type_label`, `outcome_label`, `result_status_label`, `restriction_label`: readable display labels. Original fields remain intact in `ballots`.
- `valid_yes_no_votes_calculated`, `yes_share_valid`, `no_share_valid`, `winning_share_valid`: calculated from known raw yes/no counts. Percentages use a **0–100 scale** and remain null when counts are unavailable. Never use `value || 0` to display missing results.
- `share_denominator`: explicit description of the valid yes/no denominator.
- `is_development_question`, `is_scheduled`, `has_vote_counts`: convenience flags.

Development includes the documented general-zoning questions and future data-centre questions. Finance includes Solano and Mason County. An approved related-technology question is not automatically a restrictive data-centre result.

### `policy_views[record_id]`

Provides `status_label`, `verification_label` and `topic_labels` with readability-only normalization. No inferred enactment class is added. The raw status distinguishes bills passed by one chamber, prefilings, executive actions and laws.

## Required joins and safeguards

1. `ballots/policies/elections/recalls[].source_ids` → `sources[].source_id`; all resolve. Some chamber snapshots provide a URL without a source ID; state summaries resolve it when the URL is in the registry.
2. `election_choices[].election_id` → `elections[].record_id`. Keep every choice, including nine source-displayed zero-vote Wisconsin write-ins. Multi-seat contests use candidate selections, not unique voters.
3. Recall `choices` are replacement contests; `yes`/`no` rows are removal votes. `replacement` can coexist with a removal vote. Do not combine their denominators.
4. Polls with `state=US` or an eight-state aggregate label are not a state. A whole-survey sample is not a question-specific sample. All polls remain estimates, not election returns.
5. Optional tracker results contain 1,064 rows; positions contain 892. Join positions to results by `record_id` with a left/outer join: **75 position-only rows** have no result status. Preserve aliases, `leading` versus `won`, source conflicts and null raw counts. Do not treat tracker stance coding as independently verified.
6. For a map filter `(period, topic)`, use state summary counts or filter `ballot_views`; do not silently apply ballot date filters to policy enactment dates or chamber control.
7. Zero recorded questions means none identified in this research inventory. The state coverage statement must remain visible.

## Validation

`check_adapter.py` currently passes 1,089 assertions, including exact canonical table equality, all 51 state/DC links, all source schemes, 67/138/21/90/10/89 core counts, 56/7/4 date cohorts, the 48/46/38/10 November development cross-check, Honolulu's valid-vote denominator, Bethel's unknown tally, Wisconsin's nine zero rows, and the tracker position-only join.
