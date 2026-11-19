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

export const INITIAL_USERS = [];

export const INITIAL_ASSESSMENT_CYCLES = [];

// 14 Hari log harian untuk user Dimas Prasetyo (User 101, Cycle 201)
export const INITIAL_DAILY_LOGS = [];

export const INITIAL_ASSESSMENTS = [];

export const INITIAL_ADMIN_EVALUATIONS = [];

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

export const INITIAL_AUDIT_LOGS = [];

export const INITIAL_LOGIN_ATTEMPTS = [];

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

export const RISK_TREND_DATA = [];
