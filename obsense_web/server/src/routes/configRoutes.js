const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, configController.getConfigurations);
router.put('/:key', authMiddleware, configController.updateConfiguration);

module.exports = router;
