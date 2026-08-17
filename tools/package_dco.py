#!/usr/bin/env python3
"""Geofence zones, dayparts and per-vehicle creative for a mindline.sg route package.

The route buy is settled in tools/mindline_eval.py. This answers the next question,
for whichever package is being sold: once the five buses are running, *what runs
where, and when*.

One tool serves all three packages so the decks cannot drift apart. Everything a
slide prints comes out of here — including the audience index and the four-set
comparison, pulled from mindline_eval rather than retyped.

Geofence zones are DERIVED, not drawn by hand. For each audience, every planning
area the buy touches is scored on that audience's places, and the anchors named on
the slide are the actual POIs inside them. A zone nobody can name is a zone nobody
can brief a studio from.

Dayparts are the one thing here that is NOT measured. Boarding data has no clock on
it in this repo — stop_volume is a weekday/weekend total, not an hourly curve. So
the dayparts are planning assumptions derived from when the institutions in each
zone are open, and every one is emitted with assumption=True so the deck can mark it
as such. Presenting an assumption as a measurement is how a media plan loses a
public-sector client.

Usage: python3 tools/package_dco.py "DBP C1" [--json out.json]
"""
import json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mindline_eval as M

# package code -> the set it was chosen from in tools/mindline_eval.py
PACKAGES = {
    'DBP C1': {'set': 'Set 2', 'routes': ['190', '70', '133', '198', '85'],
               'stance': 'recommended'},
    'DBP L2': {'set': 'Set 3', 'routes': ['972', '143', '5', '76', '31'],
               'stance': 'alternative'},
    'DBP C2': {'set': 'Set 4', 'routes': ['972', '97', '130', '89', '43'],
               'stance': 'third'},
}
# every set that carries a package code, so all three decks label the shared
# comparison identically — a reviewer holding two of them must not see one deck
# call a row "Set 3" and another call the same row "DBP L2"
SET_CODE = {'Set 2': 'DBP C1', 'Set 3': 'DBP L2', 'Set 4': 'DBP C2'}

AUD_LAYERS = {
    'children':  ['pri', 'studentcare', 'spec'],
    'seniors':   ['eldercare', 'polyclinics', 'cc', 'hospitals'],
    'working':   ['interchanges', 'malls', 'frasers', 'events'],
    'youth':     ['sec', 'jcmi', 'ip', 'sis', 'uni', 'poly', 'ite', 'arts',
                  'libraries', 'sport', 'cinemas'],
}
AUD_ORDER = ['children', 'seniors', 'working', 'sandwich', 'youth']
AUD_LABEL = {
    'children': 'Young children', 'seniors': 'Seniors', 'working': 'Working adults',
    'sandwich': 'Sandwich generation', 'youth': 'Youth',
}
COHORT = {'children': 'a0_14', 'seniors': 'a65p', 'working': 'a25_64', 'youth': 'a15_24'}

# What each audience's headline line on the delivery slide counts.
DETAIL = {
    'children': [('pri', 'primary schools'), ('studentcare', 'student-care centres')],
    'seniors':  [('eldercare', 'eldercare'), ('cc', 'community clubs'), ('polyclinics', 'polyclinics')],
    'working':  [('interchanges', 'MRT/LRT interchanges'), ('malls', 'malls')],
    'youth':    [('sec', 'secondary'), ('jcmi', 'JCs'), ('sport', 'SportSG'),
                 ('cinemas', 'cinemas'), ('libraries', 'libraries')],
}

# Daypart windows — ASSUMPTIONS, from when the institutions in the zone are open.
DAYPARTS = {
    'children': ('Weekday 13:00–16:00', 'Primary dismissal and student-care pickup',
                 'Parent-facing: "Worried about your child? Talk to someone."'),
    'seniors':  ('Weekday 08:00–11:00', 'Polyclinic and senior-activity morning peak',
                 'Large type, dialect-friendly: the number, and that it is free.'),
    'working':  ('Weekday 07:30–09:30 & 17:30–19:30', 'Interchange and CBD commute peaks',
                 'Low-dwell, high-frequency: one line and the number.'),
    'sandwich': ('Weekday 17:30–20:00 + weekend all-day', 'After work, and the weekend errand run',
                 '"Caring for both? You can call for yourself too."'),
    'youth':    ('Weekday 15:00–18:00 + weekend 12:00–20:00', 'Secondary/IHL dismissal and third-place dwell',
                 'Peer-voice, QR to chat rather than phone.'),
}


