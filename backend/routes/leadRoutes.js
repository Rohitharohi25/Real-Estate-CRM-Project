const express = require('express');
const router = express.Router();
const {
  getLeads, getLead, createLead, updateLead, deleteLead, convertLead,
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { leadValidator } = require('../validators/leadValidator');

router.use(protect);

router.route('/')
  .get(getLeads)
  .post(leadValidator, validate, createLead);

router.route('/:id')
  .get(getLead)
  .put(leadValidator, validate, updateLead)
  .delete(authorize('admin', 'manager'), deleteLead);

router.post('/:id/convert', convertLead);

module.exports = router;
