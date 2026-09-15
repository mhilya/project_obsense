const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Pool koneksi MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'obsense_db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Inisialisasi database dan tabel users
async function initDatabase() {
  try {
    // 1. Buat koneksi awal untuk CREATE DATABASE IF NOT EXISTS
    const initialConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    });

    const dbName = process.env.DB_NAME || 'obsense_db';
    await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await initialConnection.end();

    // 2. Inisialisasi tabel users & hapus tabel sensor jika ada
    const connection = await pool.getConnection();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('admin', 'user', 'viewer') DEFAULT 'user',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Hapus tabel sensor_logs dan devices jika sebelumnya pernah dibuat
    await connection.query(`DROP TABLE IF EXISTS \`sensor_logs\`;`);
    await connection.query(`DROP TABLE IF EXISTS \`devices\`;`);

    connection.release();
    console.log('✅ MySQL Database & Users table initialized successfully.');
  } catch (error) {
    console.error('❌ Error initializing MySQL Database:', error.message);
  }
}

module.exports = {
  pool,
  initDatabase,
};
