import {renderStatePanel, wirePanelInteractions, matchesBallot, matchesPeriod, policyStage, escapeHTML, cleanText} from './panels.js?v=3';

const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const esc=escapeHTML;
const number=new Intl.NumberFormat('en-US');
const fmt=n=>Number.isFinite(n)?number.format(n):'Not reported';
const NS='http://www.w3.org/2000/svg';
const PERIODS={nov3:'November 3',earlier:'Earlier in 2026',upcoming:'Scheduled after cutoff',all:'All recorded dates'};
const LEADERSHIP={
  new_democratic_trifecta:{token:'leader-trifecta',label:'New Democratic trifecta',short:'New D trifecta'},
  democratic_gain_divided:{token:'leader-divided',label:'Democratic gain; divided',short:'D gain · divided'},
  democratic_house_gain_senate_unresolved:{token:'leader-unresolved',label:'House gain; Senate unresolved',short:'Senate unresolved'},
  democratic_hold:{token:'leader-hold',label:'Democratic governor hold',short:'D governor hold'},
  prior_year_change:{token:'leader-prior',label:'Prior-year context',short:'Prior-year shift'},
  no_retained_control_record:{token:'map-none',label:'No retained change record',short:'No record'}
};
const DECKS={
  TX:'Democratic governor and House; Republican Senate. Divided government.',
  OH:'21 local development questions. A Democratic governor elected alongside a Republican legislature.',
  PA:'The Senate shifts to Democrats, creating a new Democratic trifecta.',
  AZ:'Both legislative chambers shift to Democrats, creating a new Democratic trifecta.',
  WI:'Both legislative chambers shift to Democrats; the governorship stays Democratic.',
  GA:'A Democratic governor and House; a Republican Senate. Utility regulation is also in focus.',
  MI:'A Democratic House restores the party’s trifecta. Earlier zoning and recall votes add local context.',
  MN:'A tied House moves to a Democratic majority, restoring a Democratic trifecta.',
  IA:'A Democratic governor elected alongside a Republican legislature.',
  NV:'The governorship shifts to Democrats, creating a new Democratic trifecta.',
  NH:'Both chambers turn Democratic; the Republican governor is re-elected.',
  NC:'A Democratic House gain; Senate control remains unresolved in the retained evidence.',
  KS:'Four November development questions. The governor result is a Democratic hold.',
  VA:'The 2025 gubernatorial shift provides context for the 2026 policy agenda.',
  CA:'Local bans, a broader tax proposal and a technology-procurement vote.',
  ME:'Eight November development questions, plus York’s surveillance vote.',
  IL:'Seven data-centre advisory questions and Chicago’s gunshot-technology question.',
  HI:'Honolulu voters approved an Office of Data and Innovation.',
  MO:'A general-zoning question and an earlier data-centre-related recall.',
  NJ:'Two advisory votes give direction on data-centre development.',
  ND:'Harwood’s review requirements and a later scheduled Mandan vote.',
  AR:'Two future Clarksville bond questions; no result at the evidence cutoff.',
  WV:'A broader school-finance vote with potential data-centre tax revenue.',
  FL:'Edgewater’s binding charter vote on new data centres.'
};

let data, geometry, tracker=null, trackerPromise=null;
let state={code:'TX',layer:'ballots',tab:'overview',period:'nov3',topic:'all'};
let summaries=new Map(), statesByCode=new Map(), geometryByCode=new Map(), toastTimer;
let mapPalette, hoveredCode=null, tooltipKey='', tooltipFrame=null, tooltipPosition=null, hoverAnimation=null;
const mapNodes=new Map();

