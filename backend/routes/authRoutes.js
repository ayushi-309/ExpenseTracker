const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

// Register new user
router.post('/register', register);
// Login existing user
router.post('/login', login);
// Get current user (protected)
router.get('/me', protect, getCurrentUser);
// Update user profile / budget (protected)
router.put('/profile', protect, updateProfile);

module.exports = router;
