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
function empty(title,text) {
  return `<div class="empty-state"><span class="empty-state__icon" aria-hidden="true">—</span><h3>${e(title)}</h3><details class="evidence evidence--small"><summary>Coverage <span aria-hidden="true">+</span></summary><p>${e(text)}</p></details></div>`;
}

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
  const raw=String(record.outcome||'').toLowerCase();
  if(record.election_date>'2026-11-13' || /scheduled/.test(raw))return {id:'scheduled',label:'Scheduled',tone:'blue'};
  if(/approved|passed/.test(raw))return {id:'approved',label:'Approved',tone:'teal'};
  if(/rejected|failed/.test(raw))return {id:'rejected',label:'Rejected',tone:'amber'};
  return {id:'unreported',label:'Unreported',tone:'gray'};
}
function resultQualifier(value) {
  const status=String(value||'').toLowerCase();
  if(/unofficial/.test(status))return 'Unofficial';
  if(/not.*certif|certif.*not|certification.*established/.test(status))return 'Reported';
  if(/certified_partial/.test(status))return 'Mixed sources';
  if(/certified/.test(status))return 'Certified';
  if(/official/.test(status))return 'Official return';
  return status?'Reported':'';
}
function chartSegment(value,total,label,tone,attrs='') {
  if(!Number.isFinite(value)||value<=0||!Number.isFinite(total)||total<=0)return '';
  return `<button type="button" class="viz-segment" style="width:${100*value/total}%;--segment:var(--${tone})" data-viz-info="${e(label)}" title="${e(label)}" aria-label="${e(label)}" ${attrs}></button>`;
}
function readout(text) { return `<p class="viz-readout" data-default="${e(text)}" aria-live="polite">${e(text)}</p>`; }
function ballotChart(records,{overview=false}={}) {
  if(!records.length)return '';
  const categories=[['approved','Approved','viz-mint'],['rejected','Rejected','viz-terracotta'],['scheduled','Scheduled','viz-lavender'],['unreported','Unreported','viz-neutral']].map(([id,label,tone])=>({id,label,tone,count:records.filter(r=>outcomeInfo(r).id===id).length})).filter(c=>c.count);
  const attrs=c=>overview?'':`data-ballot-filter="${c.id}" aria-pressed="false"`;
  return `<section class="viz-card viz-outcomes"><div class="viz-heading"><h3>Ballot outcomes</h3>${overview?'<button type="button" class="text-button" data-panel-tab="ballots" aria-label="Explore ballot records">↗</button>':`<strong>${num(records.length)}</strong>`}</div><div class="viz-track" role="group" aria-label="Question outcomes, counts of questions">${categories.map(c=>chartSegment(c.count,records.length,`${c.label}: ${num(c.count)} of ${num(records.length)} questions`,c.tone,attrs(c))).join('')}</div><div class="viz-legend">${categories.map(c=>`<button type="button" class="viz-filter" ${attrs(c)} data-viz-info="${e(`${c.label}: ${num(c.count)} questions`)}"><i style="--segment:var(--${c.tone})"></i><span>${e(c.label)}</span><strong>${num(c.count)}</strong></button>`).join('')}${overview?'':'<button type="button" class="viz-filter viz-filter--all" data-ballot-filter="all" aria-pressed="true">All</button>'}</div>${readout(`${num(records.length)} questions · counts, not vote totals`)}</section>`;
}
const POLICY_CHART_LABELS={prefiled:'Prefiled',pending:'Pending',proposal:'Proposals',enacted:'Enacted / issued',vetoed:'Vetoed',failed:'Did not advance',watchlist:'Watchlist',other:'Other'};
function policyChart(policies,{overview=false}={}) {
  if(!policies.length)return '';
  const groups=Object.keys(POLICY_CHART_LABELS).map(id=>({id,label:POLICY_CHART_LABELS[id],count:policies.filter(p=>policyStage(p).id===id).length})).filter(g=>g.count);
  const max=Math.max(...groups.map(g=>g.count));
  return `<section class="viz-card viz-policy"><div class="viz-heading"><h3>Policy stages</h3>${overview?'<button type="button" class="text-button" data-panel-tab="bills" aria-label="Explore policy records">↗</button>':`<button type="button" class="viz-filter viz-filter--all" data-policy-filter="all" aria-pressed="true">All ${num(policies.length)}</button>`}</div><div class="viz-bars" role="group" aria-label="Policy records by recorded stage">${groups.map(g=>`<button type="button" class="viz-bar-row" ${overview?'':`data-policy-filter="${g.id}" aria-pressed="false"`} data-viz-info="${e(`${g.label}: ${num(g.count)} policy records`)}" aria-label="${e(`${g.label}: ${num(g.count)} policy records${overview?'':'. Filter records.'}`)}"><span>${e(g.label)}</span><span class="viz-bar-track"><i style="width:${100*g.count/max}%;--segment:var(--${g.id==='enacted'?'viz-mint':g.id==='vetoed'?'viz-terracotta':'viz-lavender'})"></i></span><strong>${num(g.count)}</strong></button>`).join('')}</div>${readout('Across recorded sessions')}</section>`;
}

