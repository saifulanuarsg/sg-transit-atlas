# User-story log

Process: every persona simulation run against the atlas produces user stories here **before**
the change is built. Each story is then checked against the shipped change and its status
recorded. Verified = exercised in a headless-browser run or visually confirmed on a screenshot
of the real app; never marked from intention.

Statuses: ✅ verified · ⚠ partial (note why) · ✘ not built (note why)

---

## 2026-08-05 · Simulation: Moove Media salesperson, POI discovery (PR #2)

Persona: account manager exploring what a route package reaches, mid-call.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-1 | As a seller hovering the map, I want any place to tell me its name so I can talk about what a route passes without a legend. | ✅ | Headless: tooltip opens on dot, footprint and brand-badge hover (badges previously dead — pane had pointer-events off). |
| US-2 | As a seller preparing a screenshot, I want place names pinned on the map so the exported frame is self-explanatory. | ✅ | "Show place names" switch: 62/226 labelled at island zoom with count note; labels follow 400 m scope; off → 0. |
| US-3 | As a seller pitching around one specific building, I want to put a single place on the map without its whole layer. | ✅ | "Find one place by name" → pin + always-on label + chip; removable; appears in export legend. |
| US-4 | As a seller prospecting, I want every route ranked by what it reaches — not only routes I already picked. | ✅ | Ranking defaults to all 293 trunk routes; scope toggle back to selection; picked places rankable. |

## 2026-08-05 · Simulation: Moove Media salesperson, full sell-through (PR #3)

Persona: account manager taking a QSR brief from prospecting to client-ready export, client
watching the screen.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-5 | As a seller pitching any fast-food brand, I want the competitive module to anchor on *my* client's brand, and never to show another client's name. | ✅ | Section renamed; M/K/B/J anchor picker; heat, legend and copy follow the anchor (verified anchor=KFC rebuild). |
| US-6 | As a seller with a client watching, I want no internal ticket names on screen ("Howards request"). | ✅ | Renamed "Property & home-movers" with purpose note; internal name gone from UI. |
| US-7 | As a seller reading a package button, I want it to say where the routes run so I don't memorise the rate card. | ✅ | Coverage line derived from route termini on every package button ("Toa Payoh · Bt Panjang · YMCA"). |
| US-8 | As a seller finishing a pitch, I want Export where the workflow ends and always reachable. | ✅ | Export card moved to bottom of left bar, position:sticky verified. |
| US-9 | As a seller, I want audience shading treated as core data, not buried last. | ✅ | "Audience" card sits above the vertical-insight accordions. |

## 2026-08-05 · Simulation: panel scan mid-pitch — "make each block obvious" (PR #4)

Persona: same account manager, screen-sharing; needs to jump to the right panel block in
under a second while talking.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-10 | As a seller scanning a sidebar mid-sentence, I want each block to read as a separate card so sections don't bleed together across a hairline. | ✅ | Both panel bodies tinted; every `.sec` a white rounded card with border + shadow; verified computed styles and screenshot. |
| US-11 | As a returning user, I want each block recognisable by colour before I read its label, so navigation becomes muscle memory. | ✅ | Per-block accent (left inset bar + label dot): network blue, places green, audience purple, insights amber, ranking teal, packages blue. |
| US-12 | As a seller mid-scroll, I want the export step to stay its own visible block whenever there is something to export. | ✅ | Export card sticky at the bar's bottom edge over the tinted backdrop. |

## 2026-08-05 · Simulation: the deck itself — seller exporting, client receiving (PR #6)

