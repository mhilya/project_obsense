const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};
const dbName = process.env.DB_NAME || 'audit_db';

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

    // Tanpa foreign key ke auth_db agar tetap independen (database-per-service)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`audit_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`admin_id\` INT NULL,
        \`admin_name\` VARCHAR(150) NULL,
        \`admin_email\` VARCHAR(150) NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`entity_type\` VARCHAR(50) NOT NULL,
        \`entity_id\` VARCHAR(100) NULL,
        \`details\` JSON NULL,
        \`ip_address\` VARCHAR(45) NULL,
        \`user_agent\` VARCHAR(255) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_audit_action\` (\`action\`),
        INDEX \`idx_audit_entity\` (\`entity_type\`, \`entity_id\`),
        INDEX \`idx_audit_created\` (\`created_at\`)
      ) ENGINE=InnoDB;
    `);

    console.log(`✅ audit-service: database "${dbName}" siap.`);
  } catch (error) {
    console.error('❌ audit-service: gagal inisialisasi database:', error.message);
  }
}

module.exports = { pool, initDatabase };
