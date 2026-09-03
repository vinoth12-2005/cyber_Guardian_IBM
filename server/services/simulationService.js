const db = require('../db');

class SimulationService {
  /**
   * List all simulations
   */
  async listSimulations({ category = '', difficulty = '' } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (category && category !== 'All') {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    if (difficulty && difficulty !== 'All') {
      conditions.push(`difficulty = $${idx++}`);
      params.push(difficulty);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM simulations ${whereClause} ORDER BY numeric_id ASC`;
    const res = await db.query(sql, params);

    return res.rows.map(this._formatSimulation);
  }

  /**
   * Get simulation by id or numeric_id
   */
  async getSimulationById(simId) {
    const isNum = /^\d+$/.test(simId);
    const sql = isNum
      ? 'SELECT * FROM simulations WHERE numeric_id = $1 OR id = $2'
      : 'SELECT * FROM simulations WHERE id = $1';
    const params = isNum ? [parseInt(simId, 10), `SE-${String(simId).padStart(3, '0')}`] : [simId];

    const res = await db.query(sql, params);
    if (res.rowCount === 0) return null;
    return this._formatSimulation(res.rows[0]);
  }

  /**
   * Start a simulation attempt
   */
  async startAttempt(userId, simulationId) {
    const sim = await this.getSimulationById(simulationId);
    if (!sim) throw new Error('Simulation scenario not found');

    const attemptId = `att_${userId}_${sim.id}_${Date.now()}`;
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO simulation_attempts (id, user_id, simulation_id, start_time, status, score, stars, risk_score, outcome, events_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        attemptId,
        userId,
        sim.id,
        now,
        'in_progress',
        0,
        0,
        0,
        'pending',
        JSON.stringify([]),
        now,
      ]
    );

    // Record activity
    await db.query(
      `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'act_' + Math.random().toString(36).substring(2, 10),
        userId,
        'SIMULATION_STARTED',
        'Started simulation scenario',
        sim.title,
        'Simulation',
        'success',
        JSON.stringify({ simulationId: sim.id, attemptId }),
        now,
      ]
    );

    return {
      attemptId,
      simulation: sim,
      startedAt: now,
    };
  }

  /**
   * Record simulation event
   */
  async recordEvent(attemptId, eventData) {
    const res = await db.query('SELECT events_json, risk_score FROM simulation_attempts WHERE id = $1', [attemptId]);
    if (res.rowCount === 0) throw new Error('Simulation attempt not found');

    const events = JSON.parse(res.rows[0].events_json || '[]');
    events.push({
      ...eventData,
      timestamp: eventData.timestamp || new Date().toISOString(),
    });

    const currentRisk = res.rows[0].risk_score || 0;
    const delta = eventData.riskDelta || 0;
    const newRisk = Math.max(0, Math.min(100, currentRisk + delta));

    await db.query(
      'UPDATE simulation_attempts SET events_json = $1, risk_score = $2 WHERE id = $3',
      [JSON.stringify(events), newRisk, attemptId]
    );

    return { success: true, eventCount: events.length, riskScore: newRisk };
  }

  /**
   * Complete simulation attempt
   */
  async completeAttempt(userId, simulationId, attemptData = {}) {
    const sim = await this.getSimulationById(simulationId);
    if (!sim) throw new Error('Simulation not found');

    const now = new Date().toISOString();
    const score = Math.max(0, Math.min(100, attemptData.score ?? 85));
    const outcome = attemptData.outcome || (score >= 80 ? 'safe' : score >= 50 ? 'partial' : 'compromised');
    const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0;
    const riskScore = attemptData.riskScore ?? (100 - score);
    const riskLevel = riskScore >= 70 ? 'CRITICAL' : riskScore >= 40 ? 'MEDIUM' : 'LOW';

    const attemptId = attemptData.attemptId || `att_${userId}_${sim.id}_${Date.now()}`;

    // Upsert simulation attempt
    await db.query(
      `INSERT INTO simulation_attempts (id, user_id, simulation_id, start_time, completion_time, status, score, stars, risk_score, risk_level, outcome, hints_used, investigative_actions, defensive_actions, branch_taken, events_json, attacker_events_json, exposed_data_json, debrief_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       ON CONFLICT (id) DO UPDATE SET
         completion_time = $5,
         status = $6,
         score = $7,
         stars = $8,
         risk_score = $9,
         risk_level = $10,
         outcome = $11,
         hints_used = $12,
         investigative_actions = $13,
         defensive_actions = $14,
         branch_taken = $15,
         events_json = $16,
         attacker_events_json = $17,
         exposed_data_json = $18,
         debrief_json = $19`,
      [
        attemptId,
        userId,
        sim.id,
        attemptData.startTime || now,
        now,
        'completed',
        score,
        stars,
        riskScore,
        riskLevel,
        outcome,
        attemptData.hintsUsed || 0,
        attemptData.investigativeActions || 0,
        attemptData.defensiveActions || 0,
        attemptData.branchTaken || null,
        JSON.stringify(attemptData.events || []),
        JSON.stringify(attemptData.attackerEvents || []),
        JSON.stringify(attemptData.exposedData || []),
        JSON.stringify(attemptData.debrief || {}),
        now,
      ]
    );

    // Award XP
    const xpReward = stars * 100 + (sim.xp || 50);
    await db.query(
      'UPDATE users SET xp = xp + $1, streak = streak + 1, updated_at = $2 WHERE id = $3',
      [xpReward, now, userId]
    );

    // Record activity
    await db.query(
      `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'act_' + Math.random().toString(36).substring(2, 10),
        userId,
        'SIMULATION_COMPLETED',
        `Completed simulation: ${sim.title}`,
        `Score: ${score}% (${stars} Stars) · Status: ${outcome.toUpperCase()}`,
        'Simulation',
        outcome === 'safe' ? 'success' : outcome === 'partial' ? 'warning' : 'danger',
        JSON.stringify({ simulationId: sim.id, score, stars, outcome, xpReward }),
        now,
      ]
    );

    return {
      success: true,
      attemptId,
      score,
      stars,
      outcome,
      xpEarned: xpReward,
      riskScore,
      riskLevel,
    };
  }

  /**
   * Get user's simulation history
   */
  async getUserHistory(userId) {
    const res = await db.query(
      `SELECT a.*, s.title as sim_title, s.category as sim_category, s.difficulty as sim_difficulty, s.icon as sim_icon
       FROM simulation_attempts WHERE user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );

    return res.rows.map((r) => ({
      id: r.id,
      simulationId: r.simulation_id,
      title: r.sim_title || r.simulation_id,
      category: r.sim_category || 'Security',
      difficulty: r.sim_difficulty || 'Beginner',
      score: r.score,
      stars: r.stars,
      outcome: r.outcome,
      riskScore: r.risk_score,
      riskLevel: r.risk_level,
      date: r.completion_time || r.start_time,
      events: JSON.parse(r.events_json || '[]'),
      debrief: JSON.parse(r.debrief_json || '{}'),
    }));
  }

