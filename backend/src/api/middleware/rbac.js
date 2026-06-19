// Casbin RBAC middleware
// Roles: SOC_ANALYST, THREAT_HUNTER, ADMIN, READ_ONLY
const checkRole = (requiredRole) => (req, res, next) => {
  // TODO: enforce via Casbin
  next();
};
module.exports = { checkRole };
