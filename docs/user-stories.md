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
| US-44 | As a seller quoting the Atlas to a client, I want the most up-to-date information and proof it's been verified — I should never have to double-check a number before saying it out loud. | ✅ | Two mechanisms: (a) the checker now enforces **known-complete floors** for enumerable layers (26 polyclinics, 6 universities, 5 polytechnics, 3 ITEs, 11 JC/MI, 26+ interchanges…) — the polyclinics=8 class of gap now fails the check instead of shipping; (b) every checker run writes `data/qc_report.json` (layers, place count, checks passed, verified-on date) and the app's Data sources panel leads with that live verification line — the trust signal is generated by the actual check, never hand-written. Sabotage-tested: truncating polyclinics to 8 fails the checker. |
| US-45 | As a user of the map-layers panel, I want a Reset there too — after stacking place layers, shading, heat and rail focus, unwinding them control by control is a chore. | ✅ | "Reset" button in the right panel head: removes all place layers and picks, place names off, scope back to All, audience/property shading cleared, QSR heat off, rail lines (and focus) off, trunk/hubs off. Headless: dirty everything → one tap → all layer groups off the map, shading none, chips empty; route selection deliberately untouched (that's the left bar's Reset). |

---

## 2026-08-13 · Simulation: Moove Media account manager pitching Frasers Property Singapore (PR #10)

Persona: account manager preparing a landlord pitch. The brief was "add Fraser malls as a
cluster and map out the Moove assets to them" — so the walkthrough starts where the client
starts, from their own portfolio, and ends at a route package that can be exported.

**Double-checking the malls came first**, and it changed the list. Frasers Property Singapore
manages **twelve** malls — Causeway Point, Century Square, Eastpoint Mall, Hougang Mall,
Northpoint City, Robertson Walk, Tampines 1, The Centrepoint, Tiong Bahru Plaza, Valley Point,
Waterway Point, White Sands. Four corrections fell out of the check:

- **Changi City Point is not one of them** — FCT divested it in 2023. It is still in the OSM
  mall layer, and would have gone into the pitch on a from-memory list.
- **Northpoint City is one mall, not a wing** — FCT bought the South Wing in May 2025 and now
  owns both wings.
- **nex is a thirteenth entry, not a twelfth** — FCT half-owns it, but it is not one of the
  managed twelve. It is in the layer, labelled as what it is.
- **Eastpoint Mall sits in the OSM mall layer as "East Point"**, and **Robertson Walk is not in
  it at all** — deriving the client layer from the existing mall layer by name would have
  silently dropped two of their twelve.

