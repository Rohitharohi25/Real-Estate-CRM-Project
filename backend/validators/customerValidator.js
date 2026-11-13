const { body } = require('express-validator');

const customerValidator = [
  body('name').trim().notEmpty().withMessage('Customer name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('phone').optional({ checkFalsy: true }).isString(),
  body('status').optional().isIn(['active', 'inactive']),
];

module.exports = { customerValidator };
