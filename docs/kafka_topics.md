# Kafka Topics Reference

This document summarises broker configuration, topic partitioning, retention,
and the **frozen envelope contract** that every message on every topic must
satisfy.

For the full schema specification (envelope, per-topic payloads, semver bump
rules, `trace_id` invariant, DLQ behaviour), see [`SCHEMA.md`](SCHEMA.md). The
JSON Schemas under [`schemas/`](schemas/) are the authoritative source; the
generated [`types.ts`](types.ts) and [`models.py`](models.py) MUST NOT be
hand-edited.

## Broker

| Setting                          | Value                          | Why |
|----------------------------------|--------------------------------|-----|
| Image                            | `confluentinc/cp-kafka:8.0.0`  | Confluent Platform 8.x, KRaft GA |
| Mode                             | **KRaft** (no ZooKeeper)       | ZK removed in Kafka 4.x / Confluent 8.x |
| `auto.create.topics.enable`      | `false`                        | Topics are explicitly declared in `infra/kafka/topics.sh` |
| Single-node replication factor   | `1`                            | Local dev only; production sizing is out of scope for Phase 2.0 |
| Default `compression.type`       | `producer`                     | Producers select; we recommend `zstd` end-to-end |

## Pipeline topics

| Topic              | Partitions | Retention | Cleanup  | Producer(s)                    | Consumer(s)                              | Payload schema |
|--------------------|------------|-----------|----------|--------------------------------|------------------------------------------|----------------|
| `raw_logs`         | 6          | 24 h      | `delete` | `zeek_producer`, `suricata_producer` | `normaliser` | [`raw_log.payload.schema.json`](schemas/raw_log.payload.schema.json) |
| `processed_events` | 6          | 48 h      | `delete` | `normaliser`                   | `graph_builder`                          | [`processed_event.payload.schema.json`](schemas/processed_event.payload.schema.json) |
| `graph_snapshots`  | 3          | 24 h      | `delete` | `graph_builder`                | `gnn_inference`                          | [`graph_snapshot.payload.schema.json`](schemas/graph_snapshot.payload.schema.json) *(draft, Phase 3)* |
| `detections`       | 3          | 7 d       | `delete` | `gnn_inference`                | `mitre_mapper`, `brief_service`, backend API | [`detection.payload.schema.json`](schemas/detection.payload.schema.json) *(draft, Phase 4)* |
| `analyst_briefs`   | 3          | 7 d       | `delete` | `brief_service`                | backend API                              | [`analyst_brief.payload.schema.json`](schemas/analyst_brief.payload.schema.json) *(draft, Phase 7)* |

## Dead-letter topics

| Topic                    | Partitions | Retention | Cleanup  | Purpose |
|--------------------------|------------|-----------|----------|---------|
| `raw_logs.dlq`           | 3          | 7 d       | `delete` | Parser or schema-validation failures from the Zeek/Suricata producers. |
| `processed_events.dlq`   | 3          | 7 d       | `delete` | Normaliser failures (unknown source, missing required field, schema mismatch). |

Phase 3 will add `graph_snapshots.dlq`; Phase 4 will add `detections.dlq`;
Phase 7 will add `analyst_briefs.dlq`. All DLQ messages share the same envelope
and the [DLQ payload schema](schemas/dlq.payload.schema.json).

## Message envelope (frozen at schema_version = 1.0.0)

Every value on every topic conforms to:

```json
{
  "header": {
    "schema_version": "1.0.0",
    "org_id": "org-000",
    "event_id":   "0192fc1f-7e8b-7c44-b3a1-1f7e8b7c44b3",
    "produced_at": "2026-06-20T08:21:34.123Z",
    "producer":    "zeek_producer/1.0.0@site-a-zeek-01",
    "trace_id":   "0192fc1f-7e8b-7c44-b3a1-1f7e8b7c44b3"
  },
  "payload": { /* topic-specific, see schemas/ */ }
}
```

`trace_id` is set **once at ingestion** and copied forward unchanged through
every downstream consumer — this is the single invariant that makes end-to-end
debugging across the five-topic pipeline possible. See [`SCHEMA.md` §3](SCHEMA.md#3-the-trace_id-invariant-critical).

## Producer requirements (Phase 2)

- `acks=all`, `enable.idempotence=true`, `compression.type=zstd`.
- **Message key**: `<org_id>:<src_ip>` (e.g. `org-000:192.168.1.10`). This
  keeps all events for a given source host on a single partition so the graph
  builder sees them in order.
- Every outbound message MUST validate against its topic's message schema
  (under [`schemas/messages/`](schemas/messages/)) before send. Failures route
  to `<topic>.dlq` with the original raw payload and a failure reason.

## Consumer requirements (Phase 2)

- `enable.auto.commit=false`. Commit offsets only after the consumer has
  successfully produced any downstream messages and written any downstream
  state.
- Re-validate inbound messages against the message schema; route schema
  violations to `<topic>.dlq` rather than crashing.
- **Preserve `header.trace_id`** unchanged when emitting any derived
  downstream message. Regenerate `header.event_id`; set `header.producer` and
  `header.produced_at` afresh.
