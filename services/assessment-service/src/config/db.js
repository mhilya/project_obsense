const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const cfg = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};
const dbName = process.env.DB_NAME || 'assessment_db';

const pool = mysql.createPool({
  ...cfg,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Catatan: user_id TIDAK memakai foreign key (user ada di user_db / service lain).
async function initDatabase() {
  try {
    const init = await mysql.createConnection(cfg);
    await init.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await init.end();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`assessment_cycles\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`cycle_number\` INT NOT NULL DEFAULT 1,
        \`start_date\` DATE NOT NULL,
        \`end_date\` DATE NOT NULL,
        \`status\` ENUM('in_progress', 'completed', 'expired') NOT NULL DEFAULT 'in_progress',
        \`completion_rate\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
        \`aggregated_features\` JSON NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uq_user_cycle\` (\`user_id\`, \`cycle_number\`),
        INDEX \`idx_cycles_user\` (\`user_id\`),
        INDEX \`idx_cycles_status\` (\`status\`)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`daily_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`cycle_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`log_date\` DATE NOT NULL,
        \`day_number\` INT NOT NULL,
        \`faf\` INT NOT NULL DEFAULT 0,
        \`tue\` INT NOT NULL DEFAULT 0,
        \`fcvc\` INT NOT NULL DEFAULT 1,
        \`favc\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`ch2o\` DECIMAL(3,1) NOT NULL DEFAULT 1.5,
        \`caec\` ENUM('no', 'Sometimes', 'Frequently', 'Always') NOT NULL DEFAULT 'Sometimes',
        \`scc\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`calc\` ENUM('no', 'Sometimes', 'Frequently', 'Always') NOT NULL DEFAULT 'no',
        \`mtrans\` ENUM('Automobile', 'Motorbike', 'Bike', 'Public_Transportation', 'Walking') NOT NULL DEFAULT 'Public_Transportation',
        \`notes\` TEXT NULL,
        \`deleted_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_logs_cycle\` FOREIGN KEY (\`cycle_id\`) REFERENCES \`assessment_cycles\` (\`id\`) ON DELETE CASCADE,
        UNIQUE KEY \`uq_user_cycle_day\` (\`user_id\`, \`cycle_id\`, \`log_date\`),
        INDEX \`idx_logs_date\` (\`log_date\`)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`assessments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`cycle_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`bmi\` DECIMAL(5,2) NOT NULL,
        \`obesity_class\` ENUM('Insufficient_Weight','Normal_Weight','Overweight_Level_I','Overweight_Level_II','Obesity_Type_I','Obesity_Type_II','Obesity_Type_III') NOT NULL,
        \`probability_scores\` JSON NOT NULL,
        \`risk_level\` ENUM('Low', 'Moderate', 'High', 'Critical') NOT NULL DEFAULT 'Low',
        \`recommendations\` JSON NULL,
        \`model_version\` VARCHAR(50) NOT NULL DEFAULT 'manual',
        \`assessment_date\` DATE NOT NULL,
        \`deleted_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_assessments_cycle\` FOREIGN KEY (\`cycle_id\`) REFERENCES \`assessment_cycles\` (\`id\`) ON DELETE CASCADE,
        INDEX \`idx_assessments_user\` (\`user_id\`),
        INDEX \`idx_assessments_class\` (\`obesity_class\`),
        INDEX \`idx_assessments_risk\` (\`risk_level\`),
        INDEX \`idx_assessments_date\` (\`assessment_date\`)
      ) ENGINE=InnoDB;
    `);

    console.log(`✅ assessment-service: database "${dbName}" siap.`);
  } catch (error) {
    console.error('❌ assessment-service: gagal inisialisasi database:', error.message);
  }
}

module.exports = { pool, initDatabase };
