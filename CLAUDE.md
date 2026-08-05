# Working notes for Claude

- **Simulation → user stories → verify.** Whenever a change is driven by simulating a user
  (persona walkthrough, UX critique), first write the user stories to `docs/user-stories.md`
  under a dated simulation heading, then build, then check every story against the real app
  (headless browser run or screenshot) and record ✅/⚠/✘ with the evidence. Show the story
  table in the summary to the user.
- The app is a single self-contained `index.html`; data lives in `data/*.json`. No build step.
- Test locally with `python3 -m http.server` + Playwright/Chromium; CDN assets (Leaflet,
  html2canvas, pptxgen) must be stubbed or served locally — this environment's proxy blocks
  most non-GitHub hosts, including unpkg, cdnjs, OSM/Overpass and OneMap.
- Deploys are GitHub Pages from `main`; merging a PR is the deploy.
