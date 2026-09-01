const { verifyFirebaseToken } = require('../config/firebaseAdmin');
const db = require('../db');

/**
 * Authentication Middleware: Verifies Firebase ID Token and attaches user record from Database.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or malformed Authorization header. Expected Bearer <token>',
        },
      });
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Empty authentication token',
        },
      });
    }

    // Verify token with Firebase Admin
    const decoded = await verifyFirebaseToken(token);
    const { uid, email, name, picture } = decoded;

    // Find or create user in unified Database
    let user = null;
    const userQuery = await db.query(
      'SELECT id, firebase_uid, name, email, profile_picture, role, status, bio, organization, level, xp, streak, last_login, created_at, updated_at FROM users WHERE firebase_uid = $1',
      [uid]
    );

    const now = new Date().toISOString();

    if (userQuery.rowCount > 0) {
      user = userQuery.rows[0];
      // Update last_login and avatar if changed
      await db.query(
        'UPDATE users SET last_login = $1, profile_picture = COALESCE($2, profile_picture), updated_at = $3 WHERE id = $4',
        [now, picture || null, now, user.id]
      );
      user.last_login = now;
    } else {
      // Create new user in Database
      const newId = 'usr_' + uid.substring(0, 16).replace(/[^a-zA-Z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
      
      // Default to SUPER_ADMIN if email is configured or contains 'admin', else STUDENT
      const isSuperAdmin = (
        (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes((email || '').toLowerCase())) ||
        (email && email.toLowerCase().startsWith('admin@'))
      );
      const initialRole = isSuperAdmin ? 'SUPER_ADMIN' : 'STUDENT';

      await db.query(
        `INSERT INTO users (id, firebase_uid, name, email, profile_picture, role, status, bio, organization, level, xp, streak, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newId,
          uid,
          name || (email ? email.split('@')[0] : 'User'),
          email || `${uid}@cyberguardian.local`,
          picture || null,
          initialRole,
          'ACTIVE',
          'Cybersecurity enthusiast and learner.',
          'CyberGuardian Academy',
          1,
          0,
          0,
          now,
          now,
          now,
        ]
      );

      const createdRes = await db.query('SELECT * FROM users WHERE id = $1', [newId]);
      user = createdRes.rows[0];

      // Record welcome activity
      await db.query(
        `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          'act_' + Math.random().toString(36).substring(2, 10),
          newId,
          'LOGIN',
          'Account created and initial login',
          'Joined CyberGuardian platform',
          'Settings',
          'success',
          JSON.stringify({ role: initialRole }),
          now,
        ]
      );
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended. Please contact platform administrators.',
        },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: err.message || 'Invalid or expired authentication credentials',
      },
    });
  }
}

/**
 * Optional Authentication: Attaches user if valid token exists, otherwise proceeds as guest.
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return authenticate(req, res, (err) => {
    if (err) req.user = null;
    next();
  });
}

module.exports = {
  authenticate,
  optionalAuth,
};
