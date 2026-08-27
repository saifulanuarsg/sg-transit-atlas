<!--
Sync Impact Report
- Version change: none → 1.0.0 (initial ratification; template placeholders replaced)
- Modified principles: none (no prior constitution existed)
- Added sections:
  - Core Principles I–V
  - Platform & Data Constraints
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: none
- Templates reviewed for alignment:
  - .specify/templates/plan-template.md — Constitution Check gate reads this file at runtime, no edit needed
  - .specify/templates/spec-template.md — no constitution-specific placeholders, no edit needed
  - .specify/templates/tasks-template.md — no constitution-specific placeholders, no edit needed
  - .specify/templates/checklist-template.md — no constitution-specific placeholders, no edit needed
- Follow-up TODOs: none (all placeholders resolved)
-->

# Singapore Transit Atlas Constitution

## Core Principles

### I. Spec-Driven Delivery

Every behaviour change starts as a written specification under `specs/<NNN>-<short-name>/`
before any line of `index.html` or `data/` is touched. The order is
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`, and the
spec MUST describe user-visible outcomes, not implementation.

- A change that alters what a user sees, clicks, exports or trusts MUST have a `spec.md`.
- Pure chores (dependency-free typo fixes, comment edits, regenerating `data/qc_report.json`)
  MAY skip the workflow, and the PR MUST say so.
- The spec is the source of truth. When implementation and spec disagree, one of them is
  wrong and the PR MUST resolve which before merging.

Rationale: the app is a single 200 KB HTML file with no build step and no test runner. The
spec is the only place where intended behaviour can be pinned down and reviewed before it
becomes 200 lines of inline JavaScript.

### II. Single Self-Contained Artifact

The application is one file, `index.html`, with data in `data/*.json`. There is no build
step, no bundler, no transpiler, and no server.

- `index.html` MUST remain directly openable and MUST remain the only application file.
- New data MUST arrive as a JSON file under `data/`, fetched at runtime — never inlined
  into the HTML.
- Third-party libraries MUST be loaded from a CDN at runtime; the repository MUST NOT
  vendor them.
- Any proposal that introduces a build step, a package manifest, or a backend is a
  constitutional amendment, not a feature.

Rationale: GitHub Pages serves this repository directly from `main`. Zero build means the
deployed bytes are the reviewed bytes.

### III. Data Integrity Gate (NON-NEGOTIABLE)

`python3 tools/qc_poi.py` MUST pass before any commit that touches `data/poi_*.json`.

- Every failure MUST be fixed, never suppressed, waived, or worked around by relaxing the
  checker.
- The checker enforces: non-empty names, Singapore bounds, exact-duplicate rows, per-layer
  completeness floors, and point↔footprint consistency.
- Point↔footprint consistency is the load-bearing check: an entry stitched from two
  campuses, or a footprint left stale after a campus move, MUST fail loudly rather than
  ship.
- Adding a layer MUST also add its completeness floor to the checker.

Rationale: this is a sales and planning tool. A stop attributed to the wrong catchment is
not a cosmetic bug — it is a wrong number in a client meeting.

### IV. Verified Provenance, Not Assumed Membership

A client or venue layer requires two independent checks: **is it theirs**, and **is it
still trading**.

- Presence on an owner's own portfolio page is NOT evidence of trading status.
- Presence in OpenStreetMap is NOT evidence of trading status.
- Each entry's closure/redevelopment status MUST be checked, and the layer's sources line
  MUST carry the date that check was made.
- A site with a redevelopment or lease expiry hanging over it MUST be flagged in its `note`
  field so the tooltip surfaces it.
- Coordinates MUST come from an authoritative geocode, not from estimating off an address.

Rationale: Robertson Walk sat on Frasers' own mall pages long after it closed on
31 May 2025, and both it and the divested Changi City Point were still tagged `shop=mall`
in OpenStreetMap. Estimating Robertson Walk from its address put it 134 m off. Every one of
these would have been discovered by a client, not by us.

### V. Simulation → Stories → Evidence

When a change is driven by simulating a user — a persona walkthrough or a UX critique — the
user stories MUST be written down before the build, and MUST be verified against the
running app after it.

1. Write the stories to `docs/user-stories.md` under a dated simulation heading.
2. Build.
3. Check every story against the real app — headless browser run or screenshot — and record
   ✅ / ⚠ / ✘ against each one with the evidence that produced the mark.
4. Show the story table in the PR summary.

A story with no evidence recorded is an unverified story and MUST be marked ⚠ or ✘, never ✅.

Rationale: without a test suite, the story table *is* the regression record. Writing the
stories after the build turns them into a description of what was shipped rather than a
test of it.

## Platform & Data Constraints

**Runtime.** Client-side only. Leaflet for mapping, html2canvas and pptxgen for export.
Open data sources: LTA DataMall passenger volume, SingStat Census 2020, OneMap, and
OpenStreetMap. The impressions layer is a *model*, and any surface that shows it MUST label
it as modelled rather than measured.

**Development environment.** The proxy blocks most non-GitHub hosts — including unpkg,
cdnjs, OSM/Overpass and OneMap. Therefore:

- Local testing MUST use `python3 -m http.server` plus Playwright/Chromium.
- CDN assets MUST be stubbed or served locally during tests; a test that silently skips
  because a CDN 403'd is a failed test, not a passed one.
- When OneMap is unreachable, geocode from the `xkjyeah/singapore-postal-codes`
  `buildings.json` OneMap dump, which GitHub serves.

**Deployment.** GitHub Pages builds from `main`. Merging a PR *is* the deploy — there is no
staging environment and no rollback other than a follow-up commit.

## Development Workflow & Quality Gates

Every pull request MUST clear these gates before merge:

| Gate | Applies to | Requirement |
|------|-----------|-------------|
| Spec | Behaviour changes | `specs/<NNN>-<short-name>/spec.md` exists and matches the diff |
| Constitution Check | All plans | `plan.md` Constitution Check section passes, or records a justified violation |
| Data QC | `data/poi_*.json` edits | `python3 tools/qc_poi.py` exits clean; `data/qc_report.json` regenerated |
| Provenance | Client/venue layers | Ownership *and* trading status checked, sources line dated |
| Story verification | Simulation-driven work | `docs/user-stories.md` updated; every story marked with evidence |
| Deploy readiness | All | `index.html` opens and renders against a local `http.server` |

Complexity is justified in `plan.md`, not defended in review. A simpler alternative that
was rejected MUST be named along with the reason it was rejected.

## Governance

This constitution supersedes ad-hoc practice. Where `CLAUDE.md` and this document overlap,
`CLAUDE.md` is the operational restatement and this document is the authority.

**Amendment procedure.** Amendments are made by editing this file via `/speckit-constitution`
in a pull request that states the rationale. The PR MUST identify which principles change
and what already-shipped behaviour is affected.

**Versioning policy.** Semantic versioning:

- **MAJOR** — a principle is removed or redefined in a backward-incompatible way.
- **MINOR** — a principle or section is added, or its guidance materially expanded.
- **PATCH** — clarification, wording, or typo fixes with no change in obligation.

**Compliance review.** Every PR review MUST verify the gates in the table above. Principle
III (Data Integrity Gate) admits no exception: a PR that touches `data/poi_*.json` without a
clean `qc_poi.py` run MUST NOT merge, regardless of urgency.

Runtime development guidance for coding agents lives in `CLAUDE.md`; it MUST be kept
consistent with this constitution whenever this constitution is amended.

**Version**: 1.0.0 | **Ratified**: 2026-07-16 | **Last Amended**: 2026-08-27
