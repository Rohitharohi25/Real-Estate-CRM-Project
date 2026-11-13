const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');
const { ensurePlanLimit } = require('../utils/accountUsage');

const canManageRole = (actorRole, targetRole) => {
  if (actorRole === 'super_admin') return true;
  return targetRole !== 'super_admin';
};

// @desc    Get all users (team management)
// @route   GET /api/users
// @access  Private (Admin, Manager)
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, status } = req.query;
  const query = {};
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
  if (role) query.role = role;
  if (status) query.status = status;
  if (req.user.role !== 'super_admin') {
    query.companyName = req.user.companyName || '__no_company__';
    query.role = role || { $ne: 'super_admin' };
  }

  const users = await User.find(query).populate('selectedPlan', 'name priceMonthly').sort('-createdAt');
  res.json({ success: true, data: users });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin, Manager)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('selectedPlan', 'name priceMonthly');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (req.user.role !== 'super_admin' && user.companyName !== req.user.companyName) {
    res.status(403);
    throw new Error('You can only view users in your own company');
  }
  res.json({ success: true, data: user });
});

// @desc    Admin creates a new team member
// @route   POST /api/users
// @access  Private (Admin)
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, selectedPlan } = req.body;
  const requestedRole = role || 'sales_executive';
  if (req.user.role !== 'super_admin') {
    await ensurePlanLimit(req.user, 'maxUsers', 'User');
  }
  if (!canManageRole(req.user.role, requestedRole)) {
    res.status(403);
    throw new Error('Only a super admin can create another super admin');
  }
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('A user with this email already exists');
  }
  const user = await User.create({
    name,
    email,
    password,
    role: requestedRole,
    companyName: req.user.role === 'super_admin' ? companyName : req.user.companyName,
    selectedPlan: req.user.role === 'super_admin' ? selectedPlan : undefined,
  });

  await logActivity({
    user: req.user._id,
    action: 'CREATE_USER',
    entityType: 'User',
    entityId: user._id,
    description: `${req.user.name} created user ${user.name} (${user.role})`,
  });

  res.status(201).json({ success: true, data: user });
});

// @desc    Update a user (role, status, profile fields)
// @route   PUT /api/users/:id
// @access  Private (Admin) or self for profile fields
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isSelf = req.user._id.toString() === user._id.toString();
  if (req.body.role && !canManageRole(req.user.role, req.body.role)) {
    res.status(403);
    throw new Error('Only a super admin can assign the super admin role');
  }
  if (user.role === 'super_admin' && req.user.role !== 'super_admin' && !isSelf) {
    res.status(403);
    throw new Error('Only a super admin can update another super admin');
  }
  if (req.user.role !== 'super_admin' && !isSelf && user.companyName !== req.user.companyName) {
    res.status(403);
    throw new Error('You can only update users in your own company');
  }

  const canManageUsers = ['super_admin', 'admin'].includes(req.user.role);
  const allowedFields = isSelf && !canManageUsers
    ? ['name', 'phone', 'avatar']
    : canManageUsers
      ? ['name', 'phone', 'avatar', 'companyName', 'selectedPlan', 'role', 'status']
      : ['name', 'phone', 'avatar', 'companyName'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  await user.save();

  await logActivity({
    user: req.user._id,
    action: 'UPDATE_USER',
    entityType: 'User',
    entityId: user._id,
    description: `${req.user.name} updated user ${user.name}`,
  });

  res.json({ success: true, data: user });
});

// @desc    Change own password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

// @desc    Delete / deactivate a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Only a super admin can delete another super admin');
  }
  if (req.user.role !== 'super_admin' && user.companyName !== req.user.companyName) {
    res.status(403);
    throw new Error('You can only delete users in your own company');
  }

  await user.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'DELETE_USER',
    entityType: 'User',
    entityId: user._id,
    description: `${req.user.name} deleted user ${user.name}`,
  });

  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getUsers, getUser, createUser, updateUser, changePassword, deleteUser };
