# Pre-Engagement Scope Checklist

Fill this in for every program **before** sending any traffic. Keep a copy with your notes; if a dispute ever comes up, it shows you checked.

## Program

| Field | Value |
|---|---|
| Program name | |
| Platform / URL of policy | |
| Date policy last read | |
| Program type | Paid bounty / VDP (no payout) / private invite |
| Safe harbour statement present? | Yes / No |

## Scope

- [ ] Copied the **in-scope** assets exactly as written into `scope.txt`
- [ ] Copied every **out-of-scope** asset into `scope.txt` with a leading `!`
- [ ] Checked whether wildcards (`*.example.com`) include the apex domain (`example.com`). If the policy doesn't say, treat the apex as out of scope unless listed separately
- [ ] Noted any assets limited by path, port, feature or environment (e.g. "only `/api/v2/`", "staging only"): `scope_check.py` cannot check these
- [ ] Noted third-party services that are out of scope even on in-scope domains (payment providers, SSO, CDNs, help desks, hosted marketing pages)
- [ ] Mobile apps / desktop binaries in scope? Which versions?

## Rules of engagement

- [ ] Allowed request rate: ________ (default to slow if unstated)
- [ ] Automated scanners allowed? Yes / No / Limited
- [ ] Required header or user-agent for identification: ________
- [ ] Test accounts: create your own / provided / not allowed
- [ ] Banned techniques listed (DoS, social engineering, physical, etc.)
- [ ] Bug classes the program says it won't accept
- [ ] Disclosure policy: none / coordinated / after fix + N days

## My setup

- [ ] Test accounts created with my own email aliases (e.g. `me+programname@...`)
- [ ] Proxy (Burp Suite / ZAP) scoped to the in-scope hosts only
- [ ] Notes file started: date, time and target of each test session
- [ ] I know how to contact the program if something breaks

## Stop conditions

Stop immediately and contact the program if you:

- Access data that belongs to another real user
- Cause errors, slowdowns or outages
- Find credentials, secrets or personal data. Don't use them, don't keep copies beyond the evidence needed
- Realise a target was out of scope after all
