# MITRE ATT&CK Quick Reference for Triage

The 14 Enterprise tactics in attack order, with the techniques a SOC analyst sees most often.

| # | Tactic | Attacker's goal | Common techniques | Where to look |
|---|---|---|---|---|
| 1 | Reconnaissance (TA0043) | Gather info on the target | Active scanning (T1595), phishing for info (T1598) | Firewall, IDS, web logs |
| 2 | Resource Development (TA0042) | Set up infrastructure | Acquire domains (T1583.001) | Threat intel, newly registered domains |
| 3 | Initial Access (TA0001) | Get in | Phishing (T1566), valid accounts (T1078), exploit public app (T1190) | Email gateway, VPN, sign-in logs |
| 4 | Execution (TA0002) | Run code | PowerShell (T1059.001), user execution (T1204) | EDR, Sysmon 1, 4688, PowerShell 4104 |
| 5 | Persistence (TA0003) | Stay in | Run keys (T1547.001), services (T1543.003), scheduled tasks (T1053.005) | 7045, 4698, Sysmon 13 |
| 6 | Privilege Escalation (TA0004) | Get higher rights | Valid accounts (T1078), group membership changes | 4672, 4728/4732/4756 |
| 7 | Defense Evasion (TA0005) | Avoid detection | Obfuscation (T1027), clear logs (T1070.001), disable tools (T1562) | 1102, EDR tamper alerts |
| 8 | Credential Access (TA0006) | Steal credentials | Brute force (T1110), LSASS dumping (T1003.001), Kerberoasting (T1558.003) | 4625, 4769, Sysmon 10 |
| 9 | Discovery (TA0007) | Learn the environment | Account discovery (T1087), network scanning (T1046) | `net`, `whoami`, `nltest` in command lines |
| 10 | Lateral Movement (TA0008) | Move to other hosts | RDP (T1021.001), SMB/admin shares (T1021.002), PsExec | 4624 type 3/10, 7045 on target |
| 11 | Collection (TA0009) | Gather data | Archive data (T1560), email collection (T1114) | Large archives, mailbox exports |
| 12 | Command and Control (TA0011) | Talk to attacker | Web protocols (T1071.001), ingress tool transfer (T1105) | Proxy, DNS, beaconing patterns |
| 13 | Exfiltration (TA0010) | Steal data out | Over C2 (T1041), to cloud storage (T1567.002) | Proxy volume, DLP |
| 14 | Impact (TA0040) | Damage | Ransomware (T1486), inhibit recovery (T1490) | Mass file changes, `vssadmin delete shadows` |

## How to use this during triage

1. Map the alert to a tactic: where is the attacker in the chain?
2. Ask what likely happened **before** (how did they get here?) and **next** (what will they try?).
3. Hunt one step in each direction. An Execution alert should lead you to check Initial Access (the email or download) and Persistence (what they left behind).

Full matrix: https://attack.mitre.org/matrices/enterprise/
