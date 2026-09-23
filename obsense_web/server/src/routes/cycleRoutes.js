const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycleController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, cycleController.getCycles);
router.get('/daily-logs', authMiddleware, cycleController.getDailyLogs);
router.post('/daily-logs', authMiddleware, cycleController.createDailyLog);

module.exports = router;
