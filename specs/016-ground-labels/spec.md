# Feature Specification: Names on the built-in basemap

**Feature Branch**: `claude/map-watermark-removal-yy3aoj`

**Created**: 2026-09-04

**Status**: Draft

**Input**: User description: "not good, we need a better map… the beta testers need it fast. think about their needs."

## Context

[`015-basemap-watermark`](../015-basemap-watermark/spec.md) removed the CARTO watermark and gave
the keyless basemap a coastline and the road network. It shipped, and the verdict was that the
map still is not good enough.

That verdict is right, and the reason is specific: **the built-in basemap names nothing.** You can
see the shape of a road but not which road. You can see a built-up blob but not that it is
Tampines. For a seller mid-pitch — "this route runs the length of Bukit Timah Road" — a map with
no names is a diagram.

The fix does not need a tile provider. Both sets of names are already in this repository and were
going unused:

- **Road names.** Every one of the 5,207 entries in `data/stops.json` carries the road it stands
  on at index 3 (`"New Bridge Rd"`, `"Eu Tong Sen St"`). That is 860 distinct roads — the street
  index of Singapore, already positioned, already loaded on every page view.
- **Town names.** The 55 planning areas already drawn as the coastline carry their names.

This feature is explicitly a **stopgap that deletes itself**. Setting `BASEMAP_KEY` gives CARTO
Positron, which draws its own names; these labels must disappear at that moment rather than
print a second set on top.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A tester can say where they are looking (Priority: P1)

A beta tester opens the atlas at the default island view with no layers switched on. They can
name the part of Singapore they are looking at without turning anything on or asking anyone.

**Why this priority**: This is the reported defect. Orientation at the opening view is the first
thing anyone does and the first thing that was missing.

**Independent Test**: Load at island zoom, screenshot, confirm town names are readable and do not
overlap each other.

**Acceptance Scenarios**:

1. **Given** the built-in basemap and no layers on, **When** a tester loads the atlas, **Then**
   town names are drawn across the island and each is legible.
2. **Given** the dense centre of the island, where planning areas are small and numerous,
   **When** names cannot all fit, **Then** the larger, more recognisable towns are the ones drawn
   and no two labels overlap.

---

### User Story 2 - A seller can name the road a route runs on (Priority: P1)

A seller zooms to a stop or a corridor to talk about it. The roads under the route carry their
names, so they can say "along Orchard Road" from the map rather than from memory.

**Why this priority**: This is the difference between a diagram and a map for the actual selling
task, and it is the single most-missed thing at working zoom.

**Independent Test**: Zoom to a known area (Orchard) and confirm the correct street names appear.

**Acceptance Scenarios**:

1. **Given** the built-in basemap, **When** a seller zooms to street level, **Then** the roads in
   view are named with their real names.
2. **Given** a road that has many label positions in view, **When** the names are drawn, **Then**
   it is named once, not once per position.
3. **Given** a dense town centre, **When** more names are in view than can fit, **Then** the
   busier roads keep their names and no two labels overlap.

---

### User Story 3 - The exported map carries the names (Priority: P1)

A seller exports a JPG or deck. The town and road names are in the image, so the thing they send
a client is self-explanatory.

**Why this priority**: The export is the deliverable. Names that exist only on screen solve half
the problem.

**Independent Test**: Export with routes selected and read the names off the resulting image.

**Acceptance Scenarios**:

1. **Given** routes selected on the built-in basemap, **When** a seller exports, **Then** the
   names appear in the exported image alongside the routes.

---

### User Story 4 - The names get out of the way when something better arrives (Priority: P1)

The owner sets a basemap key. CARTO Positron draws its own street and place names, and the
built-in labels are gone — not stacked underneath producing two names per road.

**Why this priority**: Same priority as the rest because getting this wrong makes the *keyed*
map worse than it is today, and the keyed map is the intended end state.

**Independent Test**: Run with a working tile host and confirm zero built-in labels are drawn.

**Acceptance Scenarios**:

1. **Given** a working basemap key, **When** the app loads, **Then** no built-in road or town
   label is drawn anywhere.
2. **Given** a key that fails and falls back to the built-in ground, **When** the fallback engages,
   **Then** the names come back with it.

---

### Edge Cases

- **A choropleth is shading the map.** The demographics layer already draws its own planning-area
  names. The ground's town names must not print a second set underneath them.
- **Panning at street zoom.** Names must follow the view without the map stuttering; there are
  1,285 candidate road positions and only a screenful may be drawn at once.
- **A road with no stops on it.** It will not be named. The label set covers roads the bus network
  touches, which is most of Singapore's road network but not all of it.
- **Very long road names in a tight space.** Better to drop the label than to overlap another.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: On the built-in basemap, the app MUST draw town names at island-to-district zoom and
  road names at street zoom, from data it already loads.
- **FR-002**: No two labels may overlap. When more names are in view than fit, the app MUST keep
  the more significant ones — larger towns, busier roads — and drop the rest.
- **FR-003**: A road MUST be named at most once per view.
- **FR-004**: Labels MUST appear in the exported image, not only on screen.
- **FR-005**: When a real tile basemap is showing, the app MUST NOT draw any of these labels.
- **FR-006**: When a choropleth is shading planning areas, the app MUST NOT draw its own town
  names on top of the choropleth's.
- **FR-007**: Labels MUST NOT intercept pointer events — every existing hover and click must keep
  working exactly as it does today.
- **FR-008**: Panning and zooming MUST stay responsive; only labels in the current view are built.
- **FR-009**: The feature MUST add no new data file, no new network request and no new dependency.

### Key Entities

- **Road name**: index 3 of each `data/stops.json` entry. 5,207 stops, 860 distinct roads.
  Provenance is LTA DataMall, already cited in the app's sources list.
- **Town name**: the `name` property of each of the 55 planning areas in
  `data/planning_areas.geojson` (URA Master Plan 2019), already cited.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At the default view with no layers on, a tester can name the district under the
  cursor from the map alone.
- **SC-002**: At street zoom over a known area, the road names shown are correct.
- **SC-003**: Zero overlapping labels at any zoom.
- **SC-004**: Exported JPG and deck carry the names.
- **SC-005**: With a working key, zero built-in labels are drawn — the keyed map is byte-for-byte
  what it was before this feature.
- **SC-006**: No measurable loss of pan or zoom responsiveness.

## Assumptions

- Bus-stop road names are a good enough street index. They cover every road the bus network runs
  on, which for a bus-advertising tool is the road network that matters. Roads no bus uses are not
  named, and that is accepted.
- Road names are abbreviated the way LTA writes them (`Upp S'goon Rd`, `Jln Ahmad Ibrahim`). That
  is how the stop names elsewhere in this app already read, so it is consistent rather than odd.
- One label per road per view is right. Naming a road repeatedly along its length is what a real
  basemap does at high zoom, but it needs collision handling this feature does not have, and one
  correct name beats three overlapping ones.
- This is a stopgap. It exists because there is no key. It is not an argument against getting one:
  the moment a key is set, this whole layer removes itself and CARTO's own cartography takes over.
