# Restricting the atlas to Moove Media

**Status: configured, NOT active.** The live site is open to anyone today. Nothing in this
repository turns the restriction on — activation is the deliberate act described below.

Spec: [`specs/011-access-email-login/`](../specs/011-access-email-login/spec.md)

## What this does

Puts the atlas behind **Cloudflare Access** with its **one-time PIN** sign-in: a visitor enters
their email, receives a code, and is in. An `email_domain` policy admits only
`@moovemedia.com.sg`.

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
3. **An API token** scoped to *Access: Apps and Policies → Edit* on that zone, plus the account ID.
4. **A decision on subdomain addresses.** The policy currently admits `@moovemedia.com.sg` and
   *not* `@sg.moovemedia.com.sg` or similar. If those are real, add them before activating.

## Activate

```bash
# 1. set the hostname
$EDITOR infra/access-policy.json        # replace REPLACE_ME.example.com

# 2. see exactly what will happen — this sends nothing
python3 infra/apply_access.py

# 3. do it
export CLOUDFLARE_API_TOKEN=...         # never write these into a file in this repo
export CLOUDFLARE_ACCOUNT_ID=...
python3 infra/apply_access.py --apply
```

The script prints a service token's client ID and secret once, for headless checks. Put them in
the environment of whatever runs those checks. They must not be committed.

## Verify

Do all four. The first three are the spec's acceptance scenarios; the fourth is the one people
forget, and it is the one that decides whether this is a real control.

```bash
# a Moove address gets in — in a browser, expect a code by email
open https://atlas.moovemedia.com.sg

# an unauthenticated request for the page is redirected to sign-in, not served
curl -sI https://atlas.moovemedia.com.sg | head -1

# THE IMPORTANT ONE: a data file is not served either
curl -s https://atlas.moovemedia.com.sg/data/stops.json | head -c 200
# expect a sign-in page or an error — NOT JSON

# headless checks still work with the service token
curl -s https://atlas.moovemedia.com.sg/data/stops.json \
  -H "CF-Access-Client-Id: $CF_ACCESS_CLIENT_ID" \
  -H "CF-Access-Client-Secret: $CF_ACCESS_CLIENT_SECRET" | head -c 200
# expect JSON
```

Then record each story's result with its evidence in `docs/user-stories.md` under a dated heading,
per Principle V, and update the spec's Status. Tasks T020–T025 track this.

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
