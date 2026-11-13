const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    content: { type: String, required: [true, 'Note content is required'], trim: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

noteSchema.index({ customer: 1 });
noteSchema.index({ lead: 1 });
noteSchema.index({ deal: 1 });

module.exports = mongoose.model('Note', noteSchema);
