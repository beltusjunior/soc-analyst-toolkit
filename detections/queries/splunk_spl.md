# Splunk SPL Hunting Queries

Index and sourcetype names vary; replace `index=wineventlog` and `index=sysmon` with yours.

## Brute force / password spraying (T1110)

```spl
index=wineventlog EventCode=4625 Source_Network_Address!="-" Source_Network_Address!="127.0.0.1"
| bin _time span=5m
| stats count AS failures dc(Account_Name) AS accounts values(Account_Name) AS targets BY _time Source_Network_Address
| where failures >= 10
| eval pattern=if(accounts>=5, "password spraying", "brute force")
| sort - failures
```

## Failures followed by a success from the same IP

```spl
index=wineventlog (EventCode=4625 OR EventCode=4624) Source_Network_Address!="-"
| stats count(eval(EventCode=4625)) AS failures count(eval(EventCode=4624)) AS successes values(Account_Name) AS accounts BY Source_Network_Address
| where failures >= 10 AND successes > 0
```

## Encoded PowerShell (T1059.001)

```spl
index=sysmon EventCode=1 (Image="*\\powershell.exe" OR Image="*\\pwsh.exe")
  (CommandLine="* -enc *" OR CommandLine="* -EncodedCommand *" OR CommandLine="* -ec *")
| table _time host User ParentImage CommandLine
```

## Office spawning a shell (T1204.002)

```spl
index=sysmon EventCode=1
  (ParentImage="*\\WINWORD.EXE" OR ParentImage="*\\EXCEL.EXE" OR ParentImage="*\\OUTLOOK.EXE")
  (Image="*\\cmd.exe" OR Image="*\\powershell.exe" OR Image="*\\wscript.exe" OR Image="*\\mshta.exe")
| table _time host User ParentImage Image CommandLine
```

## Security log cleared (T1070.001)

```spl
index=wineventlog EventCode=1102
| table _time host Account_Name
```
