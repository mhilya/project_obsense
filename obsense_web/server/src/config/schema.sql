-- ==========================================================
-- OBSENSE (Obesity Sensing & Clinical Decision Support System)
-- Production MySQL Database Schema DDL
-- Requirements: 8 Core Tables, Foreign Keys, Indexing,
-- Soft Deletes (`deleted_at`), JSON Fields, Timestamps
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `obsense_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `obsense_db`;

-- 1. TABEL ADMINS (Manajemen Admin & Autentikasi Internal)
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_admin_email` (`email`),
  INDEX `idx_admin_role` (`role`)
) ENGINE=InnoDB;

-- 2. TABEL USERS (Data Pengguna / Pasien Antropometri)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `gender` ENUM('Male', 'Female') NOT NULL,
  `age` INT NOT NULL,
  `height` DECIMAL(5,2) NOT NULL COMMENT 'Tinggi badan dalam cm',
  `weight` DECIMAL(5,2) NOT NULL COMMENT 'Berat badan dalam kg',
  `family_history_with_overweight` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  `deleted_at` DATETIME NULL COMMENT 'Soft delete timestamp',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_gender` (`gender`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_deleted` (`deleted_at`)
) ENGINE=InnoDB;

-- 3. TABEL ASSESSMENT_CYCLES (Siklus Pengumpulan Data Kuesioner 14 Hari)
CREATE TABLE IF NOT EXISTS `assessment_cycles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `cycle_number` INT NOT NULL DEFAULT 1,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('in_progress', 'completed', 'expired') NOT NULL DEFAULT 'in_progress',
  `completion_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT 'Persentase hari terisi (0-100%)',
  `aggregated_features` JSON NULL COMMENT 'Ringkasan fitur 14 hari: {faf_mean, tue_mean, fcvc_mode, favc_ratio, ch2o_mean}',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_cycles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_cycles_user` (`user_id`),
  INDEX `idx_cycles_status` (`status`)
) ENGINE=InnoDB;

-- 4. TABEL DAILY_LOGS (Input Log Harian Selama 14 Hari)
CREATE TABLE IF NOT EXISTS `daily_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cycle_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `day_number` INT NOT NULL COMMENT 'Hari ke 1 sampai 14',
  `faf` INT NOT NULL DEFAULT 0 COMMENT 'Physical Activity Frequency: 0=0hr, 1=1-2hr, 2=3-4hr, 3=5+hr',
  `tue` INT NOT NULL DEFAULT 0 COMMENT 'Screen Time Device: 0=<=2h, 1=3-5h, 2=>5h',
  `fcvc` INT NOT NULL DEFAULT 1 COMMENT 'Vegetable Consumption: 1=jarang, 2=kadang, 3=setiap makan',
  `favc` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Frequent Consumption of High Caloric Food: 0=No, 1=Yes',
  `ch2o` DECIMAL(3,1) NOT NULL DEFAULT 1.5 COMMENT 'Water consumption (Liters/day)',
  `caec` ENUM('no', 'Sometimes', 'Frequently', 'Always') NOT NULL DEFAULT 'Sometimes' COMMENT 'Snacking behavior',
  `scc` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Calories monitoring',
  `calc` ENUM('no', 'Sometimes', 'Frequently', 'Always') NOT NULL DEFAULT 'no' COMMENT 'Alcohol consumption',
  `mtrans` ENUM('Automobile', 'Motorbike', 'Bike', 'Public_Transportation', 'Walking') NOT NULL DEFAULT 'Public_Transportation',
  `notes` TEXT NULL,
  `deleted_at` DATETIME NULL COMMENT 'Soft delete flag',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_logs_cycle` FOREIGN KEY (`cycle_id`) REFERENCES `assessment_cycles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uq_user_cycle_day` (`user_id`, `cycle_id`, `log_date`),
  INDEX `idx_logs_date` (`log_date`),
  INDEX `idx_logs_deleted` (`deleted_at`)
) ENGINE=InnoDB;

-- 5. TABEL ASSESSMENTS (Hasil Prediksi Model Machine Learning)
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cycle_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `bmi` DECIMAL(5,2) NOT NULL,
  `obesity_class` ENUM(
    'Insufficient_Weight',
    'Normal_Weight',
    'Overweight_Level_I',
    'Overweight_Level_II',
    'Obesity_Type_I',
    'Obesity_Type_II',
    'Obesity_Type_III'
  ) NOT NULL,
  `probability_scores` JSON NOT NULL COMMENT 'Distribusi probabilitas 7 kelas: {"Insufficient_Weight": 0.02, ...}',
  `risk_level` ENUM('Low', 'Moderate', 'High', 'Critical') NOT NULL DEFAULT 'Low',
  `recommendations` JSON NULL COMMENT 'Rekomendasi gaya hidup dan diet berbasis rule & ML',
  `model_version` VARCHAR(50) NOT NULL DEFAULT 'obsense-xgb-v1.2',
  `assessment_date` DATE NOT NULL,
  `deleted_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_assessments_cycle` FOREIGN KEY (`cycle_id`) REFERENCES `assessment_cycles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assessments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_assessments_class` (`obesity_class`),
  INDEX `idx_assessments_risk` (`risk_level`),
  INDEX `idx_assessments_date` (`assessment_date`),
  INDEX `idx_assessments_deleted` (`deleted_at`)
) ENGINE=InnoDB;

-- 6. TABEL ADMIN_EVALUATIONS (Evaluasi Manual & Rekomendasi Tambahan Klinis Admin)
-- Append-Only: Tidak menimpa prediksi ML melainkan menjadi catatan klinis pelengkap
CREATE TABLE IF NOT EXISTS `admin_evaluations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assessment_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `admin_id` INT NOT NULL,
  `evaluation_notes` TEXT NOT NULL,
  `clinical_recommendation` TEXT NULL,
  `adjusted_risk_level` ENUM('Low', 'Moderate', 'High', 'Critical') NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_eval_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eval_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_eval_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE RESTRICT,
  INDEX `idx_eval_user` (`user_id`),
  INDEX `idx_eval_admin` (`admin_id`),
  INDEX `idx_eval_created` (`created_at`)
) ENGINE=InnoDB;

