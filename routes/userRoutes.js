// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {protect, authorizeRoles} = require('../middleware/auth');

router.get('/', protect, authorizeRoles('admin'), userController.getAllUsers);
router.get('/:id', protect, authorizeRoles('admin'), userController.getUserById);

router.put('/:id', protect, authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', protect, authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
