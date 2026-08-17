#!/usr/bin/env python3
"""Score the four Five-route sets for a mindline.sg hotline campaign.

The atlas already ranks routes by places within 400 m of their stops. A campaign
buy needs the next step up: which SET of five best reaches five named audiences.
So this reuses the app's own proximity rule verbatim (index.html routesNearPoi —
point-in-footprint, or within 400 m of a footprint vertex, else 400 m from the
point) and adds the thing the map cannot show: who is actually standing there.

Two evidence types per audience, deliberately kept separate and then blended 50/50:

  PLACES      — is the ad where this audience gathers? Counted from the POI
                layers, deduped per set (a school two routes both pass is one
                school, not two).
  IMPRESSIONS — how many of that audience actually see it? Weekday boardings at
                each stop, weighted by the cohort's share of that stop's planning
                area. Places alone would rank a route past ten quiet schools over
                one past a packed interchange; boardings alone would rank every
                CBD route top and miss the whole brief.

Neither is a headcount and this file does not pretend otherwise — see CAVEATS at
the bottom of the report it writes.

Usage: python3 tools/mindline_eval.py [--json out.json]
"""
import json, math, os, sys, itertools
from collections import defaultdict

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
R_KM = 0.4                      # the atlas's own radius, everywhere
DEG = R_KM / 111.32

def load(name):
    with open(os.path.join(D, name), encoding='utf-8') as f:
        return json.load(f)

# ---------------------------------------------------------------- the four sets
SETS = {
    'Set 1': ['190', '518', '70', '117', '87'],
    'Set 2': ['190', '70', '133', '198', '85'],
    'Set 3': ['972', '143', '5', '76', '31'],
    'Set 4': ['972', '97', '130', '89', '43'],
}

# --------------------------------------------------------- audience definitions
# A layer can serve more than one audience (a mall is youth hang-out and working
# adult footfall); the weight says how strongly it evidences THAT audience.
AUDIENCES = {
    'children': {
        'label': 'Young children (schools)',
        'cohort': 'a0_14',
        'places': {'pri': 1.0, 'studentcare': 0.6, 'spec': 0.5},
    },
    'seniors': {
        'label': 'Seniors',
        'cohort': 'a65p',
        'places': {'eldercare': 1.0, 'polyclinics': 0.8, 'cc': 0.5,
                   'hospitals': 0.4, 'pharmacies': 0.25},
    },
    'working': {
        'label': 'Working adults',
        'cohort': 'a25_64',
        'places': {'interchanges': 1.0, 'malls': 0.5, 'frasers': 0.3, 'events': 0.3},
    },
    'sandwich': {
        'label': 'Sandwich generation (caregiving parents)',
        'cohort': None,          # scored on a co-location rule, see below
        'places': {},
    },
    'youth': {
        'label': 'Youth',
        'cohort': 'a15_24',
        'places': {'sec': 1.0, 'jcmi': 1.0, 'ip': 0.8, 'sis': 0.8, 'uni': 1.0,
                   'poly': 1.0, 'ite': 1.0, 'arts': 0.8, 'pei': 0.4,
                   'libraries': 0.6, 'sport': 0.5, 'cinemas': 0.5},
    },
}
# The sandwich generation has no POI layer of its own — nobody maps "adult with a
# child in school and a parent in a clinic". What is mappable is the CORRIDOR they
# run: a single bus stop with both a child place and a senior place inside 400 m.
# That is the stop where one ad reaches both errands, and it is the sharpest thing
# in this whole file — it cannot be faked by a route that is merely long.
SANDWICH_CHILD = ['pri', 'studentcare', 'spec']
SANDWICH_SENIOR = ['eldercare', 'polyclinics', 'cc', 'hospitals']

LAYERS = sorted({k for a in AUDIENCES.values() for k in a['places']}
                | set(SANDWICH_CHILD) | set(SANDWICH_SENIOR)
                | {'supermarkets', 'ite', 'libraries'})

