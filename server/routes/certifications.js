const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const certificationService = require('../services/certificationService');

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
router.get('/', authenticate, requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN'), async (req, res, next) => {
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
