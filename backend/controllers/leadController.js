const asyncHandler = require('../utils/asyncHandler');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Deal = require('../models/Deal');
const Notification = require('../models/Notification');
const logActivity = require('../utils/activityLogger');
const { ensurePlanLimit, getCompanyUserIds } = require('../utils/accountUsage');

// @desc    Get all leads (search, filter, sort, paginate)
// @route   GET /api/leads
// @access  Private
const getLeads = asyncHandler(async (req, res) => {
  const { search, status, assignedTo, sort = '-createdAt', page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (req.user.role === 'sales_executive') query.assignedTo = req.user._id;
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    query.createdBy = { $in: await getCompanyUserIds(req.user.companyName) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [leads, total] = await Promise.all([
    Lead.find(query).populate('assignedTo', 'name email').sort(sort).skip(skip).limit(Number(limit)),
    Lead.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: leads,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get a single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  if (req.user.role === 'sales_executive' && lead.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only view leads assigned to you');
  }
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    const companyUserIds = (await getCompanyUserIds(req.user.companyName)).map(String);
    if (!companyUserIds.includes(lead.createdBy.toString())) {
      res.status(403);
      throw new Error('You can only view leads in your own company');
    }
  }
  res.json({ success: true, data: lead });
});

// @desc    Create a lead
// @route   POST /api/leads
// @access  Private
const createLead = asyncHandler(async (req, res) => {
  await ensurePlanLimit(req.user, 'maxLeads', 'Lead');
  const lead = await Lead.create({ ...req.body, createdBy: req.user._id });

  if (lead.assignedTo) {
    await Notification.create({
      user: lead.assignedTo,
      title: 'New lead assigned',
      message: `${lead.name} has been assigned to you`,
      type: 'lead_assigned',
      link: `/leads/${lead._id}`,
    });
  }

  await logActivity({
    user: req.user._id,
    action: 'CREATE_LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    description: `${req.user.name} created lead ${lead.name}`,
  });

  res.status(201).json({ success: true, data: lead });
});

// @desc    Update a lead (including status changes through the pipeline)
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  const previousAssignee = lead.assignedTo?.toString();
  Object.assign(lead, req.body);
  await lead.save();

  if (lead.assignedTo && lead.assignedTo.toString() !== previousAssignee) {
    await Notification.create({
      user: lead.assignedTo,
      title: 'Lead assigned to you',
      message: `${lead.name} has been assigned to you`,
      type: 'lead_assigned',
      link: `/leads/${lead._id}`,
    });
  }

  await logActivity({
    user: req.user._id,
    action: 'UPDATE_LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    description: `${req.user.name} updated lead ${lead.name} (status: ${lead.status})`,
  });

  res.json({ success: true, data: lead });
});

// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin, Manager)
const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }

  await lead.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'DELETE_LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    description: `${req.user.name} deleted lead ${lead.name}`,
  });

  res.json({ success: true, message: 'Lead deleted' });
});

// @desc    Convert a lead into a customer + deal
// @route   POST /api/leads/:id/convert
// @access  Private
const convertLead = asyncHandler(async (req, res) => {
  await ensurePlanLimit(req.user, 'maxCustomers', 'Customer');
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error('Lead not found');
  }
  if (lead.convertedToCustomer) {
    res.status(400);
    throw new Error('Lead has already been converted');
  }

  const customer = await Customer.create({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    assignedTo: lead.assignedTo,
    createdBy: req.user._id,
  });

  const deal = await Deal.create({
    title: `${lead.company || lead.name} - Deal`,
    customer: customer._id,
    lead: lead._id,
    value: lead.estimatedValue || 0,
    stage: 'new_lead',
    assignedTo: lead.assignedTo,
    createdBy: req.user._id,
  });

  lead.status = 'won';
  lead.convertedToCustomer = customer._id;
  lead.convertedToDeal = deal._id;
  await lead.save();

  await logActivity({
    user: req.user._id,
    action: 'CONVERT_LEAD',
    entityType: 'Lead',
    entityId: lead._id,
    description: `${req.user.name} converted lead ${lead.name} into a customer and deal`,
  });

  res.json({ success: true, data: { lead, customer, deal } });
});

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, convertLead };
