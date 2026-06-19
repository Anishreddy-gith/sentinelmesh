// Find edges that appeared for the first time in the last 15 minutes
MATCH (src:Host)-[r:COMMUNICATES_WITH]->(dst:Host)
WHERE r.first_seen > timestamp() - 900000
RETURN src.ip, dst.ip, r.connection_count, r.alert_count, r.first_seen
ORDER BY r.first_seen DESC;
