const { body } = require('express-validator');

const taskValidator = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']),
  body('dueDate').optional().isISO8601().withMessage('dueDate must be a valid date'),
];

module.exports = { taskValidator };
