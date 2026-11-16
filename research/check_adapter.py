"""Verify migration against the original research snapshot, not UI code."""
from collections import Counter
from hashlib import sha256
import json
from math import isclose
from pathlib import Path
from urllib.parse import urlsplit

BASE = Path(__file__).resolve().parent
ASSET_DIR = BASE.parent / 'assets'
canonical_path = BASE.parent / 'downloads/ai_midterms_2026_data.json'
canonical_bytes = canonical_path.read_bytes()
original = json.loads(canonical_bytes)
app = json.loads((ASSET_DIR / 'dashboard-data.json').read_text())
tracker = json.loads((ASSET_DIR / 'tracker-data.json').read_text())
checks = []

def check(condition, message):
    if not condition:
        raise AssertionError(message)
    checks.append(message)

# Exact record equality is the migration contract. This preserves every vote,
# zero write-in, status note, nested component, source URL and history row.
for key, value in original.items():
    destination = tracker if key.startswith('tracker_') else app
    check(destination[key] == value, f'Canonical table {key} preserved without edits')
check(app['adapter_meta']['canonical_sha256'] == sha256(canonical_bytes).hexdigest(), 'Canonical hash identifies exact source snapshot')
expected_counts = {'states': 51, 'ballots': 67, 'policies': 138, 'elections': 21, 'election_choices': 90, 'recalls': 10, 'polls': 89, 'sources': 316}
for key, expected in expected_counts.items():
    check(len(app[key]) == expected, f'{key}: {expected} records')
check(len(tracker['tracker_results']) == 1064, '1064 tracker result rows retained')
check(len(tracker['tracker_candidates_on_record']) == 892, '892 tracker position rows retained')

state_codes = {s['state'] for s in original['states']}
summaries = app['state_summaries']
check(len(summaries) == len(state_codes) == 51, 'Exactly 51 state/DC summaries')
check({s['state'] for s in summaries} == state_codes, 'Summary states match original state index')
all_sources = {s['source_id'] for s in original['sources']}
for summary in summaries:
    code = summary['state']
    for table, key, id_key in [
        ('ballots', 'ballot_record_ids', 'record_id'), ('policies', 'policy_record_ids', 'record_id'),
        ('elections', 'election_record_ids', 'record_id'), ('recalls', 'recall_record_ids', 'record_id'),
        ('polls', 'poll_record_ids', 'id'),
    ]:
        expected = [r[id_key] for r in original[table] if r['state'] == code]
        check(summary[key] == expected, f'{code}: complete {table} links')
    check(set(summary['source_ids']) <= all_sources, f'{code}: source foreign keys resolve')
    for url in summary['source_urls']:
        check(urlsplit(url).scheme in ('http', 'https'), f'{code}: safe HTTP(S) source URL')
    for period in ['nov3', 'earlier', 'upcoming', 'all']:
        check(summary['ballot_counts_by_period'][period] == sum(summary['ballot_counts_by_period_and_topic'][period].values()), f'{code}: {period} topic counts reconcile')

counted_periods = Counter(v['period'] for v in app['ballot_views'].values())
check(counted_periods == {'nov3': 56, 'earlier': 7, 'upcoming': 4}, 'Date cohorts reconcile to 56 / 7 / 4')
november_development = [b for b in original['ballots'] if b['election_date'] == '2026-11-03' and b['scope_group'] in ('core_nov3', 'additional_nov3', 'additional_land_use')]
check(len(november_development) == 48, '48 November development-policy questions')
check(sum(b['restriction_outcome'] == 'more_restrictive' for b in november_development) == 46, '46 more-restrictive outcomes')
check(sum(b['legal_type'] == 'binding' for b in november_development) == 38, '38 binding development questions')
check(sum(b['legal_type'] == 'advisory' for b in november_development) == 10, '10 advisory development questions')

for ballot in original['ballots']:
    view = app['ballot_views'][ballot['record_id']]
    y, n = ballot.get('yes_votes'), ballot.get('no_votes')
    if y is None or n is None:
        check(view['yes_share_valid'] is None and view['no_share_valid'] is None and view['valid_yes_no_votes_calculated'] is None, f"{ballot['record_id']}: unknown tally preserved as null")
    else:
        check(view['valid_yes_no_votes_calculated'] == y + n, f"{ballot['record_id']}: valid-vote denominator matches raw counts")
        check(isclose(view['yes_share_valid'] + view['no_share_valid'], 100, abs_tol=1e-9), f"{ballot['record_id']}: shares sum to 100")
        if ballot.get('yes_pct_valid') is not None:
            check(isclose(view['yes_share_valid'], ballot['yes_pct_valid'], abs_tol=0.0051), f"{ballot['record_id']}: computed yes share agrees with retained share")

# These deliberately awkward cases protect the meaningful edge conditions.
check(app['ballot_views']['HI_HONOLULU_15']['valid_yes_no_votes_calculated'] == 226561, 'Honolulu uses yes+no, not all 253565 ballots')
check(app['ballot_views']['ME_BETHEL_ART3']['yes_share_valid'] is None, 'Bethel attendance is never converted into a tally')
wi = next(e for e in app['elections'] if e['record_id'] == 'E_WI_4')
check(sum(c.get('votes') == 0 for c in wi['choices']) == 9, 'Nine Wisconsin zero-value write-in rows preserved')
lead = {s['state']: s['leadership']['key'] for s in summaries}
check({s for s,k in lead.items() if k == 'new_democratic_trifecta'} == {'AZ','MI','MN','NV','PA','WI'}, 'Six documented new Democratic trifectas')
check(lead['NC'] == 'democratic_house_gain_senate_unresolved', 'North Carolina Senate remains unresolved')
check(lead['VA'] == 'prior_year_change', 'Virginia remains prior-year context')
check(lead['KS'] == 'democratic_hold', 'Kansas remains a hold, not a flip')
check(sum(k == 'no_retained_control_record' for k in lead.values()) == 37, 'No party control inferred for 37 unclassified state/DC rows')
result_ids = {r['record_id'] for r in tracker['tracker_results']}
position_only = [r for r in tracker['tracker_candidates_on_record'] if r['record_id'] not in result_ids]
check(len(position_only) == 75, '75 position-only records preserved for outer/left joins')

report = {
    'passed': True,
    'assertions': len(checks),
    'canonical_sha256': sha256(canonical_bytes).hexdigest(),
    'core_counts': expected_counts,
    'period_counts': dict(counted_periods),
    'november_development': {'questions':48, 'more_restrictive':46, 'binding':38, 'advisory':10},
    'tracker_counts': {'results':1064, 'positions':892, 'position_only':75},
    'file_sha256': {p.name: sha256(p.read_bytes()).hexdigest() for p in [ASSET_DIR/'dashboard-data.json',ASSET_DIR/'tracker-data.json']},
}
(BASE/'adapter-validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
