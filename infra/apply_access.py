#!/usr/bin/env python3
"""Apply infra/access-policy.json to Cloudflare Access.

Puts the atlas behind an email one-time-PIN gate restricted to @moovemedia.com.sg.
Spec: specs/011-access-email-login/

DRY RUN IS THE DEFAULT. Nothing reaches Cloudflare unless you pass --apply, so
running this by accident cannot lock anyone out.

    python3 infra/apply_access.py            # show the calls, change nothing
    python3 infra/apply_access.py --apply    # create the application + policies
    python3 infra/apply_access.py --verify   # check the gate actually holds

Credentials come from the environment, never from a file in this repository:

    CLOUDFLARE_API_TOKEN     Access: Apps and Policies -> Edit, plus Zone -> Read
    CLOUDFLARE_ACCOUNT_ID    optional; discovered from the token when unambiguous

Standard library only — the repo has no build step and no package manifest, and
this script is not a reason to introduce one.
"""

import argparse
import json
import os
import pathlib
import sys
import urllib.error
import urllib.request

API = "https://api.cloudflare.com/client/v4"
POLICY_FILE = pathlib.Path(__file__).parent / "access-policy.json"
PLACEHOLDER = "REPLACE_ME.example.com"


# ---------------------------------------------------------------- policy file

def load_policy():
    """Read the intended state, refusing a half-configured file."""
    try:
        cfg = json.loads(POLICY_FILE.read_text())
    except FileNotFoundError:
        sys.exit(f"error: {POLICY_FILE} not found")
    except json.JSONDecodeError as e:
        sys.exit(f"error: {POLICY_FILE} is not valid JSON — {e}")

    host = cfg.get("hostname", "")
    if not host or host == PLACEHOLDER:
        sys.exit(
            "error: hostname is still the placeholder.\n"
            "  Set it in infra/access-policy.json to the atlas hostname, e.g.\n"
            "  atlas.moovemedia.com.sg. It must be a zone on Cloudflare DNS —\n"
            "  Access cannot sit in front of a github.io address.\n"
            "  See docs/access-setup.md."
        )
    return cfg


def build_calls(cfg):
    """Render the API calls this configuration implies, in order.

    Returned rather than sent so a dry run can show exactly what would happen.
    """
    host, app = cfg["hostname"], cfg["application"]
    calls = [(
        "POST", "/accounts/{account}/access/apps",
        {
            "name": app["name"],
            "domain": host + app.get("path", ""),
            "type": app.get("type", "self_hosted"),
            "session_duration": app.get("session_duration", "24h"),
            "allowed_idps": app.get("allowed_idps", ["onetimepin"]),
            "auto_redirect_to_identity": app.get("auto_redirect_to_identity", True),
            "app_launcher_visible": app.get("app_launcher_visible", False),
        },
    )]

    for pol in cfg.get("policies", []):
        # an exceptions policy naming nobody would allow nothing and only add noise
        if pol.get("skip_if_empty") and not _has_members(pol):
            continue
        calls.append((
            "POST", "/accounts/{account}/access/apps/{app_id}/policies",
            {
                "name": pol["name"],
                "decision": pol.get("decision", "allow"),
                "include": [_strip_notes(i) for i in pol.get("include", [])],
            },
        ))

    for tok in cfg.get("service_tokens", []):
        calls.append(("POST", "/accounts/{account}/access/service_tokens",
                      {"name": tok["name"]}))

    return calls


def _has_members(policy):
    """True when an include rule actually names somebody."""
    for rule in policy.get("include", []):
        for value in rule.values():
            if isinstance(value, dict):
                if any(inner for inner in value.values()):
                    return True
            elif value:
                return True
    return False


def _strip_notes(rule):
    """Drop the _note keys this repo uses to keep the JSON self-explaining."""
    return {k: v for k, v in rule.items() if not k.startswith("_")}


# ------------------------------------------------------------------- transport

