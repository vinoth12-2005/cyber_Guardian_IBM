const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole, requireAnyAdmin } = require('../middleware/rbac');
const { logAdminAction } = require('../middleware/audit');
const userService = require('../services/userService');
const courseService = require('../services/courseService');
const certificationService = require('../services/certificationService');
const securityBehaviourService = require('../services/securityBehaviourService');
const analyticsService = require('../services/analyticsService');
const db = require('../db');

// All admin routes require authentication and an administrative role
router.use(authenticate, requireAnyAdmin);

// ── User Management ──────────────────────────────────────────────────────────

/**
 * GET /api/admin/users
 * List all users with pagination, search, and role filters
 */
router.get('/users', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const { page, limit, search, role, status } = req.query;
    const result = await userService.listUsers({ page, limit, search, role, status });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details & security posture
 */
router.get('/users/:id', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const stats = await userService.getUserDashboardStats(req.params.id);
    let behaviour = null;
    try {
      behaviour = await securityBehaviourService.getUserSecurityBehaviour(req.params.id);
    } catch (e) {}

    res.json({
      success: true,
      data: {
        user,
        stats,
        securityBehaviour: behaviour,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role (with audit log)
 */
router.put('/users/:id/role', requireRole('SUPER_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const previous = await userService.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const updated = await userService.updateRole(req.params.id, role);

    // Audit log
    await logAdminAction(
      req.user,
      'USER_ROLE_CHANGED',
      'users',
      req.params.id,
      { previousRole: previous.role, newRole: role, targetEmail: previous.email },
      req.ip
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id/status
 * Update user account status (with audit log)
 */
router.put('/users/:id/status', requireRole('SUPER_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const previous = await userService.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const updated = await userService.updateStatus(req.params.id, status);

    // Audit log
    await logAdminAction(
      req.user,
      'USER_STATUS_CHANGED',
      'users',
      req.params.id,
      { previousStatus: previous.status, newStatus: status, targetEmail: previous.email },
      req.ip
    );

    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

// ── Course Management ────────────────────────────────────────────────────────

/**
 * POST /api/admin/courses
 * Create and publish a new course
 */
router.post('/courses', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'), async (req, res, next) => {
  try {
    const created = await courseService.createCourse(req.body);

    await logAdminAction(
      req.user,
      'COURSE_PUBLISHED',
      'courses',
      created.id,
      { title: created.title, category: created.cat },
      req.ip
    );

    res.json({
      success: true,
      data: created,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/courses/:id
 * Delete a course
 */
router.delete('/courses/:id', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'), async (req, res, next) => {
  try {
    const success = await courseService.deleteCourse(req.params.id);

    await logAdminAction(
      req.user,
      'COURSE_DELETED',
      'courses',
      req.params.id,
      {},
      req.ip
    );

    res.json({
      success,
      message: success ? 'Course deleted successfully' : 'Course not found',
    });
  } catch (err) {
    next(err);
  }
});

// ── Certification Revocation ─────────────────────────────────────────────────

/**
 * POST /api/admin/certifications/:credId/revoke
 * Revoke an issued certificate
 */
router.post('/certifications/:credId/revoke', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const revoked = await certificationService.revokeCertificate(req.params.credId, req.user.id, reason || '');

    await logAdminAction(
      req.user,
      'CERTIFICATE_REVOKED',
      'certifications',
      req.params.credId,
      { reason, recipient: revoked.recipientName },
      req.ip
    );

    res.json({
      success: true,
      data: revoked,
    });
  } catch (err) {
    next(err);
  }
});

// ── User Security Behaviour ──────────────────────────────────────────────────

/**
 * GET /api/admin/flotbot/user-behaviour
 * Get security behaviour analytics for all users
 */
router.get('/flotbot/user-behaviour', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const data = await securityBehaviourService.getAllUsersSecurityBehaviour();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ── Unified Audit Logs ───────────────────────────────────────────────────────

/**
 * GET /api/admin/audit-logs
 * List unified admin audit logs with filtering & pagination
 */
router.get('/audit-logs', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'FLOTBOT_SECURITY_ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action = '', search = '' } = req.query;
    const offset = (Math.max(1, page) - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (action) {
      conditions.push(`action = $${idx++}`);
      params.push(action);
    }

    if (search) {
      conditions.push(`(admin_name ILIKE $${idx} OR admin_email ILIKE $${idx} OR resource ILIKE $${idx} OR action ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) as total FROM admin_audit_logs ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.TOTAL || 0, 10);

    const listSql = `
      SELECT * FROM admin_audit_logs
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(parseInt(limit, 10), offset);

    const resList = await db.query(listSql, params);

    const logs = resList.rows.map((r) => ({
      id: r.id,
      adminId: r.admin_id,
      adminName: r.admin_name,
      adminEmail: r.admin_email,
      action: r.action,
      resource: r.resource,
      resourceId: r.resource_id,
      metadata: JSON.parse(r.metadata_json || '{}'),
      ipAddress: r.ip_address,
      timestamp: r.timestamp,
    }));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── Admin Stats Overview ─────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Unified administrative statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const overview = await analyticsService.getOverview();
    res.json({
      success: true,
      data: overview,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
