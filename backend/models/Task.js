const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true, maxlength: 150 },
    description: { type: String, trim: true, default: '' },
    relatedCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    relatedLead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    relatedDeal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    dueDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.index({ status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
