const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authMiddleware, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, requireAdmin, auditController.getAuditLogs);
router.post('/', authMiddleware, requireAdmin, auditController.createAuditLog);

module.exports = router;
