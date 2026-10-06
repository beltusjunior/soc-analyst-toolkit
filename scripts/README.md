# Scripts

Python 3.9+. Install the one dependency with `pip install -r requirements.txt` from the repo root.

## ioc_extractor.py

Pulls IPs, domains, URLs, email addresses and MD5/SHA1/SHA256 hashes out of any text: `.eml` files, alert exports, threat reports, logs. It understands already-defanged input (`hxxp`, `[.]`) and skips private IPs and file names that look like domains.

```bash
python scripts/ioc_extractor.py samples/phishing_sample.eml --defang
python scripts/ioc_extractor.py report.txt --json > iocs.json
cat alert.log | python scripts/ioc_extractor.py -
```

## reputation_lookup.py

Checks IPs, domains and file hashes against VirusTotal and (for IPs) AbuseIPDB, then prints a simple verdict: MALICIOUS, SUSPICIOUS, NO DETECTIONS or UNKNOWN. Both services have free API keys.

```bash
export VT_API_KEY=your_key
export ABUSEIPDB_API_KEY=your_key
python scripts/reputation_lookup.py 185.220.101.4 example.com
python scripts/reputation_lookup.py -f iocs.txt
```

Never commit API keys to the repository. Lookups are spaced 15 seconds apart by default to stay inside the VirusTotal free tier.

## failed_logon_analyzer.py

Reads a CSV export of Windows Security events (4624 / 4625) and flags source IPs that look like brute force (one account, many failures) or password spraying (many accounts). It also warns when the same IP later logged on successfully, which is the most important signal of a compromised account.

```bash
python scripts/failed_logon_analyzer.py samples/security_events_sample.csv
python scripts/failed_logon_analyzer.py export.csv --threshold 20 --spray-users 5
```

The script's header includes a PowerShell one-liner for producing the CSV from a Windows host.

## Example output

```
[PASSWORD SPRAYING] 198.51.100.9: 12 failures against 6 account(s)
    window: 2026-10-01T11:00:00  ->  2026-10-01T11:00:00
    targets: alice, bob, carol, dave, erin, frank
    !!! SUCCESSFUL LOGON (4624) from same IP for: carol
    !!! Treat as possible account compromise - see playbooks/suspicious-login.md
```
