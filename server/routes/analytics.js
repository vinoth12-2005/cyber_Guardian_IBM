const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/overview
 * Overview of platform learning and security metrics
 */
router.get('/overview', optionalAuth, async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/courses
 * Course enrollment and completion statistics
 */
router.get('/courses', optionalAuth, async (req, res, next) => {
  try {
    const data = await analyticsService.getCourseAnalytics();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/simulations
 * Simulation attempt and success rate analytics
 */
router.get('/simulations', optionalAuth, async (req, res, next) => {
  try {
    const data = await analyticsService.getSimulationAnalytics();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/analytics/security
 * Security alerts, category distribution, and IOC metrics
 */
router.get('/security', optionalAuth, async (req, res, next) => {
  try {
    const data = await analyticsService.getSecurityAnalytics();
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