Personas: (a) the account manager who exports the deck and must send it **without editing a
single slide**; (b) the client who receives it and judges the pitch by the map.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-14 | As a client reading the map slide, I want the map to be the hero and never covered — stats belong beside the map, not floating on top of the routes. | ✅ | Deck XML audit: map image 9.55×5.3 in at (0.4, 1.62); routes/stats/legend all in the 10.15–12.93 in rail; zero shapes over the map. |
| US-15 | As a seller, I never want redundant elements — if the title says "6 bus routes", there must be no separate big "6" badge repeating it. | ✅ | Hero slide has a single "6 bus routes" title, no badge shape; JPG card drops the badge for multi-route selections too. |
| US-16 | As a seller exporting a long route, I want every stops-by-road slide to fit — the list must shrink and flow to more columns rather than ever colliding with the footer. | ✅ | Capacity-based flow (roads split with "· CONT."): route 147 (20 roads · 75 stops) lays out 4 columns ending at 6.95 in; worst shape bottom across the whole deck 7.44 in, none past the 7.5 in slide edge. |
| US-17 | As a seller exporting the JPG, I want the overlay card to sit on empty map, with the framing shifted so routes are never hidden behind it. | ✅ | Asymmetric fitBounds padding (avoidLeft = 42% of frame) shifts routes clear; card also lifted 56 px above the source strip. Verified on the rendered JPG. |
| US-18 | As a Moove seller, I want the deck in our colours with our wordmark and the package code as the eyebrow — client-ready, not tool-branded. | ✅ | BRAND constant (pink F0245E · navy 1B2D8A · wordmark) drives pill, title, stats and footer; eyebrow reads "CORE CORRIDORS · CITY" from the selected package. |

## 2026-08-06 · UI update: JPG export — sidebar replaces the floating card (user request)

Context: user reviewed two current JPG generations. The floating card avoids overlapping the
routes only by shifting the map fit (`avoidLeft` = 42 % of the frame), which shrinks the
routes. Requested: a real sidebar with the map beside it (side chosen by best practice).

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-19 | As a seller sharing the exported JPG, I want the info panel *beside* the map, not floating over it, so stats never compete with the routes. | ✅ | Headless renders (Set 1 · Core corridors City · single 190): opaque full-height panel over the left 30 %, map canvas composited from the panel edge; nothing is drawn in the map column but the map and the source strip. |
| US-20 | As a client reading the JPG, I want routes drawn as large as the frame allows — the map column fully used, with only fit padding. | ✅ | `avoidLeft` deleted (fit is symmetric) and capture uses `zoomSnap 0`, so `fitBounds` no longer rounds down a whole zoom level. Measured, Set 1: route bbox 322×261 px under the old framing → 672×543 px now, ≈ 2.1× larger linearly. |
| US-21 | As a returning user, I want the export to mirror the app's own layout — panel left, map right — so the export reads like the tool. | ✅ | Sidebar placed on the left (matches the live left bar; eyebrow/title read before the map, LTR). |
| US-22 | As a seller, I want everything the old card carried — badge/title, set label, routes legend, stops & coverage, place legend, impressions, attribution — intact in the sidebar. | ✅ | Verified on renders: 5/6-route sets show set label + ROUTES pills + STOPS & COVERAGE; single 190 shows badge, termini title, TRUNK chip, CORRIDOR (16 roads, wrapped + clamped), coverage and impressions; source strip still bottom-right over the map. |

### Iteration 2 (user screenshot): map band on top, info bar below

The sidebar column fixed the overlap but shaped the map wrong: a Wide-set generation still
zoomed out to half of Johor, because a 0.7-aspect column fights Singapore's ~2:1-wide
network. User asked for a bottom bar with the map as a thicker top band. Supersedes the
panel-left placement verified in US-21.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-23 | As a seller exporting an island-spanning set, I want the map region shaped like the network — wide — so the fit frames Singapore, not Malaysia. | ✅ | Wide sets · City outer (14 routes): route bbox 672×386 px in the sidebar column → 984×564 px in the full-width band (zoom 11.77 → 12.32); the frame stays on the island. |
| US-24 | As a client reading the export, I want the info in a bottom bar that only takes the height its content needs, leaving the rest to the map. | ✅ | Bar height derived from measured content, clamped 19–34 % of the frame; all three test cases (14-route set, Set 1, single 190 with corridor + impressions) land at 19–21 %, so the map band keeps ~4/5 of the frame at full width. |
| US-25 | As a seller who clicks a package and exports straight away, I want the framing to be deterministic — never half of an in-flight zoom animation. | ✅ | Found in headless runs: the live animated fit lands *after* the export fit and clobbers it (capture at zoom 12 instead of 13.14). Fixed by waiting out `_animatingZoom`, `map.stop()`, and re-asserting the fit after the settle waits; batch renders now capture at exactly the fitted zooms (12.32 / 12.45 / 13.14). |
| US-26 | As a client, I never want the attribution strip covering a route end or terminus label. | ✅ | Set 1 render initially had "Kampong Bahru Ter" under the strip; `avoidBottom` fit-padding (≈ strip height) now keeps the bottom-most termini clear — verified on the re-render. |