function voteBar(yes,no,yesLabel='Yes',noLabel='No') {
  if(!Number.isFinite(yes)||!Number.isFinite(no)||yes+no<=0)return '<p class="result-unavailable">Tally unavailable</p>';
  const total=yes+no,y=100*yes/total,n=100-y;
  return `<div class="viz-group viz-vote"><div class="viz-value-line"><span>${e(yesLabel)} <strong>${pct(y)}</strong></span><span>${e(noLabel)} <strong>${pct(n)}</strong></span></div><div class="viz-track viz-track--votes" role="group" aria-label="${e(yesLabel)} and ${e(noLabel)} shares of valid votes">${chartSegment(yes,total,`${yesLabel}: ${num(yes)} votes · ${pct(y)}`,'viz-mint')}${chartSegment(no,total,`${noLabel}: ${num(no)} votes · ${pct(n)}`,'viz-terracotta')}</div>${readout(`${num(total)} valid ${yesLabel.toLowerCase()}/${noLabel.toLowerCase()} votes`)}</div>`;
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
  return `<article class="record-card ballot-card${compact?' record-card--compact':''}" data-record-id="${escapeHTML(record.record_id)}" data-scope="${escapeHTML(record.scope_group)}" data-outcome="${outcome.id}">
    <div class="card-kicker"><span>${e(record.jurisdiction)}</span>${tag(outcome.label,outcome.tone)}</div>
    <div class="record-title-row"><h3>${e(record.measure_title||record.measure_id||'Ballot question')}</h3></div>
    <div class="viz-mini-meta"><span>${e(legal)}</span>${record.result_status&&!scheduled?`<span>${e(resultQualifier(record.result_status))}</span>`:''}<time datetime="${escapeHTML(record.election_date||'')}">${e(dateLabel(record.election_date))}</time></div>
    ${scheduled?'<p class="scheduled-message">Vote pending</p>':voteBar(record.yes_votes,record.no_votes)}
    <details class="evidence"><summary>Details &amp; sources <span aria-hidden="true">+</span></summary><div class="evidence-body">
      <p class="policy-summary">${e(record.policy_summary)}</p><p class="microcopy">${e(SCOPE_LABELS[record.scope_group]||'Related question')}</p>
      ${restriction?`<p class="outcome-note">${e(restriction)}${legal==='Advisory'?' · Advisory preference':''}</p>`:''}
      ${factRows(facts)}${notesHTML(record.notes)}
      ${nested.map(([label,value])=>`<details class="nested-evidence"><summary>${e(label)}</summary>${genericDetails(value)}</details>`).join('')}
      ${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p>
    </div></details>
  </article>`;
}

