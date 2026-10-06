# Playbook: Phishing Email

**ATT&CK:** T1566 Phishing (T1566.001 Attachment, T1566.002 Link)
**Typical sources:** user report, email gateway alert, Defender for Office 365, Proofpoint, Mimecast
**Default severity:** Medium (raise to High if a user clicked, entered credentials or ran an attachment)

## 1. Initial triage (first 10 minutes)

- [ ] Get the original email as an attachment (`.eml` / `.msg`), not a forward
- [ ] Record: sender address, display name, reply-to, subject, received time, recipients
- [ ] Identify how many users received the same message (search by sender, subject or URL)
- [ ] Ask: did anyone click the link, open the attachment, or reply?

## 2. Analyse the headers

- [ ] Check SPF, DKIM and DMARC results in `Authentication-Results`
- [ ] Compare `From`, `Return-Path` and `Reply-To` for mismatches
- [ ] Trace the `Received` chain to the originating IP
- [ ] Look for look-alike domains (e.g. `rnicrosoft.com`, `micros0ft-support.com`)

## 3. Analyse links and attachments

- [ ] Extract IOCs: `python scripts/ioc_extractor.py email.eml --defang`
- [ ] Check URL and domain reputation (VirusTotal, URLscan.io) — never open links on your workstation
- [ ] Hash attachments (SHA256) and check reputation: `python scripts/reputation_lookup.py <hash>`
- [ ] Detonate unknown attachments only in an approved sandbox
- [ ] Note domain age; newly registered domains are a strong phishing signal

## 4. Scope and impact

- [ ] Proxy / DNS logs: did any host resolve or connect to the malicious domain?
- [ ] Identity logs: any sign-ins for affected users after the email arrived (new IPs, new countries, MFA prompts)?
- [ ] EDR: any process launched from the attachment (e.g. `WINWORD.EXE` spawning `powershell.exe`)?

## 5. Containment

| Situation | Action |
|---|---|
| Email received, no interaction | Purge from all mailboxes, block sender / domain / URL |
| Link clicked, no credentials entered | Purge, block, check host with EDR |
| Credentials entered | Reset password, revoke sessions and tokens, check MFA methods and inbox rules, escalate |
| Attachment executed | Isolate host, escalate to Tier 2 / IR, follow the malware playbook |

## 6. Close out

- [ ] Document using `templates/incident-report.md`
- [ ] Add IOCs to blocklists / threat intel platform
- [ ] Notify reporting user and thank them
- [ ] Classify: True Positive / False Positive / Benign True Positive (e.g. phishing simulation)
