# SentinelMesh — Architecture

## Data FlowZeek/Suricata↓ (log files)Kafka [raw_logs]↓Normaliser Consumer↓Kafka [processed_events]↓Graph Builder (NetworkX, 5-min windows)↓ ↓Neo4j PyTorch Geometric(persistent) (ML input)↓GNN Inference (GAT)↓Kafka [detections]↓ ↓MITRE Mapper NLP Brief Generator↓ ↓Kafka [analyst_briefs]↓Node.js API (REST + WebSocket)↓React SOC Dashboard
