/**
 * OBSENSE MOCK DATASET
 * Berisi dataset realistis untuk 7 kelas obesitas (UCI standard), data antropometri 10+ user,
 * log harian 14 hari, siklus agregasi, asesmen ML, evaluasi klinis admin, konfigurasi, dan audit log.
 */

export const INITIAL_ADMINS = [
  {
    id: 1,
    name: 'Dr. Sarah Amalia, Sp.GK (Super Admin)',
    email: 'superadmin@obsense.com',
    role: 'super_admin',
    is_active: true,
    last_login_at: '2026-09-15 10:15:00',
    created_at: '2026-01-10 08:00:00'
  },
  {
    id: 2,
    name: 'Budi Santoso, S.Gz (Admin Klinis)',
    email: 'admin@obsense.com',
    role: 'admin',
    is_active: true,
    last_login_at: '2026-09-15 09:30:00',
    created_at: '2026-02-01 09:00:00'
  },
  {
    id: 3,
    name: 'Rian Pratama, S.Kom (Data Operator)',
    email: 'operator@obsense.com',
    role: 'admin',
    is_active: false,
    last_login_at: '2026-09-01 14:20:00',
    created_at: '2026-03-15 11:30:00'
  }
];

export const OBESITY_CLASSES = [
  { key: 'Insufficient_Weight', label: 'Insufficient Weight', color: '#38bdf8', risk: 'Low', bmiRange: '< 18.5' },
  { key: 'Normal_Weight', label: 'Normal Weight', color: '#10b981', risk: 'Low', bmiRange: '18.5 - 24.9' },
  { key: 'Overweight_Level_I', label: 'Overweight Level I', color: '#f59e0b', risk: 'Moderate', bmiRange: '25.0 - 27.4' },
  { key: 'Overweight_Level_II', label: 'Overweight Level II', color: '#f97316', risk: 'Moderate', bmiRange: '27.5 - 29.9' },
  { key: 'Obesity_Type_I', label: 'Obesity Type I', color: '#ef4444', risk: 'High', bmiRange: '30.0 - 34.9' },
  { key: 'Obesity_Type_II', label: 'Obesity Type II', color: '#dc2626', risk: 'High', bmiRange: '35.0 - 39.9' },
  { key: 'Obesity_Type_III', label: 'Obesity Type III', color: '#991b1b', risk: 'Critical', bmiRange: '≥ 40.0' },
];

