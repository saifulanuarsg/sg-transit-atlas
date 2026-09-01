# Phase 1 — Quickstart / Validation Guide

**Feature**: 015-basemap-watermark · **Date**: 2026-09-01

How to prove this feature works. Scenarios map to the user stories in [spec.md](./spec.md).

## Prerequisites

```bash
cd /path/to/sg-transit-atlas
python3 -m http.server 8000
```

Leaflet, html2canvas and pptxgen come from CDNs this environment's proxy blocks. Per the
constitution's Platform & Data Constraints, they **must be stubbed or served locally** for a
headless run — *a test that silently skips because a CDN 403'd is a failed test, not a passed
one.* Vendor them into a scratch directory outside the repository (Principle II bars committing
them) and rewrite the `<script>`/`<link>` tags in a scratch copy of `index.html`.

## Scenario 1 — No watermark, keyless (User Story 1, P1) — **the acceptance test**

1. Confirm `BASEMAP_KEY` is `''` in `index.html`.
2. Load `http://localhost:8000/` and wait for the loading overlay to clear.
3. Screenshot the map viewport at the default island view.

**Expected**: Singapore's landmass in near-white over bluish-grey water, quiet district
hairlines, no text of any kind on the map. **No network request to `basemaps.cartocdn.com`** —
check the browser's network log; zero requests is the assertion, not "no watermark visible".

## Scenario 2 — No watermark at any zoom (US1)

Zoom from the island view to street level over a town centre, panning across the island.

**Expected**: no watermark at any zoom; the coastline stays crisp; no tearing, seams, or
misregistration between the ground and the routes drawn over it.

## Scenario 3 — Content stays legible over the ground (US1, FR-003)

Select a multi-route set, enable two or three place layers, shade a demographic segment, then
turn on the competitive-density surface.

**Expected**: route colours, place markers, labels, choropleth fill and the heat surface all
remain distinguishable against the ground. Area tooltips still open on hover and the area
drill-down still opens on click — the ground must not have stolen the pointer (INV-3).

## Scenario 4 — Export carries the ground (User Story 3, P2)

With routes selected, export a JPG, then export a deck.

**Expected**: the land silhouette is visible beneath the routes in both, no watermark, no blank
white band where the basemap should be, and no seam between the map band and the frame edge
(INV-5). Export should also feel no slower than before — `tilesReady()` must resolve at once
rather than spend its 1800 ms timeout.

## Scenario 5 — Keyed path (User Story 2, P2) — **cannot be verified here**

**This environment's proxy blocks every tile host, so a keyed run is not testable in the
sandbox** — the map renders grey and the result would be indistinguishable from a failure. This
is the same limitation `docs/basemap.md` already records. Its stories are marked ⚠ with this
reason in `docs/user-stories.md`, never ✅.

To check it in a real browser once a key exists:

1. Paste the key into `BASEMAP_KEY` in `index.html` and reload.
2. Confirm the detailed street basemap loads and the silhouette is **not** drawn.
3. Zoom to street level over a town centre and confirm tiles stay sharp.
4. Export a JPG with routes selected and confirm the basemap is *in* the image — a blank or
   route-only image means the cross-origin basemap has tainted the canvas.
5. Clear the key, reload, and confirm the map returns to the silhouette with no other edit.

## Scenario 6 — Failing key falls back (FR-006)

Set `BASEMAP_KEY` to a junk value and reload, with the network available.

**Expected**: the tile requests error and the map settles on the clean silhouette rather than a
grey void. **Known limit** (see `research.md` R5): if the host answers `200 OK` with a
watermarked image instead of an error, `tileerror` cannot see it and the watermark would show.
The reported bug — no key at all — is fully covered, because no request is made.

## Scenario 7 — Missing ground data degrades safely (FR-010, INV-2)

Temporarily rename `data/planning_areas.geojson` and reload.

**Expected**: the app still starts; routes, stops, rail and places all render over plain water;
no uncaught exception in the console. The demographics features disable themselves, as they
already do today when that file is absent.

## Recording the evidence

Per Principle V, write the results to `docs/user-stories.md` under a dated simulation heading,
marking each story ✅ / ⚠ / ✘ **with the evidence that produced the mark**. A story with no
evidence recorded is ⚠ or ✘, never ✅ — Scenario 5 is exactly that case.
