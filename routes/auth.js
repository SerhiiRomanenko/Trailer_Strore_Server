// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware.protect, authController.getMe);
router.put('/me/profile', authMiddleware.protect, authController.updateProfile);
router.put('/me/password', authMiddleware.protect, authController.changePassword);

module.exports = router;