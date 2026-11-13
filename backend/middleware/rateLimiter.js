const rateLimit = require('express-rate-limit');

const isDevelopment = process.env.NODE_ENV !== 'production';

// General API rate limiter.
const apiLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || (isDevelopment ? 5000 : 300),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Stricter limiter for auth endpoints to slow down brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || (isDevelopment ? 200 : 20),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.DISABLE_RATE_LIMIT === 'true',
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

module.exports = { apiLimiter, authLimiter };
