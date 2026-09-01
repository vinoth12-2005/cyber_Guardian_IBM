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
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'INACTIVE'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const now = new Date().toISOString();
    const res = await db.query(
      'UPDATE users SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
      [newStatus, now, userId]
    );
    return res.rows[0] || null;
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
