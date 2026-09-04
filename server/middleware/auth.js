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
    const normalizedEmail = (email || '').trim().toLowerCase();
    const userQuery = await db.query(
      'SELECT id, firebase_uid, name, email, profile_picture, role, status, bio, organization, level, xp, streak, last_login, created_at, updated_at FROM users WHERE firebase_uid = $1 OR (email IS NOT NULL AND email != \'\' AND LOWER(email) = $2)',
      [uid, normalizedEmail]
    );

    const now = new Date().toISOString();

    const isSuperAdmin = (
      (process.env.ADMIN_EMAILS && process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).includes(normalizedEmail)) ||
      (normalizedEmail && normalizedEmail.startsWith('admin@'))
    );

    if (userQuery.rowCount > 0) {
      user = userQuery.rows[0];

      // If this account was previously marked DELETED in the database:
      // Check if it was recreated in Firebase with a NEW UID
      if (user.status === 'DELETED') {
        if (user.firebase_uid !== uid) {
          // Re-registered in Firebase with a new UID: purge old deleted ghost record
          await db.query('DELETE FROM user_activity WHERE user_id = $1', [user.id]);
          await db.query('DELETE FROM users WHERE id = $1', [user.id]);
          user = null;
        } else {
          return res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_DELETED',
              message: 'This account has been deleted. Please contact platform administrators.',
            },
          });
        }
      }
    }

    if (user) {
      // If the user's role in Firebase claims is specified, synchronize it with the local database
      let effectiveRole = user.role;
      const cloudRole = decoded.role || (decoded.rawClaims && decoded.rawClaims.role);

      if (cloudRole && cloudRole !== user.role && !isSuperAdmin) {
        effectiveRole = cloudRole;
      } else if (isSuperAdmin) {
        effectiveRole = decoded.role || user.role || 'SUPER_ADMIN';
      }

      const userName = name || user.name;
      await db.query(
        'UPDATE users SET firebase_uid = $1, name = COALESCE($2, name), last_login = $3, profile_picture = COALESCE($4, profile_picture), role = $5, updated_at = $6 WHERE id = $7',
        [uid, userName, now, picture || null, effectiveRole, now, user.id]
      );
      user.firebase_uid = uid;
      user.name = userName;
      user.last_login = now;
      user.role = effectiveRole;
    } else {
      // Create new user in Database
      const newId = 'usr_' + uid.substring(0, 16).replace(/[^a-zA-Z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
      
      // Determine initial role: Check token claim, or query Firebase Admin SDK directly
      let initialRole = decoded.role || (decoded.rawClaims && decoded.rawClaims.role);
      if (!initialRole && !isSuperAdmin) {
        try {
          const { admin } = require('../config/firebaseAdmin');
          if (admin && admin.apps && admin.apps.length > 0 && uid && !uid.startsWith('usr_manual_')) {
            const fbUser = await admin.auth().getUser(uid);
            if (fbUser && fbUser.customClaims && fbUser.customClaims.role) {
              initialRole = fbUser.customClaims.role;
            }
          }
        } catch (claimFetchErr) {}
      }

      if (!initialRole) {
        initialRole = isSuperAdmin ? 'SUPER_ADMIN' : 'EMPLOYEE';
      }

      await db.query(
        `INSERT INTO users (id, firebase_uid, name, email, profile_picture, role, status, bio, organization, level, xp, streak, last_login, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          newId,
          uid,
          name || (email ? email.split('@')[0] : 'Employee'),
          email || `${uid}@cyberguardian.local`,
          picture || null,
          initialRole,
          'ACTIVE',
          'Enterprise workforce security member.',
          'Enterprise CyberGuardian Organization',
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

    if (user.status === 'DELETED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DELETED',
          message: 'This account has been deleted. Please contact platform administrators.',
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
