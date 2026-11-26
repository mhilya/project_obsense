const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Publik
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);

// Password Reset (Publik)
const passwordResetController = require('../controllers/passwordResetController');
router.post('/forgot-password/request-otp', passwordResetController.requestOTP);
router.post('/forgot-password/verify-otp', passwordResetController.verifyOTP);
router.post('/forgot-password/reset-password', passwordResetController.resetPassword);

// Terproteksi
router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.put('/change-password', authMiddleware, authController.changePassword);

// Manajemen admin (khusus super_admin)
const adminController = require('../controllers/adminController');
const { requireSuperAdmin } = require('../middleware/roleMiddleware');

router.get('/admins', authMiddleware, requireSuperAdmin, adminController.listAdmins);
router.post('/admins', authMiddleware, requireSuperAdmin, adminController.createAdmin);
router.put('/admins/:id', authMiddleware, requireSuperAdmin, adminController.updateAdmin);
router.post('/admins/:id/reset-password', authMiddleware, requireSuperAdmin, adminController.resetPassword);

module.exports = router;
