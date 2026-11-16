# Implementation options for a public-policy research atlas

**Planning date: 16 November 2026**

## Recommended sequence

Build **Package 1, evidence and freshness, and Package 2, legal implementation and agency monitoring, before expanding the inventory substantially**. Together, they make the atlas useful for following policy after an election: readers can see what changed, establish what a record actually proves, and identify the next decision that matters. Infrastructure context and a comparative workbench should then build on that foundation.

Keep the opening screen sparse: the map, a prominent state selector, three layers, and a short state briefing. Put the additional research detail behind a consistent **Evidence**, **Timeline**, or **Compare** action. More analytical depth does not require more explanatory text on the map itself.

The ranges below are **planning estimates**, assuming one experienced developer and an available research reviewer. They are not delivery commitments. Source access, document quality, and the amount of retrospective cleanup could change them substantially. Pilot record counts elsewhere in this document are optional targets, not promises of completeness.

| Package | Priority | Estimated implementation effort | Main research benefit |
|---|---|---:|---|
| 1. Evidence, change log and freshness | P0 | 3–5 working days | Establish what changed and how well it is supported |
| 2. Legal implementation and agency monitor | P0, after the evidence model | 4–7 working days | Follow proposals through adoption, implementation and enforcement |
| 3. Infrastructure and public-cost context | P1 | 5–10 working days for a limited pilot | Connect policy to resources, projects and fiscal exposure |
| 4. Comparative research workbench | P1, after consistent definitions | 5–8 working days | Compare states and export reproducible research selections |

## Package 1 — Evidence, change log and freshness

### What to build

Give each fact a source and each update a visible history. A state briefing should answer three questions immediately: **What is the figure? What does it measure? When was the underlying evidence updated?** An optional evidence panel can then show the source, extraction method, review date and earlier values.

Use separate dates for the event, the source’s snapshot, retrieval and human review. Checking an unchanged November 4 election page on November 16 does not create November 16 vote totals. Likewise, an article’s latest publication timestamp may differ from the timestamp attached to its embedded count.

| Entity | Suggested fields | Purpose |
|---|---|---|
| Source | `source_id`, `url`, `publisher`, `source_type`, `published_at`, `retrieved_at`, `content_sha256`, `access_status` | Preserve provenance and distinguish a blocked source from a successful check |
| Observation | `observation_id`, `record_id`, `field`, `value`, `unit`, `source_id`, `source_snapshot_at`, `extraction_method` | Tie a particular value to a particular snapshot |
| Review | `reviewed_at`, `review_scope`, `evidence_status`, `review_note`, `supersedes_observation_id` | Record exactly what was verified and what remains unresolved |
| Election result | `count_basis`, `certification_status`, `denominator_type`, `reporting_unit`, `reporting_complete`, `call_provider`, `called_at` | Prevent incompatible election quantities from being combined |
| Change | `change_id`, `previous_value`, `new_value`, `change_type`, `reason`, `review_status`, `release_id` | Support corrections and reproducible comparisons between releases |

Start with a small, explicit vocabulary: official unofficial returns, certified returns, media race calls, leading candidates, legislative roll calls, and survey estimates. Record these as separate evidence types. Avoid an unexplained numerical “confidence score”; a reader benefits more from knowing that a result is official but preliminary, or that a bill summary was checked only against its caption.

### Useful graphs and interactions

A chamber strip can show called Democratic seats, called Republican seats, other parties and uncalled seats, with a majority marker. A separate option can show projected composition when a source supplies it. A compact release timeline can identify new counts, corrected classifications and added records. A freshness matrix can show which states contain old snapshots, blocked primary sources or records awaiting review.