Every coordinate is a OneMap geocode of the mall's own postal address, not an estimate — see
US-57, which is where the second half of the checking paid off.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-46 | As an account manager pitching Frasers, I want their portfolio as its own layer — I should not have to remember which of 237 OpenStreetMap malls are theirs, or trust that the names match. | ✅ | `data/poi_frasers.json` (13) as its own layer, colour `#1E40AF`, in Retail & dining. Headless: layer loads 13/13 with the four regions; offered in the add-layer picker ("✓ Frasers malls · 13") and in the reach ranking. Ownership is carried per mall, so the two non-FCT and two half-owned entries read as what they are. |
| US-47 | As an account manager, I want one tap to put the buses that serve their malls on the map — assembling that list by hand from 279 candidate services is the whole job. | ✅ | New "Frasers malls" package block, four regional sets of 12. Headless: tap East → 12 routes selected, map refits, export CTA live. |
| US-48 | As an account manager, I want the button to tell me which *malls* it covers — "Tampines Int · Pasir Ris" is the right line for a corridor package and the wrong one for a landlord package. | ✅ | Sets carry `places`; `buildClusters` prints those instead of the derived termini. Buttons read "Century Square · Tampines 1 · White Sands · Eastpoint Mall" etc., ellipsized with the full list on hover. |
| US-49 | As an account manager, I want the malls on the map the moment I tap the package — a package sold on named places is unreadable without them. | ✅ | `selectCluster` switches the package's `poi` layer on. Headless: after tapping East, `map.hasLayer(groups.frasers)` true and the chip reads "Frasers malls 13". Screenshot `shot-east.png`. |
| US-50 | As an account manager mid-call, I want to hover one mall and say how many buses stop at its door and which ones. | ✅ | Mall tooltip: "**Tampines 1** / FCT-owned · Tampines · Frasers malls / **44** bus services at 14 stops within 400 m / busiest stop first — 3, 19, 37, 38, 4, 8, 81, 291, 28, 29 +34 more". Screenshot `shot-tooltip.png`. |
| US-51 | As a planner, I want these route lists derived from the live network, not typed in — a hand-listed package goes stale the first time a service is amended and nobody notices. | ✅ | `mapFrasersAssets()` derives everything at load from `stops.json` + `network.json` + `stop_volume.json`; nothing about the packages is hardcoded but the four regions and the two caps. Rule: stop within 400 m of the mall point; rank by malls covered, then weekday boardings at those stops; top 12. |
| US-52 | As a reviewer, I want to see the mapping in a diff — not only on someone's screen — so a package that moves because the network moved shows up in a pull request. | ✅ | `tools/frasers_assets.py` runs the identical rule offline into `docs/frasers-assets.md` (mall table, per-package tables with boardings, per-mall reach, every service mall by mall). Headless: the four sets in the running app match the committed doc exactly. |
| US-53 | As an account manager, I want to know where the story is thin before the client tells me. | ✅ | Three of the thirteen are structurally quiet: **Eastpoint Mall** has 9 services at its door (Simei is fed, not trunked) and only 2 of the East package's 12 reach it; **Valley Point** has 9 and **Robertson Walk** 11. The generated doc prints "Reaching each mall" under every package, so the thin one is visible before the meeting rather than in it. |
| US-54 | As a seller, I want a Frasers package to behave like every other package — clear on second tap, share by link, name the export. | ✅ | Headless: second tap clears (0 selected, no match); the older packages still select and match; share URL `#r=123,14,65,32,64,16,16M,121,195,195A,143,139` reopens in a fresh page as `frasers-central`; export title "Frasers malls · Central", filename `bus-routes-frasers-central`. |
| US-55 | As the maintainer, I want a truncated mall list to fail the checker, the same as the polyclinics gap did. | ✅ | `poi_frasers.json: 13` added to the known-complete floors in `tools/qc_poi.py`. Full run: 37 layers · 5,877 places, all invariants pass. |
| US-56 | As a user on a laptop, I want the new buttons to stay inside their card at any width — the US-13 regression guard, now with much longer coverage lines. | ✅ | Headless at 1024 / 1280 / 1440 / 1920 px: 12 buttons, 0 outside the card, no horizontal scroll, every coverage line ellipsized. |
| US-57 | As the person who has to say these numbers out loud, I want every mall point to come from an authority, not from my best guess at where a mall is. | ✅ | All 13 re-geocoded from OneMap's own postal-address dump (reached via the `xkjyeah/singapore-postal-codes` OneMap dump on GitHub — OneMap itself is blocked from this environment, GitHub is not). Ten were already within 20 m. Three were not, and two of those changed the answer: **Robertson Walk was 134 m out** (my postal-address estimate put it west of Unity Street; OneMap has it at 1.29187, 103.84145) → 6 → 8 stops, 10 → 11 services; **nex was 52 m out** → 16 → 13 stops, which reshuffled the North-East package (119 out, 136 in); **Northpoint City** is now the midpoint of its two wings, which are 160 m apart and are one mall since FCT bought the South Wing → 12 → 14 stops. Re-verified headless after the correction: all four packages in the running app still match the regenerated doc exactly, 0 buttons outside their card at 1024–1920 px, no console errors. |

### Follow-up (user: "https://www.frasersexperience.com/find-a-mall — these are the malls")

The layer's twelve matched Frasers' own FRx directory exactly. The one divergence was mine:
I had added **nex** as a thirteenth entry on the reasoning that FCT half-owns it. FRx does not
list it, because it is not one of Frasers Property Singapore's malls — so the pitch it belongs
in is an FCT-ownership pitch, not this one. Removed.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-58 | As the client-facing owner of this list, I want it to be exactly what Frasers publishes as their malls — a thirteenth mall I reasoned my way into is a thirteenth thing to defend in the meeting. | ✅ | nex dropped; layer is the FRx twelve, and the sources panel now cites FRx as the list's authority rather than a reconstruction. Completeness floor 13 → 12. Headless: 12/12 malls, "✓ Frasers malls · 12" in the picker, all four packages match the regenerated doc, 0 buttons outside their card at 1024–1920 px, no console errors. |
| US-59 | As a seller, I want the North-East package to still be worth buying once nex leaves it — nex was carrying that set. | ⚠ | It is thinner and honestly so. The set was anchored on three malls, of which nex was the busiest; on Hougang Mall + Waterway Point only 6 services serve both, so the package now runs 82, 62, 136, 119, 62A, 381 and then fills with Waterway-only services. Reach is lopsided: **Waterway Point 11 of the 12, Hougang Mall 6 of the 12** — printed under the package in the generated doc. Worth a look at whether North-East should be two single-mall stories instead of one regional set. |

