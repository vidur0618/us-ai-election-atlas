# Leadership and Texas policy audit — 16 November 2026

This research-only review gives a disposition for all **95 existing records** assigned: 21 selected elections, 15 control-change records, 13 chamber snapshots and 46 Texas policy records. No production file was modified. The JSON files contain proposed updates, source dates, retrieval dates and explicit verification limits.

## Material findings

**Texas House:** the retained 83D/67R split was a conditional projection in a November 4 Tribune article. It was incorrectly paired with zero uncalled seats and a November 12 snapshot label. The November 15, 23:21 ET AP republisher has 79D/63R and eight uncalled. Store the projection separately. Other trackers use different call policies and timestamps; do not merge their counts.

**New Hampshire House:** update the old 248D/72R/80 uncalled snapshot to 269D/87R/1 independent/43 uncalled in the November 15 AP republisher. The House clerk’s preliminary 292D/107R/1 independent projection is a different quantity, and is not evidence that every race is certified.

**Arizona House:** the newer AP feed shows 37D/22R/1 uncalled. Other assigned chamber majorities are corroborated without numerical changes. North Carolina’s Senate remains 24D/25R with one uncalled race; the House is 70D/48R/1 other/1 uncalled in the November 15, 07:39 ET tracker.

**Votes:** updated totals are available for Ohio governor, Michigan governor, Arizona governor and Arizona Corporation Commission. Alaska’s newly called governor contest can be added with official November 14 first-preference returns.

**Texas policy:** all 41 existing 90R prefiles still show Filed on November 9. Six omitted prefiles, two distinct agency actions and two existing health-AI laws are proposed additions. The September 21 TCEQ directive receives an October 19 implementation source, rather than being counted twice.

## Election updates

| Record | New listed vote total | Source snapshot |
|---|---:|---|
| E_MI_2 | 4,791,776 | 2026-11-13 21:19; timezone not stated by extracted source |
| E_OH_3 | 4,597,695 | 2026-11-13 12:56 EST |
| E_AZ_8 | 4,686,276 | 2026-11-14 01:49:14; timezone not specified |
| E_AZ_GOV | 2,579,147 | 2026-11-14 01:49:14; timezone not specified |

Arizona Corporation Commission is a vote-for-two contest: candidate-vote shares are not the share of unique voters. Arizona’s 29 adjudicated write-ins are treated as the aggregate of 18 and 11 component votes, with that hierarchy explicitly identified as an inference. Alaska’s 278,254 valid governor first preferences are distinct from 283,389 times cast in that contest and from the statewide ballot denominator.

## Proposed Texas additions

| Instrument | Status and event date | Subject |
|---|---|---|
| HB 331 | prefiled / introduced; not enacted · 2026-11-09 | Government automatic license plate reader prohibition |
| HB 734 | prefiled / introduced; not enacted · 2026-11-09 | Data-center subsidy agreement disclosure |
| HB 847 | prefiled / introduced; not enacted · 2026-11-09 | Law-enforcement automatic license plate reader safeguards |
| HB 1139 | prefiled / introduced; not enacted · 2026-11-13 | Data-center sales/use tax exemption repeal |
| SB 338 | prefiled / introduced; not enacted · 2026-11-12 | Data-center cooling, incentives and interconnection requirements |
| SB 41 | prefiled / introduced; not enacted · 2026-11-09 | Personalized dynamic pricing restrictions |
| SB 815 | enacted · 2025-06-20 | Automated health-claim determinations |
| SB 1188 | enacted · 2025-06-20 | Electronic health records and diagnostic AI safeguards |
| executive / grid action | administrative action · 2026-08-03 | Grid-interconnection verification and audit |
| administrative information request | administrative action · 2026-09-14 | Data-center state and community impact RFI |

The two 2025 laws are historical baseline additions. None of the six 90R prefiles is enacted. The August 3 grid action, September 14 information request and September 21 environmental-permit directive are linked events in a common audit program, with different legal and operational functions.

## Coverage limits

All 41 retained Texas prefiles were checked against official November 16 House and Senate filing reports. This verifies bill identity, caption, author and latest filing action. It does **not** renew a full legal interpretation of every operative clause; preserve existing caption-only and partial-text-review labels. Newly added prefile summaries were checked against their introduced texts. The three existing enacted Texas laws were reconfirmed against official enrolled summaries.