def route_profile(r):
    rm = M.measure([r])
    prof = {k: sum(rm['places'].get(x, 0) for x in v) for k, v in AUD_LAYERS.items()}
    prof['sandwich'] = rm['sandwich_stops']
    return rm, prof


def assign_leads(profiles):
    """One audience per bus — five vehicles, five audiences, one each.

    A bus is assigned the audience it carries the largest SHARE of, not the largest
    count: three of the five routes usually post their biggest raw number against
    working adults, which would put the same creative on three vehicles and leave
    two audiences unbriefed. Shares are matched greedily, highest first, so each
    audience lands on the bus that over-indexes on it most.
    """
    tot = {a: sum(p[a] for p in profiles.values()) or 1 for a in AUD_ORDER}
    share = {r: {a: profiles[r][a] / tot[a] for a in AUD_ORDER} for r in profiles}
    leads, free_r, free_a = {}, set(profiles), set(AUD_ORDER)
    while free_r and free_a:
        r, a = max(((r, a) for r in free_r for a in free_a),
                   key=lambda ra: share[ra[0]][ra[1]])
        leads[r] = {'audience': a, 'label': AUD_LABEL[a],
                    'share': round(share[r][a], 4), 'count': profiles[r][a]}
        free_r.discard(r)
        free_a.discard(a)
    return leads


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    code = args[0] if args else 'DBP C1'
    if code not in PACKAGES:
        sys.exit('unknown package %r — one of %s' % (code, ', '.join(PACKAGES)))
    pkg = PACKAGES[code]
    routes = pkg['routes']

    m = M.measure(routes)
    codes = {c for r in routes for c in M.route_stop_codes(r)} & set(M.stops)

    # ---- the four-set comparison, straight from the evaluator (never retyped)
    measured = {n: M.measure(rs) for n, rs in M.SETS.items()}
    _, idx = M.index_sets(measured)
    index = {a: round(idx[pkg['set']][a], 1) for a in AUD_ORDER}
    index['OVERALL'] = round(idx[pkg['set']]['OVERALL'], 1)
    comparison = [{'set': n, 'code': SET_CODE.get(n), 'is_this': n == pkg['set'],
                   'overall': round(idx[n]['OVERALL'], 1),
                   'audiences': {a: round(idx[n][a], 1) for a in AUD_ORDER},
                   'sandwich_stops': measured[n]['sandwich_stops'],
                   'stops': measured[n]['stops'],
                   'dup_stops': measured[n]['dup_stops'],
                   'region': {k: round(v * 100, 1) for k, v in M.region_mix(rs).items()}}
                  for n, rs in M.SETS.items()]

    # ---- anchors: which named POIs sit within 400 m of one of THIS package's stops
    anchors = defaultdict(lambda: defaultdict(list))
    for key in sorted({k for v in AUD_LAYERS.values() for k in v}):
        if not os.path.exists(os.path.join(M.D, 'poi_%s.json' % key)):
            continue
        for p in M.load('poi_%s.json' % key):
            hit = M.stops_near(p) & codes
            if not hit:
                continue
            best = max(hit, key=lambda c: M.volume.get(c, {}).get('wd', 0))
            area = M.stop_area.get(best)
            if area:
                anchors[area][key].append(p['name'])

    area_stops = defaultdict(set)
    for c in codes:
        a = M.stop_area.get(c)
        if a:
            area_stops[a].add(c)

    zones = {}
    for aud in AUD_ORDER:
        rows = []
        for area, cs in area_stops.items():
            wd = sum(M.volume.get(c, {}).get('wd', 0) for c in cs)
            if aud == 'sandwich':
                n = len(cs & M.SANDWICH_STOPS)
                imp = wd * M.sandwich_share(area)
                # interleave a child anchor with a senior one — the pair IS the story
                kid = [x for k in AUD_LAYERS['children'] for x in anchors[area].get(k, [])]
                old = [x for k in AUD_LAYERS['seniors'] for x in anchors[area].get(k, [])]
                names = [x for i in range(max(len(kid), len(old)))
                         for x in ([kid[i]] if i < len(kid) else []) + ([old[i]] if i < len(old) else [])]
            else:
                n = sum(len(anchors[area].get(k, [])) for k in AUD_LAYERS[aud])
                imp = wd * M.cohort_share(area, COHORT[aud])
                names = [x for k in AUD_LAYERS[aud] for x in anchors[area].get(k, [])]
            if n:
                rows.append({'area': area, 'places': n, 'stops': len(cs), 'wd': wd,
                             'imp': imp, 'anchors': names[:4]})
        # ranked by places, so the order on the slide matches the number printed on it
        rows.sort(key=lambda r: (-r['places'], -r['imp']))
        window, why, job = DAYPARTS[aud]
        detail = ' · '.join('%d %s' % (m['places'].get(k, 0), lab)
                            for k, lab in DETAIL.get(aud, [])) if aud != 'sandwich' else \
            '%d stops with a school and a senior place inside 400 m' % m['sandwich_stops']
        zones[aud] = {'label': AUD_LABEL[aud], 'zones': rows[:5], 'index': index[aud],
                      'detail': detail, 'daypart': window, 'daypart_why': why,
                      'daypart_assumption': True, 'creative': job}

    names = {s['n']: s['name'] for s in M.load('network.json')['services']}
    detail_by_route, profiles = {}, {}
    for r in routes:
        rm, prof = route_profile(r)
        profiles[r] = prof
        detail_by_route[r] = {'name': names.get(r, r), 'stops': rm['stops'],
                              'wd': rm['wd'], 'we': rm['we'], 'profile': prof}
    leads = assign_leads(profiles)
    for r in routes:
        detail_by_route[r]['lead'] = leads[r]

    out = {'package': code, 'set': pkg['set'], 'stance': pkg['stance'], 'routes': routes,
           'totals': {'stops': m['stops'], 'wd': m['wd'], 'we': m['we'],
                      'areas': m['areas'], 'sandwich_stops': m['sandwich_stops'],
                      'dup_stops': m['dup_stops']},
           'index': index, 'comparison': comparison, 'zones': zones,
           'imh': m['imh'], 'places': m['places'],
           'routes_detail': detail_by_route,
           'region_mix': {k: round(v * 100, 1) for k, v in M.region_mix(routes).items()}}

    w = sys.stdout.write
    w('\n%s (%s, %s) — %s\n' % (code, pkg['set'], pkg['stance'], ', '.join(routes)))
    w('%d stops · %s weekday · %s weekend · %d areas · %d sandwich stops · %d duplicates\n'
      % (m['stops'], f"{m['wd']:,}", f"{m['we']:,}", m['areas'],
         m['sandwich_stops'], m['dup_stops']))
    w('index — ' + ' · '.join('%s %.1f' % (AUD_LABEL[a], index[a]) for a in AUD_ORDER)
      + ' | OVERALL %.1f\n' % index['OVERALL'])
    w('region — ' + ' · '.join('%s %.1f%%' % (k.replace(' Region', ''), v)
                               for k, v in sorted(out['region_mix'].items(), key=lambda kv: -kv[1])) + '\n')

    for aud in AUD_ORDER:
        z = zones[aud]
        w('\n=== %s (index %.1f) ===\n' % (z['label'].upper(), z['index']))
        w('  daypart (ASSUMPTION): %s — %s\n' % (z['daypart'], z['daypart_why']))
        for r in z['zones']:
            w('   %-16s %2d places · %3d stops · %8s wd · %s\n'
              % (r['area'], r['places'], r['stops'], f"{r['wd']:,}",
                 ', '.join(r['anchors'][:3])[:60]))

    w('\n=== per-vehicle creative (one audience per bus, by share) ===\n')
    for r in routes:
        d = detail_by_route[r]
        w('%-5s %-40s -> %-20s (%d places, %.0f%% of the package)\n'
          % (r, d['name'][:40], d['lead']['label'], d['lead']['count'], d['lead']['share'] * 100))

    if '--json' in sys.argv:
        path = sys.argv[sys.argv.index('--json') + 1]
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(out, f, indent=1)
        w('\nwrote %s\n' % path)


if __name__ == '__main__':
    main()
