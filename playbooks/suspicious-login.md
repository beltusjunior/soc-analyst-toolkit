# Playbook: Suspicious Login

**ATT&CK:** T1078 Valid Accounts
**Typical sources:** Microsoft Entra ID (Azure AD) Identity Protection, Okta, VPN logs, Windows 4624
**Common alerts:** impossible travel, sign-in from unfamiliar location, anonymous IP / Tor, MFA fatigue

## 1. Initial triage

- [ ] Record: user, source IP, country/ASN, timestamp, application, device, result (success / failure)
- [ ] Was the login successful? Was MFA satisfied, and how?
- [ ] Is the user privileged (admin, finance, executive)?

## 2. Investigate

- [ ] IP reputation: `python scripts/reputation_lookup.py <ip>` (VPN, hosting provider, Tor exit?)
- [ ] Compare with the user's normal pattern: usual countries, devices, working hours
- [ ] Impossible travel: could the user physically be in both locations? Rule out corporate VPN egress first
- [ ] Many MFA push requests in a short time = possible MFA fatigue attack
- [ ] Post-login activity:
  - New inbox forwarding or deletion rules
  - New MFA method registered
  - Mass file downloads or sharing
  - Password change or OAuth app consent

## 3. Contact the user (out of band)

Call or message through a verified channel, not by replying to email. Ask:
- Were you travelling or using a VPN?
- Did you approve an MFA prompt you did not start?

## 4. Containment

| Finding | Action |
|---|---|
| User confirms it was them | Close as Benign True Positive, note the reason |
| Unconfirmed / user denies | Reset password, revoke all sessions and refresh tokens, review MFA methods |
| Malicious post-login activity | Above, plus remove malicious rules/apps, escalate to IR |

## 5. Close out

- [ ] Document using `templates/incident-report.md`
- [ ] Block malicious IPs and consider conditional access tuning
