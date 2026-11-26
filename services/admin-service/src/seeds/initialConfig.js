module.exports = [
  {
    config_key: "threshold_who_bmi",
    config_value: {
      underweight: 18.5,
      normal: { min: 18.5, max: 24.9 },
      overweight: { min: 25, max: 29.9 },
      obesity_1: { min: 30, max: 34.9 },
      obesity_2: { min: 35, max: 39.9 },
      obesity_3: { min: 40 }
    },
    description: "Threshold BMI menurut standar WHO",
    last_modified_by: "system"
  },
  {
    config_key: "variable_mappings",
    config_value: {
      faf: [
        { code: 0, hours: "0", label: "Tidak aktif" },
        { code: 1, hours: "1-2", label: "Kurang aktif" },
        { code: 2, hours: "3-4", label: "Cukup aktif" },
        { code: 3, hours: "5+", label: "Sangat aktif" }
      ],
      tue: [
        { code: 0, hours: "0-1", label: "Rendah" },
        { code: 1, hours: "2-3", label: "Sedang" },
        { code: 2, hours: "4-5", label: "Tinggi" },
        { code: 3, hours: "6+", label: "Sangat tinggi" }
      ],
      fcvc: [
        { code: 1, label: "1-2 porsi/hari" },
        { code: 2, label: "3-4 porsi/hari" },
        { code: 3, label: "5+ porsi/hari" }
      ]
    },
    description: "Pemetaan variabel untuk kuesioner (FAF, TUE, FCVC)",
    last_modified_by: "system"
  },
  {
    config_key: "ffq_window",
    config_value: {
      window_days: 14,
      min_days_required: 10
    },
    description: "Jendela waktu untuk FFQ (Food Frequency Questionnaire)",
    last_modified_by: "system"
  }
];