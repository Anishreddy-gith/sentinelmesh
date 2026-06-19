"""
Graph Builder.
Consumes processed_events from Kafka.
Builds a time-windowed NetworkX host graph every 5 minutes.
Publishes graph snapshots to graph_snapshots topic.
"""
import json, os, time
from collections import defaultdict
import networkx as nx
from kafka import KafkaConsumer, KafkaProducer
from dotenv import load_dotenv
load_dotenv()

BROKER      = os.getenv('KAFKA_BROKER', 'localhost:9092')
IN_TOPIC    = os.getenv('KAFKA_TOPICS_PROCESSED_EVENTS', 'processed_events')
OUT_TOPIC   = os.getenv('KAFKA_TOPICS_GRAPH_SNAPSHOTS', 'graph_snapshots')
WINDOW_SECS = 300

def build_graph(events: list) -> nx.DiGraph:
    G = nx.DiGraph()
    edge_stats = defaultdict(lambda: {'count': 0, 'bytes': 0, 'alerts': 0})
    for ev in events:
        src, dst = ev.get('src_ip'), ev.get('dst_ip')
        if not src or not dst: continue
        G.add_node(src)
        G.add_node(dst)
        key = (src, dst)
        edge_stats[key]['count'] += 1
        edge_stats[key]['bytes'] += (ev.get('bytes_sent') or 0)
        if ev.get('alert_flag'): edge_stats[key]['alerts'] += 1
    for (src, dst), stats in edge_stats.items():
        G.add_edge(src, dst, **stats)
    return G

def serialise_graph(G: nx.DiGraph) -> dict:
    return {
        'nodes': list(G.nodes()),
        'edges': [{'src': u, 'dst': v, **d} for u, v, d in G.edges(data=True)],
        'node_count': G.number_of_nodes(),
        'edge_count': G.number_of_edges(),
    }

def run():
    consumer = KafkaConsumer(
        IN_TOPIC, bootstrap_servers=BROKER,
        value_deserializer=lambda m: json.loads(m.decode()),
        group_id='graph-builder-group'
    )
    producer = KafkaProducer(
        bootstrap_servers=BROKER,
        value_serializer=lambda v: json.dumps(v).encode()
    )
    buffer, window_start = [], time.time()
    print('Graph builder running...')
    for msg in consumer:
        buffer.append(msg.value)
        if time.time() - window_start >= WINDOW_SECS:
            G = build_graph(buffer)
            snapshot = serialise_graph(G)
            producer.send(OUT_TOPIC, snapshot)
            print(f'Published graph snapshot: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges')
            buffer, window_start = [], time.time()

if __name__ == '__main__':
    run()
