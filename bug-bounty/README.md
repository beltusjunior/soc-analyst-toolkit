# Bug Bounty

Resources for finding and reporting security vulnerabilities through **authorised** bug bounty and vulnerability disclosure programs (VDPs).

> **Only test what a program explicitly puts in scope, and follow its rules.** Testing systems without written permission is illegal in most countries, whatever your intent. Official programs give you safe harbour; nothing else does.

| File | Use it for |
|---|---|
| [`scope-checklist.md`](scope-checklist.md) | Filling in **before** you send a single request to a new program |
| [`report-template.md`](report-template.md) | Writing a report that is easy to triage and reproduce |
| [`example-report.md`](example-report.md) | A complete worked report for a real bug found in this repo |
| [`learning-path.md`](learning-path.md) | Free labs and practice targets, in a sensible order |
| [`../scripts/scope_check.py`](../scripts/scope_check.py) | Checking hosts, URLs and IPs against a program's scope before testing |

## Workflow

```
choose program → read policy → fill scope checklist → recon (in scope only)
    → map the app → test → confirm impact (minimally) → report → follow up
```

1. **Choose a program.** Start with broad-scope programs or VDPs (no payout, but less competition and real experience). Platforms: HackerOne, Bugcrowd, Intigriti, YesWeHack. Many companies also run their own.
2. **Read the whole policy.** Scope, exclusions, banned techniques, rate limits, test-account rules, disclosure terms. Policies change; re-read before each session.
3. **Fill in [`scope-checklist.md`](scope-checklist.md)** and save the program's scope list to a file for `scope_check.py`.
4. **Test**, using the program's rules and the free labs in [`learning-path.md`](learning-path.md) to build skill first. Run every discovered host through `scope_check.py` before touching it.
5. **Prove impact with the least access possible.** Stop as soon as the bug is demonstrated. Never read, change or keep real users' data beyond what proves the issue; use your own test accounts.
6. **Report** with [`report-template.md`](report-template.md). One vulnerability per report.
7. **Follow up politely**, answer triage questions quickly, and never disclose publicly until the program allows it.

## Checking scope

```bash
# scope.txt: one entry per line, "!" marks an exclusion (exclusions always win)
#   *.example.com
#   api.example.org
#   203.0.113.0/24
#   !admin.example.com

./scripts/scope_check.py scope.txt shop.example.com https://admin.example.com/login
./scripts/scope_check.py scope.txt -f discovered_hosts.txt --only-in > targets.txt
```

The exit code is non-zero if anything is out of scope, so it can guard other scripts. It checks hosts and IPs only; if the program limits scope by path, port or feature, check that by hand.

## Things that are almost always forbidden

Even when a target is in scope, programs typically ban:

- Denial-of-service, load testing, or anything that degrades the service for others
- Social engineering, phishing or physical attacks against staff
- Accessing, modifying or deleting other users' data beyond the minimum proof
- Automated scanning above the published rate limit
- Spam, or testing that sends messages to real customers
- Public disclosure before the program agrees

If something isn't clearly allowed, ask the program first.

## Commonly rejected findings

These are usually "informative" or "not applicable" unless you can show real impact:

- Missing security headers or cookie flags with no exploit
- Clickjacking on pages with no sensitive action
- Self-XSS, logout CSRF, CSRF on forms with no state change
- Username / email enumeration on login or sign-up pages
- Software version disclosure, banner grabbing
- Scanner output pasted without a confirmed, reproducible exploit
- Reports that only say "best practice"
