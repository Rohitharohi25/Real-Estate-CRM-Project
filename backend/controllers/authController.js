const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Plan = require('../models/Plan');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const logActivity = require('../utils/activityLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (first user) / Admin (subsequent users, enforced at frontend + can be locked down here)
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, planId, companyName } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  // First account owns the platform. Public plan signups become admins for their CRM account.
  const userCount = await User.countDocuments();
  let selectedPlan = null;
  if (planId) {
    selectedPlan = await Plan.findOne({ _id: planId, status: 'active' });
    if (!selectedPlan) {
      res.status(400);
      throw new Error('Selected plan is not available');
    }
  }

  const assignedRole = userCount === 0
    ? 'super_admin'
    : selectedPlan
      ? 'admin'
      : role && ['manager', 'sales_executive'].includes(role)
        ? role
        : 'sales_executive';

  const user = await User.create({
    name,
    email,
    password,
    role: assignedRole,
    companyName: companyName || '',
    selectedPlan: selectedPlan?._id,
  });

  await logActivity({
    user: user._id,
    action: 'REGISTER',
    entityType: 'User',
    entityId: user._id,
    description: `${user.name} registered${selectedPlan ? ` on ${selectedPlan.name}` : ''}`,
  });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      selectedPlan: selectedPlan ? { id: selectedPlan._id, name: selectedPlan.name } : null,
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password').populate('selectedPlan', 'name priceMonthly maxUsers');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.status !== 'active') {
    res.status(403);
    throw new Error('Account is inactive. Contact an administrator.');
  }

  user.lastLogin = new Date();
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  await logActivity({
    user: user._id,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user._id,
    description: `${user.name} logged in`,
  });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      companyName: user.companyName,
      selectedPlan: user.selectedPlan,
    },
  });
});

// @desc    Refresh access token using a valid refresh token
// @route   POST /api/auth/refresh
// @access  Public (requires valid refresh token)
const refresh = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token required');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error('Refresh token is no longer valid');
  }

  const accessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken });
});

// @desc    Logout (invalidate refresh token)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  req.user.refreshToken = undefined;
  await req.user.save();
  res.json({ success: true, message: 'Logged out' });
});

// @desc    Request a password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered.
  const genericResponse = {
    success: true,
    message: 'If an account with that email exists, a reset link has been sent.',
  };

  if (!user) return res.json(genericResponse);

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'ProCRM Password Reset',
      html: `<p>Hello ${user.name},</p><p>Click the link below to reset your password. This link expires in 30 minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent');
  }

  res.json(genericResponse);
});

// @desc    Reset password using a valid reset token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpire');

  if (!user) {
    res.status(400);
    throw new Error('Reset token is invalid or has expired');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: 'Password has been reset. Please log in.' });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('selectedPlan', 'name priceMonthly maxUsers');
  res.json({ success: true, user });
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, getMe };
