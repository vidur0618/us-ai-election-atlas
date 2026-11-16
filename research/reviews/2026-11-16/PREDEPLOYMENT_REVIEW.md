# AI Midterm, mapped — pre-deployment review

**Evidence review: 16 November 2026. Prepared for review; this pass is not a production deployment.**

The source review produced material corrections to election counts, the interpretation of chamber projections, and policy status. The application now preserves these distinctions in the data and in its evidence drawers. It also has a light default theme, an orange Bills palette, a shorter visual Research notes panel and no Period selector.

This is a field-specific review of the existing research inventory. It does not establish a complete national census, certification of every result, or a complete legal interpretation of every bill clause. Source snapshots keep their own dates. A check on 16 November does not turn a 4 November return into a 16 November tally.

## Updated inventory

| Record family | Previous | Reviewed release |
|---|---:|---:|
| States and DC indexed | 51 | 51 |
| Ballot questions | 67 | 71 |
| November 3 questions, all scopes | 56 | 60 |
| Earlier questions | 7 | 7 |
| Scheduled questions | 4 | 4 |
| Selected policy records | 138 | 150 |
| Selected candidate contests | 21 | 22 |
| Candidate choices | 90 | 95 |
| Recall/replacement records | 10 | 10 |
| Control-change records | 15 | 16 |
| Chamber snapshots | 13 | 14 |
| Poll observations | 89 | 89 |
| Source-registry entries | 316 | 386 |

The audit gives a disposition for all **353 pre-existing core records** across ballots, recalls, selected elections, control changes, chambers, policies and polling. It adds **19 core records** and four related-scope exclusions. The comparable November development cohort remains **48 questions**, with **46 more-restrictive winning positions**, including advisory preferences. There are 38 binding and 10 advisory questions in that cohort; it is not a count of 46 enacted bans.

The external candidate tracker remains at 1,064 result rows and 892 position rows, including 75 position-only rows. Those rows were preserved, not independently re-researched one by one. They remain labeled as a separate discovery source and cannot supersede verified selected results automatically.

## Material corrections

### Election composition and selected contests

| Item | Correction | Interpretation |
|---|---|---|
| Texas House | 79 D / 63 R / 8 uncalled; separate projection 83 D / 67 R | The earlier display incorrectly treated a conditional projection as a completed composition. |
| New Hampshire House | 269 D / 87 R / 1 other / 43 uncalled | The clerk's preliminary 292 D / 107 R / 1 other is stored separately. |
| Arizona House | 37 D / 22 R / 1 uncalled | Updated called-seat snapshot. |
| North Carolina Senate | 24 D / 25 R / 1 uncalled | Added an explicit unresolved snapshot; no Democratic trifecta inferred. |
| Ohio governor | Acton 2,405,095; Ramaswamy 2,040,654; Kissick 151,946 | 4,597,695 listed votes in the 13 November DDHQ snapshot. |
| Michigan governor | Benson 2,614,277 | Two additional votes versus the retained count; 4,791,776 listed votes, still an AP estimate. |
| Arizona governor | 2,579,147 listed votes | Official unofficial 14 November snapshot; nested write-ins are not counted twice. |
| Arizona Corporation Commission | 4,686,276 candidate selections | Vote-for-two denominator; these are not 4,686,276 unique voters. |
| Alaska governor | Kreiss-Tomkins/Johnson 141,623 of 278,254 valid first preferences | Added the newly called race and governor party change. This is not a certified final ranked-choice round or evidence of legislative coalition control. |

