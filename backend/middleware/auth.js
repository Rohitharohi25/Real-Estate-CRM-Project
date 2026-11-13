const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies the JWT access token from the Authorization header and attaches the user to req.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('selectedPlan', 'name priceMonthly maxUsers');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists');
    }

    if (user.status !== 'active') {
      res.status(403);
      throw new Error('Account is inactive. Contact an administrator.');
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token failed or expired');
  }
});

module.exports = { protect };
