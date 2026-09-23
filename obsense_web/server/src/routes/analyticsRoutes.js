const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authMiddleware, analyticsController.getDashboardStats);
router.get('/report', authMiddleware, analyticsController.getAnalyticsReport);

module.exports = router;
