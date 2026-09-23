const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const configRoutes = require('./routes/configRoutes');
const auditRoutes = require('./routes/auditRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/configurations', configRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check Endpoint 
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Obsense Backend API is running with MySQL' });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Obsense REST API Server' });
});

// Start the server
async function startServer() {
  try {
    console.log('Menghubungkan ke database MySQL & inisialisasi schema...');
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
}

startServer();