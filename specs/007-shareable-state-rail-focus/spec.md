# Feature Specification: Multi-Line Rail Focus, Top-5 Add & Shareable State

**Feature Branch**: `007-shareable-state-rail-focus`

**Created**: 2026-08-06

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commit `3dae988` (PR #8) and stories
US-36…US-40 in `docs/user-stories.md`.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. Its user
> stories *were* written before the build — they came out of a five-persona beta walkthrough
> recorded in `docs/user-stories.md`, each verified headless. This spec consolidates them into
> the Spec Kit format after the fact; the stories themselves are contemporaneous.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Focus several rail lines at once (Priority: P1)

A corridor planner selling "your ad rides the north–south *and* east–west spines" lights both
lines together. Tapping the second does not unfocus the first.

**Why this priority**: The two-spine pitch is the corridor planner's core story, and single-select
focus made it impossible to show.

**Independent Test**: Focus one rail line, then another, and confirm both stay lit with the rest
desaturated.

**Acceptance Scenarios**:

1. **Given** no focus, **When** the user focuses a rail line, **Then** it renders full-colour and
   the others desaturate.
2. **Given** one line focused, **When** the user focuses a second, **Then** both stay focused.
3. **Given** several lines focused, **When** stations render, **Then** the stations of the union
   of focused lines are shown.
4. **Given** any focus state, **When** the user chooses "All lines", **Then** focus clears.

---

### User Story 2 - Take the top routes in one tap (Priority: P1)

Having ranked routes by reach, the seller adds the best five to their selection in a single
action rather than five taps and five map re-fits.

**Why this priority**: The ranking's whole value is speed; making the user hand-copy its answer
back into the selection undoes it.

**Independent Test**: Run a ranking, tap the add control, and confirm five routes are selected in
one map re-fit.

**Acceptance Scenarios**:

1. **Given** a ranked list, **When** the user taps the add control, **Then** the top five routes
   join the selection in one action with one map re-fit.
2. **Given** fewer than five ranked results, **When** the control renders, **Then** it adapts to
   the number available.
3. **Given** the top five are already selected, **When** the list renders, **Then** the control is
   hidden.

---

### User Story 3 - Run pin → rank → select → export as one flow (Priority: P1)

An event promotion planner pins a venue, ranks routes against it, takes the top ones, and
exports — without the chain breaking anywhere.

**Why this priority**: Each step already worked alone. The value is that the seams hold.

**Independent Test**: Execute the full chain end to end and confirm the exported artefact
contains the pinned place and the selected routes.

**Acceptance Scenarios**:

1. **Given** a pinned venue, **When** the user ranks against it and adds the top routes, **Then**
   those routes are selected.
2. **Given** that selection, **When** the user exports, **Then** the artefact renders with the
   pinned place, its legend row, and the selected routes.

---

### User Story 4 - Send the exact map to someone (Priority: P1)

A seller mid-pitch sends a colleague a link that reopens the identical map, and can reopen it
themselves the next morning.

**Why this priority**: Without it, a map built during a call exists only on that screen until it
is closed.

**Acceptance Scenarios**:

1. **Given** a selection and focused rail lines, **When** state changes, **Then** the URL carries
   both.
2. **Given** such a URL, **When** it is opened fresh, **Then** the selection and the focused lines
   are restored.
3. **Given** repeated state changes, **When** the URL updates, **Then** browser history is not
   flooded with entries.

### Edge Cases

- A URL naming a route or rail line that no longer exists — must restore what it can rather than
  fail to load.
- A ranking with zero results — the add control must not offer to add nothing.
- Rail focus and route selection both restored from one link — neither may clobber the other.
- A very long selection in the URL — must remain shareable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Rail focus MUST be a set: lines toggle independently and several may be focused at
  once.
- **FR-002**: Focused lines MUST render emphasised and unfocused lines desaturated.
- **FR-003**: Stations MUST be drawn for the union of focused lines.
- **FR-004**: A control MUST clear all rail focus.
- **FR-005**: Users MUST be able to add the top-ranked routes to the selection in one action, in
  one map re-fit.
- **FR-006**: The add control MUST adapt when fewer results exist and MUST hide when they are
  already selected.
- **FR-007**: The route selection and focused rail lines MUST be encoded in the URL.
- **FR-008**: Opening such a URL MUST restore both.
- **FR-009**: URL updates MUST replace rather than push history entries.
- **FR-010**: The pin → rank → add → export chain MUST work end to end without manual re-entry
  at any step.

### Key Entities

- **Rail focus set**: The set of rail lines currently emphasised; drives line styling and which
  stations are drawn.
- **Shareable state**: The selection and rail focus, encoded in the URL so a map is reproducible
  from a link alone.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A corridor planner can show two rail spines lit simultaneously.
- **SC-002**: Taking the top five ranked routes costs one interaction and one map re-fit.
- **SC-003**: A shared link reopens to the same selection and rail focus in a fresh session.
- **SC-004**: The full pin → rank → add → export flow completes without the user re-entering
  anything.

## Assumptions

- Colleagues receiving a link have access to the same deployed app.
- URL state covers the selection and rail focus; layer stacks and shading are not encoded.
- Five is the useful default for "the top routes"; it is not user-configurable.
- Links are shared in chat and email, so the URL must survive copy-paste intact.