-- 7. TABEL SYSTEM_CONFIGURATIONS (Konfigurasi Ambang Batas WHO/AHA/FAO & Mapping Variabel)
CREATE TABLE IF NOT EXISTS `system_configurations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_key` VARCHAR(100) NOT NULL UNIQUE,
  `config_value` JSON NOT NULL COMMENT 'Nilai parameter dalam format JSON',
  `description` VARCHAR(255) NULL,
  `last_modified_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_config_admin` FOREIGN KEY (`last_modified_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  INDEX `idx_config_key` (`config_key`)
) ENGINE=InnoDB;

-- 8. TABEL AUDIT_LOGS (Pelacakan Aktivitas & Perubahan Sistem Before/After)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NULL,
  `action` VARCHAR(100) NOT NULL COMMENT 'LOGIN, CREATE_USER, UPDATE_USER, DELETE_USER, EVALUATE, UPDATE_CONFIG, EXPORT_DATA',
  `entity_type` VARCHAR(50) NOT NULL COMMENT 'User, DailyLog, Assessment, Config, Admin',
  `entity_id` VARCHAR(50) NULL,
  `details` JSON NULL COMMENT 'Before & after state snapshot: {"before": {...}, "after": {...}}',
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_audit_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_created` (`created_at`)
) ENGINE=InnoDB;

-- ==========================================================
-- SEED DATA AWAL (Initial Setup Data)
-- ==========================================================

-- Seed Admins (Default Super Admin & Regular Admin)
-- Password hash simulasi bcrypt untuk: 'admin123'
INSERT INTO `admins` (`name`, `email`, `password`, `role`, `is_active`) VALUES
('Super Administrator', 'superadmin@obsense.com', '$2a$10$eB8a1gG9M73d1fA.H8Fh7.nO72r2oQ3m5W4K6u9x/Y6Z1a2b3c4d5', 'super_admin', TRUE),
('Dokter Spesialis Gizi (Admin)', 'admin@obsense.com', '$2a$10$eB8a1gG9M73d1fA.H8Fh7.nO72r2oQ3m5W4K6u9x/Y6Z1a2b3c4d5', 'admin', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Default System Configurations (WHO/AHA/FAO & Variable Mapping)
INSERT INTO `system_configurations` (`config_key`, `config_value`, `description`) VALUES
('threshold_who_bmi', '{
  "insufficient_weight": 18.5,
  "normal_weight_min": 18.5,
  "normal_weight_max": 24.9,
  "overweight_min": 25.0,
  "overweight_max": 29.9,
  "obesity_1_min": 30.0,
  "obesity_1_max": 34.9,
  "obesity_2_min": 35.0,
  "obesity_2_max": 39.9,
  "obesity_3_min": 40.0
}', 'Standard WHO BMI Classification Thresholds'),

('variable_mappings', '{
  "faf": {
    "label": "Physical Activity Frequency",
    "scale": [
      {"code": 0, "label": "0 jam/minggu (Sedentary)"},
      {"code": 1, "label": "1-2 jam/minggu (Ringan)"},
      {"code": 2, "label": "3-4 jam/minggu (Sedang)"},
      {"code": 3, "label": "5+ jam/minggu (Aktif)"}
    ]
  },
  "tue": {
    "label": "Time Using Technology Devices",
    "scale": [
      {"code": 0, "label": "<= 2 jam/hari"},
      {"code": 1, "label": "3-5 jam/hari"},
      {"code": 2, "label": "> 5 jam/hari"}
    ]
  },
  "fcvc": {
    "label": "Frequency of Vegetable Consumption",
    "scale": [
      {"code": 1, "label": "Jarang (Never/Rarely)"},
      {"code": 2, "label": "Kadang-kadang (Sometimes)"},
      {"code": 3, "label": "Setiap Waktu Makan (Always)"}
    ]
  }
}', 'Questionnaire Discrete Scale Mappings to UCI format'),

('ffq_window_settings', '{
  "window_days": 14,
  "min_required_days": 10,
  "auto_aggregate": true,
  "cycle_cooldown_days": 30
}', 'Food Frequency Questionnaire (FFQ) Monitoring Cycle Settings')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
