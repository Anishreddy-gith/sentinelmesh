const router = require('express').Router();
router.get('/', (req, res) => res.json({ detections: [] }));
router.get('/:id', (req, res) => res.json({ detection: null }));
module.exports = router;
