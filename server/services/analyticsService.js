const db = require('../db');

class AnalyticsService {
  /**
   * Complete unified platform & security analytics overview
   */
  async getOverview() {
    // 1. Users count
    const userRes = await db.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(userRes.rows[0]?.total || 0, 10);

    const activeUserRes = await db.query("SELECT COUNT(*) as active FROM users WHERE status = 'ACTIVE'");
    const activeUsers = parseInt(activeUserRes.rows[0]?.active || 0, 10);

    // 2. Course statistics
    const courseCountRes = await db.query('SELECT COUNT(*) as total FROM courses');
    const totalCourses = parseInt(courseCountRes.rows[0]?.total || 0, 10);

    const enrollRes = await db.query('SELECT status, COUNT(*) as count FROM course_enrollments GROUP BY status');
    let totalEnrollments = 0;
    let totalCompletions = 0;
    for (const r of enrollRes.rows) {
      const count = parseInt(r.count, 10);
      totalEnrollments += count;
      if (r.status === 'completed') totalCompletions += count;
    }
    const courseCompletionRate = totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0;

    // 3. Simulation statistics
    const simAttemptsRes = await db.query('SELECT COUNT(*) as total, AVG(score) as avg_score FROM simulation_attempts');
    const totalSimAttempts = parseInt(simAttemptsRes.rows[0]?.total || 0, 10);
    const avgSimScore = Math.round(parseFloat(simAttemptsRes.rows[0]?.avg_score || 0));

    const simOutcomeRes = await db.query('SELECT outcome, COUNT(*) as count FROM simulation_attempts GROUP BY outcome');
    let safeOutcomes = 0;
    for (const r of simOutcomeRes.rows) {
      if (r.outcome === 'safe') safeOutcomes += parseInt(r.count, 10);
    }
    const simSuccessRate = totalSimAttempts > 0 ? Math.round((safeOutcomes / totalSimAttempts) * 100) : 0;

    // 4. Certificates statistics
    const certRes = await db.query("SELECT COUNT(*) as total FROM certifications WHERE status = 'active'");
    const totalCertificates = parseInt(certRes.rows[0]?.total || 0, 10);

    // 5. FlotBot Security Statistics
    const alertCountRes = await db.query('SELECT COUNT(*) as total FROM alerts');
    const totalAlerts = parseInt(alertCountRes.rows[0]?.total || 0, 10);

    const alertSevRes = await db.query('SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity');
    const alertsBySeverity = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const r of alertSevRes.rows) {
      const sev = (r.severity || '').toUpperCase();
      if (alertsBySeverity[sev] !== undefined) {
        alertsBySeverity[sev] = parseInt(r.count, 10);
      }
    }

    const alertStatusRes = await db.query('SELECT status, acknowledged, COUNT(*) as count FROM alerts GROUP BY status, acknowledged');
    let activeThreats = 0;
    let resolvedThreats = 0;
    for (const r of alertStatusRes.rows) {
      const count = parseInt(r.count, 10);
      if (r.status === 'RESOLVED') resolvedThreats += count;
      else if (!r.acknowledged || r.status === 'NEW') activeThreats += count;
    }

    return {
      platform: {
        totalUsers,
        activeUsers,
        totalCourses,
        totalEnrollments,
        totalCompletions,
        courseCompletionRate,
        totalSimAttempts,
        averageSimulationScore: avgSimScore,
        simulationSuccessRate: simSuccessRate,
        totalCertificatesIssued: totalCertificates,
      },
      security: {
        totalAlerts,
        activeThreats,
        resolvedThreats,
        alertsBySeverity,
      },
    };
  }

  /**
   * Course-specific analytics
   */
  async getCourseAnalytics() {
    const popularRes = await db.query(
      `SELECT c.id, c.title, c.cat, c.level, COUNT(e.id) as enrollment_count,
              SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_count
       FROM courses c
       LEFT JOIN course_enrollments e ON c.id = e.course_id
       GROUP BY c.id, c.title, c.cat, c.level
       ORDER BY enrollment_count DESC
       LIMIT 10`
    );

    const popularCourses = popularRes.rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.cat,
      level: r.level,
      enrollmentCount: parseInt(r.enrollment_count, 10),
      completedCount: parseInt(r.completed_count || 0, 10),
      completionRate: parseInt(r.enrollment_count, 10) > 0
        ? Math.round((parseInt(r.completed_count || 0, 10) / parseInt(r.enrollment_count, 10)) * 100)
        : 0,
    }));

    return {
      popularCourses,
    };
  }

  /**
   * Simulation-specific analytics
   */
  async getSimulationAnalytics() {
    const simRes = await db.query(
      `SELECT s.id, s.title, s.category, s.difficulty, COUNT(a.id) as attempt_count,
              AVG(a.score) as avg_score,
              SUM(CASE WHEN a.outcome = 'safe' THEN 1 ELSE 0 END) as safe_count
       FROM simulations s
       LEFT JOIN simulation_attempts a ON s.id = a.simulation_id
       GROUP BY s.id, s.title, s.category, s.difficulty
       ORDER BY attempt_count DESC`
    );

    const simulationMetrics = simRes.rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      difficulty: r.difficulty,
      attempts: parseInt(r.attempt_count, 10),
      avgScore: Math.round(parseFloat(r.avg_score || 0)),
      successRate: parseInt(r.attempt_count, 10) > 0
        ? Math.round((parseInt(r.safe_count || 0, 10) / parseInt(r.attempt_count, 10)) * 100)
        : 0,
    }));

    return {
      simulationMetrics,
    };
  }

  /**
   * FlotBot security-specific analytics
   */
  async getSecurityAnalytics() {
    const alertCatRes = await db.query(
      `SELECT category, COUNT(*) as count FROM alerts GROUP BY category ORDER BY count DESC`
    );

    const categoryDistribution = alertCatRes.rows.map((r) => ({
      category: r.category,
      count: parseInt(r.count, 10),
    }));

    const iocRes = await db.query(
      `SELECT type, COUNT(*) as count FROM iocs WHERE status = 'active' GROUP BY type`
    );
    const activeIocs = {};
    for (const r of iocRes.rows) {
      activeIocs[r.type] = parseInt(r.count, 10);
    }

    return {
      categoryDistribution,
      activeIocs,
    };
  }
}

module.exports = new AnalyticsService();
