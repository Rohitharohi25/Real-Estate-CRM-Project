const express = require('express');
const router = express.Router();
const {
  register, login, refresh, logout, forgotPassword, resetPassword, getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const {
  registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator,
} = require('../validators/authValidator');

router.post('/register', authLimiter, registerValidator, validate, register);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
