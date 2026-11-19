const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const cycleController = require('../controllers/cycleController');
const assessmentController = require('../controllers/assessmentController');

// /api/cycles
const cycleRouter = express.Router();
cycleRouter.get('/', authMiddleware, cycleController.getCycles);
cycleRouter.post('/', authMiddleware, cycleController.createCycle);
cycleRouter.get('/current', authMiddleware, cycleController.getCurrentCycle);
cycleRouter.get('/daily-logs', authMiddleware, cycleController.getDailyLogs);
cycleRouter.post('/daily-logs', authMiddleware, cycleController.createDailyLog);
cycleRouter.put('/daily-logs/:id', authMiddleware, cycleController.updateDailyLog);
cycleRouter.delete('/daily-logs/:id', authMiddleware, cycleController.deleteDailyLog);

// /api/assessments
const assessmentRouter = express.Router();
assessmentRouter.get('/', authMiddleware, assessmentController.getAssessments);
assessmentRouter.get('/:id', authMiddleware, assessmentController.getAssessmentById);
assessmentRouter.post('/', authMiddleware, assessmentController.createAssessment);

module.exports = { cycleRouter, assessmentRouter };
