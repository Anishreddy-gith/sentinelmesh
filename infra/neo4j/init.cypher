CREATE CONSTRAINT host_ip IF NOT EXISTS FOR (h:Host) REQUIRE h.ip IS UNIQUE;
CREATE CONSTRAINT alert_id IF NOT EXISTS FOR (a:Alert) REQUIRE a.alert_id IS UNIQUE;
CREATE INDEX host_org IF NOT EXISTS FOR (h:Host) ON (h.org_id);
CREATE INDEX host_risk IF NOT EXISTS FOR (h:Host) ON (h.risk_score);
CREATE INDEX alert_time IF NOT EXISTS FOR (a:Alert) ON (a.timestamp);
CREATE INDEX host_type IF NOT EXISTS FOR (h:Host) ON (h.host_type);
