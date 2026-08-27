# Specs

One directory per feature: `specs/<NNN>-<short-name>/`, created by `/speckit-specify`.

## These nine are retrospective

Specs 001–009 were written on 2026-08-27, back-filling work that shipped between 2026-07-16 and
2026-08-13 — before this repository adopted [Spec Kit](https://github.com/github/spec-kit). They
were reconstructed from the running application, `data/*.json`, the commit history and
`docs/user-stories.md`.

**They did not drive the builds they describe.** They exist so the Constitution Check in future
plans has a baseline to reason against, and so a reader can find out what a feature was *for*
without reverse-engineering `index.html`. Read them as documentation of shipped behaviour, not as
evidence that Principle I (Spec-Driven Delivery) was followed — it could not have been, because
the workflow did not exist yet.

Where a spec's stories *were* written before the build, it says so. That applies to 006, 007, 008
and 009: those shipped after `docs/user-stories.md` started, so their stories are contemporaneous
and carry their original verification evidence. Only the Spec Kit framing around them is
retrospective.

| Spec | Shipped | PRs | Stories written first? |
|------|---------|-----|------------------------|
| [001-transit-network-atlas](001-transit-network-atlas/spec.md) | 2026-07-16 | pre-PR | ✘ reconstructed |
| [002-route-selection-ranking](002-route-selection-ranking/spec.md) | 2026-07-17 | pre-PR | ✘ reconstructed |
| [003-deck-export](003-deck-export/spec.md) | 2026-07-16 → 08-06 | #6, #7 | ⚠ partly (US-14…US-26) |
| [004-poi-layer-catalogue](004-poi-layer-catalogue/spec.md) | 2026-07-20 → 08-06 | #7 | ⚠ partly (US-27…US-35) |
| [005-competitive-density](005-competitive-density/spec.md) | 2026-07-20 | pre-PR | ✘ reconstructed |
| [006-selling-workflow-ui](006-selling-workflow-ui/spec.md) | 2026-08-05 | #2–#5 | ✅ US-1…US-13 |
| [007-shareable-state-rail-focus](007-shareable-state-rail-focus/spec.md) | 2026-08-06 | #8 | ✅ US-36…US-40 |
| [008-data-trust-qc](008-data-trust-qc/spec.md) | 2026-08-06 | #9 | ✅ US-41…US-45 |
| [009-frasers-client-layer](009-frasers-client-layer/spec.md) | 2026-08-13 | #10, #12–#14 | ✅ US-46…US-65 |

## What is deliberately missing

No `plan.md`, `tasks.md` or `checklists/` accompanies these. A spec describes intent and
behaviour, both of which are recoverable from a shipped artefact. A task list describes an
execution that already happened in a different order, or did not happen as a list at all —
writing one now would be invention, not documentation.

Features from 010 onward go through the full workflow and will carry all of it.

## Two of these became constitution principles

- **008** is where Principle III (Data Integrity Gate) came from — the checker, the completeness
  floors, and the generated verification line.
- **009** is where Principle IV (Verified Provenance, Not Assumed Membership) came from — is it
  theirs, *and* is it still open.

Both were learned from defects, which is why the constitution states them as rules rather than
preferences.
