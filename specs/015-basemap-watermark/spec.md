# Feature Specification: A basemap that never shows a watermark

**Feature Branch**: `claude/map-watermark-removal-yy3aoj`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "need the watermark on the map to disappear - it is affecting beta testing"

## Context

Every tile of the live map is currently stamped `API KEY REQUIRED · carto.com/basemaps/apikey`.
CARTO key-gated their raster basemaps in 2026; the atlas had used them keyless since it was
built, and no key has been set since. Nothing in this repository broke — the tiles changed.
[`docs/basemap.md`](../../docs/basemap.md) records the diagnosis and names the one-line fix
(set the key), but the fix has not been applied, so beta testers are looking at a watermark
tiled roughly thirty times across their screen.

The gap this feature closes is not "get a key". It is that **the product has no acceptable
appearance when the key is absent.** A sales tool whose failure mode is a third party's
"API KEY REQUIRED" stamp across the whole canvas cannot be put in front of testers, and it
will be in exactly that state again on any future key expiry, quota exhaustion, revocation,
or tile-host outage.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A beta tester never sees a watermark (Priority: P1)

A tester opens the atlas to evaluate it. Whatever the state of the basemap credential, the
map behind the routes is clean: a recognisable Singapore, quietly styled, with no third-party
stamp anywhere on it. Nothing about the page invites them to file "there's writing all over
the map" instead of feedback on the product.

**Why this priority**: This is the whole reported problem. It is the only story that has to
ship for beta testing to resume, and it delivers value on its own even if nothing else lands.

**Independent Test**: Load the app with no credential configured and inspect the full map
viewport at several zooms. No watermark text appears, and Singapore's landmass is
distinguishable from water.

**Acceptance Scenarios**:

1. **Given** no basemap credential is configured, **When** a tester loads the atlas, **Then**
   the map renders a clean Singapore land silhouette and no watermark text appears anywhere
   on the map.
2. **Given** no basemap credential is configured, **When** the tester pans and zooms across
   the island from island-wide to street level, **Then** no watermark appears at any zoom and
   no request is made to the watermarking tile host.
3. **Given** no basemap credential is configured, **When** the tester selects routes and
   toggles place layers, **Then** routes, stops, rail lines, labels and places all remain
   legible against the fallback basemap.

---

### User Story 2 - Setting the credential restores the full basemap (Priority: P2)

The owner obtains a basemap credential and sets it. The map goes back to the detailed street
basemap the product was designed on, with no other change — every deck, screenshot and export
already shipped keeps its look.

**Why this priority**: This is the eventual end state and must not be foreclosed by the
fallback. It is P2 only because it cannot be exercised until a credential exists, whereas
Story 1 must work today.

**Independent Test**: Set a credential, reload, and confirm the detailed basemap loads and
the fallback is gone.

**Acceptance Scenarios**:

1. **Given** a valid credential is configured, **When** the app loads, **Then** the detailed
   street basemap renders exactly as it did before this change and the fallback silhouette is
   not drawn.
2. **Given** a credential is added or removed, **When** the app reloads, **Then** the map
   switches between the two basemaps with no other configuration change required.

---

### User Story 3 - Export produces a clean image in either mode (Priority: P2)

A seller exports a JPG or a deck. The exported image carries whichever basemap the app is
showing, drawn correctly — never a watermark, never a blank white band where the basemap
should be.

**Why this priority**: Export is the product's main deliverable. A fallback that fixes the
screen but silently breaks or blanks the export would trade one visible defect for a worse
invisible one.

**Independent Test**: Export a JPG and a deck with routes selected, in each basemap mode, and
inspect the resulting image for the basemap.

**Acceptance Scenarios**:

1. **Given** no credential is configured, **When** a seller exports a JPG with routes
   selected, **Then** the land silhouette appears in the image beneath the routes and no
   watermark appears.
2. **Given** no credential is configured, **When** a seller exports a deck, **Then** the hero
   map slide carries the same basemap the screen showed.
3. **Given** a valid credential is configured, **When** a seller exports, **Then** export
   behaves exactly as it does today.

---

### User Story 4 - The missing credential is visible to the owner, not to the tester (Priority: P3)

The owner can tell at a glance that the atlas is running on the fallback and why, without that
diagnosis being written across a tester's or a client's screen.

**Why this priority**: Useful for operating the tool, but the beta is unblocked without it.
The risk it addresses is a silent fallback that nobody notices for months.

**Independent Test**: Load with no credential and confirm the reason is discoverable by the
owner while nothing about it is drawn over the map.

**Acceptance Scenarios**:

