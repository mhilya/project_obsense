const { pool } = require('../config/db');

// GET ALL ASSESSMENTS
exports.getAssessments = async (req, res) => {
  try {
    const { user_id, obesity_class, risk_level } = req.query;
    let query = `
      SELECT a.*, u.name as userName, u.gender, u.age, u.height, u.weight
      FROM assessments a
      JOIN users u ON a.user_id = u.id
      WHERE a.deleted_at IS NULL
    `;
    const params = [];

    if (user_id) {
      query += ' AND a.user_id = ?';
      params.push(user_id);
    }
    if (obesity_class) {
      query += ' AND a.obesity_class = ?';
      params.push(obesity_class);
    }
    if (risk_level) {
      query += ' AND a.risk_level = ?';
      params.push(risk_level);
    }

    query += ' ORDER BY a.assessment_date DESC, a.id DESC';

    const [rows] = await pool.query(query, params);
    const formatted = rows.map(a => ({
      ...a,
      bmi: Number(a.bmi),
      height: Number(a.height),
      weight: Number(a.weight),
      probability_scores: typeof a.probability_scores === 'string' ? JSON.parse(a.probability_scores) : a.probability_scores,
      recommendations: typeof a.recommendations === 'string' ? JSON.parse(a.recommendations) : a.recommendations
    }));

    return res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    console.error('getAssessments error:', error);
    return res.status(500).json({ message: 'Gagal memuat data asesmen ML.' });
  }
};

// GET ASSESMENT BY ID
exports.getAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT a.*, u.name as userName, u.gender, u.age, u.height, u.weight
       FROM assessments a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data asesmen tidak ditemukan.' });
    }

    const a = rows[0];
    const formatted = {
      ...a,
      bmi: Number(a.bmi),
      height: Number(a.height),
      weight: Number(a.weight),
      probability_scores: typeof a.probability_scores === 'string' ? JSON.parse(a.probability_scores) : a.probability_scores,
      recommendations: typeof a.recommendations === 'string' ? JSON.parse(a.recommendations) : a.recommendations
    };

    return res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('getAssessmentById error:', error);
    return res.status(500).json({ message: 'Gagal memuat detail asesmen.' });
  }
};

// CREATE ASSESMENT
exports.createAssessment = async (req, res) => {
  try {
    const {
      cycle_id, user_id, bmi, obesity_class,
      probability_scores, risk_level, recommendations,
      model_version = 'obsense-rf-v1.2',
      assessment_date = new Date().toISOString().slice(0, 10)
    } = req.body;

    if (!cycle_id || !user_id || !bmi || !obesity_class) {
      return res.status(400).json({ message: 'cycle_id, user_id, bmi, dan obesity_class wajib diisi.' });
    }

    const [result] = await pool.query(
      `INSERT INTO assessments 
       (cycle_id, user_id, bmi, obesity_class, probability_scores, risk_level, recommendations, model_version, assessment_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cycle_id, user_id, Number(bmi), obesity_class,
        JSON.stringify(probability_scores || {}),
        risk_level || 'Low',
        JSON.stringify(recommendations || []),
        model_version, assessment_date
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Asesmen berhasil disimpan.',
      data: { id: result.insertId, user_id, obesity_class, risk_level, bmi }
    });
  } catch (error) {
    console.error('createAssessment error:', error);
    return res.status(500).json({ message: 'Gagal membuat data asesmen.' });
  }
};