function setTheme(theme,{persist=true}={}){
  const light=theme==='light';
  document.documentElement.dataset.theme=light?'light':'dark';
  const toggle=$('#theme-toggle');
  if(toggle){
    toggle.setAttribute('aria-pressed',String(light));
    toggle.setAttribute('aria-label',`Switch to ${light?'dark':'light'} mode`);
    toggle.title=`Switch to ${light?'dark':'light'} mode`;
  }
  if($('#theme-label'))$('#theme-label').textContent=light?'Dark mode':'Light mode';
  if($('#theme-icon'))$('#theme-icon').innerHTML=light?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16.8 12.3A7.1 7.1 0 0 1 7.7 3.2 7.1 7.1 0 1 0 16.8 12.3Z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="3.5"/><path d="M10 1.5v2m0 13v2M1.5 10h2m13 0h2M4 4l1.4 1.4m9.2 9.2L16 16M4 16l1.4-1.4m9.2-9.2L16 4"/></svg>';
  $('meta[name="theme-color"]')?.setAttribute('content',light?'#f3f8fc':'#0b1726');
  if(persist){try{localStorage.setItem('ai-atlas-theme',light?'light':'dark');}catch{}}
  if(data&&geometry)updateMap();
}
function wireTheme(){
  setTheme(document.documentElement.dataset.theme==='light'?'light':'dark',{persist:false});
  $('#theme-toggle')?.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));
}