function renderChambers(chambers,data) {
  return chambers.map(c=>{
    const groups=[['D',c.D,'dem'],['R',c.R,'rep'],['Other',c.other,'viz-neutral'],['Open',c.uncalled,'viz-lavender']].filter(([,count])=>Number.isFinite(count)&&count>0);
    const total=groups.reduce((sum,[,count])=>sum+count,0);
    const known=Number.isFinite(c.D)&&Number.isFinite(c.R);
    return `<div class="chamber-row viz-group"><div class="chamber-heading"><strong>${e(c.chamber)}</strong><span><b class="text-dem">${num(c.D)} D</b> · <b class="text-rep">${num(c.R)} R</b>${c.other?` · ${num(c.other)} other`:''}${c.uncalled?` · ${num(c.uncalled)} open`:''}</span></div>${known&&total?`<div class="viz-track viz-track--seats" role="group" aria-label="${e(c.chamber)} seats">${groups.map(([label,count,tone])=>chartSegment(count,total,`${c.chamber} · ${label}: ${num(count)} seats`,tone)).join('')}</div>${readout(c.uncalled?`${num(c.uncalled)} seats uncalled`:`${num(total)} seats · recorded snapshot`)}`:'<p class="viz-note">Seat totals unavailable</p>'}<details class="evidence evidence--small"><summary>Source <span aria-hidden="true">+</span></summary><div class="evidence-body"><p class="microcopy">${e(c.as_of)}</p>${notesHTML(c.note)}${sourcesHTML(c,data)}</div></details></div>`;
  }).join('');
}

function controlBlock(data,stateCode) {
  const state=(data.states||[]).find(s=>s.state===stateCode);
  const summary=(data.state_summaries||[]).find(s=>s.state===stateCode);
  const controls=(data.control_changes||[]).filter(r=>r.state===stateCode);
  const chambers=(data.chamber_snapshots||[]).filter(r=>r.state===stateCode);
  const label=summary?.leadership?.label||'No retained change record';
  return `<section class="control-summary viz-card"><div class="viz-heading"><h3>Balance of power</h3></div>${controls.length?`<div class="control-list">${controls.map(c=>`<div class="control-row"><span>${e(c.office)}</span><strong><span class="party-pill party-pill--${c.before==='R'?'rep':c.before==='D'?'dem':'other'}">${e(c.before)}</span><span class="control-arrow" aria-hidden="true">→</span><span class="party-pill party-pill--${c.after==='R'?'rep':c.after==='D'?'dem':'other'}">${e(c.after)}</span></strong></div>${c.election_date&&c.election_date<'2026-01-01'?`<p class="viz-note">${e(dateLabel(c.election_date))} · prior-year change</p>`:''}`).join('')}</div>`:''}<p class="viz-note">${e(label)}</p>${renderChambers(chambers,data)}<details class="evidence"><summary>Context &amp; sources <span aria-hidden="true">+</span></summary><div class="evidence-body"><p>${e(state?.control_context||'No leadership-change record retained for this state in the selected inventory.')}</p>${controls.map(c=>`<div class="control-evidence"><strong>${e(c.office)}</strong>${notesHTML(c.note)}${sourcesHTML(c,data)}</div>`).join('')}</div></details></section>`;
}

function candidateRows(choices,total,winner) {
  return choices.map(choice=>{
    const isWinner=choice.winner===true||(typeof winner==='string'&&winner===choice.name);
    const share=Number.isFinite(choice.votes)&&Number.isFinite(total)&&total>0?choice.votes/total*100:null;
    const party=String(choice.party||'');
    const tone=party==='D'||/^Democratic/.test(party)?'dem':party==='R'||/^Republican/.test(party)?'rep':'viz-neutral';
    const info=`${choice.name}: ${num(choice.votes)}${Number.isFinite(choice.votes)?' votes':''}${share===null?'':` · ${pct(share)} of listed selections`}`;
    return `<div class="candidate-row viz-group${isWinner?' candidate-row--winner':''}"><div class="candidate-heading"><div><span class="candidate-name">${e(choice.name)}</span>${party?`<span class="candidate-party">${e(party)}</span>`:''}${isWinner?'<span class="winner-label" title="Reported winner" aria-label="Reported winner">✓</span>':''}</div><div class="candidate-numbers"><strong>${share===null?'—':pct(share)}</strong></div></div>${share!==null?`<button type="button" class="viz-candidate-bar" data-viz-info="${e(info)}" aria-label="${e(info)}" title="${e(info)}"><i style="width:${Math.max(0,Math.min(100,share))}%;--segment:var(--${tone})"></i></button>`:''}${readout(`${num(choice.votes)}${Number.isFinite(choice.votes)?' votes':''}`)}${choice.zero_value_note?`<details class="evidence evidence--small"><summary>Source note</summary><p>${e(choice.zero_value_note)}</p></details>`:''}</div>`;
  }).join('');
}

