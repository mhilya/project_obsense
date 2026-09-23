const bcrypt = require('bcryptjs');

async function seedDatabase(connection) {
  try {
    // 1. Check Admins
    const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admins');
    if (adminRows[0].count === 0) {
      console.log('Seeding admins...');
      const salt = await bcrypt.genSalt(10);
      const superAdminPass = await bcrypt.hash('superadmin123', salt);
      const adminPass = await bcrypt.hash('admin123', salt);

      await connection.query(
        `INSERT INTO admins (id, name, email, password, role, is_active, last_login_at, created_at) VALUES 
         (1, 'Dr. Sarah Amalia, Sp.GK (Super Admin)', 'superadmin@obsense.com', ?, 'super_admin', TRUE, '2026-09-15 10:15:00', '2026-01-10 08:00:00'),
         (2, 'Budi Santoso, S.Gz (Admin Klinis)', 'admin@obsense.com', ?, 'admin', TRUE, '2026-09-15 09:30:00', '2026-02-01 09:00:00'),
         (3, 'Rian Pratama, S.Kom (Data Operator)', 'operator@obsense.com', ?, 'admin', FALSE, '2026-09-01 14:20:00', '2026-03-15 11:30:00')`,
        [superAdminPass, adminPass, adminPass]
      );
    }

    // 2. Check Users
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('Seeding users...');
      const usersData = [
        [101, 'Dimas Prasetyo', 'dimas.prasetyo@email.com', '081234567801', 'Male', 24, 172.0, 122.5, true, 'active', null, '2026-08-01 10:00:00'],
        [102, 'Anisa Rahmawati', 'anisa.rahma@email.com', '081234567802', 'Female', 28, 158.0, 52.0, false, 'active', null, '2026-08-05 11:30:00'],
        [103, 'Rizky Firmansyah', 'rizky.f@email.com', '081234567803', 'Male', 32, 168.0, 96.0, true, 'active', null, '2026-08-10 14:15:00'],
        [104, 'Nadia Safitri', 'nadia.safitri@email.com', '081234567804', 'Female', 22, 165.0, 73.5, true, 'active', null, '2026-08-12 09:00:00'],
        [105, 'Fajar Nugraha', 'fajar.nugraha@email.com', '081234567805', 'Male', 35, 175.0, 114.0, true, 'active', null, '2026-08-15 16:45:00'],
        [106, 'Lestari Wulandari', 'lestari.w@email.com', '081234567806', 'Female', 20, 160.0, 44.0, false, 'active', null, '2026-08-20 08:30:00'],
        [107, 'Bayu Aditya', 'bayu.aditya@email.com', '081234567807', 'Male', 29, 170.0, 84.0, true, 'active', null, '2026-08-22 13:20:00'],
        [108, 'Maya Indah Permata', 'maya.indah@email.com', '081234567808', 'Female', 26, 155.0, 56.0, false, 'inactive', null, '2026-08-25 15:10:00'],
        [109, 'Hendra Gunawan', 'hendra.g@email.com', '081234567809', 'Male', 40, 165.0, 98.0, true, 'active', null, '2026-08-28 10:40:00'],
        [110, 'Tiara Citra', 'tiara.citra@email.com', '081234567810', 'Female', 23, 162.0, 71.0, true, 'active', null, '2026-09-01 11:00:00'],
        [111, 'Bambang Kusuma (Deleted)', 'bambang.k@email.com', '081234567811', 'Male', 45, 167.0, 88.0, false, 'inactive', '2026-09-10 14:00:00', '2026-07-15 09:00:00']
      ];

      for (const u of usersData) {
        await connection.query(
          `INSERT INTO users (id, name, email, phone, gender, age, height, weight, family_history_with_overweight, status, deleted_at, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          u
        );
      }
    }

    // 3. Check Assessment Cycles
    const [cycleRows] = await connection.query('SELECT COUNT(*) as count FROM assessment_cycles');
    if (cycleRows[0].count === 0) {
      console.log('Seeding assessment cycles...');
      const cycles = [
        [
          201, 101, 2, '2026-08-16', '2026-08-29', 'completed', 100.0,
          JSON.stringify({ faf_mean: 0.28, tue_mean: 1.85, fcvc_mode: 1, favc_ratio: 0.86, ch2o_mean: 1.2 }),
          '2026-08-16 08:00:00'
        ],
        [
          202, 102, 1, '2026-08-18', '2026-08-31', 'completed', 100.0,
          JSON.stringify({ faf_mean: 2.14, tue_mean: 0.42, fcvc_mode: 3, favc_ratio: 0.14, ch2o_mean: 2.4 }),
          '2026-08-18 08:00:00'
        ],
        [
          203, 103, 2, '2026-09-01', '2026-09-14', 'completed', 100.0,
          JSON.stringify({ faf_mean: 0.71, tue_mean: 1.57, fcvc_mode: 2, favc_ratio: 0.71, ch2o_mean: 1.6 }),
          '2026-09-01 08:00:00'
        ],
        [
          204, 105, 2, '2026-09-05', '2026-09-18', 'in_progress', 71.4,
          JSON.stringify({ faf_mean: 0.5, tue_mean: 1.7, fcvc_mode: 1, favc_ratio: 0.8, ch2o_mean: 1.4 }),
          '2026-09-05 08:00:00'
        ]
      ];

      for (const c of cycles) {
        await connection.query(
          `INSERT INTO assessment_cycles (id, user_id, cycle_number, start_date, end_date, status, completion_rate, aggregated_features, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          c
        );
      }
    }

    // 4. Check Daily Logs
    const [logRows] = await connection.query('SELECT COUNT(*) as count FROM daily_logs');
    if (logRows[0].count === 0) {
      console.log('Seeding daily logs...');
      const dailyLogs = [
        [301, 201, 101, '2026-08-16', 1, 0, 2, 1, 1, 1.2, 'Always', 0, 'no', 'Public_Transportation', 'Banyak duduk di kantor, makan gorengan sore'],
        [302, 201, 101, '2026-08-17', 2, 0, 2, 1, 1, 1.0, 'Frequently', 0, 'no', 'Public_Transportation', 'Lembur sampai malam'],
        [303, 201, 101, '2026-08-18', 3, 1, 2, 2, 0, 1.5, 'Sometimes', 0, 'no', 'Walking', 'Jalan santai 15 menit'],
        [304, 201, 101, '2026-08-19', 4, 0, 2, 1, 1, 1.0, 'Always', 0, 'no', 'Automobile', 'Fast food siang hari'],
        [305, 201, 101, '2026-08-20', 5, 0, 2, 1, 1, 1.2, 'Frequently', 0, 'no', 'Automobile', 'Kurang tidur'],
        [306, 201, 101, '2026-08-21', 6, 1, 1, 2, 1, 1.5, 'Sometimes', 0, 'no', 'Walking', 'Akhir pekan'],
        [307, 201, 101, '2026-08-22', 7, 0, 2, 1, 1, 1.0, 'Always', 0, 'no', 'Automobile', 'Makan di luar keluarga'],
        [308, 201, 101, '2026-08-23', 8, 0, 2, 1, 1, 1.2, 'Frequently', 0, 'no', 'Automobile', 'Main game 6 jam'],
        [309, 201, 101, '2026-08-24', 9, 0, 2, 1, 1, 1.0, 'Frequently', 0, 'no', 'Public_Transportation', 'Senin sibuk'],
        [310, 201, 101, '2026-08-25', 10, 1, 1, 2, 0, 1.8, 'Sometimes', 0, 'no', 'Walking', 'Makan sup sayur'],
        [311, 201, 101, '2026-08-26', 11, 0, 2, 1, 1, 1.1, 'Always', 0, 'no', 'Public_Transportation', 'Kopi manis 2 gelas'],
        [312, 201, 101, '2026-08-27', 12, 0, 2, 1, 1, 1.3, 'Frequently', 0, 'no', 'Public_Transportation', 'Ngantuk sore hari'],
        [313, 201, 101, '2026-08-28', 13, 1, 2, 1, 1, 1.2, 'Frequently', 0, 'no', 'Walking', 'Jalan sore'],
        [314, 201, 101, '2026-08-29', 14, 0, 2, 1, 1, 1.0, 'Always', 0, 'no', 'Automobile', 'Siklus 14 hari selesai'],
        [315, 202, 102, '2026-08-18', 1, 2, 0, 3, 0, 2.5, 'Sometimes', 1, 'no', 'Walking', 'Jogging pagi 30 menit, sarapan oatmeal'],
        [316, 202, 102, '2026-08-19', 2, 2, 0, 3, 0, 2.3, 'Sometimes', 1, 'no', 'Walking', 'Bawa bekal salad'],
        [317, 203, 103, '2026-09-01', 1, 1, 2, 2, 1, 1.5, 'Frequently', 0, 'no', 'Motorbike', 'Naik motor ke kantor']
      ];

      for (const log of dailyLogs) {
        await connection.query(
          `INSERT INTO daily_logs (id, cycle_id, user_id, log_date, day_number, faf, tue, fcvc, favc, ch2o, caec, scc, calc, mtrans, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          log
        );
      }
    }

    // 5. Check Assessments
    const [assessmentRows] = await connection.query('SELECT COUNT(*) as count FROM assessments');
    if (assessmentRows[0].count === 0) {
      console.log('Seeding assessments...');
      const assessments = [
        [
          401, 201, 101, 41.4, 'Obesity_Type_III',
          JSON.stringify({
            Insufficient_Weight: 0.001,
            Normal_Weight: 0.005,
            Overweight_Level_I: 0.012,
            Overweight_Level_II: 0.022,
            Obesity_Type_I: 0.060,
            Obesity_Type_II: 0.180,
            Obesity_Type_III: 0.720
          }),
          'Critical',
          JSON.stringify([
            'Konsultasi segera ke dokter spesialis gizi klinik dan dokter penyakit dalam.',
            'Target penurunan berat badan bertahap 5-10% dalam 6 bulan.',
            'Kurangi screen time (TUE) dan tingkatkan aktivitas fisik ringan secara berkala.',
            'Pola makan rendah kalori seimbang, batasi gula, garam, dan minyak (GGL).'
          ]),
          'obsense-rf-v1.2', '2026-08-30', '2026-08-30 09:15:00'
        ],
        [
          402, 202, 102, 20.8, 'Normal_Weight',
          JSON.stringify({
            Insufficient_Weight: 0.040,
            Normal_Weight: 0.880,
            Overweight_Level_I: 0.060,
            Overweight_Level_II: 0.010,
            Obesity_Type_I: 0.005,
            Obesity_Type_II: 0.003,
            Obesity_Type_III: 0.002
          }),
          'Low',
          JSON.stringify([
            'Pertahankan gaya hidup sehat dan konsumsi sayur-buah yang rutin.',
            'Lanjutkan olahraga teratur minimal 150 menit per minggu.'
          ]),
          'obsense-rf-v1.2', '2026-09-01', '2026-09-01 10:00:00'
        ],
        [
          403, 203, 103, 34.0, 'Obesity_Type_I',
          JSON.stringify({
            Insufficient_Weight: 0.002,
            Normal_Weight: 0.018,
            Overweight_Level_I: 0.080,
            Overweight_Level_II: 0.150,
            Obesity_Type_I: 0.650,
            Obesity_Type_II: 0.090,
            Obesity_Type_III: 0.010
          }),
          'High',
          JSON.stringify([
            'Tingkatkan konsumsi air putih (CH2O) minimal 2 liter/hari.',
            'Kurangi konsumsi makanan berkalori tinggi (FAVC) dan cemilan tinggi lemak.',
            'Jadwalkan aktivitas fisik sedang (FAF level 2).'
          ]),
          'obsense-rf-v1.2', '2026-09-15', '2026-09-15 08:30:00'
        ]
      ];

      for (const a of assessments) {
        await connection.query(
          `INSERT INTO assessments (id, cycle_id, user_id, bmi, obesity_class, probability_scores, risk_level, recommendations, model_version, assessment_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          a
        );
      }
    }

    // 6. Check Admin Evaluations
    const [evalRows] = await connection.query('SELECT COUNT(*) as count FROM admin_evaluations');
    if (evalRows[0].count === 0) {
      console.log('Seeding admin evaluations...');
      const evaluations = [
        [
          501, 401, 101, 1,
          'Pasien memiliki BMI 41.4 dengan riwayat hipertensi ringan. Disarankan pemeriksaan lab lipid profile dan HbA1c.',
          'Diet defisit kalori 500 kkal/hari diawasi, latihan aerobik low-impact (jalan santai/renang) untuk mengurangi beban sendi lutut.',
          'Critical', '2026-08-31 11:20:00'
        ],
        [
          502, 401, 101, 2,
          'Evaluasi mingguan: Pasien berhasil menurunkan konsumsi minuman manis dari 3 gelas menjadi 1 gelas per hari.',
          'Berikan apresiasi dan dorong substitusi camilan dengan potongan buah berair tinggi serat.',
          'High', '2026-09-07 14:45:00'
        ],
        [
          503, 403, 103, 2,
          'Pasien melaporkan sering mengonsumsi gorengan saat rapat kerja. Diberikan edukasi meal prepping sederhana.',
          'Pantau asupan sodium dan anjurkan botol air minum 2L di meja kerja.',
          'High', '2026-09-15 09:10:00'
        ]
      ];

      for (const e of evaluations) {
        await connection.query(
          `INSERT INTO admin_evaluations (id, assessment_id, user_id, admin_id, evaluation_notes, clinical_recommendation, adjusted_risk_level, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          e
        );
      }
    }

    // 7. Check System Configurations
    const [configRows] = await connection.query('SELECT COUNT(*) as count FROM system_configurations');
    if (configRows[0].count === 0) {
      console.log('Seeding system configurations...');
      const configs = [
        [
          'threshold_who_bmi',
          JSON.stringify({
            insufficient_weight: 18.5,
            normal_weight_min: 18.5,
            normal_weight_max: 24.9,
            overweight_min: 25.0,
            overweight_max: 29.9,
            obesity_1_min: 30.0,
            obesity_1_max: 34.9,
            obesity_2_min: 35.0,
            obesity_2_max: 39.9,
            obesity_3_min: 40.0
          }),
          'Standard WHO BMI Classification Thresholds',
          1
        ],
        [
          'variable_mappings',
          JSON.stringify({
            faf: [
              { code: 0, hours: '0 jam', label: 'Sedentary (Tidak pernah)' },
              { code: 1, hours: '1-2 jam', label: 'Aktivitas Ringan' },
              { code: 2, hours: '3-4 jam', label: 'Aktivitas Sedang' },
              { code: 3, hours: '5+ jam', label: 'Aktivitas Berat / Atlet' }
            ],
            tue: [
              { code: 0, hours: '≤ 2 jam', label: 'Rendah (Ideal)' },
              { code: 1, hours: '3-5 jam', label: 'Sedang' },
              { code: 2, hours: '> 5 jam', label: 'Tinggi (Beresiko)' }
            ],
            fcvc: [
              { code: 1, label: 'Jarang (Never / Rarely)' },
              { code: 2, label: 'Kadang-kadang (Sometimes)' },
              { code: 3, label: 'Setiap Waktu Makan (Always)' }
            ]
          }),
          'Questionnaire Discrete Scale Mappings to UCI format',
          1
        ],
        [
          'ffq_window_settings',
          JSON.stringify({
            window_days: 14,
            min_days_required: 10,
            allow_missed_day_recovery: true
          }),
          'Food Frequency Questionnaire (FFQ) Monitoring Cycle Settings',
          1
        ]
      ];

      for (const cfg of configs) {
        await connection.query(
          `INSERT INTO system_configurations (config_key, config_value, description, last_modified_by)
           VALUES (?, ?, ?, ?)`,
          cfg
        );
      }
    }

    // 8. Check Audit Logs
    const [auditRows] = await connection.query('SELECT COUNT(*) as count FROM audit_logs');
    if (auditRows[0].count === 0) {
      console.log('Seeding audit logs...');
      const auditLogs = [
        [
          601, 1, 'Dr. Sarah Amalia, Sp.GK', 'superadmin@obsense.com', 'LOGIN', 'Admin', '1',
          JSON.stringify({ status: 'SUCCESS', method: 'password_auth' }),
          '192.168.1.10', 'Mozilla/5.0', '2026-09-15 10:15:00'
        ],
        [
          602, 2, 'Budi Santoso, S.Gz', 'admin@obsense.com', 'EVALUATE', 'Assessment', '403',
          JSON.stringify({
            before: { evaluation_count: 0 },
            after: { evaluation_count: 1, note: 'Pasien melaporkan sering mengonsumsi gorengan...' }
          }),
          '192.168.1.14', 'Mozilla/5.0', '2026-09-15 09:10:00'
        ],
        [
          603, 1, 'Dr. Sarah Amalia, Sp.GK', 'superadmin@obsense.com', 'UPDATE_CONFIG', 'Config', 'threshold_who_bmi',
          JSON.stringify({
            before: { obesity_3_min: 40.5 },
            after: { obesity_3_min: 40.0 }
          }),
          '192.168.1.10', 'Mozilla/5.0', '2026-09-12 16:30:00'
        ],
        [
          604, 2, 'Budi Santoso, S.Gz', 'admin@obsense.com', 'UPDATE_USER', 'User', '101',
          JSON.stringify({
            before: { weight: 124.0, bmi: 41.9 },
            after: { weight: 122.5, bmi: 41.4 }
          }),
          '192.168.1.14', 'Mozilla/5.0', '2026-09-10 11:20:00'
        ],
        [
          605, 1, 'Dr. Sarah Amalia, Sp.GK', 'superadmin@obsense.com', 'EXPORT_DATA', 'DailyLog', 'ALL',
          JSON.stringify({ format: 'CSV', record_count: 14 }),
          '192.168.1.10', 'Mozilla/5.0', '2026-09-08 14:00:00'
        ]
      ];

      for (const log of auditLogs) {
        await connection.query(
          `INSERT INTO audit_logs (id, admin_id, admin_name, admin_email, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          log
        );
      }
    }

    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

module.exports = { seedDatabase };
