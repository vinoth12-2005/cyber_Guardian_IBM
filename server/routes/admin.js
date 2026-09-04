const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { requireRole, requireAnyAdmin } = require('../middleware/rbac');
const { logAdminAction } = require('../middleware/audit');
const userService = require('../services/userService');
const courseService = require('../services/courseService');
const pdfCourseService = require('../services/pdfCourseService');
const simulationService = require('../services/simulationService');
const certificationService = require('../services/certificationService');
const securityBehaviourService = require('../services/securityBehaviourService');
const analyticsService = require('../services/analyticsService');
const db = require('../db');

// Multer memory storage for PDF parsing
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Multer disk storage for course videos & images
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads/courses');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBase}_${Date.now()}${ext}`);
  },
});
const mediaUpload = multer({
  storage: mediaStorage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB (handles video lectures & high-res images)
});

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
 * POST /api/admin/users
 * Create a new user manually by Super Admin / User Admin
 */
router.post('/users', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const { name, email, password, role, organization, bio, status, firebaseUid } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email address is required' },
      });
    }

    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only SUPER_ADMIN can create accounts with the SUPER_ADMIN role' },
      });
    }

    const user = await userService.createUser({
      name: name?.trim(),
      email: email.trim().toLowerCase(),
      password: password?.trim(),
      role: role || 'EMPLOYEE',
      organization: organization?.trim(),
      bio: bio?.trim(),
      status: status || 'ACTIVE',
      firebaseUid: firebaseUid?.trim(),
    });

    // Audit log
    await logAdminAction(
      req.user,
      'USER_CREATED',
      'users',
      user.id,
      { email: user.email, name: user.name, role: user.role, organization: user.organization },
      req.ip
    );

    res.status(201).json({
      success: true,
      data: user,
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
router.put('/users/:id/role', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    const previous = await userService.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only SUPER_ADMIN can assign the SUPER_ADMIN role' },
      });
    }

    if (previous.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only SUPER_ADMIN can modify the role of another SUPER_ADMIN' },
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
router.put('/users/:id/status', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const previous = await userService.findById(req.params.id);
    if (!previous) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    if (previous.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only SUPER_ADMIN can alter the account status of another SUPER_ADMIN' },
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

/**
 * DELETE /api/admin/users/:id
 * Permanently delete a suspended user (with audit log)
 */
router.delete('/users/:id', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN'), async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (req.user.id === targetId) {
      return res.status(400).json({
        success: false,
        error: { code: 'CANNOT_DELETE_SELF', message: 'You cannot delete your own administrative account.' },
      });
    }

    const previous = await userService.findById(targetId);
    if (!previous) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found.' },
      });
    }

    if (previous.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only SUPER_ADMIN can delete another SUPER_ADMIN account' },
      });
    }

    const force = req.query.force === 'true';
    const permanent = req.query.permanent === 'true';
    const result = await userService.deleteUser(targetId, { allowNonSuspended: force, permanent });

    // Audit log
    await logAdminAction(
      req.user,
      permanent ? 'USER_PURGED' : 'USER_DELETED',
      'users',
      targetId,
      { email: previous.email, name: previous.name, role: previous.role, previousStatus: previous.status, permanent },
      req.ip
    );

    res.json({
      success: true,
      data: {
        id: targetId,
        email: previous.email,
        name: previous.name,
        status: result?.status || (permanent ? 'PURGED' : 'DELETED'),
        firebaseDeleted: result?.firebaseDeleted || false,
        message: permanent
          ? (result?.firebaseDeleted
              ? `User ${previous.email} permanently purged from both local Database and Firebase Auth.`
              : `User ${previous.email} purged from Database. Note: To auto-delete from Firebase Auth, add serviceAccountKey.json to root.`)
          : `User ${previous.email} marked as DELETED.`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── Course Management ────────────────────────────────────────────────────────

/**
 * POST /api/admin/courses/generate-from-pdf
 * Upload course PDF, extract text & embedded images, and auto-generate structured course blueprint with FlotBot
 */
router.post(
  '/courses/generate-from-pdf',
  requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'),
  memoryUpload.single('pdf'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'Please upload a valid PDF file' },
        });
      }

      const originalFilename = req.file.originalname;
      const customInstructions = req.body.customInstructions || '';

      const generated = await pdfCourseService.generateCourseFromPdf(
        req.file.buffer,
        originalFilename,
        customInstructions
      );

      // Audit log
      await logAdminAction(
        req.user,
        'COURSE_AI_GENERATED_FROM_PDF',
        'courses',
        generated.courseBlueprint?.title || originalFilename,
        {
          filename: originalFilename,
          pageCount: generated.stats?.pageCount,
          imagesExtracted: generated.stats?.imagesFound,
        },
        req.ip
      );

      res.json({
        success: true,
        data: generated,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/courses/upload-media
 * Upload course video lecture or high-resolution diagram/image
 */
router.post(
  '/courses/upload-media',
  requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'),
  mediaUpload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_FILE', message: 'Please select a file to upload' },
        });
      }

      const fileUrl = `/uploads/courses/${req.file.filename}`;
      const isVideo = req.file.mimetype.startsWith('video/');

      res.json({
        success: true,
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          sizeBytes: req.file.size,
          mimetype: req.file.mimetype,
          isVideo,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/courses
 * Create and stage/publish a new course
 */
router.post('/courses', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'), async (req, res, next) => {
  try {
    const coursePayload = {
      ...req.body,
      createdBy: req.user ? req.user.id : null,
    };
    const created = await courseService.createCourse(coursePayload);

    await logAdminAction(
      req.user,
      created.status === 'draft' ? 'COURSE_DRAFTED' : 'COURSE_PUBLISHED',
      'courses',
      created.id,
      { title: created.title, category: created.cat, status: created.status },
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
 * PUT /api/admin/courses/:id/publish
 * Publish a draft course live to students
 */
router.put('/courses/:id/publish', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'), async (req, res, next) => {
  try {
    const published = await courseService.publishCourse(req.params.id);
    if (!published) {
      return res.status(404).json({
        success: false,
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' },
      });
    }

    await logAdminAction(
      req.user,
      'COURSE_PUBLISHED',
      'courses',
      published.id,
      { title: published.title, category: published.cat },
      req.ip
    );

    res.json({
      success: true,
      data: published,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/courses/:id
 * Update and customize an existing course
 */
router.put('/courses/:id', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'), async (req, res, next) => {
  try {
    const updated = await courseService.updateCourse(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' },
      });
    }

    await logAdminAction(
      req.user,
      'COURSE_UPDATED',
      'courses',
      req.params.id,
      { title: updated.title, category: updated.cat },
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

// ── Simulation Management ──────────────────────────────────────────────────

/**
 * POST /api/admin/simulations
 * Create and publish a new simulation scenario
 */
router.post('/simulations', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'), async (req, res, next) => {
  try {
    const created = await simulationService.createSimulation(req.body);

    await logAdminAction(
      req.user,
      'SIMULATION_CREATED',
      'simulations',
      created.id,
      { title: created.title, category: created.category },
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
 * PUT /api/admin/simulations/:id
 * Update and customize an existing simulation scenario
 */
router.put('/simulations/:id', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'), async (req, res, next) => {
  try {
    const updated = await simulationService.updateSimulation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'SIMULATION_NOT_FOUND', message: 'Simulation not found' },
      });
    }

    await logAdminAction(
      req.user,
      'SIMULATION_UPDATED',
      'simulations',
      req.params.id,
      { title: updated.title, category: updated.category },
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
 * DELETE /api/admin/simulations/:id
 * Delete a simulation scenario
 */
router.delete('/simulations/:id', requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN'), async (req, res, next) => {
  try {
    const success = await simulationService.deleteSimulation(req.params.id);

    await logAdminAction(
      req.user,
      'SIMULATION_DELETED',
      'simulations',
      req.params.id,
      {},
      req.ip
    );

    res.json({
      success,
      message: success ? 'Simulation deleted successfully' : 'Simulation not found',
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
