# Feature Specification: Client-Ready Deck & Image Export

**Feature Branch**: `003-deck-export`

**Created**: 2026-07-16 · last materially revised 2026-08-06

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `806e46e`, `67e6627`, `aac3446`,
`4ec5df2`, `4039e4b`, `baceda9`, `fe7a69f` (PR #6), `efd3b50` (PR #7), and the export stories
US-14…US-26 in `docs/user-stories.md`.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. The
> specification below was reconstructed from the running application, the exported artefacts,
> and the user-story log — it did not drive the build. See `001-transit-network-atlas` for the
> caveat in full.
>
> This spec describes the **final shipped layout** (map band on top, info bar below). Two
> earlier layouts — a floating card over the map, then a full-height sidebar on the left — were
> superseded during PR #7 and are recorded here only as rejected alternatives.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export a deck that needs no editing (Priority: P1)

An account manager finishes building a selection and exports a presentation they can send to
the client without opening it to fix a single slide.

**Why this priority**: An export that needs manual repair is worse than no export — it costs
the seller time at exactly the moment they are trying to move fast.

**Independent Test**: Build a selection, export the deck, and confirm every slide is
presentable as generated with no overflow, collision, or empty section.

**Acceptance Scenarios**:

1. **Given** a route selection, **When** the user exports a deck, **Then** it opens with a hero
   map slide where the map is the largest element and nothing is drawn over it.
2. **Given** a long route, **When** its stops-by-road slide is generated, **Then** the list
   reflows into more columns and splits long roads rather than colliding with the footer.
3. **Given** a title that already names the route count, **When** the slide renders, **Then** no
   separate badge repeats that count.
4. **Given** any slide in the deck, **When** it renders, **Then** no shape extends past the slide
   edge.

---

### User Story 2 - Export a single shareable image (Priority: P1)

The account manager exports one image to drop into a chat or an email, where the map is as large
as the frame allows and the supporting numbers sit beside it rather than on it.

**Why this priority**: The image is the fastest artefact to share and is often the only one a
client looks at.

**Independent Test**: Export the image and confirm the map band occupies the majority of the
frame with the information bar sized to its content.

**Acceptance Scenarios**:

1. **Given** an island-spanning selection, **When** the image is exported, **Then** the map region
   is shaped wide to match the network so the fit frames Singapore rather than zooming out past
   it.
2. **Given** exported content, **When** the information bar renders, **Then** its height is
   derived from its content and clamped so the map keeps the majority of the frame.
3. **Given** a selection exported immediately after tapping a package, **When** the capture
   happens, **Then** the framing is deterministic and never captures a part-finished zoom.
4. **Given** the attribution strip, **When** the image renders, **Then** it never covers a route
   end or terminus label.

---

### User Story 3 - Choose what the export contains (Priority: P2)

The account manager decides which blocks go into the export rather than accepting a fixed
template.

**Why this priority**: Different pitches need different evidence; a fixed deck forces editing,
which Story 1 exists to prevent.

**Acceptance Scenarios**:

1. **Given** the export dialog, **When** the user reviews it, **Then** content blocks are opt-in.
2. **Given** a selection with no routes, **When** the user exports, **Then** the export still
   succeeds as a map export.
3. **Given** a chosen package, **When** the export is named, **Then** its title and filename
   derive from that package.

---

### User Story 4 - Export in the seller's own brand (Priority: P2)

The exported artefacts carry the seller's colours and wordmark, not the tool's.

**Acceptance Scenarios**:

1. **Given** an export, **When** it renders, **Then** its pill, title, stats and footer follow the
   configured brand and the eyebrow reads the selected package code.
2. **Given** any exported artefact, **When** the client reads it, **Then** nothing identifies the
   internal tool.

### Edge Cases

- A route with far more stops than fit one slide — must flow to further columns and mark
  continuations, never truncate silently.
- Two termini close enough to collide in the export — must be decluttered.
- A selection spanning the whole island versus one town — the fit must adapt without leaving the
  island in either case.
- An export requested with layers on but no routes selected — must produce a valid map export.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST export both a presentation deck and a single shareable image.
- **FR-002**: The deck MUST lead with a hero map slide with no shape drawn over the map.
- **FR-003**: Stop lists MUST reflow by capacity — more columns, split roads marked as
  continuations — and MUST never overflow the slide.
- **FR-004**: The image MUST place the map in a wide band with the information bar below it,
  sized to its content and clamped so the map keeps the majority of the frame.
- **FR-005**: Export framing MUST be deterministic and MUST wait out any in-flight map animation.
- **FR-006**: Fit padding MUST keep the attribution strip clear of route ends and terminus
  labels.
- **FR-007**: Export content blocks MUST be opt-in.
- **FR-008**: Export MUST succeed with no route selected.
- **FR-009**: Export title and filename MUST derive from the selected package.
- **FR-010**: Exports MUST carry the seller's brand and MUST NOT identify the tool.
- **FR-011**: Exports MUST NOT repeat the same fact in two elements on one slide.
- **FR-012**: Coverage statistics MUST appear on the main map slide in both output formats.

### Key Entities

- **Export job**: A selection plus the chosen content blocks, a package-derived title, and a
  target format.
- **Slide**: One page of the deck — hero map, route information, or stops by road.
- **Information bar**: The block carrying title, route legend, coverage, place legend,
  impressions and attribution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A seller can send an exported deck without editing any slide.
- **SC-002**: No shape in any generated deck extends past the slide edge.
- **SC-003**: The map band occupies roughly four-fifths of the exported image frame at full
  width.
- **SC-004**: Repeated exports of the same selection produce the same framing.
- **SC-005**: No exported artefact identifies the internal tool or carries an internal name.

## Assumptions

- The recipient opens the deck in standard presentation software and will not repair layout.
- One brand is configured at a time; multi-brand theming is out of scope.
- The image is consumed at presentation scale, not print.
- Rendering libraries are loaded from a CDN at runtime and must be stubbed or served locally
  when testing offline.

## Rejected Alternatives

- **Floating information card over the map** (original). Avoided route overlap only by shifting
  the map fit, which shrank the routes. Superseded.
- **Full-height sidebar on the left with the map beside it** (US-19…US-22). Fixed the overlap but
  forced a tall narrow map column, which fights an island-wide network roughly twice as wide as
  it is tall — an island-spanning set zoomed out past Singapore to fit. Superseded by the
  map-band-on-top layout in US-23…US-26.
