const express = require('express');
const router = express.Router();
const {
  getPlans, getPublicPlans, createPlan, updatePlan, deletePlan,
} = require('../controllers/planController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/public', getPublicPlans);

router.use(protect);
router.use(authorize('super_admin'));

router.route('/')
  .get(getPlans)
  .post(createPlan);

router.route('/:id')
  .put(updatePlan)
  .delete(deletePlan);

module.exports = router;
