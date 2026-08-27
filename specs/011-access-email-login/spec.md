# Feature Specification: Moove-Only Access via Email One-Time PIN

**Feature Branch**: `011-access-email-login`

**Created**: 2026-08-27

**Status**: Draft — configured but not activated

**Input**: User description: "email link login - but only for moovemedia.com.sg emails. no need to
activate, just set up first"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A Moove colleague signs in with their work email (Priority: P1)

Someone at Moove Media opens the atlas link, is asked for their email, receives a one-time code,
enters it, and is in. They never create an account and nobody has to invite them first.

**Why this priority**: This is the feature. Anything that requires an administrator to add each
person by hand fails the actual requirement, which is that the company's own email domain is the
credential.

**Independent Test**: From a clean browser, visit the site with a `@moovemedia.com.sg` address and
confirm sign-in completes without any prior invitation.

**Acceptance Scenarios**:

1. **Given** a visitor with a `@moovemedia.com.sg` address, **When** they enter it at the sign-in
   prompt, **Then** a one-time code is emailed to them.
2. **Given** that code, **When** they enter it before it expires, **Then** the atlas loads.
3. **Given** a new Moove starter who has never used the atlas, **When** they visit, **Then** they
   can sign in with no administrator action.
4. **Given** a signed-in session, **When** they return within the session lifetime, **Then** they
   are not asked to sign in again.

---

### User Story 2 - Everyone else is turned away (Priority: P1)

A visitor without a Moove address cannot reach the atlas, and cannot reach its data files either.

**Why this priority**: A gate that only covers the page is not a gate. The atlas is a static site
whose value sits in `data/*.json`; if those stay publicly fetchable the restriction is decorative.

**Independent Test**: Request both the page and a data file directly, unauthenticated, and confirm
neither returns content.

**Acceptance Scenarios**:

1. **Given** a visitor with a non-Moove address, **When** they attempt to sign in, **Then** access
   is denied.
2. **Given** an unauthenticated client, **When** it requests any data file directly by URL,
   **Then** it does not receive the file.
3. **Given** an unauthenticated client, **When** it requests any application URL, **Then** it is
   sent to the sign-in prompt rather than served content.
4. **Given** a signed-in session, **When** the session expires, **Then** the next request requires
   signing in again.

---

### User Story 3 - The restriction is configured but dormant (Priority: P1)

The configuration exists, is reviewable, and is switched off. Turning it on is a deliberate
separate act.

**Why this priority**: The request was explicitly to set this up without activating it. A gate
that switches itself on at merge would lock out the current audience without warning.

**Independent Test**: Confirm the repository carries the configuration and the runbook, and that
the live site is still reachable without signing in.

**Acceptance Scenarios**:

1. **Given** this feature merged, **When** anyone visits the live site, **Then** it loads exactly
   as before, with no sign-in prompt.
2. **Given** the configuration, **When** a reviewer reads it, **Then** the policy — the domain
   rule, the session lifetime, the sign-in method — is legible without opening a dashboard.
3. **Given** the runbook, **When** an operator follows it, **Then** they can activate the
   restriction and roll it back.

---

### User Story 4 - Automated checks still work (Priority: P2)

Headless verification runs against the site after activation without a human entering a code.

**Why this priority**: Principle V requires stories to be verified against the real app. A gate
that blocks the verification method breaks the project's own quality process.

**Acceptance Scenarios**:

1. **Given** the restriction active, **When** an automated check runs with a service credential,
   **Then** it reaches the app without interactive sign-in.
2. **Given** that credential, **When** it is stored, **Then** it is not committed to the
   repository.

### Edge Cases

- A Moove employee with an alias or a subdomain address (`@sg.moovemedia.com.sg`) — the policy must
  state whether these are in or out rather than failing them by accident.
- A contractor or client who legitimately needs access — there must be a documented way to admit a
  named individual without widening the domain rule.
- A shared deep link (feature 007's URL state) opened by someone not signed in — must land on the
  sign-in prompt and then resume to the intended map, not drop the state.
- Someone who has left Moove but whose mailbox still exists — the gate is only as current as the
  mail domain; this is a stated limitation, not a defect to solve here.
- The code email landing in spam — the runbook must say where to look.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Access MUST require proof of control of an email address ending `@moovemedia.com.sg`.
- **FR-002**: Sign-in MUST be by a one-time code emailed to the visitor; no account creation and no
  pre-registration.
- **FR-003**: No administrator action may be required to admit a new holder of a qualifying address.
- **FR-004**: Enforcement MUST happen before any content is served, covering the application and
  every data file.
- **FR-005**: An unauthenticated request to any URL MUST NOT return application content.
- **FR-006**: Sessions MUST expire and require re-authentication.
- **FR-007**: Individual non-qualifying addresses MUST be admissible by explicit exception, without
  relaxing the domain rule.
- **FR-008**: The policy MUST be recorded in the repository in a form reviewable in a diff.
- **FR-009**: The restriction MUST ship inactive; activation is a separate, deliberate act.
- **FR-010**: A documented rollback MUST exist.
- **FR-011**: Automated checks MUST be able to bypass interactive sign-in with a credential that is
  never committed.
- **FR-012**: No credential, token or secret may enter the repository.
- **FR-013**: The application source MUST NOT change — no login UI, no session code in
  `index.html`.

### Key Entities

- **Access policy**: The rule admitting a visitor — the domain condition, its explicit exceptions,
  and the session lifetime.
- **Protected origin**: Everything served under the atlas hostname, including `data/*.json`.
- **Service credential**: The non-interactive token allowing automated checks past the gate.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A holder of a `@moovemedia.com.sg` address reaches the atlas within one email
  round-trip, with no prior invitation.
- **SC-002**: An unauthenticated request for any `data/*.json` file returns no data.
- **SC-003**: A non-qualifying address cannot reach the atlas by any route.
- **SC-004**: On merge, the live site behaves exactly as it does today.
- **SC-005**: `index.html` is byte-identical.
- **SC-006**: The repository contains no secret.
- **SC-007**: An operator can activate and roll back from the runbook alone.

## Assumptions

- **Scope is the whole atlas.** Gating only part of it would require splitting the app across
  paths, which fights the single-file architecture — and leaves the data files exposed either way.
- Moove Media controls the `moovemedia.com.sg` mail domain, and holding such an address is
  sufficient evidence of belonging. This is authentication of a mailbox, not of employment: a
  departed employee with a live mailbox still passes, and that is accepted.
- Fewer than 50 people need access, which keeps this inside the free tier of the chosen provider.
- A hostname that can be pointed at a provider capable of edge enforcement is available, or can be
  obtained. Enforcement cannot be applied to a `github.io` address.
- The atlas is not intended to be publicly discoverable once activated; there is no anonymous
  demo mode to preserve.
- The gate protects against casual and opportunistic access, not against a signed-in Moove user
  choosing to redistribute what they see.
