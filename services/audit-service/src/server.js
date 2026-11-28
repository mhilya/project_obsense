const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4006;

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

initDatabase();

app.use('/api/audit', require('./routes/auditRoutes'));

app.get('/health', (req, res) => res.json({ service: 'audit-service', status: 'OK' }));

app.listen(PORT, () => console.log(`📜 audit-service running on http://localhost:${PORT}`));
