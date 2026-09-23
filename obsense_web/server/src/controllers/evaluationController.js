const { pool } = require('../config/db');

// GET ALL EVALUATIONS
exports.getEvaluations = async (req, res) => {
  try {
    const { user_id, assessment_id } = req.query;
    let query = `
      SELECT e.*, u.name as userName, a.name as adminName
      FROM admin_evaluations e
      JOIN users u ON e.user_id = u.id
      JOIN admins a ON e.admin_id = a.id
      WHERE 1=1
    `;
    const params = [];

    if (user_id) {
      query += ' AND e.user_id = ?';
      params.push(user_id);
    }
    if (assessment_id) {
      query += ' AND e.assessment_id = ?';
      params.push(assessment_id);
    }

    query += ' ORDER BY e.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getEvaluations error:', error);
    return res.status(500).json({ message: 'Gagal memuat catatan evaluasi klinis.' });
  }
};

// CREATE EVALUATION (Append-Only)
exports.createEvaluation = async (req, res) => {
  try {
    const { assessment_id, user_id, evaluation_notes, clinical_recommendation, adjusted_risk_level } = req.body;
    const adminId = req.user?.id || req.body.admin_id;

    if (!assessment_id || !user_id || !evaluation_notes) {
      return res.status(400).json({ message: 'assessment_id, user_id, dan evaluation_notes wajib diisi.' });
    }

    const [result] = await pool.query(
      `INSERT INTO admin_evaluations 
       (assessment_id, user_id, admin_id, evaluation_notes, clinical_recommendation, adjusted_risk_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        assessment_id, user_id, adminId,
        evaluation_notes, clinical_recommendation || null, adjusted_risk_level || null
      ]
    );

    const newEvalId = result.insertId;

    // Audit log
    const adminUser = req.user || { id: adminId, name: 'Admin', email: 'admin@obsense.com' };
    await pool.query(
      `INSERT INTO audit_logs (admin_id, admin_name, admin_email, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, 'EVALUATE', 'Assessment', ?, ?)`,
      [
        adminUser.id, adminUser.name, adminUser.email, String(assessment_id),
        JSON.stringify({ evaluation_id: newEvalId, user_id, adjusted_risk_level })
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Catatan evaluasi klinis berhasil ditambahkan.',
      data: { id: newEvalId, assessment_id, user_id, admin_id: adminId, evaluation_notes, clinical_recommendation, adjusted_risk_level }
    });
  } catch (error) {
    console.error('createEvaluation error:', error);
    return res.status(500).json({ message: 'Gagal menambahkan evaluasi klinis.' });
  }
};