1. **Given** no credential is configured, **When** the app loads, **Then** the reason and the
   fix are stated where the owner will find them and nowhere a tester or client will see them.

---

### Edge Cases

- **The credential is set but wrong** (typo, expired, revoked, quota exhausted). The tile host
  answers with watermarked or error tiles rather than nothing, so a credential being present
  is not proof it works. The map must not end up showing the watermark this feature exists to
  remove.
- **The tile host is unreachable** (offline, blocked network, host outage) with a valid
  credential set. The map must not be left as empty grey nothing.
- **The land-silhouette source fails to load.** The map must still be usable — routes and
  stops carry the meaning; the basemap is context.
- **Zooming past the detail the silhouette can offer.** The fallback has no street geometry,
  so at street level it cannot show what the detailed basemap shows. It must degrade to a
  clean empty ground, never to visible seams, tearing, or misregistration against the routes.
- **The fallback's ground must not collide with the map's own palette.** Sixteen route
  colours, choropleth shading and a density heat surface are drawn over it and must all stay
  distinguishable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When no basemap credential is configured, the app MUST NOT request tiles from
  the watermarking tile host.
- **FR-002**: When no basemap credential is configured, the app MUST draw a Singapore land
  silhouette as the basemap, distinguishing land from water, from data this repository already
  serves itself.
- **FR-003**: The fallback basemap MUST be visually quiet enough that route colours, place
  markers, labels, choropleth shading and the density surface drawn over it all remain
  distinguishable.
- **FR-004**: When a basemap credential is configured, the app MUST load the detailed street
  basemap with no visual change from current behaviour, and MUST NOT draw the fallback.
- **FR-005**: Image and deck export MUST capture whichever basemap is in use, in both modes.
- **FR-006**: The app MUST detect that the detailed basemap is not actually rendering — a
  credential that is wrong, expired, revoked or over quota, or a host that is unreachable —
  and fall back rather than display whatever the host returned.
- **FR-007**: The reason for running on the fallback MUST be reported where the owner can find
  it, and MUST NOT be drawn on the map or anywhere a tester or client can see it.
- **FR-008**: Switching between the two basemaps MUST require no change other than setting or
  clearing the credential.
- **FR-009**: The fallback MUST NOT depend on any third-party host at runtime.
- **FR-010**: If the land-silhouette source is unavailable, the map MUST still render its own
  layers over a plain ground rather than failing to load.

### Key Entities

- **Basemap credential**: the publishable, client-side, domain-restrictable key for the
  detailed tile host. Its presence selects which basemap is drawn. Not a secret — see
  `docs/basemap.md`.
- **Land silhouette**: Singapore's landmass, already present in this repository as the
  planning-area boundaries used by the demographics layers. Serves here purely as ground; its
  demographic attributes are not involved.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero watermark text is visible anywhere on the map, at any zoom level from
  island-wide to street level, in either basemap mode.
- **SC-002**: Beta testing can resume immediately, with no credential, no signup, and no
  account with any third party.
- **SC-003**: Every existing map behaviour — route selection, place layers, area shading,
  density, labels, tooltips, deep links — works unchanged in both modes.
- **SC-004**: An exported JPG and an exported deck each contain a visible basemap in both
  modes, and no watermark.
- **SC-005**: Setting the credential is the only action needed to restore the detailed
  basemap, and doing so leaves already-shipped decks and screenshots visually identical.
- **SC-006**: A tester's feedback session is not spent on the basemap: the map is no longer
  the first thing they remark on.

## Assumptions

- The land silhouette is drawn from `data/planning_areas.geojson`, which the app already
  fetches on every load for the demographics layers. Using it as ground adds no new file, no
  new fetch and no new dependency, which keeps this inside Principle II.
- The fallback is a **fallback**, not a replacement. The detailed street basemap remains the
  intended production look, and this feature does not argue otherwise; it makes the tool
  presentable while there is no credential and on any future day the credential stops working.
- Losing street detail is an accepted, deliberate trade for removing the watermark. For a
  transit-reach tool the routes, stops, rail lines and places carry the argument; streets are
  context. A clean island with no streets is judged better in front of a tester than a
  detailed island stamped `API KEY REQUIRED` thirty times.
- The environment's proxy blocks every tile host, so Story 2 (credential set) cannot be
  verified from the development sandbox and must be checked in a browser, exactly as
  `docs/basemap.md` already prescribes. Its stories will be marked ⚠ with the reason, never ✅
  without evidence, per Principle V.
- No change to the export pipeline's structure is assumed. Removing the cross-origin tile
  layer in fallback mode can only make canvas capture safer, never less safe.
