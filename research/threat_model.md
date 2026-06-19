# SentinelMesh Threat Model

## Threat 1: Model Poisoning (CRITICAL)
- **Vector:** Malicious FL participant submits adversarially crafted gradient to blind detection for specific attack types
- **Mitigation:** Krum Byzantine-robust aggregation; update norm monitoring; participant reputation tracking
- **Monitoring:** Alert when submitted update norm deviates more than 3σ from round average

## Threat 2: Data Poisoning (HIGH)
- **Vector:** Injecting false benign events into training data to shift GNN decision boundary
- **Mitigation:** Per-org data validation pipeline; consistency checks on submitted graph snapshots
- **Monitoring:** Monitor local model accuracy degradation per participant across rounds

## Threat 3: Lateral Movement in Platform (HIGH)
- **Vector:** Attacker compromises SOC analyst account to exfiltrate threat intel or suppress alerts
- **Mitigation:** RBAC least privilege (4 roles); mandatory TOTP 2FA; 15-minute JWT TTL; suspicious query rate limiting
- **Monitoring:** Alert on bulk alert closure events; monitor query volume anomalies per user

## Threat 4: API Abuse (MEDIUM)
- **Vector:** Automated scraping of threat intelligence data or alert suppression via API
- **Mitigation:** Rate limiting 100 req/min per user; API key rotation; suspicious activity detection
- **Monitoring:** Alert on more than 500 API calls per hour from a single identity

## Threat 5: Log Tampering (HIGH)
- **Vector:** Attacker with database access deletes or modifies audit log entries to cover tracks
- **Mitigation:** Hash-chained audit logs in MongoDB; INSERT-only DB user for audit collection; write concern majority
- **Monitoring:** Periodic out-of-band hash chain verification job; alert on hash mismatch
