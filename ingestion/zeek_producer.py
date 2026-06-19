"""
Zeek conn.log Kafka Producer.
Reads Zeek conn.log and publishes one event per connection to raw_logs topic.
"""
import json, os, sys
from kafka import KafkaProducer
from dotenv import load_dotenv
load_dotenv()

BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
TOPIC  = os.getenv('KAFKA_TOPICS_RAW_LOGS', 'raw_logs')

def parse_conn_log_line(line: str) -> dict | None:
    if line.startswith('#'): return None
    fields = line.strip().split('\t')
    if len(fields) < 9: return None
    return {
        'source':     'zeek',
        'log_type':   'conn',
        'ts':         fields[0],
        'src_ip':     fields[2],
        'src_port':   fields[3],
        'dst_ip':     fields[4],
        'dst_port':   fields[5],
        'protocol':   fields[6],
        'duration':   fields[8] if fields[8] != '-' else None,
        'bytes_sent': fields[9]  if len(fields) > 9  and fields[9]  != '-' else None,
        'bytes_recv': fields[10] if len(fields) > 10 and fields[10] != '-' else None,
    }

def produce_from_file(log_path: str):
    producer = KafkaProducer(
        bootstrap_servers=BROKER,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    count = 0
    with open(log_path) as f:
        for line in f:
            event = parse_conn_log_line(line)
            if event:
                producer.send(TOPIC, event)
                count += 1
    producer.flush()
    print(f'Published {count} events to {TOPIC}')

if __name__ == '__main__':
    produce_from_file(sys.argv[1] if len(sys.argv) > 1 else 'sample.log')
