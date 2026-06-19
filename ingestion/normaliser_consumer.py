"""
Normalisation Consumer.
Reads raw_logs, normalises 5-tuple fields, publishes to processed_events.
"""
import json, os
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv
load_dotenv()

BROKER    = os.getenv('KAFKA_BROKER', 'localhost:9092')
IN_TOPIC  = os.getenv('KAFKA_TOPICS_RAW_LOGS', 'raw_logs')
OUT_TOPIC = os.getenv('KAFKA_TOPICS_PROCESSED_EVENTS', 'processed_events')

def normalise(event: dict) -> dict:
    return {
        'src_ip':     event.get('src_ip')   or event.get('src_ip'),
        'dst_ip':     event.get('dst_ip')   or event.get('dest_ip'),
        'src_port':   event.get('src_port'),
        'dst_port':   event.get('dst_port') or event.get('dest_port'),
        'protocol':   str(event.get('protocol', 'unknown')).lower(),
        'bytes_sent': event.get('bytes_sent')     or event.get('bytes_toserver'),
        'bytes_recv': event.get('bytes_recv')     or event.get('bytes_toclient'),
        'alert_flag': 'alert' in event.get('event_type', ''),
        'source':     event.get('source', 'unknown'),
        'raw_ts':     event.get('ts') or event.get('timestamp'),
    }

def run():
    consumer = KafkaConsumer(
        IN_TOPIC,
        bootstrap_servers=BROKER,
        value_deserializer=lambda m: json.loads(m.decode()),
        group_id='normaliser-group'
    )
    producer = KafkaProducer(
        bootstrap_servers=BROKER,
        value_serializer=lambda v: json.dumps(v).encode()
    )
    print(f'Normaliser listening on {IN_TOPIC}...')
    for msg in consumer:
        normalised = normalise(msg.value)
        producer.send(OUT_TOPIC, normalised)

if __name__ == '__main__':
    run()
