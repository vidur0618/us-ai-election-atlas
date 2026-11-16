/* US AI Election Atlas: evidence-preserving state detail panels. No dependencies. */
const DEVELOPMENT_SCOPES = new Set(['core_nov3','additional_nov3','additional_land_use','core_earlier','additional_earlier_townmeeting','scheduled']);
const SCOPE_LABELS = {
  core_nov3: 'Data-centre development', additional_nov3: 'Data-centre development', additional_land_use: 'Related land use',
  core_earlier: 'Data-centre development', additional_earlier_townmeeting: 'Town-meeting development vote', scheduled: 'Scheduled development vote',
  ai_governance: 'AI governance', ai_surveillance: 'Automated surveillance', ai_adjacent: 'Related technology',
  broader_tax: 'Broader tax measure', broader_school_finance: 'School finance'
};
const PERIOD_LABELS = {nov3:'November 3, 2026',earlier:'earlier in 2026',upcoming:'after the November 13 cutoff',all:'all recorded 2026 dates'};
const fmtNumber = new Intl.NumberFormat('en-US');

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function cleanText(value) {
  return String(value ?? '').replace(/\(turn\d+(?:view|search|news|reddit)\d+(?:\/turn\d+(?:view|search|news|reddit)\d+)*\)/g,'')
    .replace(/\bturn\d+(?:view|search|news|reddit)\d+\b/g,'').replace(/_/g,' ')
    .replace(/([,;:])(?=[A-Za-z])/g,'$1 ').replace(/([a-z])(?=(?:Nov|Sept?|Oct|Dec|Jan|Feb|March|April|May|June|July|Aug)\b)/g,'$1 ')
    .replace(/\b(Nov|Sept?|Oct|Dec|Jan|Feb|March|April|May|June|July|Aug)(?=\d)/g,'$1 ')
    .replace(/(\d)(?=(?:of|yes|no)\b)/g,'$1 ').replace(/(\d)of(?=\d)/g,'$1 of ')
    .replace(/(\b(?:remains|valid|total|than|over|under|least|the|with|and))(?=[\d$])/g,'$1 ')
    .replace(/validyes\/no/g,'valid yes/no').replace(/\s+/g,' ').trim();
}
const e = value => escapeHTML(cleanText(value));
const num = value => Number.isFinite(value) ? fmtNumber.format(value) : 'Not reported';
const pct = value => Number.isFinite(value) ? `${value.toFixed(2)}%` : 'Not reported';
const arr = value => Array.isArray(value) ? value : value === null || value === undefined || value === '' ? [] : [value];
const present = value => value !== null && value !== undefined && value !== '';
const labelKey = key => cleanText(key).replace(/\b\w/g, c => c.toUpperCase());
function safeURL(value) { try { const u = new URL(String(value)); return ['http:','https:'].includes(u.protocol) ? u.href : null; } catch { return null; } }
function dateLabel(value) {
  if (!value) return 'Date not reported';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(value+'T12:00:00Z'));
  return cleanText(value);
}
const tag = (text,tone='gray') => `<span class="tag tag--${tone}">${e(text)}</span>`;
function empty(title, text) { return `<div class="empty-state"><span class="empty-state__icon" aria-hidden="true">—</span><h3>${e(title)}</h3><p>${e(text)}</p></div>`; }

export function matchesPeriod(record, period='nov3') {
  const date=record.election_date || record.date;
  if (period==='all') return true;
  if (!date) return false;
  if (period==='earlier') return date >= '2026-01-01' && date < '2026-11-03';
  if (period==='upcoming') return date > '2026-11-13';
  return date === '2026-11-03';
}
export function matchesBallot(record,period='nov3',topic='all') {
  if (!matchesPeriod(record,period)) return false;
  if (topic==='all') return true;
  if (topic==='development') return DEVELOPMENT_SCOPES.has(record.scope_group);
  if (topic==='governance' || topic==='ai_governance') return record.scope_group==='ai_governance';
  if (topic==='surveillance') return record.scope_group==='ai_surveillance';
  if (topic==='finance') return ['broader_tax','broader_school_finance'].includes(record.scope_group);
  if (topic==='adjacent') return ['ai_adjacent','broader_tax','broader_school_finance'].includes(record.scope_group);
  return record.scope_group===topic;
}

