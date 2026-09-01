---

description: "Task list for 015-basemap-watermark"
---

# Tasks: A basemap that never shows a watermark

**Input**: Design documents from `/specs/015-basemap-watermark/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [quickstart.md](./quickstart.md)

**Tests**: No automated test tasks. The repository has no test runner, and the constitution
makes the story table in `docs/user-stories.md` the regression record instead (Principle V).
Verification tasks below produce that evidence.

**Organization**: Tasks are grouped by user story so each can be implemented and verified
independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

## Path Conventions

One self-contained application at the repository root: `index.html`, with data in `data/*.json`
and documentation in `docs/`. There is no `src/` or `tests/` tree — Principle II.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: A local environment that can actually render the app, given the proxy blocks CDNs.

- [ ] T001 Serve the repository with `python3 -m http.server 8000` from the repository root and confirm `index.html` loads
- [ ] T002 Vendor Leaflet, html2canvas and pptxgen into a scratch directory **outside** the repository and point a scratch copy of `index.html` at them, so a headless run renders instead of silently skipping (Principle II bars committing them; a CDN-blocked skip is a failed test, not a passed one)
- [ ] T003 [P] Capture a "before" screenshot of the watermarked map at the default island view as the baseline this feature is measured against

**Checkpoint**: The app renders locally and the defect is captured.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared water colour and the pane the ground is drawn into. Every story below
depends on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Add the basemap colour constants (land `#f7f8f9`, water `#dfe7ec`, hairline `#e6eaed`) as named constants in the basemap section of `index.html` near `BASEMAP_KEY` (~line 760)
- [ ] T005 Point the `#map` background at the shared water colour in the `<style>` block of `index.html` (line 18, currently `#e8ecef`) and the html2canvas `backgroundColor` in `captureFramed` in `index.html` (line 2809, currently `#e8ecef`) at the same value, so no seam appears at the edge of an export (INV-5)
- [ ] T006 Create the `land` pane at z-index 250 with a canvas renderer and `pointerEvents:'none'`, alongside the existing pane setup in `index.html` (~line 768), placing it below `areas` (380) and leaving every existing pane's z-order unchanged

**Checkpoint**: Ground has somewhere to be drawn; water reads the same on screen and in export.

---

## Phase 3: User Story 1 — A beta tester never sees a watermark (Priority: P1) 🎯 MVP

**Goal**: With no key configured, the map is a clean Singapore silhouette and no request is made
to the watermarking tile host.

**Independent Test**: Load with `BASEMAP_KEY=''`, inspect the viewport at several zooms — no
watermark text anywhere, land distinguishable from water, and zero requests to
`basemaps.cartocdn.com` in the network log.

### Implementation for User Story 1

- [ ] T007 [US1] Add `buildLand()` to `index.html` near `buildAreas()` (~line 1409): a non-interactive `L.geoJSON(S.areas)` in the `land` pane styled land-fill + hairline stroke, stored as `S._landLayer`, built but **not** added to the map (FR-002)
- [ ] T008 [US1] Call `buildLand()` from the data-load `.then()` in `index.html` (~line 873) before `buildAreas()`, and guard it so a missing `S.areas` leaves the app starting normally over plain water rather than throwing (FR-010, INV-2)
- [ ] T009 [US1] Make the CARTO tile layer conditional in `index.html` (~lines 761–764): create `baseTiles` only when `BASEMAP_KEY` is non-empty, leaving it `null` otherwise so no unkeyed tile is ever requested (FR-001)
- [ ] T010 [US1] Add the mode switch in `index.html` — a small `useLand(on)` that adds/removes `S._landLayer` — and call it at load so the ground is on when there is no tile layer (FR-002, INV-1)
- [ ] T011 [US1] Guard `tilesReady()` in `index.html` (line 2768) against a null `baseTiles` so it resolves immediately in fallback mode instead of dereferencing null or burning its full 1800 ms timeout
- [ ] T012 [US1] Verify Scenario 1 from [quickstart.md](./quickstart.md): screenshot the island view keyless and confirm no watermark **and** zero requests to the tile host
- [ ] T013 [US1] Verify Scenario 2: pan and zoom island → street level, confirming no watermark at any zoom and no tearing or misregistration against the routes
- [ ] T014 [US1] Verify Scenario 3: with routes selected, place layers on, a segment shaded and the density surface on, confirm everything stays legible over the ground and that area tooltips and the area drill-down still work — the ground must not have stolen the pointer (FR-003, INV-3)

**Checkpoint**: The reported bug is fixed and beta testing can resume. This is the MVP.

---

## Phase 4: User Story 3 — Export produces a clean image in either mode (Priority: P2)

**Goal**: JPG and deck exports carry whichever basemap is showing, with no watermark and no
blank band.

**Independent Test**: Export a JPG and a deck with routes selected and inspect both for the
basemap.

*Sequenced before US2 because it is verifiable here; US2 is not.*

### Implementation for User Story 3

- [ ] T015 [US3] Verify Scenario 4 from [quickstart.md](./quickstart.md): export a JPG keyless with routes selected and confirm the silhouette is in the image beneath the routes, with no watermark and no seam at the frame edge (FR-005, INV-5)
- [ ] T016 [US3] Export a deck keyless and confirm the hero map slide carries the same basemap the screen showed (FR-005)
- [ ] T017 [US3] Confirm export is no slower than before, i.e. that T011's guard is actually short-circuiting the tile wait rather than timing out

**Checkpoint**: The product's main deliverable is intact in fallback mode.

---

## Phase 5: User Story 4 — The missing key is visible to the owner, not the tester (Priority: P3)

**Goal**: The owner can tell the atlas is on the fallback and why; nothing about it is drawn
where a tester or client can see it.

**Independent Test**: Load keyless and confirm the reason is discoverable by the owner and
absent from the map.

### Implementation for User Story 4

- [ ] T018 [US4] Update the console warning in `index.html` (lines 765–767) so it states the current behaviour — running on the built-in silhouette, streets return when a key is set — rather than the now-false claim that CARTO "will watermark every tile" (FR-007)
- [ ] T019 [US4] Confirm nothing about the basemap mode is rendered on the map, in the sidebar, in the sources strip, or in any export (FR-007)

**Checkpoint**: The fallback is not silent to the owner and not visible to anyone else.

---

## Phase 6: User Story 2 — Setting the key restores the full basemap (Priority: P2)

**Goal**: Pasting a key brings back the detailed street basemap with no other change.

**Independent Test**: Set a key, reload, confirm the detailed basemap loads and the silhouette
is not drawn.

**⚠️ Cannot be verified in this environment** — the proxy blocks every tile host, so a keyed run
renders grey and is indistinguishable from a failure. Its stories are marked ⚠ with that reason,
never ✅ (Principle V).

### Implementation for User Story 2

- [ ] T020 [US2] Confirm by code reading that a non-empty `BASEMAP_KEY` produces exactly today's tile URL, options (`attribution`, `maxZoom:19`, `crossOrigin:'anonymous'`) and layer order, so a keyed run is byte-identical to current behaviour (FR-004)
- [ ] T021 [US2] Add the `tileerror` handler in `index.html` that removes the failed tile layer and switches to the ground, so a revoked, expired, over-quota or unreachable host lands on the silhouette rather than a grey void (FR-006)
- [ ] T022 [US2] Confirm setting or clearing `BASEMAP_KEY` is the only edit needed to switch modes — no other constant, call site or style needs touching (FR-008)
- [ ] T023 [US2] Record Scenarios 5 and 6 in `docs/user-stories.md` as ⚠ with the blocked-proxy reason and the browser steps that would close them, per Principle V

**Checkpoint**: The key path is preserved and its verification gap is declared rather than hidden.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Rewrite `docs/basemap.md` so the fallback is documented alongside the key fix, the "Verifying" steps cover both modes, and the page no longer reads as though a watermarked map is the only keyless outcome
- [ ] T025 [P] Add the dated simulation heading and the full story table with evidence to `docs/user-stories.md`, marking every story ✅ / ⚠ / ✘ (Principle V)
- [ ] T026 Verify Scenario 7 from [quickstart.md](./quickstart.md): temporarily rename `data/planning_areas.geojson`, reload, and confirm the app still starts with no uncaught exception (FR-010, INV-2)
- [ ] T027 Run `python3 tools/qc_poi.py` to confirm the tree is clean — expected to pass untouched, since no `data/poi_*.json` is edited (Principle III)
- [ ] T028 Re-read the diff adversarially before committing: null-safety on every new `baseTiles` reference, no leftover hardcoded `#e8ecef`, no pane z-order regression, no change to the keyed path

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup. **Blocks every user story.**
- **US1 (Phase 3)**: depends on Foundational. Blocks nothing — it is the MVP and ships alone.
- **US3 (Phase 4)**: depends on US1 (there must be a ground to export).
- **US4 (Phase 5)**: depends on US1 (T009 creates the condition the warning describes).
- **US2 (Phase 6)**: depends on US1 (T021's fallback target is T007's layer).
- **Polish (Phase 7)**: depends on all stories being complete.

### Within Each User Story

Implementation before verification. In US1: layer (T007) → wiring (T008–T010) → export guard
(T011) → the three verification tasks.

### Parallel Opportunities

This is a ~25-line change to a single file, so the real parallelism is small and honest:

- T003 runs alongside T001–T002.
- T024 and T025 are different files in `docs/` and run together.
- **T004–T011 all edit `index.html` and must be sequential.** Marking them [P] would be a lie
  about a single-file change.

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: Setup.
2. Phase 2: Foundational — blocks everything.
3. Phase 3: User Story 1.
4. **STOP and VALIDATE**: T012–T014. The watermark is gone and beta testing resumes.
5. Merging deploys it; there is no staging.

### Incremental Delivery

Everything after US1 hardens rather than unblocks: US3 protects the export, US4 keeps the
fallback from being silent to the owner, US2 preserves and future-proofs the key path. Each is
independently valuable and none can reintroduce the watermark.

---

## Notes

- [P] = different files, no dependencies. Used sparingly here for the reason above.
- Commit after each logical group; stop at any checkpoint to validate.
- A story with no evidence recorded is ⚠ or ✘, never ✅ — this applies to US2 by design.
