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
