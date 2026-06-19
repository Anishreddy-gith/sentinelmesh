# SentinelMesh

**Network Threat Intelligence Platform with Federated Anomaly Detection**

[![CI](https://github.com/your-org/sentinelmesh/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/sentinelmesh/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11-blue)](https://python.org)
[![Node](https://img.shields.io/badge/node-20-green)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-compose-ready-blue)](infra/docker-compose.yml)

> Detecting APT lateral movement using Graph Neural Networks and Federated Learning with Differential Privacy — built for SOC teams.

---

## Architecture
Zeek/Suricata → Kafka [raw_logs] → Normaliser → Kafka [processed_events]

→ Graph Builder → Neo4j + PyTorch Geometric → Kafka [graph_snapshots]

→ GNN Inference (GAT) → Kafka [detections]

→ MITRE ATT&CK Mapper + BERT Brief Generator → Kafka [analyst_briefs]

→ Node.js API (REST + WebSocket) → React SOC Dashboard

---

## Key Features

- **GNN Anomaly Detection** — GraphSAGE baseline and Graph Attention Network (GAT) primary model, target AUC > 0.85
- **Temporal Detection** — Temporal Graph Network (TGN) extension for slow-burn APT campaigns
- **Federated Learning** — Flower framework with FedAvg, FedProx, and Krum aggregation
- **Differential Privacy** — Opacus DP-SGD with Renyi DP accounting, configurable epsilon (1.0–8.0)
- **BERT Analyst Briefs** — Fine-tuned BART/T5 generating triage summaries in under 2 seconds
- **MITRE ATT&CK Mapping** — 400+ technique coverage, heatmap visualisation in dashboard
- **Neo4j Attack Paths** — Cypher lateral movement queries, Sigma.js graph visualisation
- **GNNExplainer** — Edge attribution for every anomaly detection, no black-box outputs

---

## Tech Stack

| Layer       | Technology                                              |
|-------------|---------------------------------------------------------|
| Frontend    | React 18, Sigma.js, D3.js, Tailwind CSS, TanStack Query |
| Backend     | Node.js, Express, Casbin RBAC, JWT, WebSocket           |
| ML          | PyTorch Geometric, HuggingFace, Flower, Opacus, FastAPI |
| Streaming   | Apache Kafka                                            |
| Graph DB    | Neo4j 5                                                 |
| Document DB | MongoDB 7                                               |
| Cache       | Redis 7                                                 |
| Sensors     | Zeek, Suricata                                          |
| Infra       | Docker Compose, Helm (K8s), GitHub Actions              |

---

## Quick Start

```bash
git clone https://github.com/your-org/sentinelmesh.git
cd sentinelmesh
cp .env.example .env
# Edit .env — set JWT_SECRET and any passwords
cd infra
docker compose up -d
bash kafka/topics.sh
```

Frontend: http://localhost:3000
Backend API: http://localhost:3001/health
GNN Inference: http://localhost:8000/health
Brief Generation: http://localhost:8001/health
Neo4j Browser: http://localhost:7474

---

## Team

| Member   | Role                      | Ownership                                             |
|----------|---------------------------|-------------------------------------------------------|
| Member 1 | Frontend and Visualisation| React dashboard, Sigma.js graph, ATT&CK heatmap       |
| Member 2 | Backend and Ingestion     | Node.js API, Kafka pipeline, MongoDB, Neo4j, Auth     |
| Member 3 | ML and Research           | GNN, Federated Learning, BERT briefs, MITRE classifier|

---

## Development Phases

| Phase | Weeks | Goal                                       | Key Deliverable                          |
|-------|-------|--------------------------------------------|------------------------------------------|
| 1     | 1–4   | Dev environment and infra setup            | Kafka, Neo4j, MongoDB running in Docker  |
| 2     | 5–7   | Zeek/Suricata ingestion pipeline           | 10,000 events flowing end-to-end         |
| 3     | 7–10  | Graph construction and Neo4j integration   | 15-min snapshots in Neo4j                |
| 4     | 9–14  | GNN training and inference service         | GAT AUC > 0.85, GNNExplainer working     |
| 5     | 13–16 | MITRE mapping and dashboard alert feed     | Every detection enriched with ATT&CK ID  |
| 6     | 15–20 | Federated learning with DP-SGD             | 3-client FL simulation, epsilon tracked  |
| 7     | 18–22 | BERT analyst brief generation              | Brief generated per detection in < 2s    |
| 8     | 20–24 | Dashboard polish, K8s, security hardening  | Full demo, CI green, ZAP scan clean      |

---

## Research Extensions

- Temporal GNN (TGN) for persistent threat detection — target: USENIX Security
- Adversarial robustness of GAT against graph perturbation — target: NDSS
- GNNExplainer user study with SOC analysts — target: ACM CCS
- Cross-domain federated learning across org profiles — target: IEEE S&P
- LLM-based incident reasoning (Llama-3, Mistral) — emerging research area

---

## License

MIT
