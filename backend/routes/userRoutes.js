const express = require('express');
const router = express.Router();
const {
  getUsers, getUser, createUser, updateUser, changePassword, deleteUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.put('/change-password', changePassword);

router.route('/')
  .get(authorize('admin', 'manager'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(authorize('admin', 'manager'), getUser)
  .put(updateUser) // self-update for profile fields, admin for role/status (enforced in controller)
  .delete(authorize('admin'), deleteUser);

module.exports = router;
