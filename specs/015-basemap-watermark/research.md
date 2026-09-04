# Phase 0 — Research

**Feature**: 015-basemap-watermark · **Date**: 2026-09-01

## R1 — Where does the watermark come from?

**Decision**: It is CARTO's, burnt into the tile images, and no client-side change can remove
it from a tile once requested. The only two ways to stop showing it are to send a valid key or
to stop requesting the tiles.

**Rationale**: `index.html:760` holds `const BASEMAP_KEY=''`. `index.html:761–764` builds the
tile URL and appends `?api_key=` only when the constant is non-empty, so today every tile is
fetched unkeyed and CARTO returns it stamped `API KEY REQUIRED · carto.com/basemaps/apikey`.
`docs/basemap.md` recorded this on 2026-08-27 and named the fix; the key was never set.
The watermark is in the raster, so CSS, filters and overlays cannot touch it.

**Alternatives considered**: masking the stamp with an opaque overlay — rejected: it repeats
per tile at every zoom, it would cover map content, and painting over another party's licence
notice is not something to ship.

## R2 — Can this be fixed the documented way, by setting a key?

**Decision**: Not in this change. No CARTO key exists, and one cannot be obtained from here —
it needs an account signup on carto.com. The key path stays fully open and is the intended end
state; this feature makes the product presentable while there is no key.

**Rationale**: The owner can paste a key into `index.html:760` at any time and get the detailed
basemap back with zero visual change. Nothing in this feature makes that harder — it makes it a
one-line switch that needs no other edit (FR-008).

**Alternatives considered**: blocking the beta until a key is procured — rejected: the beta is
already blocked, and the product would still have no acceptable appearance the next time the
key expires, hits quota, or the host has an outage.

## R3 — Which keyless basemap?

**Decision**: Draw Singapore's landmass from `data/planning_areas.geojson`, which the app
already fetches on every load (`index.html:862`). No third-party host, no new file, no new
fetch, no new dependency.

**Rationale**: `docs/basemap.md` already assessed the external keyless options and rejected
every one — OSM standard (tile policy forbids commercial use, and full colour fights sixteen
route colours), Esri light-gray (access tokens, native tiles stop at z16 while this map drills
to individual stops), OpenFreeMap (vector — means MapLibre and a rewrite of the canvas export),
Stadia/Geoapify/MapTiler/Thunderforest (all need a key anyway). That assessment stands and this
feature does not reopen it. What it missed is that the atlas is not obliged to fetch a basemap
from anyone: it already ships Singapore's geometry.

Checked against the file: 55 planning areas, `MultiPolygon`, summing to 784.5 km² against
Singapore's ~735 km² of land, bbox 103.606–104.088 E / 1.159–1.471 N. That is the land
silhouette plus a thin marine margin on reclaimed edges — correct as ground, and it is URA
Master Plan 2019 data the atlas already cites in its own sources list.

**Alternatives considered**:
- *A blank/flat ground with no land at all* — rejected: no coastline means no orientation, and
  Singapore's shape is most of what makes the map readable at island zoom.
- *Vendoring a tile pyramid or a `.pmtiles` extract into the repository* — rejected: megabytes
  of binary in a repo whose whole premise is one hand-editable HTML file, and Principle II bars
  new build steps and vendored assets.
- *Reusing the existing `S._areaLayer`* — rejected: that layer is the choropleth, and
  `paintChoro` rewrites its style on every shading change (`index.html:1450–1465`). Ground
  drawn on it would be erased the first time a user shaded a segment. The ground needs its own
  layer in its own pane.

## R4 — What is lost, and is the trade right?

**Decision**: Street geometry is lost while running on the fallback. Accept it.

**Rationale**: The atlas draws its own bus network, rail lines, stops, interchanges, places and
planning-area shading over the basemap; those carry the sales argument. Streets are context. A
clean island with no street names is a better thing to put in front of a tester — and in front
of a client — than a detailed island stamped `API KEY REQUIRED` roughly thirty times across the
viewport. The moment a key is set, the streets return.

Named honestly rather than buried: at street zoom the fallback has nothing to show but ground,
so a seller drilling into one stop's surroundings sees less than they do today. That is the
cost, and it is why this is a fallback and not a replacement.

## R4a — A coastline is not a map (FR-002a)

**Decision**: Draw all 612 services' road-aligned geometry from `data/network.json` as a
hairline underlay, beneath everything else, as part of the same ground.

**Rationale**: The first build shipped the coastline alone and was reviewed as *"I still need a
map"* — correctly. An outline tells you the shape of Singapore and nothing else: you cannot find
Orchard, tell a reservoir from a town centre, or place a stop in its surroundings. For a tool a
seller opens in front of a client, that is not a basemap.

The network file already holds what is needed. Checked against it: 612 services, **every one
`aligned: true`**, 33,025 polyline points in total — these follow real roads, not straight-line
chords between stops. Feeders are included deliberately: they are the residential streets the
trunk services skip, and they are what fills in the estates. Drawn faint and thin, they give the
street structure the tiles would have, from a file already fetched on every load.

**Honest about what it is not**: road *centrelines* only — no buildings, no street names, no
minor road the bus network never touches. It is a street skeleton, not Positron.

