# SentinelMesh — Architecture

## Data FlowZeek/Suricata↓ (log files)Kafka [raw_logs]↓Normaliser Consumer↓Kafka [processed_events]↓Graph Builder (NetworkX, 5-min windows)↓ ↓Neo4j PyTorch Geometric(persistent) (ML input)↓GNN Inference (GAT)↓Kafka [detections]↓ ↓MITRE Mapper NLP Brief Generator↓ ↓Kafka [analyst_briefs]↓Node.js API (REST + WebSocket)↓React SOC Dashboard

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
