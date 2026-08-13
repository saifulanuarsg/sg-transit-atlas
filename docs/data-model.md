# Data model — read this instead of exploring

Every file in `data/`, its exact shape, its join keys and its gotchas. This exists so a
session can answer "what shape is this?" without opening 48 JSON files. **If you change a
data file's shape, change this doc in the same commit** — a stale reference is worse than
none.

Counts below are as of `main` @ `5fae5e3`; treat them as orders of magnitude, not asserts.

## Conventions that apply everywhere

- **Coordinates are `[lng, lat]`** in every raw file (GeoJSON order). Leaflet wants
  `[lat, lng]` — `index.html` flips with `toLL = seg => seg.map(p => [p[1], p[0]])`.
  Except: POI rows, which use named `lng` / `lat` fields, so no flip and no ambiguity.
- **Bus stop codes are 5-char strings, and stay strings** (`"01012"` — leading zeros are
  real). Never `parseInt` them; never use them as numeric keys.
- **Service numbers are strings too** (`"2"`, `"972"`, `"NR7"`).
- No build step. Files are fetched at runtime with `cache:'no-cache'`, so an edited file is
  live on the next reload.

## Load order and where it lands

`index.html:893-917` fetches nine core files plus every POI layer in one `Promise.all`,
then hangs everything off the single global `S`:

| Global | Source | Shape |
| --- | --- | --- |
| `S.svcs` | `network.json` → `services`, keyed by `s.n` | `{ "2": service }` |
| `S.stops` | `stops.json` | `{ code: [lng, lat, name, road] }` |
| `S.stations` | `rail_stations.json` | array |
| `S.railLines` | `rail_lines.json` | array |
| `S.areas` | `planning_areas.geojson` | FeatureCollection |
| `S.areaProps` | derived — `areas.features` keyed by `properties.name` | `{ "Bedok": props }` |
| `S.baseline` | `areas.meta.baseline` | `{ family, youth, senior, affluent, transit, car }` |
| `S.stopArea` | `stop_area.json` | `{ code: "Planning Area" }` |
| `S.stopVol` | `stop_volume.json` | `{ code: {wd, we} }` |
| `S.context` | `context_indices.json` | object |
| `S.qcReport` | `qc_report.json` | object |
| `S.pois[key]` | each `POI[].file` | array of places |
| `S.routeStops` | `route_stops.json` — **lazy**, `loadRouteStops()` at `index.html:2329` | `{ svc: [dir0, dir1?] }` |

`route_stops.json` (220 KB) is deliberately *not* in the initial load; it is fetched once,
on demand, the first time a stop drill-down is opened.

`FEATURES.demographics` flips true only if `planning_areas.geojson` loaded — every
demographic/choropleth code path is gated on it.

## The bus network

### `network.json` (932 KB) — geometry + roster for all 612 services

```jsonc
{
  "meta": { "feeder_rule": "span<6km bbox-diagonal", "gap_km": 2.5,
            "aligned": 612, "fallback": 0, "trunk": 293, "feeder": 319, "total": 612 },
  "services": [{
    "n":       "2",                        // service number — the key everywhere else
    "name":    "Changi Village Ter ⇄ Kampong Bahru Ter",   // split on ⇄ ⟲ → for termini
    "feeder":  false,                      // true ⇒ NOT drawn as a layer, still selectable
    "span":    21.3,                       // bbox diagonal, km — what feeder is derived from
    "sc":      130,                        // stop count
    "aligned": true,                       // road-aligned geometry (vs chord fallback)
    "segs":    [[[lng, lat], ...], ...],   // polylines, [lng,lat] order
    "jumps":   [],                         // chord-fallback express legs; currently 0 services use it
    "stops":   ["01012", "01019", ...]     // unordered set of codes; order lives in route_stops.json
  }]
}
```

Gotchas:
- `293 trunk / 319 feeder`. `buildBus()` (`index.html:934`) skips feeders entirely — they
  have no Leaflet layer, so anything that walks `groups.trunk` sees only 293 routes.
- `jumps` is empty across the whole file today. The rendering branch at `index.html:946`
  is dead-but-kept for when unaligned geometry reappears; don't delete it, don't assume
  it fires.
- `s.stops` is a *set* for reach maths. For ordered, per-direction stops use
  `route_stops.json`. They agree on membership, not on order.

### `route_stops.json` (220 KB, lazy) — ordered stops per direction

```jsonc
{ "10": [["75009","76059", ...], ["...74 codes..."]] }   // 612 keys
```

