"""Lossless core-data adapter for the US AI Election Atlas.

The research records are never rewritten. Display fields and state aggregates
live alongside them. Run this file whenever the canonical snapshot changes.
"""
from collections import Counter
from copy import deepcopy
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re

BASE = Path(__file__).resolve().parent
SOURCE_DIR = BASE.parent / 'downloads'
ASSET_DIR = BASE.parent / 'assets'
SOURCE = SOURCE_DIR / 'ai_midterms_2026_data.json'
ELECTION_DAY = '2026-11-03'
raw_bytes = SOURCE.read_bytes()
raw = json.loads(raw_bytes)
CUTOFF = raw['metadata']['as_of']

TRACKER_KEYS = [
    'tracker_results', 'tracker_metadata', 'tracker_candidates_on_record',
    'tracker_winner_index', 'tracker_state_counts', 'tracker_people_index',
]
TOPICS = ['development', 'ai_governance', 'surveillance', 'adjacent', 'finance']
PERIODS = ['nov3', 'earlier', 'upcoming', 'all']
SCOPE_TOPIC = {
    'core_nov3': 'development', 'core_earlier': 'development',
    'additional_nov3': 'development', 'additional_land_use': 'development',
    'additional_earlier_townmeeting': 'development', 'scheduled': 'development',
    'ai_governance': 'ai_governance', 'ai_surveillance': 'surveillance',
    'ai_adjacent': 'adjacent', 'broader_tax': 'finance',
    'broader_school_finance': 'finance',
}

