# Playbook: Brute Force / Password Spraying

**ATT&CK:** T1110 Brute Force (T1110.001 Password Guessing, T1110.003 Password Spraying)
**Typical sources:** Windows 4625 / 4771, Entra ID sign-in logs, VPN, SSH (`/var/log/auth.log`)
**Detection:** `detections/sigma/win_brute_force_failed_logons.yml`

## Know the difference

| Pattern | Looks like |
|---|---|
| Brute force | Many passwords against **one** account |
| Password spraying | One or a few passwords against **many** accounts, slowly to avoid lockout |
| Credential stuffing | Leaked username/password pairs from other breaches |

## 1. Initial triage

- [ ] Record: source IP(s), target account(s), number of failures, time window, protocol/service
- [ ] Run: `python scripts/failed_logon_analyzer.py export.csv --threshold 10`
- [ ] Check failure reason codes (Event 4625 `Status` / `SubStatus`):
  - `0xC000006A` wrong password (account exists)
  - `0xC0000064` user does not exist (enumeration)
  - `0xC0000234` account locked out

## 2. Critical question: did any attempt succeed?

- [ ] Look for a **4624 success from the same source IP** after the failures
- [ ] If yes, treat as a compromised account: follow `playbooks/suspicious-login.md`

## 3. Investigate the source

- [ ] Internal or external IP? Internal sources may be a misconfigured service or an infected host
- [ ] Reputation and geolocation: `python scripts/reputation_lookup.py <ip>`
- [ ] Common false positive: a service account or mapped drive with an old saved password

## 4. Containment

- [ ] Block the source IP at the firewall / conditional access
- [ ] Reset passwords for any account with a successful login
- [ ] Make sure targeted accounts have MFA
- [ ] For an internal source, investigate the host with EDR

## 5. Close out

- [ ] Document using `templates/incident-report.md`
- [ ] Recommend tuning: account lockout policy, MFA coverage, exposing fewer services to the internet
