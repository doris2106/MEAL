const express = require('express');
const { register, login, getMe, guestLogin } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * Authentication Routes
 * User registration, login, and profile routes
 */

// Register new teacher
router.post('/register', register);

// Login teacher
router.post('/login', login);

// Guest login (no authentication required)
router.post('/guest-login', guestLogin);

// Get current user (requires authentication)
router.get('/me', auth, getMe);

module.exports = router;
