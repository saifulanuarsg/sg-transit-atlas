---

description: "Task list for 016-ground-labels"
---

# Tasks: Names on the built-in basemap

**Input**: [spec.md](./spec.md), [plan.md](./plan.md)

**Tests**: No automated test tasks — no test runner exists; the story table in
`docs/user-stories.md` is the regression record (Principle V). Verification tasks produce it.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [x] T001 Reuse the local harness from 015: `python3 -m http.server` with Leaflet, html2canvas and pptxgen served from a scratch directory outside the repo, so nothing silently skips on a blocked CDN
- [x] T002 Confirm the name data actually exists before designing around it: count distinct road names in `data/stops.json` index 3 and area names in `data/planning_areas.geojson`

**Checkpoint**: 860 roads across 5,207 stops, 55 towns — enough to build on.

---

## Phase 2: Foundational

- [x] T003 Add `.roadlab` and `.townlab` to the `<style>` block in `index.html` — halo text so they read over land, water and the choropleth alike; `pointer-events:none` so nothing existing loses a hover or click (FR-007)
- [x] T004 Add `LBL_ROAD` / `LBL_TOWN_IN` / `LBL_TOWN_OUT` zoom-band constants beside the label logic

---

## Phase 3: User Stories 1 & 2 — names on the map (P1) 🎯 MVP

- [x] T005 [US1][US2] `buildGroundLabels()` in `index.html`: group stops by road name, emit a label point every ~6 stops so long roads are named more than once, rank by stop count; emit one point per planning-area centre ranked by `area_km2` (FR-001)
- [x] T006 [US1][US2] `placeLabels()` — greedy screen-space de-overlap, best-first, so the CBD stops printing six town names on top of each other and the survivors are the significant ones (FR-002)
- [x] T007 [US1][US2] `gateGroundLabels()` — build only the labels in the current view for the current zoom band, one label per road name per view, capped (FR-003, FR-008)
- [x] T008 [US1][US2] Call `buildGroundLabels()` at boot after `buildAreas()` (it needs `S._areaLayer`), then `gateGroundLabels()` on `moveend` — `moveend` covers pan *and* zoom, so one hook is enough
- [x] T009 [US1] Verify island zoom: town names drawn, none overlapping, no road names
- [x] T010 [US2] Verify street zoom over Orchard: correct real street names, no duplicates
- [x] T011 [US2] Verify a dense town centre (Tampines) stays capped with zero duplicate names

**Checkpoint**: the map names things. This is the MVP.

---

## Phase 4: User Story 4 — get out of the way (P1)

- [x] T012 [US4] Gate `gateGroundLabels()` on `landWanted` so no label is constructed while real tiles are showing (FR-005)
- [x] T013 [US4] Call `gateGroundLabels()` from `useLand()` so labels follow the ground through a `tileerror` fallback in both directions
- [x] T014 [US4] Suppress the ground's town names while a choropleth is shading — `renderAreaLabels` already draws area names then (FR-006); hook `paintChoro()` so it clears immediately rather than on the next pan
- [x] T015 [US4] Verify with the tile host stubbed: **zero** `.roadlab`/`.townlab` in the DOM on the keyed path

---

## Phase 5: User Story 3 — export (P1)

- [x] T016 [US3] Verify the exported frame carries the names, by reading them off a real `captureFramed` render with routes selected (FR-004)

---

## Phase 6: Polish

- [x] T017 [P] Update `docs/basemap.md` — the built-in basemap now names things, and these labels disappear when a key is set
- [x] T018 [P] Add the dated story table with evidence to `docs/user-stories.md` (Principle V)
- [x] T019 Re-run all three verification suites from 015 to confirm no regression, and extend the keyed suite with the no-labels assertion
- [x] T020 Run `python3 tools/qc_poi.py` — expected clean, no `data/poi_*.json` touched (Principle III)
- [x] T021 Re-read the diff adversarially: pointer events off, no work done on the keyed path, no state left behind when labels are removed, choropleth interaction intact

---

## Dependencies

Setup → Foundational → US1/US2 (MVP) → US4 and US3 (both depend on the labels existing) → Polish.
T005–T008 all edit `index.html` and are sequential; only the two doc tasks are genuinely parallel.

## Notes

Every story here is verifiable in the sandbox, including the keyed case (tile host stubbed) —
unlike 015, this feature carries no ⚠.
