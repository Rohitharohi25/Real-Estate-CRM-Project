const ActivityLog = require('../models/ActivityLog');

// Fire-and-forget activity logger; failures here should never break the main request.
const logActivity = async ({ user, action, entityType, entityId, description, meta }) => {
  try {
    await ActivityLog.create({ user, action, entityType, entityId, description, meta });
  } catch (err) {
    console.error('Failed to write activity log:', err.message);
  }
};

module.exports = logActivity;