export const INITIAL_USERS = [
  {
    id: 101,
    name: 'Dimas Prasetyo',
    email: 'dimas.prasetyo@email.com',
    phone: '081234567801',
    gender: 'Male',
    age: 24,
    height: 172,
    weight: 122.5,
    bmi: 41.4,
    obesity_class: 'Obesity_Type_III',
    risk_level: 'Critical',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-01 10:00:00',
    cycle_count: 2
  },
  {
    id: 102,
    name: 'Anisa Rahmawati',
    email: 'anisa.rahma@email.com',
    phone: '081234567802',
    gender: 'Female',
    age: 28,
    height: 158,
    weight: 52.0,
    bmi: 20.8,
    obesity_class: 'Normal_Weight',
    risk_level: 'Low',
    family_history_with_overweight: false,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-05 11:30:00',
    cycle_count: 1
  },
  {
    id: 103,
    name: 'Rizky Firmansyah',
    email: 'rizky.f@email.com',
    phone: '081234567803',
    gender: 'Male',
    age: 32,
    height: 168,
    weight: 96.0,
    bmi: 34.0,
    obesity_class: 'Obesity_Type_I',
    risk_level: 'High',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-10 14:15:00',
    cycle_count: 2
  },
  {
    id: 104,
    name: 'Nadia Safitri',
    email: 'nadia.safitri@email.com',
    phone: '081234567804',
    gender: 'Female',
    age: 22,
    height: 165,
    weight: 73.5,
    bmi: 27.0,
    obesity_class: 'Overweight_Level_I',
    risk_level: 'Moderate',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-12 09:00:00',
    cycle_count: 1
  },
  {
    id: 105,
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@email.com',
    phone: '081234567805',
    gender: 'Male',
    age: 35,
    height: 175,
    weight: 114.0,
    bmi: 37.2,
    obesity_class: 'Obesity_Type_II',
    risk_level: 'High',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-15 16:45:00',
    cycle_count: 2
  },
  {
    id: 106,
    name: 'Lestari Wulandari',
    email: 'lestari.w@email.com',
    phone: '081234567806',
    gender: 'Female',
    age: 20,
    height: 160,
    weight: 44.0,
    bmi: 17.2,
    obesity_class: 'Insufficient_Weight',
    risk_level: 'Low',
    family_history_with_overweight: false,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-20 08:30:00',
    cycle_count: 1
  },
  {
    id: 107,
    name: 'Bayu Aditya',
    email: 'bayu.aditya@email.com',
    phone: '081234567807',
    gender: 'Male',
    age: 29,
    height: 170,
    weight: 84.0,
    bmi: 29.1,
    obesity_class: 'Overweight_Level_II',
    risk_level: 'Moderate',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-22 13:20:00',
    cycle_count: 1
  },
  {
    id: 108,
    name: 'Maya Indah Permata',
    email: 'maya.indah@email.com',
    phone: '081234567808',
    gender: 'Female',
    age: 26,
    height: 155,
    weight: 56.0,
    bmi: 23.3,
    obesity_class: 'Normal_Weight',
    risk_level: 'Low',
    family_history_with_overweight: false,
    status: 'inactive',
    deleted_at: null,
    created_at: '2026-08-25 15:10:00',
    cycle_count: 1
  },
  {
    id: 109,
    name: 'Hendra Gunawan',
    email: 'hendra.g@email.com',
    phone: '081234567809',
    gender: 'Male',
    age: 40,
    height: 165,
    weight: 98.0,
    bmi: 36.0,
    obesity_class: 'Obesity_Type_II',
    risk_level: 'High',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-08-28 10:40:00',
    cycle_count: 2
  },
  {
    id: 110,
    name: 'Tiara Citra',
    email: 'tiara.citra@email.com',
    phone: '081234567810',
    gender: 'Female',
    age: 23,
    height: 162,
    weight: 71.0,
    bmi: 27.1,
    obesity_class: 'Overweight_Level_I',
    risk_level: 'Moderate',
    family_history_with_overweight: true,
    status: 'active',
    deleted_at: null,
    created_at: '2026-09-01 11:00:00',
    cycle_count: 1
  },
  {
    id: 111,
    name: 'Bambang Kusuma (Deleted)',
    email: 'bambang.k@email.com',
    phone: '081234567811',
    gender: 'Male',
    age: 45,
    height: 167,
    weight: 88.0,
    bmi: 31.6,
    obesity_class: 'Obesity_Type_I',
    risk_level: 'High',
    family_history_with_overweight: false,
    status: 'inactive',
    deleted_at: '2026-09-10 14:00:00',
    created_at: '2026-07-15 09:00:00',
    cycle_count: 1
  }
];

export const INITIAL_ASSESSMENT_CYCLES = [
  {
    id: 201,
    user_id: 101,
    userName: 'Dimas Prasetyo',
    cycle_number: 2,
    start_date: '2026-08-16',
    end_date: '2026-08-29',
    status: 'completed',
    completion_rate: 100.0,
    aggregated_features: {
      faf_mean: 0.28,
      tue_mean: 1.85,
      fcvc_mode: 1,
      favc_ratio: 0.86,
      ch2o_mean: 1.2
    },
    created_at: '2026-08-16 08:00:00'
  },
  {
    id: 202,
    user_id: 102,
    userName: 'Anisa Rahmawati',
    cycle_number: 1,
    start_date: '2026-08-18',
    end_date: '2026-08-31',
    status: 'completed',
    completion_rate: 100.0,
    aggregated_features: {
      faf_mean: 2.14,
      tue_mean: 0.42,
      fcvc_mode: 3,
      favc_ratio: 0.14,
      ch2o_mean: 2.4
    },
    created_at: '2026-08-18 08:00:00'
  },
  {
    id: 203,
    user_id: 103,
    userName: 'Rizky Firmansyah',
    cycle_number: 2,
    start_date: '2026-09-01',
    end_date: '2026-09-14',
    status: 'completed',
    completion_rate: 100.0,
    aggregated_features: {
      faf_mean: 0.71,
      tue_mean: 1.57,
      fcvc_mode: 2,
      favc_ratio: 0.71,
      ch2o_mean: 1.6
    },
    created_at: '2026-09-01 08:00:00'
  },
  {
    id: 204,
    user_id: 105,
    userName: 'Fajar Nugraha',
    cycle_number: 2,
    start_date: '2026-09-05',
    end_date: '2026-09-18',
    status: 'in_progress',
    completion_rate: 71.4,
    aggregated_features: {
      faf_mean: 0.5,
      tue_mean: 1.7,
      fcvc_mode: 1,
      favc_ratio: 0.8,
      ch2o_mean: 1.4
    },
    created_at: '2026-09-05 08:00:00'
  }
];

