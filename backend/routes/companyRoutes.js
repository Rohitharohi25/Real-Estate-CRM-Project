const express = require('express');
const { getCompanies, updateCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

router.use(protect, authorize('super_admin'));

router.get('/', getCompanies);
router.put('/:id', updateCompany);

module.exports = router;
