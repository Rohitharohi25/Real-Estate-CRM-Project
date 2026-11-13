const { body } = require('express-validator');

const dealValidator = [
  body('title').trim().notEmpty().withMessage('Deal title is required'),
  body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('stage')
    .optional()
    .isIn(['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost']),
];

module.exports = { dealValidator };
