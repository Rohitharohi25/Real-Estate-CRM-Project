const asyncHandler = require('../utils/asyncHandler');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const logActivity = require('../utils/activityLogger');
const { getCompanyUserIds } = require('../utils/accountUsage');

// @desc    Get all deals (used for table view + Kanban board)
// @route   GET /api/deals
// @access  Private
const getDeals = asyncHandler(async (req, res) => {
  const { search, stage, assignedTo, sort = '-createdAt', page = 1, limit = 50 } = req.query;

  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (stage) query.stage = stage;
  if (assignedTo) query.assignedTo = assignedTo;
  if (req.user.role === 'sales_executive') query.assignedTo = req.user._id;
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    query.createdBy = { $in: await getCompanyUserIds(req.user.companyName) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [deals, total] = await Promise.all([
    Deal.find(query)
      .populate('assignedTo', 'name email')
      .populate('customer', 'name company')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Deal.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: deals,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single deal
// @route   GET /api/deals/:id
// @access  Private
const getDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('customer', 'name company email');
  if (!deal) {
    res.status(404);
    throw new Error('Deal not found');
  }
  if (req.user.role === 'sales_executive' && deal.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only view deals assigned to you');
  }
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    const companyUserIds = (await getCompanyUserIds(req.user.companyName)).map(String);
    if (!companyUserIds.includes(deal.createdBy.toString())) {
      res.status(403);
      throw new Error('You can only view deals in your own company');
    }
  }
  res.json({ success: true, data: deal });
});

// @desc    Create a deal
// @route   POST /api/deals
// @access  Private
const createDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.create({ ...req.body, createdBy: req.user._id });

  await logActivity({
    user: req.user._id,
    action: 'CREATE_DEAL',
    entityType: 'Deal',
    entityId: deal._id,
    description: `${req.user.name} created deal ${deal.title}`,
  });

  res.status(201).json({ success: true, data: deal });
});

// @desc    Update a deal (drag-and-drop stage changes go through here too)
// @route   PUT /api/deals/:id
// @access  Private
const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    res.status(404);
    throw new Error('Deal not found');
  }

  const previousStage = deal.stage;
  Object.assign(deal, req.body);
  await deal.save();

  if (deal.stage !== previousStage && (deal.stage === 'won' || deal.stage === 'lost') && deal.assignedTo) {
    await Notification.create({
      user: deal.assignedTo,
      title: `Deal ${deal.stage}`,
      message: `${deal.title} has been marked as ${deal.stage}`,
      type: deal.stage === 'won' ? 'deal_won' : 'deal_lost',
      link: `/deals/${deal._id}`,
    });
  }

  await logActivity({
    user: req.user._id,
    action: 'UPDATE_DEAL',
    entityType: 'Deal',
    entityId: deal._id,
    description: `${req.user.name} moved deal ${deal.title} to stage ${deal.stage}`,
  });

  res.json({ success: true, data: deal });
});

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private (Admin, Manager)
const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) {
    res.status(404);
    throw new Error('Deal not found');
  }

  await deal.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'DELETE_DEAL',
    entityType: 'Deal',
    entityId: deal._id,
    description: `${req.user.name} deleted deal ${deal.title}`,
  });

  res.json({ success: true, message: 'Deal deleted' });
});

module.exports = { getDeals, getDeal, createDeal, updateDeal, deleteDeal };
