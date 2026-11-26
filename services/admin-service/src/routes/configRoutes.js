const express = require('express');
const router = express.Router();
const { getConfigurations, updateConfiguration } = require('../controllers/configController');
const { verifyToken, checkSuperAdmin } = require('../middlewares/auth');

// GET /api/configurations
router.get('/', verifyToken, getConfigurations);

// PUT /api/configurations/:config_key (Super Admin only)
router.put('/:config_key', verifyToken, checkSuperAdmin, updateConfiguration);

module.exports = router;