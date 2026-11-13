const express = require('express');
const router = express.Router();
const {
  getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
} = require('../controllers/customerController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { customerValidator } = require('../validators/customerValidator');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(customerValidator, validate, createCustomer);

router.route('/:id')
  .get(getCustomer)
  .put(customerValidator, validate, updateCustomer)
  .delete(authorize('admin', 'manager'), deleteCustomer);

module.exports = router;
