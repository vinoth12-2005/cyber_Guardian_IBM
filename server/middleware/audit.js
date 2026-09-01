const db = require('../db');

/**
 * Log an administrative action to the unified admin audit log.
 */
async function logAdminAction(adminUser, action, resource, resourceId = null, metadata = {}, ipAddress = null) {
  try {
    const id = 'audit_' + Math.random().toString(36).substring(2, 12);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO admin_audit_logs (id, admin_id, admin_name, admin_email, action, resource, resource_id, metadata_json, ip_address, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        adminUser?.id || 'system',
        adminUser?.name || 'System Admin',
        adminUser?.email || 'admin@cyberguardian.local',
        action,
        resource,
        resourceId ? String(resourceId) : null,
        JSON.stringify(metadata),
        ipAddress,
        now,
      ]
    );
  } catch (err) {
    console.error('[Admin Audit Log] Failed to write log:', err.message);
  }
}

/**
 * Express middleware helper to automatically record an admin audit event upon response completion
 */
function auditAction(action, resource, getResourceId = (req) => req.params.id) {
  return (req, res, next) => {
    const originalSend = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const resourceId = typeof getResourceId === 'function' ? getResourceId(req) : null;
        logAdminAction(
          req.user,
          action,
          resource,
          resourceId,
          { body: req.body, query: req.query },
          req.ip || req.socket.remoteAddress
        );
      }
      return originalSend.apply(this, arguments);
    };
    next();
  };
}

module.exports = {
  logAdminAction,
  auditAction,
};
