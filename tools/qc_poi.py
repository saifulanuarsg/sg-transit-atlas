#!/usr/bin/env python3
"""Data QC for every data/poi_*.json layer. Run after ANY edit to place data:

    python3 tools/qc_poi.py            # exits 1 if any invariant fails

Invariants:
  1. Every place has a non-empty name.
  2. Every point sits inside generous Singapore bounds.
  3. INTERNAL CONSISTENCY — a place that carries both a point and a footprint must have
     the point inside the footprint, or within TOL metres of it. This is the check that
     catches an entry stitched together from two different campuses (LASALLE McNally
     point + Winstedt footprint) or a stale footprint after a move (SIT Dover → Punggol).
  4. No two places in a layer share BOTH the same name and the same coordinates
     (chains legitimately repeat names; co-located same-name rows are accidental dupes).
Warnings (non-fatal): layers whose real-world population is a small enumerable set are
listed with counts so an implausibly small layer (polyclinics = 8) is visible at a glance.
"""
import json, glob, math, os, sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
SG = (1.14, 1.49, 103.55, 104.15)   # lat0, lat1, lng0, lng1
TOL_M = 150

def dist_m(lat1, lng1, lat2, lng2):
    dx = (lng2 - lng1) * 111320 * math.cos(math.radians((lat1 + lat2) / 2))
    dy = (lat2 - lat1) * 110540
    return math.hypot(dx, dy)

def point_in_ring(lat, lng, ring):
    inside = False
    j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > lat) != (yj > lat) and lng < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside

def point_near_poly(lat, lng, poly, tol):
    for ring in poly:
        if point_in_ring(lat, lng, ring):
            return True
        for x, y in ring:
            if dist_m(lat, lng, y, x) <= tol:
                return True
    return False

def main():
    errs, counts = [], []
    for f in sorted(glob.glob(os.path.join(ROOT, 'data', 'poi_*.json'))):
        base = os.path.basename(f)
        try:
            data = json.load(open(f))
        except Exception as e:
            errs.append(f'{base}: unreadable JSON ({e})'); continue
        counts.append((base, len(data)))
        seen = set()
        for i, p in enumerate(data):
            name = (p.get('name') or '').strip()
            if not name:
                errs.append(f'{base}[{i}]: missing name')
            lat, lng = p.get('lat'), p.get('lng')
            if lat is None or lng is None or not (SG[0] <= lat <= SG[1] and SG[2] <= lng <= SG[3]):
                errs.append(f'{base}[{i}] {name!r}: point out of Singapore bounds ({lat},{lng})')
                continue
            poly = p.get('poly')
            if poly and not point_near_poly(lat, lng, poly, TOL_M):
                r0 = poly[0]
                clng = sum(c[0] for c in r0) / len(r0); clat = sum(c[1] for c in r0) / len(r0)
                errs.append(f'{base}[{i}] {name!r}: point is {dist_m(lat, lng, clat, clng):,.0f} m '
                            f'from its own footprint — two places stitched into one entry?')
            key = (name.lower(), round(lat, 5), round(lng, 5))
            if key in seen:
                errs.append(f'{base}[{i}] {name!r}: exact duplicate (same name AND coordinates)')
            seen.add(key)
    print(f'{len(counts)} layers checked')
    for base, n in counts:
        print(f'  {base:30}{n:>6}')
    if errs:
        print(f'\n{len(errs)} FAILURE(S):')
        for e in errs:
            print('  ✘', e)
        sys.exit(1)
    print('\nall invariants pass')

if __name__ == '__main__':
    main()
