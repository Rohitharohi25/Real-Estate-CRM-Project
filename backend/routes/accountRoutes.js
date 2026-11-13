const express = require('express');
const { getAccountSummary, changeAccountPlan } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAccountSummary);
router.put('/plan', changeAccountPlan);

module.exports = router;
