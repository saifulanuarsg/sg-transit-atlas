#!/usr/bin/env python3
"""Sabotage tests for apply_access.py --verify.

A verification that always passes is worse than none: it certifies an open door.
These feed known responses to verify() and assert it reaches the right verdict.

Case 3 is the one that matters — the page gated but data/*.json still served.
That is the failure mode the whole edge-enforcement design exists to prevent,
and the one a browser check would miss because the page looks correctly locked.

    python3 infra/test_verify.py     # exit 0 = the checker can be trusted

Standard library only; no network.
"""

import importlib.util, io, sys, urllib.request, urllib.error
spec = importlib.util.spec_from_file_location("aa", "infra/apply_access.py")
aa = importlib.util.module_from_spec(spec); spec.loader.exec_module(aa)

class Resp(io.BytesIO):
    def __init__(s, body, code): super().__init__(body); s._c = code
    def getcode(s): return s._c
    def __enter__(s): return s
    def __exit__(s, *a): return False

def run(case, page, data):
    def fake(req, *a, **k):
        url = req.full_url
        body, code = data if "/data/" in url else page
        if code >= 400: raise urllib.error.HTTPError(url, code, "", {}, io.BytesIO(body))
        return Resp(body, code)
    urllib.request.urlopen = fake
    try:
        aa.verify("example.test"); rc = 0
    except SystemExit as e: rc = e.code
    print(f"  -> {case}: exit={rc}  {'CORRECT' if rc == expect else 'WRONG'}\n")
    return rc == expect

results = []

print("CASE 1 — gate open: page 200 HTML, data 200 JSON (must FAIL)")
expect = 1
results.append(run("open door detected", (b"<html>atlas</html>", 200), (b'{"stops":[]}', 200)))

print("CASE 2 — gate holding: both redirect to sign-in (must PASS)")
expect = 0
results.append(run("gate holds", (b"", 302), (b"", 302)))

print("CASE 3 — page gated but DATA LEAKS 200 JSON (must FAIL)")
expect = 1
results.append(run("partial gate caught", (b"", 302), (b'{"stops":[]}', 200)))

print("CASE 4 — Cloudflare sign-in page served with 200 (must PASS)")
expect = 0
results.append(run("CF interstitial", (b"<html>Cloudflare Access</html>", 200),
                  (b"<html>Cloudflare Access</html>", 200)))

sys.exit(0 if all(results) else 1)
