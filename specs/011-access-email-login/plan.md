# Implementation Plan: Moove-Only Access via Email One-Time PIN

**Branch**: `011-access-email-login` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-access-email-login/spec.md`

## Summary

Restrict the atlas to holders of `@moovemedia.com.sg` addresses by putting **Cloudflare Access** in
front of the site, using its built-in **one-time PIN** identity provider and an `email_domain`
policy. Enforcement happens at the edge, before the origin is reached, so `data/*.json` is covered
along with the page. No application code changes: `index.html` stays byte-identical.

The policy is committed as code (`infra/access-policy.json`) and applied by a script that is
**dry-run by default**. Nothing is activated by merging this feature.

## Technical Context

**Language/Version**: Python 3.11 for the apply script (the repo's existing tooling language); no
application language change.

**Primary Dependencies**: Cloudflare Access (Zero Trust). No new runtime dependency for the app;
the apply script uses only the standard library.

**Storage**: N/A. Policy state lives in Cloudflare; its intended value lives in
`infra/access-policy.json`.

**Testing**: `tools/qc_poi.py` unaffected. Post-activation verification by headless browser plus an
unauthenticated `curl` of a data file, per the repo's existing method.

**Target Platform**: Static site behind Cloudflare's edge. Current origin is GitHub Pages; the
design is origin-agnostic and survives a later move to Vercel.

**Project Type**: Static single-file web app plus infrastructure configuration.

**Performance Goals**: Sign-in within one email round-trip. Edge check adds negligible latency to
authenticated requests.

**Constraints**: No secret in the repository. No build step. No backend. Must ship inactive. Must
leave an automated-check path that does not require a human.

**Scale/Scope**: Under 50 users, which keeps this inside the provider's free tier.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Verdict | Reasoning |
|---|---|---|
| **I. Spec-driven delivery** | ✅ Pass | `spec.md` written and reviewed before any change. |
| **II. Single self-contained artifact** | ✅ Pass — see below | The constitution forbids a *build step, package manifest or backend* in the product. This adds none: `index.html` is untouched, no bundler, no server code, no runtime dependency. Access is edge infrastructure in front of an unchanged static site — the same category as DNS or TLS, neither of which the constitution treats as architecture. **This is exactly why the Cloudflare route was chosen over building auth into the app**, which would have required middleware and a provider and would have been a MAJOR amendment. |
| **III. Data integrity gate** | ✅ Pass | No `data/poi_*.json` edit. `qc_poi.py` runs unchanged and must still pass. |
| **IV. Verified provenance** | ✅ N/A | No client or venue layer involved. |
| **V. Simulation → stories → evidence** | ⚠️ Deferred with reason | Stories are written and the verification method is specified, but they cannot be verified until the feature is activated — and the request was explicitly not to activate. The runbook carries the verification steps as activation acceptance criteria. No story is marked ✅ until then. |

**Complexity justification**: none required. The rejected alternative (in-app auth) was *more*
complex, not less; see spec Assumptions and the comparison below.

### Alternatives considered

- **In-app login gate in `index.html`.** Rejected: on a static public origin this protects nothing —
  `data/*.json` stays fetchable by URL — so it would be a security theatre control that reads as a
  real one. That is worse than no gate.
- **Vercel Deployment Protection.** Rejected on capability, not preference. Vercel Authentication
  admits *team members*, which is a hand-maintained invite list, not a domain rule; Password
  Protection is a single shared secret with no identity; domain SSO is Enterprise. None expresses
  `@moovemedia.com.sg`, and none is email-link sign-in. Building it on Vercel instead means
  middleware plus an auth provider — a build step and a backend, i.e. a MAJOR amendment.
- **Move hosting to Vercel and use Access anyway.** Viable and explicitly preserved: Access is
  origin-agnostic, so this plan does not foreclose it. Hosting and authentication are independent
  decisions here.

## Project Structure

### Documentation (this feature)

```text
specs/011-access-email-login/
├── spec.md              # written
├── plan.md              # this file
└── tasks.md             # written
```

No `research.md`, `data-model.md` or `contracts/` — there is no data model, no API surface of our
own, and the research fits in the Alternatives section above.

### Source Code (repository root)

```text
index.html                    UNCHANGED — no login UI, no session code
data/*.json                   UNCHANGED — protected by the edge, not by the app
infra/
├── access-policy.json        the policy as code: domain rule, exceptions, session lifetime
└── apply_access.py           applies it via the Cloudflare API; --dry-run is the default
docs/
└── access-setup.md           runbook: prerequisites, activation, verification, rollback
```

`infra/` is new. It holds infrastructure intent, never secrets — credentials are read from the
environment at run time.

## Phase 0 — Prerequisites (operator, before activation)

1. A hostname that can be served through Cloudflare. Access cannot be applied to a `github.io`
   address, so a custom domain is required. This is also true on the Vercel path.
2. That hostname on Cloudflare DNS, with the atlas reachable through it.
3. A Cloudflare API token limited to Access application and policy write on that zone.
4. ~~Confirmation on subdomain addresses.~~ Answered 2026-08-27: Moove has one mail domain and
   no subdomain variants, so the single `email_domain` rule is complete.

## Phase 1 — Design

**Policy shape.** One Access application covering the whole hostname (`/*`), one allow policy whose
sole `include` is `email_domain: moovemedia.com.sg`, plus an `exceptions` list for named
individuals. Identity provider: one-time PIN, which requires no directory. Session duration: 24h,
so a seller signs in once a day rather than mid-pitch.

**Why the whole hostname.** Gating only the sell-side would need those parts on separate paths, and
`data/*.json` would still have to be covered — which is the entire hostname in practice.

**Automated checks.** Access service tokens give a non-interactive path: the check sends the token
headers and never sees the sign-in prompt. The token lives in the environment, never in the repo.

**Deep links.** Access preserves the originally requested URL through sign-in, so feature 007's
`#r=…&l=…` state survives — the fragment never leaves the browser, so it is intact on arrival.

### Constitution re-check after design

Unchanged: ✅ on I–IV, ⚠️ deferred on V with the reason recorded above. The design introduced no
application code, so Principle II's verdict does not move.

## Phase 2 — Implementation (this PR)

Write `infra/access-policy.json`, `infra/apply_access.py` (dry-run default) and
`docs/access-setup.md`. Verify the script's dry run renders the intended API calls. Do not apply.

## Phase 3 — Activation (deliberate, later, not in this PR)

Follow `docs/access-setup.md`: apply the policy, then verify — a Moove address signs in, a
non-Moove address is refused, an unauthenticated `curl` of a data file returns no data, a headless
check passes with a service token — and mark the spec's stories against that evidence. Roll back
with the documented step if anything fails.

## Risks

| Risk | Mitigation |
|---|---|
| Activation locks out someone who needs access | Ships inactive; runbook has a one-step rollback and a named-exception mechanism |
| No custom domain available | Flagged in Phase 0 as a hard prerequisite before activation is even possible |
| Free tier exceeded (>50 users) | Stated assumption; provider charges per user beyond it |
| Codes land in spam | Runbook says where to look |
| A departed employee retains a live mailbox | Accepted and stated in the spec — the gate authenticates a mailbox, not employment |