All nine selected Texas vote counts match the official SOS snapshot, but that snapshot remains November 4 and unofficial. Georgia PSC counts remain an early 141-of-159-locality snapshot; newer primary totals were not retrieved. Michigan’s official result portal returned 403; the indexed AP interactive supplied its November 13 update. Georgia, Wisconsin, Pennsylvania, Iowa, Nevada and New Hampshire governor counts were reconfirmed at their existing secondary sources, without a fresh certified primary tally. A November 16 review date must not imply that all underlying counts are from November 16.

## Useful next implementation pass

1. **Current versus incoming government:** show incumbents, winners awaiting inauguration, the taking-office date and coalition organization separately.
2. **Seat-count basis:** distinguish media-called seats, candidates leading in the count and certified membership. Use a neutral color for uncalled seats and preserve each source’s timestamp.
3. **Related policy families:** link similar House and Senate proposals without asserting official companion status; link agency implementation events without counting each as an independent ban.
4. **Effective and applicability dates:** show when a statute takes effect separately from the contracts, records or projects to which it applies. Proposed dates remain conditional.
5. **Agency milestones:** track ERCOT’s December 10 report target, forthcoming legislative sessions and verified PUCT docket events alongside bills.
6. **Infrastructure context:** show proposed, queued, approved and energized capacity separately. ERCOT’s November 5 RFI covers 433 of 465 responses and approximately 177 GW of requested capacity; this is not operating demand. Add project water consumption, incentive value and utility cost allocation where verifiable.
7. **Evidence health:** distinguish a newer count, an old count rechecked today, a blocked primary source, a caption-only legislative record and a coverage gap.
8. **Legislative versus public votes:** the enrolled SB815 and SB1188 texts supply legislative roll calls. Display them under bill passage, never as popular ballot returns.
9. **Reproducible monitoring:** retain source copies and hashes, version counts and summaries, and review material changes in legal status or political control.

## Record-by-record coverage

The complete evidence and disposition are in audit_ledger.json. The following index ensures that no assigned record silently disappears from the review.

