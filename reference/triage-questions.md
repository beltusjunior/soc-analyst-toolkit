# The Triage Questions

A short checklist to run through on any alert before deciding to close or escalate.

## What
- What exactly triggered the alert (rule logic, raw event)?
- Is this activity expected for this user, host or application?

## Who
- Which user and host are involved? Are they privileged or business-critical?
- Is the account a human, a service account or a machine account?

## When
- When did it start? Is it still happening?
- Did it happen during the user's normal working hours?

## Where
- Where did it come from (internal or external IP, country, ASN)?
- Where did it go (destination hosts, domains, cloud apps)?

## How
- How did the activity get there (email, download, USB, remote login, exploit)?
- What process or parent process is responsible?

## Impact
- Did it succeed or was it blocked?
- Is there evidence of follow-on activity (persistence, lateral movement, data access)?
- How many other users or hosts show the same indicators?

## Decision

| Verdict | Meaning | Action |
|---|---|---|
| True Positive | Real malicious activity | Contain, document, escalate as needed |
| Benign True Positive | Rule worked, activity is authorised (e.g. pentest, admin task) | Document the reason, consider tuning |
| False Positive | Rule fired on harmless activity | Close and propose a precise tuning change |

Always write down **why** you made the decision, so the next analyst can follow your reasoning.
