# Restricting the atlas to Moove Media

**Status: configured, NOT active.** The live site is open to anyone today. Nothing in this
repository turns the restriction on — activation is the deliberate act described below.

Spec: [`specs/011-access-email-login/`](../specs/011-access-email-login/spec.md)

## What this does

Puts the atlas behind **Cloudflare Access** with its **one-time PIN** sign-in: a visitor enters
their email, receives a code, and is in. An `email_domain` policy admits only
`@moovemedia.com.sg` — Moove's single mail domain, with no subdomain variants (confirmed
2026-08-27). The local part does not matter, so `v_msaifulma@moovemedia.com.sg` matches like
any other address.

The check happens at Cloudflare's edge, before the request reaches the origin. That matters more
than it sounds: the atlas is a static site whose value is in `data/*.json`, and those are plain
public URLs. A login screen inside `index.html` would leave them fetchable with `curl` — it would
look like a control without being one. Edge enforcement covers them.

`index.html` is not modified. There is no login UI, no session code, no build step and no backend,
which is why this is compatible with Principle II of the constitution rather than an amendment to
it. See the Constitution Check in [`plan.md`](../specs/011-access-email-login/plan.md).

## Prerequisites

1. **A custom domain.** This is the hard one. Access cannot be placed in front of
   `saifulanuarsg.github.io` — it needs a hostname on Cloudflare DNS, e.g.
   `atlas.moovemedia.com.sg`. Point that hostname at the current origin and confirm the atlas
   loads through it before going further. (This prerequisite exists on the Vercel path too.)
2. **A Cloudflare account** with the zone added. The free Zero Trust tier covers 50 users; beyond
   that it is roughly $7/user/month.
3. **An API token** scoped to *Access: Apps and Policies → Edit* **and** *Zone → Read*. The
   account ID is discovered from the token, so you only need to find it yourself if the token
   can see more than one account.

## Who owns this

The Cloudflare account is **saifulanuar.sg@gmail.com** — a personal Google account, not a Moove
one. That works, and it is what the setup assumes.

It is worth naming the consequence before this goes live rather than after: the gate controlling
access to a Moove tool would be administered from an account Moove does not own. If that account
is lost, locked, or its holder moves on, nobody at Moove can change the policy, admit a new
starter, or roll the gate back — and the tool stays locked with no way in.

Two ways to defuse it, neither urgent enough to block activation:

- Add a second Cloudflare account as a member of the Zero Trust organisation, ideally on a
  `@moovemedia.com.sg` address, so administration does not have one point of failure.
- Or transfer the zone to a Moove-owned Cloudflare account once the domain is settled.

Until one of those is done, treat the rollback step below as something only one person can
perform, and make sure somebody else knows that.

## Choosing the origin

Access sits in front of whatever serves the files, so the hostname is the only thing it cares
about. `infra/access-policy.json` names a hostname and never an origin — moving the origin later
does not touch this feature.

**GitHub Pages (today).** Point the hostname at Pages, confirm the atlas loads through it, then
activate. Nothing else to do.

**Vercel.** The atlas is already static with no build step, so a Vercel project needs no
configuration — import the repo, set the framework preset to "Other", leave the build command
empty and the output directory as the repository root. Add `vercel.json` only if you later want
explicit cache headers on `data/*.json`; it is not required to deploy.

One thing to get right if you put Cloudflare in front of Vercel: set the Cloudflare SSL mode to
**Full (strict)** and add the custom domain in Vercel *without* using Vercel's own nameservers —
the domain stays on Cloudflare DNS, proxied. Getting this wrong produces a redirect loop rather
than a clear error, which is why it is worth checking first. Verify the site loads over the
custom hostname *before* enabling Access, so that if something breaks you know which of the two
changes caused it.

Do not enable Vercel's own Deployment Protection alongside Access. It gates on Vercel team
membership, which is a different question from the one this policy asks, and stacking them means
two sign-ins for the same visit.

## Activate

```bash
$EDITOR infra/access-policy.json          # set the hostname

python3 infra/apply_access.py             # dry run — shows the calls, sends nothing

export CLOUDFLARE_API_TOKEN=...           # never write this into a file in this repo
python3 infra/apply_access.py --apply
```

`--apply` discovers the account, confirms the hostname is on a Cloudflare zone *before*
creating anything, creates the application and policy, issues a service token, and then runs the
unauthenticated checks below and exits non-zero if the gate is not holding.

The service token's ID and secret are printed once. Put them in the environment of whatever runs
the headless checks. They must not be committed.

## Verify

```bash
python3 infra/apply_access.py --verify     # no token needed; exits non-zero if the gate leaks
```

It requests the page and a data file with no credentials. The data-file check is the one that
decides whether this is a real control: a gate covering only the page leaves the atlas's actual
content fetchable, and the page would still *look* correctly locked in a browser.

The checker itself is sabotage-tested, because a verification that always passes is worse than
none — it certifies an open door:

```bash
python3 infra/test_verify.py               # exit 0 = the checker can be trusted
```

Then confirm by hand what a script cannot: that a `@moovemedia.com.sg` address receives a code and
gets in, that a non-Moove address is refused, and that a shared `#r=…` deep link survives sign-in.
Record each result with its evidence in `docs/user-stories.md` under a dated heading, per
Principle V, and update the spec's Status. Tasks T020–T025 track this.

## Roll back

In the Cloudflare dashboard: **Zero Trust → Access → Applications → Singapore Transit Atlas →
Delete**. The site is immediately open again. Nothing about the origin changed, so there is nothing
else to undo.

## Admit someone without a Moove address

Add them to the "Named exceptions" policy in `infra/access-policy.json` and re-apply. Keep it as
its own policy — admitting one contractor should never mean loosening the domain rule — and say
who and why in the commit message, so the guest list is reviewable in a diff.

## What this does not do

- It authenticates a **mailbox, not employment**. Someone who has left Moove but whose mailbox is
  still live will still get in. Access ends when IT closes the mailbox.
- It does not stop a signed-in colleague from screenshotting or forwarding what they see.
- It does not protect the repository. `sg-transit-atlas` is a public repo, so `data/*.json` remains
  readable on GitHub regardless. **If the data itself is meant to be private, the repository has to
  become private too** — this gate covers the deployed site, not the source.
