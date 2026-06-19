// Detect potential lateral movement: high-risk hosts communicating via new edges to domain controllers
MATCH path = (h1:Host)-[:COMMUNICATES_WITH*2..5]->(h2:Host {host_type:'domain_controller'})
WHERE h1.risk_score > 0.7
  AND ALL(e IN relationships(path) WHERE e.is_new_edge = true)
RETURN path, length(path), h1.ip AS origin_host, h1.risk_score
ORDER BY h1.risk_score DESC
LIMIT 10;
