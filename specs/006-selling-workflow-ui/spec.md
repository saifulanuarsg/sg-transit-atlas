# Feature Specification: Selling-Workflow Interface

**Feature Branch**: `006-selling-workflow-ui`

**Created**: 2026-08-05

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `513051f` (PR #2), `4eb6708` (PR #3),
`0882a8b` (PR #4), `a5e76a4` (PR #5), and stories US-1…US-13, US-28…US-31 in
`docs/user-stories.md`.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. Unusually
> for this back-fill, its user stories *were* written before the build — PRs #2–#5 are the runs
> that started `docs/user-stories.md`, and each story there carries its verification evidence.
> This spec consolidates them into the Spec Kit format after the fact; the stories themselves
> are contemporaneous.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Name any place without a legend (Priority: P1)

An account manager mid-call hovers anything on the map and it tells them what it is, so they can
talk about what a route passes without breaking off to consult a legend.

**Why this priority**: The product is used while talking. Anything that requires looking away
from the conversation is not used.

**Independent Test**: Hover a dot, a footprint and a brand badge and confirm each names itself.

**Acceptance Scenarios**:

1. **Given** any place marker, **When** the user hovers it, **Then** a tooltip names it.
2. **Given** a place drawn as a footprint or a brand badge rather than a dot, **When** the user
   hovers it, **Then** it responds the same way a dot does.

---

### User Story 2 - Pin names for a screenshot (Priority: P1)

Preparing a screenshot, the account manager turns place names on so the captured frame explains
itself without them narrating it.

**Acceptance Scenarios**:

1. **Given** the place-names control, **When** the user enables it, **Then** places are labelled
   on the map and the count of labelled places is stated.
2. **Given** labels are on, **When** the user changes zoom, **Then** labelling follows the active
   catchment scope rather than labelling everything.
3. **Given** the control is disabled, **When** the map renders, **Then** no labels remain.

---

### User Story 3 - Put one specific place on the map (Priority: P1)

Pitching around a single building, the account manager adds just that place — without turning on
its entire layer and cluttering the map.

**Acceptance Scenarios**:

1. **Given** the place finder, **When** the user searches a name and picks a result, **Then** that
   place is pinned with an always-on label and a removable chip.
2. **Given** a picked place, **When** the user exports, **Then** it appears in the export legend.
3. **Given** a picked place, **When** the ranking runs, **Then** it counts toward route scores.

---

### User Story 4 - Scan the panel in under a second (Priority: P2)

Screen-sharing mid-sentence, the account manager jumps to the right panel block without reading
every label.

**Why this priority**: Navigation speed, not capability — the blocks all worked before, they just
bled together.

**Acceptance Scenarios**:

1. **Given** either sidebar, **When** it renders, **Then** each block reads as a separate card
   with its own border and shadow against a tinted panel.
2. **Given** a returning user, **When** they scan a panel, **Then** each block carries a
   consistent accent colour so it is recognisable before its label is read.
3. **Given** something is exportable, **When** the user scrolls the left bar, **Then** the export
   block stays visible at the bar's bottom edge.
4. **Given** any supported window width, **When** package buttons render, **Then** they stay
   inside their card, with coverage lines truncating rather than pushing the layout apart.

---

### User Story 5 - Never lose work to a stray keypress (Priority: P1)

Closing a dropdown with Escape closes the dropdown — and nothing else.

**Why this priority**: Silently destroying a built-up selection is the most expensive possible
failure mid-call.

**Acceptance Scenarios**:

1. **Given** an open dropdown and an existing route selection, **When** the user presses Escape,
   **Then** the dropdown closes and the selection is untouched.

### Edge Cases

- A window narrow enough that a long coverage line cannot fit — must ellipsize, never overflow
  or introduce horizontal scroll.
- A catchment listing where most layers have zero places — must fold the zeros rather than pad
  the list.
- A user who has asked the operating system for reduced motion — all transitions must be
  suppressed.
- A terminus label overlapping a planning-area label when a choropleth is on (two independent
  decluttering passes; logged as known-minor, does not block a sell).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every place marker — dot, footprint or badge — MUST name itself on hover.
- **FR-002**: Users MUST be able to toggle map labels for places, with the labelled count stated.
- **FR-003**: Labels MUST follow the active catchment scope rather than labelling every place.
- **FR-004**: Users MUST be able to pin a single named place without enabling its layer.
- **FR-005**: A pinned place MUST be removable, MUST appear in the export legend, and MUST count
  in the ranking.
- **FR-006**: Each sidebar block MUST render as a distinct card with its own accent colour.
- **FR-007**: The export block MUST remain visible at the bottom of the left bar whenever there
  is something to export.
- **FR-008**: Interactive controls MUST stay within their card at every supported window width,
  with no horizontal scroll.
- **FR-009**: Escape MUST close only the topmost transient UI and MUST NOT alter the route
  selection.
- **FR-010**: Catchment listings MUST fold zero-count layers into a single muted line.
- **FR-011**: Transitions MUST be suppressed under a reduced-motion preference.
- **FR-012**: The left panel MUST be the routes-and-selection workspace; the right panel MUST be
  the map layers.

### Key Entities

- **Picked place**: A single place pinned independently of its layer; carries a label, a
  removable chip, export legend presence and ranking weight.
- **Panel block**: A titled card in a sidebar with a consistent accent identity.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A seller can name anything visible on the map without opening a legend.
- **SC-002**: An exported frame is self-explanatory without narration when place names are on.
- **SC-003**: Zero interactive controls fall outside their card between 1024 px and 1920 px width.
- **SC-004**: No keyboard interaction can clear a route selection as a side effect.
- **SC-005**: A returning user can reach a named panel block without reading its label.

## Assumptions

- The primary use is a live screen share on a laptop, 1024–1920 px wide.
- The seller is talking while operating; reading time is the scarce resource.
- Accent colours are for recognition, not semantic encoding, so they need no legend.
- Reduced motion is honoured as an accessibility requirement, not an option.