# ------------------------------------------------------------------ data + index
stops = load('stops.json')                 # code -> [lng, lat, name, road]
route_stops = load('route_stops.json')     # svc -> [[code, ...], ...] per direction
volume = load('stop_volume.json')          # code -> {wd, we}
stop_area = load('stop_area.json')         # code -> planning area name
net = load('network.json')
areas = {f['properties']['name']: f['properties']
         for f in load('planning_areas.geojson')['features']}
trunk = {s['n'] for s in net['services'] if not s['feeder']}

def route_stop_codes(svc):
    return {c for d in route_stops.get(svc, []) for c in d}

# grid index over every stop served by a trunk route — mirrors buildStopIndex()
CELL = 0.005
grid = defaultdict(list)
stop_routes = defaultdict(set)
for svc in route_stops:
    if svc not in trunk:
        continue
    for c in route_stop_codes(svc):
        stop_routes[c].add(svc)
for c in stop_routes:
    st = stops.get(c)
    if not st:
        continue
    grid[(int(math.floor(st[0] / CELL)), int(math.floor(st[1] / CELL)))].append((st[0], st[1], c))

def pip(pt, ring):
    x, y = pt
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i][0], ring[i][1]
        xj, yj = ring[j][0], ring[j][1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside

def stops_near(p):
    """Stop codes within 400 m of a POI — the app's rule, footprint-aware."""
    hits = set()
    poly = p.get('poly')
    if poly:
        xs = [v[0] for r in poly for v in r]
        ys = [v[1] for r in poly for v in r]
        x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
        for cx in range(int(math.floor((x0 - DEG) / CELL)), int(math.floor((x1 + DEG) / CELL)) + 1):
            for cy in range(int(math.floor((y0 - DEG) / CELL)), int(math.floor((y1 + DEG) / CELL)) + 1):
                for sx, sy, c in grid.get((cx, cy), ()):
                    hit = (x0 <= sx <= x1 and y0 <= sy <= y1
                           and any(pip((sx, sy), r) for r in poly))
                    if not hit:
                        k = math.cos(sy * 0.01745)
                        for r in poly:
                            for vx, vy in r:
                                if ((vx - sx) * k) ** 2 + (vy - sy) ** 2 < DEG * DEG:
                                    hit = True
                                    break
                            if hit:
                                break
                    if hit:
                        hits.add(c)
    else:
        cx, cy = int(math.floor(p['lng'] / CELL)), int(math.floor(p['lat'] / CELL))
        k = math.cos(p['lat'] * 0.01745)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for sx, sy, c in grid.get((cx + dx, cy + dy), ()):
                    if ((p['lng'] - sx) * k) ** 2 + (p['lat'] - sy) ** 2 < DEG * DEG:
                        hits.add(c)
    return hits

# poi_routes[layer] = list of (name, {routes near it}); stop_layers[code] = {layers}
poi_routes = {}
stop_layers = defaultdict(set)
for key in LAYERS:
    path = os.path.join(D, 'poi_%s.json' % key)
    if not os.path.exists(path):
        continue
    entries = []
    for p in load('poi_%s.json' % key):
        near = stops_near(p)
        for c in near:
            stop_layers[c].add(key)
        entries.append((p['name'], {r for c in near for r in stop_routes[c]}))
    poi_routes[key] = entries

SANDWICH_STOPS = {c for c, ls in stop_layers.items()
                  if ls & set(SANDWICH_CHILD) and ls & set(SANDWICH_SENIOR)}

# --------------------------------------------------------------------- measuring
def cohort_share(area_name, cohort):
    a = areas.get(area_name)
    if not a or not a.get('population'):
        return 0.0
    return a.get(cohort, 0) / a['population']

def sandwich_share(area_name):
    """Harmonic mean of the child and senior shares — high only when an area has
    BOTH, which is exactly the household the campaign is describing."""
    a = areas.get(area_name)
    if not a or not a.get('population'):
        return 0.0
    sf, ss = a.get('a0_14', 0) / a['population'], a.get('a65p', 0) / a['population']
    return 0.0 if sf + ss == 0 else 2 * sf * ss / (sf + ss)

def region_mix(routes):
    """Share of a set's weekday boardings falling in each of the five regions."""
    codes = set()
    for r in routes:
        codes |= route_stop_codes(r)
    regs = defaultdict(int)
    for c in codes:
        a = areas.get(stop_area.get(c, ''))
        if a:
            regs[a['region']] += volume.get(c, {}).get('wd', 0)
    tot = sum(regs.values()) or 1
    return {k: v / tot for k, v in regs.items()}

def measure(routes):
    codes = set()
    for r in routes:
        codes |= route_stop_codes(r)
    codes = {c for c in codes if c in stops}
    wd = sum(volume.get(c, {}).get('wd', 0) for c in codes)
    we = sum(volume.get(c, {}).get('we', 0) for c in codes)
    rset = set(routes)

    places = {k: sum(1 for _, rs in v if rs & rset) for k, v in poi_routes.items()}
    imp = {}
    for coh in ('a0_14', 'a15_24', 'a25_64', 'a65p'):
        imp[coh] = sum(volume.get(c, {}).get('wd', 0) * cohort_share(stop_area.get(c, ''), coh)
                       for c in codes)
    imp['sandwich'] = sum(volume.get(c, {}).get('wd', 0) * sandwich_share(stop_area.get(c, ''))
                          for c in codes)

    sand_stops = codes & SANDWICH_STOPS
    # duplication: stops served by more than one route in the set are paid for twice
    dup = sum(1 for c in codes if len(stop_routes[c] & rset) > 1)
    return {
        'routes': list(routes), 'stops': len(codes), 'wd': wd, 'we': we,
        'areas': len({stop_area[c] for c in codes if c in stop_area}),
        'places': places, 'imp': imp,
        'sandwich_stops': len(sand_stops),
        'sandwich_stop_wd': sum(volume.get(c, {}).get('wd', 0) for c in sand_stops),
        'dup_stops': dup,
        'imh': any('INSTITUTE OF MENTAL HEALTH' in n and rs & rset
                   for n, rs in poi_routes.get('hospitals', [])),
    }

def place_score(m, weights):
    return sum(m['places'].get(k, 0) * w for k, w in weights.items())

def raw_scores(m):
    """Per-audience (places, impressions) before any cross-set normalising."""
    out = {}
    for key, a in AUDIENCES.items():
        if key == 'sandwich':
            out[key] = (m['sandwich_stops'], m['imp']['sandwich'])
        else:
            out[key] = (place_score(m, a['places']), m['imp'][a['cohort']])
    return out

def index_sets(measured):
    """Normalise each component to the best set = 100, blend 50/50, average."""
    raws = {n: raw_scores(m) for n, m in measured.items()}
    idx = defaultdict(dict)
    for key in AUDIENCES:
        pmax = max(r[key][0] for r in raws.values()) or 1
        imax = max(r[key][1] for r in raws.values()) or 1
        for n, r in raws.items():
            idx[n][key] = 50 * r[key][0] / pmax + 50 * r[key][1] / imax
    for n in idx:
        idx[n]['OVERALL'] = sum(idx[n][k] for k in AUDIENCES) / len(AUDIENCES)
    return raws, idx

# ------------------------------------------------------------------- the search
def combo_score(routes, ref):
    """Score an arbitrary 5 against the same yardstick the four sets were indexed
    on, so 'better than Set 3' means the same thing for a built set as a bought one."""
    m = measure(routes)
    r = raw_scores(m)
    tot = 0
    for key in AUDIENCES:
        pmax, imax = ref[key]
        tot += (50 * r[key][0] / (pmax or 1) + 50 * r[key][1] / (imax or 1))
    return tot / len(AUDIENCES), m

def main():
    measured = {n: measure(rs) for n, rs in SETS.items()}
    raws, idx = index_sets(measured)
    ref = {k: (max(r[k][0] for r in raws.values()), max(r[k][1] for r in raws.values()))
           for k in AUDIENCES}

    per_route = {}
    for r in sorted({x for v in SETS.values() for x in v}, key=lambda s: (len(s), s)):
        sc, m = combo_score([r], ref)
        per_route[r] = {'score': sc, 'm': m}

    # exhaustive over the 20 routes the four sets already contain — 15,504 combos,
    # so the answer to "could these same buses be arranged better" is proved, not guessed
    pool = sorted({x for v in SETS.values() for x in v})
    best = []
    for combo in itertools.combinations(pool, 5):
        sc, m = combo_score(list(combo), ref)
        best.append((sc, combo, m))
    best.sort(key=lambda t: -t[0])

    # greedy over every trunk route — what the campaign could look like unconstrained
    chosen, greedy_trace = [], []
    cands = sorted(trunk)
    for _ in range(5):
        pick = max(((combo_score(chosen + [c], ref)[0], c) for c in cands if c not in chosen))
        chosen.append(pick[1])
        greedy_trace.append((pick[1], pick[0]))

    out = {'sets': measured, 'index': dict(idx), 'per_route': {k: v['score'] for k, v in per_route.items()},
           'best_in_pool': [{'score': s, 'routes': list(c)} for s, c, _ in best[:10]],
           'greedy_network': [{'route': r, 'running_score': s} for r, s in greedy_trace]}

    w = sys.stdout.write
    w('\n=== FOUR SETS · audience index (best set in each column = 100) ===\n')
    cols = list(AUDIENCES)
    w('%-8s %8s %8s %8s %8s %8s | %8s\n' % ('set', *[c[:8] for c in cols], 'OVERALL'))
    for n in SETS:
        w('%-8s %8.1f %8.1f %8.1f %8.1f %8.1f | %8.1f\n'
          % (n, *[idx[n][c] for c in cols], idx[n]['OVERALL']))

    w('\n=== raw evidence ===\n')
    w('%-8s %6s %9s %9s %6s %7s %8s %6s\n'
      % ('set', 'stops', 'wd board', 'we board', 'areas', 'sandw.', 'sandw.wd', 'dup'))
    for n, m in measured.items():
        w('%-8s %6d %9d %9d %6d %7d %8d %6d\n'
          % (n, m['stops'], m['wd'], m['we'], m['areas'], m['sandwich_stops'],
             m['sandwich_stop_wd'], m['dup_stops']))

    w('\n=== places within 400 m ===\n')
    keys = [k for k in LAYERS if k in poi_routes]
    w('%-14s %s\n' % ('layer', ''.join('%8s' % n for n in SETS)))
    for k in keys:
        w('%-14s %s\n' % (k, ''.join('%8d' % measured[n]['places'].get(k, 0) for n in SETS)))
    w('%-14s %s\n' % ('IMH on route', ''.join('%8s' % ('yes' if measured[n]['imh'] else '—') for n in SETS)))

    w('\n=== per-route standalone score (same yardstick) ===\n')
    for r, v in sorted(per_route.items(), key=lambda kv: -kv[1]['score']):
        inset = [n for n, rs in SETS.items() if r in rs]
        w('%-6s %6.1f   stops %3d  wd %6d  sandwich %2d   %s\n'
          % (r, v['score'], v['m']['stops'], v['m']['wd'], v['m']['sandwich_stops'],
             '/'.join(inset)))

    w('\n=== best 5 buildable from the same 20 routes (exhaustive, 15,504 combos) ===\n')
    for s, c, m in best[:8]:
        w('%6.1f  %-28s stops %3d  wd %6d  sandwich %2d\n'
          % (s, ', '.join(c), m['stops'], m['wd'], m['sandwich_stops']))

    w('\n=== greedy build across all 293 trunk routes ===\n')
    for r, s in greedy_trace:
        w('  + %-6s -> %6.1f\n' % (r, s))

    # ---- regional balance. A national hotline that never appears north of the PIE
    # is not a national campaign, however well it scores. The audience model is
    # blind to this: it counts seniors, not where they live, so a set can top every
    # column and still leave Woodlands, Sembawang and Yishun with nothing.
    w('\n=== regional balance (share of weekday boardings) ===\n')
    regions = ['Central Region', 'East Region', 'North Region',
               'North-East Region', 'West Region']
    w('%-12s %s\n' % ('set', ''.join('%12s' % r.replace(' Region', '') for r in regions)))
    for n, rs in list(SETS.items()) + [('best-in-pool', list(best[0][1]))]:
        mix = region_mix(rs)
        w('%-12s %s\n' % (n, ''.join('%11.1f%%' % (100 * mix.get(r, 0)) for r in regions)))

    north_routes = [r for r in pool if region_mix([r]).get('North Region', 0) > 0.1]
    w('  routes in the 20-route pool that reach the North: %s\n'
      % (', '.join(north_routes) or 'none'))
    con = [(s, c, m) for s, c, m in best if set(c) & set(north_routes)]
    w('\n=== best 5 that keeps a North presence (>=1 northern route) ===\n')
    for s, c, m in con[:5]:
        mix = region_mix(list(c))
        w('%6.1f  %-28s North %4.1f%%  stops %3d  sandwich %2d\n'
          % (s, ', '.join(c), 100 * mix.get('North Region', 0), m['stops'], m['sandwich_stops']))

    # ---- sensitivity: does the ranking survive different, defensible weightings?
    # Two sets landing half a point apart is not a result, it is a coin toss dressed
    # as one. So re-run under blends and audience priorities a reasonable person
    # could have picked instead, and report whether the order holds.
    w('\n=== sensitivity — does the winner survive a different weighting? ===\n')
    scen = [
        ('equal 50/50 places+impressions', 0.5, {k: 1 for k in AUDIENCES}),
        ('places-led (70/30)', 0.7, {k: 1 for k in AUDIENCES}),
        ('impressions-led (30/70)', 0.3, {k: 1 for k in AUDIENCES}),
        ('need-weighted (seniors+sandwich x2)', 0.5,
         {'children': 1, 'seniors': 2, 'working': 1, 'sandwich': 2, 'youth': 1}),
        ('youth+children x2 (early intervention)', 0.5,
         {'children': 2, 'seniors': 1, 'working': 1, 'sandwich': 1, 'youth': 2}),
        ('working adults x2 (daytime volume)', 0.5,
         {'children': 1, 'seniors': 1, 'working': 2, 'sandwich': 1, 'youth': 1}),
    ]
    w('%-40s %s\n' % ('scenario', ''.join('%9s' % n for n in SETS) + '   winner'))
    flips = set()
    for name, pw, aw in scen:
        tot = {}
        for n in SETS:
            s = wsum = 0
            for k in AUDIENCES:
                pmax, imax = ref[k]
                v = 100 * pw * raws[n][k][0] / (pmax or 1) + 100 * (1 - pw) * raws[n][k][1] / (imax or 1)
                s += v * aw[k]
                wsum += aw[k]
            tot[n] = s / wsum
        win = max(tot, key=tot.get)
        flips.add(win)
        w('%-40s %s   %s\n' % (name, ''.join('%9.1f' % tot[n] for n in SETS), win))
    w('  -> winner across all %d scenarios: %s\n'
      % (len(scen), ', '.join(sorted(flips)) if len(flips) > 1 else sorted(flips)[0] + ' (stable)'))

    # ---- efficiency: the score is monotone in coverage, so a longer route always
    # scores higher. Per-stop normalising says which set works hardest per asset.
    w('\n=== efficiency (score is coverage-monotone — normalise before comparing lengths) ===\n')
    w('%-8s %9s %11s %13s %11s\n'
      % ('set', 'overall', 'per 100 stops', 'sandwich/stop', 'dup waste'))
    for n, m in measured.items():
        w('%-8s %9.1f %11.1f %13.3f %10.1f%%\n'
          % (n, idx[n]['OVERALL'], 100 * idx[n]['OVERALL'] / m['stops'],
             m['sandwich_stops'] / m['stops'], 100 * m['dup_stops'] / m['stops']))

    if '--json' in sys.argv:
        path = sys.argv[sys.argv.index('--json') + 1]
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(out, f, indent=1)
        w('\nwrote %s\n' % path)

if __name__ == '__main__':
    main()
