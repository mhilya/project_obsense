const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const routes = require('./routes');
const initialConfigs = require('./seeds/initialConfig');
const { SystemConfiguration } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ service: 'admin-service', status: 'OK', port: PORT });
});

// Auto-init database dan seed
const initDatabase = async () => {
  try {
    // Sync semua model ke database
    await sequelize.sync({ alter: true }); // Gunakan `force: true` untuk reset (hati-hati!)

    // Seed data awal untuk system_configurations
    for (const config of initialConfigs) {
      const [existing] = await SystemConfiguration.findOrCreate({
        where: { config_key: config.config_key },
        defaults: config
      });
      if (!existing) {
        console.log(`✅ Seed data untuk ${config.config_key} sudah ada.`);
      }
    }

    console.log('✅ Database admin_db dan seed data berhasil diinisialisasi!');
  } catch (err) {
    console.error('❌ Error inisialisasi database:', err.message);
  }
};

// Jalankan inisialisasi
initDatabase();

app.listen(PORT, () => {
  console.log(`🚀 Admin Service running on http://localhost:${PORT}`);
});