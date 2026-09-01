# Specification Quality Checklist: A basemap that never shows a watermark

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-01
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Items marked incomplete require spec updates before `/speckit-clarify` or `/speckit-plan`.

**Validation run 1 — issues found and fixed:**

- *No implementation details*: the first draft named CARTO, Leaflet and the tile URL in the
  requirements. Rewritten to "the watermarking tile host" / "the detailed street basemap" and
  the vendor detail moved to Context and Assumptions, where it is diagnosis rather than
  instruction.
- *Requirements testable*: FR-003 originally read "the fallback must look good", which is not
  testable. Restated as the specific thing that can be checked — route colours, markers,
  labels, shading and the density surface all remain distinguishable over it.
- *Edge cases*: the first draft covered only "no key". Added the case that actually matters
  operationally — a key that is present but wrong, expired, revoked or over quota, which
  returns watermarked tiles and would otherwise reintroduce the exact defect being removed.
  That case produced FR-006.

**Standing note on evidence (Principle V):** SC-005 and User Story 2 depend on a credential
that does not exist and on a tile host the development environment blocks. They cannot be
verified in the sandbox and must be marked ⚠ with that reason in `docs/user-stories.md`, not
✅. Recorded here so the gap is deliberate and visible rather than discovered at review.
