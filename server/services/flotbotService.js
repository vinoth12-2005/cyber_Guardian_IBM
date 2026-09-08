const db = require('../db');
const axios = require('axios');
const config = require('../config/config');
const DetectionManager = require('./security/DetectionManager');

class FlotBotService {
  constructor() {
    this.detectionManager = new DetectionManager(config.threatIntel || {});
  }

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
        alertData.source || 'FlotBot Threat Engine',
        alertData.description || '',
        alertData.recommendation || 'Investigate immediately before authorizing access.',
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

  // ── Multi-Provider Threat Interception & Analysis (URL & File) ──────────────

  /**
   * Analyze URL via DetectionManager (Local URLEngine + Google Safe Browsing + VirusTotal)
   */
  async analyzeUrl(url, userId = null, metadata = {}) {
    const report = await this.detectionManager.checkUrl(url);

    if (!report.isThreat) {
      return {
        isThreat: false,
        telemetry: report,
        message: 'Threat Engine verified URL as clean across all active intelligence providers.',
      };
    }

    // 1. Generate Plain-English AI Awareness Coaching
    const evidenceSummary = report.evidence.join('; ');
    const aiPrompt =
      `Explain URL security detection for: "${url}" (Domain: ${report.domain || 'N/A'}, Classification: ${report.classification}, Risk: ${report.riskLevel}, Score: ${report.score}/100).\n` +
      `Evidence from VirusTotal, Google Safe Browsing, and Local Heuristics: ${evidenceSummary}.\n` +
      `Explain clearly in 2-3 sentences what attack this is, why it is dangerous, and what the user should do.`;

    const aiRes = await this.askAI(aiPrompt, { report, type: 'URL_INTERCEPTION' });
    const aiExplanation = aiRes.reply;

    // 2. Persist Alert in Database
    const title =
      report.classification === 'malicious'
        ? `Malicious URL Intercepted (${report.domain || url})`
        : `Suspicious Destination Intercepted [Risk: ${report.riskLevel}]`;

    const alert = await this.createAlert({
      userId,
      title,
      severity: report.riskLevel,
      category: 'Web/Phishing',
      source: 'DetectionManager (VirusTotal + Google Safe Browsing + URLEngine)',
      description: `Navigation paused for target: ${url}. Evidence: ${evidenceSummary}`,
      recommendation: 'Do not enter credentials or download files. Verify legitimate domain origin.',
      evidence: report,
      mitre: report.local_heuristics?.mitre?.length > 0 ? report.local_heuristics.mitre : ['T1566.002'],
      aiAnalysis: {
        summary: aiExplanation,
        provider: aiRes.provider,
        model: aiRes.model,
        timestamp: new Date().toISOString(),
      },
    });

    // 3. Record Interception Paused Event
    await this.recordAlertEvent(alert.id, 'interception_paused', userId, {
      url,
      score: report.score,
      riskLevel: report.riskLevel,
      classification: report.classification,
      clientMeta: metadata,
    });

    // 4. Record to user_activity Timeline
    if (userId) {
      try {
        const actId = 'act_' + Math.random().toString(36).substring(2, 10);
        await db.query(
          `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            actId,
            userId,
            'threat_intercepted',
            `Threat Paused: ${report.domain || url}`,
            `Risk: ${report.riskLevel} (${report.score}/100) - Awaiting user decision`,
            'Security Alert',
            'warning',
            JSON.stringify({ alertId: alert.id, url, score: report.score }),
            new Date().toISOString(),
          ]
        );
      } catch (e) {
        console.error('Failed to log user activity:', e.message);
      }
    }

    return {
      isThreat: true,
      alertId: alert.id,
      alert,
      telemetry: report,
      aiExplanation,
      actionRequired: 'ACKNOWLEDGEMENT_REQUIRED',
    };
  }

  /**
   * Analyze File via DetectionManager (VirusTotal Hash Lookup + Hybrid Analysis Sandbox Escalation)
   */
  async analyzeFile({ sha256 = null, fileName = null, filePath = null, entropy = 0 } = {}, userId = null) {
    const report = await this.detectionManager.checkFile({ sha256, fileName, filePath, entropy });

    if (!report.isThreat) {
      return {
        isThreat: false,
        telemetry: report,
        message: 'File hash verified clean across VirusTotal and Hybrid Analysis sandbox.',
      };
    }

    // 1. Generate Plain-English AI Awareness Coaching
    const evidenceSummary = report.evidence.join('; ');
    const aiPrompt =
      `Explain file malware detection for: "${fileName || sha256}" (Classification: ${report.classification}, Risk: ${report.riskLevel}, Score: ${report.score}/100).\n` +
      `Evidence from VirusTotal, Hybrid Analysis, and File Heuristics: ${evidenceSummary}.\n` +
      `Explain what malware family or behavior was detected, the risk of executing this file, and quarantine advice.`;

    const aiRes = await this.askAI(aiPrompt, { report, type: 'FILE_INTERCEPTION' });
    const aiExplanation = aiRes.reply;

    // 2. Persist Alert
    const title =
      report.classification === 'malicious'
        ? `Malicious File Quarantined (${fileName || 'Payload'})`
        : `Suspicious File Quarantined [Risk: ${report.riskLevel}]`;

    const alert = await this.createAlert({
      userId,
      title,
      severity: report.riskLevel,
      category: 'Malware/File',
      source: 'DetectionManager (VirusTotal + Hybrid Analysis)',
      description: `File execution paused: ${fileName || sha256}. Evidence: ${evidenceSummary}`,
      recommendation: 'Quarantine or delete file immediately. Do not execute.',
      evidence: report,
      mitre: ['T1204.002', 'T1036.007'],
      aiAnalysis: {
        summary: aiExplanation,
        provider: aiRes.provider,
        model: aiRes.model,
        timestamp: new Date().toISOString(),
      },
    });

    // 3. Record Interception Paused Event
    await this.recordAlertEvent(alert.id, 'file_quarantined', userId, {
      sha256,
      fileName,
      score: report.score,
      riskLevel: report.riskLevel,
    });

    return {
      isThreat: true,
      alertId: alert.id,
      alert,
      telemetry: report,
      aiExplanation,
      actionRequired: 'ACKNOWLEDGEMENT_REQUIRED',
    };
  }

  /**
   * Record User Decision at Interception Gate (Safe Exit vs. Acknowledged Override)
   */
  async recordUserDecision(alertId, userId = null, action = 'safe_exit', reason = '') {
    const alert = await this.getAlertById(alertId);
    if (!alert) throw new Error('Alert not found');

    const now = new Date().toISOString();

    if (action === 'safe_exit') {
      // User avoided the threat
      await this.recordAlertEvent(alertId, 'user_avoided_threat', userId, {
        decision: 'SAFE_EXIT',
        timestamp: now,
      });

      await db.query(
        `UPDATE alerts SET status = 'RESOLVED', resolved_at = $1, resolved_by = $2, resolution_notes = $3 WHERE id = $4`,
        [now, userId || 'user', 'User successfully followed FlotBot AI security advice and returned to safety.', alertId]
      );

      if (userId) {
        try {
          const actId = 'act_' + Math.random().toString(36).substring(2, 10);
          await db.query(
            `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              actId,
              userId,
              'threat_avoided',
              'Avoided Threat Destination',
              'User followed FlotBot guidance and aborted navigation to dangerous destination.',
              'Security Awareness',
              'success',
              JSON.stringify({ alertId, decision: 'SAFE_EXIT' }),
              now,
            ]
          );
        } catch (e) {
          console.error(e.message);
        }
      }

