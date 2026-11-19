const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

initDatabase();

app.use('/api/auth', require('./routes/authRoutes'));

app.get('/health', (req, res) => res.json({ service: 'auth-service', status: 'OK' }));

app.listen(PORT, () => console.log(`🔐 auth-service running on http://localhost:${PORT}`));
