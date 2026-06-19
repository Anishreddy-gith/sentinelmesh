// Shortest paths from any compromised host to high-value targets
MATCH (start:Host), (end:Host {host_type:'domain_controller'})
WHERE start.risk_score > 0.8 AND start.ip <> end.ip
MATCH path = shortestPath((start)-[:COMMUNICATES_WITH*..6]->(end))
RETURN path, start.ip, end.ip, length(path)
ORDER BY length(path) ASC
LIMIT 5;