| Table | Record | Disposition |
|---|---|---|
| elections | TX-2026-GOVERNOR | primary snapshot reconfirmed |
| elections | TX-2026-LIEUTENANT-GOVERNOR | primary snapshot reconfirmed |
| elections | TX-2026-ATTORNEY-GENERAL | primary snapshot reconfirmed |
| elections | TX-2026-COMPTROLLER | primary snapshot reconfirmed |
| elections | TX-2026-RAILROAD-COMMISSIONER | primary snapshot reconfirmed |
| elections | TX-2026-US-SENATE | primary snapshot reconfirmed |
| elections | TX-2026-LAND-COMMISSIONER | primary snapshot reconfirmed |
| elections | TX-2026-AGRICULTURE-COMMISSIONER | primary snapshot reconfirmed |
| elections | TX-2026-STATE-SENATE-DISTRICT-9 | primary snapshot reconfirmed |
| elections | E_GA_1 | retained snapshot reconfirmed |
| elections | E_MI_2 | updated snapshot |
| elections | E_OH_3 | updated snapshot |
| elections | E_WI_4 | retained snapshot reconfirmed |
| elections | E_PA_5 | retained snapshot reconfirmed |
| elections | E_GA_6 | retained snapshot reconfirmed |
| elections | E_GA_7 | retained snapshot reconfirmed |
| elections | E_AZ_8 | updated snapshot |
| elections | E_AZ_GOV | updated snapshot |
| elections | E_IA_GOV | retained snapshot reconfirmed |
| elections | E_NV_GOV | retained snapshot reconfirmed |
| elections | E_NH_GOV | retained snapshot reconfirmed |
| control_changes | AZ|House and Senate | reported transition reconfirmed |
| control_changes | GA|House; governor | reported transition reconfirmed |
| control_changes | MI|House | reported transition reconfirmed |
| control_changes | MN|House | reported transition reconfirmed |
| control_changes | NH|House and Senate | reported transition reconfirmed |
| control_changes | NC|House | reported transition reconfirmed |
| control_changes | PA|Senate | reported transition reconfirmed |
| control_changes | TX|House; governor | reported transition reconfirmed |
| control_changes | WI|Assembly and Senate | reported transition reconfirmed |
| control_changes | IA|Governor | reported transition reconfirmed |
| control_changes | NV|Governor | reported transition reconfirmed |
| control_changes | OH|Governor | reported transition reconfirmed |
| control_changes | VA|Governor | reported transition reconfirmed |
| control_changes | KS|Governor | reported transition reconfirmed |
| control_changes | TX|Lieutenant governor | reported transition reconfirmed |
| chamber_snapshots | AZ|Senate | composition reconfirmed |
| chamber_snapshots | AZ|House | newer called seat count |
| chamber_snapshots | GA|House | composition reconfirmed |
| chamber_snapshots | MI|House | composition reconfirmed |
| chamber_snapshots | MN|House | composition reconfirmed |
| chamber_snapshots | NH|Senate | composition reconfirmed |
| chamber_snapshots | NH|House | newer called seat count |
| chamber_snapshots | NC|House | composition reconfirmed |
| chamber_snapshots | PA|Senate | composition reconfirmed |
| chamber_snapshots | WI|Assembly | composition reconfirmed |
| chamber_snapshots | WI|Senate | composition reconfirmed |
| chamber_snapshots | TX|House | projection misrepresented as completed count |
| chamber_snapshots | TX|Senate | composition reconfirmed |
| policies | TX_HB273 | prefiled status and caption reconfirmed |
| policies | TX_HB280 | prefiled status and caption reconfirmed |
| policies | TX_HB405 | prefiled status and caption reconfirmed |
| policies | TX_HB416 | prefiled status and caption reconfirmed |
| policies | TX_HB427 | prefiled status and caption reconfirmed |
| policies | TX_HB441 | prefiled status and caption reconfirmed |
| policies | TX_HB561 | prefiled status and caption reconfirmed |
| policies | TX_HB585 | prefiled status and caption reconfirmed |
| policies | TX_HB588 | prefiled status and caption reconfirmed |
| policies | TX_HB625 | prefiled status and caption reconfirmed |
| policies | TX_HB639 | prefiled status and caption reconfirmed |
| policies | TX_HB671 | prefiled status and caption reconfirmed |
| policies | TX_HB677 | prefiled status and caption reconfirmed |
| policies | TX_HB763 | prefiled status and caption reconfirmed |
| policies | TX_HB929 | prefiled status and caption reconfirmed |
| policies | TX_HB950 | prefiled status and caption reconfirmed |
| policies | TX_SB156 | prefiled status and caption reconfirmed |
| policies | TX_SB255 | prefiled status and caption reconfirmed |
| policies | TX_SB46 | prefiled status and caption reconfirmed |
| policies | TX_HB149 | enacted baseline reconfirmed |
| policies | TX_HB167 | prefiled status and caption reconfirmed |
| policies | TX_HB374 | prefiled status and caption reconfirmed |
| policies | TX_HB408 | prefiled status and caption reconfirmed |
| policies | TX_HB474 | prefiled status and caption reconfirmed |
| policies | TX_HB510 | prefiled status and caption reconfirmed |
| policies | TX_HB529 | prefiled status and caption reconfirmed |
| policies | TX_HB605 | prefiled status and caption reconfirmed |
| policies | TX_HB681 | prefiled status and caption reconfirmed |
| policies | TX_HB696 | prefiled status and caption reconfirmed |
| policies | TX_HB706 | prefiled status and caption reconfirmed |
| policies | TX_HB732 | prefiled status and caption reconfirmed |
| policies | TX_HB750 | prefiled status and caption reconfirmed |
| policies | TX_HB851 | prefiled status and caption reconfirmed |
| policies | TX_HB914 | prefiled status and caption reconfirmed |
| policies | TX_HB928 | prefiled status and caption reconfirmed |
| policies | TX_SB1964 | enacted baseline reconfirmed |
| policies | TX_SB293 | prefiled status and caption reconfirmed |
| policies | TX_SB296 | prefiled status and caption reconfirmed |
| policies | TX_SB32 | prefiled status and caption reconfirmed |
| policies | TX_SB33 | prefiled status and caption reconfirmed |
| policies | TX_SB34 | prefiled status and caption reconfirmed |
| policies | TX_SB35 | prefiled status and caption reconfirmed |
| policies | TX_SB36 | prefiled status and caption reconfirmed |
| policies | TX_SB6 | enacted baseline reconfirmed |
| policies | TX-HINOJOSA-CAMPAIGN | pledge reconfirmed |
| policies | TX-ABBOTT-2026-09-21 | directive reconfirmed implementation source added |

## Files

- `audit_ledger.json`: 95 original records, review scope, findings, sources and limits.
- `proposed_corrections.json`: 19 proposed updates and 13 additions, with source catalog.
- `audited_input.json`: the original assigned records, retained for comparison.
- `tx_filing_audit.json`: all 41 existing Texas prefiles mapped to the official filing reports.
- `fetch_manifest.json` and `fetch_more_manifest.json`: downloaded-source metadata and access failures.
- `sources/`: retrieved primary documents and text extractions, including Alaska returns and HB1139.
