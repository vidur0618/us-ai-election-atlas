# Ballot and recall review — 16 November 2026

This audit covers every one of the **67 supplied ballot records and 10 supplied recall/replacement records**. It identifies **five ballot count changes, one recall count change, and four additional direct-vote records**. It is not a certification that every nationwide local question has been found or that every record has fresh primary verification.

## Changes to adopt

| Record | Previous yes / no | Updated yes / no | Source status |
|---|---:|---:|---|
| IL_CHICAGO_GUNSHOT | 482,304 / 184,704 | 529,613 / 212,933 | unofficial_primary · 2026-11-15 14:18 local |
| CA_SOLANO_E | 55,512 / 91,777 | 55,534 / 91,821 | unofficial_primary · 2026-11-13 result update |
| KS_AMERICUS_DC | 277 / 127 | 278 / 127 | official_final_primary · 2026-11-12 14:32 local |
| KS_EMPORIA_2 | 4,367 / 2,901 | 4,448 / 2,953 | official_final_primary · 2026-11-12 14:32 local |
| NJ_BELVIDERE_DC | 727 / 243 | 731 / 243 | unofficial_reported · 2026-11-14 21:25 Eastern (secondary update) |
| R_MO_7 — Independence recall | 1,118 / 525 | 1,120 / 526 | Primary aggregate return, September 8; certification not independently verified |

The exact official/secondary URLs, web references, evidence dates, per-record limitations and patches are in `review.json` and `updates.json`. Cached primary files are hashed in the evidence manifest.

### Newly included questions

| Jurisdiction | Question | Yes | No | Legal effect |
|---|---|---:|---:|---|
| Chicago — Ward 7, Precinct 14 | Public funding for South Works quantum facility and data center | 98 | 324 | advisory |
| Chicago — Ward 10, Precinct 2 | Public funding for South Works quantum facility and data center | 61 | 186 | advisory |
| Chicago — Ward 10, Precinct 4 | Public funding for South Works quantum facility and data center | 87 | 340 | advisory |
| Newton Falls Village | School-zone photo traffic enforcement referendum | 401 | 1,037 | binding |

The three South Works rows use distinct precinct electorates and one shared question identifier. The primary wording explicitly refers to a quantum facility and data center. The results reject support for an estimated $1 billion public funding proposal; they do not cancel a project by themselves. Their combined 246 yes / 850 no is an analytical group total, **not a fourth record**. These voters also participated in citywide questions, so adding ballot responses does not yield unique voters.

Newton Falls concerns automated photo enforcement in school zones. The reviewed material does not prove use of AI. It belongs in an explicitly adjacent surveillance category.

The three paired South Works environmental-remediation questions and Emporia battery-storage Question 3 are documented as related exclusions, with their results, to make the scope choice visible.

## Source and denominator decisions

- **Solano:** move the prior turnout, ballots-cast, under/overvotes and vote-mode figures into history. They were not refreshed alongside the new count. The old three-ballot accounting discrepancy is historical, not a property of the new count.
- **Belvidere:** move the old 77 undervotes into history. Updated votes are secondary-reported; advisory approval does not enact a ban.
- **Pflugerville:** cached Travis and Williamson official attachments support 18,681 / 5,916. A later secondary Travis-only count differs. Preserve the cached aggregate until contemporaneous official county components or the November 17 canvass are read.
- **Conneaut:** the accessible primary report is unofficial despite secondary certified labeling. Reported percentage divides by contest ballots; valid yes/no share uses a different denominator.
- **Mason recall:** Ballotpedia omits 36 write-ins from its denominator. Keep the prior official all-choice 3,357 total rather than adopting the secondary 3,321 denominator.
- **Wrightstown:** fresh primary validation covers the Brown County component, not the whole two-county village. Do not replace an aggregate with a county component.
- **Future questions:** Clarksville, Hollis and Mandan remain unvoted. Zeroes in result templates are not results. Bethel exact vote counts also remain null.
- **Hawaii:** Honolulu reported 63.5% uses all contest ballots; valid yes/no support is about 71.08%. Preserve the denominator label.

## Full existing-record coverage ledger

“Verified” below is qualified by its evidence level. “Secondary current” means corroborated in a current secondary source, **not** fresh independent primary verification. “Unverifiable” identifies a specific remaining gap, not a finding that the underlying claim is false.