Use the Texas House as an acceptance example. The [Tribune report](https://www.texastribune.org/2026/11/03/texas-house-legislature-outcomes-control-republicans-democrats-2026/) makes its 83D/67R composition conditional on leads holding. The [AP republisher](https://movement.vote/election-results/2026/texas/) showed 79D/63R and eight uncalled in the reviewed November 15 snapshot. Both can be stored; they cannot be presented as the same count. The latter publisher is an advocacy organization, so identify its AP attribution and use the numerical feed without adopting its campaign labels.

**Research questions enabled:** Which results changed since the previous release? Which states have the oldest underlying evidence? Which apparent contradictions reflect different dates or counting methods? Which records have been checked against primary evidence?

An optional first target is to migrate all current result and policy records into this evidence model before adding another large source feed. “Reviewed” should always describe the review’s scope, not imply universal certification.

## Package 2 — Legal implementation and agency monitor

### What to build

Track the decision process after election night. A bill filing, legislative passage, governor signature, effective date, agency rule and project permit each answer a different policy question. A compact timeline should connect these events while preserving their separate legal meanings.

Use a policy-family identifier to connect related instruments: a law, implementing rule, agency docket, information request and subsequent report. Keep each instrument’s own identifier. Similar House and Senate proposals should be marked as officially linked companions only when an authoritative source establishes that relationship.

| Entity | Suggested fields |
|---|---|
| Instrument | `instrument_id`, `policy_family_id`, `jurisdiction`, `session`, `instrument_type`, `bill_number`, `text_version`, `official_status`, `last_action_at` |
| Legal operation | `signed_at`, `effective_at`, `applicability_start`, `applicability_rule`, `covered_entities`, `threshold_value`, `threshold_unit`, `exceptions`, `enforcement_body` |
| Implementation event | `event_id`, `instrument_id`, `agency`, `docket_id`, `event_type`, `event_date`, `deadline_type`, `next_milestone`, `source_id` |
| Political context | `current_officeholder`, `incoming_officeholder`, `takes_office_at`, `membership_control`, `organizational_control`, `coalition_status` |

The schema should allow structured thresholds without forcing every law into one number. A power threshold, floor-area threshold, prospective application rule and exemption can coexist. Save a short plain-language summary alongside the structured fields and link it to the text version reviewed.

Texas provides a useful pilot. Official [House](https://capitol.texas.gov/reports/Report.aspx?ID=housefiled&LegSess=90R) and [Senate](https://capitol.texas.gov/reports/Report.aspx?ID=senatefiled&LegSess=90R) filing reports identify 90R proposals; filing does not establish enactment. The [enrolled SB815 text](https://capitol.texas.gov/tlodocs/89R/billtext/html/SB00815F.htm) distinguishes its September 2025 effective date from applicability to plans issued or renewed from January 2026. That distinction deserves a visible field rather than a footnote buried in prose.

Agency events also need their own track. The [August 3 ERCOT notice](https://www.ercot.com/services/comm/mkt_notices/M-A080326-01?trk=article-ssr-frontend-pulse_little-text-block), [September 14 information-request notice](https://www.ercot.com/services/comm/mkt_notices/M-B091426-01?trk=article-ssr-frontend-pulse_little-text-block), and [September 21 TCEQ directive](https://gov.texas.gov/news/post/governor-abbott-directs-tceq-to-halt-data-center-permits) concern related but distinct actions. The [October 19 TCEQ letter](https://www.tceq.texas.gov/downloads/response/tceq-response-gov-abbott-dc-directive.pdf) adds implementation evidence. Link them as a sequence; do not count each as a separate statutory ban.

### Useful graphs and interactions

Use a legal timeline with separate rows for legislation, executive action, agency implementation and litigation when verified. Add a “next decision” list ordered by date, with target dates distinguished from statutory deadlines. A status distribution can count instruments by stage, provided linked events do not inflate the number of distinct policy families.

A political-context panel should distinguish serving officials from governors-elect. Coalition organization and tie-breaking rules deserve their own labels. An election winner’s campaign commitment should remain a commitment until a subsequent instrument establishes legal action. Party control alone cannot establish that a particular proposal has the votes to pass.

**Research questions enabled:** Which protections already apply? Which proposals still need a vote? Which agency controls the next step? Has implementation followed enactment? Where do a new administration’s commitments differ from existing policy?

An optional pilot could cover Texas and two contrasting states, with a bounded set of roughly 15–25 closely reviewed policy families. Expand only after the model handles effective dates, thresholds and agency events reliably.

## Package 3 — Infrastructure and public-cost context

### What to build

Add a project and resource layer that explains the practical stakes of policy decisions. Use individual facilities or defined project phases as the basic unit, then aggregate only comparable observations. Retain a geographic identifier for the host municipality or county; a statewide map alone cannot show where costs and benefits occur.

| Topic | Suggested fields | Important distinction |
|---|---|---|
| Project identity | `project_id`, `phase_id`, `operator`, `developer`, `county_fips`, `municipality`, `geometry`, `project_stage` | An announced campus may contain several phases |
| Electricity | `requested_mw`, `contracted_mw`, `energized_mw`, `annual_mwh`, `measurement_period`, `utility`, `interconnection_status` | Capacity, consumption and queue requests measure different things |
| Water | `withdrawal_volume`, `consumption_volume`, `unit`, `period`, `water_source`, `cooling_type`, `measurement_basis` | Forecast use differs from measured use; withdrawals differ from consumption |
| Public finance | `incentive_program`, `authorized_value`, `realized_value`, `duration`, `tax_base`, `public_cost_bearer`, `agreement_url` | An authorization or maximum incentive is not realized expenditure |
| Local process | `zoning_case_id`, `permit_id`, `hearing_date`, `public_vote_required`, `decision_body`, `appeal_status` | A council approval is different from a popular referendum |

The [ERCOT November 5 presentation](https://www.ercot.com/files/docs/2026/11/05/Community-Impact-RFI-PUC-Update.pdf) illustrates why definitions matter: it reports responses covering approximately 177 GW of **requested interconnection capacity**. Displaying that as operating demand would materially distort the picture. The [ERCOT information hub](https://www.ercot.com/about/legal/data-center-impact-rfi) is a useful monitored source family for subsequent releases.

Useful visual options include a capacity chart split by project stage, a water comparison limited to consistent units and periods, and a public-finance view separating authorized benefits from realized amounts. A project detail panel can show who pays for a specified grid upgrade and the source of that allocation. Unknown costs should remain unknown, not become zeroes.

Begin with verified primary source families: utility commission dockets, grid-operator releases, water-agency records, county planning files, municipal agreements and tax-agency reports. Discover project-specific URLs during the pilot rather than presuming every jurisdiction publishes equivalent data.

**Research questions enabled:** Where is proposed capacity concentrated? Which communities face documented water demand? How do incentives differ between otherwise comparable projects? Which agreements allocate infrastructure costs to developers, utilities or ratepayers?

An optional target is 10–20 projects across a few states. A smaller, comparable sample is more useful than a nationwide total built from incompatible announcements.

## Package 4 — Comparative research workbench

### What to build

Let researchers save a reproducible selection of states, policy topics and dates. A comparison view should preserve record-level links and definitions while keeping the main map uncluttered. Exports should include the filter settings, release identifier and evidence cutoff so another analyst can reconstruct the selection.

Suggested fields are `comparison_id`, `state_codes`, `topic_codes`, `instrument_types`, `status_filter`, `election_period`, `snapshot_release_id`, `denominator_rules` and `coverage_notes`. A local browser bookmark or downloadable comparison JSON can support this without requiring user accounts.

Offer three compact views: a state-by-policy matrix, a timeline of selected instruments, and a result chart with explicit denominators. Show “not identified in reviewed sources” separately from a verified absence. Counts of recorded proposals measure the inventory and legislative activity; they are not a defensible ranking of regulatory strength.

For election comparisons, a candidate victory must not become a direct AI-policy vote. Likewise, a state’s party change and its local referendum results do not establish why individual voters acted. Keep survey findings in a separate category with population, question wording, field dates and uncertainty when available.

Sources such as the [Alaska official summary](https://www.elections.alaska.gov/enr/26GENR/results/ElectionSummaryReportRPT.pdf) demonstrate the need to retain ballot-system context: first preferences, ranked-choice rounds and certified outcomes should not be silently combined. The [Arizona election calendar](https://azsos.gov/elections/election-information/2026-election-info) supplies certification milestones, which belong alongside results rather than replacing their status.

**Research questions enabled:** Which states use local consent, tax changes, disclosure or grid-cost rules? How do enacted requirements differ from pending proposals? Which outcomes are comparable after controlling for election type and policy instrument? Where does source coverage prevent a fair comparison?

## A reviewed-JSON monitoring architecture for GitHub Pages

Keep the public application static. Monitoring runs outside the page, and the page reads a versioned, reviewed JSON release. This fits the existing hosting approach without implying that GitHub Pages itself performs live research.

1. **Maintain a source registry.** Store official URLs, record associations, expected document formats, check cadence and extraction method. Start with stable sources already reviewed rather than attempting arbitrary web-wide scraping.
2. **Collect candidate observations.** An optionally scheduled GitHub Actions workflow fetches accessible sources, records hashes and timestamps, and extracts proposed changes. Retrieval failures become monitoring events; they do not erase earlier evidence or overwrite values with nulls.
3. **Produce a reviewable change set.** Write candidate JSON and a concise diff identifying changed votes, legal status, dates or text versions. Preserve prior observations. A reviewer can accept, correct or reject each substantive change.
4. **Validate the approved release.** Check stable identifiers, source references, totals, percentage denominators, chamber capacities, valid dates and missing-value semantics. Verify that policy proposals have not acquired enacted status through a text-matching shortcut.
5. **Publish static assets.** Merge the approved data, regenerate derived summaries, and publish through the existing Pages deployment process. Include `release_id`, `generated_at`, `reviewed_through` and a public change log. Retain a previous release for rollback.

Check cadences should be configurable suggestions: daily during active counting or a legislative session, less often for settled historical records. A successful fetch does not automatically mean a record is current; a changed hash does not necessarily mean a substantive change. JavaScript-only results pages and inaccessible documents need a documented manual path.

Before expanding, the next pass should demonstrate three things: a corrected result can be traced to its prior value; a legal instrument can be followed through a distinct implementation event; and a saved comparison can be reproduced from its release identifier. Across all packages, charts should have a readable table alternative, keyboard access, clear light-mode contrast and labels that do not depend on color alone.

## Additional priorities for the next implementation pass

**Future work:** the proposals below extend the four packages above. They are recommendations for a subsequent implementation pass and are not features delivered by the current review.

The next release should make each state briefing answer four questions: **What applies now? What is proposed? Who makes the next decision? What evidence supports the answer?** Preserve the sparse opening screen and put detailed research behind consistent Evidence, Timeline and Compare actions.

### 1. Make coverage and missingness visible

The current map measures the volume of selected records in this inventory. That volume reflects research coverage, inclusion rules and instrument types as well as policy activity. A state with many prefiled proposals should not appear to have stronger operative requirements merely because its inventory is larger.

Add a short visible coverage label beside the map legend, with a fuller coverage panel available on demand. Store the instrument types and jurisdictions searched, the source set used, the last systematic search, and known gaps. Any national or cross-state comparison should retain the release's inclusion rules and coverage boundaries.

Use distinct data and display states:

| Coverage or value state | Intended meaning |
|---|---|
| Records identified | The inventory contains matching sourced records |
| No matching record in a defined review | A stated set of sources was searched, with no match under the inclusion rule |
| Not systematically reviewed | The inventory cannot establish presence or absence |
| Source inaccessible | A needed source could not be checked in the current pass |
| Not reported | The inspected source does not supply this value |
| Not applicable | The field does not apply to this record |
| Verified zero | The source establishes an actual numerical zero |

Keep the value field null where appropriate, but add a structured `missing_reason` rather than asking one null to explain every case. Do not treat source inaccessibility as evidence that a prior fact has ceased to hold. Show the underlying source date separately from the review date.

### 2. Clarify policy scope and legal operation

Rename **Bills** to **Policy** in the next pass. The view includes several kinds of instrument, so retain short type labels within it: bill, enacted law, executive action, administrative rule, permit action and political proposal.

Give records an explicit relevance classification, such as direct AI governance, data-centre infrastructure or adjacent automated technology. A source should establish the relationship; the presence of computing infrastructure alone should not imply an AI workload. Keep advisory preferences distinct from binding decisions and specify what a binding decision legally changes.

A single progress bar cannot communicate every legal distinction. Use separate fields:

| Dimension | Fields to consider | Question answered |
|---|---|---|
| Procedural stage | Introduction, committee action, passage, signature, veto, expiration of proposal | What happened in the decision process? |
| Legal operation | Effective date, applicability date, affected provisions, expiration, stay or injunction, repeal | Which requirements apply, to whom and when? |
| Implementation | Rule adopted, guidance issued, appropriation, authorized staffing, required report, documented enforcement action | What steps have followed adoption? |
| Scope | Covered actors, technology or sector, threshold and units, exceptions, territorial reach | What conduct or activity is actually covered? |

Each legal-status claim needs a source and an observation date. A scheduled effective date should not silently become evidence that all implementation steps occurred. Label partial stays and provision-specific changes at the relevant scope.

For AI governance comparisons, prioritize the requirements themselves: assessments, evaluations, independent audits, disclosure, incident reporting, appeal rights and enforcement powers. Distinguish developers, deployers and public agencies when the reviewed text does. Caption-level evidence should remain insufficient for detailed clause coding.

### 3. Show the next decision and route for public participation

Add a compact “Next decision” section to the state or policy briefing. This can make the atlas useful between elections without adding another permanent map filter.

Suggested fields are `decision_body`, `committee_or_agency`, `docket_or_case_id`, `event_type`, `event_date`, `date_precision`, `deadline_timezone`, `deadline_type`, `participation_url`, `last_confirmed_at` and `event_status`. A scheduled hearing, statutory deadline, agency target and analyst estimate need different labels. Record cancellations and changed dates as updates.

When established by official evidence, show the decision-maker, the hearing or public-comment date, and a link to the formal process. Preserve timezones for timed deadlines. Do not invent an upcoming event where the source supplies none. A local watchlist and dated updates page can support initial monitoring; automated notifications would be a separate feature requiring a defined delivery method and update responsibility.

### 4. Link authorities and related legal instruments

Add relations between state laws, local ordinances, rules, permits and court decisions. This would help answer which body has authority, which instrument implements another, and which decision changes the operation of an existing policy.

Useful relation types include `implements`, `amends`, `supersedes`, `repeals`, `delegates_authority`, `limits_local_authority` and `subject_to_litigation`. Each relation should carry the relevant provision or order, source, observation date and review scope. Store a contested claim of preemption separately from an established legal determination; court involvement alone does not establish that an instrument is invalid. Do not infer official companion status or causal influence from similar wording.

Use a simple related-record list or a small policy-family timeline before building a complex network diagram. A researcher should be able to move from a local ordinance to the relevant state authority and then inspect the source supporting the relationship.

### 5. Add record links, citations and reproducible comparisons

Provide a stable permalink for every record and a “Copy citation” action. A citation should include the record title and identifier, source publisher and URL, underlying source date when known, and the atlas release consulted. Shared links should open the selected record directly.

Exports should include the release ID, generation time, filters, selected record IDs, definitions and source dates. Retain earlier observations and show a concise old-value/new-value change summary with the reason for correction. A reader should be able to reconstruct a previous comparison after the public dataset changes.

For comparison validity, establish the unit before choosing a chart:

| Comparison | Required distinctions |
|---|---|
| Policy activity | Instruments, policy families and procedural events are different units |
| Legal requirements | Proposals, enacted text, operative provisions and implementation have different meanings |
| Ballot outcomes | Binding and advisory questions; legal passage rules; question-level versus voter-level statistics |
| Candidate outcomes | Selected contests and independently verified positions; a win does not establish an AI-policy mandate |
| Infrastructure | Campus, facility and project phase; requested capacity, operating capacity and consumption |
| Public finance | Authorized, forecast, contracted and realized values; gross and net estimates |

Do not aggregate incompatible units or interpret a selected sample as a national census. Publish the inclusion and coding protocol, including how ambiguous “restriction” and AI-relevance cases were handled. Preserve a coding note for borderline cases and a review path for disputed classifications. A comparison table should show coverage gaps and source maturity alongside substantive differences.

### 6. Bound the next release

The recommended minimum release combines evidence history with a limited legal-implementation pilot. It should deliver:

1. Four short state-briefing sections: Applies now, Proposed changes, Next decision and Evidence updated.
2. A record evidence panel with reviewed fields, source snapshot, limitations and prior values.
3. A connected timeline for a limited group of policy families, including any verified implementation or litigation events.
4. A change list separating substantive changes from retrieval checks and presentation edits.
5. Record permalinks, copyable citations and a reproducible comparison export.

Start with a manageable subset of already reviewed records covering different instrument types. The existing optional target of roughly 15–25 policy families is a pilot size, not a completeness claim. Expand only after the model can represent effective dates, partial legal changes, missing data and related instruments without manual exceptions in the display code.

Acceptance should depend on research tasks: a reader can establish whether a requirement applies; trace a corrected value to its previous observation; identify an officially scheduled next decision; distinguish an unreviewed jurisdiction from a reviewed absence; and reproduce a saved comparison. Keep developer effort, retrospective research cleanup and ongoing source maintenance as separate planning estimates.

### 7. Choose the research direction after that release

| Option | Main output | What it enables | Research and maintenance tradeoff |
|---|---|---|---|
| **A. Policy monitoring desk — recommended first** | Changes, operative status, forthcoming decisions and source history | Briefings on what changed and what to watch next | Needs a bounded source list, review responsibility and frequent checks for active matters |
| **B. AI governance comparison workbench** | Clause-level matrix of requirements, scope, exceptions and enforcement | Comparative research on evaluations, audits, incident reporting and public-sector oversight | Requires close text review and a coding protocol; captions cannot support the full matrix |
| **C. Infrastructure and public-cost atlas** | A project pilot linking resource use, incentives, approvals and documented benefits | Research on who bears costs and how local decisions respond | Sources are dispersed; forecasts and observations need careful normalization |
| **D. Political commitment and follow-through** | Dated statements linked to subsequent sponsorship, votes and official actions | Descriptive accountability research | Uneven statement coverage and entity matching require substantial review; motive should not be inferred |

Option B is the strongest extension for focused AI-governance research. Option C gives the project a distinct infrastructure-policy specialization. For that option, add construction job-years versus permanent employment, announced versus realized investment, contractual conditions and clawbacks, and who pays for specified grid or water upgrades. Retain the producer, method and period of every estimate.

Option D can begin with sourced statements and official actions. Lobbying disclosures, campaign-finance records and testimony are optional later modules with their own coverage and entity-resolution requirements. Financial relationships should not automatically become claims of causation.

Defer an open-ended chatbot, a national “AI friendliness” score, automatic sentiment labels, bill-passage forecasts and large unreviewed feeds until the evidence model can support the claims they would generate. Prioritize transparent comparison over a composite ranking.

If the project becomes a continuous policy monitor, retain the 2026 election collection as a dated historical release. The policy section can continue to evolve while election results preserve their source snapshots, corrections and certification history.
