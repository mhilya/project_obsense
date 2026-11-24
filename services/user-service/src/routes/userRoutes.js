const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin, requireUser } = require('../middleware/roleMiddleware');

// Pengguna (mobile) - letakkan SEBELUM '/:id'
router.get('/me', authMiddleware, requireUser, userController.getMe);
router.put('/me', authMiddleware, requireUser, userController.upsertMe);

// Admin (web)
router.get('/', authMiddleware, requireAdmin, userController.getUsers);
router.get('/:id', authMiddleware, requireAdmin, userController.getUserById);
router.post('/', authMiddleware, requireAdmin, userController.createUser);
router.put('/:id', authMiddleware, requireAdmin, userController.updateUser);
router.delete('/:id', authMiddleware, requireAdmin, userController.deleteUser);
router.post('/:id/restore', authMiddleware, requireAdmin, userController.restoreUser);

module.exports = router;
