# SentinelMesh - Architecture

SentinelMesh is a multi-service threat intelligence platform for detecting lateral movement in enterprise networks. It combines Zeek and Suricata telemetry, Kafka streaming, graph construction, Neo4j attack-path analysis, GNN anomaly detection, federated learning, MITRE ATT&CK enrichment, and analyst-facing brief generation.

## System Overview

```mermaid
flowchart LR
  subgraph Sensors
    Zeek[Zeek conn.log]
    Suricata[Suricata eve.json]
  end

  subgraph Streaming[Kafka Streaming Layer]
    Raw[(raw_logs)]
    Processed[(processed_events)]
    Snapshots[(graph_snapshots)]
    Detections[(detections)]
    Briefs[(analyst_briefs)]
  end

  subgraph Ingestion
    ZeekProducer[zeek_producer.py]
    SuricataProducer[suricata_producer.py]
    Normaliser[normaliser_consumer.py]
  end

  subgraph GraphService[Graph Service]
    GraphBuilder[NetworkX Graph Builder]
    Neo4jWriter[Neo4j Writer]
    Cypher[Cypher Attack Path Queries]
  end

  subgraph ML[ML Services]
    GNN[GAT / GraphSAGE Inference]
    FL[Flower Federated Learning]
    MITRE[MITRE ATT&CK Mapper]
    NLP[BART/T5 Analyst Briefs]
  end

  subgraph API[Backend API]
    Express[Node.js Express API]
    WS[WebSocket Alert Stream]
    Auth[JWT + Casbin RBAC]
  end

  subgraph UI[Frontend]
    React[React SOC Dashboard]
    Sigma[Sigma.js Attack Graph]
    D3[D3 ATT&CK Heatmap]
  end

  Zeek --> ZeekProducer --> Raw
  Suricata --> SuricataProducer --> Raw
  Raw --> Normaliser --> Processed
  Processed --> GraphBuilder --> Snapshots
  GraphBuilder --> Neo4jWriter --> Neo4j[(Neo4j 5)]
  Neo4j --> Cypher
  Snapshots --> GNN --> Detections
  Detections --> MITRE --> NLP --> Briefs
  Detections --> Express
  Briefs --> Express
  Cypher --> Express
  Express --> WS --> React
  Express --> React
  React --> Sigma
  React --> D3
  FL -. aggregated model updates .-> GNN
```

## Data Flow

```mermaid
sequenceDiagram
  participant Z as Zeek / Suricata
  participant K1 as Kafka: raw_logs
  participant N as Normaliser
  participant K2 as Kafka: processed_events
  participant G as Graph Builder
  participant DB as Neo4j
  participant K3 as Kafka: graph_snapshots
  participant M as GNN Inference
  participant K4 as Kafka: detections
  participant E as MITRE + Brief Services
  participant K5 as Kafka: analyst_briefs
  participant API as Backend API
  participant UI as React Dashboard

  Z->>K1: raw connection and alert events
  K1->>N: consume raw JSON logs
  N->>K2: normalized 5-tuple events
  K2->>G: 5-minute graph windows
  G->>DB: persist hosts and COMMUNICATES_WITH edges
  G->>K3: graph snapshot
  K3->>M: node features and edge index
  M->>K4: anomaly scores and detections
  K4->>E: detection enrichment
  E->>K5: ATT&CK mapping and analyst brief
  K4->>API: detection feed
  K5->>API: brief feed
  DB->>API: attack paths and host risk
  API->>UI: REST and WebSocket updates
```

## Service Responsibilities

| Service | Responsibility | Key Technologies |
|---------|----------------|------------------|
| `frontend` | SOC dashboard, investigations, graph visualization, ATT&CK heatmap | React 18, Vite, Tailwind CSS, TanStack Query, Sigma.js, Graphology, D3.js, Axios |
| `backend` | REST API, auth, RBAC hooks, alert/detection/brief routes, Neo4j and Kafka service adapters | Node.js 20, Express, JWT, express-jwt, Casbin, Mongoose, Neo4j Driver, KafkaJS, Redis, WebSocket, Helmet, CORS |
| `ingestion` | Zeek and Suricata producers plus raw log normalization | Python 3.11, kafka-python, python-dotenv, pytest |
| `graph` | Time-windowed host graph construction and Neo4j persistence | Python 3.11, NetworkX, Neo4j Python Driver, Kafka, Cypher |
| `ml` | GNN inference, GraphSAGE baseline, GAT model, federated learning, privacy accounting, brief generation, MITRE mapping | PyTorch, PyTorch Geometric, FastAPI, Uvicorn, Flower, Opacus, Transformers, Datasets, scikit-learn |
| `infra` | Local development stack and bootstrap scripts | Docker Compose, Kafka, Zookeeper, MongoDB, Neo4j, Redis |
| `.github` | CI and security scanning | GitHub Actions, pnpm, pytest, Snyk, Trivy |

## Runtime Topology

```mermaid
flowchart TB
  subgraph DockerCompose[Docker Compose Network]
    Frontend[frontend:3000]
    Backend[backend:3001]
    MLInfer[ml-inference:8000]
    BriefGen[brief-generation:8001]
    FLServer[fl-server:8080]
    Kafka[kafka:9092]
    Zookeeper[zookeeper:2181]
    Mongo[(mongodb:27017)]
    Neo4j[(neo4j:7474/7687)]
    Redis[(redis:6379)]
    Ingestion[ingestion worker]
    GraphBuilder[graph-builder worker]
  end

  Frontend --> Backend
  Backend --> Mongo
  Backend --> Neo4j
  Backend --> Redis
  Backend --> Kafka
  Ingestion --> Kafka
  Kafka --> GraphBuilder
  GraphBuilder --> Neo4j
  GraphBuilder --> Kafka
  Kafka --> MLInfer
  MLInfer --> Kafka
  BriefGen --> Kafka
  FLServer --> MLInfer
  Kafka --> Zookeeper
```

## Kafka Topics

| Topic | Producer | Consumer | Purpose |
|-------|----------|----------|---------|
| `raw_logs` | Zeek and Suricata producers | Normaliser | Raw sensor telemetry |
| `processed_events` | Normaliser | Graph Builder | Normalized connection events |
| `graph_snapshots` | Graph Builder | GNN inference | Windowed host communication graph |
| `detections` | ML inference | Backend, MITRE mapper, brief service | Anomaly detection results |
| `analyst_briefs` | Brief service | Backend | Human-readable detection summaries |

## Service Ports

| Service            | Port       | Technology              |
|--------------------|------------|-------------------------|
| Frontend           | 3000       | React 18 + Vite         |
| Backend API        | 3001       | Node.js + Express       |
| GNN Inference      | 8000       | FastAPI + PyTorch       |
| Brief Generation   | 8001       | FastAPI + HuggingFace   |
| FL Server          | 8080       | Flower (gRPC)           |
| Kafka              | 9092       | Apache Kafka            |
| Zookeeper          | 2181       | Confluent Zookeeper     |
| Neo4j Browser      | 7474       | Neo4j 5                 |
| Neo4j Bolt         | 7687       | Neo4j 5                 |
| MongoDB            | 27017      | MongoDB 7               |
| Redis              | 6379       | Redis 7                 |
