const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. 'CREATE_CUSTOMER', 'UPDATE_LEAD_STATUS'
    entityType: { type: String, required: true }, // 'Customer' | 'Lead' | 'Deal' | 'Task' | 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    description: { type: String, default: '' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
