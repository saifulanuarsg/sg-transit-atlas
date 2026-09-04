# Implementation Plan: Names on the built-in basemap

**Branch**: `claude/map-watermark-removal-yy3aoj` | **Date**: 2026-09-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-ground-labels/spec.md`

## Summary

The built-in basemap from 015 draws roads but names nothing, which is why it still reads as a
diagram. Both sets of names are already in the repository and unused: 5,207 bus stops each carry
the road they stand on (860 distinct roads), and the 55 planning areas carry town names. Draw town
names at z12–14 and road names from z15, de-overlapped in screen space, built only for the current
view, and removed entirely the moment a real tile basemap is showing.

## Technical Context

**Language/Version**: ES2019-era vanilla JavaScript, inline in `index.html`. No transpiler.

**Primary Dependencies**: Leaflet only (`L.marker` + `L.divIcon`, via the app's existing
`labelMarker` helper). Nothing added.

**Storage**: No new file. Reads `data/stops.json` and `data/planning_areas.geojson`, both already
fetched on every load.

**Testing**: No test runner. `python3 -m http.server` plus Playwright/Chromium with the CDN
libraries served locally, recorded as story evidence per Principle V.

**Target Platform**: Desktop browsers, static files from GitHub Pages.

**Project Type**: Single self-contained client-side application.

**Performance Goals**: 1,285 candidate road positions and 55 towns precomputed once at load; only
the screenful in view is built, on `moveend`. Pan and zoom must not regress.

**Constraints**: No build step, no backend, no new dependency (Principle II). Must not touch the
keyed path.

**Scale/Scope**: ~55 lines of `index.html`: two CSS classes, a precompute, a screen-space
de-overlap helper, a view-gated render, and four call sites.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Verdict | Evidence |
|---|---|---|
| **I. Spec-Driven Delivery** | PASS | Behaviour change, and `specs/016-ground-labels/spec.md` was written before `index.html` was touched. |
| **II. Single Self-Contained Artifact** | PASS | `index.html` only. No new data file, no library, no vendored asset, no build step, no backend. Names come from `data/*.json` fetched at runtime, exactly as the constitution prescribes. |
| **III. Data Integrity Gate** | NOT TRIGGERED | No `data/poi_*.json` edited. `stops.json` and `planning_areas.geojson` are read, not modified. `qc_poi.py` still run to confirm the tree is clean. |
| **IV. Verified Provenance** | NOT TRIGGERED | No client or venue layer. Both name sources (LTA DataMall stops, URA Master Plan 2019 planning areas) are already in the app's own sources list. |
| **V. Simulation → Stories → Evidence** | PASS | Stories written in `spec.md` before the build; verified headlessly and recorded in `docs/user-stories.md` with evidence. Unlike 015, **every story here is verifiable in the sandbox** — none of it depends on a blocked tile host, including the keyed case, which is exercised with the host stubbed. |

**Platform & Data Constraints**: honoured — local `http.server`, Playwright/Chromium, CDN
libraries served locally so nothing can silently skip.

**Deployment**: merging is the deploy; no staging. Mitigated by the labels being additive and
self-removing: they draw only on the built-in ground, so the keyed path cannot regress.

### Post-design re-check

No gate changes verdict. No file, dependency or build step added; the keyed path is strictly
untouched. Complexity Tracking stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/016-ground-labels/
├── spec.md              # Phase -1 output
├── plan.md              # This file
├── tasks.md             # Phase 2 output
└── checklists/
    └── requirements.md  # Spec quality checklist
```

No separate `research.md`, `data-model.md`, `quickstart.md` or `contracts/`. This is a ~55-line
additive change to one file with two in-repo data sources and no external interface; the research
(which data carries the names), the model (two arrays of `{lat,lng,name,rank}`) and the validation
steps are stated inline here and in `tasks.md`. Spreading four more files over it would be
ceremony, not review value. The two required gates — `spec.md` and this Constitution Check — are
both present. Called out rather than done silently, so a reviewer can disagree.

### Source Code (repository root)

```text
index.html
├── :~450  CSS                    # .roadlab / .townlab
├── :~1490 buildGroundLabels()    # precompute road + town label points, ranked
├── :~1510 placeLabels()          # greedy screen-space de-overlap
├── :~1520 gateGroundLabels()     # build only what is in view, for the current zoom band
├── :~1560 useLand()              # labels come and go with the ground
├── :~1600 paintChoro()           # shading suppresses the ground's town names
└── :~915  boot                   # build once, then re-gate on moveend

data/stops.json                   # read for road names (index 3); NOT modified
data/planning_areas.geojson       # read for town names; NOT modified
```

**Structure Decision**: None to make — the constitution fixes the layout at one `index.html` plus
`data/*.json`.

## Design

### Where the names come from

| | Road names | Town names |
|---|---|---|
| Source | `data/stops.json`, index 3 of each entry | `data/planning_areas.geojson`, `name` |
| Volume | 5,207 stops → 860 distinct roads | 55 |
| Label points | one per ~6 stops on a road → 1,285 | one per area centre → 55 |
| Rank (who wins a collision) | stop count on that road | `area_km2` |

Sampling every 6th stop rather than one point per road matters: a long road gets several label
positions along its length, so there is usually one in whatever view you are in, instead of one
label stranded off-screen.

### Zoom bands

| Zoom | Towns | Roads |
|---|---|---|
| < 12 | — | — |
| 12–14 | ✅ | — |
| ≥ 15 | — | ✅ |

Towns hand over to roads rather than stacking: at street zoom a town name is noise, and at island
zoom road names are an unreadable mat.

### De-overlap

`placeLabels()` walks candidates best-first (by rank), projects each to container pixels, and
skips any whose label box would touch one already placed. This is the difference between the
CBD reading `TANGLIN NEWTON ORCHARD ROCHOR` on top of itself and reading cleanly. Ranking is what
makes the survivors the *right* ones rather than whichever happened to be first.

### Why this cannot hurt the keyed path

`gateGroundLabels()` returns immediately unless `landWanted` — the same flag 015 uses to decide
whether the built-in ground is on the map at all. Keyed, no label is ever constructed. `useLand()`
calls it on every basemap switch, so the labels follow the ground through a `tileerror` fallback
too.

### Export

Labels are DivIcon markers in the existing `label` pane, which `captureFramed` already snapshots
along with everything else in `#map`. No export change is needed — verified, not assumed.

## Complexity Tracking

> Fill ONLY if Constitution Check has violations that must be justified.

No violations. No entries.
