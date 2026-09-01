const db = require('../db');
const crypto = require('crypto');

class CertificationService {
  /**
   * Issue a new certificate for user completing course
   */
  async issueCertificate(userId, courseId, scorePct) {
    const userRes = await db.query('SELECT name, email FROM users WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) throw new Error('User not found');
    const user = userRes.rows[0];

    const courseRes = await db.query('SELECT title, cat, skills_gained, credential_name FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rowCount === 0) throw new Error('Course not found');
    const course = courseRes.rows[0];

    const credId = `CG-CERT-${courseId.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();
    const id = 'cert_' + Math.random().toString(36).substring(2, 10);

    const skills = JSON.parse(course.skills_gained || '[]');
    if (skills.length === 0) skills.push(course.cat || 'Cybersecurity Defense');

    // Create cryptographic verification hash
    const verificationPayload = `${credId}|${user.email}|${courseId}|${scorePct}|${now}`;
    const verificationHash = crypto.createHash('sha256').update(verificationPayload).digest('hex');

    const title = course.credential_name || `${course.title} Specialist Certification`;

    await db.query(
      `INSERT INTO certifications (id, cred_id, user_id, course_id, title, recipient_name, score, issue_date, status, skills, verification_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        credId,
        userId,
        courseId,
        title,
        user.name,
        scorePct,
        now,
        'active',
        JSON.stringify(skills),
        verificationHash,
        now,
      ]
    );

    return {
      id,
      credId,
      title,
      recipientName: user.name,
      courseId,
      score: scorePct,
      issueDate: now,
      status: 'active',
      skills,
      verificationHash,
    };
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
      skills: JSON.parse(row.skills || '[]'),
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
