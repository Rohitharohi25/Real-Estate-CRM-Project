const express = require('express');
const router = express.Router();
const {
  getDeals, getDeal, createDeal, updateDeal, deleteDeal,
} = require('../controllers/dealController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { dealValidator } = require('../validators/dealValidator');

router.use(protect);

router.route('/')
  .get(getDeals)
  .post(dealValidator, validate, createDeal);

router.route('/:id')
  .get(getDeal)
  .put(updateDeal)
  .delete(authorize('admin', 'manager'), deleteDeal);

module.exports = router;
