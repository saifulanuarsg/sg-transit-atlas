# Feature Specification: The Missing LRT Lines

**Feature Branch**: `013-missing-lrt-lines`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "I JUST REALISED THERE ARE MISSING LRT LINES"

## Why this is a defect, not a gap

The atlas ships eight rail lines and calls the control "MRT / LRT lines". Singapore has three LRT
systems. Only one of them — Sengkang — is drawn. **Bukit Panjang LRT and Punggol LRT are absent
entirely**, both line and stations.

Those are not marginal. Bukit Panjang and Punggol are dense residential towns, and the atlas sells
audience reach in exactly such places. A seller pitching Punggol coverage has been showing a map
with no Punggol LRT on it, next to a legend that claims to show LRT.

It shipped unnoticed because the data checker only covers `data/poi_*.json`. Rail data has never
had a completeness floor, or any check at all.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every LRT line is on the map (Priority: P1)

A seller turning on rail lines sees all three LRT systems, not one.

**Why this priority**: The map currently misrepresents the network. Everything else here is
secondary to that being false.

**Independent Test**: Enable rail lines and confirm Bukit Panjang and Punggol LRT both draw, with
their stations.

**Acceptance Scenarios**:

1. **Given** the rail-lines control, **When** it renders, **Then** Bukit Panjang LRT and Punggol
   LRT appear alongside the existing eight.
2. **Given** either line focused, **When** the map renders, **Then** its geometry draws and its
   stations appear.
3. **Given** the line count shown in the panel, **When** it renders, **Then** it reflects the true
   number of lines.

---

### User Story 2 - Interchanges stay single stations (Priority: P1)

Choa Chu Kang, Bukit Panjang and Punggol each appear once, carrying every line that serves them.

**Why this priority**: Duplicating a station would double-count it in any station-based reasoning
and show two markers on one building — the same class of error as an entry stitched from two
campuses, which Principle III exists to catch.

**Acceptance Scenarios**:

1. **Given** Choa Chu Kang, **When** it renders, **Then** there is one station carrying NSL, JRL
   and BPLRT.
2. **Given** Bukit Panjang, **When** it renders, **Then** one station carries DTL and BPLRT.
3. **Given** Punggol, **When** it renders, **Then** one station carries NEL and PGLRT.

---

### User Story 3 - The new lines look like the old ones (Priority: P2)

The added geometry is indistinguishable in quality from the lines already drawn.

**Why this priority**: The existing lines are traced alignments at roughly 120 m between points.
Straight lines between stations would be visibly cruder and would cut across buildings — and
spec 001 FR-002 already forbids interpolated geometry.

**Acceptance Scenarios**:

1. **Given** the added lines, **When** their point spacing is measured, **Then** it is comparable
   to the lines already present.
2. **Given** the added geometry, **When** it is checked, **Then** it comes from a traced source,
   never from joining station points.

---

### User Story 4 - This class of gap fails a check next time (Priority: P1)

Rail data is covered by the data checker, so a missing line or station cannot ship silently again.

**Why this priority**: The defect's real cause is not the missing data — it is that nothing was
watching. Adding the lines without adding the check leaves the next omission just as invisible.

**Acceptance Scenarios**:

1. **Given** the checker, **When** it runs, **Then** it validates rail lines and stations as well
   as places.
2. **Given** a rail line removed or a station list truncated, **When** the checker runs, **Then**
   it fails.
3. **Given** a station whose coordinates fall outside Singapore, **When** the checker runs,
   **Then** it fails.

### Edge Cases

- A station serving both an MRT and an LRT line — one record, several line codes.
- The two Punggol loops and the two Sengkang loops — each system is one line in the UI, with its
  loops as separate segments, matching how Sengkang is already stored.
- A source whose own README says its geometry is simplified and smoothed — acceptable for a
  backdrop layer, but the limitation must be recorded rather than implied away.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Bukit Panjang LRT MUST be added as a line with traced geometry.
- **FR-002**: Punggol LRT MUST be added as a line with traced geometry, both loops.
- **FR-003**: All Bukit Panjang and Punggol LRT stations MUST be added.
- **FR-004**: Station coordinates MUST come from an authoritative geocode, never estimated.
- **FR-005**: A station served by several lines MUST be one record listing all of them.
- **FR-006**: Added geometry MUST come from a traced source and MUST NOT be interpolated between
  stations.
- **FR-007**: Added geometry's point density MUST be comparable to the existing lines.
- **FR-008**: LRT lines MUST keep the existing LRT colour convention.
- **FR-009**: The data checker MUST validate rail lines and stations — presence, count floors, and
  Singapore bounds.
- **FR-010**: The provenance and known limitations of the rail geometry source MUST be recorded.

### Key Entities

- **Rail line**: A code, a name, a colour, and its geometry as segments.
- **Rail station**: A name, a position, a kind, and the lines serving it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three LRT systems draw on the map.
- **SC-002**: Choa Chu Kang, Bukit Panjang and Punggol each appear exactly once.
- **SC-003**: Added lines' median point spacing is within the range of the existing eight.
- **SC-004**: Removing a rail line or truncating stations fails the checker.
- **SC-005**: The app loads with no console errors.

## Assumptions

- Sengkang LRT as already shipped is complete — verified: its bounding box spans both loops.
- LRT lines share one colour, matching both the existing Sengkang entry and published network maps;
  the focus feature and the legend distinguish them, not hue.
- Rail geometry is a backdrop for a bus-advertising tool, so a simplified-and-smoothed traced
  alignment is fit for purpose in a way that interpolation between stations would not be.
- Station counts are stable enough to serve as completeness floors, and changing one is a reviewed
  edit — the same rule as the place layers.