export function policyStage(policy) {
  const s=String(policy.status||'').toLowerCase();
  if (/veto/.test(s)) return {id:'vetoed',label:'Vetoed',tone:'red'};
  if (/failed|did not become law|died|defeated/.test(s)) return {id:'failed',label:'Did not advance',tone:'gray'};
  if (/prefiled/.test(s)) return {id:'prefiled',label:'Prefiled',tone:'amber'};
  if (/discovery|watchlist/.test(s)) return {id:'watchlist',label:'Watchlist',tone:'gray'};
  if (/pledge|campaign|political proposal|drafting|draft proposal/.test(s)) return {id:'proposal',label:'Proposal / pledge',tone:'amber'};
  if (/not enacted|no enactment|not signed|no signing|not yet law|not.*verified|no.*verified|introduced|committee|pending|tabled|referred|passed/.test(s)) return {id:'pending',label:'Proposal / pending',tone:'amber'};
  if (/enacted|signed|executive order|issued|in effect/.test(s)) return {id:'enacted',label:'Enacted / issued',tone:'teal'};
  return {id:'other',label:'See recorded status',tone:'gray'};
}

function sourceRows(record,data) {
  const registry=new Map((data.sources||[]).map(s=>[s.source_id,s]));
  const byURL=new Map((data.sources||[]).map(s=>[s.url,s]));
  const out=[]; const seen=new Set();
  for(const sid of record.source_ids||[]){const s=registry.get(sid); if(s && safeURL(s.url) && !seen.has(s.url)){out.push(s);seen.add(s.url);}}
  const fallback=[...(record.sources||[]), record.primary_url, record.secondary_url, record.legal_text_url];
  if(typeof record.source==='string' && record.source.startsWith('http'))fallback.push(record.source);
  for(const url of fallback){if(safeURL(url) && !seen.has(url)){out.push(byURL.get(url)||{url,title:new URL(url).hostname.replace(/^www\./,''),type:''});seen.add(url);}}
  return out;
}
function sourcesHTML(record,data) {
  const sources=sourceRows(record,data);
  return sources.length?`<div class="evidence-sources"><h4>Sources</h4><ul class="source-list">${sources.map(s=>`<li><a href="${escapeHTML(safeURL(s.url))}" target="_blank" rel="noopener noreferrer">${e(s.title||new URL(s.url).hostname)}<span aria-hidden="true"> ↗</span></a>${s.type?`<small>${e(s.type)}</small>`:''}</li>`).join('')}</ul></div>`:'<p class="microcopy">No direct source link in this record. Consult the full dossier.</p>';
}
function notesHTML(notes) {
  const values=arr(notes).filter(present);
  return values.length ? `<ul class="evidence-notes">${values.map(n=>`<li>${e(typeof n==='object'?JSON.stringify(n):n)}</li>`).join('')}</ul>` : '';
}
function factRows(rows) {
  return `<dl class="evidence-facts">${rows.filter(([,value])=>present(value)).map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>`;
}
function genericDetails(value) {
  if(value===null || value===undefined)return '<span class="muted">Not reported</span>';
  if(Array.isArray(value))return `<ol class="component-list">${value.map(v=>`<li>${genericDetails(v)}</li>`).join('')}</ol>`;
  if(typeof value==='object')return `<dl class="component-facts">${Object.entries(value).filter(([k])=>!['source_ref','source_refs','ref'].includes(k)).map(([k,v])=>`<div><dt>${e(labelKey(k))}</dt><dd>${genericDetails(v)}</dd></div>`).join('')}</dl>`;
  if(typeof value==='number')return escapeHTML(num(value));
  const url=safeURL(value);if(url)return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${e(new URL(url).hostname)} ↗</a>`;
  return e(value);
}

function outcomeInfo(record) {
  const raw=String(record.outcome||'');
  if(record.election_date>'2026-11-13' || /scheduled/.test(raw))return {label:'Scheduled',tone:'blue'};
  if(/approved|passed/.test(raw))return {label:'Approved',tone:'teal'};
  if(/rejected|failed/.test(raw))return {label:'Rejected',tone:'amber'};
  return {label:raw || 'Result not reported',tone:'gray'};
}
function voteBar(yes,no,yesLabel='Yes',noLabel='No') {
  if(!Number.isFinite(yes)||!Number.isFinite(no)||yes+no<=0)return '<p class="result-unavailable">Exact vote tally unavailable.</p>';
  const y=100*yes/(yes+no),n=100-y;
  return `<div class="vote-values"><div><span>${e(yesLabel)}</span><strong>${pct(y)}</strong><small>${num(yes)} votes</small></div><div><span>${e(noLabel)}</span><strong>${pct(n)}</strong><small>${num(no)} votes</small></div></div><div class="vote-bar" role="img" aria-label="${e(yesLabel)} ${pct(y)}, ${num(yes)} votes. ${e(noLabel)} ${pct(n)}, ${num(no)} votes."><span class="vote-bar__yes" style="width:${y.toFixed(6)}%"></span><span class="vote-bar__no" style="width:${n.toFixed(6)}%"></span></div><p class="microcopy denominator">Share of ${num(yes+no)} valid ${e(yesLabel.toLowerCase())}/${e(noLabel.toLowerCase())} votes.</p>`;
}

export function renderBallotCard(record,data,{compact=false}={}) {
  const outcome=outcomeInfo(record);
  const legal=record.legal_type==='advisory'?'Advisory':record.legal_type==='town_meeting_binding'?'Binding town meeting':'Binding';
  const scheduled=outcome.label==='Scheduled';
  const restriction={more_restrictive:'More restrictive winning position',less_restrictive:'Less restrictive winning position'}[record.restriction_outcome];
  const facts=[
    ['Recorded result status',record.result_status],['Result snapshot',record.result_updated_at],['Retrieved',record.retrieved_as_of],
    ['Primary count check',record.primary_counts_verified===true?'Counts read in a primary source':'Counts not independently read in a primary source'],
    ['Certification date',record.certification_date],['Yes votes',Number.isFinite(record.yes_votes)?num(record.yes_votes):null],['No votes',Number.isFinite(record.no_votes)?num(record.no_votes):null],
    ['Valid yes/no votes',Number.isFinite(record.valid_yes_no_votes)?num(record.valid_yes_no_votes):null],
    ['Blank votes',Number.isFinite(record.blank_votes)?num(record.blank_votes):null],['Undervotes',Number.isFinite(record.undervotes)?num(record.undervotes):null],
    ['Overvotes',Number.isFinite(record.overvotes)?num(record.overvotes):null],['Other ballots, unclassified',Number.isFinite(record.other_ballots_unclassified)?num(record.other_ballots_unclassified):null],
    ['Reported contest total',Number.isFinite(record.reported_contest_total)?num(record.reported_contest_total):null],
    ['Ballots cast',Number.isFinite(record.ballots_cast)?num(record.ballots_cast):null],['Reported town ballots',Number.isFinite(record.reported_town_ballots)?num(record.reported_town_ballots):null],
    ['Reported jurisdiction voters',Number.isFinite(record.reported_jurisdiction_voters)?num(record.reported_jurisdiction_voters):null],
    ['Registered voters',Number.isFinite(record.registered_voters)?num(record.registered_voters):null],['Reported turnout',Number.isFinite(record.reported_turnout_pct)?pct(record.reported_turnout_pct):null],
    ['Source-published yes share',Number.isFinite(record.reported_yes_pct)?pct(record.reported_yes_pct):null],['Published-share denominator',record.reported_pct_denominator],
    ['Yes means',{restrict:'Support restrictions',permit:'Support permission / development',other:'Institutional or other change'}[record.yes_effect]||record.yes_effect]
  ];
  const nested=[['County components',record.county_components],['Component returns',record.component_returns],['Vote modes',record.vote_modes],['Precinct results',record.precinct_results],['Previous snapshots',record.historical_versions]].filter(([,v])=>v && (Array.isArray(v)?v.length:Object.keys(v).length));
  return `<article class="record-card ballot-card${compact?' record-card--compact':''}" data-record-id="${escapeHTML(record.record_id)}" data-scope="${escapeHTML(record.scope_group)}">
    <div class="card-kicker"><span>${e(record.jurisdiction)}</span><time datetime="${escapeHTML(record.election_date||'')}">${e(dateLabel(record.election_date))}</time></div>
    <div class="record-title-row"><h3>${e(record.measure_title||record.measure_id||'Ballot question')}</h3>${tag(outcome.label,outcome.tone)}</div>
    <div class="tag-row">${tag(legal)}${tag(SCOPE_LABELS[record.scope_group]||'Related question')}</div>
    <p class="policy-summary">${e(record.policy_summary)}</p>
    ${record.result_status?`<p class="result-status">${e(record.result_status)}</p>`:''}
    ${scheduled?'<p class="scheduled-message">No election result at the evidence cutoff.</p>':voteBar(record.yes_votes,record.no_votes)}
    ${restriction?`<p class="outcome-note">${e(restriction)}${legal==='Advisory'?' · Advisory preference':''}</p>`:''}
    <details class="evidence"><summary>Evidence &amp; vote details <span aria-hidden="true">+</span></summary><div class="evidence-body">
      ${factRows(facts)}${notesHTML(record.notes)}
      ${nested.map(([label,value])=>`<details class="nested-evidence"><summary>${e(label)}</summary>${genericDetails(value)}</details>`).join('')}
      ${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p>
    </div></details>
  </article>`;
}

function renderChambers(chambers,data) {
  return chambers.map(c=>{
    const total=(c.D||0)+(c.R||0)+(c.other||0)+(c.uncalled||0);
    return `<div class="chamber-row"><div class="chamber-heading"><strong>${e(c.chamber)}</strong><span><b class="text-dem">${num(c.D)} D</b> · <b class="text-rep">${num(c.R)} R</b>${c.other?` · ${num(c.other)} other`:''}${c.uncalled?` · ${num(c.uncalled)} open`:''}</span></div>${total?`<div class="chamber-bar" role="img" aria-label="${e(c.chamber)}: ${num(c.D)} Democratic, ${num(c.R)} Republican${c.uncalled?`, ${num(c.uncalled)} uncalled`:''}"><span class="chamber-bar__dem" style="width:${100*(c.D||0)/total}%"></span><span class="chamber-bar__rep" style="width:${100*(c.R||0)/total}%"></span>${c.other?`<span class="chamber-bar__other" style="width:${100*c.other/total}%"></span>`:''}${c.uncalled?`<span class="chamber-bar__open" style="width:${100*c.uncalled/total}%"></span>`:''}</div>`:''}<p class="microcopy">${e(c.as_of)}</p><details class="evidence evidence--small"><summary>Seat-count source <span aria-hidden="true">+</span></summary><div class="evidence-body">${notesHTML(c.note)}${sourcesHTML(c,data)}</div></details></div>`;
  }).join('');
}
function controlBlock(data,stateCode) {
  const state=(data.states||[]).find(s=>s.state===stateCode);
  const controls=(data.control_changes||[]).filter(r=>r.state===stateCode);
  const chambers=(data.chamber_snapshots||[]).filter(r=>r.state===stateCode);
  return `<section class="control-summary"><div class="section-heading"><h3>Leadership &amp; legislature</h3><span>Incoming picture</span></div><p class="control-context">${e(state?.control_context||'No leadership-change record retained for this state in the selected inventory.')}</p>${controls.length?`<div class="control-list">${controls.map(c=>`<div class="control-row"><span>${e(c.office)}</span><strong><span class="party-pill party-pill--${c.before==='R'?'rep':c.before==='D'?'dem':'other'}">${e(c.before)}</span><span class="control-arrow" aria-hidden="true">→</span><span class="party-pill party-pill--${c.after==='R'?'rep':c.after==='D'?'dem':'other'}">${e(c.after)}</span></strong></div>${c.election_date && c.election_date<'2026-01-01'?`<p class="microcopy">Prior-year election: ${e(dateLabel(c.election_date))}</p>`:''}`).join('')}</div>`:''}${renderChambers(chambers,data)}${controls.length?`<details class="evidence"><summary>Leadership sources &amp; context <span aria-hidden="true">+</span></summary><div class="evidence-body">${controls.map(c=>`<div class="control-evidence"><strong>${e(c.office)}</strong>${notesHTML(c.note)}${sourcesHTML(c,data)}</div>`).join('')}</div></details>`:''}</section>`;
}

function candidateRows(choices,total,winner) {
  return choices.map(choice=>{
    const isWinner=choice.winner===true || (typeof winner==='string' && winner===choice.name);
    const share=Number.isFinite(choice.votes)&&Number.isFinite(total)&&total>0?choice.votes/total*100:null;
    const party=String(choice.party||'');
    const tone=party==='D'||/^Democratic/.test(party)?'dem':party==='R'||/^Republican/.test(party)?'rep':'other';
    return `<div class="candidate-row${isWinner?' candidate-row--winner':''}"><div class="candidate-heading"><div><span class="candidate-name">${e(choice.name)}</span>${party?`<span class="candidate-party">${e(party)}</span>`:''}${isWinner?'<span class="winner-label">Elected</span>':''}</div><div class="candidate-numbers"><strong>${share===null?'—':pct(share)}</strong><small>${num(choice.votes)}${Number.isFinite(choice.votes)?' votes':''}</small></div></div>${share!==null?`<div class="candidate-bar"><span class="candidate-bar__${tone}" style="width:${Math.max(0,Math.min(100,share))}%"></span></div>`:''}${choice.zero_value_note?`<p class="microcopy source-zero-note">${e(choice.zero_value_note)}</p>`:''}</div>`;
  }).join('');
}
function renderElection(record,data) {
  const choices=record.choices||[];
  const total=Number.isFinite(record.valid_listed_votes)?record.valid_listed_votes:choices.every(c=>Number.isFinite(c.votes))?choices.reduce((sum,c)=>sum+c.votes,0):null;
  const conflicts=(data.source_conflicts||[]).filter(c=>c.state===record.state && choices.some(choice=>choice.name===c.candidate));
  return `<article class="record-card election-card" data-record-id="${escapeHTML(record.record_id)}"><div class="card-kicker"><span>${e(record.jurisdiction||record.state)}</span><time>${e(dateLabel(record.election_date))}</time></div><div class="record-title-row"><h3>${e(record.office)}</h3>${record.party_transition?tag(record.party_transition,'blue'):''}</div><p class="result-status">${e(record.status)}</p><div class="candidate-list">${candidateRows(choices,total,record.winner)}</div><p class="microcopy denominator">${num(total)} listed candidate selections. Percentages calculated from these selections.</p>${conflicts.length?`<p class="data-warning">${conflicts.length} candidate share${conflicts.length===1?'':'s'} differ from the external tracker. The snapshots remain separate.</p>`:''}<details class="evidence"><summary>Election sources &amp; qualifications <span aria-hidden="true">+</span></summary><div class="evidence-body">${factRows([['Result snapshot',record.snapshot],['Denominator',record.denominator_note]])}${notesHTML(record.notes)}${record.nested_writein_breakdown?.length?`<details class="nested-evidence"><summary>Write-in components already included in the aggregate</summary><p class="microcopy">Do not add these to the candidate total a second time.</p>${genericDetails(record.nested_writein_breakdown)}</details>`:''}${conflicts.length?`<details class="nested-evidence"><summary>Conflicting tracker snapshots</summary>${conflicts.map(c=>`<div class="conflict-row"><strong>${e(c.candidate)}</strong><p>Selected result: ${pct(c.selected_share)}. Tracker: ${pct(c.tracker_share)} (${e(c.tracker_status)}).</p><p class="microcopy">${e(c.interpretation)}</p></div>`).join('')}</details>`:''}${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p></div></details></article>`;
}
function renderRecall(record,data) {
  const yesNo=Number.isFinite(record.yes)&&Number.isFinite(record.no);
  const choices=record.choices||[];
  const total=record.total_valid_votes || choices.reduce((s,c)=>s+(c.votes||0),0);
  return `<article class="record-card recall-card" data-record-id="${escapeHTML(record.record_id)}"><div class="card-kicker"><span>${e(record.jurisdiction)}</span><time>${e(dateLabel(record.election_date))}</time></div><div class="record-title-row"><h3>${e(record.official)}</h3>${tag(yesNo?'Recall vote':'Replacement contest','amber')}</div>${record.office?`<p class="microcopy">${e(record.office)}</p>`:''}<p class="policy-summary">${e(record.issue)}</p>${yesNo?voteBar(record.yes,record.no,'Recall','Retain'):`<div class="candidate-list">${candidateRows(choices,total,null)}</div>`}${record.replacement?.length?`<details class="nested-evidence"><summary>Replacement result${record.replacement.length===1?'':'s'}</summary>${candidateRows(record.replacement,record.replacement.reduce((s,c)=>s+c.votes,0),null)}</details>`:''}<details class="evidence"><summary>Recall evidence <span aria-hidden="true">+</span></summary><div class="evidence-body">${factRows([['Recorded status',record.status],['Ballots cast',Number.isFinite(record.ballots_cast)?num(record.ballots_cast):null],['Registered voters',Number.isFinite(record.registered_voters)?num(record.registered_voters):null],['Reported turnout',Number.isFinite(record.turnout_percent)?pct(record.turnout_percent):null],['Overvotes',Number.isFinite(record.overvotes)?num(record.overvotes):null],['Undervotes',Number.isFinite(record.undervotes)?num(record.undervotes):null]])}${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p></div></details></article>`;
}

export function renderPolicyCard(record,data,{compact=false}={}) {
  const stage=policyStage(record);
  const caption=/caption/.test(record.verification||'') || record.priority==='caption_verified';
  const votes=record.legislative_votes;
  return `<article class="record-card policy-card${compact?' record-card--compact':''}" data-record-id="${escapeHTML(record.record_id)}" data-policy-stage="${stage.id}" data-search="${escapeHTML(cleanText([record.instrument,record.title,record.summary,record.sponsors,...arr(record.topics)].join(' ')).toLowerCase())}"><div class="card-kicker"><span>${e(record.session||'Session not recorded')}</span>${record.status_date?`<time>${e(dateLabel(record.status_date))}</time>`:''}</div><div class="record-title-row"><h3>${e(record.instrument||record.title||'Policy record')}</h3>${tag(stage.label,stage.tone)}</div>${record.title && record.title!==record.instrument && record.title!==record.summary?`<p class="policy-title">${e(record.title)}</p>`:''}<p class="policy-summary">${e(record.summary)}</p><p class="policy-status"><strong>Recorded status:</strong> ${e(record.status)}</p>${caption?'<p class="verification-note">Caption-level review · operative clauses not fully checked</p>':''}<details class="evidence"><summary>Policy detail &amp; sources <span aria-hidden="true">+</span></summary><div class="evidence-body">${factRows([['Sponsor(s)',record.sponsors],['Recorded action date',record.status_date?dateLabel(record.status_date):null],['Effective date',record.effective_date?dateLabel(record.effective_date):null],['Verification',record.verification],['Topics',arr(record.topics).join(' · ')]])}${notesHTML(record.notes)}${votes && (typeof votes==='string'||votes.length)?`<div class="legislative-votes"><h4>Legislative votes</h4><p class="microcopy">Votes by legislators, separate from public ballot returns.</p>${typeof votes==='string'?`<p>${e(votes)}</p>`:votes.map(v=>`<p><strong>${e(v.chamber||'Chamber')}</strong>${v.date?` · ${e(dateLabel(v.date))}`:''}${Number.isFinite(v.yes)?` · ${num(v.yes)} yes / ${num(v.no)} no`:''}${v.stage?` · ${e(v.stage)}`:''}</p>`).join('')}</div>`:''}${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p></div></details></article>`;
}

function ballotPanel(data,stateCode,period,topic) {
  const all=(data.ballots||[]).filter(r=>r.state===stateCode);
  const records=all.filter(r=>matchesBallot(r,period,topic)).sort((a,b)=>a.election_date.localeCompare(b.election_date)||a.jurisdiction.localeCompare(b.jurisdiction));
  return `<div class="panel-section-intro"><p>${records.length} question${records.length===1?'':'s'} matching the current filters.</p><span>Yes/no shares use valid votes. Binding and advisory questions are labelled separately.</span></div>${records.length?records.map(r=>renderBallotCard(r,data)).join(''):empty('No matching ballot question',all.length?`${all.length} question${all.length===1?' is':'s are'} retained for this state across all periods and topics. Change the filters to explore them.`:'No qualifying direct question was identified for this state in the reviewed sources. This is a coverage statement, not a certified zero.')}`;
}
function electionPanel(data,stateCode,period) {
  const elections=(data.elections||[]).filter(r=>r.state===stateCode && matchesPeriod(r,period));
  const recalls=(data.recalls||[]).filter(r=>r.state===stateCode && matchesPeriod(r,period));
  return `${controlBlock(data,stateCode)}<div class="section-heading"><h3>Selected candidate contests</h3><span>${elections.length}</span></div><p class="section-note">Retained source snapshots for ${e(PERIOD_LABELS[period]||PERIOD_LABELS.nov3)}. A candidate vote cannot isolate support for an AI policy.</p>${elections.length?elections.map(r=>renderElection(r,data)).join(''):empty('No selected candidate result','No candidate contest with a retained vote tally matches this state and period. Leadership-change records and the external tracker may still provide context.')}<div class="section-heading section-heading--spaced"><h3>Recalls &amp; replacements</h3><span>${recalls.length}</span></div>${recalls.length?`<p class="section-note">Removal and replacement contests have different vote formats; neither automatically reverses a development approval.</p>${recalls.map(r=>renderRecall(r,data)).join('')}`:empty('No matching recall','No actual recall or recall-replacement election is retained for this state and selected period.')}`;
}
function billPanel(data,stateCode) {
  const policies=(data.policies||[]).filter(r=>r.state===stateCode);
  const order={prefiled:0,pending:1,proposal:2,enacted:3,vetoed:4,failed:5,watchlist:6,other:7};
  const sorted=[...policies].sort((a,b)=>order[policyStage(a).id]-order[policyStage(b).id] || (b.status_date||'').localeCompare(a.status_date||'') || (a.instrument||'').localeCompare(b.instrument||'',undefined,{numeric:true}));
  return `<div class="panel-section-intro"><p>${policies.length} selected policy record${policies.length===1?'':'s'}.</p><span>Includes proposals, existing laws and executive actions. The ballot-date filter does not change this policy inventory.</span></div>${policies.length?`<label class="panel-search"><span>Find a bill or topic</span><input type="search" id="policy-search" placeholder="Bill number, water, AI, tax…" autocomplete="off" data-action="filter-policies"></label><p class="microcopy policy-search-count" aria-live="polite"></p><div class="policy-records">${sorted.map(r=>renderPolicyCard(r,data)).join('')}</div>`:empty('No selected policy record','No bill or policy record is retained for this state in the selected inventory. This does not establish that the state has no relevant legislation.')}`;
}
function overviewPanel(data,stateCode,period,topic) {
  const state=(data.states||[]).find(s=>s.state===stateCode);
  const ballots=(data.ballots||[]).filter(r=>r.state===stateCode && matchesBallot(r,period,topic));
  const policies=(data.policies||[]).filter(r=>r.state===stateCode);
  const elections=(data.elections||[]).filter(r=>r.state===stateCode && matchesPeriod(r,period));
  const recalls=(data.recalls||[]).filter(r=>r.state===stateCode && matchesPeriod(r,period));
  const featuredBallots=[...ballots].sort((a,b)=>(a.scope_group==='ai_governance'?-1:0)-(b.scope_group==='ai_governance'?-1:0)||a.jurisdiction.localeCompare(b.jurisdiction)).slice(0,2);
  const priority=['TX_SB296','TX_SB293','TX_SB32'];
  const featuredPolicies=[...policies].sort((a,b)=>{
    const ai=priority.indexOf(a.record_id),bi=priority.indexOf(b.record_id);
    if(ai>=0||bi>=0)return (ai<0?99:ai)-(bi<0?99:bi);
    return (a.priority==='caption_verified'?1:0)-(b.priority==='caption_verified'?1:0);
  }).slice(0,3);
  return `<div class="state-metrics"><div><strong>${ballots.length}</strong><span>Matching questions</span></div><div><strong>${policies.length}</strong><span>Policy records</span></div><div><strong>${elections.length}</strong><span>Selected contests</span></div><div><strong>${recalls.length}</strong><span>Recall officials</span></div></div>${controlBlock(data,stateCode)}<div class="section-heading section-heading--spaced"><h3>On the ballot</h3>${ballots.length?`<button type="button" class="text-button" data-panel-tab="ballots">All ${ballots.length} →</button>`:''}</div>${featuredBallots.length?featuredBallots.map(r=>renderBallotCard(r,data,{compact:true})).join(''):empty('No matching direct question',ballots.length===0 && (data.ballots||[]).some(r=>r.state===stateCode)?'Other periods or topics contain records for this state. Adjust the filters to see them.':state?.coverage_statement||'No qualifying direct question identified in the reviewed inventory; this is not a certified zero.')}<div class="section-heading section-heading--spaced"><h3>Policy agenda</h3>${policies.length?`<button type="button" class="text-button" data-panel-tab="bills">All ${policies.length} →</button>`:''}</div>${featuredPolicies.length?featuredPolicies.map(r=>renderPolicyCard(r,data,{compact:true})).join(''):empty('No selected policy record','The dossier retains no bill record for this state. Refer to the coverage notes before interpreting this as absence of policy activity.')}<p class="coverage-footnote">Research snapshot: November 13, 2026. The inventory is not a certified census of every municipal election.</p>`;
}

/** Render the detail-panel body. The caller owns the state heading, tabs and events. */
export function renderStatePanel({data,stateCode,tab='overview',period='nov3',topic='all'}) {
  if(!data || !(data.states||[]).some(s=>s.state===stateCode))return empty('Select a state','Choose a state on the map or use the state selector.');
  const content=tab==='ballots'?ballotPanel(data,stateCode,period,topic):tab==='elections'?electionPanel(data,stateCode,period):tab==='bills'?billPanel(data,stateCode):overviewPanel(data,stateCode,period,topic);
  return `<div class="state-panel-body" data-state="${escapeHTML(stateCode)}" data-panel-view="${escapeHTML(tab)}">${content}</div>`;
}
