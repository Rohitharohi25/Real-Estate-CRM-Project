const asyncHandler = require('../utils/asyncHandler');
const Customer = require('../models/Customer');
const Note = require('../models/Note');
const ActivityLog = require('../models/ActivityLog');
const logActivity = require('../utils/activityLogger');
const { ensurePlanLimit, getCompanyUserIds } = require('../utils/accountUsage');

// @desc    Get all customers (search, filter, sort, paginate)
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const { search, status, assignedTo, sort = '-createdAt', page = 1, limit = 10 } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;

  // Sales executives only see customers assigned to them.
  if (req.user.role === 'sales_executive') query.assignedTo = req.user._id;
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    query.createdBy = { $in: await getCompanyUserIds(req.user.companyName) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .populate('assignedTo', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Customer.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: customers,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single customer with notes + activity history
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).populate('assignedTo', 'name email');
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }
  if (req.user.role === 'sales_executive' && customer.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only view customers assigned to you');
  }
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    const companyUserIds = (await getCompanyUserIds(req.user.companyName)).map(String);
    if (!companyUserIds.includes(customer.createdBy.toString())) {
      res.status(403);
      throw new Error('You can only view customers in your own company');
    }
  }

  const [notes, activity] = await Promise.all([
    Note.find({ customer: customer._id }).populate('createdBy', 'name').sort('-createdAt'),
    ActivityLog.find({ entityType: 'Customer', entityId: customer._id }).sort('-createdAt').limit(50),
  ]);

  res.json({ success: true, data: customer, notes, activity });
});

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  await ensurePlanLimit(req.user, 'maxCustomers', 'Customer');
  const customer = await Customer.create({ ...req.body, createdBy: req.user._id });

  await logActivity({
    user: req.user._id,
    action: 'CREATE_CUSTOMER',
    entityType: 'Customer',
    entityId: customer._id,
    description: `${req.user.name} created customer ${customer.name}`,
  });

  res.status(201).json({ success: true, data: customer });
});

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  Object.assign(customer, req.body);
  await customer.save();

  await logActivity({
    user: req.user._id,
    action: 'UPDATE_CUSTOMER',
    entityType: 'Customer',
    entityId: customer._id,
    description: `${req.user.name} updated customer ${customer.name}`,
  });

  res.json({ success: true, data: customer });
});

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Manager)
const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404);
    throw new Error('Customer not found');
  }

  await customer.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'DELETE_CUSTOMER',
    entityType: 'Customer',
    entityId: customer._id,
    description: `${req.user.name} deleted customer ${customer.name}`,
  });

  res.json({ success: true, message: 'Customer deleted' });
});

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
