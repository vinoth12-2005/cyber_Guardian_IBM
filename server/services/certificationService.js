const db = require('../db');
const crypto = require('crypto');

class CertificationService {
  /**
   * Issue a new certificate for user completing course
   */
  async issueCertificate(userId, courseId, scorePct = 100, options = {}) {
    const userRes = await db.query('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    let userName = options.recipientName || 'Security Professional';
    let userEmail = options.userEmail || '';
    if (userRes.rowCount > 0) {
      userName = userRes.rows[0].name || userName;
      userEmail = userRes.rows[0].email || userEmail;
    }

    const courseRes = await db.query('SELECT title, cat, skills_gained, credential_name FROM courses WHERE id = $1', [courseId]);
    const course = courseRes.rowCount > 0 ? courseRes.rows[0] : null;

    const credId =
      options.credId ||
      `CG-CERT-${courseId.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const id = 'cert_' + Math.random().toString(36).substring(2, 10);

    let skills = [];
    if (course && course.skills_gained) {
      try {
        skills = typeof course.skills_gained === 'string' ? JSON.parse(course.skills_gained) : course.skills_gained;
      } catch (e) {
        skills = [];
      }
    }
    if (skills.length === 0 && Array.isArray(options.skills)) {
      skills = options.skills;
    }
    if (skills.length === 0) {
      skills.push((course && course.cat) || 'Cybersecurity Defense');
    }

    // Create cryptographic verification hash
    const verificationPayload = `${credId}|${userEmail}|${courseId}|${scorePct}|${now}`;
    const verificationHash = crypto.createHash('sha256').update(verificationPayload).digest('hex');

    const title =
      (course && course.credential_name) ||
      (course
        ? `${course.title} Specialist Certification`
        : options.courseTitle
        ? `${options.courseTitle} Specialist Certification`
        : 'Cybersecurity Specialist Certification');

    // Check if an active certificate already exists for this user and course
    const existingRes = await db.query(
      'SELECT * FROM certifications WHERE user_id = $1 AND course_id = $2 AND status = $3 LIMIT 1',
      [userId, courseId, 'active']
    );

    let certRecord;
    if (existingRes.rowCount > 0) {
      const existing = existingRes.rows[0];
      const newScore = Math.max(existing.score || 0, scorePct);
      await db.query(
        'UPDATE certifications SET score = $1, recipient_name = $2 WHERE id = $3',
        [newScore, userName, existing.id]
      ).catch(() => {});

      certRecord = this._formatCertificate({
        ...existing,
        score: newScore,
        recipient_name: userName,
        course_title: course ? course.title : options.courseTitle,
      });
    } else {
      await db.query(
        `INSERT INTO certifications (id, cred_id, user_id, course_id, title, recipient_name, score, issue_date, status, skills, verification_hash, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          credId,
          userId,
          courseId,
          title,
          userName,
          scorePct,
          now,
          'active',
          JSON.stringify(skills),
          verificationHash,
          now,
        ]
      );

      certRecord = {
        id,
        credId,
        title,
        recipientName: userName,
        courseId,
        score: scorePct,
        issueDate: now,
        status: 'active',
        skills,
        verificationHash,
        courseTitle: course ? course.title : options.courseTitle,
      };
    }

    // Award XP (+200) to user
    await db.query('UPDATE users SET xp = xp + 200, updated_at = $1 WHERE id = $2', [now, userId]).catch(() => {});

    // Update enrollment status to completed
    await db.query(
      `INSERT INTO course_enrollments (id, user_id, course_id, status, enrolled_at, completed_at)
       VALUES ($1, $2, $3, 'completed', $4, $4)
       ON CONFLICT (user_id, course_id) DO UPDATE SET status = 'completed', completed_at = $4`,
      [`enr_${userId}_${courseId}`, userId, courseId, now]
    ).catch(() => {});

    // Synchronize course_progress table
    await db.query(
      `INSERT INTO course_progress (id, user_id, course_id, quiz_score, final_assessment_score, certified, certified_at, cred_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, 1, $6, $7, $8)
       ON CONFLICT (user_id, course_id) DO UPDATE SET
         quiz_score = $4,
         final_assessment_score = $5,
         certified = 1,
         certified_at = $6,
         cred_id = $7,
         updated_at = $8`,
      [`prog_${userId}_${courseId}`, userId, courseId, scorePct, scorePct, now, certRecord.credId, now]
    ).catch(() => {});

