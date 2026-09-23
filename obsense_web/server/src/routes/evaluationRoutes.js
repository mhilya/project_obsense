const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, evaluationController.getEvaluations);
router.post('/', authMiddleware, evaluationController.createEvaluation);

module.exports = router;
