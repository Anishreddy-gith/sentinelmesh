#!/usr/bin/env bash
# Idempotently create the five SentinelMesh pipeline topics + dead-letter topics.
#
# Engineering decisions (see docs/architecture.md, docs/kafka_topics.md):
#   * auto.create.topics.enable=false on the broker; every topic must be
#     explicitly declared here with partitions, retention, and cleanup policy.
#   * Per-topic partition counts sized for downstream parallelism:
#       raw_logs / processed_events    -> 6 partitions (high ingest fan-out)
#       graph_snapshots / detections / analyst_briefs -> 3 partitions
#   * Retention:
#       raw_logs           24h   (replay window for normaliser bug fixes)
#       processed_events   48h
#       graph_snapshots    24h
#       detections          7d   (forensic retention)
#       analyst_briefs      7d
#       *.dlq               7d   (operator triage window)
#   * cleanup.policy=delete for everything (no compaction in Phase 2.0).
#   * Message key contract: producers MUST set message.key="<org_id>:<src_ip>"
#     so the same host stays on the same partition for stable graph ordering.
#
# Usage (typically invoked by the `kafka-init` compose service; can also be
# run manually against any reachable broker):
#   KAFKA_BOOTSTRAP=localhost:9092 ./topics.sh

set -euo pipefail

BOOTSTRAP="${KAFKA_BOOTSTRAP:-kafka:9094}"
RF="${KAFKA_REPLICATION_FACTOR:-1}"

# topic_name  partitions  retention_ms  cleanup_policy
TOPICS=(
  "raw_logs              6  86400000   delete"
  "processed_events      6  172800000  delete"
  "graph_snapshots       3  86400000   delete"
  "detections            3  604800000  delete"
  "analyst_briefs        3  604800000  delete"
  "raw_logs.dlq          3  604800000  delete"
  "processed_events.dlq  3  604800000  delete"
)

echo ">> Waiting for Kafka at ${BOOTSTRAP} to accept metadata requests..."
for i in {1..30}; do
  if kafka-topics --bootstrap-server "${BOOTSTRAP}" --list >/dev/null 2>&1; then
    echo "   Kafka is reachable."
    break
  fi
  sleep 2
done

echo ">> Creating topics (idempotent)..."
for row in "${TOPICS[@]}"; do
  read -r topic partitions retention cleanup <<<"${row}"
  kafka-topics --bootstrap-server "${BOOTSTRAP}" \
    --create --if-not-exists \
    --topic "${topic}" \
    --partitions "${partitions}" \
    --replication-factor "${RF}" \
    --config "retention.ms=${retention}" \
    --config "cleanup.policy=${cleanup}" \
    --config "compression.type=producer"
  echo "   - ${topic} (partitions=${partitions}, retention.ms=${retention}, cleanup=${cleanup})"
done

echo ">> Final topic list:"
kafka-topics --bootstrap-server "${BOOTSTRAP}" --list | sort | sed 's/^/   /'

echo ">> Describing pipeline topics:"
for row in "${TOPICS[@]}"; do
  read -r topic _ _ _ <<<"${row}"
  kafka-topics --bootstrap-server "${BOOTSTRAP}" --describe --topic "${topic}" | head -1
done

echo ">> Done."
