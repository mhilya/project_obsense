const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { initDatabase } = require('./config/db');
const { cycleRouter, assessmentRouter } = require('./routes');

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

initDatabase();

app.use('/api/cycles', cycleRouter);
app.use('/api/assessments', assessmentRouter);

app.get('/health', (req, res) => res.json({ service: 'assessment-service', status: 'OK' }));

app.listen(PORT, () => console.log(`📋 assessment-service running on http://localhost:${PORT}`));
