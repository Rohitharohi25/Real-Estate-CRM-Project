const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Deal title is required'], trim: true, maxlength: 150 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    value: { type: Number, required: true, min: 0, default: 0 },
    stage: {
      type: String,
      enum: ['new_lead', 'contacted', 'proposal_sent', 'negotiation', 'won', 'lost'],
      default: 'new_lead',
    },
    probability: { type: Number, min: 0, max: 100, default: 10 },
    expectedCloseDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lostReason: { type: String, default: '' },
  },
  { timestamps: true }
);

dealSchema.index({ stage: 1 });
dealSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Deal', dealSchema);
