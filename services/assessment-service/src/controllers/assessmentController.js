const { pool } = require('../config/db');
const { resolveUserId } = require('../middleware/accessMiddleware');
const { parseJson, todayStr, isDateStr } = require('../utils/helpers');

const CLASSES = [
  'Insufficient_Weight', 'Normal_Weight', 'Overweight_Level_I', 'Overweight_Level_II',
  'Obesity_Type_I', 'Obesity_Type_II', 'Obesity_Type_III',
];
const RISKS = ['Low', 'Moderate', 'High', 'Critical'];

const fmt = (a) => ({
  ...a,
  bmi: Number(a.bmi),
  probability_scores: parseJson(a.probability_scores),
  recommendations: parseJson(a.recommendations),
});

// GET /api/assessments?user_id=&obesity_class=&risk_level=
exports.getAssessments = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req);
    if (error) return res.status(error.status).json({ message: error.message });

    let sql = 'SELECT * FROM assessments WHERE deleted_at IS NULL';
    const params = [];
    if (userId) {
      sql += ' AND user_id = ?';
      params.push(userId);
    }
    if (req.query.obesity_class) {
      sql += ' AND obesity_class = ?';
      params.push(req.query.obesity_class);
    }
    if (req.query.risk_level) {
      sql += ' AND risk_level = ?';
      params.push(req.query.risk_level);
    }
    sql += ' ORDER BY assessment_date DESC, id DESC';

    const [rows] = await pool.query(sql, params);
    const data = rows.map(fmt);
    return res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('getAssessments error:', err);
    return res.status(500).json({ message: 'Gagal memuat data asesmen.' });
  }
};

// GET /api/assessments/:id
exports.getAssessmentById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ? AND deleted_at IS NULL', [req.params.id]);
    const a = rows[0];
    if (!a) return res.status(404).json({ message: 'Asesmen tidak ditemukan.' });
    if (req.user.type === 'user' && a.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Anda hanya dapat mengakses data milik sendiri.' });
    }
    return res.json({ success: true, data: fmt(a) });
  } catch (err) {
    console.error('getAssessmentById error:', err);
    return res.status(500).json({ message: 'Gagal memuat detail asesmen.' });
  }
};

// POST /api/assessments
// Sementara menerima hasil klasifikasi dari klien/admin. Pada Fase 4 hasil ini
// akan dibuat otomatis dengan memanggil prediction-service.
exports.createAssessment = async (req, res) => {
  try {
    const { userId, error } = resolveUserId(req, { required: true });
    if (error) return res.status(error.status).json({ message: error.message });

    const b = req.body;
    if (!b.cycle_id || !b.bmi || !b.obesity_class) {
      return res.status(400).json({ message: 'cycle_id, bmi, dan obesity_class wajib diisi.' });
    }
    if (!CLASSES.includes(b.obesity_class)) {
      return res.status(400).json({ message: `obesity_class harus salah satu dari: ${CLASSES.join(', ')}.` });
    }
    const risk = b.risk_level || 'Low';
    if (!RISKS.includes(risk)) {
      return res.status(400).json({ message: `risk_level harus salah satu dari: ${RISKS.join(', ')}.` });
    }
    const assessmentDate = b.assessment_date === undefined ? todayStr() : b.assessment_date;
    if (!isDateStr(assessmentDate)) {
      return res.status(400).json({ message: 'assessment_date harus berformat YYYY-MM-DD.' });
    }

    const [cycles] = await pool.query('SELECT user_id FROM assessment_cycles WHERE id = ?', [b.cycle_id]);
    if (cycles.length === 0) return res.status(404).json({ message: 'Siklus tidak ditemukan.' });
    if (cycles[0].user_id !== userId) {
      return res.status(403).json({ message: 'Siklus tersebut bukan milik user ini.' });
    }

    const [result] = await pool.query(
      `INSERT INTO assessments
         (cycle_id, user_id, bmi, obesity_class, probability_scores, risk_level, recommendations, model_version, assessment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.cycle_id, userId, Number(b.bmi), b.obesity_class,
        JSON.stringify(b.probability_scores || {}), risk,
        JSON.stringify(b.recommendations || []), b.model_version || 'manual', assessmentDate,
      ]
    );
    const [saved] = await pool.query('SELECT * FROM assessments WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Asesmen berhasil disimpan.', data: fmt(saved[0]) });
  } catch (err) {
    console.error('createAssessment error:', err);
    return res.status(500).json({ message: 'Gagal membuat data asesmen.' });
  }
};
