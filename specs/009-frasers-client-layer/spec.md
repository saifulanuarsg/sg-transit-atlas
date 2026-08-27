# Feature Specification: Frasers Client Layer & Derived Bus Assets

**Feature Branch**: `009-frasers-client-layer`

**Created**: 2026-08-13

**Status**: Shipped — retrospective

**Input**: Reconstructed from shipped behaviour. Commits `d148e9f` (PR #10), `5879257` (PR #12),
`e429b39` (PR #13), `575accc` (PR #14); `data/poi_frasers.json`, `tools/frasers_assets.py`,
`docs/frasers-assets.md`, and stories US-46…US-65 in `docs/user-stories.md`.

> **Retrospective spec.** This feature shipped before the repository adopted Spec Kit. Its user
> stories *were* written before each build — it ran over four pull requests, each starting from a
> persona walkthrough or a user correction, with every story verified headless. This spec
> consolidates them into the Spec Kit format after the fact; the stories themselves are
> contemporaneous.
>
> This feature is where Constitution Principle IV (Verified Provenance, Not Assumed Membership)
> came from — it was learned here, expensively.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See a client's portfolio as its own layer (Priority: P1)

An account manager pitching a property owner puts that owner's entire footprint on the map as one
layer, rather than remembering which of hundreds of generic mall entries belong to them.

**Why this priority**: Reconstructing a client's portfolio from a generic layer by name-matching
is both the slowest part of preparing the pitch and the part most likely to be silently wrong.

**Independent Test**: Enable the client layer and confirm it contains exactly the client's spaces,
each identified by type and ownership.

**Acceptance Scenarios**:

1. **Given** the layer picker, **When** the user enables the client layer, **Then** every space in
   the client's portfolio renders, with its count stated.
2. **Given** a space in the layer, **When** it renders, **Then** it carries its type (retail or
   commercial) and its ownership status.
3. **Given** the layer, **When** the ranking runs, **Then** it can be ranked against like any
   other layer.

---

### User Story 2 - Know a space is theirs, and that it is still open (Priority: P1)

Every entry has been checked twice — that the client owns it, and that it is still trading — and
the check is dated.

**Why this priority**: This is the story the feature exists to tell. A closed mall in a landlord
pitch is worse than a missing one: it is the client's own asset, and they know exactly when it
shut. Every source available agreed with itself and was stale.

**Independent Test**: Confirm each entry's trading status has been checked, the check is dated in
the sources line, and deliberately absent sites are recorded as decisions.

**Acceptance Scenarios**:

1. **Given** any entry, **When** it ships, **Then** both its ownership and its trading status have
   been verified.
2. **Given** the layer's sources line, **When** it renders, **Then** it carries the date the
   trading check was made.
3. **Given** a space with a redevelopment or closure pending, **When** the user hovers it,
   **Then** a flagged note surfaces that status before the meeting rather than after.
4. **Given** a site deliberately excluded, **When** the audit document is read, **Then** its
   absence is recorded as a decision with a reason, not left as an apparent gap.

---

### User Story 3 - Get the buses that serve them in one tap (Priority: P1)

The account manager puts the services that reach the client's spaces on the map without
assembling that list by hand from hundreds of candidates.

**Why this priority**: Assembling this list by hand *is* the job the pitch requires, and it is
the part that goes stale first.

**Independent Test**: Tap a regional package and confirm the routes select, the map refits, and
the client layer switches on.

**Acceptance Scenarios**:

1. **Given** the client packages, **When** the user taps one, **Then** its routes are selected, the
   map refits, and the export becomes available.
2. **Given** a package tapped, **When** it activates, **Then** the client layer is switched on —
   a package sold on named places is unreadable without them.
3. **Given** a package button, **When** it renders, **Then** its coverage line names the client's
   *spaces*, not the route termini.
4. **Given** an active package, **When** it is tapped again, **Then** the selection clears.

---

### User Story 4 - Derive the lists, never type them (Priority: P1)

The route lists are computed from the live network at load, so a package that changes because the
network changed shows up in review rather than going quietly stale.

**Why this priority**: A hand-listed package is wrong the first time a service is amended, and
nobody notices.

**Independent Test**: Confirm the app derives the packages at runtime and that an offline tool
reproduces them identically into a reviewable document.

**Acceptance Scenarios**:

1. **Given** the app at load, **When** packages are built, **Then** they are derived from the stop,
   network and passenger-volume data rather than hardcoded.
2. **Given** the same rule run offline, **When** the audit document is regenerated, **Then** it
   matches the running app exactly.
3. **Given** a package, **When** the audit document renders it, **Then** it shows which spaces each
   service reaches, so a thin story is visible before the meeting.

---

### User Story 5 - Know the smallest buy that covers everything (Priority: P2)

Asked "how many buses do I actually need?", the account manager answers from a derived minimum
rather than by eye.

**Acceptance Scenarios**:

1. **Given** the client's spaces, **When** the minimum buy is derived, **Then** the smallest set of
   services reaching all of them is computed and offered as a package.
2. **Given** that set, **When** the audit document renders it, **Then** it lists each service and
   the spaces it brings in.

### Edge Cases

- A space the client half-owns, or that sits in the portfolio of a related but different entity —
  must be represented as what it is, or excluded with the reason recorded.
- A space whose published listing outlives its closure — the published listing is not evidence of
  trading.
- A space present in a generic third-party layer under a different name, or absent from it
  entirely — deriving the client layer from that layer by name would silently drop entries.
- A structurally quiet space served by few routes — must be visible as thin rather than averaged
  away.
- A space made of two wings far enough apart to matter — must be represented as one place at a
  position that reflects both.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A client's portfolio MUST be its own layer, not a filtered view of a generic layer.
- **FR-002**: Each entry MUST carry its type and ownership status.
- **FR-003**: Each entry MUST have both its ownership and its trading status verified before
  shipping.
- **FR-004**: The layer's sources line MUST carry the date of the trading check.
- **FR-005**: An entry with a pending closure or redevelopment MUST surface that in its tooltip.
- **FR-006**: Deliberately excluded sites MUST be recorded with their reason.
- **FR-007**: Coordinates MUST come from an authoritative geocode, never from an address estimate.
- **FR-008**: Route packages MUST be derived from live network data at load, never hardcoded.
- **FR-009**: An offline tool MUST reproduce the same derivation into a reviewable document.
- **FR-010**: Package buttons MUST name the client's spaces in their coverage line.
- **FR-011**: Activating a client package MUST switch on the client layer.
- **FR-012**: The audit document MUST show per-space reach so thin coverage is visible.
- **FR-013**: System MUST derive and offer the smallest set of services reaching every space.
- **FR-014**: The layer MUST carry a completeness floor in the data checker.
- **FR-015**: Client packages MUST behave like every other package — clear on second tap, share by
  link, and name the export.

### Key Entities

- **Client space**: One property in the portfolio — name, type, ownership, authoritative
  coordinates, and optionally a status note.
- **Derived package**: A regional set of services computed from the network against the client's
  spaces, with the spaces it covers.
- **Minimum buy**: The smallest set of services reaching every space in the portfolio.
- **Audit document**: The offline-generated record of the derivation, reviewable in a diff.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No closed or divested property appears in the layer.
- **SC-002**: The layer matches the client's own published portfolio exactly, with every
  divergence recorded as a decision.
- **SC-003**: Every coordinate comes from an authoritative geocode.
- **SC-004**: The packages in the running app match the committed audit document exactly.
- **SC-005**: An account manager can go from opening the app to an exported client-ready package
  without assembling any route list by hand.
- **SC-006**: The minimum buy is provably minimal, not merely small.

## Assumptions

- The client's own published directory is the authority on what is theirs — but not on whether a
  site still trades.
- Third-party mapping data is a useful cross-check and never a source of truth for either
  question.
- Regional grouping matches how the client thinks about their own portfolio.
- The derivation rule (services stopping within the walking catchment, ranked by spaces covered
  then by boardings) is the working definition of "serves this space".
- This pattern generalises: the next client layer follows the same two-question rule.
