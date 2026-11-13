const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Lead name is required'], trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, default: '' },
    source: {
      type: String,
      enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost'],
      default: 'new',
    },
    estimatedValue: { type: Number, default: 0, min: 0 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    convertedToDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', default: null },
  },
  { timestamps: true }
);

leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
