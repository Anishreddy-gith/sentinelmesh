const router = require('express').Router();
// POST /api/auth/login   → validate credentials, return JWT
// POST /api/auth/refresh → refresh access token
// POST /api/auth/logout  → invalidate refresh token
router.post('/login', (req, res) => res.json({ message: 'TODO: implement login' }));
router.post('/refresh', (req, res) => res.json({ message: 'TODO: implement token refresh' }));
router.post('/logout', (req, res) => res.json({ message: 'TODO: implement logout' }));
module.exports = router;