### Follow-up (user: "Robertson Walk permanently closed on May 31, 2025")

Correct, and the miss was mine. I checked two things about this list — is each mall Frasers',
and is each point where I say it is — and never the third: **is it still open?** Robertson Walk
was on Frasers' own portfolio and FRx pages, and is still tagged `shop=mall` in OpenStreetMap,
months after it ceased operations on 31 May 2025 (FRx benefits stopped 30 April 2025; the site
goes to a Frasers / Sekisui House residential redevelopment by 2028). Every source I checked
agreed with itself and was stale. Eleven malls, not twelve.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-60 | As a seller, I never want a closed mall in a package. A shut mall in a Frasers pitch is worse than a missing one — it is the client's own asset, and they know exactly when it shut. | ✅ | Robertson Walk removed; layer is 11. Central regenerates to The Centrepoint · Tiong Bahru Plaza · Valley Point (14, 65, 16, 16M, 123, 121, 32, 64, 122, 123M, 195, 195A). North, North-East and East unchanged. Headless: 11/11, "✓ Frasers malls · 11", all four packages match the regenerated doc, 0 buttons outside their card at 1024–1920 px, no console errors. |
| US-61 | As a seller, I want to know a mall is about to be redeveloped *while I am looking at it*, not after I have sold a campaign into it. | ✅ | Optional `note` on a mall renders in its tooltip as an amber ⚑ line. **Valley Point** carries "redevelopment approved — trading now" — it trades today but has written permission for a full-site redevelopment. Also a `Watch` column in the generated doc. |
| US-62 | As the maintainer, I want the check I skipped written down, so the next client layer does not repeat it. | ✅ | Three places: CLAUDE.md gains the rule ("a client/venue layer needs two checks, not one: is it theirs, and is it still open?"); the generated doc leads with it and names the three malls deliberately absent (Robertson Walk closed, Changi City Point divested, nex not theirs) so their absence reads as a decision rather than a gap; the sources panel dates the trading check (Aug 2026). Completeness floor 12 → 11. |

### Follow-up (user: "include Commercial Spaces to the mall list. call it Frasers" · "decide on the top 5 buses that cover all frasers assets")

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-63 | As a seller pitching Frasers, I want their whole footprint in one layer — the offices and the business park are the same client and the same meeting as the malls. | ✅ | Layer renamed **Frasers** and widened to 16 spaces: the 11 FRx malls plus Frasers Tower, 51 Cuppage Road, Central Plaza, Alexandra Point and Alexandra Technopark, each carrying a `type` (Retail / Commercial). **Cross Street Exchange is not in it** — FLCT divested it to PAG on 31 Mar 2022; the two-question rule (is it theirs, is it open?) caught it before it shipped. Headless: 16/16 load, picker reads "✓ Frasers · 16". |
| US-64 | As a seller, I want the smallest buy that reaches every Frasers space — "how many buses do I actually need?" is the question I get asked, and I should not answer it by eye. | ✅ | **Five services reach all 16: 65, 963, 39, 107, 38.** Derived in-app by greedy set cover (most still-uncovered spaces first, ties by boardings) and shipped as an **All 16** package button. Proven minimal offline: an exhaustive search over every 4-service combination, seeded on Eastpoint Mall (the scarcest space, only 9 services reach it), finds none. 65 alone carries 7 of the 16. |
| US-65 | As a reviewer, I want the minimum buy in the audit doc too, not only as a button. | ✅ | `docs/frasers-assets.md` gains a "minimum buy" section listing each service and the spaces it brings in, plus the selection string. The app's derived set matches it exactly in a headless run. |

---

## 2026-09-01 · Bug: the map watermark blocking beta testing (015-basemap-watermark)

