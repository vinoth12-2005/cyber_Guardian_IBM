const db = require('../db');

class SecurityBehaviourService {
  /**
   * Calculate real security behavior metrics for a specific user based on actual database records
   */
  async getUserSecurityBehaviour(userId) {
    const userRes = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) throw new Error('User not found');
    const user = userRes.rows[0];

    // 1. Query alerts associated with this user or general alerts acknowledged/acted upon by this user
    const alertsRes = await db.query(
      `SELECT severity, acknowledged, status, timestamp, acknowledged_at, resolved_at
       FROM alerts
       WHERE user_id = $1 OR acknowledged_by = $1 OR resolved_by = $1`,
      [userId]
    );

    let totalAlerts = 0;
    let criticalAlerts = 0;
    let highAlerts = 0;
    let mediumAlerts = 0;
    let lowAlerts = 0;
    let acknowledgedAlerts = 0;
    let unacknowledgedAlerts = 0;
    let resolvedAlerts = 0;
    let totalResponseTimeMs = 0;
    let responseCount = 0;

    for (const a of alertsRes.rows) {
      totalAlerts++;
      const sev = (a.severity || '').toUpperCase();
      if (sev === 'CRITICAL') criticalAlerts++;
      else if (sev === 'HIGH') highAlerts++;
      else if (sev === 'MEDIUM') mediumAlerts++;
      else if (sev === 'LOW') lowAlerts++;

      if (a.acknowledged || a.status === 'ACKNOWLEDGED' || a.status === 'RESOLVED') {
        acknowledgedAlerts++;
      } else {
        unacknowledgedAlerts++;
      }

      if (a.status === 'RESOLVED') {
        resolvedAlerts++;
      }

      // Calculate response time if timestamps exist
      if (a.acknowledged_at && a.timestamp) {
        const diff = new Date(a.acknowledged_at).getTime() - new Date(a.timestamp).getTime();
        if (diff > 0 && diff < 86400000 * 30) {
          totalResponseTimeMs += diff;
          responseCount++;
        }
      }
    }

    // 2. Query lifecycle events performed by this user (e.g. AI explanations requested, investigations)
    const eventsRes = await db.query(
      `SELECT event_type, COUNT(*) as count
       FROM alert_events
       WHERE user_id = $1
       GROUP BY event_type`,
      [userId]
    );

    let aiExplanationsRequested = 0;
    let securityActionsPerformed = 0;

    for (const r of eventsRes.rows) {
      const count = parseInt(r.count, 10);
      if (r.event_type === 'ai_explanation_requested') {
        aiExplanationsRequested += count;
      }
      if (['acknowledged', 'investigated', 'resolved', 'marked_safe'].includes(r.event_type)) {
        securityActionsPerformed += count;
      }
    }

    // 3. Query security-relevant user activities
    const actRes = await db.query(
      `SELECT activity_type, COUNT(*) as count
       FROM user_activity
       WHERE user_id = $1
       GROUP BY activity_type`,
      [userId]
    );

    for (const r of actRes.rows) {
      const count = parseInt(r.count, 10);
      if (['ALERT_ACKNOWLEDGED', 'THREAT_INSPECTED', 'SETTINGS_UPDATED'].includes(r.activity_type)) {
        securityActionsPerformed += count;
      }
    }

    const avgResponseTimeSeconds = responseCount > 0
      ? Math.round(totalResponseTimeMs / responseCount / 1000)
      : 0;

    // Security Posture Score (0-100) calculated from actual user vigilance
    let postureScore = 80;
    if (unacknowledgedAlerts > 0) postureScore -= Math.min(30, unacknowledgedAlerts * 10);
    if (criticalAlerts > 0 && resolvedAlerts === 0) postureScore -= 20;
    if (aiExplanationsRequested > 0) postureScore += Math.min(10, aiExplanationsRequested * 2);
    if (securityActionsPerformed > 0) postureScore += Math.min(10, securityActionsPerformed * 2);
    postureScore = Math.max(0, Math.min(100, postureScore));

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      role: user.role,
      metrics: {
        totalAlerts,
        criticalAlerts,
        highAlerts,
        mediumAlerts,
        lowAlerts,
        acknowledgedAlerts,
        unacknowledgedAlerts,
        resolvedAlerts,
        aiExplanationsRequested,
        averageResponseTimeSeconds: avgResponseTimeSeconds,
        securityActionsPerformed,
        securityPostureScore: postureScore,
      },
      hasSufficientData: totalAlerts > 0 || securityActionsPerformed > 0 || aiExplanationsRequested > 0,
    };
  }

  /**
   * Aggregated security behavior for all users (for Admin dashboard)
   */
  async getAllUsersSecurityBehaviour() {
    const usersRes = await db.query('SELECT id FROM users ORDER BY created_at DESC LIMIT 100');
    const results = [];
    for (const u of usersRes.rows) {
      try {
        const behaviour = await this.getUserSecurityBehaviour(u.id);
        results.push(behaviour);
      } catch (e) {}
    }
    return results;
  }
}

module.exports = new SecurityBehaviourService();
