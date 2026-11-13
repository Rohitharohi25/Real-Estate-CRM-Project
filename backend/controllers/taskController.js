const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const logActivity = require('../utils/activityLogger');
const { getCompanyUserIds } = require('../utils/accountUsage');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { search, status, priority, assignedTo, sort = 'dueDate', page = 1, limit = 20 } = req.query;

  const query = {};
  if (search) query.title = { $regex: search, $options: 'i' };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (req.user.role === 'sales_executive') query.assignedTo = req.user._id;
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    query.createdBy = { $in: await getCompanyUserIds(req.user.companyName) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('relatedCustomer', 'name')
      .populate('relatedLead', 'name company')
      .populate('relatedDeal', 'title value stage')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Task.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('relatedCustomer', 'name company email')
    .populate('relatedLead', 'name company email')
    .populate('relatedDeal', 'title value stage');
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }
  if (req.user.role === 'sales_executive' && task.assignedTo?.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You can only view tasks assigned to you');
  }
  if (req.user.role !== 'super_admin' && req.user.role !== 'sales_executive') {
    const companyUserIds = (await getCompanyUserIds(req.user.companyName)).map(String);
    if (!companyUserIds.includes(task.createdBy.toString())) {
      res.status(403);
      throw new Error('You can only view tasks in your own company');
    }
  }
  res.json({ success: true, data: task });
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id });

  if (task.assignedTo) {
    await Notification.create({
      user: task.assignedTo,
      title: 'New task assigned',
      message: `${task.title} has been assigned to you`,
      type: 'task_due',
      link: `/tasks/${task._id}`,
    });
  }

  await logActivity({
    user: req.user._id,
    action: 'CREATE_TASK',
    entityType: 'Task',
    entityId: task._id,
    description: `${req.user.name} created task ${task.title}`,
  });

  res.status(201).json({ success: true, data: task });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  Object.assign(task, req.body);
  await task.save();

  await logActivity({
    user: req.user._id,
    action: 'UPDATE_TASK',
    entityType: 'Task',
    entityId: task._id,
    description: `${req.user.name} updated task ${task.title} (status: ${task.status})`,
  });

  res.json({ success: true, data: task });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();

  await logActivity({
    user: req.user._id,
    action: 'DELETE_TASK',
    entityType: 'Task',
    entityId: task._id,
    description: `${req.user.name} deleted task ${task.title}`,
  });

  res.json({ success: true, message: 'Task deleted' });
});

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask };
