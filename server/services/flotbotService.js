const db = require('../db');
const axios = require('axios');
const config = require('../config/config');

class FlotBotService {
  /**
   * List alerts with filtering and pagination
   */
  async listAlerts({ page = 1, limit = 50, severity = '', status = '', category = '', search = '' } = {}) {
    const offset = (Math.max(1, page) - 1) * limit;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (severity && severity !== 'ALL') {
      conditions.push(`severity = $${idx++}`);
      params.push(severity.toUpperCase());
    }

    if (status && status !== 'ALL') {
      if (status === 'UNACKNOWLEDGED') {
        conditions.push(`acknowledged = 0`);
      } else {
        conditions.push(`status = $${idx++}`);
        params.push(status.toUpperCase());
      }
    }

    if (category && category !== 'ALL') {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    if (search) {
      conditions.push(`(title ILIKE $${idx} OR description ILIKE $${idx} OR source ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) as total FROM alerts ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.total || countRes.rows[0]?.TOTAL || 0, 10);

    const listSql = `
      SELECT * FROM alerts
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    params.push(limit, offset);

    const res = await db.query(listSql, params);

    return {
      alerts: res.rows.map(this._formatAlert),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single alert with its full lifecycle event history
   */
  async getAlertById(alertId) {
    const res = await db.query('SELECT * FROM alerts WHERE id = $1', [alertId]);
    if (res.rowCount === 0) return null;

    const alert = this._formatAlert(res.rows[0]);

    // Fetch alert handling lifecycle history
    const historyRes = await db.query(
      'SELECT * FROM alert_events WHERE alert_id = $1 ORDER BY timestamp ASC',
      [alertId]
    );

    alert.history = historyRes.rows.map((r) => ({
      id: r.id,
      eventType: r.event_type,
      timestamp: r.timestamp,
      userId: r.user_id,
      metadata: JSON.parse(r.metadata_json || '{}'),
    }));

    return alert;
  }

  /**
   * Record an alert lifecycle event (detected, displayed, viewed, ai_explained, acknowledged, resolved)
   */
  async recordAlertEvent(alertId, eventType, userId = null, metadata = {}) {
    const now = new Date().toISOString();
    const eventId = 'evt_' + Math.random().toString(36).substring(2, 10);

    await db.query(
      `INSERT INTO alert_events (id, alert_id, user_id, event_type, timestamp, metadata_json)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [eventId, alertId, userId, eventType, now, JSON.stringify(metadata)]
    );

    return { success: true, eventId, timestamp: now };
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId, acknowledgedBy = null) {
    const now = new Date().toISOString();
    const res = await db.query(
      `UPDATE alerts
       SET acknowledged = 1, acknowledged_at = $1, acknowledged_by = $2, status = 'ACKNOWLEDGED'
       WHERE id = $3
       RETURNING *`,
      [now, acknowledgedBy, alertId]
    );

    if (res.rowCount === 0) throw new Error('Alert not found');

    // Record lifecycle event
    await this.recordAlertEvent(alertId, 'acknowledged', acknowledgedBy, { acknowledgedAt: now });

    return this._formatAlert(res.rows[0]);
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId, resolvedBy = null, resolutionNotes = '') {
    const now = new Date().toISOString();
    const res = await db.query(
      `UPDATE alerts
       SET status = 'RESOLVED', resolved_at = $1, resolved_by = $2, resolution_notes = $3
       WHERE id = $4
       RETURNING *`,
      [now, resolvedBy, resolutionNotes, alertId]
    );

    if (res.rowCount === 0) throw new Error('Alert not found');

    // Record lifecycle event
    await this.recordAlertEvent(alertId, 'resolved', resolvedBy, { resolvedAt: now, resolutionNotes });

    return this._formatAlert(res.rows[0]);
  }

  /**
   * Insert new threat detection alert from scanning engine
   */
  async createAlert(alertData) {
    const id = alertData.id || ('alt_' + Math.random().toString(36).substring(2, 10));
    const now = alertData.timestamp || new Date().toISOString();

    await db.query(
      `INSERT INTO alerts (id, user_id, timestamp, title, severity, category, source, description, recommendation, evidence, mitre, status, acknowledged, ai_analysis)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        alertData.userId || null,
        now,
        alertData.title,
        (alertData.severity || 'HIGH').toUpperCase(),
        alertData.category || 'System',
        alertData.source || 'FlotBot Sensor',
        alertData.description || '',
        alertData.recommendation || 'Investigate immediately.',
        JSON.stringify(alertData.evidence || {}),
        JSON.stringify(alertData.mitre || []),
        'NEW',
        0,
        alertData.aiAnalysis ? JSON.stringify(alertData.aiAnalysis) : null,
      ]
    );

    // Record 'detected' event
    await this.recordAlertEvent(id, 'detected', alertData.userId, {
      source: alertData.source,
      severity: alertData.severity,
    });

    return await this.getAlertById(id);
  }

  // ── IOC Management ──────────────────────────────────────────────────────────

  async listIocs({ type = '', search = '' } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (type && type !== 'ALL') {
      conditions.push(`type = $${idx++}`);
      params.push(type.toLowerCase());
    }

    if (search) {
      conditions.push(`(value ILIKE $${idx} OR threat_name ILIKE $${idx} OR note ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const res = await db.query(`SELECT * FROM iocs ${whereClause} ORDER BY created_at DESC`, params);
    return res.rows;
  }

  async addIoc({ type, value, threatName = '', severity = 'HIGH', note = '', addedBy = 'admin' }) {
    if (!type || !value) throw new Error('Type and value are required');
    const id = 'ioc_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO iocs (id, type, value, threat_name, severity, status, added_by, note, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, type.toLowerCase(), value.trim(), threatName, severity.toUpperCase(), 'active', addedBy, note, now, now]
    );

    const res = await db.query('SELECT * FROM iocs WHERE id = $1', [id]);
    return res.rows[0];
  }

  async updateIoc(id, { status, note, severity, threatName }) {
    const setClauses = [];
    const params = [];
    let idx = 1;

    if (status) { setClauses.push(`status = $${idx++}`); params.push(status); }
    if (note !== undefined) { setClauses.push(`note = $${idx++}`); params.push(note); }
    if (severity) { setClauses.push(`severity = $${idx++}`); params.push(severity); }
    if (threatName) { setClauses.push(`threat_name = $${idx++}`); params.push(threatName); }

    const now = new Date().toISOString();
    setClauses.push(`updated_at = $${idx++}`);
    params.push(now);

    params.push(id);
    const res = await db.query(`UPDATE iocs SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    return res.rows[0] || null;
  }

  async deleteIoc(id) {
    const res = await db.query('DELETE FROM iocs WHERE id = $1', [id]);
    return res.rowCount > 0;
  }

  // ── Threat Rules ────────────────────────────────────────────────────────────

  async listRules() {
    const res = await db.query('SELECT * FROM threat_rules ORDER BY category, name');
    return res.rows.map((r) => ({
      ...r,
      enabled: !!r.enabled,
      config: JSON.parse(r.config_json || '{}'),
    }));
  }

  async toggleRule(ruleId, enabled, updatedBy = 'admin') {
    const now = new Date().toISOString();
    const res = await db.query(
      `UPDATE threat_rules
       SET enabled = $1, updated_at = $2, updated_by = $3
       WHERE rule_id = $4 OR id = $4
       RETURNING *`,
      [enabled ? 1 : 0, now, updatedBy, ruleId]
    );

    if (res.rowCount === 0) throw new Error('Rule not found');
    const r = res.rows[0];
    return {
      ...r,
      enabled: !!r.enabled,
      config: JSON.parse(r.config_json || '{}'),
    };
  }

  async updateRuleConfig(ruleId, configObj, updatedBy = 'admin') {
    const now = new Date().toISOString();
    const res = await db.query(
      `UPDATE threat_rules
       SET config_json = $1, updated_at = $2, updated_by = $3
       WHERE rule_id = $4 OR id = $4
       RETURNING *`,
      [JSON.stringify(configObj), now, updatedBy, ruleId]
    );

    if (res.rowCount === 0) throw new Error('Rule not found');
    const r = res.rows[0];
    return {
      ...r,
      enabled: !!r.enabled,
      config: JSON.parse(r.config_json || '{}'),
    };
  }

  // ── AI Engine Integration ───────────────────────────────────────────────────

  async askAI(prompt, context = {}) {
    const ollamaHost = config.ai.ollamaHost;
    const model = config.ai.ollamaModel;

    try {
      // 1. Try local Ollama AI model
      const resp = await axios.post(
        `${ollamaHost}/api/generate`,
        {
          model,
          prompt: `You are FlotBot AI, an elite cybersecurity and Linux endpoint defense assistant. Provide concise, expert security analysis:\n\nContext: ${JSON.stringify(context)}\n\nQuery: ${prompt}`,
          stream: false,
        },
        { timeout: 8000 }
      );

      if (resp.data && resp.data.response) {
        return {
          reply: resp.data.response.trim(),
          provider: 'ollama',
          model,
        };
      }
    } catch (e) {
      // Local Ollama offline or timed out -> use fallback rule engine responder
    }

    // Expert rule-based response if Ollama offline
    return {
      reply: this._generateRuleBasedAIResponse(prompt, context),
      provider: 'rule-engine-fallback',
      model: 'flotbot-expert-v2',
    };
  }

  async explainAlert(alertId, userId = null) {
    const alert = await this.getAlertById(alertId);
    if (!alert) throw new Error('Alert not found');

    const prompt = `Explain security alert: "${alert.title}" (Severity: ${alert.severity}, Category: ${alert.category}). Description: ${alert.description}. Evidence: ${JSON.stringify(alert.evidence)}. Provide root cause, MITRE ATT&CK technique mapping, and actionable remediation steps.`;

    const aiRes = await this.askAI(prompt, { alert });

    // Store AI analysis on the alert
    const now = new Date().toISOString();
    await db.query(
      'UPDATE alerts SET ai_analysis = $1 WHERE id = $2',
      [JSON.stringify(aiRes), alertId]
    );

    // Record lifecycle event
    await this.recordAlertEvent(alertId, 'ai_explanation_requested', userId, {
      model: aiRes.model,
      provider: aiRes.provider,
    });

    return {
      alertId,
      analysis: aiRes.reply,
      provider: aiRes.provider,
      timestamp: now,
    };
  }

  _formatAlert(row) {
    return {
      id: row.id,
      userId: row.user_id,
      timestamp: row.timestamp,
      title: row.title,
      severity: row.severity,
      category: row.category,
      source: row.source,
      description: row.description,
      recommendation: row.recommendation,
      evidence: JSON.parse(row.evidence || '{}'),
      mitre: JSON.parse(row.mitre || '[]'),
      status: row.status,
      acknowledged: !!row.acknowledged,
      acknowledgedAt: row.acknowledged_at,
      acknowledgedBy: row.acknowledged_by,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by,
      resolutionNotes: row.resolution_notes,
      aiAnalysis: JSON.parse(row.ai_analysis || 'null'),
    };
  }

  _generateRuleBasedAIResponse(prompt, context = {}) {
    const q = prompt.toLowerCase();
    if (q.includes('phish') || q.includes('email')) {
      return '⚠️ Phishing Threat Analysis: Inspect Return-Path and SPF/DKIM authentication headers. Check for homoglyph domain impersonation and suspicious hyper-links before authorizing credentials.';
    }
    if (q.includes('powershell') || q.includes('cmd') || q.includes('process')) {
      return '🔍 Execution Telemetry: Encoded command line parameters (-EncodedCommand, -w hidden) indicate potential living-off-the-land dropper behavior. Terminate suspicious parent process tree immediately.';
    }
    if (q.includes('ip') || q.includes('network') || q.includes('connection')) {
      return '🛡️ Network Posture: Outbound persistent connection to unverified port (e.g. 4444) flagged for reverse shell indicators. Recommended action: Add IP to global blocklist and verify endpoint isolation.';
    }
    return '🛡️ FlotBot Security Engine: Endpoint sensors are monitoring kernel process creation, network sockets, and file modification anomalies in real-time.';
  }
}

module.exports = new FlotBotService();