Sources: [Texas AP republisher](https://movement.vote/election-results/2026/texas/), [conditional Texas projection](https://www.texastribune.org/2026/11/03/texas-house-legislature-outcomes-control-republicans-democrats-2026/), [New Hampshire AP republisher](https://movement.vote/election-results/2026/new-hampshire/), [North Carolina Senate](https://99chambers.app/elections/2026-general/nc/senate), [Ohio DDHQ](https://votes.decisiondeskhq.com/races/2026-11-03/ohio-governor-general-election), [Arizona official results](https://app.enhancedvoting.com/results/public/Arizona/elections/110326GeneralElection), [Alaska official PDF](https://www.elections.alaska.gov/enr/26GENR/results/ElectionSummaryReportRPT.pdf). Exact dates, source roles and limits are in the ledger.

### Ballot and recall tallies

| Question or recall | Previous yes / no | Updated yes / no | Evidence |
|---|---:|---:|---|
| Chicago gunshot-detection advisory | 482,304 / 184,704 | 529,613 / 212,933 | 15 November official unofficial PDF |
| Solano Measure E | 55,512 / 91,777 | 55,534 / 91,821 | Official indexed return, corroborated by secondary reporting |
| Americus data-center question | 277 / 127 | 278 / 127 | Lyon County Official Final, 12 November |
| Emporia Question 2 | 4,367 / 2,901 | 4,448 / 2,953 | Lyon County Official Final, 12 November |
| Belvidere advisory | 727 / 243 | 731 / 243 | 14 November secondary return; primary count remains inaccessible |
| Independence, John Perkins recall | 1,118 / 525 | 1,120 / 526 | County primary return, 8 September |

Sources: [Chicago results](https://results.chicagoelections.gov/results/Summary%20Report%20(2%20Column).pdf), [Lyon County results and final reports](https://www.lyoncountyks.gov/350/2026-General-Election-Results), [Solano results](https://www.livevoterturnout.com/ENR/solanocaenr/21/en/Index_21.html), [Belvidere secondary return](https://ballotpedia.org/Belvidere,_New_Jersey,_Data_Center_Ban_Advisory_Question_(November_2026)), [Jackson County return](https://www.livevoterturnout.com/ENR/jacksonmoenr/37/en/Index_37.html).

Old Solano turnout, ballots-cast, vote-mode and under/overvote fields were moved into history because they belonged to an earlier snapshot. Belvidere's old undervote count was handled the same way. Emporia's litigation qualification is retained. The final Lyon report does not print percentages; the atlas calculates valid yes/no shares without labeling them publisher-reported percentages.

### Four added direct-vote records

| Jurisdiction | Scope | Yes | No |
|---|---|---:|---:|
| Chicago Ward 7, Precinct 14 | Advisory public funding for South Works quantum facility and data center | 98 | 324 |
| Chicago Ward 10, Precinct 2 | Same question text, distinct electorate | 61 | 186 |
| Chicago Ward 10, Precinct 4 | Same question text, distinct electorate | 87 | 340 |
| Newton Falls Village, Ohio | School-zone photo traffic enforcement referendum | 401 | 1,037 |

The [Chicago ballot wording](https://cboeprod.blob.core.usgovcloudapi.net/prod/2026-10/Candidate%20List_20261027-1.pdf) explicitly mentions a quantum facility and data center. The record does not assert that quantum computing is AI, establish an operating facility, or settle disputed descriptions of the proposed project. These three precinct results belong to an adjacent funding scope; their combined 246/850 is not a fourth question or a unique-voter total across the wider atlas.

The [Newton Falls return](https://boe.co.trumbull.oh.gov/pdfs/Election%20Summary.pdf) establishes the tally. Official wording and the council ordinance packet establish automated photo enforcement; AI implementation is not established. The record is tagged accordingly. Three related South Works remediation questions and Emporia's battery-storage question are retained in the exclusion/context ledger rather than silently omitted or counted as AI measures.

### Policy corrections and additions

**Texas:** six additional 90R prefiles were checked against filing reports and introduced text: HB331, HB734, HB847, HB1139, SB338 and SB41. They concern license-plate readers, incentive-agreement disclosure, sales/use-tax exemptions, cooling/water/interconnection conditions and personalized pricing. All remain proposals. The 41 existing prefiles were rechecked for identity, caption, author and filing status; that does not renew a full clause-by-clause audit.

Two omitted 2025 laws, [SB815](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00815F.htm) and [SB1188](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB01188F.htm), were added as historical health-AI context. Their effective and applicability dates differ. Legislative votes are now rendered separately from popular returns.

Two distinct administrative records cover the August 3 grid-interconnection audit action and September 14 community-impact information request. The existing September 21 environmental-permit directive gained an [October 19 TCEQ implementation source](https://www.tceq.texas.gov/downloads/response/tceq-response-gov-abbott-dc-directive.pdf). Related records are linked rather than counted as several independent bans. Texas now has 56 selected policy records: 47 prefiles, five enacted laws, three agency/executive actions and one campaign proposal.

**Virginia:** HB507's implementing regulation became effective **4 November**, replacing the obsolete pending-publication description. The statute's permit-application date remains a distinct field. [Official Town Hall record](https://townhall.virginia.gov/l/viewaction.cfm?actionid=7091).

**Oregon:** two distinct administrative actions are now recorded and linked to one policy family. The [8 September Governor direction](https://apps.oregon.gov/oregon-newsroom/OR/GOV/Posts/Post/governor-kotek-pauses-work-on-requests-for-state-land-to-support-new-data-centers) pauses specified unapproved requests involving state-owned property through 1 July 2027, or until superseding statewide action. The [9 October letter to DEQ](https://www.opb.org/pdf/100926_GovernorLettertoDEQDataCenterPermitting_1791931532928.pdf) requests a pause on specified air and water-discharge permits, including relevant municipal wastewater permits, until 1 July 2027. Neither record establishes a blanket statewide construction ban or independently verifies implementation. The September record is a historical coverage addition found during the final check, not a new November enactment.

**Iowa:** upgraded three discovery-only records using official histories. SSB3181/SF2498's original data-center terms cannot be assigned to enacted HF2757 after its text and scope changed. The obsolete proposal is identified as superseded/withdrawn.

**Arizona:** corrected the distinction between leaders considering a moratorium and committing to one. **Maryland:** repaired a session-specific bill URL and changed an unsupported “hearing held” claim to a scheduled hearing. **South Dakota:** replaced a primary-access limitation with the official final committee disposition. **Ohio:** refined three bill records to their recorded committees using an LSC report through 9 November.

## Verification boundaries and follow-up queue

The ballot ledger contains fresh primary numerical checks for 22 existing questions, plus Solano's official indexed excerpt. Thirty-eight existing records have current secondary corroboration; other records involve cached primary evidence, partial county evidence or future elections. Each classification is retained instead of applying a universal “verified” label.

Priority unresolved items are:

1. **Pflugerville:** obtain contemporaneous official Travis and Williamson components or the 17 November canvass. Do not splice a newer single-county secondary tally into an older two-county total.
2. **Clarksville:** confirm whether the December 1 schedule or its December 8 contingency controls.
3. **Wrightstown:** obtain the full current two-county aggregate; this pass freshly verified only the Brown County component.
4. **Georgia PSC:** replace the retained early 141-of-159-locality snapshot when a newer authoritative export is available.
5. **Certification:** keep returns provisional until evidence establishes the actual canvass/certification status. “All reporting” is not certification.
6. **Polls:** no percentages changed. Cached primary charts, fresh methodology and secondary reporting have different verification scopes. Question-specific bases remain unknown where unavailable; the existing 98% response-sum discrepancy is preserved.
7. **Policy text:** retain caption-only and partial-text labels. Bill status verification does not establish every legal summary, exception, sponsor or roll call.
8. **External tracker:** preserve its dated status and known conflicts; a refresh would be a separate research task with its own source and denominator checks.

## Interface changes implemented

- Light theme for new visits; a reader's explicit saved theme choice remains respected. The action-labeled theme button no longer announces a contradictory pressed state to screen readers.
- Orange/amber Bills choropleth and policy bars, with separate readable foreground colors.
- Larger state abbreviations, including an additional narrow-phone treatment.
- Period selector removed. All recorded dates remain available, and cards retain their election dates.
- Research notes used as the sole dialog heading; four metrics, two compact charts, one expandable method section and two research links replace the long panel.
- Separate called-seat and projection displays; neutral uncalled-seat segments.
- Agency/executive policy category, legislative roll-call graphics and per-record evidence-review scope in detail drawers.
- Dynamic counts and state descriptions replace stale hardcoded totals.

## Validation and files

The current integrity receipt passes **2,679 assertions**, including exact canonical preservation in derived files, source relationships, state counts, vote arithmetic, nulls, zero write-ins, Alaska first preferences, Arizona nested write-ins, chamber projections and poll denominator safeguards. These are data-integrity checks, not a certification of external facts.

The review package contains:

- `downloads/ai_midterms_2026_data.json`: current canonical data.
- `downloads/review-2026-11-16.json`: applied changes and all three coverage ledgers.
- `research/reviews/2026-11-16/`: readable audit reports, structured patches, source manifests and implementation options.
- `research/adapter-validation.json`: validation receipt and hashes.

The older DOCX, XLSX and ZIP downloads remain historical 13 November artifacts and are no longer presented as current research downloads in the compact notes panel. The refreshed JSON and fact-check log are the current export pair.

For the next pass, implement **evidence/change history and a policy implementation monitor first**. The companion implementation-options document gives four scoped packages, concrete fields, charts, source families, estimated effort and a reviewed-data workflow compatible with GitHub Pages.

## Final targeted check

The final check reopened the official Chicago summary, the official Alaska summary, Virginia Action 7091, the two Oregon primary documents, and the Texas Senate filing report. The AP-attributed Texas House snapshot was also rechecked. No newer contradictory count was identified in that targeted check. This supplements the field-specific audit; it does not reclassify all records as freshly fetched primary evidence.

The browser review confirmed both Oregon administrative records, 150 policies and 386 sources in Research notes, working theme changes, and the absence of a pressed-state claim on the theme action button. The existing desktop, annotation-width and phone checks remain in the validation receipt.
