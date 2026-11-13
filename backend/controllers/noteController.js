const asyncHandler = require('../utils/asyncHandler');
const Note = require('../models/Note');
const logActivity = require('../utils/activityLogger');

// @desc    Create a note (attached to a customer, lead, or deal)
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const note = await Note.create({ ...req.body, createdBy: req.user._id });

  await logActivity({
    user: req.user._id,
    action: 'CREATE_NOTE',
    entityType: note.customer ? 'Customer' : note.lead ? 'Lead' : 'Deal',
    entityId: note.customer || note.lead || note.deal,
    description: `${req.user.name} added a note`,
  });

  res.status(201).json({ success: true, data: note });
});

// @desc    Get notes for an entity
// @route   GET /api/notes?customer=:id  |  ?lead=:id  |  ?deal=:id
// @access  Private
const getNotes = asyncHandler(async (req, res) => {
  const { customer, lead, deal } = req.query;
  const query = {};
  if (customer) query.customer = customer;
  if (lead) query.lead = lead;
  if (deal) query.deal = deal;

  const notes = await Note.find(query).populate('createdBy', 'name').sort('-createdAt');
  res.json({ success: true, data: notes });
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404);
    throw new Error('Note not found');
  }
  await note.deleteOne();
  res.json({ success: true, message: 'Note deleted' });
});

module.exports = { createNote, getNotes, deleteNote };
