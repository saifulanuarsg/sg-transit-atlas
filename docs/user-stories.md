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

### Follow-up defect (user screenshot, PR #5)

| # | Story | Status | Check |
|---|-------|--------|-------|
| US-13 | As a user of the left bar, I want package buttons to stay inside their card at any width — the coverage line must truncate, never push the layout apart. | ✅ | Root cause: flex items refuse to shrink below nowrap content (`min-width:auto`). Fixed with `min-width:0` on `.clbtn`. Headless check: 0 buttons outside the card bounds; five-route sets render 2×2 again; coverage lines ellipsize. |
