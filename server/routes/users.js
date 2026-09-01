const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const userService = require('../services/userService');

/**
 * GET /api/users/me
 * Get current user profile and full metrics
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const data = await userService.getUserDashboardStats(req.user.id);
    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/users/me
 * Update current user profile details
 */
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, bio, organization, profilePicture } = req.body;
    const updated = await userService.updateProfile(req.user.id, {
      name,
      bio,
      organization,
      profile_picture: profilePicture,
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        bio: updated.bio,
        organization: updated.organization,
        profilePicture: updated.profile_picture,
        role: updated.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/users/me/dashboard
 * Dashboard stats aggregated from real DB records
 */
router.get('/me/dashboard', authenticate, async (req, res, next) => {
  try {
    const stats = await userService.getUserDashboardStats(req.user.id);
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