### Follow-up defect (user screenshot, PR #5)

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-13 | As a user of the left bar, I want package buttons to stay inside their card at any width — the coverage line must truncate, never push the layout apart. | ✅ | Root cause: flex items refuse to shrink below nowrap content (`min-width:auto`). Fixed with `min-width:0` on `.clbtn`. Headless check: 0 buttons outside the card bounds; five-route sets render 2×2 again; coverage lines ellipsize. |

## 2026-08-06 · Simulation: QC pass — user + tester sweep of every surface (user request)

Persona: the user themselves as QC tester, clicking through every surface; one seeded defect
("the number of polyclinic is too small") plus everything else found on a 12-state headless
walkthrough (initial, health layers, package, drill-down, ranking, shading, search, finder,
QSR heat, export modal, rail focus, mobile).

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-27 | As a seller pitching health audiences, I want the polyclinic layer to be complete — 8 of Singapore's 26 polyclinics is a credibility hole a client will spot. | ✅ | `poi_polyclinics.json` 8 → 26 entries (all SingHealth / NHGP / NUP polyclinics); dropdown, chip, ranking and 400 m counts all pick the count up from data. |
| US-28 | As a user scanning the island, I want sparse, high-value layers (hospitals, polyclinics, libraries, cinemas) visible at island zoom — not 3 px specks. | ✅ | Dot radius now scales with layer sparsity (≤60 places → 5.5 px, ≤200 → 4.25 px, else 3 px) with a matching hover size; screenshot before/after. |
| US-29 | As a user closing a dropdown with Escape, I never want my route selection wiped as a side effect. | ✅ | Found on walkthrough: Esc in the place finder closed its list *and* cleared 5 routes. Finder now stops propagation, and the document Esc handler closes an open finder list before anything else. Headless: Esc with finder open → selection intact. |
| US-30 | As a user reading the selection card, I want the "within 400 m" list to show what's actually nearby — not 30 rows padded with zeros. | ✅ | Zero-count layers fold into one muted line; non-zero rows unchanged. |
| US-31 | As a user, I want the interface to feel smooth — hover and state changes eased, the export modal entering softly — without motion when I've asked the OS for less. | ✅ | Shared micro-transition on interactive rows/buttons/chips, modal fade+rise entrance, CTA hover lift; all disabled under `prefers-reduced-motion: reduce`. |

Known-minor (logged, not fixed): a terminus label can overlap a planning-area label when a
choropleth is on (two independent decluttering passes); QSR fan-out pins can sit over heat
maxima. Neither blocks a sell.

## 2026-08-06 · Simulation: POI sweep — sales agent building audience stories (user request)

Persona: a Moove Media seller who lives in the Places panel — every layer is an audience
story ("routes hitting commuter hubs", "coverage around event venues"). Full data audit of
all 34 POI files plus the gaps a seller would hit.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-32 | As a seller quoting place counts to a client, I want every layer's data clean — no stray coordinates, unnamed places or accidental duplicates. | ✅ | Scripted audit of all 34 `poi_*.json`: 0 out-of-bounds points, 0 missing names; remaining dup names are real chains (FairPrice ×N), shared coordinates are same-building places. Only genuine gap (polyclinics 8→26) fixed in US-27. |
| US-33 | As a seller pitching commuter reach, I want an MRT/LRT interchange layer I can rank routes against — "hits 6 interchanges" is a headline claim. | ✅ | `poi_interchanges.json` (35 stations on 2+ drawn lines) derived from the app's own rail data, so it agrees with the rail legend; appears under a new "Transit hotspots" category, rankable and 400 m-countable like any layer. |
| US-34 | As a seller selling event-driven campaigns, I want the island's major event & convention venues as a layer. | ✅ | 11 curated venues (Expo, Suntec, Sands Expo, National Stadium, Indoor Stadium, Esplanade, Star Theatre, NS Square, Fort Canning, RWS Convention, Our Tampines Hub) with kind labels in tooltips; footer notes the list is curated. |
| US-35 | As a seller scanning "Rank routes by…", I want the 30+ layers grouped by category — a flat alphabetical-ish list makes me read every entry. | ✅ | Ranking dropdown now uses the same category optgroups as the add-layer picker; also fixed the latent picked-places insert that would throw once optgroups exist (insert against a nested option). |

