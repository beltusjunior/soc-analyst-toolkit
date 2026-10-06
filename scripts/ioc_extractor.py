#!/usr/bin/env python3
"""
ioc_extractor.py - Extract indicators of compromise (IOCs) from text, emails, logs or reports.

Finds IPv4 addresses, domains, URLs, email addresses and MD5/SHA1/SHA256 hashes.
Handles already-defanged input (hxxp://, [.], (.)) and can defang output for safe sharing.

Usage:
    python ioc_extractor.py suspicious_email.eml
    python ioc_extractor.py report.txt --defang --json
    cat alert.log | python ioc_extractor.py -
"""
import argparse
import ipaddress
import json
import re
import sys

# Common file extensions that look like TLDs in regex matches (reduce false positives)
FILE_EXTENSIONS = {
    "exe", "dll", "txt", "log", "doc", "docx", "xls", "xlsx", "pdf", "zip", "png",
    "jpg", "jpeg", "gif", "js", "ps1", "bat", "vbs", "py", "html", "htm", "php",
    "eml", "msg", "csv", "json", "xml", "tmp", "dat", "sys", "ini", "cfg", "lnk",
}

PATTERNS = {
    "url": re.compile(r"\bhttps?://[^\s<>\"'\)\]]+", re.IGNORECASE),
    "email": re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b"),
    "ipv4": re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b"),
    "domain": re.compile(r"\b(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}\b"),
    "sha256": re.compile(r"\b[A-Fa-f0-9]{64}\b"),
    "sha1": re.compile(r"\b[A-Fa-f0-9]{40}\b"),
    "md5": re.compile(r"\b[A-Fa-f0-9]{32}\b"),
}


def refang(text):
    """Turn defanged indicators back into normal form so they can be matched."""
    text = re.sub(r"hxxp", "http", text, flags=re.IGNORECASE)
    text = re.sub(r"\[\.\]|\(\.\)|\{\.\}|\[dot\]", ".", text, flags=re.IGNORECASE)
    text = re.sub(r"\[:\]", ":", text)
    text = re.sub(r"\[@\]|\[at\]", "@", text, flags=re.IGNORECASE)
    return text


def defang(value):
    """Make an indicator safe to paste into tickets and chats (not clickable)."""
    value = re.sub(r"^http", "hxxp", value, flags=re.IGNORECASE)
    return value.replace(".", "[.]")


def is_public_ip(ip):
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return None
    return not (addr.is_private or addr.is_loopback or addr.is_reserved
                or addr.is_multicast or addr.is_link_local or addr.is_unspecified)


def extract(text, include_private=False):
    text = refang(text)
    found = {key: set() for key in PATTERNS}

    for url in PATTERNS["url"].findall(text):
        found["url"].add(url.rstrip(".,;"))
    for email in PATTERNS["email"].findall(text):
        found["email"].add(email.lower())
    for ip in PATTERNS["ipv4"].findall(text):
        public = is_public_ip(ip)
        if public is None:
            continue  # not a valid IP, e.g. 999.1.1.1
        if public or include_private:
            found["ipv4"].add(ip)

    email_domains = {e.split("@", 1)[1] for e in found["email"]}
    for domain in PATTERNS["domain"].findall(text):
        domain = domain.lower()
        if domain.rsplit(".", 1)[-1] in FILE_EXTENSIONS:
            continue
        if re.fullmatch(r"[\d.]+", domain):
            continue
        found["domain"].add(domain)
    found["domain"] |= email_domains

    found["sha256"] = {h.lower() for h in PATTERNS["sha256"].findall(text)}
    found["sha1"] = {h.lower() for h in PATTERNS["sha1"].findall(text)}
    found["md5"] = {h.lower() for h in PATTERNS["md5"].findall(text)}

    return {key: sorted(values) for key, values in found.items()}


def main():
    parser = argparse.ArgumentParser(description="Extract IOCs from a file or stdin.")
    parser.add_argument("source", help="Path to a file, or '-' to read from stdin")
    parser.add_argument("--defang", action="store_true", help="Defang IPs, domains and URLs in the output")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of a readable list")
    parser.add_argument("--include-private", action="store_true", help="Keep private/internal IP addresses")
    args = parser.parse_args()

    if args.source == "-":
        text = sys.stdin.read()
    else:
        with open(args.source, "r", encoding="utf-8", errors="ignore") as handle:
            text = handle.read()

    iocs = extract(text, include_private=args.include_private)
    if args.defang:
        for key in ("url", "ipv4", "domain", "email"):
            iocs[key] = [defang(v) for v in iocs[key]]

    if args.json:
        print(json.dumps(iocs, indent=2))
        return

    total = sum(len(v) for v in iocs.values())
    print(f"Found {total} indicator(s)\n")
    for key, values in iocs.items():
        if values:
            print(f"[{key.upper()}] ({len(values)})")
            for value in values:
                print(f"  {value}")
            print()


if __name__ == "__main__":
    main()
