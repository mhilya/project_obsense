const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};
const dbName = process.env.DB_NAME || 'user_db';

// dateStrings: DATE/DATETIME dikembalikan sebagai string (hindari pergeseran zona waktu)
const pool = mysql.createPool({
  ...cfg,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

async function initDatabase() {
  try {
    const init = await mysql.createConnection(cfg);
    await init.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await init.end();

    // id pasien yang mendaftar sendiri lewat mobile = id akun di auth_db.
    // Pasien yang dibuat admin dari web memakai AUTO_INCREMENT mulai 100000 agar tidak bentrok.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`phone\` VARCHAR(30) NULL,
        \`gender\` ENUM('Male', 'Female') NULL,
        \`birth_date\` DATE NULL,
        \`age\` INT NULL,
        \`height\` DECIMAL(5,2) NULL COMMENT 'cm',
        \`weight\` DECIMAL(5,2) NULL COMMENT 'kg',
        \`address\` TEXT NULL,
        \`family_history_with_overweight\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        \`deleted_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_users_gender\` (\`gender\`),
        INDEX \`idx_users_status\` (\`status\`),
        INDEX \`idx_users_deleted\` (\`deleted_at\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=100000;
    `);

    console.log(`✅ user-service: database "${dbName}" siap.`);
  } catch (error) {
    console.error('❌ user-service: gagal inisialisasi database:', error.message);
  }
}

module.exports = { pool, initDatabase };
