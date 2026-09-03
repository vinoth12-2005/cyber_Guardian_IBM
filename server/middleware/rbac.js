/**
 * Role-Based Access Control (RBAC) Middleware
 */

const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  PLATFORM_ADMIN: [
    'users:*',
    'courses:*',
    'simulations:*',
    'certifications:*',
    'analytics:*',
    'audit:*',
    'flotbot:read',
  ],
  USER_ADMIN: ['users:*'],
  COURSE_ADMIN: ['courses:*'],
  SIMULATION_ADMIN: ['simulations:*'],
  CERTIFICATION_ADMIN: ['certifications:*'],
  FLOTBOT_SECURITY_ADMIN: [
    'flotbot:*',
    'security:*',
    'rules:*',
    'iocs:*',
    'audit:*',
  ],
  SECURITY_ANALYST: [
    'flotbot:read',
    'flotbot:ack',
    'flotbot:inspect',
    'security:read',
    'analytics:security',
  ],
  ANALYST: ['analytics:*', 'reports:*'],
  EMPLOYEE: [
    'courses:read',
    'courses:enroll',
    'courses:progress',
    'simulations:play',
    'certifications:read',
    'profile:manage',
  ],
  STUDENT: [
    'courses:read',
    'courses:enroll',
    'courses:progress',
    'simulations:play',
    'certifications:read',
    'profile:manage',
  ],
};

/**
 * Check if user has required role(s)
 * @param {...string} allowedRoles List of roles permitted to access endpoint
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required before permission check',
        },
      });
    }

    const userRole = req.user.role || 'STUDENT';

    // SUPER_ADMIN has access to all protected endpoints
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: `Forbidden: role '${userRole}' does not have sufficient administrative privileges for this resource`,
      },
    });
  };
}

/**
 * Check if user has any administrative role
 */
function requireAnyAdmin(req, res, next) {
  return requireRole(
    'SUPER_ADMIN',
    'PLATFORM_ADMIN',
    'USER_ADMIN',
    'COURSE_ADMIN',
    'SIMULATION_ADMIN',
    'CERTIFICATION_ADMIN',
    'FLOTBOT_SECURITY_ADMIN',
    'SECURITY_ANALYST',
    'ANALYST'
  )(req, res, next);
}

module.exports = {
  requireRole,
  requireAnyAdmin,
  ROLE_PERMISSIONS,
};
