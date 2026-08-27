# Feature Specification: Route Selection & Reach Ranking

**Feature Branch**: `002-route-selection-ranking`

**Created**: 2026-07-17

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `99d6943`, `ae16a03`, `54e464f`,
`3633841`, `87309d0`, `dec97a0`.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. The
> specification below was reconstructed from the running application and the commit history —
> it did not drive the build. See `001-transit-network-atlas` for the same caveat in full.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build a route selection (Priority: P1)

An account manager picks the services they want to talk about — by typing route numbers, by
clicking lines on the map, or by tapping a pre-built package — and the map narrows to show only
those, each in its own colour.

**Why this priority**: The selection is the pitch. Everything downstream — stop lists, ranking,
export — is scoped to it.

**Independent Test**: Enter several route numbers and confirm the map shows exactly those
routes, each distinguishable, with the rest of the network receded.

**Acceptance Scenarios**:

1. **Given** an empty selection, **When** the user enters multiple route numbers at once,
   **Then** all of them are selected together rather than one at a time.
2. **Given** a selection of several routes, **When** the map draws them, **Then** each is a
   distinct colour drawn from a palette wide enough to keep them apart.
3. **Given** a selected route that is a loop service, **When** it is drawn in a multi-route view,
   **Then** it renders as a single line, not a doubled one.
4. **Given** a package button, **When** the user taps it a second time, **Then** the selection
   clears.

---

### User Story 2 - Drill into what a route touches (Priority: P1)

With routes selected, the account manager works down a left-hand rail: the routes, then the
stops on each, then what sits around a chosen stop — without losing the map.

**Why this priority**: "What does this actually pass?" is the question every call turns on, and
answering it by reading the map alone is too slow to do while talking.

**Independent Test**: Select a route, open its stop list, and confirm the places near a chosen
stop are listed.

**Acceptance Scenarios**:

1. **Given** a selection, **When** the user opens the route rail, **Then** each route can be
   expanded to its ordered stops.
2. **Given** a stop in that list, **When** the user selects it, **Then** the places within its
   catchment are shown, filtered to the point-of-interest layers currently in play.
3. **Given** a long selection, **When** the rail renders, **Then** the route list appears once —
   not duplicated across panels.

---

### User Story 3 - Rank every route by reach (Priority: P1)

Rather than checking routes one at a time, the account manager asks which services reach the
places they care about, and gets an ordered list across the whole network.

**Why this priority**: This inverts the workflow from "check my guess" to "tell me the answer",
which is the difference between a tool and a reference.

**Independent Test**: Choose a set of places and confirm every route in the network is ranked by
how many it reaches.

**Acceptance Scenarios**:

1. **Given** places of interest, **When** the user opens the ranking, **Then** it defaults to
   scoring all trunk routes, not only ones already selected.
2. **Given** the ranking is open, **When** the user switches scope to the current selection,
   **Then** the ranking narrows to those routes.
3. **Given** an individually picked place, **When** the ranking runs, **Then** that place counts
   toward the score.

---

### User Story 4 - Read a package without the rate card (Priority: P2)

A pre-built package button tells the account manager where its routes run, so they do not have
to remember what "City Core" contains.

**Why this priority**: Reduces the memorisation the product exists to remove, but the packages
are usable without it.

**Acceptance Scenarios**:

1. **Given** a package button, **When** it renders, **Then** it carries a coverage line derived
   from the routes' termini or named places.
2. **Given** a coverage line too long for the button, **When** it renders, **Then** it is
   ellipsized with the full list available on hover, and never overflows its card.

### Edge Cases

- Routes sharing a corridor at low zoom — lane spread must stay zoom-aware so lines remain
  countable without misplacing them.
- A route number typed that does not exist — must fail visibly rather than silently selecting
  nothing.
- A selection large enough to exhaust the colour palette — colours must stay distinguishable or
  the view must say it cannot.
- Noisy recorded geometry producing spikes — must be cleaned without collapsing genuine spurs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to select multiple routes in one action by entering several
  route numbers together.
- **FR-002**: Selected routes MUST each render in a distinct colour.
- **FR-003**: A loop service MUST render as a single line in multi-route views.
- **FR-004**: System MUST provide a route rail listing the selection, expandable to each route's
  ordered stops.
- **FR-005**: Selecting a stop MUST list the places within its catchment, filtered by the active
  point-of-interest layers.
- **FR-006**: System MUST rank routes by how many chosen places they reach, defaulting to the
  whole trunk network.
- **FR-007**: Users MUST be able to switch the ranking scope between the whole network and the
  current selection.
- **FR-008**: Route lane spread MUST adapt to zoom so parallel services stay countable.
- **FR-009**: Package buttons MUST carry a coverage line describing where their routes run.
- **FR-010**: Tapping an active package a second time MUST clear the selection.
- **FR-011**: The left panel MUST be the routes-and-selection workspace and the right panel the
  map-layer controls, with no duplicated route list between them.
- **FR-012**: No product surface may carry internal ticket names or client-specific branding in
  labels shown during a pitch.

### Key Entities

- **Selection**: The ordered set of routes currently in play; scopes the stop rail, the ranking,
  and every export.
- **Package**: A named, pre-built set of routes with a derived coverage line.
- **Ranking entry**: A route paired with the count of chosen places it reaches.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An account manager can go from a brief to a scoped route selection without leaving
  the app or consulting a rate card.
- **SC-002**: The ranking scores all 293 trunk routes by default.
- **SC-003**: Every route in a multi-route selection is visually distinguishable at island zoom.
- **SC-004**: Package buttons stay inside their card at every supported window width, with no
  horizontal scroll.
- **SC-005**: No internal or third-party client name appears in any label visible during a pitch.

## Assumptions

- The account manager knows the route numbers they want, or wants the tool to find them — both
  entry paths are needed.
- Trunk routes are the sellable inventory; feeders are shown but are not the ranking default.
- Packages are curated rather than generated, except where a later feature derives them.
- The client is often watching the same screen, so nothing internal may be on it.