**Alternatives considered**:
- *Rail lines and stops only* — rejected: far too sparse to orient by.
- *Reusing the existing trunk-services layer* — rejected: that layer is a user-facing toggle
  with its own styling, hover and click behaviour, off by default and covering only the 293
  trunks. The ground must be always-on, non-interactive, and include feeders.

## R4b — One stroke width does not work (FR-002b)

**Decision**: Scale road weight with zoom — .7 px at z≤11 up to 3.6 px at z≥17 — restyled on
`zoomend`, and only when the band actually changes.

**Rationale**: Measured on screenshots. At a single 1 px the island view is a legible mesh but
z16 is nearly invisible; at a single 2.6 px z16 reads well but the island view becomes a smear
that swallows the route colours. Banding by zoom is the same technique `gateLabels` already uses
for hub and station labels. Guarding on the previous width keeps a pan from restyling 612
polylines for no reason.

## R5 — Detecting a key that is set but not working (FR-006)

**Decision**: Fall back on Leaflet's `tileerror`. Draw the land silhouette permanently
underneath the tile layer so the fallback is already on screen when tiles fail.

**Rationale**: Keeping the ground underneath at all times means there is no failure path that
shows an empty grey void, and no flash between states — an opaque tile simply covers it. This
covers an unreachable host, a blocked network, and a key that is revoked, expired, or over
quota, all of which answer with an HTTP error.

**Limit, stated plainly**: a host that answers `200 OK` with a *watermarked* image — which is
exactly what CARTO does for an unkeyed request — is indistinguishable from a working tile
without sampling pixels, so `tileerror` cannot catch it.

> **CORRECTION, 2026-09-04.** The paragraph below dismissed this case, and the dismissal was
> wrong. A key was set on 2026-09-04; CARTO rejected it and answered every tile with 200 and a
> stamped image. `tileerror` never fired, the fallback never engaged, and the live site went
> straight back to `API KEY REQUIRED` across the map — FR-006's exact failure, shipped to beta
> testers. Two things in the reasoning were wrong: this is not an edge case (it is what CARTO
> does for *any* key it does not accept, which includes the expiry and quota cases FR-006 names),
> and "the owner can see and fix it" assumed someone was watching the deploy. Nobody was.
>
> It is now detected: one probe of a single open-ocean tile at load, where a genuine Positron
> tile is flat water and a stamped one is not. One request, off the render loop, only when a key
> is set — not the per-tile readback dismissed below. FR-006 is now met as originally written. This does not weaken the fix for the
reported bug: the no-key case never reaches the network at all, because the tile layer is not
created. It means only that a *malformed* key which CARTO chooses to answer with watermarked
tiles rather than a 401 would still show the watermark. Pixel-sampling every tile to detect it
was considered and rejected as disproportionate — it adds a per-tile readback to the render
loop to guard a case the owner can see and fix in one edit.

**Alternatives considered**: a preflight `fetch` of one tile to validate the key before adding
the layer — rejected: same blindness to a 200-with-watermark, plus it delays first paint and
adds a request that can itself be blocked.

## R6 — Export

**Decision**: No structural change to the export pipeline. Guard `tilesReady()` so it resolves
immediately when there is no tile layer.

**Rationale**: `captureFramed` (`index.html:2776`) snapshots the live `#map` element with
html2canvas, so whatever is on screen is what is exported — the land silhouette included, since
it is drawn by the same canvas renderer the selection and choropleth already use for exactly
this reason (`index.html:785–787`). Removing the cross-origin tile layer can only make canvas
capture *safer*: the tainted-canvas risk `docs/basemap.md` warns about is a cross-origin image
risk, and in fallback mode there is no cross-origin image.

`tilesReady()` (`index.html:2768`) awaits `baseTiles.once('load')` with an 1800 ms timeout. With
no tile layer it must not dereference a null `baseTiles`, and it should resolve at once rather
than burn the full 1.8 s on every export.

## R7 — Colours

**Decision**: Land `#f7f8f9`, water `#dfe7ec`, area hairline `#e6eaed`, roads `#d2dadf`. Water
is defined once and shared by the `#map` CSS background and the html2canvas `backgroundColor`.

**Rationale**: Near-white land is what Positron does, and it is what the palette over it needs:
sixteen route colours (`SELP`), five-step choropleth ramps, and a density heat surface all have
to stay distinguishable (FR-003). Water is pulled slightly bluer and darker than the current
`#e8ecef` so the coastline actually reads at island zoom, while staying far enough from every
route colour to never be mistaken for one. The hairline gives quiet district texture that helps
orientation without competing with the boundaries the choropleth draws at `#64748b` when a
segment is shaded.

Roads sit between the land and the area hairline in contrast: dark enough to read as roads on
their own, light enough that the sixteen route colours drawn over them still dominate. The first
value tried, `#dbe0e4`, was too faint at street zoom and was darkened after looking at renders.

The single source of truth matters: `#map{background:#e8ecef}` (`index.html:18`) and
html2canvas's `backgroundColor:'#e8ecef'` (`index.html:2809`) are the same colour written twice
today. Changing one and not the other would put a seam at the edge of every export.
