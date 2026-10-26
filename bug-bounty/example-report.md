# Example Report: ReDoS in `ioc_extractor.py`

A complete report written with [`report-template.md`](report-template.md) for a real bug found in this repository's own code during a security review. It was fixed in commit `01106a6`.

---

## Title

Regular-expression backtracking in `ioc_extractor.py` lets a crafted file hang IOC extraction for minutes

## Summary

The domain and email regular expressions in `scripts/ioc_extractor.py` could be retried from every character of a long run of input such as `a.a.a.a…`, giving quadratic running time. An attacker who controls a file an analyst processes (for example a phishing email) can make the tool hang for several minutes, delaying triage.

## Severity

| Field | Value |
|---|---|
| Suggested severity | Low |
| CVSS 3.1 vector | `CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:N/A:L` |
| CVSS score | 3.3 |
| Weakness (CWE) | CWE-1333: Inefficient Regular Expression Complexity |

The analyst has to run the tool on the file (UI:R), it runs locally (AV:L), and the impact is a temporary hang of one tool that can be interrupted (A:L).

## Affected asset

- `scripts/ioc_extractor.py` before commit `01106a6`
- `PATTERNS["domain"]` and `PATTERNS["email"]`
- No account needed; the attacker only needs the analyst to process their file

## Steps to reproduce

1. Create a file of about 100 KB:
   ```bash
   python3 -c 'print("a."*50000+"-")' > crafted.txt
   ```
2. Run the extractor on it and time it:
   ```bash
   time python3 scripts/ioc_extractor.py crafted.txt
   ```
3. Observe that it runs for well over a minute (143 s on the test machine) before printing `Found 0 indicator(s)`. A normal file of the same size finishes in under a second.

## Proof of concept

| Input (~100 KB) | Before fix | After fix |
|---|---|---|
| `"a." * 50000 + "-"` (domain pattern) | 143.6 s | 0.1 s |
| `"a." * 25000` (email pattern, ~50 KB) | 4.6 s | 0.01 s |

Running time grows with the square of the input length, so a larger attachment makes the hang much longer.

## Impact

An analyst triaging a malicious email or log loses minutes per file, or abandons the tool. If the extractor runs in an automated pipeline, a single crafted message can stall it. No data is exposed or modified.

## Suggested fix

Add a negative lookbehind so each match can only start at the beginning of a run, not at every character inside it:

```python
"email":  r"(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@..."
"domain": r"(?<![A-Za-z0-9.-])(?:[A-Za-z0-9](?:...)?\.)+[A-Za-z]{2,24}\b"
```

Output on normal input is unchanged (verified against `samples/phishing_sample.eml`).

## References

- [CWE-1333: Inefficient Regular Expression Complexity](https://cwe.mitre.org/data/definitions/1333.html)
- [OWASP: Regular expression Denial of Service (ReDoS)](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)
