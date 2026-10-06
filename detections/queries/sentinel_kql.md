# Microsoft Sentinel / Defender XDR KQL Hunting Queries

## Brute force / password spraying (T1110)

```kql
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625 and IpAddress !in ("-", "127.0.0.1", "::1")
| summarize Failures = count(), Accounts = dcount(TargetUserName), Targets = make_set(TargetUserName, 20)
    by IpAddress, bin(TimeGenerated, 5m)
| where Failures >= 10
| extend Pattern = iff(Accounts >= 5, "Password spraying", "Brute force")
| order by Failures desc
```

## Entra ID sign-in failures followed by a success

```kql
let failures = SigninLogs
| where TimeGenerated > ago(1d) and ResultType != "0"
| summarize FailedCount = count() by IPAddress, UserPrincipalName;
SigninLogs
| where TimeGenerated > ago(1d) and ResultType == "0"
| join kind=inner failures on IPAddress, UserPrincipalName
| where FailedCount >= 10
| project TimeGenerated, UserPrincipalName, IPAddress, Location, AppDisplayName, FailedCount
```

## Encoded PowerShell (T1059.001)

```kql
DeviceProcessEvents
| where Timestamp > ago(7d)
| where FileName in~ ("powershell.exe", "pwsh.exe")
| where ProcessCommandLine has_any (" -enc ", " -EncodedCommand ", " -ec ")
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, ProcessCommandLine
```

## Office spawning a shell (T1204.002)

```kql
DeviceProcessEvents
| where Timestamp > ago(7d)
| where InitiatingProcessFileName in~ ("winword.exe", "excel.exe", "powerpnt.exe", "outlook.exe")
| where FileName in~ ("cmd.exe", "powershell.exe", "pwsh.exe", "wscript.exe", "cscript.exe", "mshta.exe", "rundll32.exe")
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, FileName, ProcessCommandLine
```

## New inbox forwarding rule (post-phishing account takeover)

```kql
OfficeActivity
| where TimeGenerated > ago(7d)
| where Operation in ("New-InboxRule", "Set-InboxRule")
| where Parameters has_any ("ForwardTo", "RedirectTo", "ForwardAsAttachmentTo", "DeleteMessage")
| project TimeGenerated, UserId, ClientIP, Operation, Parameters
```
