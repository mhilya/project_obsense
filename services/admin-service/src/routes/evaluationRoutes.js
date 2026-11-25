const express = require('express');
const router = express.Router();
const { getEvaluations, createEvaluation } = require('../controllers/evaluationController');
const { verifyToken, checkAdmin } = require('../middlewares/auth');

// GET /api/evaluations
router.get('/', verifyToken, getEvaluations);

// POST /api/evaluations (Admin only)
router.post('/', verifyToken, checkAdmin, createEvaluation);

module.exports = router;