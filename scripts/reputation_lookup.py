#!/usr/bin/env python3
"""
reputation_lookup.py - Check the reputation of an IP address, domain or file hash.

Sources (free API keys):
  - VirusTotal  (IPs, domains, hashes)  -> set VT_API_KEY
  - AbuseIPDB   (IPs)                   -> set ABUSEIPDB_API_KEY

Usage:
    export VT_API_KEY=...
    export ABUSEIPDB_API_KEY=...
    python reputation_lookup.py 185.220.101.4
    python reputation_lookup.py example.com
    python reputation_lookup.py 44d88612fea8a8f36de82e1278abb02f
    python reputation_lookup.py -f iocs.txt          # one indicator per line

Free API tiers are rate limited (VirusTotal: 4 requests/minute), so the script
waits between lookups when checking a list.
"""
import argparse
import ipaddress
import os
import re
import sys
import time

try:
    import requests
except ImportError:
    sys.exit("Missing dependency: pip install requests")

VT_URL = "https://www.virustotal.com/api/v3"
ABUSE_URL = "https://api.abuseipdb.com/api/v2/check"
TIMEOUT = 20


def classify(indicator):
    indicator = indicator.strip().replace("[.]", ".").replace("(.)", ".")
    try:
        ipaddress.ip_address(indicator)
        return "ip", indicator
    except ValueError:
        pass
    if re.fullmatch(r"[A-Fa-f0-9]{32}|[A-Fa-f0-9]{40}|[A-Fa-f0-9]{64}", indicator):
        return "hash", indicator.lower()
    if re.fullmatch(r"(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}", indicator):
        return "domain", indicator.lower()
    return None, indicator


def virustotal(kind, value, api_key):
    path = {"ip": "ip_addresses", "domain": "domains", "hash": "files"}[kind]
    resp = requests.get(f"{VT_URL}/{path}/{value}", headers={"x-apikey": api_key}, timeout=TIMEOUT)
    if resp.status_code == 404:
        return {"found": False}
    resp.raise_for_status()
    attrs = resp.json()["data"]["attributes"]
    stats = attrs.get("last_analysis_stats", {})
    result = {
        "found": True,
        "malicious": stats.get("malicious", 0),
        "suspicious": stats.get("suspicious", 0),
        "harmless": stats.get("harmless", 0),
        "undetected": stats.get("undetected", 0),
        "reputation": attrs.get("reputation"),
    }
    if kind == "ip":
        result["country"] = attrs.get("country")
        result["as_owner"] = attrs.get("as_owner")
    elif kind == "domain":
        created = attrs.get("creation_date")
        result["created"] = time.strftime("%Y-%m-%d", time.gmtime(created)) if created else None
        result["registrar"] = attrs.get("registrar")
    else:
        result["name"] = attrs.get("meaningful_name")
        result["type"] = attrs.get("type_description")
        result["threat_label"] = (attrs.get("popular_threat_classification") or {}).get("suggested_threat_label")
    return result


def abuseipdb(ip, api_key):
    resp = requests.get(
        ABUSE_URL,
        headers={"Key": api_key, "Accept": "application/json"},
        params={"ipAddress": ip, "maxAgeInDays": 90},
        timeout=TIMEOUT,
    )
    resp.raise_for_status()
    data = resp.json()["data"]
    return {
        "abuse_confidence": data.get("abuseConfidenceScore"),
        "total_reports": data.get("totalReports"),
        "isp": data.get("isp"),
        "usage_type": data.get("usageType"),
        "is_tor": data.get("isTor"),
        "country": data.get("countryCode"),
    }


def verdict(vt, abuse):
    malicious = (vt or {}).get("malicious", 0) or 0
    confidence = (abuse or {}).get("abuse_confidence", 0) or 0
    if malicious >= 5 or confidence >= 75:
        return "MALICIOUS"
    if malicious >= 1 or confidence >= 25:
        return "SUSPICIOUS"
    if vt and not vt.get("found", True):
        return "UNKNOWN (not in VirusTotal)"
    return "NO DETECTIONS"


def lookup(indicator, vt_key, abuse_key):
    kind, value = classify(indicator)
    print("=" * 60)
    if kind is None:
        print(f"{indicator}: not recognised as an IP, domain or hash")
        return
    print(f"{value}  ({kind})")
    vt = abuse = None
    if vt_key:
        try:
            vt = virustotal(kind, value, vt_key)
            for k, v in vt.items():
                print(f"  VT {k:<14} {v}")
        except requests.RequestException as err:
            print(f"  VirusTotal error: {err}")
    if abuse_key and kind == "ip":
        try:
            abuse = abuseipdb(value, abuse_key)
            for k, v in abuse.items():
                print(f"  AbuseIPDB {k:<17} {v}")
        except requests.RequestException as err:
            print(f"  AbuseIPDB error: {err}")
    print(f"  VERDICT: {verdict(vt, abuse)}")


def main():
    parser = argparse.ArgumentParser(description="Reputation lookup for IPs, domains and hashes.")
    parser.add_argument("indicators", nargs="*", help="One or more IPs, domains or hashes")
    parser.add_argument("-f", "--file", help="File with one indicator per line")
    parser.add_argument("--delay", type=float, default=15.0, help="Seconds between lookups (default 15, fits VT free tier)")
    args = parser.parse_args()

    vt_key = os.environ.get("VT_API_KEY")
    abuse_key = os.environ.get("ABUSEIPDB_API_KEY")
    if not vt_key and not abuse_key:
        sys.exit("Set VT_API_KEY and/or ABUSEIPDB_API_KEY environment variables first.")

    indicators = list(args.indicators)
    if args.file:
        with open(args.file, encoding="utf-8") as handle:
            indicators += [line.strip() for line in handle if line.strip() and not line.startswith("#")]
    if not indicators:
        parser.error("give at least one indicator or --file")

    for i, indicator in enumerate(indicators):
        if i:
            time.sleep(args.delay)
        lookup(indicator, vt_key, abuse_key)


if __name__ == "__main__":
    main()
