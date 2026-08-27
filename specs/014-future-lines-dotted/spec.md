# Feature Specification: Not-Yet-Open Lines and Stations, Drawn Dotted

**Feature Branch**: `014-future-lines-dotted`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "create the sungei bedok extension and lines not ready as of sep 2026.
make them dotted"

## The defect underneath the request

The ask was to add the Sungei Bedok extension. Checking the network against the open-data
operational/future split found something larger: **28 stations already on the map are drawn
exactly like running ones, and none of them carries passengers.** All 21 Jurong Region Line
stations, plus Mount Pleasant, Marina South, Founders' Memorial and Bukit Brown — the last four
sitting on lines that *are* running.

A seller pointing at Marina South today is pointing at a station that opens in the 2030s. The map
gives them no way to know.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A line that isn't running doesn't look like one (Priority: P1)

A seller can tell at a glance which rail is carrying passengers and which is not.

**Why this priority**: The map currently asserts something false. Adding the extension without
fixing this would add two more false assertions.

**Independent Test**: Enable rail and confirm every unopened line is dotted and every running line
is solid.

**Acceptance Scenarios**:

1. **Given** a line not yet open, **When** it renders, **Then** it is dotted, lighter and thinner
   than a running line.
2. **Given** a running line, **When** it renders, **Then** it is solid.
3. **Given** an unopened line, **When** the user hovers it, **Then** it says it is not yet open.
4. **Given** the legend, **When** it renders, **Then** an unopened line names its expected year.

---

### User Story 2 - An unopened station says so, even on a running line (Priority: P1)

Mount Pleasant, Marina South, Founders' Memorial and Bukit Brown read as not-yet-open even though
the lines through them are running.

**Why this priority**: Line styling cannot carry this. These four sit mid-line on services that run
today, so the station itself has to declare its status or the seller cannot know.

**Acceptance Scenarios**:

1. **Given** a station not yet open, **When** it renders, **Then** it is hollow and dashed rather
   than filled.
2. **Given** such a station, **When** the user hovers it, **Then** the tooltip flags it and says
   when it is expected.
3. **Given** a running station, **When** it renders, **Then** it is unchanged.

---

### User Story 3 - The Sungei Bedok extension is on the map (Priority: P1)

The TEL and DTL extensions to Sungei Bedok appear, dotted, with their stations.

**Acceptance Scenarios**:

1. **Given** the map, **When** rail renders, **Then** a dotted TEL continues past Bayshore through
   Bedok South to Sungei Bedok.
2. **Given** the map, **When** rail renders, **Then** a dotted DTL continues past Expo through
   Xilin to Sungei Bedok.
3. **Given** Sungei Bedok, **When** it renders, **Then** it is one station carrying both TEL and
   DTL.
4. **Given** either extension, **When** it renders, **Then** it uses its parent line's colour so it
   reads as that line continuing.

---

### User Story 4 - Status is checked, not inherited (Priority: P1)

A station's open/closed status is verified against reality, not copied from a dataset.

**Why this priority**: The `data.gov.sg` future-station list still carries Keppel, Cantonment and
Prince Edward Road — which opened on 12 July 2026. Trusting it blind would have dotted three
stations that had been running for six weeks. Principle IV, in reverse: not *is it still open*, but
*is it open yet*, and either way the answer is checked.

**Acceptance Scenarios**:

1. **Given** Circle Line Stage 6, **When** it renders, **Then** it is solid and its stations are
   filled.
2. **Given** the checker, **When** it runs, **Then** it fails if an unopened line loses its flag or
   an unopened station loses its marker.

### Edge Cases

- A station serving one running line and one unopened line — Sungei Bedok is both TEL and DTL, and
  neither is open, so it is simply unopened; the general rule is that the station's own status
  governs.
- An extension whose alignment is not traceable from any reachable source — drawn schematically,
  station to station, and the dotted style signals the provisionality that would otherwise need a
  disclaimer.
- A line opening between edits — the status is dated in the sources panel and in the checker, so it
  is re-checkable rather than silently ageing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A line not carrying passengers MUST be drawn dotted and MUST NOT be drawn solid.
- **FR-002**: A station not carrying passengers MUST be drawn hollow and dashed.
- **FR-003**: An unopened line or station MUST state its status and expected timing on hover.
- **FR-004**: The legend MUST show an unopened line's expected year.
- **FR-005**: The TEL and DTL extensions to Sungei Bedok MUST be added with their stations.
- **FR-006**: Sungei Bedok MUST be one station carrying both lines.
- **FR-007**: An extension MUST use its parent line's colour.
- **FR-008**: Station coordinates MUST come from the government open-data future-station dataset.
- **FR-009**: Open/closed status MUST be verified against current sources, never inherited from a
  dataset alone.
- **FR-010**: A schematic alignment MUST be recorded as schematic.
- **FR-011**: The checker MUST fail if an unopened line loses its future flag, or an unopened
  station loses its flag, or an extension disappears.

### Key Entities

- **Future line**: A line with geometry, flagged as not carrying passengers.
- **Unopened station**: A station with a position and a flag saying it is not in service, and a
  note saying when it is expected.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every unopened line is dotted; every running line is solid.
- **SC-002**: All 31 unopened stations render distinctly.
- **SC-003**: Circle Line Stage 6 renders as open.
- **SC-004**: Sungei Bedok is a single record on both TEL and DTL.
- **SC-005**: Removing any status flag fails the checker.

## Assumptions

- Status is correct as at Sep 2026 and is dated wherever it is asserted. TEL5 and DTL3e are "2H
  2026" with no announced date, so they are treated as unopened; when they open, the flags come off
  and the schematic geometry should be replaced with traced alignment.
- Extension alignments are schematic because no traceable source is reachable for unbuilt track.
  This is acceptable for a dotted backdrop line in a way it would not be for a sellable bus route.
- CRL, RTS-Link and DTL2e are deliberately not drawn — they are further out and were not asked for.
  Their absence is stated in the sources panel so it reads as a decision.
