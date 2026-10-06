# Windows Event IDs Every SOC Analyst Should Know

## Security log

| ID | Meaning | Why it matters |
|---|---|---|
| 4624 | Successful logon | Check `LogonType` and source IP |
| 4625 | Failed logon | Brute force, spraying; check `Status`/`SubStatus` |
| 4634 / 4647 | Logoff | Session length |
| 4648 | Logon with explicit credentials (runas) | Lateral movement, credential use |
| 4672 | Special privileges assigned at logon | Admin logons |
| 4688 | New process created | Command line auditing (if enabled) |
| 4697 | Service installed | Persistence |
| 4698 | Scheduled task created | Persistence |
| 4720 | User account created | Backdoor accounts |
| 4722 / 4725 | Account enabled / disabled | |
| 4724 | Password reset attempt | |
| 4728 / 4732 / 4756 | Member added to security group | Privilege escalation (watch Domain Admins) |
| 4740 | Account locked out | Brute force side effect |
| 4768 | Kerberos TGT requested | AS-REP roasting, account activity |
| 4769 | Kerberos service ticket requested | Kerberoasting (RC4 encryption `0x17`) |
| 4771 | Kerberos pre-authentication failed | Brute force against domain accounts |
| 4776 | NTLM credential validation | NTLM brute force, pass-the-hash hunting |
| 1102 | Security log cleared | Anti-forensics |

## Logon types (4624 / 4625)

| Type | Meaning |
|---|---|
| 2 | Interactive (at the keyboard) |
| 3 | Network (file shares, many lateral movement tools) |
| 4 | Batch (scheduled tasks) |
| 5 | Service |
| 7 | Unlock |
| 8 | NetworkCleartext (credentials sent in clear text) |
| 9 | NewCredentials (runas /netonly) |
| 10 | RemoteInteractive (RDP) |
| 11 | CachedInteractive (offline domain logon) |

## 4625 failure codes

| SubStatus | Meaning |
|---|---|
| 0xC000006A | Wrong password |
| 0xC0000064 | User does not exist |
| 0xC0000234 | Account locked out |
| 0xC0000072 | Account disabled |
| 0xC0000071 | Password expired |
| 0xC0000193 | Account expired |
| 0xC000006F | Outside allowed logon hours |

## System log

| ID | Meaning |
|---|---|
| 7045 | New service installed |
| 7040 | Service start type changed |
| 7036 | Service started / stopped |

## Sysmon (if deployed)

| ID | Meaning |
|---|---|
| 1 | Process creation (with full command line and hashes) |
| 3 | Network connection |
| 7 | Image (DLL) loaded |
| 8 | CreateRemoteThread (process injection) |
| 10 | Process access (e.g. LSASS access = credential dumping) |
| 11 | File created |
| 12 / 13 | Registry key created / value set (Run keys) |
| 22 | DNS query |

## PowerShell

| Log | ID | Meaning |
|---|---|---|
| Microsoft-Windows-PowerShell/Operational | 4104 | Script block logging (decoded script content) |
| Microsoft-Windows-PowerShell/Operational | 4103 | Module logging |
