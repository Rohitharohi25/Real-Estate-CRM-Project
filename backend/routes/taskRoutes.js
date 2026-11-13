const express = require('express');
const router = express.Router();
const {
  getTasks, getTask, createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { taskValidator } = require('../validators/taskValidator');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(taskValidator, validate, createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
