const express = require('express');
const router = express.Router();
const evaluationRoutes = require('./evaluationRoutes');
const configRoutes = require('./configRoutes');

router.use('/evaluations', evaluationRoutes);
router.use('/configurations', configRoutes);

module.exports = router;