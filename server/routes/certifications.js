const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const db = require('../db');
const certificationService = require('../services/certificationService');

/**
 * POST /api/certifications/claim
 * Claim and issue certificate for completed course
 */
router.post('/claim', optionalAuth, async (req, res, next) => {
  try {
    const { courseId, scorePct, credId, courseTitle, skills, userName, userEmail } = req.body;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'courseId is required' },
      });
    }

    let userId = req.user ? req.user.id : null;

    if (!userId) {
      if (userEmail || userName) {
        const uRes = await db.query(
          'SELECT id FROM users WHERE (email IS NOT NULL AND LOWER(email) = LOWER($1)) OR name = $2 LIMIT 1',
          [userEmail || '', userName || '']
        );
        if (uRes.rowCount > 0) {
          userId = uRes.rows[0].id;
        }
      }
      if (!userId) {
        const fallbackRes = await db.query(
          "SELECT id FROM users WHERE status != 'DELETED' ORDER BY last_login DESC NULLS LAST LIMIT 1"
        );
        if (fallbackRes.rowCount > 0) {
          userId = fallbackRes.rows[0].id;
        }
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User could not be identified to issue certificate' },
      });
    }

    const cert = await certificationService.issueCertificate(
      userId,
      courseId,
      typeof scorePct === 'number' ? scorePct : 100,
      { credId, courseTitle, skills, recipientName: userName, userEmail }
    );

    res.json({
      success: true,
      data: cert,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/certifications/my
 * Get current user's earned certificates
 */
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const certs = await certificationService.getUserCertificates(req.user.id);
    res.json({
      success: true,
      data: certs,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/certifications/verify/:credId
 * Public verification endpoint for a certificate
 */
router.get('/verify/:credId', async (req, res, next) => {
  try {
    const certificate = await certificationService.verifyCertificate(req.params.credId);
    if (!certificate) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CERTIFICATE_NOT_FOUND',
          message: `Certificate with Credential ID '${req.params.credId}' not found`,
        },
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/certifications
 * List all certificates across platform (Admin)
 */
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN', 'SECURITY_ANALYST', 'COURSE_ADMIN'), async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const result = await certificationService.listAllCertificates({ page, limit, search });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
