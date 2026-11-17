const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};
const dbName = process.env.DB_NAME || 'auth_db';

const pool = mysql.createPool({
  ...cfg,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Buat database + tabel milik auth-service (users, admins, login_attempts)
async function initDatabase() {
  try {
    const init = await mysql.createConnection(cfg);
    await init.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await init.end();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('user', 'viewer') DEFAULT 'user',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`admins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
        \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`last_login_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`login_attempts\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`email\` VARCHAR(150) NOT NULL,
        \`account_type\` ENUM('user', 'admin') NOT NULL,
        \`status\` ENUM('SUCCESS', 'FAILED') NOT NULL,
        \`ip_address\` VARCHAR(45) NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_attempt_email\` (\`email\`)
      ) ENGINE=InnoDB;
    `);

    // Seed super admin awal jika tabel admins masih kosong
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM admins');
    if (rows[0].total === 0) {
      const hash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'admin123', 10);
      await pool.query(
        'INSERT INTO admins (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Super Administrator', 'superadmin@obsense.com', hash, 'super_admin']
      );
      console.log('Seed super admin dibuat: superadmin@obsense.com');
    }

    console.log(`✅ auth-service: database "${dbName}" siap.`);
  } catch (error) {
    console.error('❌ auth-service: gagal inisialisasi database:', error.message);
  }
}

module.exports = { pool, initDatabase };