| ID | Status | Evidence level | Current count / limitation |
|---|---|---|---|
| AR_CLARKSVILLE_HATCHBO | unverifiable | secondary_schedule_primary_confirmation_pending | Scheduled; date confirmation pending |
| AR_CLARKSVILLE_SFARK1 | unverifiable | secondary_schedule_primary_confirmation_pending | Scheduled; date confirmation pending |
| CA_MONTEREY_PARK_NDC | verified | primary_current | 10,388 / 1,372 |
| CA_ALHAMBRA_DB | verified | secondary_current | 19,022 / 3,647 |
| CA_SAN_FRANCISCO_E | verified | secondary_current | 207,405 / 117,874 |
| CA_SOLANO_E | updated | primary_search_excerpt_and_secondary | 55,534 / 91,821 |
| FL_EDGEWATER_4 | verified | secondary_current | 7,884 / 2,328 |
| HI_HONOLULU_15 | verified | primary_current | 161,036 / 65,525 |
| IL_CHICAGO_GUNSHOT | updated | primary_current | 529,613 / 212,933 |
| IL_CHOUTEAU_DC | verified | secondary_current | 365 / 1,817 |
| IL_BLOOMINGTON_DC | verified | secondary_current | 21,851 / 6,316 |
| IL_GRANITE_CITY_DC | verified | secondary_current | 1,959 / 5,703 |
| IL_JOLIET_TWP_AI | verified | secondary_current | 3,800 / 14,207 |
| IL_MORGAN_DC | verified | secondary_current | 9,413 / 1,250 |
| IL_NAMEOKI_DC | verified | secondary_current | 602 / 2,117 |
| IL_VENICE_DC | verified | secondary_current | 311 / 978 |
| KS_AMERICUS_DC | updated | primary_current | 278 / 127 |
| KS_EL_DORADO_DC | verified | primary_current | 3,019 / 1,201 |
| KS_EMPORIA_2 | updated | primary_current | 4,448 / 2,953 |
| KS_OTTAWA_2 | verified | secondary_current | 2,882 / 1,129 |
| ME_BETHEL_ART3 | unverifiable | secondary_current | Approved; exact tally unavailable |
| ME_BROWNFIELD_1 | verified | secondary_current | 671 / 191 |
| ME_ELIOT_5 | verified | primary_current | 2,965 / 909 |
| ME_FREEDOM_3 | verified | secondary_current | 331 / 115 |
| ME_NORTH_BERWICK_2 | verified | secondary_current | 2,114 / 582 |
| ME_PERU_2 | verified | primary_current | 578 / 182 |
| ME_SABATTUS_DC | verified | primary_current | 1,565 / 791 |
| ME_WELLS_5 | verified | primary_current | 5,818 / 1,282 |
| ME_WISCASSET_2 | verified | secondary_current | 1,363 / 712 |
| ME_YORK_5 | verified | primary_current | 5,386 / 2,043 |
| ME_HOLLIS_2 | verified | secondary_schedule_primary_document_located | Scheduled |
| MI_AUGUSTA_REZONE | verified | primary_current | 269 / 2,314 |
| MO_WHITE_CLOUD_ZONING | verified | primary_current | 99 / 138 |
| ND_HARWOOD_REVIEW | verified | secondary_current | 105 / 325 |
| ND_MANDAN_1 | verified | primary_current_schedule | Scheduled |
| NH_CANTERBURY_4 | verified | secondary_current | 322 / 63 |
| NH_NOTTINGHAM_DC | verified | secondary_current | 1,335 / 143 |
| NJ_BELVIDERE_DC | updated | secondary_current | 731 / 243 |
| NJ_DOWNE_DC | verified | secondary_current | 62 / 425 |
| NV_BOULDER_CITY_1 | verified | secondary_current | 2,165 / 5,227 |
| OH_ASHVILLE_EDGECONNEX | verified | secondary_current | 331 / 1,469 |
| OH_CONNEAUT_10 | conflicting | primary_current | 2,301 / 1,218 |
| OH_DEFIANCE_DC | verified | secondary_current | 3,823 / 2,083 |
| OH_GRANVILLE_DC | verified | secondary_current | 2,015 / 429 |
| OH_GROVE_CITY_28 | verified | secondary_current | 11,317 / 9,411 |
| OH_HUBBARD_DC | verified | primary_current | 2,622 / 802 |
| OH_MONROE_ZONING | verified | secondary_current | 149 / 102 |
| OH_MONROEVILLE_DC | verified | secondary_current | 55 / 394 |
| OH_OREGON_25 | verified | secondary_current | 4,994 / 3,235 |
| OH_PATASKALA_DC | verified | secondary_current | 5,418 / 1,941 |
| OH_PERRY_16 | verified | secondary_current | 946 / 140 |
| OH_PIQUA_DC | verified | secondary_current | 4,061 / 2,027 |
| OH_SPRIGG_ZONING | verified | secondary_current | 332 / 301 |
| OH_SUNBURY_DC | verified | secondary_current | 2,809 / 763 |
| OH_TRENTON_17 | verified | primary_current | 3,541 / 903 |
| OH_UPPER_SANDUSKY_DC | verified | secondary_current | 1,893 / 568 |
| OH_URBANA_DC | verified | primary_current | 2,978 / 877 |
| OH_WILMINGTON_SR730 | verified | primary_current | 739 / 2,885 |
| OH_WILMINGTON_1957_SR730 | verified | primary_current | 732 / 2,886 |
| OH_WILMINGTON_MCGUINN | verified | primary_current | 724 / 2,887 |
| OH_WILMINGTON_US68 | verified | primary_current | 716 / 2,909 |
| TX-LEAGUE-CITY-2026-PROP-A | verified | primary_current | 21,744 / 25,538 |
| TX-PFLUGERVILLE-2026-PROP-B | conflicting | cached_primary_rechecked | 18,681 / 5,916 |
| WI_PORT_WASHINGTON_TID | verified | secondary_current | 2,710 / 1,371 |
| WI_WRIGHTSTOWN_DC | verified | primary_partial_secondary_aggregate | 151 / 1,033 |
| WI_JANESVILLE_GM | verified | secondary_current | 16,779 / 9,932 |
| WV_MASON_SCHOOL_LEVY | verified | secondary_current | 3,479 / 3,107 |

