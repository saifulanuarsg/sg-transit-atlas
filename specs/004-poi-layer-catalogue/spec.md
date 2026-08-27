# Feature Specification: Point-of-Interest Layer Catalogue

**Feature Branch**: `004-poi-layer-catalogue`

**Created**: 2026-07-20 · extended through 2026-08-06

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `8086e1c`, `fba80f6`, `4bf8e4b`,
`ac5601a`, `9918154`, `773b00a`, `efd3b50` (POI sweep), and stories US-27, US-28, US-32…US-35 in
`docs/user-stories.md`. Current catalogue: 37 layers, 5,880 places.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. The
> specification below was reconstructed from `data/poi_*.json`, the running application and the
> user-story log — it did not drive the build. See `001-transit-network-atlas` for the caveat in
> full.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Turn an audience into a map layer (Priority: P1)

A seller building an audience story turns on the places that represent it — schools, hospitals,
malls, supermarkets, cinemas — and sees them against the network.

**Why this priority**: Every audience pitch is "this route reaches these places". Without the
places there is no pitch.

**Independent Test**: Open the layer picker, enable any layer, and confirm its places render and
are countable within stop catchments.

**Acceptance Scenarios**:

1. **Given** the layer picker, **When** the user browses it, **Then** layers are grouped by
   category rather than presented as one flat list.
2. **Given** a layer enabled, **When** the map renders, **Then** its places appear and its count
   is shown.
3. **Given** an enabled layer, **When** the ranking runs, **Then** that layer's places can be
   ranked against.
4. **Given** a stop selected, **When** its catchment is listed, **Then** places from enabled
   layers within 400 m are counted.

---

### User Story 2 - See sparse layers at island zoom (Priority: P2)

A seller scanning the whole island can see a layer with only a few dozen places without zooming
in to find them.

**Why this priority**: A layer the user cannot see reads as an empty layer, which costs trust in
the data.

**Acceptance Scenarios**:

1. **Given** a sparse layer, **When** it renders at island zoom, **Then** its markers are sized up
   relative to dense layers so they remain visible.
2. **Given** a brand-outlet layer, **When** it renders, **Then** outlets are drawn as letter
   badges rather than indistinguishable dots.
3. **Given** a marker of any size, **When** the user hovers it, **Then** it responds at a matching
   hover size.

---

### User Story 3 - Trust the counts being quoted (Priority: P1)

A seller quoting a place count to a client is quoting a complete, clean list.

**Why this priority**: A visibly incomplete layer — 8 polyclinics when Singapore has 26 — is a
credibility hole a client will spot in the meeting.

**Independent Test**: Audit every layer file for out-of-bounds points, missing names, and
accidental duplicates.

**Acceptance Scenarios**:

1. **Given** any layer, **When** it is audited, **Then** it contains no out-of-bounds coordinates
   and no unnamed places.
2. **Given** a layer with repeated names, **When** it is audited, **Then** the repeats are genuine
   chain outlets rather than accidental duplicate rows.
3. **Given** a layer representing a known-size real-world set, **When** it ships, **Then** it
   contains the full set.

---

### User Story 4 - Split a category that hides distinctions (Priority: P2)

A seller pitching to a specific education segment selects exactly that segment rather than a
lumped "institutes of higher learning" layer.

**Acceptance Scenarios**:

1. **Given** the education layers, **When** the user browses them, **Then** junior colleges,
   universities, polytechnics, ITE and arts institutions are separately selectable.
2. **Given** the school layers, **When** the user browses them, **Then** primary and secondary
   are separate and follow the education ministry's own terms.

### Edge Cases

- Two places in the same building sharing coordinates — legitimate, must not be flagged as
  duplicates.
- A chain with many outlets of the same name — legitimate, must not be flagged as duplicates.
- A layer whose real-world membership changes (an outlet closes, a campus moves) — the data must
  be re-verifiable rather than assumed stable.
- A layer with no authoritative source available — must be left out rather than fabricated.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST offer point-of-interest layers grouped into categories in both the
  layer picker and the ranking selector.
- **FR-002**: Every layer MUST be rankable and countable within a stop's 400 m catchment.
- **FR-003**: Marker size MUST scale with layer sparsity so sparse layers stay visible at island
  zoom.
- **FR-004**: Brand-outlet layers MUST render as distinguishable letter badges.
- **FR-005**: Every place MUST carry a name; no layer may contain an unnamed place.
- **FR-006**: Every place MUST fall within Singapore's bounds.
- **FR-007**: No layer may contain exact-duplicate rows.
- **FR-008**: A layer representing a known-size real-world set MUST be complete.
- **FR-009**: Education layers MUST be split by institution type; schools MUST be split into
  primary and secondary using the education ministry's own terms.
- **FR-010**: Layers with no authoritative source MUST be omitted rather than estimated.
- **FR-011**: A curated (rather than exhaustive) layer MUST say so.
- **FR-012**: Zero-count layers in a catchment listing MUST fold into a single muted line rather
  than pad the list with zeros.

### Key Entities

- **Layer**: A named, categorised set of places with a colour, a marker style, a source
  attribution and — where the real-world set has a known size — a completeness floor.
- **Place**: A named point with a category, optionally a footprint, and optionally a note
  flagging a status a seller needs to know.
- **Category**: The grouping shown in the picker and ranking selector (e.g. Retail & dining,
  Transit hotspots, Education, Health).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every layer passes the data checker with zero out-of-bounds points, zero unnamed
  places and zero duplicate rows.
- **SC-002**: A seller can find the right layer by category without reading every entry.
- **SC-003**: A layer of 60 or fewer places is visible without zooming in from island view.
- **SC-004**: Place counts quoted from the app match the real-world set they claim to represent.

## Assumptions

- 400 m is the working walking catchment for counting places against a stop.
- Chain outlets and same-building neighbours are expected in the data and are not errors.
- Layers are maintained by hand from published sources; there is no live feed.
- Where a strong seller layer has no obtainable source (hawker centres, petrol stations), it
  stays in the backlog rather than being approximated.
