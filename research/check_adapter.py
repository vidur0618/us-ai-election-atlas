"""Validate the canonical-to-dashboard migration and research arithmetic.

Run from any directory: python /path/to/research/check_adapter.py
The datasets are read only. A report is written even on failure, with nonzero
exit status. Release-specific audited values are conditional on the as_of date;
preservation and arithmetic checks apply to every release.
"""
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from hashlib import sha256
import json
from math import isclose, isfinite
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit

BASE = Path(__file__).resolve().parent
ROOT = BASE.parent
SITE_ROOT = ROOT / 'dist' if (ROOT / 'dist').is_dir() else ROOT
CANONICAL = SITE_ROOT / 'downloads/ai_midterms_2026_data.json'
DASHBOARD = SITE_ROOT / 'assets/dashboard-data.json'
TRACKER = SITE_ROOT / 'assets/tracker-data.json'
REPORT = BASE / 'adapter-validation.json'
ELECTION_DAY = '2026-11-03'
REVIEW_DAY = '2026-11-16'
PERIODS = ('nov3', 'earlier', 'upcoming', 'all')
TOPICS = ('development', 'ai_governance', 'surveillance', 'adjacent', 'finance')
SCOPE_TOPIC = {
    'core_nov3': 'development', 'core_earlier': 'development',
    'additional_nov3': 'development', 'additional_land_use': 'development',
    'additional_earlier_townmeeting': 'development', 'scheduled': 'development',
    'ai_governance': 'ai_governance', 'ai_surveillance': 'surveillance',
    'ai_adjacent': 'adjacent', 'broader_tax': 'finance',
    'broader_school_finance': 'finance',
    'adjacent_compute_funding': 'adjacent',
    'automated_surveillance_adjacent': 'surveillance',
}
TRACKER_KEYS = {
    'tracker_results', 'tracker_metadata', 'tracker_candidates_on_record',
    'tracker_winner_index', 'tracker_state_counts', 'tracker_people_index',
}
checks, failures, skipped = [], [], []


def check(condition, message, detail=None):
    checks.append(message)
    if not condition:
        failures.append({'check': message, **({'detail': detail} if detail is not None else {})})
    return bool(condition)


def exact(value):
    """Object order is irrelevant; array order, nulls, types and zeros are not."""
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False, allow_nan=False)


def number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and isfinite(value)


def count(value):
    return isinstance(value, int) and not isinstance(value, bool) and value >= 0


def near(actual, expected, tolerance=0.0051):
    return number(actual) and isclose(actual, expected, rel_tol=0, abs_tol=tolerance)


def safe_url(value):
    if not isinstance(value, str):
        return False
    parsed = urlsplit(value)
    return parsed.scheme in ('http', 'https') and bool(parsed.netloc)


def iso_day(value):
    """Only parse an explicit ISO day; never infer dates from prose."""
    if isinstance(value, str) and re.match(r'^\d{4}-\d{2}-\d{2}(?:\b|T)', value):
        try:
            return date.fromisoformat(value[:10])
        except ValueError:
            pass
    return None


def unique(rows, key, label):
    values = [row.get(key) for row in rows]
    check(all(isinstance(v, str) and v for v in values), f'{label}: nonempty {key}')
    check(len(values) == len(set(values)), f'{label}: unique {key}')


