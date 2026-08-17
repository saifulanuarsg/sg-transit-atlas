#!/usr/bin/env python3
"""DBP C1 (Set 2) — geofence zones and dayparts for the mindline.sg hotline campaign.

The route buy is settled in tools/mindline_eval.py. This answers the next question:
once the five buses are running, *what runs where, and when*.

Geofence zones are DERIVED, not drawn by hand. For each audience, every planning
area the buy touches is scored on that audience's places and its boarding-weighted
cohort impressions; the areas that carry the audience become its zones, and the
anchors named on the slide are the actual POIs inside them. A zone nobody can
name is a zone nobody can brief a studio from.

Dayparts are the one thing here that is NOT measured. Boarding data has no clock
on it in this repo — stop_volume is a weekday/weekend total, not an hourly curve.
So the dayparts below are planning assumptions derived from when the institutions
in each zone are actually open (MOE dismissal windows, polyclinic hours, commute
peaks), and every one of them is emitted with assumption=True so the deck can mark
it as such. Presenting an assumption as a measurement is how a media plan loses a
public-sector client.

Usage: python3 tools/dbp_c1_dco.py [--json out.json]
"""
import json, os, sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import mindline_eval as M

C1 = ['190', '70', '133', '198', '85']
C1_NAME = 'DBP C1'

# Which layers evidence which audience — same definitions the evaluation used, so
# the creative plan cannot quietly target a different audience than the one bought.
AUD_LAYERS = {
    'children':  ['pri', 'studentcare', 'spec'],
    'seniors':   ['eldercare', 'polyclinics', 'cc', 'hospitals'],
    'working':   ['interchanges', 'malls', 'frasers', 'events'],
    'youth':     ['sec', 'jcmi', 'ip', 'sis', 'uni', 'poly', 'ite', 'arts', 'libraries', 'sport', 'cinemas'],
}
AUD_LABEL = {
    'children':  'Young children',
    'seniors':   'Seniors',
    'working':   'Working adults',
    'sandwich':  'Sandwich generation',
    'youth':     'Youth',
}
COHORT = {'children': 'a0_14', 'seniors': 'a65p', 'working': 'a25_64', 'youth': 'a15_24'}

# Daypart windows — ASSUMPTIONS, from when the institutions in the zone are open.
# (label, window, why it is that window, the creative job in it)
DAYPARTS = {
    'children': ('Weekday 13:00–16:00', 'Primary dismissal and student-care pickup',
                 'Parent-facing: "Worried about your child? Talk to someone."'),
    'seniors':  ('Weekday 08:00–11:00', 'Polyclinic and senior-activity-centre morning peak',
                 'Large type, dialect-friendly: the number, and that it is free.'),
    'working':  ('Weekday 07:30–09:30 & 17:30–19:30', 'Interchange and CBD commute peaks',
                 'Low-dwell, high-frequency: one line and the number.'),
    'sandwich': ('Weekday 17:30–20:00 + weekend all-day', 'After work, and the weekend errand run',
                 '"Caring for both? You can call for yourself too."'),
    'youth':    ('Weekday 15:00–18:00 + weekend 12:00–20:00', 'Secondary/IHL dismissal and third-place dwell',
                 'Peer-voice, QR to chat rather than phone.'),
}


def audience_score(area_places, imp):
    return area_places, imp