One array per direction. **408 of 612 services have a single direction** (loops and
one-way feeders) — always length-check before touching `[1]`.

### `stops.json` (336 KB) — 5,207 stops

```jsonc
{ "10009": [103.81722, 1.2821, "Bt Merah Int", "Bt Merah Ctrl"] }
//           lng         lat     name            road
```

Positional, not named. `st[2]` is the stop name, `st[3]` the road (may be absent — export
code falls back to `'—'`).

### `stop_volume.json` (172 KB) — 5,198 stops

```jsonc
{ "76551": { "wd": 2440, "we": 2200 } }   // daily tap-ins, weekday / weekend
```

`we` can be missing; `selAgg()` falls back to `wd`. This is the *only* impressions input —
`impressions(segment) = Σ volume(stop) × segment_share(stop's planning area)`.

### `stop_area.json` (104 KB) — 5,184 stops

```jsonc
{ "10009": "Bukit Merah" }   // code → planning-area name, joins to areaProps
```

**The three stop-keyed files do not cover the same 5,207 stops** (5,207 / 5,198 / 5,184).
Every consumer guards with `if(!st) return` / `if(v)`. Keep doing that.

## Rail

### `rail_stations.json` — 182 stations

```jsonc
{ "name": "Admiralty", "lng": …, "lat": …, "kind": "MRT", "lines": ["NSL"] }
```

`kind` ∈ `MRT | LRT`. `lines` codes ∈ `NSL NEL EWL CCL DTL TEL SKLRT JRL`, matching
`RAIL_NAME` (`index.html:883`) and `rail_lines.json[].code`. Interchanges in
`poi_interchanges.json` are *derived from this file* (stations on 2+ drawn lines), so the
POI layer and the rail legend can never disagree — regenerate both together.

### `rail_lines.json` — 8 lines

```jsonc
{ "name": "MRT East-West Line", "code": "EWL", "color": "#009645",
  "segs": [[[lng, lat], ...], ...] }
```

`color` is the official line colour and is used verbatim in the legend and export.

## Places (POI layers)

**34 layers**, declared in the `POI` registry at `index.html:843-878`. The registry is the
source of truth for what is drawn; a file in `data/` that isn't in `POI` is not a layer.

```js
{ key:'malls', label:'Shopping malls', color:'#db2777',
  file:'data/poi_malls.json', cat:'retail',
  approxM:130,                                   // optional: draw a radius when no footprint
  letter:'M', letterFg:'#1a1a1a', mcd:true }     // brand layers only (McD/KFC/BK/Jollibee)
```

`cat` ∈ `transit edu retail health civic life` (`POI_CATS`, `index.html:831`) — these are
the five collapsible panel headers. `mcd:true` moves a layer out of the place picker and
into the McDonald's competitive-density section.

Row shape — **`name`, `lng`, `lat` are universal; the rest are optional**:

```jsonc
{ "name": "Nanyang Technological University",
  "kind": "University",              // optional free-text subtitle, shown in the tooltip
  "lng": …, "lat": …,
  "poly": [[[lng, lat], ...]],       // optional footprint, ring-of-rings ([lng,lat] order)
  "approxM": 130 }                   // optional per-place radius; beats the layer default
```

`poiLayer()` (`index.html:958`) draws `poly` if present, else a circle of `approxM`, else a
dot. Reach counting (`near()` / `nearMask()`, `index.html:1889`) measures to the **footprint**
for area places and to the point otherwise — so adding a `poly` changes ranking, not just
rendering.

Which files carry `poly`: `poi_ihl`, `poi_uni`, `poi_poly`, `poi_ite`, `poi_pri`, `poi_sec`,
`poi_sis`, `poi_spec`, `poi_schools`.

### Two `poi_*.json` files are NOT layers

`data/` holds 36 `poi_*.json` files but the registry declares 34. The two that are never
drawn:

- **`poi_schools.json`** — MOE's full 337-school registry, **decomposed** into the six drawn
  education layers (`pri` 182, `sec` 128, `jcmi` 11, `ip` 8, `sis` 4, `spec` 4). Edit the
  registry and the splits together or `qc_poi.py` and the map will disagree.
- **`poi_ihl.json`** — the 17 institutes of higher learning, superseded by the `uni` / `poly`
  / `ite` / `arts` split (commit `9918154`). Still QC'd, still not rendered.

### Editing any `poi_*.json`

