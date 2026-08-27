# Feature Specification: Transit Network Atlas

**Feature Branch**: `001-transit-network-atlas`

**Created**: 2026-07-16

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `59f413f`…`77276f0` (2026-07-16).

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. The
> specification below was reconstructed from the running application, `data/*.json`, and the
> commit history — it did not drive the build. It is recorded so the Constitution Check in
> future plans has a baseline to reason against. Do not read it as evidence that Principle I
> (Spec-Driven Delivery) was followed here; it was not, because the workflow did not yet exist.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the whole network at once (Priority: P1)

A media planner opens the atlas and sees every bus and rail service in Singapore on one map,
without choosing anything first. They can zoom to a town, follow a corridor, and read where
services actually run.

**Why this priority**: Nothing else in the product is usable without a trustworthy base map.
Every later feature — selection, ranking, export — renders on top of this.

**Independent Test**: Open the app with no selection and confirm the bus and rail network
renders across the island with correct geometry and no missing services.

**Acceptance Scenarios**:

1. **Given** a first visit with nothing selected, **When** the map loads, **Then** the bus and
   rail network is drawn across Singapore and layers default to off so the map starts legible.
2. **Given** the map at island zoom, **When** the user zooms into a town centre, **Then** route
   lines follow the road alignment rather than cutting corners between stops.
3. **Given** a route that runs a loop, **When** it is drawn, **Then** it renders as a single
   direction rather than a doubled round-trip line.
4. **Given** the map at any zoom, **When** the user pans, **Then** the viewport stays constrained
   to Singapore and cannot be panned or zoomed away to empty world.

---

### User Story 2 - Read a stop's catchment (Priority: P1)

A planner points at a stop and understands what sits within walking distance of it, so they can
speak to who a service reaches rather than only where it goes.

**Why this priority**: Catchment is the unit the product sells on. A route is only interesting
because of what it passes.

**Independent Test**: Select any stop and confirm its walking catchment and the places inside it
are reported.

**Acceptance Scenarios**:

1. **Given** a stop on the map, **When** the user inspects it, **Then** the places within its
   walking catchment are identified.
2. **Given** a route end, **When** its terminus is labelled, **Then** the label names the nearest
   interchange rather than an arbitrary nearby stop.

---

### User Story 3 - See modelled audience impressions (Priority: P2)

A planner sees an estimate of how many people of a chosen segment a service reaches over a
campaign period, so a route package can be compared against another on audience rather than
on line length.

**Why this priority**: This is the product's differentiator, but it depends on Stories 1 and 2
being correct first — a wrong catchment makes a confident wrong number.

**Independent Test**: Choose a demographic segment and confirm a 12-week impressions figure is
produced and is labelled as modelled.

**Acceptance Scenarios**:

1. **Given** a demographic segment, **When** the user shades the map by it, **Then** an
   impressions estimate is derived from passenger volume and census composition.
2. **Given** any surface showing an impressions number, **When** it is displayed, **Then** it is
   labelled as modelled rather than measured.
3. **Given** no segment is shaded, **When** the map renders, **Then** planning-area boundaries
   stay hidden so they do not read as data.

### Edge Cases

- A route whose recorded geometry collapses a spur — stop-aware cleaning must restore it rather
  than draw a shortcut past stops the service actually serves.
- Two routes sharing a road — lanes must spread enough to stay countable, capped so the spread
  never misrepresents which road a service is on.
- A stop with no passenger-volume record — the impressions model must not silently treat it as
  zero-reach without saying so.
- A service amended upstream — the network must be refreshable from source rather than patched
  by hand.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render every current bus and rail service in Singapore from open data.
- **FR-002**: Route geometry MUST follow real road alignment, sourced best-of-source rather than
  interpolated between stops.
- **FR-003**: System MUST draw one direction per route, not the round trip.
- **FR-004**: System MUST constrain the viewport to Singapore.
- **FR-005**: System MUST name each route end by its nearest interchange.
- **FR-006**: System MUST compute a walking catchment per stop and report the places within it.
- **FR-007**: System MUST derive an impressions estimate from passenger volume and census
  composition for a chosen demographic segment.
- **FR-008**: Every impressions figure MUST be labelled as modelled.
- **FR-009**: All layers MUST default to off on first load, with an empty-state hint explaining
  what to turn on.
- **FR-010**: Planning-area boundaries MUST be hidden unless a demographic segment is shaded.
- **FR-011**: System MUST run entirely client-side against static data files, with no backend.

### Key Entities

- **Stop**: A boarding point — position, name, the services calling at it, its walking catchment
  and its recorded passenger volume.
- **Route**: A bus or rail service — its ordered stops, its road-aligned geometry, and its two
  termini.
- **Place**: A point of interest with a name, a category and optionally a footprint.
- **Planning area**: A census geography carrying demographic composition, used to shade the map
  and to weight the impressions model.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The network matches the published open-data route list — no missing or stale
  services — verified against two independent sources.
- **SC-002**: All 317 feeder routes render road-aligned, with no corner-cutting between stops.
- **SC-003**: A planner can identify what a named route passes without consulting any external
  reference.
- **SC-004**: The map is legible at first load: no layer is on that the user did not ask for.
- **SC-005**: No impressions figure appears anywhere in the product without a modelled label.

## Assumptions

- Users are media planners and account managers, not the general public; domain vocabulary
  (interchange, feeder, trunk, catchment) needs no explanation in the UI.
- Open data is authoritative for the network; where two sources disagree on geometry, the one
  that keeps the line on the road wins.
- A 400 m radius is the working definition of walking catchment.
- Twelve weeks is the working campaign period for impressions.
- Desktop is the target; the product is used on a laptop in a meeting or over a screen share.
