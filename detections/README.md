# Detections

## Sigma rules (`sigma/`)

[Sigma](https://github.com/SigmaHQ/sigma) is a vendor-neutral format for detection rules. Write a rule once and convert it to your SIEM's query language with [pySigma / sigma-cli](https://github.com/SigmaHQ/sigma-cli):

```bash
pip install sigma-cli
sigma plugin install splunk
sigma convert -t splunk -p sysmon detections/sigma/proc_office_spawns_shell.yml
```

| Rule | Detects | ATT&CK |
|---|---|---|
| `win_brute_force_failed_logons.yml` | Many failed logons from one source | T1110 |
| `proc_encoded_powershell.yml` | PowerShell launched with an encoded command | T1059.001 |
| `proc_office_spawns_shell.yml` | Word/Excel/Outlook launching a shell or script host | T1204.002, T1566.001 |
| `win_new_service_installed.yml` | Service created from a user-writable path | T1543.003 |
| `win_security_log_cleared.yml` | Security event log cleared | T1070.001 |
| `proc_certutil_download.yml` | certutil used to download a file | T1105 |

## Hunting queries (`queries/`)

Ready-to-run versions of key detections in SPL (Splunk) and KQL (Microsoft Sentinel / Defender XDR). Field names assume common defaults; adjust index names and fields to your environment.

## Before deploying

1. Run each rule against 7 to 30 days of historical data.
2. Note the false positives and add specific filters (by path, signer or account), not broad ones.
3. Record tuning decisions in the rule's `falsepositives` section.
