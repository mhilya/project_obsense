module.exports = [
  {
    config_key: 'threshold_who_bmi',
    config_value: {
      insufficient_weight: 18.5,
      normal_weight_min: 18.5,
      normal_weight_max: 24.9,
      overweight_min: 25.0,
      overweight_max: 29.9,
      obesity_1_min: 30.0,
      obesity_1_max: 34.9,
      obesity_2_min: 35.0,
      obesity_2_max: 39.9,
      obesity_3_min: 40.0,
    },
    description: 'Ambang batas klasifikasi BMI standar WHO',
    last_modified_by: 'System',
  },
  {
    config_key: 'variable_mappings',
    config_value: {
      faf: [
        { code: 0, hours: '0 jam', label: 'Sedentary (Tidak pernah)' },
        { code: 1, hours: '1-2 jam', label: 'Aktivitas Ringan' },
        { code: 2, hours: '3-4 jam', label: 'Aktivitas Sedang' },
        { code: 3, hours: '5+ jam', label: 'Aktivitas Berat / Atlet' },
      ],
      tue: [
        { code: 0, hours: '≤ 2 jam', label: 'Rendah (Ideal)' },
        { code: 1, hours: '3-5 jam', label: 'Sedang' },
        { code: 2, hours: '> 5 jam', label: 'Tinggi (Beresiko)' },
      ],
      fcvc: [
        { code: 1, label: 'Jarang (Never / Rarely)' },
        { code: 2, label: 'Kadang-kadang (Sometimes)' },
        { code: 3, label: 'Setiap Waktu Makan (Always)' },
      ],
    },
    description: 'Pemetaan skala diskret kuesioner (FAF, TUE, FCVC)',
    last_modified_by: 'System',
  },
  {
    config_key: 'ffq_window',
    config_value: {
      window_days: 14,
      min_days_required: 10,
      allow_missed_day_recovery: true,
    },
    description: 'Pengaturan periode siklus Food Frequency Questionnaire (FFQ)',
    last_modified_by: 'System',
  },
];
