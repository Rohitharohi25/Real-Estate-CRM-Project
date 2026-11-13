const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getSalesReport, getLeadsReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);
router.get('/leads', getLeadsReport);

module.exports = router;