function renderElection(record,data) {
  const choices=[...(record.choices||[])].sort((a,b)=>(Number.isFinite(b.votes)?b.votes:-1)-(Number.isFinite(a.votes)?a.votes:-1));
  const total=Number.isFinite(record.valid_listed_votes)?record.valid_listed_votes:choices.every(c=>Number.isFinite(c.votes))?choices.reduce((sum,c)=>sum+c.votes,0):null;
  const conflicts=(data.source_conflicts||[]).filter(c=>c.state===record.state&&choices.some(choice=>choice.name===c.candidate));
  return `<article class="record-card election-card" data-record-id="${escapeHTML(record.record_id)}"><div class="card-kicker"><span>${e(record.jurisdiction||record.state)}</span>${tag(resultQualifier(record.status))}</div><div class="record-title-row"><h3>${e(record.office)}</h3>${record.party_transition?tag(record.party_transition,'blue'):''}</div><div class="candidate-list">${candidateRows(choices.slice(0,2),total,record.winner)}</div>${choices.length>2?`<details class="nested-evidence candidate-more"><summary>${choices.length-2} more candidate${choices.length===3?'':'s'}</summary>${candidateRows(choices.slice(2),total,record.winner)}</details>`:''}<p class="viz-note">Shares of listed candidate selections</p>${conflicts.length?`<p class="data-warning">${conflicts.length} source conflict${conflicts.length===1?'':'s'}</p>`:''}<details class="evidence"><summary>Details &amp; sources <span aria-hidden="true">+</span></summary><div class="evidence-body">${factRows([['Election date',dateLabel(record.election_date)],['Recorded status',record.status],['Result snapshot',record.snapshot],['Listed candidate selections',Number.isFinite(total)?num(total):null],['Denominator',record.denominator_note]])}<p class="microcopy">Percentages use the listed candidate selections; multi-seat selections are not unique voters.</p>${notesHTML(record.notes)}${record.nested_writein_breakdown?.length?`<details class="nested-evidence"><summary>Write-in components</summary><p class="microcopy">Already included in the aggregate. Do not add them to the candidate total.</p>${genericDetails(record.nested_writein_breakdown)}</details>`:''}${conflicts.length?`<details class="nested-evidence"><summary>Conflicting tracker snapshots</summary>${conflicts.map(c=>`<div class="conflict-row"><strong>${e(c.candidate)}</strong><p>Selected result: ${pct(c.selected_share)}. Tracker: ${pct(c.tracker_share)} (${e(c.tracker_status)}).</p><p class="microcopy">${e(c.interpretation)}</p></div>`).join('')}</details>`:''}${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p></div></details></article>`;
}