// 14 Hari log harian untuk user Dimas Prasetyo (User 101, Cycle 201)
export const INITIAL_DAILY_LOGS = [
  { id: 301, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-16', day_number: 1, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.2, caec: 'Always', scc: false, calc: 'no', mtrans: 'Public_Transportation', notes: 'Banyak duduk di kantor, makan gorengan sore' },
  { id: 302, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-17', day_number: 2, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.0, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Public_Transportation', notes: 'Lembur sampai malam' },
  { id: 303, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-18', day_number: 3, faf: 1, tue: 2, fcvc: 2, favc: false, ch2o: 1.5, caec: 'Sometimes', scc: false, calc: 'no', mtrans: 'Walking', notes: 'Jalan santai 15 menit' },
  { id: 304, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-19', day_number: 4, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.0, caec: 'Always', scc: false, calc: 'no', mtrans: 'Automobile', notes: 'Fast food siang hari' },
  { id: 305, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-20', day_number: 5, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.2, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Automobile', notes: 'Kurang tidur' },
  { id: 306, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-21', day_number: 6, faf: 1, tue: 1, fcvc: 2, favc: true, ch2o: 1.5, caec: 'Sometimes', scc: false, calc: 'no', mtrans: 'Walking', notes: 'Akhir pekan' },
  { id: 307, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-22', day_number: 7, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.0, caec: 'Always', scc: false, calc: 'no', mtrans: 'Automobile', notes: 'Makan di luar keluarga' },
  { id: 308, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-23', day_number: 8, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.2, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Automobile', notes: 'Main game 6 jam' },
  { id: 309, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-24', day_number: 9, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.0, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Public_Transportation', notes: 'Senin sibuk' },
  { id: 310, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-25', day_number: 10, faf: 1, tue: 1, fcvc: 2, favc: false, ch2o: 1.8, caec: 'Sometimes', scc: false, calc: 'no', mtrans: 'Walking', notes: 'Makan sup sayur' },
  { id: 311, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-26', day_number: 11, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.1, caec: 'Always', scc: false, calc: 'no', mtrans: 'Public_Transportation', notes: 'Kopi manis 2 gelas' },
  { id: 312, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-27', day_number: 12, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.3, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Public_Transportation', notes: 'Ngantuk sore hari' },
  { id: 313, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-28', day_number: 13, faf: 1, tue: 2, fcvc: 1, favc: true, ch2o: 1.2, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Walking', notes: 'Jalan sore' },
  { id: 314, cycle_id: 201, user_id: 101, userName: 'Dimas Prasetyo', log_date: '2026-08-29', day_number: 14, faf: 0, tue: 2, fcvc: 1, favc: true, ch2o: 1.0, caec: 'Always', scc: false, calc: 'no', mtrans: 'Automobile', notes: 'Siklus 14 hari selesai' },
  
  // Log sample user lain
  { id: 315, cycle_id: 202, user_id: 102, userName: 'Anisa Rahmawati', log_date: '2026-08-18', day_number: 1, faf: 2, tue: 0, fcvc: 3, favc: false, ch2o: 2.5, caec: 'Sometimes', scc: true, calc: 'no', mtrans: 'Walking', notes: 'Jogging pagi 30 menit, sarapan oatmeal' },
  { id: 316, cycle_id: 202, user_id: 102, userName: 'Anisa Rahmawati', log_date: '2026-08-19', day_number: 2, faf: 2, tue: 1, fcvc: 3, favc: false, ch2o: 2.3, caec: 'Sometimes', scc: true, calc: 'no', mtrans: 'Walking', notes: 'Bawa bekal salad' },
  { id: 317, cycle_id: 203, user_id: 103, userName: 'Rizky Firmansyah', log_date: '2026-09-01', day_number: 1, faf: 1, tue: 2, fcvc: 2, favc: true, ch2o: 1.5, caec: 'Frequently', scc: false, calc: 'no', mtrans: 'Motorbike', notes: 'Naik motor ke kantor' }
];

export const INITIAL_ASSESSMENTS = [
  {
    id: 401,
    cycle_id: 201,
    user_id: 101,
    userName: 'Dimas Prasetyo',
    bmi: 41.4,
    obesity_class: 'Obesity_Type_III',
    risk_level: 'Critical',
    probability_scores: {
      Insufficient_Weight: 0.001,
      Normal_Weight: 0.005,
      Overweight_Level_I: 0.012,
      Overweight_Level_II: 0.022,
      Obesity_Type_I: 0.060,
      Obesity_Type_II: 0.180,
      Obesity_Type_III: 0.720
    },
    recommendations: [
      'Konsultasi segera ke dokter spesialis gizi klinik dan dokter penyakit dalam.',
      'Target penurunan berat badan bertahap 5-10% dalam 6 bulan.',
      'Kurangi screen time (TUE) dan tingkatkan aktivitas fisik ringan secara berkala.',
      'Pola makan rendah kalori seimbang, batasi gula, garam, dan minyak (GGL).'
    ],
    model_version: 'obsense-rf-v1.2',
    assessment_date: '2026-08-30',
    deleted_at: null,
    created_at: '2026-08-30 09:15:00'
  },
  {
    id: 402,
    cycle_id: 202,
    user_id: 102,
    userName: 'Anisa Rahmawati',
    bmi: 20.8,
    obesity_class: 'Normal_Weight',
    risk_level: 'Low',
    probability_scores: {
      Insufficient_Weight: 0.040,
      Normal_Weight: 0.880,
      Overweight_Level_I: 0.060,
      Overweight_Level_II: 0.010,
      Obesity_Type_I: 0.005,
      Obesity_Type_II: 0.003,
      Obesity_Type_III: 0.002
    },
    recommendations: [
      'Pertahankan gaya hidup sehat dan konsumsi sayur-buah yang rutin.',
      'Lanjutkan olahraga teratur minimal 150 menit per minggu.'
    ],
    model_version: 'obsense-rf-v1.2',
    assessment_date: '2026-09-01',
    deleted_at: null,
    created_at: '2026-09-01 10:00:00'
  },
  {
    id: 403,
    cycle_id: 203,
    user_id: 103,
    userName: 'Rizky Firmansyah',
    bmi: 34.0,
    obesity_class: 'Obesity_Type_I',
    risk_level: 'High',
    probability_scores: {
      Insufficient_Weight: 0.002,
      Normal_Weight: 0.018,
      Overweight_Level_I: 0.080,
      Overweight_Level_II: 0.150,
      Obesity_Type_I: 0.650,
      Obesity_Type_II: 0.090,
      Obesity_Type_III: 0.010
    },
    recommendations: [
      'Tingkatkan konsumsi air putih (CH2O) minimal 2 liter/hari.',
      'Kurangi konsumsi makanan berkalori tinggi (FAVC) dan cemilan tinggi lemak.',
      'Jadwalkan aktivitas fisik sedang (FAF level 2).'
    ],
    model_version: 'obsense-rf-v1.2',
    assessment_date: '2026-09-15',
    deleted_at: null,
    created_at: '2026-09-15 08:30:00'
  }
];

export const INITIAL_ADMIN_EVALUATIONS = [
  {
    id: 501,
    assessment_id: 401,
    user_id: 101,
    userName: 'Dimas Prasetyo',
    admin_id: 1,
    adminName: 'Dr. Sarah Amalia, Sp.GK',
    evaluation_notes: 'Pasien memiliki BMI 41.4 dengan riwayat hipertensi ringan. Disarankan pemeriksaan lab lipid profile dan HbA1c.',
    clinical_recommendation: 'Diet defisit kalori 500 kkal/hari diawasi, latihan aerobik low-impact (jalan santai/renang) untuk mengurangi beban sendi lutut.',
    adjusted_risk_level: 'Critical',
    created_at: '2026-08-31 11:20:00'
  },
  {
    id: 502,
    assessment_id: 401,
    user_id: 101,
    userName: 'Dimas Prasetyo',
    admin_id: 2,
    adminName: 'Budi Santoso, S.Gz',
    evaluation_notes: 'Evaluasi mingguan: Pasien berhasil menurunkan konsumsi minuman manis dari 3 gelas menjadi 1 gelas per hari.',
    clinical_recommendation: 'Berikan apresiasi dan dorong substitusi camilan dengan potongan buah berair tinggi serat.',
    adjusted_risk_level: 'High',
    created_at: '2026-09-07 14:45:00'
  },
  {
    id: 503,
    assessment_id: 403,
    user_id: 103,
    userName: 'Rizky Firmansyah',
    admin_id: 2,
    adminName: 'Budi Santoso, S.Gz',
    evaluation_notes: 'Pasien melaporkan sering mengonsumsi gorengan saat rapat kerja. Diberikan edukasi meal prepping sederhana.',
    clinical_recommendation: 'Pantau asupan sodium dan anjurkan botol air minum 2L di meja kerja.',
    adjusted_risk_level: 'High',
    created_at: '2026-09-15 09:10:00'
  }
];

export const INITIAL_CONFIGURATIONS = {
  threshold_who_bmi: {
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
  },
  variable_mappings: {
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
  },
  ffq_window: {
    window_days: 14,
    min_days_required: 10,
    allow_missed_day_recovery: true
  },
  audit_info: {
    last_modified_by: 'Dr. Sarah Amalia, Sp.GK',
    last_modified_at: '2026-09-12 16:30:00'
  }
};

export const INITIAL_AUDIT_LOGS = [
  {
    id: 601,
    admin_name: 'Dr. Sarah Amalia, Sp.GK',
    admin_email: 'superadmin@obsense.com',
    action: 'LOGIN',
    entity_type: 'Admin',
    entity_id: '1',
    ip_address: '192.168.1.10',
    details: { status: 'SUCCESS', method: 'password_auth' },
    created_at: '2026-09-15 10:15:00'
  },
  {
    id: 602,
    admin_name: 'Budi Santoso, S.Gz',
    admin_email: 'admin@obsense.com',
    action: 'EVALUATE',
    entity_type: 'Assessment',
    entity_id: '403',
    ip_address: '192.168.1.14',
    details: {
      before: { evaluation_count: 0 },
      after: { evaluation_count: 1, note: 'Pasien melaporkan sering mengonsumsi gorengan...' }
    },
    created_at: '2026-09-15 09:10:00'
  },
  {
    id: 603,
    admin_name: 'Dr. Sarah Amalia, Sp.GK',
    admin_email: 'superadmin@obsense.com',
    action: 'UPDATE_CONFIG',
    entity_type: 'Config',
    entity_id: 'threshold_who_bmi',
    ip_address: '192.168.1.10',
    details: {
      before: { obesity_3_min: 40.5 },
      after: { obesity_3_min: 40.0 }
    },
    created_at: '2026-09-12 16:30:00'
  },
  {
    id: 604,
    admin_name: 'Budi Santoso, S.Gz',
    admin_email: 'admin@obsense.com',
    action: 'UPDATE_USER',
    entity_type: 'User',
    entity_id: '101',
    ip_address: '192.168.1.14',
    details: {
      before: { weight: 124.0, bmi: 41.9 },
      after: { weight: 122.5, bmi: 41.4 }
    },
    created_at: '2026-09-10 11:20:00'
  },
  {
    id: 605,
    admin_name: 'Dr. Sarah Amalia, Sp.GK',
    admin_email: 'superadmin@obsense.com',
    action: 'EXPORT_DATA',
    entity_type: 'DailyLog',
    entity_id: 'ALL',
    ip_address: '192.168.1.10',
    details: { format: 'CSV', record_count: 14 },
    created_at: '2026-09-08 14:00:00'
  },
  {
    id: 606,
    admin_name: 'System Security',
    admin_email: 'hacker@unknown.com',
    action: 'LOGIN_ATTEMPT',
    entity_type: 'Security',
    entity_id: 'N/A',
    ip_address: '103.22.44.11',
    details: { status: 'FAILED', reason: 'Invalid credentials', email_tried: 'root@obsense.com' },
    created_at: '2026-09-05 02:40:11'
  }
];

export const INITIAL_LOGIN_ATTEMPTS = [
  { id: 1, email: 'superadmin@obsense.com', status: 'SUCCESS', ip: '192.168.1.10', timestamp: '2026-09-15 10:15:00', user_agent: 'Chrome / Windows 11' },
  { id: 2, email: 'admin@obsense.com', status: 'SUCCESS', ip: '192.168.1.14', timestamp: '2026-09-15 09:30:00', user_agent: 'Chrome / Windows 11' },
  { id: 3, email: 'operator@obsense.com', status: 'FAILED', ip: '192.168.1.20', timestamp: '2026-09-14 18:22:00', user_agent: 'Firefox / MacOS' },
  { id: 4, email: 'unknown@test.com', status: 'FAILED', ip: '103.22.44.11', timestamp: '2026-09-14 03:10:00', user_agent: 'Python-requests/2.28' },
  { id: 5, email: 'superadmin@obsense.com', status: 'SUCCESS', ip: '192.168.1.10', timestamp: '2026-09-13 08:45:00', user_agent: 'Chrome / Windows 11' }
];

export const FEATURE_IMPORTANCE_DATA = [
  { feature: 'Weight (Berat Badan)', weight: 0.32, category: 'Antropometri' },
  { feature: 'Age (Usia)', weight: 0.18, category: 'Demografi' },
  { feature: 'FAF (Aktivitas Fisik)', weight: 0.14, category: 'Gaya Hidup' },
  { feature: 'FCVC (Frekuensi Sayur)', weight: 0.12, category: 'Pola Makan' },
  { feature: 'FAVC (Makanan Tinggi Kalori)', weight: 0.09, category: 'Pola Makan' },
  { feature: 'CH2O (Konsumsi Air)', weight: 0.06, category: 'Pola Makan' },
  { feature: 'TUE (Screen Time)', weight: 0.05, category: 'Gaya Hidup' },
  { feature: 'CAEC (Camilan)', weight: 0.04, category: 'Pola Makan' }
];

export const CORRELATION_MATRIX_DATA = [
  { feature: 'FAF (Aktivitas Fisik)', correlationWithObesity: -0.68, impact: 'Protektif Tinggi', notes: 'Makin tinggi aktivitas fisik, makin rendah risiko obesitas' },
  { feature: 'TUE (Screen Time)', correlationWithObesity: 0.54, impact: 'Faktor Risiko', notes: 'Screen time tinggi berkorelasi positif dengan obesitas tipe II & III' },
  { feature: 'FCVC (Konsumsi Sayur)', correlationWithObesity: -0.61, impact: 'Protektif Tinggi', notes: 'Konsumsi sayur tiap waktu makan menurunkan BMI' },
  { feature: 'FAVC (Makanan Tinggi Kalori)', correlationWithObesity: 0.72, impact: 'Faktor Risiko Utama', notes: 'Konsumsi junk food/gorengan rutin pendorong utama obesitas' }
];

export const RISK_TREND_DATA = [
  { period: 'Minggu 1', low: 2, moderate: 3, high: 4, critical: 1 },
  { period: 'Minggu 2', low: 3, moderate: 3, high: 3, critical: 1 },
  { period: 'Minggu 3', low: 3, moderate: 4, high: 3, critical: 1 },
  { period: 'Minggu 4', low: 4, moderate: 3, high: 2, critical: 1 },
  { period: 'Minggu 5', low: 4, moderate: 3, high: 2, critical: 1 },
  { period: 'Minggu 6', low: 5, moderate: 3, high: 2, critical: 0 }
];
