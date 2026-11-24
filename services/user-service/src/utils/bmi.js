// Klasifikasi BMI berbasis aturan WHO (dipakai sebagai fallback sebelum ada hasil prediksi ML)
function classifyBmi(bmi) {
  if (bmi < 18.5) return { obesity_class: 'Insufficient_Weight', risk_level: 'Low' };
  if (bmi < 25.0) return { obesity_class: 'Normal_Weight', risk_level: 'Low' };
  if (bmi < 27.5) return { obesity_class: 'Overweight_Level_I', risk_level: 'Moderate' };
  if (bmi < 30.0) return { obesity_class: 'Overweight_Level_II', risk_level: 'Moderate' };
  if (bmi < 35.0) return { obesity_class: 'Obesity_Type_I', risk_level: 'High' };
  if (bmi < 40.0) return { obesity_class: 'Obesity_Type_II', risk_level: 'High' };
  return { obesity_class: 'Obesity_Type_III', risk_level: 'Critical' };
}

function calcBmi(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const m = h / 100;
  return Number((w / (m * m)).toFixed(1));
}

function calcAge(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

// Terima 'Male'/'Female' maupun 'Laki-laki'/'Perempuan' (form mobile)
function normalizeGender(g) {
  if (!g) return null;
  const v = String(g).trim().toLowerCase();
  if (['male', 'laki-laki', 'laki', 'l', 'pria'].includes(v)) return 'Male';
  if (['female', 'perempuan', 'p', 'wanita'].includes(v)) return 'Female';
  return undefined; // tidak valid
}

module.exports = { classifyBmi, calcBmi, calcAge, normalizeGender };
