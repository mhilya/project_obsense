const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint Auth Publik
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoint Auth Terproteksi
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
