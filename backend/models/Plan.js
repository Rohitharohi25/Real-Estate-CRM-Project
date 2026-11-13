const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Plan name is required'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, default: '' },
    priceMonthly: { type: Number, min: 0, default: 0 },
    maxUsers: { type: Number, min: 1, default: 5 },
    maxCustomers: { type: Number, min: 0, default: 500 },
    maxLeads: { type: Number, min: 0, default: 500 },
    features: [{ type: String, trim: true }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

planSchema.index({ status: 1, sortOrder: 1 });
planSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Plan', planSchema);