### Recalls / replacement elections

| ID | Status | Evidence level | Key finding |
|---|---|---|---|
| R_MI_1 | conflicting | cached_primary_secondary_denominator_conflict | Current Ballotpedia reproduces 1,941 Oliver, 933 Ferris and 447 Giganti but omits 36 write-ins; the stored prior primary total of 3,357 includes them. |
| R_OH_2 | verified | secondary_current | Current secondary pages match 3,226 recall / 1,196 retain and replacement contest 1,592 Sheats / 1,550 Hessler. |
| R_OH_3 | verified | secondary_current | Current secondary pages match 3,094 recall / 1,305 retain and 2,954 replacement votes for Wilson. |
| R_OH_4 | verified | secondary_current | Current secondary pages match 3,089 recall / 1,314 retain and 2,997 replacement votes for Heisler. |
| R_OH_5 | verified | primary_current | Fresh Champaign County primary summary reports 2,707 recall / 985 retain; Fields received 2,184 replacement votes. |
| R_OK_6 | verified | secondary_current | Current Ballotpedia reports 1,658 Joe Phillips and 369 Brian Pillmore, 2,027 total. |
| R_MO_7 | updated | primary_current | Newer primary aggregate count supersedes the stored 1,118/525 secondary snapshot. |
| R_WI_8 | verified | secondary_current | Current Ballotpedia reports 400 Donna Redner and 232 Roger Anclam, 632 total, October 6. |
| R_WI_9 | verified | secondary_current | Wisconsin Public Radio reports 172 Rusty Brown and 144 Michael Timm, 316 total, October 27. |
| TX-SAN-ANGELO-2026-D3-RECALL | verified | primary_outcome_secondary_counts | City statement acknowledges recall outcome; later local report gives 1,605 recall / 758 retain, 2,363 valid. |

## Remaining gaps

- Primary numerical verification was not attained for every existing record. This is a complete audit ledger of the supplied 77 records, not proof of exhaustive nationwide discovery.
- Pflugerville needs same-time Travis and Williamson official components and the November 17 canvass. Do not splice mismatched snapshots.
- Clarksville December 1 dates retain a December 8 contingency until primary election-clerk confirmation.
- Bethel meeting approved the moratorium; exact yes/no counts remain unavailable.
- Belvidere fresh counts remain secondary-supported; Solano full current table was too large for the web tool though its official indexed count was available.
- Wrightstown whole-village total includes two counties; only Brown County component freshly checked in primary return.
- No Kentucky direct data-center ballot question was established. Reporting about data-center referendums in Kentucky often refers figuratively to candidate elections, which belong in the election layer.
- Illinois precinct-level additions show why county/city ballot lists must be reviewed beyond national aggregators. Counts across questions are not counts of unique voters.

## Next monitoring dates

| Date | Event |
|---|---|
| 2026-11-17 | League City and Pflugerville canvasses; San Angelo vacancy follow-up |
| 2026-11-19 | Trumbull County scheduled certification: Hubbard and Newton Falls |
| 2026-12-01 | Clarksville bond questions; confirm schedule and December 8 contingency |
| 2026-12-08 | Hollis data-center moratorium vote |
| 2026-12-15 | Mandan 25MW data-center prohibition vote |

## Research-dashboard improvements supported by this audit

- Show source date, last checked date and certification date separately; display the exact evidence tier.
- Store immutable count snapshots with source URL, downloaded-file hash, county/precinct coverage and update timestamp.
- Offer a source-change queue and certification watch, with manual review before publishing changed interpretations.
- Distinguish policy geography from voting electorate; preserve county components, precinct IDs and shared-question groups.
- Separate binding law, advisory signal, later implementation, court challenge and effective/expiration dates.
- Offer opt-in adjacent layers for public technology funding, surveillance, energy storage and environmental context.
- Make “unknown,” “not yet voted” and “no identified record” visually distinct. Do not imply complete absence from an incomplete inventory.
- Add jurisdiction-specific ballot and legal text side by side with plain-language “yes means” and “no means”; avoid inferring ideology from a yes/no label.

No production datasets or UI files were edited by this research task.
