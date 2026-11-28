const { AdminEvaluation } = require('../models');

const AUDIT_URL = () => process.env.AUDIT_SERVICE_URL || 'http://localhost:4006';

const emitAudit = (req, payload) => {
  fetch(`${AUDIT_URL()}/api/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: req.headers.authorization || '',
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
};

const getEvaluations = async (req, res) => {
  try {
    const { user_id, assessment_id } = req.query;
    const where = {};

    const isMobileUser = req.user && (req.user.type === 'user' || req.user.role === 'user');
    if (isMobileUser) {
      where.user_id = String(req.user.id);
    } else if (user_id) {
      where.user_id = String(user_id);
    }
    if (assessment_id) where.assessment_id = String(assessment_id);

    const evaluations = await AdminEvaluation.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvaluation = async (req, res) => {
  try {
    const {
      assessment_id = '0',
      user_id,
      evaluation_notes,
      clinical_recommendation,
      adjusted_risk_level,
    } = req.body;
    const admin_id = String(req.user.id);
    const admin_name = req.user.name || 'Admin Klinis';

    if (!user_id || !evaluation_notes) {
      return res.status(400).json({ message: 'user_id dan evaluation_notes wajib diisi.' });
    }

    const evaluation = await AdminEvaluation.create({
      assessment_id: String(assessment_id),
      user_id: String(user_id),
      admin_id,
      admin_name,
      evaluation_notes,
      clinical_recommendation,
      adjusted_risk_level,
    });

    emitAudit(req, {
      action: 'EVALUATE',
      entity_type: 'Assessment',
      entity_id: String(evaluation.id),
      details: {
        user_id: String(user_id),
        assessment_id: String(assessment_id),
        adjusted_risk_level,
      },
    });

    res.status(201).json(evaluation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getEvaluations, createEvaluation };