function readURL(){
  const p=new URLSearchParams(location.search);
  const code=(p.get('state')||'TX').toUpperCase();
  state.code=statesByCode.has(code)?code:'TX';
  for(const [key,values] of Object.entries({layer:['ballots','leadership','policies'],tab:['overview','ballots','elections','bills'],period:['nov3','earlier','upcoming','all'],topic:['all','development','governance','surveillance','adjacent']})){
    const value=p.get(key); if(values.includes(value))state[key]=value;
  }
}
function writeURL(){const u=new URL(location.href);for(const [key,value] of Object.entries({state:state.code,layer:state.layer,tab:state.tab,period:state.period,topic:state.topic}))u.searchParams.set(key,value);history.replaceState(null,'',u);}
function getBallots(code){return data.ballots.filter(b=>(!code||b.state===code)&&matchesBallot(b,state.period,state.topic));}
function policyCount(code){return summaries.get(code)?.policy_record_ids.length||0;}
function currentNumber(code){return state.layer==='policies'?policyCount(code):getBallots(code).length;}
function paletteColour(token){
  return {color:mapPalette.getPropertyValue(`--${token}`).trim()||'#454853',labelColor:mapPalette.getPropertyValue(`--${token}-label`).trim()||'#ffffff'};
}
function mapColour(code){
  if(state.layer==='leadership')return paletteColour((LEADERSHIP[summaries.get(code)?.leadership.key]||LEADERSHIP.no_retained_control_record).token);
  const n=currentNumber(code);
  if(!n)return paletteColour('map-none');
  if(state.layer==='policies')return paletteColour(`policy-${n<5?1:n<10?2:n<20?3:4}`);
  return paletteColour(`ballot-${n===1?1:n<5?2:n<10?3:4}`);
}
function makeSVG(){
  const svg=$('#us-map');svg.setAttribute('viewBox',geometry.viewBox);
  svg.innerHTML='<g class="state-paths"></g><g class="state-labels"></g><g class="map-hover-preview" visibility="hidden" aria-hidden="true"><path class="map-hover-shape" fill-rule="evenodd"/><text class="state-label map-hover-label"/></g><g class="map-callouts"></g>';
  geometryByCode=new Map(geometry.states.map(s=>[s.abbr,s]));
  mapNodes.clear();
  const paths=svg.querySelector('.state-paths'),callouts=svg.querySelector('.map-callouts'),labels=svg.querySelector('.state-labels');
  for(const s of geometry.states){
    const [labelX,labelY]=s.label;
    const path=document.createElementNS(NS,'path');path.setAttribute('d',s.path);path.setAttribute('fill-rule','evenodd');path.dataset.state=s.abbr;path.setAttribute('class','state-shape');
    if(s.callout){path.setAttribute('aria-hidden','true');}else{path.setAttribute('role','button');path.setAttribute('tabindex','0');path.setAttribute('aria-label',s.name);}paths.append(path);
    if(s.callout){
      const line=document.createElementNS(NS,'path');line.setAttribute('class','callout-line');line.setAttribute('d',`M${s.centroid[0]},${s.centroid[1]}L${labelX-29},${labelY}`);callouts.append(line);
      const group=document.createElementNS(NS,'g');group.setAttribute('class','callout-label');group.dataset.state=s.abbr;group.setAttribute('role','button');group.setAttribute('tabindex','0');group.setAttribute('aria-label',s.name);
      const rect=document.createElementNS(NS,'rect');rect.setAttribute('x',labelX-26);rect.setAttribute('y',labelY-12);rect.setAttribute('width','52');rect.setAttribute('height','24');rect.setAttribute('rx','4');group.append(rect);
      const text=document.createElementNS(NS,'text');text.setAttribute('x',labelX);text.setAttribute('y',labelY+.2);text.setAttribute('class','state-label');text.textContent=s.abbr;group.append(text);callouts.append(group);
    }else{
      const text=document.createElementNS(NS,'text');text.setAttribute('x',labelX);text.setAttribute('y',labelY);text.setAttribute('class','state-label');text.dataset.state=s.abbr;text.setAttribute('aria-hidden','true');text.textContent=s.abbr;labels.append(text);
    }
  }
  for(const node of svg.querySelectorAll('[data-state]')){
    const nodes=mapNodes.get(node.dataset.state)||[];nodes.push(node);mapNodes.set(node.dataset.state,nodes);
  }
  svg.addEventListener('click',ev=>{const target=ev.target.closest('[data-state]');if(target)selectState(target.dataset.state,true);});
  svg.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'){ev.preventDefault();hideTooltip();return;}
    if(ev.key==='Enter'||ev.key===' '){const target=ev.target.closest('[data-state]');if(target){ev.preventDefault();selectState(target.dataset.state,true);}}
  });
  svg.addEventListener('pointermove',ev=>{
    const target=ev.target.closest('[data-state]');
    if(!target||ev.pointerType==='touch'){hideTooltip();return;}
    tooltipPosition={code:target.dataset.state,x:ev.clientX,y:ev.clientY};
    if(tooltipFrame===null)tooltipFrame=requestAnimationFrame(()=>{
      tooltipFrame=null;const position=tooltipPosition;if(position)showTooltip(position.code,position.x,position.y);
    });
  });
  svg.addEventListener('pointerleave',hideTooltip);
  svg.addEventListener('focusin',ev=>{const target=ev.target.closest('[data-state]');if(target){const rect=target.getBoundingClientRect();showTooltip(target.dataset.state,rect.x+rect.width/2,rect.y+rect.height/2);}});
  svg.addEventListener('focusout',hideTooltip);
}
function mapDescription(){
  if(state.layer==='leadership')return 'State elections';
  if(state.layer==='policies')return 'State legislation';
  return 'AI ballot activity';
}
function updateMap(){
  hideTooltip();
  mapPalette=getComputedStyle(document.documentElement);
  $('#state-select').value=state.code;
  for(const el of $$('#us-map [data-state]')){
    const code=el.dataset.state,c=mapColour(code),selected=code===state.code;
    el.classList.toggle('selected',selected);
    if(el.classList.contains('state-shape'))el.setAttribute('fill',c.color);
    if(el.classList.contains('callout-label')){el.querySelector('rect').setAttribute('fill',c.color);el.querySelector('text').style.fill=c.labelColor;}
    if(el.classList.contains('state-label'))el.style.fill=c.labelColor;
    if(el.getAttribute('role')==='button'){
      el.setAttribute('aria-pressed',String(selected));
      const note=state.layer==='leadership'?(summaries.get(code)?.leadership.label||'No retained change record'):`${currentNumber(code)} ${state.layer==='policies'?'selected policy records':'matching ballot questions'}`;
      el.setAttribute('aria-label',`${statesByCode.get(code)?.state_name||code}: ${note}. Select for details.`);
    }
  }
  $('#map-title').textContent=mapDescription();
  let activeStates=0;
  if(state.layer==='leadership')activeStates=data.state_summaries.filter(s=>s.leadership.key!=='no_retained_control_record').length;
  else activeStates=data.states.filter(s=>currentNumber(s.state)>0).length;
  $('#map-state-count').textContent=`${activeStates} states`;
  $('#filter-result').textContent=state.layer==='leadership'?'':`${getBallots().length} questions`;
  $('#period-filter').value=state.period;$('#topic-filter').value=state.topic;
  $('#map-filters').hidden=state.layer==='policies';$('#topic-filter').closest('label').hidden=state.layer==='leadership';
  for(const btn of $$('[data-layer]')){btn.classList.toggle('active',btn.dataset.layer===state.layer);btn.setAttribute('aria-pressed',String(btn.dataset.layer===state.layer));}
  const legend=$('#map-legend');
  const items=state.layer==='leadership'?Object.values(LEADERSHIP):state.layer==='policies'?[{token:'map-none',label:'No record'},{token:'policy-1',label:'1–4'},{token:'policy-2',label:'5–9'},{token:'policy-3',label:'10–19'},{token:'policy-4',label:'20+'}]:[{token:'map-none',label:'None identified'},{token:'ballot-1',label:'1'},{token:'ballot-2',label:'2–4'},{token:'ballot-3',label:'5–9'},{token:'ballot-4',label:'10+'}];
  legend.innerHTML=(state.layer==='leadership'?'':`<strong>${state.layer==='policies'?'Policy records':'Questions'}</strong>`)+items.map(i=>`<span class="legend-item" title="${esc(i.label)}"><i class="legend-swatch" style="background:${paletteColour(i.token).color}"></i>${esc(i.short||i.label)}</span>`).join('');
}
function highlightState(code){
  if(hoveredCode===code)return;
  for(const el of mapNodes.get(hoveredCode)||[]){el.classList.remove('is-hovered');el.removeAttribute('aria-describedby');}
  hoveredCode=code;
  for(const el of mapNodes.get(code)||[]){el.classList.add('is-hovered');if(el.getAttribute('role')==='button')el.setAttribute('aria-describedby','map-tooltip');}
  const preview=$('.map-hover-preview'),shape=geometryByCode.get(code);
  if(!preview)return;
  if(hoverAnimation){hoverAnimation.cancel();hoverAnimation=null;}
  preview.classList.remove('is-visible');
  if(!shape){preview.setAttribute('visibility','hidden');return;}
  const path=preview.querySelector('.map-hover-shape'),label=preview.querySelector('.map-hover-label'),colour=mapColour(code);
  path.setAttribute('d',shape.path);path.setAttribute('fill',colour.color);
  label.textContent=shape.callout?'':code;
  label.setAttribute('x',shape.label[0]);label.setAttribute('y',shape.label[1]);label.style.fill=colour.labelColor;
  preview.style.transformOrigin=`${shape.centroid[0]}px ${shape.centroid[1]}px`;
  preview.setAttribute('visibility','visible');
  // The overlay is decorative: underlying hit targets never move as a state lifts.
  preview.classList.add('is-visible');
  if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    hoverAnimation=preview.animate([{transform:'scale(1)'},{transform:'scale(1.025)'}],{duration:180,easing:'cubic-bezier(.2,.7,.3,1)'});
  }
}
function tooltipMarkup(code){
  const s=statesByCode.get(code),summary=summaries.get(code);
  let metrics=[],detail='';
  if(state.layer==='leadership'){
    const contests=data.elections.filter(e=>e.state===code&&matchesPeriod(e,state.period)).length;
    const recalls=data.recalls.filter(r=>r.state===code&&matchesPeriod(r,state.period)).length;
    metrics=[{value:contests,label:'Contests'},{value:recalls,label:'Recalls'}];
    detail=summary?.leadership.label||'No retained control-change record';
  }else if(state.layer==='policies'){
    const policies=data.policies.filter(p=>p.state===code);
    const prefiled=policies.filter(p=>policyStage(p).id==='prefiled').length;
    const enacted=policies.filter(p=>policyStage(p).id==='enacted').length;
    metrics=[{value:policies.length,label:'Records'},{value:prefiled,label:'Prefiled'},{value:enacted,label:'Law / order'}];
    detail=policies.length?'Selected policy inventory':'No selected policy record';
  }else{
    const rows=getBallots(code),binding=rows.filter(b=>['binding','town_meeting_binding'].includes(b.legal_type)).length,advisory=rows.filter(b=>b.legal_type==='advisory').length;
    metrics=[{value:rows.length,label:'Questions'},{value:binding,label:'Binding'},{value:advisory,label:'Advisory'}];
    detail=rows.length?PERIODS[state.period]:'No matching question identified';
  }
  return `<div class="tooltip-head"><span class="tooltip-code">${esc(code)}</span><strong>${esc(s.state_name)}</strong><span class="tooltip-arrow" aria-hidden="true">↗</span></div><div class="tooltip-metrics">${metrics.map(m=>`<div><strong>${fmt(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div><p class="tooltip-detail">${esc(cleanText(detail))}</p>`;
}
function showTooltip(code,clientX,clientY){
  const tip=$('#map-tooltip');if(!statesByCode.has(code))return;
  highlightState(code);
  const key=[code,state.layer,state.period,state.topic].join('|');
  if(tooltipKey!==key){tip.innerHTML=tooltipMarkup(code);tooltipKey=key;}
  tip.hidden=false;
  const stage=$('#map-stage').getBoundingClientRect(),tipWidth=tip.offsetWidth,tipHeight=tip.offsetHeight;
  let left=clientX-stage.left+18,top=clientY-stage.top+18;
  if(left+tipWidth>stage.width-8)left=clientX-stage.left-tipWidth-18;
  if(top+tipHeight>stage.height-8)top=clientY-stage.top-tipHeight-18;
  tip.style.left=Math.max(8,Math.min(left,stage.width-tipWidth-8))+'px';
  tip.style.top=Math.max(8,Math.min(top,stage.height-tipHeight-8))+'px';
}
function hideTooltip(){
  if(tooltipFrame!==null){cancelAnimationFrame(tooltipFrame);tooltipFrame=null;}
  tooltipPosition=null;highlightState(null);
  const tip=$('#map-tooltip');if(tip)tip.hidden=true;
}
function sourcesFor(record){
  const all=[];for(const id of record.source_ids||[]){const s=data.sources.find(x=>x.source_id===id);if(s)all.push(s);}
  for(const url of record.sources||[]){if(!all.some(x=>x.url===url))all.push({url,title:new URL(url).hostname});}
  return all.filter(s=>/^https?:\/\//.test(s.url));
}
function sourceHTML(record){return `<ul class="source-list">${sourcesFor(record).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(cleanText(s.title||s.url))}</a></li>`).join('')}</ul>`;}
function pollingContext(code=state.code){
  const rows=data.polls.filter(p=>p.state===code);if(!rows.length)return '';
  const groups=new Map();for(const r of rows){const key=[r.survey,r.question,r.condition||''].join('|');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(r);}
  return `<section class="poll-block"><details class="evidence"><summary>${code==='US'?'National opinion':'Public opinion'} <span>${rows.length} observations</span></summary><div class="evidence-body"><p class="microcopy">Survey estimates are separate from election returns. Different questions and field periods should not be treated as a trend.</p>${[...groups.values()].map(g=>{const p=g[0];return `<div class="poll-group"><h4>${esc(p.survey)}</h4><p class="microcopy">${esc(cleanText(p.question))}${p.condition?` · ${esc(p.condition)}`:''}</p><div class="poll-grid">${g.map(r=>`<div class="poll-chip"><strong>${Number.isFinite(r.percent)?esc(r.percent)+'%':'—'}</strong>${esc(r.response)}</div>`).join('')}</div><p class="microcopy">Field period: ${esc(p.survey_date||p.field_dates||'See source')}. Overall ${code==='US'?'national':'state'} sample: ${fmt(p.overall_survey_sample_n)}. Question-specific base: ${fmt(p.question_sample_n)}.</p>${sourceHTML(p)}</div>`;}).join('')}</div></details></section>`;
}
function trackerPlaceholder(){
  const s=statesByCode.get(state.code);const count=s.tracker_result_rows||0,pos=s.tracker_nov3_position_rows||0;
  if(!count&&!pos)return '';
  return `<section class="tracker-section" id="tracker-section"><details class="evidence"><summary>Candidate tracker <span aria-hidden="true">+</span></summary><div class="evidence-body"><p class="microcopy">External discovery records; stances and results are not independently verified. Raw vote totals are unavailable and aliases may overlap.</p><button class="tracker-toggle" id="load-tracker" type="button">Explore ${esc(s.state_name)} <span aria-hidden="true">→</span></button><div id="tracker-content"></div></div></details></section>`;
}
function renderPanel({keepScroll=false}={}){
  const panel=$('#panel-content'),old=panel.scrollTop,s=statesByCode.get(state.code);
  $('#state-code').textContent=state.code;$('#state-title').textContent=s.state_name;
  $('#state-deck').textContent=DECKS[state.code]||`Explore the retained ballot, election and policy records for ${s.state_name}.`;
  const counts={ballots:getBallots(state.code).length,elections:data.elections.filter(e=>e.state===state.code&&matchesPeriod(e,state.period)).length+data.recalls.filter(r=>r.state===state.code&&matchesPeriod(r,state.period)).length,bills:policyCount(state.code)};
  $('#tab-ballot-count').textContent=counts.ballots;$('#tab-election-count').textContent=counts.elections;$('#tab-policy-count').textContent=counts.bills;
  for(const btn of $$('[data-tab]')){btn.classList.toggle('active',btn.dataset.tab===state.tab);if(btn.dataset.tab===state.tab)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current');}
  panel.innerHTML=renderStatePanel({data,stateCode:state.code,tab:state.tab,period:state.period,topic:state.topic})+(state.tab==='overview'?pollingContext():'')+(state.tab==='elections'?trackerPlaceholder():'');
  wirePanelInteractions(panel);
  panel.scrollTop=keepScroll?old:0;
  $('#selection-announcement').textContent=`${s.state_name} selected. ${counts.ballots} matching questions, ${counts.bills} selected policy records.`;
}
function selectState(code,fromMap=false){
  if(!statesByCode.has(code))return;state.code=code;updateMap();renderPanel();writeURL();hideTooltip();
  if(fromMap&&window.matchMedia('(max-width:860px)').matches)$('#state-panel').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
}
function changeTab(tab){
  if(!['overview','ballots','elections','bills'].includes(tab))return;state.tab=tab;
  if(tab==='ballots')state.layer='ballots';if(tab==='elections')state.layer='leadership';if(tab==='bills')state.layer='policies';
  updateMap();renderPanel();writeURL();
}
function showToast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3500);}
function buildMethodology(){
  const gaps=data.gaps||[];
  $('#method-content').innerHTML=`<p class="method-highlight">A dated research inventory, not a live election feed. Evidence cutoff: <strong>13 November 2026</strong>. Results and legislation retain their individual source dates and qualifications.</p><h3>What is included</h3><table><thead><tr><th>Record family</th><th>Count</th></tr></thead><tbody><tr><td>November 3 questions, all included topics</td><td>56</td></tr><tr><td>Development questions / more restrictive outcomes</td><td>48 / 46</td></tr><tr><td>Earlier questions / scheduled questions</td><td>7 / 4</td></tr><tr><td>Selected policy records</td><td>138</td></tr><tr><td>Selected candidate contests / candidate choices</td><td>21 / 90</td></tr><tr><td>Recall officials / polling observations</td><td>10 / 89</td></tr><tr><td>Core source registry entries</td><td>316</td></tr></tbody></table><h3>Reading the three map layers</h3><ul><li><strong>AI Ballot:</strong> the cyan-blue scale shows the number of identified questions. It does not indicate support for AI or a political party. Use the topic filter to separate development, governance, surveillance and broader context.</li><li><strong>Elections:</strong> colours show documented leadership changes and holds in the selected research. Gray means no retained control-change record, not a Republican hold or verified absence of change. Prior-year Virginia context is labelled separately.</li><li><strong>Bills:</strong> the violet scale shows the number of selected policy records. Proposals, laws and executive actions are different record types.</li></ul><h3>Counting and evidence rules</h3><ol>${data.metadata.counting_rules.map(t=>`<li>${esc(cleanText(t))}</li>`).join('')}</ol><p>Twenty-five ballot records have vote counts read in primary sources. A primary return can still be unofficial. Remaining records use cited secondary returns or have no available result. “No question identified” is a coverage statement rather than a certified zero.</p><h3>Candidate tracker limitations</h3><p>The optional discovery layer preserves all 1,064 result rows and 892 November position rows. It includes 75 position-only records, aliases, missing vote totals, and “leading” results. Its “370 winners” shorthand combines won and leading rows; it must not be displayed as 370 verified unique winners. Nine conflicts with selected election snapshots remain flagged.</p>${pollingContext('US')}<h3>Evidence gaps and refresh priorities</h3>${gaps.map(g=>`<details class="evidence"><summary>${esc(cleanText(g.issue||'Evidence gap'))}</summary><p>${esc(cleanText(g.impact||''))}</p><p><strong>Next refresh:</strong> ${esc(cleanText(g.next_step||''))}</p></details>`).join('')}<h3>Research files and map source</h3><p>The original research package uses the 13 November 2026 evidence cutoff.</p><ul class="source-list"><li><a href="downloads/ai_midterms_2026_dossier.docx" download>State-by-state dossier · DOCX</a></li><li><a href="downloads/ai_midterms_2026_workbook.xlsx" download>Research workbook · XLSX</a></li><li><a href="downloads/ai_midterms_2026_data.json" download>Full dataset · JSON</a></li><li><a href="downloads/ai_midterms_2026_dashboard_data.zip" download>Data export package · ZIP</a></li></ul><p>Map boundaries: <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener noreferrer">U.S. Census Bureau (2017), via us-atlas 3.0.1</a>. Alaska and Hawaii are repositioned insets. State borders are geographic outlines; they are not electoral-district boundaries. <a href="assets/us-atlas-LICENSE.txt" target="_blank" rel="noopener">Map redistribution licence</a>.</p>`;
}
async function loadTracker(){
  const button=$('#load-tracker');if(button){button.disabled=true;button.textContent='Loading the candidate tracker…';}
  const requested=state.code;
  try{
    if(!trackerPromise)trackerPromise=fetch('assets/tracker-data.json').then(r=>{if(!r.ok)throw new Error('Could not load tracker');return r.json();});
    tracker=await trackerPromise;
    if(state.code!==requested||state.tab!=='elections')return;
    const target=$('#tracker-content');target.innerHTML='<div class="tracker-controls"><input type="search" id="tracker-search" placeholder="Candidate, office or party…" aria-label="Filter external candidate tracker"></div><p class="tracker-count" id="tracker-count"></p><div id="tracker-rows"></div>';
    $('#load-tracker').hidden=true;renderTrackerRows('');
  }catch{trackerPromise=null;if(button){button.disabled=false;button.textContent='Retry loading tracker';}showToast('The candidate tracker could not load. Select Retry loading tracker to try again.');}
}
function safeLink(url,label){try{const u=new URL(url);return /^https?:$/.test(u.protocol)?`<a href="${esc(u.href)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';}catch{return '';}}
function renderTrackerRows(filter){
  if(!tracker||!$('#tracker-rows'))return;
  const originals=tracker.tracker_results||[],positions=tracker.tracker_candidates_on_record||[];
  const union=new Map(originals.map(r=>[r.record_id,r]));for(const r of positions)if(!union.has(r.record_id))union.set(r.record_id,{...r,position_only:true});
  const all=[...union.values()].filter(r=>r.state===state.code&&matchesPeriod(r,state.period));
  const needle=filter.toLowerCase().trim();const rows=all.filter(r=>!needle||[r.candidate_name,r.office,r.party,r.jurisdiction,r.result_status,r.stance_category_tracker].join(' ').toLowerCase().includes(needle)).sort((a,b)=>(a.office||'').localeCompare(b.office||'')||(a.candidate_name||'').localeCompare(b.candidate_name||''));
  $('#tracker-count').textContent=`${rows.length} of ${all.length} matching tracker records · raw rows may include aliases`;
  $('#tracker-rows').innerHTML=rows.length?rows.map(r=>{
    const status=r.result_status||'No result recorded';const sources=[safeLink(r.result_source_url,'Result source'),...(r.stance_source_urls||[]).map((u,i)=>safeLink(u,`Position source ${i+1}`))].filter(Boolean);
    const conflict=data.source_conflicts.find(c=>c.tracker_record_id===r.record_id);
    return `<article class="tracker-card"><header><strong>${esc(r.candidate_name||'Candidate not named')}</strong><span class="tag tag--${status==='won'?'blue':status==='leading'?'amber':'gray'}">Tracker: ${esc(status)}</span></header><p class="tracker-sub">${esc(r.office||'Office not recorded')}${r.district?` · District ${esc(r.district)}`:''} · ${esc(r.party||'Party not recorded')}</p><p class="tracker-sub">${esc(r.jurisdiction||r.state)} · ${esc(r.election_date||'Date not recorded')}</p><p class="tracker-stance">Tracker-coded stance: <strong>${esc(cleanText(r.stance_category_tracker||'Unclear / not recorded'))}</strong>${Number.isFinite(r.vote_share_pct)?` · Reported share ${r.vote_share_pct}%`:''}</p>${r.position_only?'<p class="microcopy">Position-only record; no matching result row.</p>':''}${conflict?`<p class="conflict-note">Conflicts with the selected result snapshot: ${esc(conflict.selected_share)}% versus tracker ${esc(conflict.tracker_share)}%. These records remain separate.</p>`:''}<details class="evidence"><summary>Tracker evidence &amp; limitations</summary><p class="microcopy">${esc(r.verification||'Tracker-coded; not independently verified')}. Snapshot ${esc(r.tracker_snapshot_date||'not reported')}. Raw vote counts are not supplied.</p><ul class="source-list">${sources.map(s=>`<li>${s}</li>`).join('')}</ul><p class="record-id">${esc(r.record_id)}</p></details></article>`;
  }).join(''):'<div class="empty-state"><h3>No matching tracker records</h3><p>Change the search or election-period filter.</p></div>';
}
function wireEvents(){
  for(const btn of $$('[data-layer]'))btn.addEventListener('click',()=>{state.layer=btn.dataset.layer;state.tab=state.layer==='leadership'?'elections':state.layer==='policies'?'bills':state.tab==='overview'?'overview':'ballots';updateMap();renderPanel();writeURL();hideTooltip();});
  for(const btn of $$('[data-tab]'))btn.addEventListener('click',()=>changeTab(btn.dataset.tab));
  $('#period-filter').addEventListener('change',ev=>{state.period=ev.target.value;updateMap();renderPanel();writeURL();});
  $('#topic-filter').addEventListener('change',ev=>{state.topic=ev.target.value;updateMap();renderPanel();writeURL();});
  $('#reset-button').addEventListener('click',()=>{state={code:'TX',layer:'ballots',tab:'overview',period:'nov3',topic:'all'};updateMap();renderPanel();writeURL();});
  $('#state-select').addEventListener('change',ev=>selectState(ev.target.value,true));
  $('#panel-content').addEventListener('click',ev=>{const tab=ev.target.closest('[data-panel-tab]');if(tab)changeTab(tab.dataset.panelTab);if(ev.target.closest('#load-tracker'))loadTracker();});
  $('#panel-content').addEventListener('input',ev=>{if(ev.target.matches('#tracker-search'))renderTrackerRows(ev.target.value);});
  const openMethod=()=>{hideTooltip();$('#method-dialog').showModal();};$('#methodology-button').addEventListener('click',openMethod);$('#close-method').addEventListener('click',()=>$('#method-dialog').close());
  $('#method-dialog').addEventListener('click',ev=>{if(ev.target===$('#method-dialog')){const r=ev.target.getBoundingClientRect();if(ev.clientX<r.left||ev.clientX>r.right||ev.clientY<r.top||ev.clientY>r.bottom)ev.target.close();}});
  $('#copy-link').addEventListener('click',async()=>{writeURL();try{await navigator.clipboard.writeText(location.href);showToast(`Link to ${statesByCode.get(state.code).state_name} copied.`);}catch{showToast('Copy the current address from your browser to share this state view.');}});
  window.addEventListener('popstate',()=>{readURL();updateMap();renderPanel();});
}
async function init(){
  try{
    [data,geometry]=await Promise.all(['assets/dashboard-data.json','assets/us-states-paths.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw new Error(`Could not load ${url}`);return r.json();})));
    summaries=new Map(data.state_summaries.map(s=>[s.state,s]));statesByCode=new Map(data.states.map(s=>[s.state,s]));
    readURL();$('#state-select').innerHTML=[...data.states].sort((a,b)=>a.state_name.localeCompare(b.state_name)).map(s=>`<option value="${esc(s.state)}">${esc(s.state_name)} · ${esc(s.state)}</option>`).join('');
    makeSVG();buildMethodology();wireEvents();updateMap();renderPanel();writeURL();$('#map-loading').remove();$('#map-stage').setAttribute('aria-busy','false');
    document.documentElement.dataset.atlasReady='true';
  }catch(error){
    console.error(error);$('#map-stage').setAttribute('aria-busy','false');
    const loading=$('#map-loading');
    if(loading){loading.innerHTML='<span>The atlas could not load its research data.</span><button type="button" id="retry-atlas" class="text-button">Retry loading atlas</button>';$('#retry-atlas').addEventListener('click',()=>location.reload());}
    $('#panel-content').innerHTML='<div class="empty-state"><h3>Data unavailable</h3><p>Check your connection, then retry loading the atlas.</p></div>';
  }
}
wireTheme();
init();
