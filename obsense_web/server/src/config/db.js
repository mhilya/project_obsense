const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'obsense_db',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let dbInitializationPromise = null;

async function initDatabase() {
  if (dbInitializationPromise) {
    return dbInitializationPromise;
  }
  dbInitializationPromise = (async () => {
    try {
      console.log('Menghubungkan ke database...');
      const initialConnection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      });

      const dbName = process.env.DB_NAME || 'obsense_db';
      await initialConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await initialConnection.end();


      const connection = await pool.getConnection();
      console.log('Creating and initializing schema.sql...');

      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
      const queries = schemaSQL.split(';').map(query => query.trim()).filter(query => query.length > 0);
      for (const query of queries) {
        await connection.query(query + ';');
      }

      const [auditCols] = await connection.query("SHOW COLUMNS FROM `audit_logs` LIKE 'admin_name'");
      if (auditCols.length === 0) {
        console.log('Migrating audit_logs columns (admin_name, admin_email)...');
        await connection.query("ALTER TABLE `audit_logs` ADD COLUMN `admin_name` VARCHAR(150) NULL AFTER `admin_id`, ADD COLUMN `admin_email` VARCHAR(150) NULL AFTER `admin_name`");
      }

      const { seedDatabase } = require('./seed');
      await seedDatabase(connection);

      connection.release();
      console.log('Database, tables, and seeds initialized successfully.');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      console.error(error.message);
      throw error;
    }
  })();
  return dbInitializationPromise;
}

module.exports = {
  pool,
  initDatabase,
};