Run `python3 tools/qc_poi.py`. It exits 1 on: empty names, points outside
`lat 1.14–1.49 / lng 103.55–104.15`, a point more than **150 m** from its own `poly`
(the check that catches an entry stitched from two campuses, or a footprint left behind
after a campus move), exact duplicates (same name **and** same rounded coords — chains
legitimately repeat names), and layers falling under the `EXPECT_MIN` real-world floors
(`tools/qc_poi.py:29`). A passing run rewrites `data/qc_report.json`, which the app renders
as its data-health line — so **never hand-edit `qc_report.json`**.

## Areas & demographics

### `planning_areas.geojson` (108 KB) — 55 planning areas

```jsonc
{ "type": "FeatureCollection",
  "meta": { "baseline": { "family":…, "youth":…, "senior":…, "affluent":…, "transit":…, "car":… },
            "pop_year":…, "income_year":…, "volume_month": "2026-06", "source": …, /* + provenance strings */ },
  "features": [{ "geometry": { "type": "MultiPolygon", … }, "properties": { … } }] }
```

Geometry is **MultiPolygon** for every feature — no bare `Polygon` fast path.

`properties`, joined to stops via `stop_area.json` → `properties.name`:

| Field | Meaning |
| --- | --- |
| `name`, `region` | e.g. `"Bedok"`, `"East Region"` |
| `area_km2`, `population`, `density` | |
| `a0_14`, `a15_24`, `a25_64`, `a65p` | population by age band |
| `share_family`, `share_youth`, `share_senior`, `share_affluent` | 0–1 shares — the `SEG` props (`index.html:919`) |
| `income_median` | SGD/month |
| `daytime_pop` | employed persons working in the area |
| `transit_share`, `bus_share`, `car_share` | mode shares, 0–1 |
| `mover_vol`, `mover_price` | HDB resale volume / median price |
| `mop_recent`, `mop_soon`, `mop_all` | flats reaching MOP — the property heatmap |
| `mkt_seg` | `CCR` / `RCR` / `OCR` |
| `priv_vol`, `priv_val` | private transactions volume / median value |

`meta.baseline` is the national reference each share is indexed against — it is what makes
a choropleth read as "above/below national", so don't recompute it per-render.

### `hdb_movers.json` — the mover source, keyed by HDB town

```jsonc
{ "window": "2025-08..2026-07", "source": "HDB resale (data.gov.sg)",
  "towns": { "ANG MO KIO": { "pa": "Ang Mo Kio", "volume": …, "median_price": … } } }
```

26 towns. `pa` is the bridge — **HDB town names are SCREAMING CASE and do not equal
planning-area names**; always join through `pa`, never by upcasing. Already folded into
`mover_vol` / `mover_price`; the app doesn't fetch this file.

### `context_indices.json` — national context strip

```jsonc
{ "note": "National context — not route", "source": "data.gov.sg …",
  "indices": [{ "key":"mobile_pen", "label":…, "value":…, "unit":"%",
                "as_of":"2019-05", "source":…, "read":"Above 150% — …" }] }
```

Every index carries its own `as_of` and `source`; the UI prints them. Adding an index with
a blank `read` ships an unexplained number.

### `qc_report.json` — generated, never hand-written

```jsonc
{ "verified_on": "2026-08-06", "layers": 36, "places": 5864, "checks": [ … ] }
```

`layers: 36` is *files checked* (`data/poi_*.json`), not layers drawn — it counts
`poi_schools.json` and `poi_ihl.json`, which the map does not render. `qc_poi.py` rewrites
`verified_on` even when nothing changed, so if you ran it only to look, revert the file
instead of committing a bare date bump.

## Quick recipes

```js
// impressions for a set of routes
const codes = new Set(); routes.forEach(n => S.svcs[n].stops.forEach(c => codes.add(c)));
let wd = 0; codes.forEach(c => { const v = S.stopVol[c]; if (v) wd += v.wd; });

// segment-weighted impressions (the SEG model)
codes.forEach(c => { const a = S.stopArea[c], p = a && S.areaProps[a], v = S.stopVol[c];
  if (p && v) segImp += v.wd * p[seg.prop]; });

// every trunk service
Object.values(S.svcs).filter(s => !s.feeder);

// a stop's position, Leaflet order
const st = S.stops[code]; const latlng = [st[1], st[0]];

// ordered stops, both directions
await loadRouteStops(); const dirs = S.routeStops[n];   // length 1 or 2
```

## Regeneration

There is no build script in this repo. `data/` is baked externally and committed;
`tools/qc_poi.py` is the only in-repo data tool and it *checks* rather than *builds*.
Treat every file above as hand-maintained + QC-gated.
