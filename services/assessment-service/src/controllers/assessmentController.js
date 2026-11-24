const { pool } = require('../config/db');
const { resolveUserId } = require('../middleware/accessMiddleware');
const { parseJson, todayStr, isDateStr } = require('../utils/helpers');

const CLASSES = [
  'Insufficient_Weight', 'Normal_Weight', 'Overweight_Level_I', 'Overweight_Level_II',
  'Obesity_Type_I', 'Obesity_Type_II', 'Obesity_Type_III',
];
const RISKS = ['Low', 'Moderate', 'High', 'Critical'];

const USER_SERVICE_URL = () => process.env.USER_SERVICE_URL || 'http://localhost:4002';
const PREDICTION_SERVICE_URL = () => process.env.PREDICTION_SERVICE_URL || 'http://localhost:5001';

const fmt = (a) => ({
  ...a,
  bmi: a.bmi === null || a.bmi === undefined ? null : Number(a.bmi),
  probability_scores: parseJson(a.probability_scores),
  recommendations: parseJson(a.recommendations),
  lifestyle_prediction: parseJson(a.lifestyle_prediction),
  shap_factors: parseJson(a.shap_factors),
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
         (cycle_id, user_id, bmi, obesity_class, probability_scores, risk_level, recommendations, lifestyle_prediction, shap_factors, model_version, assessment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.cycle_id, userId, b.bmi !== undefined && b.bmi !== null ? Number(b.bmi) : null, b.obesity_class,
        JSON.stringify(b.probability_scores || {}), risk,
        JSON.stringify(b.recommendations || []),
        b.lifestyle_prediction ? JSON.stringify(b.lifestyle_prediction) : null,
        b.shap_factors ? JSON.stringify(b.shap_factors) : null,
        b.model_version || 'manual', assessmentDate,
      ]
    );
    const [saved] = await pool.query('SELECT * FROM assessments WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Asesmen berhasil disimpan.', data: fmt(saved[0]) });
  } catch (err) {
    console.error('createAssessment error:', err);
    return res.status(500).json({ message: 'Gagal membuat data asesmen.' });
  }
};

// POST /api/assessments/predict
// Komunikasi antar-service: mengambil profil (user-service) + agregasi siklus (assessment_db),
// memanggil prediction-service (:5001), lalu menyimpan hasilnya ke tabel assessments.
exports.predictAssessment = async (req, res) => {
  try {
    const { userId: resolvedUserId, error } = resolveUserId(req);
    if (error) return res.status(error.status).json({ message: error.message });

    const b = req.body || {};
    let cycle;

    if (b.cycle_id) {
      const [rows] = await pool.query('SELECT * FROM assessment_cycles WHERE id = ?', [b.cycle_id]);
      cycle = rows[0];
    } else if (resolvedUserId) {
      const [rows] = await pool.query(
        'SELECT * FROM assessment_cycles WHERE user_id = ? ORDER BY cycle_number DESC LIMIT 1',
        [resolvedUserId]
      );
      cycle = rows[0];
    } else {
      return res.status(400).json({ message: 'cycle_id atau user_id wajib diisi.' });
    }

    if (!cycle) {
      return res.status(404).json({ message: 'Siklus pemantauan tidak ditemukan. Mulai siklus terlebih dahulu.' });
    }

    const targetUserId = cycle.user_id;
    if (req.user.type === 'user' && targetUserId !== req.user.id) {
      return res.status(403).json({ message: 'Anda hanya dapat memprediksi siklus milik sendiri.' });
    }

    const agg = parseJson(cycle.aggregated_features) || {};

    // Ambil profil pasien dari user-service (teruskan Bearer token)
    let profile = {};
    try {
      const profilePath = req.user.type === 'user' ? '/api/users/me' : `/api/users/${targetUserId}`;
      const userRes = await fetch(`${USER_SERVICE_URL()}${profilePath}`, {
        headers: { Authorization: req.headers.authorization || '' },
      });
      if (userRes.ok) {
        const userJson = await userRes.json();
        profile = userJson.data || {};
      }
    } catch (e) {
      console.warn('predictAssessment: user-service tidak dapat dihubungi, memakai override body jika ada:', e.message);
    }

    const mlPayload = {
      gender: b.gender ?? profile.gender ?? 'Male',
      age: b.age ?? profile.age ?? 25,
      height: b.height !== undefined ? b.height : profile.height,
      weight: b.weight !== undefined ? b.weight : profile.weight,
      family_history_with_overweight:
        b.family_history_with_overweight ?? profile.family_history_with_overweight ?? false,
      smoke: b.smoke ?? profile.smoke ?? false,
      faf: b.faf ?? agg.faf_mean ?? 1,
      tue: b.tue ?? agg.tue_mean ?? 1,
      fcvc: b.fcvc ?? agg.fcvc_mode ?? 2,
      ncp: b.ncp ?? agg.ncp_mean ?? 3,
      favc: b.favc ?? agg.favc_ratio ?? false,
      ch2o: b.ch2o ?? agg.ch2o_mean ?? 2,
      caec: b.caec ?? agg.caec_mode ?? 'Sometimes',
      scc: b.scc ?? agg.scc_mode ?? false,
      calc: b.calc ?? agg.calc_mode ?? 'no',
      mtrans: b.mtrans ?? agg.mtrans_mode ?? 'Public_Transportation',
    };

    // Panggil prediction-service (Python ML)
    let mlRes;
    try {
      mlRes = await fetch(`${PREDICTION_SERVICE_URL()}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
      });
    } catch (e) {
      return res.status(502).json({
        message: 'prediction-service tidak tersedia. Pastikan service ML berjalan di port 5001.',
        detail: e.message,
      });
    }

    const mlJson = await mlRes.json().catch(() => ({}));
    if (!mlRes.ok || !mlJson.data) {
      return res.status(mlRes.status >= 400 ? mlRes.status : 502).json({
        message: mlJson.message || 'Gagal menjalankan inferensi pada prediction-service.',
      });
    }

    const pred = mlJson.data;
    const primary = pred.scenario_a_full?.available ? pred.scenario_a_full : pred.scenario_b_lifestyle;
    const assessmentDate = isDateStr(b.assessment_date) ? b.assessment_date : todayStr();

    const [result] = await pool.query(
      `INSERT INTO assessments
         (cycle_id, user_id, bmi, obesity_class, probability_scores, risk_level, recommendations, lifestyle_prediction, shap_factors, model_version, assessment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cycle.id,
        targetUserId,
        pred.bmi,
        primary.obesity_class,
        JSON.stringify(primary.probability_scores || {}),
        primary.risk_level,
        JSON.stringify(pred.recommendations || []),
        JSON.stringify(pred.scenario_b_lifestyle || null),
        JSON.stringify(pred.top_shap_factors || []),
        primary.model_version,
        assessmentDate,
      ]
    );

    const [saved] = await pool.query('SELECT * FROM assessments WHERE id = ?', [result.insertId]);
    return res.status(201).json({
      success: true,
      message: 'Prediksi ML berhasil dijalankan dan disimpan.',
      data: fmt(saved[0]),
      prediction: pred,
    });
  } catch (err) {
    console.error('predictAssessment error:', err);
    return res.status(500).json({ message: 'Gagal menjalankan prediksi asesmen.' });
  }
};
