# Working notes for Claude

- **This repo runs [Spec Kit](https://github.com/github/spec-kit).** `.specify/memory/constitution.md`
  is the authority; these notes are its operational restatement. A behaviour change goes
  `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`, leaving a
  `specs/<NNN>-<short-name>/` directory behind. Chores (typo fixes, regenerating
  `data/qc_report.json`) may skip it — say so in the PR. Amend the constitution with
  `/speckit-constitution`, never by hand, and keep this file consistent with it.
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
- **A client/venue layer needs two checks, not one: is it theirs, and is it still open?**
  Membership of a portfolio page is not evidence of trading — Robertson Walk sat on Frasers'
  own mall pages long after it closed on 31 May 2025, and both it and the divested Changi City
  Point are still tagged `shop=mall` in OpenStreetMap. Check each entry's closure/redevelopment
  status, date the check in the layer's sources line, and flag a site with a redevelopment
  hanging over it (`note` field → tooltip) rather than leaving a seller to find out in a meeting.
- **Need a Singapore geocode when OneMap is blocked?** GitHub is reachable: clone
  `xkjyeah/singapore-postal-codes` and look the postal address up in `buildings.json` — it is a
  OneMap dump (address → lat/lng for every postal code). Used to place the Frasers malls; it
  caught a 134 m error on Robertson Walk that a from-the-address estimate had missed.
- Deploys are GitHub Pages from `main`; merging a PR is the deploy.
