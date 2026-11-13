const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const { getCompanyUserIds } = require('../utils/accountUsage');

const getScopeFilter = async (user) => {
  if (user.role === 'super_admin') return {};
  if (user.role === 'sales_executive') return { assignedTo: user._id };
  return { createdBy: { $in: await getCompanyUserIds(user.companyName) } };
};

// @desc    Aggregate dashboard stats (cards + charts)
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const scopeFilter = await getScopeFilter(req.user);

  const [
    totalCustomers,
    totalLeads,
    pendingTasks,
    wonDeals,
    lostDeals,
    openDealsValue,
    leadsByStatus,
    monthlySales,
  ] = await Promise.all([
    Customer.countDocuments(scopeFilter),
    Lead.countDocuments(scopeFilter),
    Task.countDocuments({ ...scopeFilter, status: { $ne: 'completed' } }),
    Deal.countDocuments({ ...scopeFilter, stage: 'won' }),
    Deal.countDocuments({ ...scopeFilter, stage: 'lost' }),
    Deal.aggregate([
      { $match: { ...scopeFilter, stage: { $nin: ['won', 'lost'] } } },
      { $group: { _id: null, total: { $sum: '$value' } } },
    ]),
    Lead.aggregate([{ $match: scopeFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Deal.aggregate([
      { $match: { ...scopeFilter, stage: 'won' } },
      {
        $group: {
          _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
          total: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
  ]);

  const totalDealsClosed = wonDeals + lostDeals;
  const conversionRate = totalDealsClosed > 0 ? Number(((wonDeals / totalDealsClosed) * 100).toFixed(1)) : 0;

  res.json({
    success: true,
    data: {
      totalCustomers,
      totalLeads,
      pendingTasks,
      wonDeals,
      lostDeals,
      conversionRate,
      openPipelineValue: openDealsValue[0]?.total || 0,
      leadsByStatus,
      monthlySales,
    },
  });
});

// @desc    Sales report (deals grouped by stage + monthly trend)
// @route   GET /api/reports/sales
// @access  Private
const getSalesReport = asyncHandler(async (req, res) => {
  const scopeFilter = await getScopeFilter(req.user);

  const dealsByStage = await Deal.aggregate([
    { $match: scopeFilter },
    { $group: { _id: '$stage', count: { $sum: 1 }, totalValue: { $sum: '$value' } } },
  ]);

  const topPerformers = await Deal.aggregate([
    { $match: { ...scopeFilter, stage: 'won' } },
    { $group: { _id: '$assignedTo', totalValue: { $sum: '$value' }, dealsWon: { $sum: 1 } } },
    { $sort: { totalValue: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $project: { totalValue: 1, dealsWon: 1, 'user.name': 1, 'user.email': 1 } },
  ]);

  res.json({ success: true, data: { dealsByStage, topPerformers } });
});

// @desc    Leads report (by source + status)
// @route   GET /api/reports/leads
// @access  Private
const getLeadsReport = asyncHandler(async (req, res) => {
  const scopeFilter = await getScopeFilter(req.user);

  const [bySource, byStatus] = await Promise.all([
    Lead.aggregate([{ $match: scopeFilter }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
    Lead.aggregate([{ $match: scopeFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  res.json({ success: true, data: { bySource, byStatus } });
});

module.exports = { getDashboardStats, getSalesReport, getLeadsReport };
