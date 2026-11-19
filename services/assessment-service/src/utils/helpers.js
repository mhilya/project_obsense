const parseJson = (v) => {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch (e) {
      return v;
    }
  }
  return v;
};

const todayStr = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

// Selisih hari antara dua string 'YYYY-MM-DD' (b - a)
const diffDays = (a, b) => {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000);
};

const isDateStr = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

module.exports = { parseJson, todayStr, diffDays, isDateStr };
