const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const sequelize = require('./config/database');
const routes = require('./routes');
const initialConfigs = require('./seeds/initialConfig');
const { SystemConfiguration } = require('./models');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ service: 'admin-service', status: 'OK', port: Number(PORT) });
});

// Auto-create database admin_db, sync tabel Sequelize, dan seed konfigurasi awal
const initDatabase = async () => {
  try {
    const dbName = process.env.DB_NAME || 'admin_db';
    const initConn = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    });
    await initConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await initConn.end();

    await sequelize.sync({ alter: true });

    for (const config of initialConfigs) {
      await SystemConfiguration.findOrCreate({
        where: { config_key: config.config_key },
        defaults: config,
      });
    }

    console.log(`✅ admin-service: database "${dbName}" & seed konfigurasi siap.`);
  } catch (err) {
    console.error('❌ admin-service: gagal inisialisasi database:', err.message);
  }
};

initDatabase();

app.listen(PORT, () => {
  console.log(`🛠️ admin-service running on http://localhost:${PORT}`);
});
