const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, userController.getUsers);
router.get('/:id', authMiddleware, userController.getUserById);
router.post('/', authMiddleware, userController.createUser);
router.put('/:id', authMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, userController.deleteUser);
router.post('/:id/restore', authMiddleware, userController.restoreUser);

module.exports = router;