function renderRecall(record,data) {
  const yesNo=Number.isFinite(record.yes)&&Number.isFinite(record.no);
  const choices=record.choices||[];
  const total=Number.isFinite(record.total_valid_votes)?record.total_valid_votes:choices.every(c=>Number.isFinite(c.votes))?choices.reduce((s,c)=>s+c.votes,0):null;
  return `<article class="record-card recall-card" data-record-id="${escapeHTML(record.record_id)}"><div class="card-kicker"><span>${e(record.jurisdiction)}</span>${tag(yesNo?'Recall':'Replacement','amber')}</div><div class="record-title-row"><h3>${e(record.official)}</h3></div>${yesNo?voteBar(record.yes,record.no,'Recall','Retain'):`<div class="candidate-list">${candidateRows(choices,total,null)}</div>`}<details class="evidence"><summary>Details &amp; sources <span aria-hidden="true">+</span></summary><div class="evidence-body"><p>${e(record.issue)}</p>${factRows([['Office',record.office],['Election date',dateLabel(record.election_date)],['Recorded status',record.status],['Ballots cast',Number.isFinite(record.ballots_cast)?num(record.ballots_cast):null],['Registered voters',Number.isFinite(record.registered_voters)?num(record.registered_voters):null],['Reported turnout',Number.isFinite(record.turnout_percent)?pct(record.turnout_percent):null],['Overvotes',Number.isFinite(record.overvotes)?num(record.overvotes):null],['Undervotes',Number.isFinite(record.undervotes)?num(record.undervotes):null]])}${record.replacement?.length?`<details class="nested-evidence"><summary>Replacement result${record.replacement.length===1?'':'s'}</summary>${candidateRows(record.replacement,record.replacement.every(c=>Number.isFinite(c.votes))?record.replacement.reduce((s,c)=>s+c.votes,0):null,null)}</details>`:''}${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p></div></details></article>`;
}

export function renderPolicyCard(record,data,{compact=false}={}) {
  const stage=policyStage(record);
  const caption=/caption/.test(record.verification||'')||record.priority==='caption_verified';
  const votes=record.legislative_votes;
  return `<article class="record-card policy-card${compact?' record-card--compact':''}" data-record-id="${escapeHTML(record.record_id)}" data-policy-stage="${stage.id}" data-search="${escapeHTML(cleanText([record.instrument,record.title,record.summary,record.sponsors,...arr(record.topics)].join(' ')).toLowerCase())}"><div class="record-title-row"><h3>${e(record.instrument||record.title||'Policy record')}</h3>${tag(POLICY_CHART_LABELS[stage.id]||stage.label,stage.tone)}</div>${record.title&&record.title!==record.instrument?`<p class="policy-title">${e(record.title)}</p>`:''}<div class="viz-mini-meta">${record.status_date?`<time>${e(dateLabel(record.status_date))}</time>`:''}${caption?'<span>Caption review</span>':''}</div><details class="evidence"><summary>Details &amp; sources <span aria-hidden="true">+</span></summary><div class="evidence-body"><p class="policy-summary">${e(record.summary)}</p>${factRows([['Session',record.session],['Recorded status',record.status],['Sponsor(s)',record.sponsors],['Recorded action date',record.status_date?dateLabel(record.status_date):null],['Effective date',record.effective_date?dateLabel(record.effective_date):null],['Verification',record.verification],['Topics',arr(record.topics).join(' · ')]])}${caption?'<p class="verification-note">Caption-level review; operative clauses not fully checked.</p>':''}${notesHTML(record.notes)}${votes&&(typeof votes==='string'||votes.length)?`<div class="legislative-votes"><h4>Legislative votes</h4><p class="microcopy">Votes by legislators, separate from public ballot returns.</p>${typeof votes==='string'?`<p>${e(votes)}</p>`:votes.map(v=>`<p><strong>${e(v.chamber||'Chamber')}</strong>${v.date?` · ${e(dateLabel(v.date))}`:''}${Number.isFinite(v.yes)?` · ${num(v.yes)} yes / ${num(v.no)} no`:''}${v.stage?` · ${e(v.stage)}`:''}</p>`).join('')}</div>`:''}${sourcesHTML(record,data)}<p class="record-id">Record ${escapeHTML(record.record_id)}</p></div></details></article>`;
}

function ballotPanel(data,stateCode,period,topic) {
  const all=(data.ballots||[]).filter(r=>r.state===stateCode);
  const records=all.filter(r=>matchesBallot(r,period,topic)).sort((a,b)=>a.election_date.localeCompare(b.election_date)||a.jurisdiction.localeCompare(b.jurisdiction));
  return records.length?`${ballotChart(records)}<p class="viz-note ballot-filter-count" aria-live="polite">${records.length} questions</p><div class="ballot-records">${records.map(r=>renderBallotCard(r,data)).join('')}</div>`:empty('No matching questions',all.length?`${all.length} questions are retained across other periods or topics. Adjust the map filters.`:'No qualifying question was identified in the reviewed sources. This is a coverage statement, not a certified zero.');
}

