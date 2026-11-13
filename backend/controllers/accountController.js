const asyncHandler = require('../utils/asyncHandler');
const Plan = require('../models/Plan');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { getAccountOwner, getUsageForOwner } = require('../utils/accountUsage');

const getAccountSummary = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ status: 'active' }).sort('sortOrder priceMonthly name');

  if (req.user.role === 'super_admin') {
    const [users, companies, customers, leads] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin', selectedPlan: { $exists: true, $ne: null } }),
      Customer.countDocuments(),
      Lead.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        role: req.user.role,
        platform: { users, companies, customers, leads },
        plans,
      },
    });
  }

  const owner = await getAccountOwner(req.user);
  const usage = await getUsageForOwner(owner);

  res.json({
    success: true,
    data: {
      role: req.user.role,
      companyName: owner?.companyName || req.user.companyName || '',
      owner: owner ? { id: owner._id, name: owner.name, email: owner.email, status: owner.status } : null,
      plan: owner?.selectedPlan || null,
      usage,
      canChangePlan: req.user.role === 'admin' && req.user._id.toString() === owner?._id.toString(),
      plans,
    },
  });
});

const changeAccountPlan = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the account admin can change the plan');
  }

  const plan = await Plan.findOne({ _id: req.body.planId, status: 'active' });
  if (!plan) {
    res.status(400);
    throw new Error('Selected plan is not available');
  }

  const usage = await getUsageForOwner(req.user);
  if (usage.users > plan.maxUsers || usage.customers > plan.maxCustomers || usage.leads > plan.maxLeads) {
    res.status(400);
    throw new Error('Current usage is above this plan limit. Reduce usage or choose a larger plan.');
  }

  const user = await User.findById(req.user._id);
  user.selectedPlan = plan._id;
  await user.save();

  res.json({ success: true, data: { plan, usage } });
});

module.exports = { getAccountSummary, changeAccountPlan };
