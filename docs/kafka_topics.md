# Kafka Topics Reference

| Topic             | Producer(s)                        | Consumer(s)                              | Format              | Retention |
|-------------------|------------------------------------|------------------------------------------|---------------------|-----------|
| raw_logs          | zeek_producer, suricata_producer   | normaliser_consumer                      | JSON (raw log)      | 24h       |
| processed_events  | normaliser_consumer                | graph_builder                            | JSON (5-tuple)      | 48h       |
| graph_snapshots   | graph_builder                      | ml-inference (GNN)                       | JSON (graph snap)   | 24h       |
| detections        | ml-inference                       | mitre_mapper, brief_service, backend API | JSON (DetectionEvent)| 7d       |
| analyst_briefs    | brief_service                      | backend API                              | JSON (BriefEvent)   | 7d        |

## DetectionEvent Schema
```json
{
  "detection_id": "string",
  "org_id": "string",
  "window_start": "ISO8601",
  "window_end": "ISO8601",
  "anomalous_nodes": ["ip"],
  "anomalous_edges": [{"src": "ip", "dst": "ip"}],
  "gnn_scores": {"ip": 0.87},
  "mitre_technique_id": "T1550.002",
  "explanation": {"top_edges": []}
}
```