    // Record user activity
    await db.query(
      `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
       VALUES ($1, $2, 'CERTIFICATION_EARNED', $3, $4, 'Training', 'award', $5, $6)`,
      [
        'act_' + Math.random().toString(36).substring(2, 10),
        userId,
        `Earned Certificate: ${title}`,
        `Scored ${scorePct}% on final evaluation. Credential ID: ${certRecord.credId}`,
        JSON.stringify({ courseId, scorePct, credId: certRecord.credId }),
        now,
      ]
    ).catch(() => {});

    return certRecord;
  }

  /**
   * Get all certificates for a user
   */
  async getUserCertificates(userId) {
    const res = await db.query(
      `SELECT c.*, co.title as course_title, co.cat as course_cat, co.icon as course_icon, co.color1, co.color2
       FROM certifications c
       LEFT JOIN courses co ON c.course_id = co.id
       WHERE c.user_id = $1
       ORDER BY c.issue_date DESC`,
      [userId]
    );

    return res.rows.map(this._formatCertificate);
  }

  /**
   * Public verification of a certificate by ID / cred_id
   */
  async verifyCertificate(credId) {
    const res = await db.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, co.title as course_title, co.provider
       FROM certifications c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN courses co ON c.course_id = co.id
       WHERE c.cred_id = $1 OR c.id = $1`,
      [credId]
    );

    if (res.rowCount === 0) return null;
    const row = res.rows[0];

    return {
      credId: row.cred_id,
      title: row.title,
      recipientName: row.recipient_name,
      courseTitle: row.course_title,
      score: row.score,
      issueDate: row.issue_date,
      status: row.status,
      verified: row.status === 'active',
      skills: JSON.parse(row.skills || '[]'),
      verificationHash: row.verification_hash,
      issuer: row.provider || 'CyberGuardian AI Security Institute',
      revocationReason: row.revocation_reason,
      revokedAt: row.revoked_at,
    };
  }

  /**
   * List all certificates with pagination (Admin)
   */
  async listAllCertificates({ page = 1, limit = 20, search = '' } = {}) {
    const offset = (Math.max(1, page) - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(c.cred_id ILIKE $${idx} OR c.recipient_name ILIKE $${idx} OR c.title ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) as total FROM certifications c ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.TOTAL || 0, 10);

    const listSql = `
      SELECT c.*, u.email as user_email
      FROM certifications c
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.issue_date DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const res = await db.query(listSql, params);

    return {
      certificates: res.rows.map(this._formatCertificate),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Revoke certificate (Admin)
   */
  async revokeCertificate(credId, adminId, reason = '') {
    const now = new Date().toISOString();
    const res = await db.query(
      `UPDATE certifications
       SET status = 'revoked', revoked_at = $1, revoked_by = $2, revocation_reason = $3
       WHERE cred_id = $4 OR id = $4
       RETURNING *`,
      [now, adminId, reason, credId]
    );

    if (res.rowCount === 0) throw new Error('Certificate not found');
    return this._formatCertificate(res.rows[0]);
  }

  _formatCertificate(row) {
    let skills = [];
    if (typeof row.skills === 'string') {
      try {
        skills = JSON.parse(row.skills);
      } catch (e) {
        skills = [row.skills];
      }
    } else if (Array.isArray(row.skills)) {
      skills = row.skills;
    }

    return {
      id: row.id,
      credId: row.cred_id,
      userId: row.user_id,
      courseId: row.course_id,
      title: row.title,
      recipientName: row.recipient_name,
      score: row.score,
      issueDate: row.issue_date,
      status: row.status,
      verified: row.status === 'active',
      skills,
      verificationHash: row.verification_hash,
      revocationReason: row.revocation_reason,
      revokedAt: row.revoked_at,
      courseTitle: row.course_title,
      courseCat: row.course_cat,
      courseIcon: row.course_icon,
    };
  }
}

module.exports = new CertificationService();
