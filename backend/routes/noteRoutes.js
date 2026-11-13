const express = require('express');
const router = express.Router();
const { createNote, getNotes, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getNotes).post(createNote);
router.delete('/:id', deleteNote);

module.exports = router;
