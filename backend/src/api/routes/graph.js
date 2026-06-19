const router = require('express').Router();
// GET /api/graph/hosts        → all hosts with risk scores
// GET /api/graph/attack-paths → lateral movement paths from Neo4j
// GET /api/graph/new-edges    → edges first seen in last window
router.get('/hosts', (req, res) => res.json({ hosts: [] }));
router.get('/attack-paths', (req, res) => res.json({ paths: [] }));
router.get('/new-edges', (req, res) => res.json({ edges: [] }));
module.exports = router;
