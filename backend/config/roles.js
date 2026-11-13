// Centralized role map used by auth/role middleware and referenced by the frontend.
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_EXECUTIVE: 'sales_executive',
};

const ALL_ROLES = Object.values(ROLES);

module.exports = { ROLES, ALL_ROLES };
