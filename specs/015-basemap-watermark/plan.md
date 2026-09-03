# Implementation Plan: A basemap that never shows a watermark

**Branch**: `claude/map-watermark-removal-yy3aoj` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-basemap-watermark/spec.md`

## Summary

Every tile is stamped `API KEY REQUIRED` because CARTO key-gated their raster basemaps and
`BASEMAP_KEY` is empty. No key exists and none can be obtained from this environment, so the fix
is to give the product an acceptable appearance without one: draw Singapore from two files
already fetched on every load — the coastline from `data/planning_areas.geojson` and the road
network from `data/network.json`, whose 612 services are all road-aligned — and only add the
CARTO tile layer when a key is present. Keyless, the map is a clean, orientable island; keyed,
the tiles cover the ground and nothing about the product changes. Falling back on `tileerror`
means a revoked, expired or over-quota key, or an unreachable host, lands on the same clean
ground instead of a grey void.

## Technical Context

**Language/Version**: ES2019-era vanilla JavaScript, inline in `index.html`. No transpiler.

**Primary Dependencies**: Leaflet (map, panes, canvas renderers, GeoJSON), html2canvas (JPG
export), pptxgen (deck export). All CDN-loaded at runtime; none added or changed by this feature.

**Storage**: Static JSON under `data/`. This feature adds no file. It reads
`data/planning_areas.geojson` (coastline) and `data/network.json` (road geometry), both already
fetched by `index.html`'s single load promise.

**Testing**: No test runner exists. Verification is `python3 -m http.server` plus
Playwright/Chromium screenshots, with the results recorded as story evidence in
`docs/user-stories.md` per Principle V. `python3 tools/qc_poi.py` is not triggered — no
`data/poi_*.json` is touched.

**Target Platform**: Desktop browsers, served as static files from GitHub Pages.

**Project Type**: Single self-contained client-side application.

**Performance Goals**: One added canvas layer holding 55 MultiPolygons plus 612 polylines
(33,025 points), drawn once at load and restyled only when the zoom band changes. Must not
delay first paint or add a network request.

**Constraints**: No build step, no backend, no new dependency, no vendored asset (Principle II).
The development proxy blocks every tile host, so the keyed path cannot be exercised here.

**Scale/Scope**: Roughly 45 lines of `index.html`: one pane, one layer group (coastline + 612
road polylines), one conditional around the tile layer, one guard in `tilesReady`, a
zoom-banded restyle hooked to `zoomend`, and four colour constants.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Evidence |
|---|---|---|
| **I. Spec-Driven Delivery** | PASS | This is a behaviour change and it has `specs/015-basemap-watermark/spec.md`, written before `index.html` was touched. Spec, plan and tasks precede implementation. |
| **II. Single Self-Contained Artifact** | PASS | Changes live in `index.html` alone. No new data file, no new library, no vendored asset, no build step, no backend. The ground is drawn from a `data/*.json` file fetched at runtime, exactly as the constitution prescribes for data. |
| **III. Data Integrity Gate** | NOT TRIGGERED | No `data/poi_*.json` is edited. `data/planning_areas.geojson` is read, not modified. `tools/qc_poi.py` will still be run to confirm the tree is clean. |
| **IV. Verified Provenance** | NOT TRIGGERED | No client or venue layer is added or changed. The planning areas already carry their URA Master Plan 2019 provenance in the app's own sources list. |
| **V. Simulation → Stories → Evidence** | PASS, with a declared gap | Stories are in `spec.md` before the build and will be verified headlessly and recorded in `docs/user-stories.md`. The keyed path (User Story 2) **cannot** be verified here — the proxy blocks every tile host — so it will be marked ⚠ with that reason, never ✅. `docs/basemap.md` already prescribes checking it in a browser. |

**Platform & Data Constraints**: honoured. Testing uses `python3 -m http.server` with
Playwright/Chromium and CDN assets served locally, and a test that silently skips because a CDN
was blocked is treated as a failure, not a pass.

**Deployment**: merging is the deploy, and there is no staging. The fallback is therefore
designed to be the safe state rather than the exceptional one — it is what renders if anything
about the tile host is wrong on the day.

### Post-Phase 1 re-check

Re-evaluated after the design below was written: no gate changes verdict. The design adds no
file, no dependency and no build step, and it removes a cross-origin image from the export path
rather than adding one. Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/015-basemap-watermark/
├── spec.md              # Phase -1 output (/speckit-specify)
├── plan.md              # This file (/speckit-plan)
├── research.md          # Phase 0 output (/speckit-plan)
├── data-model.md        # Phase 1 output (/speckit-plan)
├── quickstart.md        # Phase 1 output (/speckit-plan)
├── checklists/
│   └── requirements.md  # Spec quality checklist (/speckit-specify)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

No `contracts/` directory. The atlas exposes no API, CLI or wire format — it is a single page
whose only external interface is the URL hash deep link, which this feature does not touch. Per
the plan template, contracts are skipped for a purely internal surface.

### Source Code (repository root)

```text
index.html                     # the entire application — the only file this feature edits
├── :18                        #   #map background  → becomes the shared water colour
├── :740-767                   #   map + basemap    → land pane, ground layer, conditional tiles
├── :862                       #   data load        → planning_areas.geojson (already fetched)
├── :911                       #   zoomend          → gateRoads joins gateLabels
├── :1409 buildAreas()         #   choropleth layer → untouched; ground gets its own layer
└── :2768 tilesReady()         #   export gate      → guarded for the no-tile-layer case

data/planning_areas.geojson    # read as the coastline; NOT modified
data/network.json              # read as the road skeleton (612 aligned services); NOT modified
docs/basemap.md                # updated: records the fallback alongside the key fix
docs/user-stories.md           # story evidence for this simulation (Principle V)
```

**Structure Decision**: There is no structure decision to make. The constitution fixes the
layout at one `index.html` plus `data/*.json`, and this feature stays inside it.

## Design

### The layer stack

A new `land` pane sits below every existing pane, so nothing already drawn changes z-order:

| Pane | z-index | Contents |
|---|---|---|
| **`land` (new)** | **250** | **The keyless ground: land silhouette + road skeleton** |
| Leaflet `tilePane` | 200 | CARTO tiles — *only created when a key is set* |
| `areas` | 380 | choropleth fill (existing) |
| `areaHatch` | 382 | hatch overlay (existing) |
| `heat` | 385 | density surface (existing) |
| `bus` / `poi` / `rail` / `sel` / `pill` / `poiIcon` / `label` | 400–495 | existing |

The ground is one `L.layerGroup`: the coastline polygons plus one polyline per service. Both go
in the same pane at 250 — above the tile pane's own backdrop, below every content pane.

Note the consequence of that ordering: tiles live at 200, *below* the ground, so a ground left
on the map would cover them. The ground is therefore only *added to the map* when there is no
working tile layer.
Keyed, it is built but not added; on `tileerror` it is added and the tile layer removed. This
keeps one code path for "what the ground looks like" and one switch for "is it showing".

### Water

`#map{background:#e8ecef}` (`index.html:18`) and html2canvas's `backgroundColor:'#e8ecef'`
(`index.html:2809`) are the same value written twice. Both become the new water colour, driven
from one constant so they cannot drift and put a seam at the edge of an export.

### Why not reuse the existing area layer

`S._areaLayer` is the choropleth. `paintChoro` rewrites its `fillColor`, `fillOpacity`, `color`,
`weight` and `opacity` on every shading change (`index.html:1450–1465`), and sets `fillOpacity:0`
for `'none'`. Ground drawn on it would vanish the first time a user shaded a segment. The ground
gets its own non-interactive layer over the same geometry — the same twin-layer pattern
`S._hatchLayer` already uses.

### Roads

612 services, all `aligned: true`, 33,025 points. Bus routes follow real roads, so their union
is a road network — the thing that turns an outline into a map. Feeders are included: they are
the estate streets the trunks skip. Stroke weight is banded by zoom (.7 px at z≤11 → 3.6 px at
z≥17) on `zoomend`, guarded so a pan within a band restyles nothing.

They are ground, so they are non-interactive: the user-facing trunk-services layer keeps its own
hover, click and styling, and is unaffected.

### Export

`captureFramed` snapshots the live `#map` element, so the ground is captured with everything
else; it uses the same canvas renderer the selection and choropleth already use so that export
stays aligned. The one required change is `tilesReady()`, which awaits `baseTiles.once('load')`
— it must not dereference a null `baseTiles`, and should resolve immediately rather than spend
its full 1800 ms timeout on every export in fallback mode.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

No violations. No entries.