Not a persona simulation — a defect report from beta testing: *"need the watermark on the map to
disappear."* Stories were written to [`specs/015-basemap-watermark/spec.md`](../specs/015-basemap-watermark/spec.md)
before the build, per Principle I, and checked against the running app after it.

The watermark is CARTO's, burnt into every tile because `BASEMAP_KEY` was empty and their raster
basemaps went key-gated in 2026. No CARTO key exists and none can be obtained from this
environment, so the fix is not "set the key" (still the intended end state, still one line) but
"stop having a watermarked state": keyless, the app no longer requests those tiles and draws
Singapore from the planning-area polygons it already loads.

Evidence: three headless Chromium suites against `python3 -m http.server`, with Leaflet,
html2canvas and pptxgen served locally rather than from the blocked CDNs. **32/32 checks passed.**

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-66 | As a beta tester, I want to open the atlas and see a map, not a third party's error notice tiled across it — right now I cannot give feedback on the product because the product is covered in writing. | ✅ | Headless keyless run: **0 requests to any watermarking tile host** (the assertion is zero requests, not "no watermark visible"), `baseTiles === null`, 0 tile `<img>` in the DOM, land layer on the map. Screenshot: Singapore in near-white over bluish water with district hairlines, no text anywhere on the map. |
| US-67 | As a tester, I want it clean at every zoom, not just the opening view. | ✅ | Panned and zoomed z11 → z13 → z15 → z17; still 0 tile-host requests, no tearing or misregistration against the routes. Four screenshots. |
| US-68 | As a seller, I want everything I actually sell with — routes, stops, rail, places, shading, density — to stay legible over the new ground. | ✅ | 5 routes + population choropleth + labels: all distinguishable on screenshot. Ground survived a choropleth repaint (`#f7f8f9`/1 intact) — it has its own layer precisely because `paintChoro` rewrites the area layer's style. Area tooltips and the area drill-down still work: `elementFromPoint` at map centre returns the Leaflet overlay, not the land pane. |
| US-69 | As a seller, I want the export — the thing I actually send — to carry the new basemap and not break. | ✅ | JPG exported through the app's own button (165 KB) and deck through its own button (170 KB). Exported frame samples as **both** land and water pixels, so the ground is genuinely in the image. `toDataURL` succeeds → canvas not tainted. Removing the cross-origin tile layer makes this strictly safer than before. |
| US-70 | As a seller, I don't want export to get slower because the basemap changed. | ✅ | `tilesReady()` resolves in **0.1 ms** keyless (it previously waited on a tile `load` event with an 1800 ms timeout — with no tile layer that timeout would have been paid in full on every export). |
| US-71 | As the owner, I want the streets back the moment I have a key, with no other edit. | ⚠ | **Cannot be verified against real CARTO here** — the proxy blocks every tile host, so a keyed run renders grey and is indistinguishable from a failure. What *was* verified, with the tile host stubbed: a key builds the tile layer, 20 tiles render, the ground is built but **not** added (exactly one basemap showing), the URL is the unchanged `light_all` URL with `?api_key=` appended, the attribution reverts to the CARTO credit, and the export is 100% tile pixels and untainted. That is our wiring proven; that a real CARTO key is accepted by CARTO is a browser check, listed in [`docs/basemap.md`](basemap.md). |
| US-72 | As the owner, I don't want a key that has expired, been revoked or run out of quota to leave testers looking at a grey void. | ✅ | Junk key against the blocked host: tiles error → tile layer removed → ground shown, no uncaught errors. Screenshot. **Known limit, stated rather than hidden:** a host answering `200 OK` with a watermarked *image* cannot be caught this way — which is why the keyless path makes no request at all. |
| US-73 | As the owner, I want to know the atlas is running on the fallback; as a tester or client, I want no sign of it. | ✅ | Console carries an informational line naming the trade and the one-line fix. Nothing about basemap mode appears on the map, in the sidebar, in the sources strip, or in any export — confirmed on every screenshot and in both exported files. |
| US-74 | As the owner, I don't want the atlas to break outright if the file the ground is drawn from ever fails to load. | ✅ | `planning_areas.geojson` aborted at the network layer: app still starts, no uncaught JS exception, no ground built, routes still select and draw over plain water, demographics disables itself as it already did, and export still produces an untainted canvas with no basemap at all. Screenshot. |

