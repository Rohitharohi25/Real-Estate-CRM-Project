const asyncHandler = require('../utils/asyncHandler');
const Plan = require('../models/Plan');
const User = require('../models/User');
const { getUsageForOwner } = require('../utils/accountUsage');

const getCompanies = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: 'admin', selectedPlan: { $exists: true, $ne: null } })
    .populate('selectedPlan', 'name priceMonthly maxUsers maxCustomers maxLeads')
    .sort('-createdAt');

  const data = await Promise.all(admins.map(async (admin) => ({
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    companyName: admin.companyName,
    status: admin.status,
    selectedPlan: admin.selectedPlan,
    createdAt: admin.createdAt,
    usage: await getUsageForOwner(admin),
  })));

  res.json({ success: true, data });
});

const updateCompany = asyncHandler(async (req, res) => {
  const admin = await User.findOne({ _id: req.params.id, role: 'admin' }).populate('selectedPlan');
  if (!admin) {
    res.status(404);
    throw new Error('Company admin account not found');
  }

  if (req.body.status) admin.status = req.body.status;
  if (req.body.planId) {
    const plan = await Plan.findOne({ _id: req.body.planId, status: 'active' });
    if (!plan) {
      res.status(400);
      throw new Error('Selected plan is not available');
    }
    const usage = await getUsageForOwner(admin);
    if (usage.users > plan.maxUsers || usage.customers > plan.maxCustomers || usage.leads > plan.maxLeads) {
      res.status(400);
      throw new Error('Company usage is above this plan limit');
    }
    admin.selectedPlan = plan._id;
  }

  await admin.save();
  if (req.body.status && admin.companyName) {
    await User.updateMany({ companyName: admin.companyName }, { $set: { status: req.body.status } });
  }
  const updated = await User.findById(admin._id).populate('selectedPlan', 'name priceMonthly maxUsers maxCustomers maxLeads');
  res.json({ success: true, data: updated });
});

module.exports = { getCompanies, updateCompany };