  /**
   * Create a new simulation scenario (Admin)
   */
  async createSimulation(simData) {
    const id = simData.id || `SE-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
    const countRes = await db.query('SELECT COUNT(*) as count FROM simulations');
    const numericId = simData.numericId || (parseInt(countRes.rows[0]?.count || 0, 10) + 1);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO simulations (id, numeric_id, title, category, difficulty, duration, environment, xp, icon, goal, summary, brand, learning_objectives, hints, learning_cards, debrief, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        id,
        numericId,
        simData.title,
        simData.category || 'Phishing',
        simData.difficulty || 'Beginner',
        simData.duration || 10,
        simData.environment || 'email',
        simData.xp || 100,
        simData.icon || 'mail',
        simData.goal || '',
        simData.summary || '',
        simData.brand || '',
        JSON.stringify(simData.learningObjectives || []),
        JSON.stringify(simData.hints || []),
        JSON.stringify(simData.learningCards || []),
        JSON.stringify(simData.debrief || {}),
        now,
      ]
    );

    return await this.getSimulationById(id);
  }

  /**
   * Update an existing simulation scenario (Admin)
   */
  async updateSimulation(id, simData) {
    const existing = await this.getSimulationById(id);
    if (!existing) return null;

    await db.query(
      `UPDATE simulations SET
         title = COALESCE($1, title),
         category = COALESCE($2, category),
         difficulty = COALESCE($3, difficulty),
         duration = COALESCE($4, duration),
         environment = COALESCE($5, environment),
         xp = COALESCE($6, xp),
         icon = COALESCE($7, icon),
         goal = COALESCE($8, goal),
         summary = COALESCE($9, summary),
         brand = COALESCE($10, brand),
         learning_objectives = COALESCE($11, learning_objectives),
         hints = COALESCE($12, hints),
         learning_cards = COALESCE($13, learning_cards),
         debrief = COALESCE($14, debrief)
       WHERE id = $15`,
      [
        simData.title ?? null,
        simData.category ?? null,
        simData.difficulty ?? null,
        simData.duration ?? null,
        simData.environment ?? null,
        simData.xp ?? null,
        simData.icon ?? null,
        simData.goal ?? null,
        simData.summary ?? null,
        simData.brand ?? null,
        simData.learningObjectives ? JSON.stringify(simData.learningObjectives) : null,
        simData.hints ? JSON.stringify(simData.hints) : null,
        simData.learningCards ? JSON.stringify(simData.learningCards) : null,
        simData.debrief ? JSON.stringify(simData.debrief) : null,
        id,
      ]
    );

    return await this.getSimulationById(id);
  }

  /**
   * Delete a simulation scenario (Admin)
   */
  async deleteSimulation(id) {
    await db.query('DELETE FROM simulation_attempts WHERE simulation_id = $1', [id]);
    const res = await db.query('DELETE FROM simulations WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  _formatSimulation(row) {
    return {
      id: row.id,
      numericId: row.numeric_id,
      title: row.title,
      category: row.category,
      difficulty: row.difficulty,
      duration: row.duration,
      environment: row.environment,
      xp: row.xp,
      icon: row.icon,
      goal: row.goal,
      summary: row.summary,
      brand: row.brand,
      learningObjectives: JSON.parse(row.learning_objectives || '[]'),
      hints: JSON.parse(row.hints || '[]'),
      learningCards: JSON.parse(row.learning_cards || '[]'),
      debrief: JSON.parse(row.debrief || '{}'),
      createdAt: row.created_at,
    };
  }
}

module.exports = new SimulationService();
