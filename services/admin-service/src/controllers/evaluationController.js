const { AdminEvaluation } = require('../models');
const { Op } = require('sequelize');

const getEvaluations = async (req, res) => {
  try {
    const { user_id, assessment_id } = req.query;
    const where = {};

    if (user_id) where.user_id = user_id;
    if (assessment_id) where.assessment_id = assessment_id;

    const evaluations = await AdminEvaluation.findAll({
      where,
      order: [['created_at', 'DESC']]
    });

    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEvaluation = async (req, res) => {
  try {
    const { assessment_id, user_id, evaluation_notes, clinical_recommendation, adjusted_risk_level } = req.body;
    const admin_id = req.user.id;
    const admin_name = req.user.name;

    if (!assessment_id || !user_id) {
      return res.status(400).json({ error: "assessment_id dan user_id wajib diisi" });
    }

    const evaluation = await AdminEvaluation.create({
      assessment_id,
      user_id,
      admin_id,
      admin_name,
      evaluation_notes,
      clinical_recommendation,
      adjusted_risk_level
    });

    res.status(201).json(evaluation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getEvaluations,
  createEvaluation
};