**Not claimed:** that the fallback is as good as Positron. It is not — it has no streets, and at
street zoom that is a real loss for a seller drilling into one stop's surroundings. It is better
than a watermark, it is reversible in one line, and the trade is written down in
[`docs/basemap.md`](basemap.md) rather than left for someone to discover.

### Follow-up (user: "I still need a map")

Fair, and the right call. The first build removed the watermark and left a coastline — Singapore's
outline over water, with nothing inside it. That is a silhouette, not a basemap: you cannot find
Orchard on it, tell a reservoir from a town centre, or place a stop in its surroundings. Removing
the watermark was necessary and not sufficient.

The fix was already in the repository. `data/network.json` holds 612 bus services and **every one
is road-aligned** — 33,025 polyline points that follow real roads, not stop-to-stop chords. Bus
routes run on roads, so their union *is* the road network. Drawn pale and thin underneath
everything, from a file the app already fetches on every load, it turns the outline into a map at
no watermark, no key and no third-party host.

Evidence: same three headless suites, re-run after the change. **33/33 checks passed** (up from
32 — a new road assertion). Two assertions were corrected rather than the code: the ground is a
layer group now, and a missing `planning_areas.geojson` no longer means no ground.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-75 | As a tester, I want to look at the map with nothing switched on and know where I am — the outline told me the shape of Singapore and nothing else. | ✅ | All **612** road-aligned services drawn into the ground, 612/612 on the map, **33,025 points**. Screenshots at z12/z14/z16: expressways, town-centre grain, the CBD, the Jurong industrial grid and Changi all legible with zero layers toggled. |
| US-76 | As a seller, I want the ground roads to stay out of the way of the routes I am actually pitching. | ✅ | Ground roads are `#d2dadf` hairlines under every content pane and non-interactive; screenshot with 5 routes + population shading shows the selection clearly dominant. The user-facing "Trunk bus services" layer keeps its own styling, hover and click — untouched. |
| US-77 | As a seller, I want it readable both when I'm looking at the whole island and when I'm zoomed into one stop. | ✅ | Stroke banded by zoom (.7 px at z≤11 → 3.6 px at z≥17) on `zoomend`, guarded so a pan inside a band restyles nothing. A single 1 px width was verified too faint at z16; a single 2.6 px smeared the island view. First colour `#dbe0e4` was also too faint at street zoom and was darkened after looking at renders. |
| US-78 | As the owner, I don't want the richer ground to slow the tool down or bloat the export. | ✅ | 5 full re-renders of the whole ground: **543 ms** (~109 ms each). `captureFramed` 1281–1829 ms, unchanged from the 1542 ms measured before the roads existed. No new file, no new fetch, no new dependency. |
| US-79 | As the owner, I don't want the roads showing through once I have a real basemap. | ✅ | Keyed run with the tile host stubbed: **0 of 612** road lines on the map, ground built but not added, exported frame 100% tile pixels. |
| US-80 | As the owner, I want the map to survive one of its two data files failing, not just neither. | ✅ | `planning_areas.geojson` aborted: roads still draw over plain water, map still orientable, routes still select, export still untainted, no uncaught exception. The ground now degrades in parts rather than all at once. |

**Still not claimed:** that this is Positron. It is road *centrelines* only — no street names, no
buildings, no parks or inland water, and no minor road the bus network never touches. A seller
zoomed into one stop sees the road pattern but cannot read off a street name. Setting
`BASEMAP_KEY` remains the one-line switch to the real thing.

---

## 2026-09-04 · Bug: "not good, we need a better map" (016-ground-labels)

A second defect report on the same surface, and the sharper one. 015 removed the watermark and
gave the keyless basemap a coastline and roads; the verdict was still *not good enough*, with the
instruction *"the beta testers need it fast — think about their needs."*

What testers actually needed was **names**. The built-in basemap named nothing: you could see the
shape of a road but not which road, a built-up blob but not that it was Tampines. For a seller
mid-pitch — "this route runs the length of Bukit Timah Road" — an unnamed map is a diagram.

No tile provider was needed. Both name sets were already in the repo, unused: every one of the
**5,207 entries in `data/stops.json` carries the road it stands on at index 3** (860 distinct
roads — the street index of Singapore, already positioned and already loaded), and the 55 planning
areas carry town names.

