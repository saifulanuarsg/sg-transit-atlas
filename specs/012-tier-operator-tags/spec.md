# Feature Specification: Drop Packages, Tag Services by Tier and Operator

**Feature Branch**: `012-tier-operator-tags`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "remove the packages. leave only bus selection and route reach ranking" ·
"add only the city / city outer tag, add the operators - nothing else"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A left rail with two jobs, not three (Priority: P1)

A seller opens the atlas and the left rail does two things: build a selection, and rank routes by
reach. The curated package buttons are gone.

**Why this priority**: The packages were a hand-maintained shortlist that went stale the moment a
service was amended, and they competed for attention with the ranking — which answers the same
question from live data instead of from a rate card.

**Independent Test**: Load the app and confirm no package block, and that selection and ranking
both work.

**Acceptance Scenarios**:

1. **Given** the app loads, **When** the left rail renders, **Then** there is no route-packages
   block and no package buttons.
2. **Given** a selection built by search or by tapping the map, **When** it renders, **Then** it
   behaves exactly as before.
3. **Given** the reach ranking, **When** it runs, **Then** it still scores across the network and
   the add-top-5 control still works.
4. **Given** an export, **When** it is generated, **Then** it titles and names itself from the
   selection rather than from a package.

---

### User Story 2 - See which tier and operator a service belongs to (Priority: P1)

A seller looking at a selected service sees, without leaving the rail, whether it is City or City
Outer and which company operates it.

**Why this priority**: Tier decides the rate a service sells at, and operator decides who the
booking goes through. Both were previously off-screen knowledge the seller had to carry.

**Independent Test**: Select a City service, a City Outer service, and one absent from the master
list, and confirm each renders correctly.

**Acceptance Scenarios**:

1. **Given** a selected service on the master list, **When** its row renders, **Then** it shows its
   tier and its operator.
2. **Given** the tier tag, **When** it renders, **Then** City and City Outer are visually
   distinguishable at a glance.
3. **Given** a service not on the master list, **When** its row renders, **Then** it shows no tags
   rather than a blank or "unknown" tag.
4. **Given** any tag, **When** it is hovered, **Then** it names itself in full.

### Edge Cases

- A service in the master list that the atlas does not draw (5 of them: 84, 225, 243, 410, 831) —
  carries no tag because there is no row to tag.
- A service the atlas draws that is absent from the master list — the master list is the sellable
  trunk inventory, not the whole network, so absence is meaningful and must read as "not sold",
  never as missing data.
- Service 405 is flexi-only with no tier in the source; it is excluded rather than guessed at.
- A tag list long enough to push the row apart — tags must not break the row layout at any width.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The route-packages block, its buttons, its data and its selection logic MUST be
  removed.
- **FR-002**: Export titles and filenames MUST derive from the selection alone.
- **FR-003**: Route selection, the stop drill-down and the reach ranking MUST be unaffected.
- **FR-004**: Each service on the master list MUST carry a tier tag (City / City Outer) and an
  operator tag.
- **FR-005**: Only tier and operator are carried. No other field from the source list is imported.
- **FR-006**: A service absent from the master list MUST render with no tags at all.
- **FR-007**: Tags MUST name themselves in full on hover.
- **FR-008**: Tag data MUST live in its own data file, not inline in the application.
- **FR-009**: The tag file MUST record what the tags mean and why services are absent.

### Key Entities

- **Service tag**: A service number paired with its Moove tier and its operating company.
- **Tier**: City or City Outer — a two-bucket commercial segmentation.
- **Operator**: SBS Transit, Go-Ahead, SMRT Buses or Tower Transit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No package UI, data or code remains.
- **SC-002**: 322 of the atlas's services carry tags; the rest render untagged and unbroken.
- **SC-003**: A seller can read tier and operator off a selected route without leaving the rail.
- **SC-004**: The app loads with no console errors.

## Assumptions

- **The source list is the sellable trunk inventory, not the whole network.** 289 services the
  atlas draws are absent from it: 240 are lettered short-trip or express variants of a parent that
  *is* listed, and the rest are feeders and City Direct (6xx) services. Absence therefore means
  "not sold as inventory", and the UI must not imply a data gap.
- Operator is public information — LTA publishes route-operator assignment — so it carries no
  confidentiality constraint.
- Tier is Moove's own two-bucket segmentation, taken from a source marked internal. Only these two
  fields were imported; fleet counts, PTO packages, package names, Elite listings, deck types and
  route descriptors were all deliberately left out.
- Tags are informational. Filtering or ranking by tier or operator is not in scope here.
