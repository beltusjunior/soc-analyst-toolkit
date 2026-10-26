#!/usr/bin/env python3
"""
scope_check.py - Check hosts, URLs and IPs against a bug bounty program's scope.

Scope file: one entry per line. Lines starting with "!" are exclusions, and an
exclusion always wins over an inclusion. Blank lines and "#" comments are ignored.
    *.example.com          any subdomain of example.com (NOT example.com itself)
    example.com            exactly this host
    203.0.113.0/24         any IP in this range
    203.0.113.10           exactly this IP
    !admin.example.com     excluded even though *.example.com is in scope

Only hosts and IPs are checked. If the program limits scope by path, port or
feature, check that by hand.

Usage:
    python scope_check.py scope.txt shop.example.com https://api.example.com/v1/users
    python scope_check.py scope.txt -f discovered_hosts.txt
    python scope_check.py scope.txt -f discovered_hosts.txt --only-in > targets.txt

Exit code: 0 if every target is in scope, 1 if any is out of scope or invalid.
"""
import argparse
import ipaddress
import re
import sys
from urllib.parse import urlsplit


def clean(value):
    """Replace control characters so untrusted host lists can't inject terminal escapes."""
    return re.sub(r"[\x00-\x1f\x7f-\x9f]", "?", value)


def normalize_host(target):
    """Return the lowercase host (or IP) from a URL, host:port or bare host, or None."""
    target = target.strip()
    if not target:
        return None
    if "://" not in target:
        target = "//" + target  # let urlsplit find the host in "host:port/path"
    try:
        host = urlsplit(target).hostname
    except ValueError:
        return None
    if not host:
        return None
    host = host.rstrip(".").lower()
    if not re.fullmatch(r"[a-z0-9.:_-]+", host):
        return None  # reject odd characters (IDN or garbage) rather than guess
    return host


def parse_entry(entry):
    """Turn one scope line into a matcher tuple."""
    if entry.startswith("*."):
        base = normalize_host(entry[2:])
        if base:
            return ("wildcard", base)
    else:
        try:
            return ("network", ipaddress.ip_network(entry, strict=False))
        except ValueError:
            pass
        host = normalize_host(entry)
        if host:
            return ("host", host)
    raise ValueError(f"cannot parse scope entry: {entry!r}")


def load_scope(path):
    include, exclude = [], []
    with open(path, encoding="utf-8") as handle:
        for number, line in enumerate(handle, 1):
            line = line.split("#", 1)[0].strip()
            if not line:
                continue
            target_list = exclude if line.startswith("!") else include
            try:
                target_list.append(parse_entry(line.lstrip("!").strip()))
            except ValueError as err:
                sys.exit(f"{path}:{number}: {clean(str(err))}")
    if not include:
        sys.exit(f"{path}: no in-scope entries found")
    return include, exclude


def matches(host, matcher):
    kind, value = matcher
    if kind == "network":
        try:
            return ipaddress.ip_address(host) in value
        except ValueError:
            return False
    if kind == "wildcard":
        return host.endswith("." + value)  # the dot stops "evilexample.com" matching
    return host == value


def check(target, include, exclude):
    host = normalize_host(target)
    if host is None:
        return "INVALID"
    if any(matches(host, m) for m in exclude):
        return "OUT (excluded)"
    if any(matches(host, m) for m in include):
        return "IN"
    return "OUT"


def main():
    parser = argparse.ArgumentParser(description="Check targets against a bug bounty scope file.")
    parser.add_argument("scope_file", help="Scope file (one entry per line, '!' for exclusions)")
    parser.add_argument("targets", nargs="*", help="Hosts, URLs or IPs to check")
    parser.add_argument("-f", "--file", help="File with one target per line")
    parser.add_argument("--only-in", action="store_true", help="Print only in-scope targets, one per line")
    args = parser.parse_args()

    include, exclude = load_scope(args.scope_file)
    targets = list(args.targets)
    if args.file:
        with open(args.file, encoding="utf-8", errors="ignore") as handle:
            targets += [line.strip() for line in handle if line.strip() and not line.startswith("#")]
    if not targets:
        parser.error("give at least one target or --file")

    all_in = True
    for target in targets:
        verdict = check(target, include, exclude)
        all_in &= verdict == "IN"
        if args.only_in:
            if verdict == "IN":
                print(clean(target))
        else:
            print(f"{verdict:<16} {clean(target)}")
    sys.exit(0 if all_in else 1)


if __name__ == "__main__":
    main()