function electionPanel(data,stateCode,period) {
  const elections=(data.elections||[]).filter(r=>r.state===stateCode&&matchesPeriod(r,period));
  const recalls=(data.recalls||[]).filter(r=>r.state===stateCode&&matchesPeriod(r,period));
  return `${controlBlock(data,stateCode)}<div class="section-heading"><h3>Selected contests</h3><span>${elections.length}</span></div>${elections.length?elections.map(r=>renderElection(r,data)).join(''):empty('No selected result','No candidate contest with a retained vote tally matches this state and period.')}<div class="section-heading section-heading--spaced"><h3>Recalls</h3><span>${recalls.length}</span></div>${recalls.length?recalls.map(r=>renderRecall(r,data)).join(''):empty('No matching recall','No recall or replacement election is retained for this state and selected period.')}<details class="evidence"><summary>Reading these results <span aria-hidden="true">+</span></summary><p>Retained source snapshots for ${e(PERIOD_LABELS[period]||PERIOD_LABELS.nov3)}. Candidate votes do not isolate support for an AI policy. Recall and replacement contests use different vote formats; neither automatically reverses a development approval.</p></details>`;
}

function billPanel(data,stateCode) {
  const policies=(data.policies||[]).filter(r=>r.state===stateCode);
  const order={prefiled:0,pending:1,proposal:2,enacted:3,vetoed:4,failed:5,watchlist:6,other:7};
  const sorted=[...policies].sort((a,b)=>order[policyStage(a).id]-order[policyStage(b).id]||(b.status_date||'').localeCompare(a.status_date||'')||(a.instrument||'').localeCompare(b.instrument||'',undefined,{numeric:true}));
  return policies.length?`${policyChart(policies)}<label class="panel-search"><span class="sr-only">Find a bill or topic</span><input type="search" id="policy-search" placeholder="Search bills…" aria-label="Find a bill or topic" autocomplete="off" data-action="filter-policies"></label><p class="viz-note policy-search-count" aria-live="polite">${policies.length} records</p><div class="policy-records">${sorted.map(r=>renderPolicyCard(r,data)).join('')}</div><div class="policy-empty-filter" hidden>${empty('No matching bills','Try another stage or search term.')}</div><details class="evidence"><summary>Coverage <span aria-hidden="true">+</span></summary><p>Includes selected proposals, laws and executive actions across recorded sessions. The ballot-date filter does not change this inventory.</p></details>`:empty('No selected policy record','No policy record is retained for this state in the selected inventory. This does not establish an absence of relevant legislation.');
}

function overviewPanel(data,stateCode,period,topic) {
  const state=(data.states||[]).find(s=>s.state===stateCode);
  const ballots=(data.ballots||[]).filter(r=>r.state===stateCode&&matchesBallot(r,period,topic));
  const policies=(data.policies||[]).filter(r=>r.state===stateCode);
  const elections=(data.elections||[]).filter(r=>r.state===stateCode&&matchesPeriod(r,period));
  const recalls=(data.recalls||[]).filter(r=>r.state===stateCode&&matchesPeriod(r,period));
  return `<div class="viz-stats"><button type="button" data-panel-tab="ballots"><strong>${ballots.length}</strong><span>Ballots</span></button><button type="button" data-panel-tab="elections"><strong>${elections.length+recalls.length}</strong><span>Contests / recalls</span></button><button type="button" data-panel-tab="bills"><strong>${policies.length}</strong><span>Policy records</span></button></div>${ballots.length?ballotChart(ballots,{overview:true}):empty('No matching questions',state?.coverage_statement||'No question identified in the reviewed inventory; this is not a certified zero.')}${controlBlock(data,stateCode)}${policies.length?policyChart(policies,{overview:true}):empty('No selected policy record','No policy record is retained for this state.')}<details class="evidence"><summary>Coverage <span aria-hidden="true">+</span></summary><p>Research snapshot: November 13, 2026. Selected candidate contests and recalls are separate record types; these counts are not an inventory of every election. ${e(state?.coverage_statement||'')}</p></details>`;
}

