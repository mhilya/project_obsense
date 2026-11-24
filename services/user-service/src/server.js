const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/users', require('./routes/userRoutes'));

app.get('/health', (req, res) => res.json({ service: 'user-service', status: 'OK' }));

app.listen(PORT, () => console.log(`👤 user-service running on http://localhost:${PORT}`));
