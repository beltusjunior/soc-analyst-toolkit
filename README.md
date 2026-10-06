# SOC Analyst Toolkit

A practical toolkit for Security Operations Center (SOC) work: alert triage playbooks, Sigma detection rules, Python triage scripts, incident documentation templates and quick-reference cheat sheets.

Everything here is built around the day-to-day workflow of a Tier 1 / Tier 2 SOC analyst: **detect → triage → investigate → document → escalate or close**.

## Repository layout

| Folder | What's inside |
|---|---|
| [`playbooks/`](playbooks) | Step-by-step triage playbooks for common alert types, mapped to MITRE ATT&CK |
| [`detections/sigma/`](detections/sigma) | Vendor-neutral Sigma rules that can be converted to Splunk, Microsoft Sentinel, Elastic and more |
| [`detections/queries/`](detections/queries) | Ready-to-use hunting queries in SPL (Splunk) and KQL (Sentinel / Defender) |
| [`scripts/`](scripts) | Python triage tools: IOC extraction, reputation lookups, Windows log analysis |
| [`templates/`](templates) | Incident report, escalation and shift handoff templates |
| [`reference/`](reference) | Cheat sheets: Windows Event IDs, MITRE ATT&CK tactics, triage questions |

## Playbooks

| Playbook | ATT&CK |
|---|---|
| [Phishing email](playbooks/phishing.md) | T1566 |
| [Malware / EDR alert](playbooks/malware-alert.md) | T1204, T1059 |
| [Suspicious login](playbooks/suspicious-login.md) | T1078 |
| [Brute force / password spraying](playbooks/brute-force.md) | T1110 |

## Scripts quick start

```bash
git clone https://github.com/beltusjunior/soc-analyst-toolkit.git
cd soc-analyst-toolkit
pip install -r requirements.txt

# Pull IOCs (IPs, domains, URLs, hashes, emails) out of an email, report or log
python scripts/ioc_extractor.py suspicious_email.eml --defang

# Check reputation of an IP, domain or file hash (needs free API keys)
export VT_API_KEY=your_virustotal_key
export ABUSEIPDB_API_KEY=your_abuseipdb_key
python scripts/reputation_lookup.py 185.220.101.4

# Summarise failed logons from a Windows Security log export (CSV)
python scripts/failed_logon_analyzer.py security_export.csv --threshold 10
```

See [`scripts/README.md`](scripts/README.md) for full usage.

## Skills demonstrated

- Alert triage and incident response process (NIST SP 800-61)
- Detection engineering with Sigma, SPL and KQL
- MITRE ATT&CK mapping
- Windows event log analysis
- Threat intelligence enrichment (VirusTotal, AbuseIPDB)
- Python automation for repetitive analyst tasks
- Clear incident documentation and escalation writing

## Disclaimer

This repository is for defensive security, education and SOC operations. Test detections in a lab or non-production environment before deploying, and tune thresholds to your environment.

## License

[MIT](LICENSE)