/** Render the detail-panel body. The caller owns the state heading, tabs and events. */
export function renderStatePanel({data,stateCode,tab='overview',period='nov3',topic='all'}) {
  if(!data || !(data.states||[]).some(s=>s.state===stateCode))return empty('Select a state','Choose a state on the map or use the state selector.');
  const content=tab==='ballots'?ballotPanel(data,stateCode,period,topic):tab==='elections'?electionPanel(data,stateCode,period):tab==='bills'?billPanel(data,stateCode):overviewPanel(data,stateCode,period,topic);
  return `<div class="state-panel-body" data-state="${escapeHTML(stateCode)}" data-panel-view="${escapeHTML(tab)}">${content}</div>`;
}

/** Attach chart and filtering behavior only to this newly rendered panel body. */
export function wirePanelInteractions(container) {
  const root=container.querySelector('.state-panel-body');
  if(!root||root.dataset.chartsWired==='true')return;
  root.dataset.chartsWired='true';
  let ballotFilter='all',policyFilter='all';
  const readoutFor=target=>target.closest('.viz-group,.viz-card')?.querySelector('.viz-readout');
  const showInfo=target=>{const trigger=target.closest('[data-viz-info]');if(trigger){const output=readoutFor(trigger);if(output)output.textContent=trigger.dataset.vizInfo;}};
  const resetInfo=target=>{const output=readoutFor(target);if(output)output.textContent=output.dataset.default||'';};
  function filterPolicies() {
    const needle=(root.querySelector('#policy-search')?.value||'').trim().toLowerCase();
    const cards=[...root.querySelectorAll('.policy-records .policy-card')];let visible=0;
    for(const card of cards){const show=(policyFilter==='all'||card.dataset.policyStage===policyFilter)&&(!needle||card.dataset.search.includes(needle));card.hidden=!show;if(show)visible++;}
    const count=root.querySelector('.policy-search-count');if(count)count.textContent=`${visible} of ${cards.length} records`;
    const emptyState=root.querySelector('.policy-empty-filter');if(emptyState)emptyState.hidden=visible>0;
    for(const btn of root.querySelectorAll('[data-policy-filter]'))btn.setAttribute('aria-pressed',String(btn.dataset.policyFilter===policyFilter));
  }
  root.addEventListener('click',ev=>{
    showInfo(ev.target);
    const ballot=ev.target.closest('[data-ballot-filter]');
    if(ballot){ballotFilter=ballot.dataset.ballotFilter;let count=0;const cards=[...root.querySelectorAll('.ballot-records .ballot-card')];for(const card of cards){const show=ballotFilter==='all'||card.dataset.outcome===ballotFilter;card.hidden=!show;if(show)count++;}for(const btn of root.querySelectorAll('[data-ballot-filter]'))btn.setAttribute('aria-pressed',String(btn.dataset.ballotFilter===ballotFilter));const out=root.querySelector('.ballot-filter-count');if(out)out.textContent=`${count} of ${cards.length} questions`;}
    const policy=ev.target.closest('[data-policy-filter]');if(policy){policyFilter=policy.dataset.policyFilter;filterPolicies();}
  });
  root.addEventListener('input',ev=>{if(ev.target.matches('[data-action="filter-policies"]'))filterPolicies();});
  root.addEventListener('pointerover',ev=>showInfo(ev.target));
  root.addEventListener('focusin',ev=>showInfo(ev.target));
  root.addEventListener('pointerout',ev=>{const chart=ev.target.closest('.viz-group,.viz-card');if(chart&&!chart.contains(ev.relatedTarget))resetInfo(ev.target);});
  root.addEventListener('focusout',ev=>{const chart=ev.target.closest('.viz-group,.viz-card');if(chart&&!chart.contains(ev.relatedTarget))resetInfo(ev.target);});
  if(root.querySelector('#policy-search'))filterPolicies();
}