def api(method, path, token, body=None):
    req = urllib.request.Request(
        API + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        if e.code in (401, 403):
            sys.exit(f"error: {method} {path} -> HTTP {e.code}. The token is missing "
                     f"a scope or is wrong.\n  Needs: Access: Apps and Policies -> "
                     f"Edit, and Zone -> Read.\n{detail}")
        sys.exit(f"error: {method} {path} -> HTTP {e.code}\n{detail}")


def resolve_account(token):
    """Use CLOUDFLARE_ACCOUNT_ID if set, else discover it from the token."""
    if os.environ.get("CLOUDFLARE_ACCOUNT_ID"):
        return os.environ["CLOUDFLARE_ACCOUNT_ID"]

    accounts = api("GET", "/accounts", token)["result"]
    if len(accounts) == 1:
        print(f"account: {accounts[0]['name']} ({accounts[0]['id']})")
        return accounts[0]["id"]
    if not accounts:
        sys.exit("error: this token can see no accounts.")
    listing = "\n".join(f"  {a['id']}  {a['name']}" for a in accounts)
    sys.exit("error: the token can see several accounts — set CLOUDFLARE_ACCOUNT_ID "
             f"to the right one:\n{listing}")


def check_zone(token, hostname):
    """Confirm the hostname sits under a zone on this Cloudflare account.

    Catches the most common setup mistake — pointing Access at a hostname that
    was never delegated to Cloudflare — before anything is created.
    """
    labels = hostname.split(".")
    for i in range(len(labels) - 1):
        candidate = ".".join(labels[i:])
        found = api("GET", f"/zones?name={candidate}", token)["result"]
        if found:
            z = found[0]
            if z.get("status") != "active":
                print(f"warning: zone {candidate} is '{z.get('status')}', not active. "
                      "Access will not work until it is.")
            else:
                print(f"zone:    {candidate} (active)")
            return z
    sys.exit(f"error: no Cloudflare zone found for {hostname}.\n"
             "  The domain must be on Cloudflare DNS before Access can gate it.\n"
             "  See docs/access-setup.md.")


# ---------------------------------------------------------------- verification

def verify(hostname):
    """Prove the gate holds, unauthenticated. Exit non-zero if it does not.

    The data-file check is the one that matters: a gate that only covers the
    page leaves the atlas's actual content fetchable by URL.
    """
    checks, failures = [], 0
    for label, path, must_not_be_json in [
        ("page", "/", False),
        ("data file", "/data/stops.json", True),
    ]:
        url = f"https://{hostname}{path}"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "atlas-verify"})
            with urllib.request.urlopen(req) as r:
                body, code = r.read(400), r.getcode()
        except urllib.error.HTTPError as e:
            body, code = e.read(400), e.code
        except Exception as e:                                  # noqa: BLE001
            checks.append((label, f"could not reach {url} — {e}", False))
            failures += 1
            continue

        looks_like_json = body.lstrip()[:1] in (b"{", b"[")
        # Gated means: redirected or refused, or Cloudflare's own sign-in page came
        # back. Serving real content with HTTP 200 is the failure we are looking for.
        ok = code in (301, 302, 401, 403) or b"Cloudflare Access" in body
        detail = f"HTTP {code}"
        if must_not_be_json and looks_like_json:
            ok, detail = False, f"HTTP {code} — JSON served unauthenticated"
        checks.append((label, detail, ok))
        if not ok:
            failures += 1

    print(f"\nUnauthenticated checks against {hostname}:")
    for label, detail, ok in checks:
        print(f"  {'PASS' if ok else 'FAIL'}  {label:<10} {detail}")

    if failures:
        print("\nThe gate is NOT holding. Do not treat the atlas as restricted.")
        sys.exit(1)
    print("\nGate holds: neither the page nor the data files are served "
          "unauthenticated.")


# -------------------------------------------------------------------- entry

def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true",
                    help="actually send the calls (default: dry run, change nothing)")
    ap.add_argument("--verify", action="store_true",
                    help="check the gate holds; makes no changes and needs no token")
    args = ap.parse_args()

    cfg = load_policy()

    if args.verify:
        verify(cfg["hostname"])
        return

    calls = build_calls(cfg)

    if not args.apply:
        print(f"DRY RUN — nothing sent. {len(calls)} call(s) would be made "
              f"against {cfg['hostname']}:\n")
        for method, path, body in calls:
            print(f"  {method} {API}{path}")
            for line in json.dumps(body, indent=2).splitlines():
                print(f"    {line}")
            print()
        print("Re-run with --apply to send these. Read docs/access-setup.md first —\n"
              "activating this locks out everyone without a @moovemedia.com.sg address.")
        return

    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not token:
        sys.exit("error: set CLOUDFLARE_API_TOKEN in the environment.\n"
                 "  Never put it in a file in this repository.")

    account = resolve_account(token)
    check_zone(token, cfg["hostname"])       # fail before creating anything

    app_id = None
    for method, path, body in calls:
        path = path.replace("{account}", account).replace("{app_id}", app_id or "")
        result = api(method, path, token, body)["result"]
        if path.endswith("/access/apps"):
            app_id = result["id"]
            print(f"created application {app_id} for {cfg['hostname']}")
        elif "service_tokens" in path:
            print(f"created service token '{result['name']}'\n"
                  f"  CF_ACCESS_CLIENT_ID={result.get('client_id')}\n"
                  f"  CF_ACCESS_CLIENT_SECRET={result.get('client_secret')}\n"
                  "  ^ shown once. Put these in the environment of whatever runs the\n"
                  "    headless checks. Do not commit them.")
        else:
            print(f"created policy '{body['name']}'")

    verify(cfg["hostname"])
    print("\nRemaining, per specs/011-access-email-login/tasks.md:\n"
          "  T020 a @moovemedia.com.sg address signs in via emailed code\n"
          "  T021 a non-Moove address is refused\n"
          "  T023 a shared #r=... deep link survives sign-in\n"
          "  T024 record the results in docs/user-stories.md\n"
          "Rollback is in docs/access-setup.md.")


if __name__ == "__main__":
    main()
