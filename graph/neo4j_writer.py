"""
Neo4j Writer.
Writes graph snapshots (nodes + edges) to Neo4j for persistent storage and Cypher queries.
"""
import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
load_dotenv()

URI      = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
USER     = os.getenv('NEO4J_USER', 'neo4j')
PASSWORD = os.getenv('NEO4J_PASSWORD', 'sentinelmesh123')

driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))

def write_snapshot(snapshot: dict):
    with driver.session() as session:
        for node_ip in snapshot.get('nodes', []):
            session.run(
                "MERGE (h:Host {ip: $ip}) SET h.last_seen = timestamp()",
                ip=node_ip
            )
        for edge in snapshot.get('edges', []):
            session.run("""
                MATCH (src:Host {ip: $src}), (dst:Host {ip: $dst})
                MERGE (src)-[r:COMMUNICATES_WITH]->(dst)
                SET r.connection_count = $count,
                    r.alert_count = $alerts,
                    r.last_seen = timestamp()
            """, src=edge['src'], dst=edge['dst'],
                count=edge.get('count', 0), alerts=edge.get('alerts', 0))
