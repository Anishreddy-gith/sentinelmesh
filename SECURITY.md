# Security Policy

## Reporting Vulnerabilities
Contact: security@sentinelmesh.local (replace with actual team email before going public)
Do NOT open a public GitHub issue for any security vulnerability.

## Threat Model
See research/threat_model.md for the full threat model covering all five identified risks.

## Key Security Controls
- JWT authentication with 15-minute access token TTL
- Mandatory TOTP 2FA for all analyst accounts; hardware key for admin
- RBAC via Casbin: SOC_ANALYST, THREAT_HUNTER, ADMIN, READ_ONLY
- Hash-chained audit logs with INSERT-only database user
- TLS 1.3 for all inter-service communication in production
- Rate limiting: 100 requests per minute per authenticated user
- Federated learning: Krum Byzantine-robust aggregation for high-risk deployments

## Supported Versions
Only the latest release on the main branch receives security patches.
