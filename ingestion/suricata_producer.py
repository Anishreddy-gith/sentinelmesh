"""
Suricata eve.json Kafka Producer.
Reads Suricata EVE JSON and publishes events to raw_logs topic.
"""
import json, os, sys
from kafka import KafkaProducer
from dotenv import load_dotenv
load_dotenv()

BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
TOPIC  = os.getenv('KAFKA_TOPICS_RAW_LOGS', 'raw_logs')

def produce_from_file(log_path: str):
    producer = KafkaProducer(
        bootstrap_servers=BROKER,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    count = 0
    with open(log_path) as f:
        for line in f:
            try:
                event = json.loads(line)
                event['source'] = 'suricata'
                producer.send(TOPIC, event)
                count += 1
            except json.JSONDecodeError:
                continue
    producer.flush()
    print(f'Published {count} Suricata events to {TOPIC}')

if __name__ == '__main__':
    produce_from_file(sys.argv[1] if len(sys.argv) > 1 else 'eve.json')