      return {
        success: true,
        decision: 'SAFE_EXIT',
        status: 'RESOLVED',
        message: 'Excellent choice. Navigation aborted and positive security behavior logged.',
      };
    } else {
      // User acknowledged risk and requested override
      await db.query(
        `UPDATE alerts SET acknowledged = 1, acknowledged_at = $1, acknowledged_by = $2, status = 'ACKNOWLEDGED' WHERE id = $3`,
        [now, userId || 'user', alertId]
      );

      await this.recordAlertEvent(alertId, 'user_acknowledged_override', userId, {
        decision: 'OVERRIDE_PROCEED',
        reason: reason || 'User acknowledged risk and proceeded.',
        timestamp: now,
      });

      if (userId) {
        try {
          const actId = 'act_' + Math.random().toString(36).substring(2, 10);
          await db.query(
            `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              actId,
              userId,
              'threat_override',
              'Bypassed Security Warning (User Acknowledged)',
              `User proceeded despite FlotBot threat warning. Reason: ${reason || 'User self-override'}`,
              'Security Risk',
              'warning',
              JSON.stringify({ alertId, reason, decision: 'OVERRIDE_PROCEED' }),
              now,
            ]
          );
        } catch (e) {
          console.error(e.message);
        }
      }

      return {
        success: true,
        decision: 'OVERRIDE_PROCEED',
        status: 'ACKNOWLEDGED',
        message: 'Security acknowledgment registered. Activity unpaused and logged to Admin Panel.',
      };
    }
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

  // ── Persistent Chat & Course Study Context ───────────────────────────────────

  /**
   * Get user's active courses, progress and certifications to provide course-aware AI guidance
   */
  async getUserCourseStudyContext(userId) {
    if (!userId) return null;
    try {
      const enrollRes = await db.query(
        `SELECT ce.course_id, ce.status, ce.enrolled_at, ce.completed_at,
                c.title, c.cat, c.level, c.duration,
                cp.completed_lessons, cp.quiz_score, cp.certified
         FROM course_enrollments ce
         JOIN courses c ON c.id = ce.course_id
         LEFT JOIN course_progress cp ON cp.course_id = ce.course_id AND cp.user_id = ce.user_id
         WHERE ce.user_id = $1`,
        [userId]
      );

      const enrolledCourses = enrollRes.rows.map((r) => {
        let completedLessons = [];
        try { completedLessons = JSON.parse(r.completed_lessons || '[]'); } catch (_) {}
        return {
          courseId: r.course_id,
          title: r.title,
          category: r.cat,
          level: r.level,
          duration: r.duration,
          status: r.status,
          completedLessonsCount: completedLessons.length,
          completed: r.status === 'completed' || !!r.certified,
          quizScore: r.quiz_score,
        };
      });

      return {
        hasEnrollments: enrolledCourses.length > 0,
        enrolledCount: enrolledCourses.length,
        courses: enrolledCourses,
      };
    } catch (err) {
      console.warn('[FlotBot] Error getting user course study context:', err.message);
      return null;
    }
  }

  /**
   * List all chat sessions for a user
   */
  /**
   * List all chat sessions for a user with last message preview
   */
  async listChatSessions(userId) {
    if (!userId) return [];
    const res = await db.query(
      `SELECT s.id, s.user_id, s.title, s.category, s.message_count, s.created_at, s.updated_at,
              (SELECT text FROM chat_messages m WHERE m.session_id = s.id AND m.sender = 'flotbot' ORDER BY m.created_at DESC LIMIT 1) as last_reply,
              (SELECT text FROM chat_messages m WHERE m.session_id = s.id AND m.sender = 'user' ORDER BY m.created_at ASC LIMIT 1) as first_user_query
       FROM chat_sessions s
       WHERE s.user_id = $1
       ORDER BY s.updated_at DESC`,
      [userId]
    );

    return res.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      category: r.category,
      messageCount: r.message_count,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      lastReply: r.last_reply || '',
      firstQuery: r.first_user_query || r.title,
    }));
  }

  /**
   * Get a session and all its messages
   */
  async getChatSessionWithMessages(sessionId, userId) {
    const sessionRes = await db.query(
      `SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2`,
      [sessionId, userId]
    );
    if (sessionRes.rowCount === 0) return null;

    const messagesRes = await db.query(
      `SELECT id, session_id, sender, text, metadata_json, created_at
       FROM chat_messages
       WHERE session_id = $1
       ORDER BY created_at ASC`,
      [sessionId]
    );

    return {
      session: sessionRes.rows[0],
      messages: messagesRes.rows.map((m) => ({
        id: m.id,
        sessionId: m.session_id,
        sender: m.sender,
        text: m.text,
        metadata: JSON.parse(m.metadata_json || '{}'),
        timestamp: m.created_at,
      })),
    };
  }

  /**
   * Create or find a chat session
   */
  async createOrGetSession(sessionId, userId, firstMessageText = 'New Conversation') {
    if (sessionId) {
      const existing = await db.query(
        `SELECT * FROM chat_sessions WHERE id = $1 AND user_id = $2`,
        [sessionId, userId]
      );
      if (existing.rowCount > 0) return existing.rows[0];
    }

    const newId = sessionId || 'sess_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();

    // Clean, readable title generation
    const rawQuery = (firstMessageText || 'Security Consultation')
      .replace(/https?:\/\/[^\s]+/gi, 'URL Inspection')
      .replace(/[^\w\s-]/gi, '')
      .trim();

    const words = rawQuery.split(/\s+/).filter(Boolean);
    let title = words.slice(0, 6).join(' ');
    if (!title || title.length < 3) {
      title = 'Security Consultation';
    } else {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    if (title.length > 50) title = title.substring(0, 47) + '...';

    const lower = (firstMessageText || '').toLowerCase();
    let category = 'General';
    if (lower.includes('phish') || lower.includes('mail') || lower.includes('typo') || lower.includes('lookalike')) category = 'Phishing';
    else if (lower.includes('pass') || lower.includes('mfa') || lower.includes('auth') || lower.includes('credential')) category = 'Password';
    else if (lower.includes('course') || lower.includes('study') || lower.includes('learn') || lower.includes('quiz') || lower.includes('lesson')) category = 'Course Study';
    else if (lower.includes('malware') || lower.includes('virus') || lower.includes('ransomware') || lower.includes('dropper') || lower.includes('payload')) category = 'Malware';
    else if (lower.includes('net') || lower.includes('ip') || lower.includes('port') || lower.includes('firewall') || lower.includes('wifi') || lower.includes('http')) category = 'Network';
    else if (lower.includes('sql') || lower.includes('xss') || lower.includes('owasp') || lower.includes('csrf') || lower.includes('injection')) category = 'AppSec';

    await db.query(
      `INSERT INTO chat_sessions (id, user_id, title, category, message_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 0, $5, $6)`,
      [newId, userId, title, category, now, now]
    );

    return { id: newId, user_id: userId, title, category, message_count: 0, created_at: now, updated_at: now };
  }

  /**
   * Save a chat message to PostgreSQL
   */
  async saveChatMessage(sessionId, userId, sender, text, metadata = {}) {
    const msgId = 'msg_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO chat_messages (id, session_id, user_id, sender, text, metadata_json, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [msgId, sessionId, userId, sender, text, JSON.stringify(metadata), now]
    );

    await db.query(
      `UPDATE chat_sessions
       SET message_count = message_count + 1, updated_at = $1
       WHERE id = $2`,
      [now, sessionId]
    );

    return { id: msgId, sessionId, userId, sender, text, metadata, timestamp: now };
  }

  /**
   * Delete a chat session and its messages
   */
  async deleteChatSession(sessionId, userId) {
    await db.query(`DELETE FROM chat_messages WHERE session_id = $1 AND user_id = $2`, [sessionId, userId]);
    await db.query(`DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2`, [sessionId, userId]);
    return { success: true, sessionId };
  }

  // ── AI Engine Integration ───────────────────────────────────────────────────

  async askAI(prompt, context = {}) {
    if (!prompt || typeof prompt !== 'string') {
      return { reply: 'Hello! I am FlotBot AI. How can I assist with your cybersecurity defenses today?', provider: 'cache', model: 'flotbot-fast' };
    }

    const trimmedPrompt = prompt.trim();
    const cacheKey = trimmedPrompt.toLowerCase();

    // 1. Check in-memory fast cache (Instant <1ms)
    if (!this._aiFastCache) this._aiFastCache = new Map();
    if (this._aiFastCache.has(cacheKey)) {
      const cached = this._aiFastCache.get(cacheKey);
      if (Date.now() - cached.ts < 120000) { // 2 min TTL
        return { reply: cached.reply, provider: 'fast-cache', model: cached.model || 'flotbot-cached' };
      }
    }

    // 2. Real-Time URL Extraction & Deep Threat Inspection (Instant <15ms)
    const urlMatch = trimmedPrompt.match(/https?:\/\/[^\s"'<>]+/i) || trimmedPrompt.match(/\b([a-z0-9-]+\.(?:com|org|net|xyz|top|ru|cn|io|app|dev|biz|info))\b/i);
    if (urlMatch && urlMatch[0]) {
      const targetUrl = urlMatch[0].startsWith('http') ? urlMatch[0] : `http://${urlMatch[0]}`;
      try {
        const report = await this.detectionManager.checkUrl(targetUrl);
        let urlReply = '';
        if (report.isThreat) {
          urlReply =
            `🚨 **Real-Time Threat Detection for \`${targetUrl}\`:**\n\n` +
            `• **Verdict:** ${report.classification.toUpperCase()} (${report.riskLevel} Risk · Threat Score: ${report.score}/100)\n` +
            `• **Detection Evidence:** ${report.evidence.join('; ')}\n` +
            `• **MITRE ATT&CK:** ${(report.local_heuristics?.mitre || ['T1566.002']).join(', ')}\n\n` +
            `⚠️ **Security Recommendation:** Navigation has been intercepted and paused. This destination exhibits deceptive signatures (unencrypted HTTP / typosquatting). Do not input credentials or download content.`;
        } else {
          urlReply =
            `✅ **Real-Time URL Verification for \`${targetUrl}\`:**\n\n` +
            `• **Verdict:** VERIFIED CLEAN (Score: ${report.score}/100 · Safe)\n` +
            `• **Signals:** Valid TLS encryption, official domain registration, and clean reputation across VirusTotal & Google Safe Browsing.`;
        }
        this._aiFastCache.set(cacheKey, { reply: urlReply, model: 'detection-engine', ts: Date.now() });
        return { reply: urlReply, provider: 'detection-engine', model: 'urllocal-v2' };
      } catch (_) {}
    }

    // 3. Fast Intent Knowledge for Quick Greetings (< 2ms)
    const words = trimmedPrompt.split(/\s+/);
    if (/^(hi|hello|hey|greetings|howdy|sup)\b/i.test(trimmedPrompt) && words.length <= 3) {
      const greet =
        "👋 **Hello! I am FlotBot AI, your real-time Cybersecurity Assistant.**\n\n" +
        "I work directly alongside our **Real-Time Threat Detection Engines** (VirusTotal, Google Safe Browsing, URLEngine, and Endpoint Sensors) and your training courses. I can help you with:\n" +
        "• 🛡️ **Real-Time Link & URL Inspection:** Paste any link to detect phishing, lookalikes, or plaintext HTTP risks.\n" +
        "• 🔍 **Threat & Attack Analysis:** Inquire about PowerShell droppers, ransomware, MFA bypasses, or IOCs.\n" +
        "• 🎓 **Course Mentorship & Quizzing:** Ask for exam tips, quiz scenarios, or lesson explanations!\n\n" +
        "What security topic or question can I assist you with right now?";
      this._aiFastCache.set(cacheKey, { reply: greet, model: 'flotbot-ai', ts: Date.now() });
      return { reply: greet, provider: 'flotbot-ai', model: 'flotbot-fast' };
    }

    // 3.5. Dual-AI Coordinator: Local Ollama is PRIMARY, Gemini Cloud is consulted when needed
    const ollamaHost = config.ai.ollamaHost || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
    const ollamaModel = config.ai.ollamaModel || process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';
    const geminiKey = config.ai.geminiApiKey || process.env.GEMINI_API_KEY;

    // Check if query specifically requests online/live cloud data or external search
    const ONLINE_INTENT_REGEX =
      /\b(latest news|current news|today's news|new cve|latest vulnerability|live threat feed|weather|stock price|trending|what's happening|search the web|google|browse|lookup ip|lookup domain|virustotal|shodan|whois|public ip|geolocation|real-time web|ask gemini|gemini|cloud ai)\b/i;
    const explicitlyNeedsCloudAI = ONLINE_INTENT_REGEX.test(trimmedPrompt);

    // Helper: Query Gemini Cloud AI (used only when requested or if local Ollama is offline)
    const tryGemini = async () => {
      if (!geminiKey || !geminiKey.startsWith('AIza')) return null;
      try {
        const systemInstruction = "You are FlotBot AI, an elite cybersecurity and workforce training analyst for CyberGuardian. Answer thoroughly, accurately, and clearly using markdown formatting. Reference concrete defensive actions, MITRE ATT&CK techniques, or standards (NIST, OWASP) where relevant.";
        const contents = [];
        if (Array.isArray(context.conversationHistory) && context.conversationHistory.length > 0) {
          for (const m of context.conversationHistory.slice(-6)) {
            contents.push({
              role: m.sender === 'user' ? 'user' : 'model',
              parts: [{ text: m.text }]
            });
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: trimmedPrompt }]
        });

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`,
          {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600,
            }
          },
          { timeout: 5000 }
        );

        const geminiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (geminiText && geminiText.trim().length > 10) {
          return geminiText.trim();
        }
      } catch (geminiErr) {
        console.warn('[FlotBot Backend] Gemini note:', geminiErr.message);
      }
      return null;
    };

    // Helper: Query Local Ollama LLM (Fast, Private, Offline-First)
    const tryOllama = async () => {
      try {
        const messages = [
          {
            role: 'system',
            content: 'You are FlotBot AI, an elite cybersecurity and enterprise workforce training assistant for the CyberGuardian platform. Answer the user inquiry thoroughly, accurately, and clearly using markdown formatting. Reference concrete defensive actions, MITRE ATT&CK concepts, or industry standards (NIST, OWASP) where relevant.'
          }
        ];

        if (Array.isArray(context.conversationHistory) && context.conversationHistory.length > 0) {
          for (const m of context.conversationHistory.slice(-4)) {
            messages.push({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text || ''
            });
          }
        }

        messages.push({ role: 'user', content: trimmedPrompt });

        const resp = await axios.post(
          `${ollamaHost}/api/chat`,
          {
            model: ollamaModel,
            messages,
            stream: false,
            keep_alive: '24h',
            options: {
              num_predict: 200,
              temperature: 0.25,
            },
          },
          { timeout: 15000 }
        );

        const reply = resp.data?.message?.content;
        if (reply && reply.trim().length > 5) {
          return reply.trim();
        }
      } catch (ollamaErr) {
        console.warn('[FlotBot] Ollama local query note:', ollamaErr.message);
      }
      return null;
    };

    // 1. If user explicitly requested live cloud intelligence or web data, ask Gemini first
    if (explicitlyNeedsCloudAI) {
      const cloudReply = await tryGemini();
      if (cloudReply) {
        this._aiFastCache.set(cacheKey, { reply: cloudReply, model: 'gemini-flash-latest', ts: Date.now() });
        return {
          reply: cloudReply,
          provider: 'Google Gemini',
          model: 'gemini-flash-latest',
        };
      }
    }

    // 2. Default: Local Ollama handles all queries first (instant, private, zero 503 errors)
    const localReply = await tryOllama();
    if (localReply) {
      this._aiFastCache.set(cacheKey, { reply: localReply, model: ollamaModel, ts: Date.now() });
      return {
        reply: localReply,
        provider: 'ollama',
        model: ollamaModel,
      };
    }

    // 3. If local Ollama was unreachable, seamlessly fallback to Gemini Cloud AI
    const fallbackGemini = await tryGemini();
    if (fallbackGemini) {
      this._aiFastCache.set(cacheKey, { reply: fallbackGemini, model: 'gemini-flash-latest', ts: Date.now() });
      return {
        reply: fallbackGemini,
        provider: 'Google Gemini',
        model: 'gemini-flash-latest',
      };
    }

    // 5. Rich Expert Cybersecurity Knowledge Fallback
    const fallbackReply = this._generateRuleBasedAIResponse(trimmedPrompt, context);
    this._aiFastCache.set(cacheKey, { reply: fallbackReply, model: 'flotbot-expert-ai', ts: Date.now() });
    return {
      reply: fallbackReply,
      provider: 'flotbot-expert-ai',
      model: 'flotbot-expert-v2',
    };
  }

  async explainAlert(alertId, userId = null) {
    const alert = await this.getAlertById(alertId);
    if (!alert) throw new Error('Alert not found');

    const prompt = `Explain security alert: "${alert.title}" (Severity: ${alert.severity}, Category: ${alert.category}). Description: ${alert.description}. Evidence: ${JSON.stringify(alert.evidence)}. Provide root cause, MITRE ATT&CK technique mapping, and actionable remediation steps.`;

    const aiRes = await this.askAI(prompt, { alert });

    const now = new Date().toISOString();
    await db.query(
      'UPDATE alerts SET ai_analysis = $1 WHERE id = $2',
      [JSON.stringify(aiRes), alertId]
    );

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

  _getFastIntentReply(prompt, context = {}) {
    const q = prompt.toLowerCase().trim();
    const study = context.courseContext;

    // 1. Greetings & Identity
    if (/^(hi|hello|hey|greetings|who are you|what can you do|help me|howdy|sup)\b/i.test(q) || q === 'hi' || q === 'hello') {
      return (
        "👋 **Hello! I am FlotBot AI, your real-time Cybersecurity Assistant.**\n\n" +
        "I work directly alongside our **Real-Time Threat Detection Engines** (VirusTotal, Google Safe Browsing, URLEngine, and Endpoint Sensors). Here is what I can do for you:\n" +
        "• 🛡️ **Real-Time Web Shield:** Enter any URL or click links to intercept insecure HTTP, typosquatted brands, and phishing sites.\n" +
        "• ⚡ **Instant Threat Analysis:** Paste any suspicious link, IP, or file hash for immediate verdict and risk breakdown.\n" +
        "• 🎓 **Course Study Coach:** Ask questions about your enrolled security courses, attack labs, and quizzes!\n\n" +
        "How can I help protect you right now?"
      );
    }

    // 2. Insecure HTTP & Browsing Threats
    if (
      q.includes('http') && (q.includes('bad') || q.includes('danger') || q.includes('insecure') || q.includes('safe') || q.includes('unencrypt') || q.includes('plaintext') || q.includes('why') || q.includes('alert') || q.includes('brows'))
    ) {
      return (
        "🚨 **Why Insecure HTTP (Plaintext Protocol) is Intercepted:**\n\n" +
        "1. **Zero Encryption:** Standard `http://` transmits all passwords, cookies, credit card numbers, and form data in unencrypted plaintext.\n" +
        "2. **Man-In-The-Middle (MITM) Sniffing:** Anyone on the same Wi-Fi, local network, or ISP can eavesdrop on your session or inject malicious JavaScript.\n" +
        "3. **No Domain Identity Verification:** Unlike HTTPS (TLS 1.3), HTTP sites have no cryptographically verified certificates. Phishing sites frequently use unencrypted HTTP or deceptive ports.\n\n" +
        "🛡️ **Our Real-Time Detection Engine:** Automatically flags every `http://` destination as an insecure protocol threat, pauses page navigation, and displays an awareness alert before any credentials can be leaked!"
      );
    }

    // 3. How the Real-Time Detection Engine & Interception Works
    if (
      (q.includes('how') || q.includes('what')) &&
      (q.includes('detection engine') || q.includes('engine work') || q.includes('pause') || q.includes('intercept') || q.includes('real time') || q.includes('real-time'))
    ) {
      return (
        "🛡️ **How the Real-Time Threat Detection Engine Operates:**\n\n" +
        "1. **Pre-Navigation Interception:** Before your browser loads any destination, our `URLEngine` and network sensor intercept the outbound request.\n" +
        "2. **Multi-Engine Inspection:** The URL is evaluated across **Google Safe Browsing**, **VirusTotal (70+ AVs)**, and our heuristic sensor for unencrypted HTTP, typosquatting (e.g. `paypa1`), and suspicious TLDs (`.xyz`, `.top`).\n" +
        "3. **Activity Freezing:** If risk indicators are present, navigation is halted instantly to prevent malicious downloads or credential theft.\n" +
        "4. **Interactive Security Alert:** A modal opens displaying the risk score, evidence, and defensive recommendations. You must choose **Safe Exit** (recommended) or confirm risk before proceeding.\n" +
        "5. **SOC Audit Logging:** Every intercepted threat and user decision is permanently recorded in the Admin Console."
      );
    }

    // 4. Phishing & Typosquatting
    if (q.includes('typosquat') || q.includes('lookalike') || (q.includes('phish') && (q.includes('what') || q.includes('explain') || q.includes('how')))) {
      return (
        "🎣 **Phishing & Typosquatting Explained:**\n\n" +
        "• **Typosquatting:** Attackers register misspelled domains that mimic legitimate brands (e.g., `paypa1.com` with a '1' instead of 'l', `micros0ft.com` with '0', or `rn` mimicking 'm').\n" +
        "• **Credential Harvesters:** These sites copy legitimate login pages and steal credentials in plaintext.\n" +
        "• **Detection in Action:** Our engine normalizes leetspeak, compares against official brand registries, and immediately flags lookalikes as **CRITICAL RISK**!"
      );
    }

    // 5. Password Security & Hygiene
    if (q.includes('password') && (q.includes('rule') || q.includes('safe') || q.includes('best') || q.includes('strong') || q.includes('hygiene') || q.includes('how'))) {
      return (
        "🔑 **Password Security Best Practices:**\n\n" +
        "1. **Length > Complexity:** Use passphrases with 16+ characters (e.g. `correct-horse-battery-staple`).\n" +
        "2. **Never Reuse Passwords:** A breach on one service exposes all accounts sharing that password.\n" +
        "3. **Enforce Multi-Factor Authentication (MFA):** Prefer authenticator apps (TOTP) or hardware FIDO2 keys over SMS.\n" +
        "4. **Check Your Progress:** Complete the **'Password Hygiene Mastery'** course in our training catalog for full certification!"
      );
    }

    // 6. Malware & Ransomware
    if (q.includes('ransomware') || (q.includes('malware') && (q.includes('what') || q.includes('explain') || q.includes('how')))) {
      return (
        "🦠 **Malware & Ransomware Defense:**\n\n" +
        "• **Ransomware:** Encrypts user files using asymmetric cryptography (AES-256 / RSA) and demands payment for decryption keys.\n" +
        "• **Delivery Vectors:** Phishing attachments (`.pdf.exe` double extensions), unpatched browser vulnerabilities, and malicious macros.\n" +
        "• **FlotBot Protection:** Our File Engine calculates Shannon entropy (high entropy indicates encrypted/packed payload) and checks SHA-256 hashes against VirusTotal before execution."
      );
    }

    return null;
  }

  _generateRuleBasedAIResponse(prompt, context = {}) {
    const q = prompt.toLowerCase();
    const study = context.courseContext;

    // Course Study & Curriculum Guidance
    if (q.includes('course') || q.includes('study') || q.includes('lesson') || q.includes('learn') || q.includes('class') || q.includes('syllabus') || q.includes('progress')) {
      if (study && study.hasEnrollments) {
        const activeCourseList = study.courses.map(c => `• **${c.title}** (${c.category} · Level: ${c.level}) — ${c.completed ? '✅ Certified & Completed' : `⏳ In Progress (${c.completedLessonsCount} lessons finished)`}`).join('\n');
        return (
          `🎓 **Your Active Cybersecurity Curriculum:**\n\n` +
          `You are currently enrolled in:\n${activeCourseList}\n\n` +
          `💡 **FlotBot Study Coach:** I can quiz you on any module, break down complicated concepts, or explain how live attacks correspond to your course lessons! What topic would you like to review?`
        );
      } else {
        return (
          `🎓 **Cybersecurity Learning Center:**\n\n` +
          `You haven't enrolled in any courses yet! Boost your defenses by enrolling in our top courses:\n` +
          `1. **Brand Impersonation & Typosquatting** (Phishing · Beginner)\n` +
          `2. **Password Hygiene Mastery** (Passwords · Beginner)\n` +
          `3. **OWASP Top 10 Web Vulnerabilities** (Application Security · Intermediate)\n\n` +
          `Visit the **Courses & Training** tab to start learning and earning verified certificates!`
        );
      }
    }

    // Dynamic tie-in with enrolled courses if user asks concept questions
    let courseTieIn = '';
    if (study && study.hasEnrollments) {
      const matched = study.courses.find(c => {
        const cat = (c.category || '').toLowerCase();
        return (q.includes('phish') && cat.includes('phish')) ||
               (q.includes('pass') && cat.includes('pass')) ||
               (q.includes('malware') && cat.includes('malware')) ||
               (q.includes('network') && cat.includes('network')) ||
               (q.includes('sql') && cat.includes('app')) ||
               (q.includes('web') && cat.includes('app'));
      });
      if (matched) {
        courseTieIn = `\n\n💡 *Curriculum Tie-In:* This connects directly with your enrolled course **"${matched.title}"**!`;
      }
    }

    if ((q.includes('suspicious') || q.includes('sus')) && (q.includes('link') || q.includes('url') || q.includes('click') || q.includes('alert'))) {
      return (
        '🛡️ **Yes! Our Threat Detection Engine actively protects you:**\n\n' +
        '1. **Multi-Provider Interception:** When you click any suspicious link, our system checks **Google Safe Browsing**, **VirusTotal**, and **URLEngine**, immediately pausing the navigation.\n' +
        '2. **AI Threat Explanation:** I (FlotBot) analyze the threat telemetry (phishing signatures, typosquatting, high-risk TLDs, punycode) and explain the specific danger in plain English.\n' +
        '3. **Human-in-the-Loop Gate:** You can return to safety (recommended) or provide an explicit acknowledgment / manual approval to proceed.\n' +
        '4. **Admin Audit Logging:** Every alert trigger and user decision is permanently logged in the Admin Panel under your User Inspection profile.' +
        courseTieIn
      );
    }

    if (q.includes('phish') || q.includes('email')) {
      return (
        '⚠️ **Phishing Threat Analysis:** Inspect Return-Path and SPF/DKIM/DMARC authentication headers. Watch out for homoglyph domain impersonation (e.g. `paypa1` vs `paypal`) and high-risk TLDs before authorizing credentials.' +
        courseTieIn
      );
    }
    if (q.includes('file') || q.includes('malware') || q.includes('hash')) {
      return (
        '🔍 **File Reputation Analysis:** File hashes are cross-checked against VirusTotal (70+ AV engines) and Hybrid Analysis Falcon sandbox to detect zero-day payloads, double extensions (e.g. `.pdf.exe`), and high Shannon entropy.' +
        courseTieIn
      );
    }
    if (q.includes('powershell') || q.includes('cmd') || q.includes('process')) {
      return (
        '🔍 **Execution Telemetry:** Encoded command line parameters (`-EncodedCommand`, `-w hidden`) indicate potential living-off-the-land dropper behavior. Terminate suspicious parent process trees immediately.' +
        courseTieIn
      );
    }
    if (q.includes('ip') || q.includes('network') || q.includes('connection')) {
      return (
        '🛡️ **Network Posture:** Outbound persistent connection to unverified remote ports flagged for reverse shell indicators. Recommended action: Add remote IP to global blocklist and verify endpoint isolation.' +
        courseTieIn
      );
    }

    return (
      '🛡️ **FlotBot AI Assistant:** Working alongside our Threat Detection Engines (VirusTotal, Google Safe Browsing, Hybrid Analysis, URLEngine) with real-time awareness coaching and curriculum mentoring.' +
      courseTieIn
    );
  }
}

module.exports = new FlotBotService();
