# Vulnerability Report Template

One vulnerability per report. Write for a busy triager who has never seen the app: they should be able to reproduce the issue in a few minutes without asking you anything.

---

## Title

`<Vulnerability type> in <feature/endpoint> allows <attacker> to <impact>`

## Summary

Two or three sentences: what the bug is, where it is, and what an attacker gains.

## Severity

| Field | Value |
|---|---|
| Suggested severity | Critical / High / Medium / Low |
| CVSS 3.1 vector | `CVSS:3.1/AV:_/AC:_/PR:_/UI:_/S:_/C:_/I:_/A:_` |
| CVSS score | |
| Weakness (CWE) | CWE-___: ___ |

Use the [FIRST CVSS 3.1 calculator](https://www.first.org/cvss/calculator/3.1). Score the impact you **demonstrated**, not the worst case you imagine; triagers lower inflated scores, and it costs you credibility.

## Affected asset

- Host / app / version:
- Endpoint or feature:
- Account type needed: none / normal user / admin

## Steps to reproduce

1. Numbered, exact steps, starting from a fresh browser or account.
2. Include the full request when relevant (strip your session tokens before sending).
3. Say what you see at each step.

## Proof of concept

Screenshots, a short video, or a minimal script. Show only your own test data; redact anything belonging to anyone else.

## Impact

Who is affected, what an attacker can do, and what it would take in practice. Be concrete and honest about limitations (e.g. "requires the victim to open a crafted file").

## Suggested fix

The root-cause fix, in a sentence or two. Optional, but it speeds things up.

## References

Links to the CWE, OWASP page, or vendor documentation that explains the issue.

---

### Checklist before submitting

- [ ] Asset is in scope (`scripts/scope_check.py`) and the bug class isn't excluded by the policy
- [ ] Reproduced at least twice from a clean state
- [ ] Not a duplicate of the program's known issues or disclosed reports
- [ ] No other users' data in the report
- [ ] Session tokens, API keys and personal details redacted
- [ ] Title says what the impact is, not just the bug type
