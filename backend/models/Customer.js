const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Customer name is required'], trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    phone: { type: String, trim: true },
    company: { type: String, trim: true, default: '' },
    jobTitle: { type: String, trim: true, default: '' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    source: {
      type: String,
      enum: ['website', 'referral', 'social_media', 'advertisement', 'cold_call', 'other'],
      default: 'other',
    },
    tags: [{ type: String, trim: true }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

customerSchema.index({ name: 'text', email: 'text', company: 'text' });
customerSchema.index({ assignedTo: 1 });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
