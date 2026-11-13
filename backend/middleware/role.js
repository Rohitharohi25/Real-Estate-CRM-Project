// Restricts a route to specific roles. Super admins can access every role-gated route.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  if (req.user.role !== 'super_admin' && !allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user.role}' is not permitted to perform this action`);
  }
  next();
};

module.exports = { authorize };
