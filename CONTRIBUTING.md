# Contributing to SentinelMesh

## Branch Naming
- `feature/<service>-<description>` — e.g. `feature/ml-gat-attention-layer`
- `research/<topic>` — e.g. `research/tgn-temporal-detection`
- `fix/<service>-<description>` — e.g. `fix/backend-kafka-consumer-offset`
- `hotfix/<description>` — critical production fixes only, branched from main

## Commit Format
`[service] Short imperative description`

Examples:
- `[ml] Add GATConv second message-passing layer`
- `[backend] Fix JWT refresh token expiry logic`
- `[frontend] Add real-time WebSocket alert feed`
- `[infra] Add Redis rate limiting to Docker Compose`

Services: `ml` `backend` `frontend` `infra` `ingestion` `graph` `docs` `research`

## Pull Request Rules
- Minimum 2 approvals required
- CI must pass (lint + tests for all affected services)
- No secrets, credentials, or .env files committed
- Update relevant docs if you change API contracts or Kafka message schemas

## Sprint Structure
- 2-week sprints
- Planning: Monday (1.5 hours, in-person or video)
- Daily standup: async text update on Discord by 10am
- Retrospective: Friday (45 minutes)
- GitHub Issues for all tasks — use labels and milestone assignment

## Issue Labels
`ml` `backend` `frontend` `infra` `research` `documentation` `bug` `enhancement` `blocked` `needs-review`

## Milestones
Match development phases: Month 1 through Month 6.
