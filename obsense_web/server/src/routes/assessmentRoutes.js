const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, assessmentController.getAssessments);
router.get('/:id', authMiddleware, assessmentController.getAssessmentById);
router.post('/', authMiddleware, assessmentController.createAssessment);

module.exports = router;
