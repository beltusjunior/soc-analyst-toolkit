#!/usr/bin/env python3
"""
failed_logon_analyzer.py - Spot brute force and password spraying in Windows Security logs.

Input: a CSV export of Windows Security events. Works with exports from Event Viewer,
PowerShell, or a SIEM, as long as the CSV has columns for:
    EventID, TimeCreated, TargetUserName, IpAddress    (Status/SubStatus optional)
Column names are matched case-insensitively and a few common aliases are accepted.

Export example (PowerShell, run as admin):
    Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624,4625} -MaxEvents 50000 |
      ForEach-Object { $x=[xml]$_.ToXml(); [pscustomobject]@{
        EventID=$_.Id; TimeCreated=$_.TimeCreated.ToString('o');
        TargetUserName=($x.Event.EventData.Data | ? Name -eq 'TargetUserName').'#text';
        IpAddress=($x.Event.EventData.Data | ? Name -eq 'IpAddress').'#text';
        Status=($x.Event.EventData.Data | ? Name -eq 'Status').'#text';
        SubStatus=($x.Event.EventData.Data | ? Name -eq 'SubStatus').'#text' } } |
      Export-Csv security_export.csv -NoTypeInformation

Usage:
    python failed_logon_analyzer.py security_export.csv
    python failed_logon_analyzer.py security_export.csv --threshold 20 --spray-users 5
"""
import argparse
import csv
import sys
from collections import Counter, defaultdict

ALIASES = {
    "eventid": ["eventid", "event_id", "id", "eventcode"],
    "time": ["timecreated", "time", "timestamp", "_time", "date"],
    "user": ["targetusername", "user", "username", "account_name", "accountname"],
    "ip": ["ipaddress", "ip", "src_ip", "source_network_address", "sourceip"],
    "status": ["substatus", "sub_status", "status", "failure_reason"],
}

STATUS_CODES = {
    "0xc000006a": "wrong password",
    "0xc0000064": "user does not exist",
    "0xc0000234": "account locked out",
    "0xc0000072": "account disabled",
    "0xc000006f": "outside logon hours",
    "0xc0000070": "workstation restriction",
    "0xc0000071": "password expired",
    "0xc0000193": "account expired",
    "0xc0000224": "password must change",
}

IGNORED_IPS = {"", "-", "::1", "127.0.0.1"}


def map_columns(fieldnames):
    lower = {name.lower().strip(): name for name in fieldnames}
    mapping = {}
    for key, options in ALIASES.items():
        for option in options:
            if option in lower:
                mapping[key] = lower[option]
                break
    missing = [k for k in ("eventid", "user", "ip") if k not in mapping]
    if missing:
        sys.exit(f"CSV is missing required column(s): {', '.join(missing)}. Found: {', '.join(fieldnames)}")
    return mapping


def analyze(path, threshold, spray_users):
    fails_by_ip = Counter()
    users_by_ip = defaultdict(set)
    fails_by_user = Counter()
    reasons = Counter()
    success_ips = defaultdict(set)
    first_seen, last_seen = {}, {}

    with open(path, newline="", encoding="utf-8-sig", errors="ignore") as handle:
        reader = csv.DictReader(handle)
        cols = map_columns(reader.fieldnames or [])
        for row in reader:
            event = str(row.get(cols["eventid"], "")).strip()
            user = (row.get(cols["user"]) or "").strip().lower()
            ip = (row.get(cols["ip"]) or "").strip()
            when = (row.get(cols.get("time", ""), "") or "").strip() if "time" in cols else ""
            if ip in IGNORED_IPS or user.endswith("$"):
                continue  # skip local/blank sources and machine accounts
            if event == "4625":
                fails_by_ip[ip] += 1
                users_by_ip[ip].add(user)
                fails_by_user[user] += 1
                if "status" in cols:
                    code = (row.get(cols["status"]) or "").strip().lower()
                    reasons[STATUS_CODES.get(code, code or "unknown")] += 1
                if when:
                    first_seen.setdefault(ip, when)
                    last_seen[ip] = when
            elif event == "4624":
                success_ips[ip].add(user)

    print("=" * 70)
    print("FAILED LOGON ANALYSIS")
    print("=" * 70)
    print(f"Total failed logons: {sum(fails_by_ip.values())}  |  Source IPs: {len(fails_by_ip)}  |  Accounts: {len(fails_by_user)}\n")

    flagged = [(ip, n) for ip, n in fails_by_ip.most_common() if n >= threshold]
    if not flagged:
        print(f"No source IP reached the threshold of {threshold} failures.")
    for ip, count in flagged:
        targets = users_by_ip[ip]
        pattern = "PASSWORD SPRAYING" if len(targets) >= spray_users else "BRUTE FORCE"
        compromised = targets & success_ips.get(ip, set())
        print(f"[{pattern}] {ip}: {count} failures against {len(targets)} account(s)")
        if ip in first_seen:
            print(f"    window: {first_seen[ip]}  ->  {last_seen[ip]}")
        print(f"    targets: {', '.join(sorted(targets)[:10])}{' ...' if len(targets) > 10 else ''}")
        if compromised:
            print(f"    !!! SUCCESSFUL LOGON (4624) from same IP for: {', '.join(sorted(compromised))}")
            print("    !!! Treat as possible account compromise - see playbooks/suspicious-login.md")
        print()

    if reasons:
        print("Failure reasons:")
        for reason, n in reasons.most_common():
            print(f"    {reason:<25} {n}")
        print()

    print("Most targeted accounts:")
    for user, n in fails_by_user.most_common(10):
        print(f"    {user:<30} {n}")


def main():
    parser = argparse.ArgumentParser(description="Detect brute force / password spraying in a Windows Security CSV export.")
    parser.add_argument("csv_file")
    parser.add_argument("--threshold", type=int, default=10, help="Failures from one IP before it is flagged (default 10)")
    parser.add_argument("--spray-users", type=int, default=5, help="Distinct accounts from one IP that indicate spraying (default 5)")
    args = parser.parse_args()
    analyze(args.csv_file, args.threshold, args.spray_users)


if __name__ == "__main__":
    main()
