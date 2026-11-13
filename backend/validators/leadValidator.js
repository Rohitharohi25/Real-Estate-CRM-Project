const { body } = require('express-validator');

const leadValidator = [
  body('name').trim().notEmpty().withMessage('Lead name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']),
  body('estimatedValue').optional().isFloat({ min: 0 }),
];

module.exports = { leadValidator };
