# Feature Specification: Competitive Density Analysis

**Feature Branch**: `005-competitive-density`

**Created**: 2026-07-20 · de-branded 2026-08-05

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `e856b22`, `4342d9e`, `dec97a0`, and
story US-5 in `docs/user-stories.md`.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. The
> specification below was reconstructed from the running application and the commit history — it
> did not drive the build. See `001-transit-network-atlas` for the caveat in full.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Anchor the analysis on my client's brand (Priority: P1)

A seller pitching a quick-service restaurant chain sets that chain as the anchor, and every
part of the module — the heat map, the legend, the wording — reorients around it. A competitor's
name never appears as the subject.

**Why this priority**: The module was originally built around a single named brand. Pitching
brand B while the screen says brand A is not a cosmetic problem — the client is watching.

**Independent Test**: Switch the anchor to a different brand and confirm the heat, legend and
copy all follow, with no trace of the previous anchor as the subject.

**Acceptance Scenarios**:

1. **Given** the competitive module, **When** the user opens it, **Then** they can pick which
   brand is the anchor.
2. **Given** an anchor is chosen, **When** the module renders, **Then** the heat map, legend and
   supporting copy all describe that brand as the subject.
3. **Given** a client is watching the screen, **When** any label renders, **Then** no other
   client's brand is named as the subject of the analysis.

---

### User Story 2 - See where the anchor is strong and where it is exposed (Priority: P1)

The seller sees, geographically, where the anchor brand has density and where competitors do,
so the route package can be argued as defending a stronghold or attacking a gap.

**Why this priority**: This is the analytical payload — the reason the module exists rather than
just showing four outlet layers at once.

**Independent Test**: Enable the module with an anchor set and confirm a density surface renders
that distinguishes anchor presence from competitor presence.

**Acceptance Scenarios**:

1. **Given** an anchor brand, **When** density renders, **Then** anchor and competitor presence
   are separately readable.
2. **Given** the density view, **When** the user changes the comparison radius, **Then** the
   surface recomputes at that radius.
3. **Given** a mode has been selected, **When** the controls render, **Then** the active mode
   button reflects the current state.

---

### User Story 3 - Compare at the radius that matches the trip (Priority: P2)

The seller chooses a catchment radius that matches how people actually travel to the outlet
type — walking distance for one argument, a short drive for another.

**Acceptance Scenarios**:

1. **Given** the density controls, **When** the user reviews them, **Then** both a 1 km and a 2 km
   radius are offered alongside the walking catchment.
2. **Given** a radius change, **When** the surface recomputes, **Then** the legend updates to
   match.

### Edge Cases

- An anchor brand with very few outlets — the surface must remain readable rather than
  disappearing into noise.
- Two brands with outlets in the same mall — must not collapse into one hotspot that hides the
  competitive picture.
- Fan-out pins sitting over a density maximum, obscuring the very hotspot being argued (a known,
  logged limitation that does not block a pitch).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to choose which brand anchors the competitive analysis.
- **FR-002**: The heat surface, legend and copy MUST all follow the chosen anchor.
- **FR-003**: No brand other than the anchor may be presented as the subject of the analysis.
- **FR-004**: System MUST render a density surface distinguishing anchor from competitor
  presence.
- **FR-005**: Users MUST be able to compare at 1 km and 2 km radii in addition to the walking
  catchment.
- **FR-006**: Mode controls MUST reflect the current state.
- **FR-007**: Outlet data underlying the module MUST be a verified currently-open set, not a
  historical list.
- **FR-008**: The module MUST carry no internal ticket name or tool branding in any visible
  label.

### Key Entities

- **Anchor brand**: The brand the analysis is written from; determines the surface, legend and
  copy.
- **Competitor set**: The other brands in the same category, rendered for contrast.
- **Density surface**: The computed geographic intensity of outlet presence at a chosen radius.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A seller can re-anchor the module to any supported brand and present immediately,
  with no stale brand name anywhere on screen.
- **SC-002**: The density surface recomputes correctly at each offered radius.
- **SC-003**: Outlet counts match an independently verified open-outlet set.

## Assumptions

- The supported brands are the major quick-service chains with obtainable outlet lists.
- Outlet lists are verified against a public source and re-verified rather than assumed stable.
- "Density" is presented as a geographic argument, not a market-share claim.
- The seller supplies the competitive narrative; the module supplies the geography.
