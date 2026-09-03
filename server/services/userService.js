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
          return { email, createdInFirebase: false, note: 'User already exists in Firebase Auth' };
        }
        console.warn('[Firebase Auth] Note creating user:', data.error.message);
      }
    } catch (e) {
      console.warn('[Firebase Auth] Error calling identitytoolkit:', e.message);
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

    if (!resolvedUid) {
      const fbResult = await this.createFirebaseUser(email, finalPassword, name);
      if (fbResult && fbResult.uid) {
        resolvedUid = fbResult.uid;
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
    return res.rows[0] || null;
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
      ];

      for (const table of dependentTables) {
        try {
          await db.query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]);
        } catch (e) {}
      }

      await db.query('DELETE FROM users WHERE id = $1', [userId]);

      try {
        const { admin } = require('../config/firebaseAdmin');
        if (admin && admin.apps.length > 0 && user.firebase_uid) {
          await admin.auth().deleteUser(user.firebase_uid);
        }
      } catch (fbErr) {}

      return { ...user, status: 'PURGED' };
    }

    // Standard deletion: Convert status to DELETED (Soft Delete)
    if (!allowNonSuspended && user.status !== 'SUSPENDED') {
      throw new Error('User must be in SUSPENDED status before deletion. Please suspend the account first.');
    }

    const updatedUser = await this.updateStatus(userId, 'DELETED');
    return updatedUser;
  }

  async listUsers({ page = 1, limit = 20, search = '', role = '', status = '' } = {}) {
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
    const phishingDefense = Math.min(100, 60 + completedSimsCount * 5);
    const passwordHygiene = Math.min(100, 70 + completedCoursesCount * 6);
    const networkSecurity = Math.min(100, 65 + certCount * 10);
    const threatDetection = Math.min(100, 60 + completedSimsCount * 4 + completedCoursesCount * 3);
    const overallScore = Math.round((phishingDefense + passwordHygiene + networkSecurity + threatDetection) / 4);

    const awarenessLevel = overallScore >= 90 ? 'Expert' : overallScore >= 75 ? 'Advanced' : overallScore >= 50 ? 'Intermediate' : 'Beginner';

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
        categoryScores: {
          phishingDefense,
          passwordHygiene,
          networkSecurity,
          threatDetection,
        },
      },
    };
  }
}

module.exports = new UserService();
