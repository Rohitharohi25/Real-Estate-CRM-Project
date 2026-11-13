const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const User = require('../models/User');

const getAccountOwner = async (user) => {
  if (!user || user.role === 'super_admin') return null;
  if (user.role === 'admin' && user.selectedPlan) {
    return User.findById(user._id).populate('selectedPlan');
  }
  if (!user.companyName) return null;
  return User.findOne({
    role: 'admin',
    companyName: user.companyName,
    selectedPlan: { $exists: true, $ne: null },
  }).populate('selectedPlan');
};

const getCompanyUserIds = async (companyName) => {
  if (!companyName) return [];
  const users = await User.find({ companyName }).select('_id');
  return users.map((user) => user._id);
};

const getUsageForOwner = async (owner) => {
  if (!owner) return { users: 0, customers: 0, leads: 0 };
  const companyUserIds = await getCompanyUserIds(owner.companyName);
  const [users, customers, leads] = await Promise.all([
    User.countDocuments({ companyName: owner.companyName, status: 'active' }),
    Customer.countDocuments({ createdBy: { $in: companyUserIds } }),
    Lead.countDocuments({ createdBy: { $in: companyUserIds } }),
  ]);
  return { users, customers, leads };
};

const ensurePlanLimit = async (user, limitKey, label) => {
  const owner = await getAccountOwner(user);
  if (!owner?.selectedPlan) return;

  const usage = await getUsageForOwner(owner);
  const usageKey = limitKey.replace('max', '').toLowerCase();
  const current = usage[usageKey];
  const max = owner.selectedPlan[limitKey];

  if (Number.isFinite(max) && current >= max) {
    const error = new Error(`${label} limit reached for the ${owner.selectedPlan.name} plan`);
    error.statusCode = 403;
    throw error;
  }
};

module.exports = {
  ensurePlanLimit,
  getAccountOwner,
  getCompanyUserIds,
  getUsageForOwner,
};