Evidence: headless Chromium, CDN libraries served locally. **34/34 checks** across the three
suites from 015 (up from 33 — one new assertion), plus the label-specific run below. **No ⚠ this
time**: unlike 015, every story here is verifiable in this environment, the keyed case included.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-81 | As a tester, I want to know which part of Singapore I'm looking at, with nothing switched on. | ✅ | 55 town points built; **39 drawn at z12** after de-overlap, zero overlapping. Screenshot: Sembawang, Woodlands, Yishun, Tampines, Jurong East, Queenstown, Bukit Merah all legible across the island. |
| US-82 | As a seller, I want to name the road a route runs on, from the map. | ✅ | 1,285 road label points from 860 roads. At z16 over Orchard the map reads **Orchard Rd, Orchard Blvd, Orchard Turn, Scotts Rd, Paterson Rd, Grange Rd, Somerset Rd, Stevens Rd, Tomlinson Rd, Bt Timah Rd, Dunearn Rd, River Valley Rd** — correct for that location, checked against the real geography. |
| US-83 | As a seller, I don't want a road named five times because five of its stops are on screen. | ✅ | One label per road name per view. z15 over Tampines: 28 labels, **0 duplicates**. |
| US-84 | As a seller working the CBD — the densest, most valuable part of the island — I want the names legible, not stacked on each other. | ✅ | Greedy screen-space de-overlap, best-first by rank (towns by area, roads by stop count) so the survivors are the significant ones. Before: `TANGLIN NEWTON` / `ORCHARD ROCHOR` / `DOWNTOWN CORE OUTRAM MARINA SOUTH` printed over each other at z12 — caught on a screenshot, not in review. After: clean, 47 → 39 labels. |
| US-85 | As a seller, I want the names in the file I send the client, not just on my screen. | ✅ | Real `captureFramed` render with routes 7 and 14: the exported frame reads Clementi, Queenstown, Tanglin, Orchard, River Valley, Downtown Core, Kallang, Geylang, Marine Parade, Bedok, Tampines with the two routes over it. No export code changed — the labels sit in the existing `label` pane the capture already snapshots. |
| US-86 | As the owner, when I finally set a key I don't want two sets of street names fighting each other. | ✅ | Labels gated on the same `landWanted` flag as the ground itself, so nothing is even constructed on the keyed path. Verified with the tile host stubbed: **0** `.roadlab`/`.townlab` in the DOM. They also follow the ground back on a `tileerror` fallback. |
| US-87 | As a seller shading by demographics, I don't want the town name printed twice. | ✅ | The choropleth already draws its own area names. Ground town names suppressed while shading, cleared on the spot via `paintChoro` rather than on the next pan: z12 + shading → **0 town labels, 48 area labels**. |
| US-88 | As anyone using the map, I don't want it to get slower or lose a click. | ✅ | Only the screenful in view is built, on `moveend`; 1,285 candidates never all exist at once. Labels are `pointer-events:none` — every existing hover, tooltip and drill-down unchanged, confirmed by the 015 suites still passing 34/34. |

**Still not claimed:** this is not Positron. No buildings, no parks or inland water, and no road
the bus network never touches — road names come from bus-stop data, so a road with no stops has no
name here. Setting `BASEMAP_KEY` remains the real fix, and this whole layer deletes itself when
you do.

**Also corrected:** `docs/basemap.md` said getting a CARTO key needs "a free account". It doesn't —
anyone can request one at carto.com/basemaps/apikey, commercial use included. That overstatement
is part of why the key never got set.

### Follow-up (2026-09-04): the basemap key is set

`BASEMAP_KEY` now carries a real CARTO key, so the atlas is on Positron and the built-in map
built in 015/016 has become what it was always meant to be — the fallback, not the daily view.

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-71 | As the owner, I want the streets back the moment I have a key, with no other edit. | ⚠ | **Still ⚠, deliberately.** Setting the key was the only edit, and with the tile host stubbed everything wires correctly: tile layer on with 20 tiles, ground off, **0** built-in labels, attribution back to CARTO, URL is the unchanged `light_all` path with `?api_key=` carrying the real key, export untainted. But this environment's proxy blocks `basemaps.cartocdn.com`, so **whether CARTO accepts this particular key is not something I can test** — that is a browser check, and the story stays ⚠ until someone loads the live site and sees streets. |

The failure path is what makes shipping this safe without that check: if the key is wrong, tiles
error, and the app falls back to the built-in map from 015/016 rather than to a grey void or a
watermark. The worst case is that the site looks exactly like it did an hour ago.
