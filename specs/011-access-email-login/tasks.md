# Tasks: Moove-Only Access via Email One-Time PIN

**Feature**: `011-access-email-login` | **Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

Phases 1–2 ship in this pull request. Phase 3 is deliberately **not** run — the request was to set
this up without activating it.

## Phase 1 — Policy as code

- [X] **T001** Write `infra/access-policy.json`: one application over the whole hostname, one allow
  policy whose only include is `email_domain: moovemedia.com.sg`, an empty `exceptions` list, a 24h
  session, one-time PIN as the identity provider. Hostname left as a placeholder for the operator.
- [X] **T002** Record in the same file, as comments-by-convention (`_note` keys), the two decisions
  a reviewer will otherwise have to guess: why the whole hostname is covered, and that subdomain
  addresses are excluded.

## Phase 2 — Apply script and runbook

- [X] **T003** Write `infra/apply_access.py`. Standard library only. Reads
  `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment; never from a file.
- [X] **T004** Make `--dry-run` the default. Applying requires an explicit `--apply`, so running the
  script by accident cannot lock anyone out.
- [X] **T005** Dry run prints the exact API calls — method, URL, JSON body — so the change is
  reviewable before it is real.
- [X] **T006** Refuse to run if the hostname is still the placeholder, so a half-configured policy
  cannot be applied.
- [X] **T007** Write `docs/access-setup.md`: prerequisites, activation, verification, rollback,
  named exceptions, service tokens for automated checks.
- [X] **T008** State in the runbook that a custom domain is a hard prerequisite — Access cannot sit
  in front of a `github.io` address.

## Phase 2b — Make activation one command

- [X] **T026** Discover the Cloudflare account from the token, so the operator does not have to
  find an account ID. Fail with the choices listed if the token can see more than one.
- [X] **T027** Preflight the hostname against Cloudflare's zone list and fail *before* creating
  anything if the domain was never delegated — the most common setup mistake, and the one that
  otherwise leaves a half-built application behind.
- [X] **T028** Add `--verify`: unauthenticated requests for the page and a data file, exiting
  non-zero if either is served. Needs no token. Runs automatically after `--apply`.
- [X] **T029** Sabotage-test the checker in `infra/test_verify.py`. A verification that always
  passes certifies an open door. Four cases: open door, gate holding, **page gated but data
  leaking**, and Cloudflare's interstitial served with HTTP 200.

## Phase 2 — Verification (this PR)

- [X] **T009** `python3 infra/apply_access.py` with the placeholder hostname exits non-zero and
  applies nothing.
- [X] **T010** Dry run with a hostname set prints both intended calls and makes no network request.
- [X] **T011** `git grep` finds no token, secret or credential in the repository.
- [X] **T012** `index.html` is byte-identical to its state before this feature.
- [X] **T013** `python3 tools/qc_poi.py` still passes.
- [X] **T014** The live site is unchanged by merging this — nothing here is activated.
- [X] **T015a** `python3 infra/test_verify.py` passes all four cases, including the page-gated-
  but-data-leaking case that a browser check would miss.

## Phase 3 — Activation (NOT in this PR)

Left unchecked deliberately. Each is an acceptance criterion for the day someone decides to turn
this on, and each maps to a story that stays unverified until then.

- [ ] **T030** Obtain a hostname and put it on Cloudflare DNS, with the atlas reachable through it.
- [ ] **T016** Mint a Cloudflare API token scoped to Access write on that zone.
- [X] **T017** Confirm whether `@sg.moovemedia.com.sg`-style addresses should be admitted.
  Answered 2026-08-27: no subdomain variants exist, so the single domain rule is complete.
  No policy change needed.
- [ ] **T018** Set the hostname in `infra/access-policy.json` and re-run the dry run.
- [ ] **T019** Apply with `--apply`.
- [ ] **T020** Verify US-1: a `@moovemedia.com.sg` address signs in via emailed code, no invitation.
- [ ] **T021** Verify US-2: a non-Moove address is refused, and an unauthenticated `curl` of a data
  file returns no data.
- [ ] **T022** Verify US-4: a headless check passes using a service token, with the token supplied
  from the environment.
- [ ] **T023** Verify a shared `#r=…&l=…` deep link survives sign-in and resumes to the right map.
- [ ] **T024** Record every story's result with its evidence in `docs/user-stories.md` under a dated
  heading, per Principle V.
- [ ] **T025** Update the spec's Status from "configured but not activated" to active, with the date.

## Dependencies

T001 → T003 → T004/T005/T006 → T009/T010. T007 depends on the script's interface being settled.
Phase 3 is blocked on T030 and T016, which are operator actions outside this repository.
