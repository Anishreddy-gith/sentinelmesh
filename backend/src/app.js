require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./api/routes/auth');
const alertRoutes = require('./api/routes/alerts');
const detectionRoutes = require('./api/routes/detections');
const briefRoutes = require('./api/routes/briefs');
const graphRoutes = require('./api/routes/graph');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 60000, max: 100 }));

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/detections', detectionRoutes);
app.use('/api/briefs', briefRoutes);
app.use('/api/graph', graphRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'sentinelmesh-backend' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
module.exports = app;
