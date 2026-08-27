# Feature Specification: Remove the Frasers Client Layer

**Feature Branch**: `010-remove-frasers-layer`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "remove the fraser client layer"

Supersedes `009-frasers-client-layer`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The atlas carries no client-specific portfolio (Priority: P1)

A seller opens the atlas and finds the general place layers, with no single client's portfolio
built into the product. The Frasers layer, its four regional packages and its minimum-buy package
are gone.

**Why this priority**: This is the whole change. A client layer embedded in the shipped product is
a standing commitment to keep that client's portfolio accurate — every closure, divestment and
acquisition — and Principle IV makes that commitment expensive. Removing it removes the liability.

**Independent Test**: Load the app and confirm no Frasers layer appears in the picker, the
ranking, or the packages, and that nothing errors.

**Acceptance Scenarios**:

1. **Given** the layer picker, **When** the user browses Retail & dining, **Then** no Frasers
   layer is offered.
2. **Given** the route packages, **When** they render, **Then** no Frasers regional package and no
   minimum-buy package appear.
3. **Given** the ranking selector, **When** it renders, **Then** Frasers is not among the layers
   to rank against.
4. **Given** the app loads, **When** the console is inspected, **Then** there are no errors from
   the removed derivation.

---

### User Story 2 - Nothing else regresses (Priority: P1)

Every other layer, package and tooltip behaves exactly as before.

**Why this priority**: The Frasers work touched shared machinery — the product registry, the
tooltip builder, the data checker. A removal that nicks any of those is worse than leaving the
layer in.

**Independent Test**: Exercise a non-Frasers package, a footprint tooltip, a place with a status
note, and the ranking, and confirm each behaves as before.

**Acceptance Scenarios**:

1. **Given** any other package, **When** the user taps it, **Then** it selects, refits and clears
   on second tap as before.
2. **Given** a place carrying a status note, **When** the user hovers it, **Then** the flagged
   note still renders — that behaviour is general, not Frasers-specific.
3. **Given** the data checker, **When** it runs, **Then** it passes with the remaining layers and
   its completeness floors intact.

---

### User Story 3 - The lesson survives the layer (Priority: P1)

The rule the Frasers work produced — check that a venue is theirs *and* that it is still open —
remains in force after the layer that taught it is gone.

**Why this priority**: The layer was an instance; the rule is the asset. Deleting the rule
alongside the data would guarantee the next client layer repeats the mistake.

**Acceptance Scenarios**:

1. **Given** the constitution, **When** Principle IV is read, **Then** it still states the
   two-question rule with the case that produced it.
2. **Given** `CLAUDE.md`, **When** the working notes are read, **Then** the same rule is still
   there.
3. **Given** `specs/009`, **When** it is read, **Then** it remains as the historical record,
   marked superseded rather than deleted.
4. **Given** `docs/user-stories.md`, **When** it is read, **Then** the Frasers simulation runs
   remain — the log is a record of what happened, not of what currently ships.

### Edge Cases

- A shared URL carrying a Frasers package selection — the routes in it are ordinary services and
  must still resolve; only the package identity is gone.
- An unrelated place that merely has "Frasers" in its name (`Ya Kun Kaya Toast - Frasers Tower` in
  the F&B layer) — must be left alone; it is a tenant, not the client layer.
- The data checker's completeness floors — removing one must not disturb the others.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Frasers place layer MUST be removed from the layer catalogue.
- **FR-002**: The Frasers place data file MUST be deleted.
- **FR-003**: The runtime derivation of Frasers route packages MUST be removed, including its
  constants, its region table and its call site.
- **FR-004**: The offline tool that reproduces that derivation MUST be deleted, along with the
  audit document it generates.
- **FR-005**: The Frasers branch of the place tooltip MUST be removed; the general status-note
  branch MUST remain.
- **FR-006**: The Frasers completeness floor MUST be removed from the data checker, leaving the
  remaining floors intact.
- **FR-007**: Documentation naming the deleted tool MUST be updated.
- **FR-008**: The two-question provenance rule MUST remain in the constitution and in the working
  notes.
- **FR-009**: `specs/009` MUST be retained and marked superseded.
- **FR-010**: The user-story log MUST be left intact as a historical record.
- **FR-011**: Places in other layers whose names merely contain "Frasers" MUST be untouched.
- **FR-012**: No other layer, package, tooltip or checker behaviour may change.

### Key Entities

- **Client layer**: A place layer scoped to one organisation's portfolio. After this change the
  product ships none.
- **Derived package**: A route set computed from a client layer. After this change all remaining
  packages are curated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No reference to the Frasers layer remains in the application or its data.
- **SC-002**: The app loads with no console errors and every remaining layer renders.
- **SC-003**: The data checker passes with 36 layers and its remaining floors enforced.
- **SC-004**: The two-question provenance rule is still stated in the constitution.
- **SC-005**: The historical record — spec 009 and the user-story log — is intact.

## Assumptions

- The removal is permanent; this is not a temporary hide behind a flag.
- No other client layer is intended to replace it in this change.
- Shared links that named a Frasers package are acceptable collateral — the routes still resolve,
  only the package label is gone.
- The `docs/frasers-assets.md` audit document has no value once its source data and generator are
  gone; it is deleted rather than frozen.
