const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { ROLE_PERMISSIONS } = require('../middleware/rbac');

/**
 * POST /api/auth/sync
 * Sync current Firebase authenticated user with the backend database.
 * Returns user profile, role, and assigned permissions.
 */
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const permissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.STUDENT;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firebaseUid: user.firebase_uid,
          name: user.name,
          email: user.email,
          profilePicture: user.profile_picture,
          role: user.role,
          status: user.status,
          bio: user.bio,
          organization: user.organization,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          lastLogin: user.last_login,
          createdAt: user.created_at,
        },
        permissions,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user details
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const permissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.STUDENT;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firebaseUid: user.firebase_uid,
          name: user.name,
          email: user.email,
          profilePicture: user.profile_picture,
          role: user.role,
          status: user.status,
          bio: user.bio,
          organization: user.organization,
          level: user.level,
          xp: user.xp,
          streak: user.streak,
          lastLogin: user.last_login,
        },
        permissions,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
