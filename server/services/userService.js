const db = require('../db');

class UserService {
  async findById(userId) {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return res.rows[0] || null;
  }

  async findByFirebaseUid(uid) {
    const res = await db.query('SELECT * FROM users WHERE firebase_uid = $1', [uid]);
    return res.rows[0] || null;
  }

  async findByEmail(email) {
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] || null;
  }

  async createFirebaseUser(email, password, displayName) {
    try {
      const { admin } = require('../config/firebaseAdmin');
      if (admin && admin.apps && admin.apps.length > 0) {
        try {
          const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
          });
          return { uid: userRecord.uid, email: userRecord.email, createdInFirebase: true };
        } catch (adminErr) {
          if (adminErr.code === 'auth/email-already-exists') {
            try {
              const existing = await admin.auth().getUserByEmail(email);
              return { uid: existing.uid, email: existing.email, createdInFirebase: false, existsInFirebase: true, note: 'User already exists in Firebase Auth' };
            } catch (e) {
              return { email, createdInFirebase: false, existsInFirebase: true, note: 'User already exists in Firebase Auth' };
            }
          }
          console.warn('[Firebase Admin] Note creating user:', adminErr.message);
        }
      }
    } catch (e) {}

    const apiKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDjPVMc_frUBiZUFp5kR6emxRlJk53N5TQ';
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          displayName,
          returnSecureToken: true,
        }),
      });
      const data = await response.json();
      if (data.localId) {
        return { uid: data.localId, email: data.email, createdInFirebase: true };
      } else if (data.error) {
        if (data.error.message === 'EMAIL_EXISTS') {
          return { email, createdInFirebase: false, existsInFirebase: true, note: 'User already exists in Firebase Auth' };
        }
        console.warn('[Firebase Auth] Note creating user:', data.error.message);
        return { email, createdInFirebase: false, error: data.error.message };
      }
    } catch (e) {
      console.warn('[Firebase Auth] Error calling identitytoolkit:', e.message);
      return { email, createdInFirebase: false, error: e.message };
    }
    return null;
  }

  async createUser(userData = {}) {
    const {
      name,
      email,
      password,
      role = 'EMPLOYEE',
      organization = 'Enterprise CyberGuardian Organization',
      bio = 'Enterprise workforce security member.',
      status = 'ACTIVE',
      firebaseUid,
    } = userData;

    if (!email) {
      throw new Error('Email address is required to create a user');
    }

    const existing = await this.findByEmail(email);
    if (existing) {
      throw new Error(`A user account with email "${email}" already exists in the database.`);
    }

    // Provision in Firebase Authentication if password provided
    let resolvedUid = firebaseUid;
    const finalPassword = password || 'TempPass@' + Math.floor(1000 + Math.random() * 9000);
    let firebaseStatus = { created: false, note: null };

    if (!resolvedUid) {
      const fbResult = await this.createFirebaseUser(email, finalPassword, name);
      if (fbResult && fbResult.uid) {
        resolvedUid = fbResult.uid;
        firebaseStatus = { created: true, note: 'Account created in Firebase Auth' };
      } else if (fbResult && fbResult.existsInFirebase) {
        firebaseStatus = { created: false, alreadyExisted: true, note: 'User already existed in Firebase Auth' };
        try {
          const { admin } = require('../config/firebaseAdmin');
          if (admin && admin.apps && admin.apps.length > 0) {
            const existingFb = await admin.auth().getUserByEmail(email);
            resolvedUid = existingFb.uid;
          }
        } catch (e) {}
      } else {
        firebaseStatus = { created: false, error: fbResult?.error || 'Could not provision in Firebase Auth' };
      }
    } else {
      firebaseStatus = { created: true, note: 'Supplied external Firebase UID' };
    }

    // Set custom user claims in Firebase Auth so role is cloud-synced across all machines
    if (resolvedUid && !resolvedUid.startsWith('usr_manual_')) {
      try {
        const { admin } = require('../config/firebaseAdmin');
        if (admin && admin.apps && admin.apps.length > 0) {
          await admin.auth().setCustomUserClaims(resolvedUid, { role });
          console.log(`[Firebase Auth] Synced custom claims for ${email}: { role: '${role}' }`);
        }
      } catch (claimErr) {
        console.warn(`[Firebase Auth] Could not set custom claims for ${email}:`, claimErr.message);
      }
    }

    const uid = resolvedUid || 'usr_manual_' + Math.random().toString(36).substring(2, 12);
    const newId = 'usr_' + uid.substring(0, 16).replace(/[^a-zA-Z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO users (id, firebase_uid, name, email, profile_picture, role, status, bio, organization, level, xp, streak, last_login, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const params = [
      newId,
      uid,
      name || email.split('@')[0],
      email,
      null,
      role,
      status,
      bio,
      organization,
      1,
      0,
      0,
      null,
      now,
      now,
    ];

    const res = await db.query(sql, params);

    // Record welcome activity
    try {
      await db.query(
        `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          'act_' + Math.random().toString(36).substring(2, 10),
          newId,
          'ACCOUNT_PROVISIONED',
          'User provisioned by Super Administrator',
          `Account created with role ${role}`,
          'administrative',
          'user',
          JSON.stringify({ createdByAdmin: true, initialRole: role }),
          now,
        ]
      );
    } catch (e) {}

    const createdUser = res.rows[0];
    return {
      ...createdUser,
      tempPassword: finalPassword,
      firebaseStatus,
    };
  }

  async updateProfile(userId, updates = {}) {
    const allowed = ['name', 'bio', 'organization', 'profile_picture'];
    const setClauses = [];
    const params = [];
    let idx = 1;

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = $${idx++}`);
        params.push(updates[key]);
      }
    }

    if (setClauses.length === 0) return await this.findById(userId);

    const now = new Date().toISOString();
    setClauses.push(`updated_at = $${idx++}`);
    params.push(now);

    params.push(userId);
    const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await db.query(sql, params);
    return res.rows[0] || null;
  }

  async updateRole(userId, newRole) {
    const validRoles = [
      'SUPER_ADMIN',
      'PLATFORM_ADMIN',
      'USER_ADMIN',
      'COURSE_ADMIN',
      'SIMULATION_ADMIN',
      'CERTIFICATION_ADMIN',
      'FLOTBOT_SECURITY_ADMIN',
      'SECURITY_ANALYST',
      'ANALYST',
      'STUDENT',
    ];

    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}. Supported roles: ${validRoles.join(', ')}`);
    }

    const now = new Date().toISOString();
    const res = await db.query(
      'UPDATE users SET role = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [newRole, now, userId]
    );
    const updatedUser = res.rows[0] || null;

    if (updatedUser && updatedUser.firebase_uid && !updatedUser.firebase_uid.startsWith('usr_manual_')) {
      try {
        const { admin } = require('../config/firebaseAdmin');
        if (admin && admin.apps && admin.apps.length > 0) {
          await admin.auth().setCustomUserClaims(updatedUser.firebase_uid, { role: newRole });
          console.log(`[Firebase Auth] Updated custom claims for ${updatedUser.email}: { role: '${newRole}' }`);
        }
      } catch (claimErr) {
        console.warn(`[Firebase Auth] Could not update custom claims for ${updatedUser.email}:`, claimErr.message);
      }
    }

    return updatedUser;
  }

  async updateStatus(userId, newStatus) {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'DELETED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Supported: ${validStatuses.join(', ')}`);
    }

    const now = new Date().toISOString();
    const res = await db.query(
      'UPDATE users SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [newStatus, now, userId]
    );

    // If status is SUSPENDED or DELETED, disable user in Firebase if admin SDK available
    if (newStatus === 'SUSPENDED' || newStatus === 'DELETED') {
      try {
        const { admin } = require('../config/firebaseAdmin');
        const user = res.rows[0];
        if (admin && admin.apps.length > 0 && user?.firebase_uid) {
          await admin.auth().updateUser(user.firebase_uid, { disabled: true });
        }
      } catch (fbErr) {}
    } else if (newStatus === 'ACTIVE') {
      try {
        const { admin } = require('../config/firebaseAdmin');
        const user = res.rows[0];
        if (admin && admin.apps.length > 0 && user?.firebase_uid) {
          await admin.auth().updateUser(user.firebase_uid, { disabled: false });
        }
      } catch (fbErr) {}
    }

    return res.rows[0] || null;
  }

  async deleteUser(userId, { allowNonSuspended = false, permanent = false } = {}) {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Permanent hard delete option (purges from database)
    if (permanent) {
      const dependentTables = [
        'course_quiz_submissions',
        'course_progress',
        'course_enrollments',
        'simulation_events',
        'simulation_attempts',
        'certifications',
        'user_activity',
        'security_behavior',
        'chat_messages',
        'chat_sessions',
      ];

      for (const table of dependentTables) {
        try {
          await db.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
        } catch (e) {}
      }

      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      let firebaseDeleted = false;
      let firebaseError = null;

      try {
        const { admin } = require('../config/firebaseAdmin');
        if (admin && admin.apps.length > 0 && user.firebase_uid && !user.firebase_uid.startsWith('usr_manual_')) {
          await admin.auth().deleteUser(user.firebase_uid);
          firebaseDeleted = true;
          console.log(`[Firebase Admin] Successfully deleted user ${user.firebase_uid} (${user.email}) from Firebase Cloud.`);
        }
      } catch (fbErr) {
        firebaseError = fbErr.message;
        console.warn(`[Firebase Admin] Could not delete user from Firebase Cloud (${fbErr.message}). Place serviceAccountKey.json in root to auto-delete from Firebase Auth.`);
      }

      return { ...user, status: 'PURGED', firebaseDeleted, firebaseError };
    }

    // Standard deletion: Convert status to DELETED (Soft Delete)
    if (!allowNonSuspended && user.status !== 'SUSPENDED') {
      throw new Error('User must be in SUSPENDED status before deletion. Please suspend the account first.');
    }

    const updatedUser = await this.updateStatus(userId, 'DELETED');
    return updatedUser;
  }

  async listUsers({ page = 1, limit = 20, search = '', role = '', status = '', triggerCloudSync = true } = {}) {
    if (triggerCloudSync && (!this._lastFirebaseSync || Date.now() - this._lastFirebaseSync > 20000)) {
      this._lastFirebaseSync = Date.now();
      try {
        await this.syncWithFirebaseUsers();
      } catch (e) {}
    }

    const offset = (Math.max(1, page) - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx} OR organization ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    if (role) {
      conditions.push(`role = $${idx}`);
      params.push(role);
      idx++;
    }

    if (status) {
      conditions.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countRes = await db.query(countSql, params);
    const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.TOTAL || 0, 10);

    const listSql = `
      SELECT id, firebase_uid, name, email, profile_picture, role, status, organization, level, xp, streak, last_login, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const listRes = await db.query(listSql, params);

    return {
      users: listRes.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserDashboardStats(userId) {
    const user = await this.findById(userId);
    if (!user) throw new Error('User not found');

    // 1. Completed & Enrolled courses count
    const enrollRes = await db.query(
      `SELECT status, COUNT(*) as count FROM course_enrollments WHERE user_id = $1 GROUP BY status`,
      [userId]
    );
    let enrolledCount = 0;
    let completedCoursesCount = 0;
    for (const r of enrollRes.rows) {
      enrolledCount += parseInt(r.count, 10);
      if (r.status === 'completed') completedCoursesCount += parseInt(r.count, 10);
    }

    // 2. Simulation attempts count & average score
    const simRes = await db.query(
      `SELECT COUNT(*) as total, AVG(score) as avg_score FROM simulation_attempts WHERE user_id = $1`,
      [userId]
    );
    const completedSimsCount = parseInt(simRes.rows[0]?.total || 0, 10);
    const avgSimScore = Math.round(parseFloat(simRes.rows[0]?.avg_score || 0));

    // 3. Certificates earned count
    const certRes = await db.query(
      `SELECT COUNT(*) as total FROM certifications WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );
    const certCount = parseInt(certRes.rows[0]?.total || 0, 10);

    // 4. Awareness score calculation based on real accomplishments
    let phishingDefense = 0;
    let passwordHygiene = 0;
    let networkSecurity = 0;
    let threatDetection = 0;

    if (completedCoursesCount > 0 || completedSimsCount > 0 || certCount > 0) {
      // Phishing Defense: Driven by simulations completed and sim scores
      phishingDefense = completedSimsCount > 0
        ? Math.min(100, Math.round((avgSimScore * 0.6) + (completedSimsCount * 12)))
        : (enrolledCount > 0 ? 25 : 0);

      // Password Hygiene: Driven by course completions & enrolled progress
      passwordHygiene = completedCoursesCount > 0
        ? Math.min(100, Math.round(35 + (completedCoursesCount * 22)))
        : (enrolledCount > 0 ? 20 : 0);

      // Network Security: Driven by verified certificates & completed advanced modules
      networkSecurity = certCount > 0
        ? Math.min(100, Math.round(40 + (certCount * 20)))
        : (completedCoursesCount > 0 ? 30 : 0);

      // Threat Detection: Driven by simulations, courses, and certifications
      threatDetection = Math.min(
        100,
        Math.round(
          (completedSimsCount > 0 ? avgSimScore * 0.4 : 0) +
          (completedCoursesCount * 15) +
          (certCount * 15)
        )
      );
    } else if (enrolledCount > 0) {
      // Enrolled but not yet finished: show entry learner score
      phishingDefense = 15;
      passwordHygiene = 15;
      networkSecurity = 10;
      threatDetection = 10;
    }

    const overallScore = Math.round((phishingDefense + passwordHygiene + networkSecurity + threatDetection) / 4);
    const awarenessLevel = overallScore >= 85 ? 'Expert' : overallScore >= 70 ? 'Advanced' : overallScore >= 40 ? 'Intermediate' : 'Beginner';

    // Query recent activity for weekly progress calculation
    const recentActRes = await db.query(
      `SELECT COUNT(*) as count FROM user_activity WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'`,
      [userId]
    ).catch(() => ({ rows: [{ count: 0 }] }));
    const recentCount = parseInt(recentActRes.rows[0]?.count || 0, 10);
    const weeklyProgress = Math.min(25, Math.max(0, recentCount * 3 + (completedCoursesCount > 0 ? 5 : 0)));

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.profile_picture || '',
        role: user.role,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        organization: user.organization,
        awarenessLevel,
      },
      stats: {
        enrolledCourses: enrolledCount,
        completedCourses: completedCoursesCount,
        completedSimulations: completedSimsCount,
        averageSimulationScore: avgSimScore,
        earnedCertificates: certCount,
        streakDays: user.streak,
      },
      awarenessScore: {
        overallScore,
        maxScore: 100,
        level: awarenessLevel,
        weeklyProgress,
        categoryScores: {
          phishingDefense,
          passwordHygiene,
          networkSecurity,
          threatDetection,
        },
      },
    };
  }

  /**
   * Synchronize users and roles between Firebase Auth Cloud and Local Database.
   * Pulls any accounts created on other machines and syncs cloud custom claims.
   */
  async syncWithFirebaseUsers() {
    try {
      const { admin } = require('../config/firebaseAdmin');
      if (!admin || !admin.apps || admin.apps.length === 0) {
        return { synced: false, reason: 'Firebase Admin not initialized' };
      }

      const listResult = await admin.auth().listUsers(1000);
      const fbUsers = listResult.users;
      let imported = 0;
      let updated = 0;

      for (const fbUser of fbUsers) {
        const email = (fbUser.email || '').trim().toLowerCase();
        if (!email) continue;

        const uid = fbUser.uid;
        const roleInClaims = fbUser.customClaims?.role;
        const displayName = fbUser.displayName || email.split('@')[0];

        const existingRes = await db.query(
          'SELECT id, firebase_uid, role, status FROM users WHERE firebase_uid = $1 OR (email IS NOT NULL AND LOWER(email) = $2)',
          [uid, email]
        );

        const now = new Date().toISOString();

        if (existingRes.rowCount > 0) {
          const dbUser = existingRes.rows[0];
          // If DB has a role and Firebase claims is empty, upload DB role to Firebase
          if (dbUser.role && dbUser.role !== 'EMPLOYEE' && !roleInClaims) {
            try {
              await admin.auth().setCustomUserClaims(uid, { role: dbUser.role });
              console.log(`[Firebase Auth] Backfilled cloud role for ${email}: ${dbUser.role}`);
            } catch (e) {}
          }
          // If Firebase claims has a role and DB has a different role, update DB
          else if (roleInClaims && roleInClaims !== dbUser.role) {
            await db.query(
              'UPDATE users SET role = $1, firebase_uid = $2, updated_at = $3 WHERE id = $4',
              [roleInClaims, uid, now, dbUser.id]
            );
            updated++;
            console.log(`[Firebase Auth] Synced local DB role for ${email} from cloud: ${roleInClaims}`);
          }
        } else {
          // New user created on another laptop: import into local DB!
          const newId = 'usr_' + uid.substring(0, 16).replace(/[^a-zA-Z0-9]/g, '') + '_' + Math.random().toString(36).substring(2, 6);
          const assignedRole = roleInClaims || (email.startsWith('admin@') ? 'SUPER_ADMIN' : 'EMPLOYEE');

          await db.query(
            `INSERT INTO users (id, firebase_uid, name, email, profile_picture, role, status, bio, organization, level, xp, streak, last_login, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
            [
              newId,
              uid,
              displayName,
              email,
              fbUser.photoURL || null,
              assignedRole,
              fbUser.disabled ? 'SUSPENDED' : 'ACTIVE',
              'Enterprise workforce security member.',
              'Enterprise CyberGuardian Organization',
              1,
              0,
              0,
              fbUser.metadata?.lastSignInTime ? new Date(fbUser.metadata.lastSignInTime).toISOString() : null,
              fbUser.metadata?.creationTime ? new Date(fbUser.metadata.creationTime).toISOString() : now,
              now,
            ]
          );
          imported++;
          console.log(`[Firebase Auth] Imported new cloud user ${email} (${assignedRole}) into local database`);
        }
      }

      return { synced: true, total: fbUsers.length, imported, updated };
    } catch (err) {
      console.warn('[Firebase Auth] Sync error:', err.message);
      return { synced: false, error: err.message };
    }
  }
}

module.exports = new UserService();
