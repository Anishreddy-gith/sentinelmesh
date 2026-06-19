# SentinelMesh API Reference

Base URL: `http://localhost:3001/api`

## Authentication
All routes require `Authorization: Bearer <jwt_token>` header except `/auth/login`.

## Endpoints

### POST /auth/login
Body: `{ "username": "string", "password": "string" }`
Returns: `{ "access_token": "string", "refresh_token": "string" }`

### GET /alerts
Query: `?page=1&limit=20&status=new&severity=5`
Returns: `{ "alerts": [...], "total": number, "page": number }`

### GET /alerts/:id
Returns single alert with MITRE technique and analyst brief.

### PUT /alerts/:id
Body: `{ "status": "triaged" | "closed", "assigned_to": "user_id" }`

### GET /detections
Returns GNN detection events with anomaly scores and explanation.

### GET /briefs/:detectionId
Returns BERT-generated analyst brief for a detection.

### GET /graph/hosts
Returns all hosts with risk scores from Neo4j.

### GET /graph/attack-paths
Returns lateral movement paths from Neo4j Cypher query.

### GET /graph/new-edges
Returns edges first seen in the last 15-minute window.
