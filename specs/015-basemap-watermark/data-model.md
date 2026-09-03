# Phase 1 — Data Model

**Feature**: 015-basemap-watermark · **Date**: 2026-09-01

This feature introduces no new data file and no new persisted state. It reads one file the app
already loads and adds two pieces of in-memory state.

## Entities

### Basemap credential — `BASEMAP_KEY`

| | |
|---|---|
| **Where** | `index.html`, module-scope constant |
| **Type** | string; empty string means "not configured" |
| **Lifetime** | build-time constant, read once at load |
| **Validation** | presence only — a non-empty value is trusted until the host says otherwise |

A publishable, client-side, domain-restrictable key (see `docs/basemap.md`); not a secret, and
it belongs in `index.html`. Its **presence** is the only input that selects a basemap mode:

| Value | Tile layer created | Ground layer added | Result |
|---|---|---|---|
| `''` | no | yes | coastline + roads, no request to the tile host |
| non-empty, working | yes | no | detailed street basemap, unchanged from today |
| non-empty, failing | yes, then removed | yes, on `tileerror` | clean silhouette |

### Road skeleton — `data/network.json`

| | |
|---|---|
| **Where** | already fetched by `index.html`'s load promise; held as `S.svcs` |
| **Shape** | 612 services, each with `segs`: arrays of `[lng, lat]` points |
| **Extent** | 33,025 points total; **every service `aligned: true`** — real road geometry, not stop-to-stop chords |
| **Provenance** | LTA bus route alignments, already cited in the app's sources list |
| **Used here as** | geometry only — the road network the buses run on |

Feeders are included (`feeder: true`, 319 of the 612). The user-facing trunk layer excludes them;
the ground does not, because they are the estate streets that make the map readable.

**Not modified.**

### Land silhouette — `data/planning_areas.geojson`

| | |
|---|---|
| **Where** | already fetched at `index.html:862`; held as `S.areas` |
| **Shape** | `FeatureCollection`, 55 features, `MultiPolygon` geometry |
| **Extent** | 103.606–104.088 E, 1.159–1.471 N; 784.5 km² summed against Singapore's ~735 km² of land |
| **Provenance** | URA Master Plan 2019, already cited in the app's sources list |
| **Used here as** | geometry only |

Only the geometry is read. The 26 demographic properties each feature carries (`population`,
`income_median`, `mop_*`, `tx_*`, …) are irrelevant to the ground and are not touched — they
remain the choropleth's business.

**Not modified.** This feature reads the file; it does not edit it. No `data/poi_*.json` is
involved, so the Principle III gate is not triggered.

## Derived state

| Name | Type | Meaning |
|---|---|---|
| `S._landLayer` | Leaflet LayerGroup or null | the ground: coastline GeoJSON + one polyline per service. Built once at load; added to or removed from the map by the mode switch. Non-interactive — it must never intercept a click meant for the choropleth's area drill-down. |
| `S._roadLines` | array of Leaflet Polylines | the road members of that group, held separately so `gateRoads` can restyle them without walking the group. |
| `S._roadW` | number | the stroke width currently applied, so a pan inside one zoom band restyles nothing. |
| `baseTiles` | Leaflet TileLayer or **null** | the CARTO layer. **Null when no key is set** — this is the change that stops the watermark being requested at all, and the reason `tilesReady()` needs a guard. |

## Relationships and invariants

- **INV-1**: The ground and a working tile layer are never both visible. Exactly one basemap is
  on the map at any moment.
- **INV-2**: The ground degrades in parts, not all at once. If `S.areas` fails to load the roads
  still draw over plain water; if the network fails, the coastline still draws; if both fail
  there is no ground and the map still renders every other layer (FR-010) — the app must not
  fail to start in any of those cases.
- **INV-3**: The ground never intercepts pointer events. `S._areaLayer`'s transparent fill stays
  the click target for the area drill-down, and its tooltips must keep working in both modes.
- **INV-4**: The ground layer is style-independent of `S._areaLayer`. `paintChoro` may rewrite
  the choropleth's style freely without affecting the ground.
- **INV-5**: Water is one value. The `#map` CSS background and the html2canvas export background
  are the same colour, so no seam appears at the edge of an exported frame.

## Colours

| Role | Value | Note |
|---|---|---|
| Land fill | `#f7f8f9` | near-white, as Positron does — keeps 16 route colours, 5-step choropleth ramps and the heat surface distinguishable over it |
| Water | `#dfe7ec` | slightly bluer and darker than today's `#e8ecef` so the coastline reads at island zoom |
| Area hairline | `#e6eaed` | quiet district texture; must not compete with the `#64748b` boundaries the choropleth draws when a segment is shaded |
| Roads | `#d2dadf` | darker than the hairline so roads read as roads, light enough that the sixteen route colours over them still dominate. `#dbe0e4` was tried first and was too faint at street zoom |