def validate(original, app, tracker, canonical_bytes):
    metadata = original['metadata']
    cutoff = metadata['as_of']
    cutoff_day = iso_day(cutoff)
    check(cutoff_day is not None, 'Canonical metadata has an ISO as_of date')
    canonical_hash = sha256(canonical_bytes).hexdigest()

    # Independent preservation contract, not a re-run of the adapter.
    for key, value in original.items():
        destination = tracker if key in TRACKER_KEYS else app
        check(key in destination and exact(destination.get(key)) == exact(value),
              f'Canonical {key} preserved exactly')
    check(not (set(app) & TRACKER_KEYS), 'Tracker tables remain outside the main dashboard payload')
    for name, data in [('dashboard', app), ('tracker', tracker)]:
        meta = data.get('adapter_meta', {})
        check(meta.get('canonical_sha256') == canonical_hash, f'{name}: canonical hash matches source bytes')
        check(meta.get('canonical_file') == CANONICAL.name, f'{name}: canonical filename is current')
        check(meta.get('data_as_of') == cutoff, f'{name}: source cutoff preserved')
        check(meta.get('election_day') == ELECTION_DAY, f'{name}: election day preserved')

    id_keys = {
        'states': 'state', 'ballots': 'record_id', 'policies': 'record_id',
        'elections': 'record_id', 'election_choices': 'choice_id', 'recalls': 'record_id',
        'polls': 'id', 'sources': 'source_id', 'gaps': 'id',
        'tracker_results': 'record_id', 'tracker_candidates_on_record': 'record_id',
        'tracker_people_index': 'candidate_id', 'tracker_state_counts': 'state',
    }
    for table, key in id_keys.items():
        unique(original[table], key, table)
    # Winner-index aliases are intentionally nonunique by candidate_id.
    chamber_keys = [(r['state'], r['chamber']) for r in original['chamber_snapshots']]
    check(len(chamber_keys) == len(set(chamber_keys)), 'One current chamber snapshot per state/chamber')

    count_fields = {
        'state_jurisdictions_indexed': 'states', 'ballot_records': 'ballots',
        'policy_records': 'policies', 'selected_candidate_contests': 'elections',
        'recall_officials': 'recalls', 'poll_observations': 'polls',
        'source_registry_count': 'sources', 'source_conflict_rows': 'source_conflicts',
        'tracker_result_rows': 'tracker_results', 'tracker_position_rows': 'tracker_candidates_on_record',
    }
    core_counts = {table: len(original[table]) for table in count_fields.values()}
    core_counts['election_choices'] = len(original['election_choices'])
    for field, table in count_fields.items():
        check(metadata.get(field) == len(original[table]), f'Metadata {field} reconciles with {table}')

    states = {r['state'] for r in original['states']}
    check(len(states) == 51 and 'DC' in states, 'State index contains 50 states and DC')
    source_by_id = {r['source_id']: r for r in original['sources']}
    source_urls = {r['url'] for r in original['sources']}
    check(all(safe_url(url) for url in source_urls), 'Source registry contains HTTP(S) URLs with hosts')
    tables_with_sources = ('ballots', 'policies', 'elections', 'recalls', 'polls', 'control_changes')
    for table in tables_with_sources:
        unresolved = [(r.get('record_id', r.get('id', r.get('state'))), sid)
                      for r in original[table] for sid in r.get('source_ids', []) if sid not in source_by_id]
        unregistered = [(r.get('record_id', r.get('id', r.get('state'))), url)
                        for r in original[table] for url in r.get('sources', []) if url not in source_urls]
        check(not unresolved, f'{table}: source IDs resolve', unresolved)
        check(not unregistered, f'{table}: source URLs registered', unregistered)
        mismatched_links = [r.get('record_id', r.get('id', r.get('state'))) for r in original[table]
                            if {source_by_id[sid]['url'] for sid in r.get('source_ids', [])
                                if sid in source_by_id} != set(r.get('sources', []))]
        check(not mismatched_links, f'{table}: source IDs and URL lists refer to the same evidence', mismatched_links)
        allowed_states = states | ({'US', 'EIGHT_STATE_AGGREGATE'} if table == 'polls' else set())
        check(all(r['state'] in allowed_states for r in original[table]), f'{table}: known geographic codes')
    for chamber in original['chamber_snapshots']:
        label = f"{chamber['state']} {chamber['chamber']}"
        sid = chamber.get('source_id')
        check(chamber.get('source') in source_urls, f'{label}: chamber source registered')
        if sid:
            check(sid in source_by_id and source_by_id[sid]['url'] == chamber.get('source'),
                  f'{label}: chamber source ID matches URL')
        check(all(count(chamber.get(k, 0)) for k in ('D', 'R', 'other', 'uncalled')),
              f'{label}: party and uncalled seat counts are nonnegative integers')

    ballots = {r['record_id']: r for r in original['ballots']}
    views = app['ballot_views']
    check(set(views) == set(ballots), 'Ballot view IDs exactly cover canonical questions')
    check(set(app['policy_views']) == {r['record_id'] for r in original['policies']},
          'Policy view IDs exactly cover canonical policies')
    raw_period = {}
    for rid, ballot in ballots.items():
        event = ballot['election_date']
        check(iso_day(event) is not None, f'{rid}: election date is ISO')
        expected_period = ('nov3' if event == ELECTION_DAY else 'earlier' if event < ELECTION_DAY
                           else 'upcoming' if event > cutoff else None)
        check(expected_period is not None, f'{rid}: date has an explicit supported cohort')
        raw_period[rid] = expected_period
        view = views.get(rid, {})
        check(view.get('period') == expected_period, f'{rid}: date cohort matches event date')
        check(ballot['scope_group'] in SCOPE_TOPIC, f'{rid}: scope has an explicit research classification')
        check(view.get('topic') == SCOPE_TOPIC.get(ballot['scope_group']), f'{rid}: scope maps to correct topic')
        y, n = ballot.get('yes_votes'), ballot.get('no_votes')
        check(all(v is None or count(v) for v in (y, n)), f'{rid}: vote counts are nonnegative integers or null')
        if y is None or n is None:
            check(all(view.get(k) is None for k in ('yes_share_valid', 'no_share_valid',
                      'valid_yes_no_votes_calculated', 'winning_share_valid')),
                  f'{rid}: unavailable tallies do not become zeros or percentages')
            check(view.get('has_vote_counts') is False, f'{rid}: unavailable tally flag is false')
        else:
            total = y + n
            check(view.get('valid_yes_no_votes_calculated') == total, f'{rid}: denominator is yes plus no')
            if ballot.get('valid_yes_no_votes') is not None:
                check(ballot['valid_yes_no_votes'] == total, f'{rid}: canonical valid-vote total reconciles')
            check(view.get('has_vote_counts') is True, f'{rid}: known tally flag preserves zero counts')
            if total == 0:
                check(all(view.get(k) is None for k in ('yes_share_valid', 'no_share_valid', 'winning_share_valid')),
                      f'{rid}: zero denominator has no percentage')
            else:
                yp, np = 100*y/total, 100*n/total
                check(near(view.get('yes_share_valid'), yp, 1e-9) and near(view.get('no_share_valid'), np, 1e-9),
                      f'{rid}: shares use the correct denominator')
                check(near(view.get('winning_share_valid'), max(yp, np), 1e-9), f'{rid}: winning share reconciles')
                for field, value in [('yes_pct_valid', yp), ('no_pct_valid', np)]:
                    if ballot.get(field) is not None:
                        check(near(ballot[field], value), f'{rid}: retained {field} reconciles within rounding')
        if event > cutoff:
            check(y is None and n is None and ballot['outcome'] == 'scheduled',
                  f'{rid}: scheduled event has no invented result')

    periods = Counter(raw_period.values())
    check(metadata.get('nov3_questions_all_scopes') == periods['nov3'], 'Metadata November total matches event dates')
    dev = [b for b in ballots.values() if b['election_date'] == ELECTION_DAY and
           b['scope_group'] in ('core_nov3', 'additional_nov3', 'additional_land_use')]
    cohort = {'questions': len(dev), 'more_restrictive': sum(b['restriction_outcome'] == 'more_restrictive' for b in dev),
              'binding': sum(b['legal_type'] == 'binding' for b in dev),
              'advisory': sum(b['legal_type'] == 'advisory' for b in dev)}
    check(cohort == {'questions': 48, 'more_restrictive': 46, 'binding': 38, 'advisory': 10},
          'Retained November development cohort is 48 / 46 / 38 / 10', cohort)
    for field, key in [('nov3_development_cohort_questions', 'questions'), ('nov3_development_more_restrictive', 'more_restrictive'),
                       ('nov3_development_binding', 'binding'), ('nov3_development_advisory', 'advisory')]:
        check(metadata.get(field) == cohort[key], f'Metadata {field} reconciles with development cohort')

    # A stale flat table can be preserved losslessly. Check its arithmetic too.
    elections = {r['record_id']: r for r in original['elections']}
    flat = defaultdict(list)
    for row in original['election_choices']:
        flat[row['election_id']].append(row)
    check(set(flat) == set(elections), 'Flat candidate rows cover exactly the selected contests')
    for rid, election in elections.items():
        choices = election.get('choices', [])
        numeric = all(count(c.get('votes')) for c in choices)
        total = sum(c['votes'] for c in choices) if numeric else None
        check(election.get('valid_listed_votes') == total, f'{rid}: listed-candidate total reconciles')
        rows = flat.get(rid, [])
        check(len(rows) == len(choices), f'{rid}: every listed choice has one flattened row')
        for choice, row in zip(choices, rows):
            name = choice['name']
            check(all(row.get(k) == choice.get(k) for k in ('name', 'party', 'votes')),
                  f'{rid}/{name}: flat identity and votes match parent')
            expected_share = 100*choice['votes']/total if total and choice.get('votes') is not None else None
            share = row.get('share_of_listed_votes')
            check(share is None if expected_share is None else near(share, expected_share, 0.000051),
                  f'{rid}/{name}: flat share matches listed-vote denominator')
            for field in ('pct_calculated', 'pct_of_listed_votes_calculated'):
                if choice.get(field) is not None:
                    check(expected_share is not None and near(choice[field], expected_share, 0.000051),
                          f'{rid}/{name}: {field} recalculated')
            check(row.get('state') == election['state'] and row.get('date') == election['election_date'],
                  f'{rid}/{name}: flat state/date preserved')
        nested = defaultdict(int)
        for component in election.get('nested_writein_breakdown', []):
            nested[component['parent']] += component['votes']
        for parent, subtotal in nested.items():
            matches = [c for c in choices if c['name'] == parent]
            check(len(matches) == 1 and matches[0]['votes'] == subtotal,
                  f'{rid}: nested write-ins reconcile without double counting')
    for recall in original['recalls']:
        if count(recall.get('yes')) and count(recall.get('no')):
            total = recall['yes'] + recall['no']
        elif recall.get('choices') and all(count(c.get('votes')) for c in recall['choices']):
            total = sum(c['votes'] for c in recall['choices'])
        else:
            continue
        check(recall.get('total_valid_votes') == total, f"{recall['record_id']}: recall denominator reconciles")

    summaries = app['state_summaries']
    unique(summaries, 'state', 'state_summaries')
    check({s['state'] for s in summaries} == states, 'State summaries exactly cover the state index')
    state_by_code = {r['state']: r for r in original['states']}
    tables = [('ballots', 'ballot_record_ids', 'record_id'), ('policies', 'policy_record_ids', 'record_id'),
              ('elections', 'election_record_ids', 'record_id'), ('recalls', 'recall_record_ids', 'record_id'),
              ('polls', 'poll_record_ids', 'id')]
    for summary in summaries:
        st = summary['state']
        groups = {table: [r for r in original[table] if r['state'] == st] for table, _, _ in tables}
        for table, field, key in tables:
            check(summary.get(field) == [r[key] for r in groups[table]], f'{st}: complete ordered {table} links')
        state_ballots = groups['ballots']
        state_dev = [b for b in dev if b['state'] == st]
        expected_periods = {p: len(state_ballots) if p == 'all' else sum(raw_period[b['record_id']] == p for b in state_ballots)
                            for p in PERIODS}
        check(summary['ballot_counts_by_period'] == expected_periods, f'{st}: date counts match raw records')
        topic_counts = {p: {t: sum((p == 'all' or raw_period[b['record_id']] == p) and
                                          SCOPE_TOPIC.get(b['scope_group']) == t for b in state_ballots)
                            for t in TOPICS} for p in PERIODS}
        check(summary['ballot_counts_by_period_and_topic'] == topic_counts, f'{st}: topic/date counts match raw records')
        expected = {
            'ballot_records': len(state_ballots), 'nov3_questions': expected_periods['nov3'],
            'earlier_questions': expected_periods['earlier'], 'upcoming_questions': expected_periods['upcoming'],
            'nov3_development_questions': len(state_dev),
            'nov3_development_more_restrictive': sum(b['restriction_outcome'] == 'more_restrictive' for b in state_dev),
            'nov3_development_binding': sum(b['legal_type'] == 'binding' for b in state_dev),
            'nov3_development_advisory': sum(b['legal_type'] == 'advisory' for b in state_dev),
            'policy_records': len(groups['policies']), 'selected_elections': len(groups['elections']),
            'recall_officials': len(groups['recalls']), 'poll_observations': len(groups['polls']),
            'tracker_result_rows': sum(r['state'] == st for r in original['tracker_results']),
            'tracker_position_rows': sum(r['state'] == st for r in original['tracker_candidates_on_record']),
            'source_conflicts': sum(r['state'] == st for r in original['source_conflicts']),
        }
        check(summary['counts'] == expected, f'{st}: all summary counts reconcile',
              {'expected': expected, 'actual': summary['counts']} if summary['counts'] != expected else None)
        state = state_by_code[st]
        for field, value in [('selected_policy_records', expected['policy_records']),
                             ('nov3_targeted_dc_questions', len(state_dev)),
                             ('earlier_2026_questions', expected_periods['earlier']),
                             ('scheduled_after_cutoff', expected_periods['upcoming']),
                             ('recall_officials', expected['recall_officials']),
                             ('tracker_result_rows', expected['tracker_result_rows']),
                             ('tracker_nov3_position_rows', expected['tracker_position_rows'])]:
            check(state.get(field) == value, f'{st}: canonical state field {field} reconciles')
        check(set(summary.get('source_ids', [])) <= set(source_by_id), f'{st}: summary source IDs resolve')
        check(all(safe_url(u) for u in summary.get('source_urls', [])), f'{st}: summary source URLs are HTTP(S)')
        linked_urls = {source_by_id[sid]['url'] for sid in summary.get('source_ids', []) if sid in source_by_id}
        check(linked_urls <= set(summary.get('source_urls', [])), f'{st}: summary retains URLs for linked source IDs')

    check(views['HI_HONOLULU_15']['valid_yes_no_votes_calculated'] == 226561,
          'Honolulu denominator is 226561 yes/no votes, not all ballots')
    check(views['ME_BETHEL_ART3']['yes_share_valid'] is None, 'Bethel attendance never becomes an invented tally')
    check(sum(c.get('votes') == 0 for c in elections['E_WI_4']['choices']) == 9,
          'Nine Wisconsin zero-value write-in rows retained')
    leadership = {s['state']: s['leadership']['key'] for s in summaries}
    check({s for s, key in leadership.items() if key == 'new_democratic_trifecta'} == {'AZ', 'MI', 'MN', 'NV', 'PA', 'WI'},
          'Only six documented states receive the new-Democratic-trifecta classification')
    check(leadership['NC'] == 'democratic_house_gain_senate_unresolved', 'NC Senate control remains unresolved')
    check(leadership['VA'] == 'prior_year_change', 'Virginia remains prior-year context')
    check(leadership['KS'] == 'democratic_hold', 'Kansas remains a hold')
    check('trifecta' not in leadership['AK'], 'No Alaska trifecta inferred from governor election')

    result_ids = {r['record_id'] for r in tracker['tracker_results']}
    position_only = [r for r in tracker['tracker_candidates_on_record'] if r['record_id'] not in result_ids]
    tracker_counts = {'results': len(tracker['tracker_results']), 'positions': len(tracker['tracker_candidates_on_record']),
                      'position_only': len(position_only)}
    check(tracker_counts == {'results': 1064, 'positions': 892, 'position_only': 75},
          'Tracker retains 1064 results / 892 positions / 75 position-only rows', tracker_counts)
    tm = original['tracker_metadata']
    for field, value in [('candidate_result_rows', tracker_counts['results']),
                         ('nov3_candidate_rows_with_recorded_position', tracker_counts['positions']),
                         ('winner_index_rows', len(original['tracker_winner_index']))]:
        check(tm.get(field) == value, f'Tracker metadata {field} reconciles')
    check(tm.get('tracker_snapshot_date') == '2026-11-06', 'Tracker snapshot is not relabelled as fresh election data')

    # Focused provenance safeguards: retrieval dates are not event dates, and
    # survey-wide samples cannot fill missing question-level denominators.
    bad_dates = []
    if cutoff_day:
        for table in ('ballots', 'elections', 'policies', 'polls', 'sources', 'chamber_snapshots'):
            for row in original[table]:
                for field in ('last_verified_at', 'retrieved_as_of'):
                    parsed = iso_day(row.get(field))
                    if parsed and parsed > cutoff_day:
                        bad_dates.append((table, row.get('record_id', row.get('source_id', row.get('id'))), field, row[field]))
        check(not bad_dates, 'Retrieval/verification dates do not exceed the declared review cutoff', bad_dates)
    for poll in original['polls']:
        pid = poll['id']
        check(number(poll['percent']) and 0 <= poll['percent'] <= 100, f'{pid}: survey percentage is bounded')
        if poll.get('question_sample_n') is None:
            check(poll.get('sample_n') is None, f'{pid}: overall sample not substituted for unknown question base')
        if poll.get('question_margin_of_error_pp') is None:
            check(poll.get('margin_of_error_pp') is None, f'{pid}: no inferred question-level margin of error')
    solar = [r for r in original['polls'] if r['id'].startswith('EVP_ENERGY_Home_solar_')]
    check(len(solar) == 3 and sum(r['percent'] for r in solar) == 98 and
          all(r.get('component_sum_percent') == 98 for r in solar),
          'EVP source total 98 preserved without normalization or imputation')

    # Audited release fixtures, not permanent facts. Later releases still receive
    # generic validation but need new primary-source-backed fixtures.
    if cutoff == REVIEW_DAY:
        check(len(ballots) == 71 and periods == {'nov3': 60, 'earlier': 7, 'upcoming': 4},
              '16 Nov expanded ballot inventory: 71 records with date cohorts 60 / 7 / 4')
        chicago = ballots['IL_CHICAGO_GUNSHOT']
        check((chicago.get('yes_votes'), chicago.get('no_votes')) == (529613, 212933),
              '16 Nov Chicago tally is 529613 yes / 212933 no')
        chambers = {(r['state'], r['chamber']): r for r in original['chamber_snapshots']}
        tx = chambers.get(('TX', 'House'), {})
        check((tx.get('D'), tx.get('R'), tx.get('uncalled')) == (79, 63, 8), 'TX called House seats retain 79 D / 63 R / 8 uncalled')
        check((tx.get('projection', {}).get('D'), tx.get('projection', {}).get('R')) == (83, 67),
              'TX 83 D / 67 R is preserved separately as a projection')
        nc = chambers.get(('NC', 'Senate'), {})
        check((nc.get('D'), nc.get('R'), nc.get('uncalled')) == (24, 25, 1), 'NC Senate retains 24 D / 25 R / 1 uncalled')
        ak = [r for r in elections.values() if r['state'] == 'AK' and 'governor' in r['office'].lower()]
        check(len(ak) == 1, 'One selected Alaska governor contest')
        if ak:
            election = ak[0]
            check(election.get('valid_listed_votes') == 278254, 'Alaska first-preference denominator 278254 retained')
            writeins = sum(c['votes'] for c in election['choices'] if re.search(r'write[\s-]?in', c['name'], re.I))
            check(writeins == 798, 'Alaska first-preference tally includes 798 write-ins')
            context = exact({k: election.get(k) for k in ('status', 'notes', 'denominator_note', 'count_basis')}).lower()
            check('first' in context and ('preference' in context or 'round' in context),
                  'Alaska first-preference count explicitly distinguished from final ranked-choice tally')
        check(elections['E_AZ_GOV'].get('valid_listed_votes') == 2579147, 'Arizona governor listed-vote total 2579147')
        az_commission = elections['E_AZ_8']
        check(az_commission.get('valid_listed_votes') == 4686276, 'Arizona commission candidate-vote total 4686276')
        check('candidate' in az_commission.get('denominator_note', '').lower(),
              'Arizona vote-for-two denominator labelled candidate votes')
        hb507 = next((p for p in original['policies'] if p['record_id'] == 'VA_HB507'), {})
        check(hb507.get('regulation_effective_date') == '2026-11-04', 'VA HB507 regulation effective date retained separately')
    else:
        skipped.append(f'{REVIEW_DAY} release-specific audited values (canonical as_of={cutoff}); generic preservation/arithmetic checks still applied')

    return {'canonical_sha256': canonical_hash, 'data_as_of': cutoff, 'core_counts': core_counts,
            'period_counts': dict(periods), 'november_development': cohort, 'tracker_counts': tracker_counts}


def main():
    report = {'checked_at': datetime.now(timezone.utc).isoformat(),
              'input_files': {'canonical': str(CANONICAL), 'dashboard': str(DASHBOARD), 'tracker': str(TRACKER)}}
    try:
        blobs = {p: p.read_bytes() for p in (CANONICAL, DASHBOARD, TRACKER)}
        report.update(validate(json.loads(blobs[CANONICAL]), json.loads(blobs[DASHBOARD]),
                               json.loads(blobs[TRACKER]), blobs[CANONICAL]))
        report['file_sha256'] = {p.name: sha256(b).hexdigest() for p, b in blobs.items()}
    except Exception as exc:
        failures.append({'check': 'Validator completed', 'detail': f'{type(exc).__name__}: {exc}'})
    report.update({'passed': not failures, 'assertions': len(checks), 'failed_assertions': len(failures),
                   'failures': failures, 'skipped': skipped})
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
