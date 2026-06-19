const router = require('express').Router();
// GET /api/alerts       → paginated alert feed
// GET /api/alerts/:id   → single alert detail
// PUT /api/alerts/:id   → update status (triage/close)
router.get('/', (req, res) => res.json({ alerts: [], message: 'TODO: fetch from MongoDB' }));
router.get('/:id', (req, res) => res.json({ alert: null }));
router.put('/:id', (req, res) => res.json({ message: 'TODO: update alert status' }));
module.exports = router;