def display(value):
    """Readability-only formatting; canonical text remains intact."""
    if value is None:
        return None
    text = str(value).replace('_', ' ')
    text = re.sub(r'(?<=[,;:])(?=[A-Za-z0-9])', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[0].upper() + text[1:] if text else text

def period(date):
    if date == ELECTION_DAY:
        return 'nov3'
    if date < ELECTION_DAY:
        return 'earlier'
    if date > CUTOFF:
        return 'upcoming'
    raise ValueError(f'New post-election/pre-cutoff date needs an explicit UI period: {date}')

ballot_views = {}
for b in raw['ballots']:
    y, n = b.get('yes_votes'), b.get('no_votes')
    total = y + n if y is not None and n is not None else None
    yp = 100 * y / total if total else None
    np = 100 * n / total if total else None
    ballot_views[b['record_id']] = {
        'period': period(b['election_date']),
        'topic': SCOPE_TOPIC[b['scope_group']],
        'topic_label': {
            'development': 'Data-centre development',
            'ai_governance': 'AI governance',
            'surveillance': 'Automated surveillance',
            'adjacent': 'Related technology',
            'finance': 'Broader public finance',
        }[SCOPE_TOPIC[b['scope_group']]],
        'legal_type_label': {
            'binding': 'Binding', 'advisory': 'Advisory',
            'town_meeting_binding': 'Binding town-meeting vote',
        }[b['legal_type']],
        'outcome_label': display(b['outcome']),
        'result_status_label': display(b['result_status']),
        'restriction_label': {
            'more_restrictive': 'More restrictive winning position',
            'less_restrictive': 'Less restrictive winning position',
            'not_comparable': 'No comparable restriction direction',
        }[b['restriction_outcome']],
        'valid_yes_no_votes_calculated': total,
        'yes_share_valid': yp,
        'no_share_valid': np,
        'winning_share_valid': max(yp, np) if yp is not None else None,
        'share_denominator': 'yes_votes + no_votes; excludes blank/other ballot categories',
        'is_development_question': SCOPE_TOPIC[b['scope_group']] == 'development',
        'is_scheduled': b['outcome'] == 'scheduled',
        'has_vote_counts': total is not None,
    }

policy_views = {
    p['record_id']: {
        'status_label': display(p['status']),
        'verification_label': display(p.get('verification')),
        'topic_labels': [display(t) for t in p.get('topics', [])],
    }
    for p in raw['policies']
}

LEADERSHIP = {
    'new_democratic_trifecta': {
        'states': ['AZ', 'MI', 'MN', 'NV', 'PA', 'WI'],
        'label': 'New Democratic trifecta',
        'description': 'Incoming Democratic control of the governor and both legislative chambers, as recorded in the selected sources.',
        'election_year': 2026,
    },
    'democratic_gain_divided': {
        'states': ['GA', 'IA', 'NH', 'OH', 'TX'],
        'label': 'Democratic gain; divided government',
        'description': 'Recorded Democratic gains leave executive and legislative control divided between parties.',
        'election_year': 2026,
    },
    'democratic_house_gain_senate_unresolved': {
        'states': ['NC'],
        'label': 'Democratic House gain; Senate unresolved',
        'description': 'The House changed to Democratic control. The retained sources do not establish a resolved Senate-control classification.',
        'election_year': 2026,
    },
    'prior_year_change': {
        'states': ['VA'],
        'label': 'Prior-year change (2025)',
        'description': 'The gubernatorial change occurred in November 2025; 2026 policy is contextual, not a 2026 midterm flip.',
        'election_year': 2025,
    },
    'democratic_hold': {
        'states': ['KS'],
        'label': 'Democratic governor hold',
        'description': 'The selected governor result is a Democratic hold, not a Republican-to-Democratic flip.',
        'election_year': 2026,
    },
    'no_retained_control_record': {
        'states': [],
        'label': 'No retained control-change record',
        'description': 'No control-change claim is made in this selected research inventory. This is not a claim about actual party control or a certified absence of change.',
        'election_year': None,
    },
}
leadership_lookup = {
    st: key for key, row in LEADERSHIP.items() for st in row['states']
}
source_lookup = {s['source_id']: s for s in raw['sources']}
url_to_sid = {s['url']: s['source_id'] for s in raw['sources']}
state_summaries = []
for s in raw['states']:
    st = s['state']
    ballots = [b for b in raw['ballots'] if b['state'] == st]
    policies = [p for p in raw['policies'] if p['state'] == st]
    elections = [e for e in raw['elections'] if e['state'] == st]
    recalls = [r for r in raw['recalls'] if r['state'] == st]
    polls = [p for p in raw['polls'] if p['state'] == st]
    changes = [c for c in raw['control_changes'] if c['state'] == st]
    chambers = [c for c in raw['chamber_snapshots'] if c['state'] == st]
    by_period = {p: len(ballots) if p == 'all' else sum(ballot_views[b['record_id']]['period'] == p for b in ballots) for p in PERIODS}
    by_period_topic = {
        p: {
            t: sum((p == 'all' or ballot_views[b['record_id']]['period'] == p) and ballot_views[b['record_id']]['topic'] == t for b in ballots)
            for t in TOPICS
        }
        for p in PERIODS
    }
    development_nov3 = [b for b in ballots if ballot_views[b['record_id']]['topic'] == 'development' and ballot_views[b['record_id']]['period'] == 'nov3']
    leadership_key = leadership_lookup.get(st, 'no_retained_control_record')
    leadership = {k: v for k, v in LEADERSHIP[leadership_key].items() if k != 'states'}
    leadership['key'] = leadership_key
    leadership['source_ids'] = list(dict.fromkeys(z for c in changes for z in c.get('source_ids', [])))
    leadership['sources'] = list(dict.fromkeys(z for c in changes for z in c.get('sources', [])))
    records = ballots + policies + elections + recalls + polls + changes
    source_ids = list(dict.fromkeys(z for r in records for z in r.get('source_ids', [])))
    source_ids += [c.get('source_id', url_to_sid.get(c.get('source'))) for c in chambers]
    source_ids = list(dict.fromkeys(z for z in source_ids if z is not None))
    source_urls = list(dict.fromkeys(
        [source_lookup[z]['url'] for z in source_ids]
        + [z for r in records for z in r.get('sources', [])]
        + [c['source'] for c in chambers if c.get('source')]
    ))
    state_summaries.append({
        'state': st, 'state_name': s['state_name'],
        'coverage_statement': s['coverage_statement'],
        'control_context': s['control_context'],
        'ballot_record_ids': [b['record_id'] for b in ballots],
        'policy_record_ids': [p['record_id'] for p in policies],
        'election_record_ids': [e['record_id'] for e in elections],
        'recall_record_ids': [r['record_id'] for r in recalls],
        'poll_record_ids': [p['id'] for p in polls],
        'control_changes': changes,
        'chamber_snapshots': chambers,
        'leadership': leadership,
        'ballot_counts_by_period': by_period,
        'ballot_counts_by_period_and_topic': by_period_topic,
        'counts': {
            'ballot_records': len(ballots),
            'nov3_questions': by_period['nov3'],
            'earlier_questions': by_period['earlier'],
            'upcoming_questions': by_period['upcoming'],
            'nov3_development_questions': len(development_nov3),
            'nov3_development_more_restrictive': sum(b['restriction_outcome'] == 'more_restrictive' for b in development_nov3),
            'nov3_development_binding': sum(b['legal_type'] == 'binding' for b in development_nov3),
            'nov3_development_advisory': sum(b['legal_type'] == 'advisory' for b in development_nov3),
            'policy_records': len(policies),
            'selected_elections': len(elections),
            'recall_officials': len(recalls),
            'poll_observations': len(polls),
            'tracker_result_rows': s.get('tracker_result_rows', 0),
            'tracker_position_rows': s.get('tracker_nov3_position_rows', 0),
            'source_conflicts': sum(c['state'] == st for c in raw['source_conflicts']),
        },
        'source_ids': source_ids,
        'source_urls': source_urls,
    })

adapter_meta = {
    'schema_version': 1,
    'canonical_file': SOURCE.name,
    'canonical_sha256': sha256(raw_bytes).hexdigest(),
    'data_as_of': CUTOFF,
    'election_day': ELECTION_DAY,
    'adapter_built_at': datetime.now(timezone.utc).isoformat(),
    'preservation_rule': 'All canonical core tables and records remain unchanged; computed/display fields are separate.',
    'percent_scale': '0 to 100; null means unavailable, not zero',
    'tracker_file': 'tracker-data.json',
    'source_artifacts': [
        {'filename': f.name, 'size_bytes': f.stat().st_size, 'sha256': sha256(f.read_bytes()).hexdigest()}
        for f in sorted(SOURCE_DIR.iterdir()) if f.is_file() and f.name.startswith('ai_midterms_2026_')
    ],
}
dashboard = {k: deepcopy(v) for k, v in raw.items() if k not in TRACKER_KEYS}
dashboard.update({
    'adapter_meta': adapter_meta,
    'state_summaries': state_summaries,
    'ballot_views': ballot_views,
    'policy_views': policy_views,
    'leadership_legend': {k: {a: b for a, b in v.items() if a != 'states'} for k, v in LEADERSHIP.items()},
})
tracker = {'adapter_meta': adapter_meta, **{k: deepcopy(raw[k]) for k in TRACKER_KEYS}}
for name, data in [('dashboard-data.json', dashboard), ('tracker-data.json', tracker)]:
    out = ASSET_DIR / name
    out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(name, out.stat().st_size)
