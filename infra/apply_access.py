#!/usr/bin/env python3
"""Apply infra/access-policy.json to Cloudflare Access.

Puts the atlas behind an email one-time-PIN gate restricted to @moovemedia.com.sg.
Spec: specs/011-access-email-login/

DRY RUN IS THE DEFAULT. Nothing reaches Cloudflare unless you pass --apply. Running
this by accident cannot lock anyone out.

    python3 infra/apply_access.py              # print the calls, change nothing
    python3 infra/apply_access.py --apply      # actually create the application + policies

Credentials come from the environment, never from a file in this repository:

    CLOUDFLARE_API_TOKEN     scoped to Access: Apps and Policies -> Edit on the zone
    CLOUDFLARE_ACCOUNT_ID    the account the zone belongs to

Standard library only — the repo has no build step and no package manifest, and this
script is not a reason to introduce one.
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


def load_policy():
    """Read the intended state, and refuse to proceed on a half-configured file."""
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
        "POST", "/access/apps",
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
        # an exceptions policy with nobody in it would allow nothing and only add noise
        if pol.get("skip_if_empty") and not _has_members(pol):
            continue
        calls.append((
            "POST", "/access/apps/{app_id}/policies",
            {
                "name": pol["name"],
                "decision": pol.get("decision", "allow"),
                "include": [_strip_notes(i) for i in pol.get("include", [])],
            },
        ))

    for tok in cfg.get("service_tokens", []):
        calls.append(("POST", "/access/service_tokens", {"name": tok["name"]}))

    return calls


def _has_members(policy):
    """True when an include rule actually names somebody."""
    for rule in policy.get("include", []):
        for value in rule.values():
            if isinstance(value, dict):
                for inner in value.values():
                    if inner:
                        return True
            elif value:
                return True
    return False


def _strip_notes(rule):
    """Drop the _note keys this repo uses to keep the JSON self-explaining."""
    return {k: v for k, v in rule.items() if not k.startswith("_")}


def request(method, path, body, token, account):
    url = f"{API}/accounts/{account}{path}"
    req = urllib.request.Request(
        url, method=method, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {token}",
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"error: {method} {path} -> HTTP {e.code}\n{e.read().decode()}")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--apply", action="store_true",
                    help="actually send the calls (default: dry run, change nothing)")
    args = ap.parse_args()

    cfg = load_policy()
    calls = build_calls(cfg)

    if not args.apply:
        print(f"DRY RUN — nothing sent. {len(calls)} call(s) would be made "
              f"against {cfg['hostname']}:\n")
        for method, path, body in calls:
            print(f"  {method} {API}/accounts/$CLOUDFLARE_ACCOUNT_ID{path}")
            for line in json.dumps(body, indent=2).splitlines():
                print(f"    {line}")
            print()
        print("Re-run with --apply to send these. See docs/access-setup.md first —\n"
              "activating this locks out everyone without a @moovemedia.com.sg address.")
        return

    token = os.environ.get("CLOUDFLARE_API_TOKEN")
    account = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    if not token or not account:
        sys.exit("error: set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in the "
                 "environment.\n  Never put them in a file in this repository.")

    app_id = None
    for method, path, body in calls:
        path = path.replace("{app_id}", app_id or "")
        result = request(method, path, body, token, account)["result"]
        if path == "/access/apps":
            app_id = result["id"]
            print(f"created application {app_id} for {cfg['hostname']}")
        elif "service_tokens" in path:
            print(f"created service token '{result['name']}'\n"
                  f"  client id:     {result.get('client_id')}\n"
                  f"  client secret: {result.get('client_secret')}\n"
                  "  ^ shown once. Put these in the environment of whatever runs the\n"
                  "    headless checks. Do not commit them.")
        else:
            print(f"created policy '{body['name']}'")

    print("\nDone. Now verify, per specs/011-access-email-login/tasks.md T020-T023:\n"
          "  - a @moovemedia.com.sg address signs in via emailed code\n"
          "  - a non-Moove address is refused\n"
          "  - curl of a data file, unauthenticated, returns no data\n"
          "Rollback is in docs/access-setup.md.")


if __name__ == "__main__":
    main()