def main():
    m = M.measure(C1)
    codes = set()
    for r in C1:
        codes |= M.route_stop_codes(r)
    codes = {c for c in codes if c in M.stops}

    # stop -> layers present within 400 m (already computed by the evaluator)
    area_stops = defaultdict(set)
    for c in codes:
        a = M.stop_area.get(c)
        if a:
            area_stops[a].add(c)

    # For naming anchors: which named POIs sit within 400 m of one of OUR stops.
    anchors = defaultdict(lambda: defaultdict(list))   # area -> layer -> [names]
    for key, entries in M.poi_routes.items():
        for name, rs in entries:
            if not rs & set(C1):
                continue
            # locate the POI's area via the nearest of our stops that sees it
            pass

    # Re-walk the POI files so each place carries its own area (cheap, and it keeps
    # the anchor list honest — a place is credited to the area it actually sits in).
    for key in AUD_LAYERS['children'] + AUD_LAYERS['seniors'] + AUD_LAYERS['working'] + AUD_LAYERS['youth']:
        path = os.path.join(M.D, 'poi_%s.json' % key)
        if not os.path.exists(path):
            continue
        for p in M.load('poi_%s.json' % key):
            near = M.stops_near(p)
            hit = near & codes
            if not hit:
                continue
            best = max(hit, key=lambda c: M.volume.get(c, {}).get('wd', 0))
            area = M.stop_area.get(best)
            if area:
                anchors[area][key].append(p['name'])

    zones = {}
    for aud in ['children', 'seniors', 'working', 'sandwich', 'youth']:
        rows = []
        for area, cs in area_stops.items():
            wd = sum(M.volume.get(c, {}).get('wd', 0) for c in cs)
            if aud == 'sandwich':
                n = len(cs & M.SANDWICH_STOPS)
                imp = wd * M.sandwich_share(area)
            else:
                n = sum(len(anchors[area].get(k, [])) for k in AUD_LAYERS[aud])
                imp = wd * M.cohort_share(area, COHORT[aud])
            if n == 0:
                continue
            names = []
            if aud != 'sandwich':
                for k in AUD_LAYERS[aud]:
                    names += anchors[area].get(k, [])
            else:
                # interleave a child anchor with a senior one — the pair IS the story,
                # and three primary schools in a row would hide the senior half of it
                kid, old = [], []
                for k in AUD_LAYERS['children']:
                    kid += anchors[area].get(k, [])
                for k in AUD_LAYERS['seniors']:
                    old += anchors[area].get(k, [])
                for i in range(max(len(kid), len(old))):
                    if i < len(kid):
                        names.append(kid[i])
                    if i < len(old):
                        names.append(old[i])
            rows.append({'area': area, 'places': n, 'stops': len(cs), 'wd': wd,
                         'imp': imp, 'anchors': names[:4]})
        # ranked by places, so the order on the slide matches the number printed on it
        rows.sort(key=lambda r: (-r['places'], -r['imp']))
        window, why, job = DAYPARTS[aud]
        zones[aud] = {'label': AUD_LABEL[aud], 'zones': rows[:5],
                      'daypart': window, 'daypart_why': why, 'daypart_assumption': True,
                      'creative': job}

    # route profiles — which of the five buses over-indexes on which audience,
    # so a creative can be assigned per vehicle rather than per campaign
    profiles = {}
    for r in C1:
        rm = M.measure([r])
        prof = {}
        for aud in ['children', 'seniors', 'working', 'youth']:
            prof[aud] = sum(rm['places'].get(k, 0) for k in AUD_LAYERS[aud])
        prof['sandwich'] = rm['sandwich_stops']
        profiles[r] = {'name': M.net and next(s['name'] for s in M.load('network.json')['services'] if s['n'] == r),
                       'stops': rm['stops'], 'wd': rm['wd'], 'we': rm['we'], 'profile': prof}

    out = {'package': C1_NAME, 'routes': C1, 'totals': {
        'stops': m['stops'], 'wd': m['wd'], 'we': m['we'], 'areas': m['areas'],
        'sandwich_stops': m['sandwich_stops']},
        'zones': zones, 'routes_detail': profiles,
        'region_mix': M.region_mix(C1)}

    w = sys.stdout.write
    w('\n%s — %s\n' % (C1_NAME, ', '.join(C1)))
    w('%d stops · %s weekday · %s weekend · %d planning areas · %d sandwich stops\n'
      % (m['stops'], f"{m['wd']:,}", f"{m['we']:,}", m['areas'], m['sandwich_stops']))

    for aud, z in zones.items():
        w('\n=== %s ===\n' % z['label'].upper())
        w('  daypart (ASSUMPTION): %s — %s\n' % (z['daypart'], z['daypart_why']))
        w('  creative: %s\n' % z['creative'])
        for r in z['zones']:
            w('   %-16s %2d places · %3d stops · %7s wd · %s\n'
              % (r['area'], r['places'], r['stops'], f"{r['wd']:,}",
                 ', '.join(r['anchors'][:3])[:64]))

    w('\n=== route profiles (places by audience) ===\n')
    w('%-6s %-42s %6s %8s  %s\n' % ('route', 'name', 'stops', 'wd', 'child/senior/work/youth/sand'))
    for r, d in profiles.items():
        p = d['profile']
        w('%-6s %-42s %6d %8d  %d / %d / %d / %d / %d\n'
          % (r, d['name'][:42], d['stops'], d['wd'],
             p['children'], p['seniors'], p['working'], p['youth'], p['sandwich']))

    if '--json' in sys.argv:
        path = sys.argv[sys.argv.index('--json') + 1]
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(out, f, indent=1)
        w('\nwrote %s\n' % path)


if __name__ == '__main__':
    main()
