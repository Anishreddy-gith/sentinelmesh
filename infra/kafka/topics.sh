#!/bin/bash
BROKER=${KAFKA_BROKER:-localhost:9092}
topics=("raw_logs" "processed_events" "graph_snapshots" "detections" "analyst_briefs")
for topic in "${topics[@]}"; do
  kafka-topics.sh --bootstrap-server $BROKER --create --if-not-exists \
    --topic $topic --partitions 3 --replication-factor 1
  echo "Created: $topic"
done