Backlog (needs real data, not fabricatable offline): hawker centres (~118), petrol stations
(~180) — both strong seller layers when a source is available.

## 2026-08-06 · Simulation: five sales personas, full workflows (user request — "beta test yourself")

Each persona was walked through their real workflow against the live app; every wall they hit
became a story with a built solution, then the whole workflow was re-run headless.

**P1 · Corridor planner** — sells "your ad rides the north–south AND east–west spines".
**P2 · QSR account manager** — anchor-brand heat → rank by rival outlets → top routes → deck.
**P3 · Event promo planner** — pin Singapore Expo → rank routes reaching it → top routes → JPG.
**P4 · Seller mid-pitch** — shares the exact map with a colleague; reopens it next morning.
**P5 · Deck builder** — package → summary + per-route slides → client-ready PPTX.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-36 | (P1) As a corridor planner, I want several rail lines focused at once — tapping EWL must not unfocus NSL; the two-spine story needs both lit. | ✅ | Rail focus is now a set: legend rows toggle independently, focused lines full-colour w4, others desaturate, stations shown for the union, "All lines" clears. Headless: EWL+NSL both active, union stations drawn, CCL desaturated. |
| US-37 | (P2/P3) As a seller who just ranked routes, I want the top 5 in my selection in one tap — not five taps, five map re-fits. | ✅ | "＋ Add top 5" button above the ranked list (hidden once the top 5 are all selected; adapts to <5 results); one tap → one addRoutes → one re-fit. Headless: rank by KFC outlets → tap → 5 routes selected, rows marked. |
| US-38 | (P3) As a promo planner, I want pin venue → rank against it → top routes → export to work as one unbroken flow. | ✅ | Headless end-to-end: pick "Singapore Expo", rank "your 1 picked place", Add top 5, export JPG — file renders with the pin + legend row and the 5 routes. |
| US-39 | (P4) As a seller, I want my selection and focused lines in the URL, so the exact map can be sent to a colleague or reopened tomorrow. | ✅ | Hash state `#r=190,518&l=EWL,NSL` written on every change (replaceState, no history spam) and restored on load — verified by reloading the page on the deep link: 5 routes + 2 focused lines return. |
| US-40 | (P5) As a deck builder, I want the full PPTX to actually generate — hero + summary + one slide per route. | ✅ | First-ever unstubbed run with the real pptxgenjs: Set 1 with summary + per-route on → .pptx unzips to 7 slides (hero, summary, 5 routes), 1 embedded map image. |

### Follow-up defects (user report: "Lasalle has a few campuses" / "SIT has moved to Punggol")

The US-32 audit was not good enough: it checked bounds, names and duplicates but never an
entry's *internal* consistency, so a point and its own footprint from two different campuses
sailed through. Both reported errors were exactly that class.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-41 | As a user reading the arts layer, I want LASALLE's two campuses shown as two places — the old entry drew one footprint at Winstedt and nothing at the flagship McNally campus. | ✅ | Split into McNally Campus (point + 90 m approx extent, Rochor) and Winstedt Campus (the existing footprint, centroid point) in `poi_arts.json` and `poi_ihl.json`; both render, 1.4 km apart, each with its own tooltip. |
| US-42 | As a user, I want SIT shown at Punggol — its point was right but the attached footprint was the old Dover campus, 19 km away, and the footprint is what the map draws. | ✅ | Stale Dover polygon dropped in `poi_uni.json` / `poi_ihl.json`; SIT now renders at Punggol with a 280 m approx extent and "Punggol campus" in the tooltip. |
| US-43 | As the maintainer, I want the check that would have caught this to run on every data edit — not live in a throwaway script. | ✅ | `tools/qc_poi.py` committed: names, bounds, exact-dupe rows, and point↔footprint consistency (inside-or-within-150 m; big campuses pass, stitched entries fail loudly). CLAUDE.md now requires running it after any `poi_*.json` edit. All 36 layers pass; per-point `approxM` support added so footprint-less campuses render as honest extents. |
