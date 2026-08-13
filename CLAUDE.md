# Working notes for Claude

- **Before exploring `data/` or the loading code, read [`docs/data-model.md`](docs/data-model.md).**
  It has every file's exact shape, row counts, join keys and traps (`[lng,lat]` order,
  stop codes are strings with leading zeros, the three stop-keyed files cover different
  stop sets, `poi_schools.json` is a registry and not a drawn layer). Reading it is faster
  and more reliable than re-deriving the shapes; if you change a data file's shape, update
  that doc in the same commit.
- **Simulation → user stories → verify.** Whenever a change is driven by simulating a user
  (persona walkthrough, UX critique), first write the user stories to `docs/user-stories.md`
  under a dated simulation heading, then build, then check every story against the real app
  (headless browser run or screenshot) and record ✅/⚠/✘ with the evidence. Show the story
  table in the summary to the user.
- The app is a single self-contained `index.html`; data lives in `data/*.json`. No build step.
- **After ANY edit to `data/poi_*.json`, run `python3 tools/qc_poi.py`** and fix every failure
  before committing. It enforces names, Singapore bounds, exact-duplicate rows and — critically —
  point↔footprint consistency (an entry stitched from two campuses, or a stale footprint after a
  campus move, fails loudly instead of shipping).
- Test locally with `python3 -m http.server` + Playwright/Chromium; CDN assets (Leaflet,
  html2canvas, pptxgen) must be stubbed or served locally — this environment's proxy blocks
  most non-GitHub hosts, including unpkg, cdnjs, OSM/Overpass and OneMap.
- Deploys are GitHub Pages from `main`; merging a PR is the deploy.
