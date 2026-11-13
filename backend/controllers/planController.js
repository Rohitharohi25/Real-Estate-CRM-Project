const asyncHandler = require('../utils/asyncHandler');
const Plan = require('../models/Plan');
const logActivity = require('../utils/activityLogger');

const normalizeFeatures = (features) => {
  if (Array.isArray(features)) return features.map((feature) => String(feature).trim()).filter(Boolean);
  if (typeof features === 'string') {
    return features.split('\n').map((feature) => feature.trim()).filter(Boolean);
  }
  return [];
};

// @desc    Get all plans
// @route   GET /api/plans
// @access  Private (Super Admin)
const getPlans = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (status) query.status = status;

  const plans = await Plan.find(query).sort('sortOrder priceMonthly name');
  res.json({ success: true, data: plans });
});

// @desc    Get active public plans for the home page
// @route   GET /api/plans/public
// @access  Public
const getPublicPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find({ status: 'active' })
    .select('name description priceMonthly maxUsers maxCustomers maxLeads features sortOrder')
    .sort('sortOrder priceMonthly name');

  res.json({ success: true, data: plans });
});

// @desc    Create plan
// @route   POST /api/plans
// @access  Private (Super Admin)
const createPlan = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    features: normalizeFeatures(req.body.features),
    createdBy: req.user._id,
  };
  const plan = await Plan.create(payload);

  await logActivity({
    user: req.user._id,
    action: 'CREATE_PLAN',
    entityType: 'Plan',
    entityId: plan._id,
    description: `${req.user.name} created plan ${plan.name}`,
  });

  res.status(201).json({ success: true, data: plan });
});

// @desc    Update plan
// @route   PUT /api/plans/:id
// @access  Private (Super Admin)
const updatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }

  Object.assign(plan, req.body);
  if (req.body.features !== undefined) plan.features = normalizeFeatures(req.body.features);
  await plan.save();

  await logActivity({
    user: req.user._id,
    action: 'UPDATE_PLAN',
    entityType: 'Plan',
    entityId: plan._id,
    description: `${req.user.name} updated plan ${plan.name}`,
  });

  res.json({ success: true, data: plan });
});

// @desc    Delete plan
// @route   DELETE /api/plans/:id
// @access  Private (Super Admin)
const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    res.status(404);
    throw new Error('Plan not found');
  }
  await plan.deleteOne();
  res.json({ success: true, message: 'Plan deleted' });
});

module.exports = { getPlans, getPublicPlans, createPlan, updatePlan, deletePlan };
