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
  async listChatSessions(userId) {
    if (!userId) return [];
    const res = await db.query(
      `SELECT id, user_id, title, category, message_count, created_at, updated_at
       FROM chat_sessions
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
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
    const title = (firstMessageText || 'New Conversation')
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .slice(0, 6)
      .join(' ') || 'Security Consultation';

    const lower = (firstMessageText || '').toLowerCase();
    let category = 'General';
    if (lower.includes('phish') || lower.includes('mail')) category = 'Phishing';
    else if (lower.includes('pass') || lower.includes('mfa') || lower.includes('auth')) category = 'Password';
    else if (lower.includes('course') || lower.includes('study') || lower.includes('learn')) category = 'Course Study';
    else if (lower.includes('malware') || lower.includes('virus') || lower.includes('trojan')) category = 'Malware';
    else if (lower.includes('net') || lower.includes('ip') || lower.includes('port')) category = 'Network';

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
    const ollamaHost = config.ai.ollamaHost;
    const model = config.ai.ollamaModel;

    let studyGuidance = '';
    if (context.courseContext && context.courseContext.hasEnrollments) {
      const list = context.courseContext.courses
        .map((c) => `- ${c.title} (${c.category}, Level: ${c.level}, ${c.completed ? 'Completed' : 'In Progress'})`)
        .join('\n');
      studyGuidance = `\n\nThe user is currently enrolled in these cybersecurity courses in our platform:\n${list}\nWhen relevant, reference these courses, lessons, and concepts to mentor the user directly in their studies.`;
    }

    const systemContext =
      "You are FlotBot AI, an elite AI cybersecurity awareness and training companion working alongside our multi-layered Threat Detection Engines (VirusTotal, Google Safe Browsing, Hybrid Analysis, URLEngine, YaraEngine, ProcessTreeEngine).\n" +
      "When users encounter threats, our detection engines intercept and pause the activity. " +
      "Your role is to explain what happened in plain English, citing exact evidence, guide defensive decisions, and serve as an academic study tutor for their enrolled cybersecurity training courses." +
      studyGuidance;

    try {
      // 1. Try local Ollama AI model
      const resp = await axios.post(
        `${ollamaHost}/api/generate`,
        {
          model,
          prompt: `${systemContext}\n\nContext: ${JSON.stringify(context)}\n\nQuery: ${prompt}`,
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
      // Fallback if local Ollama is offline
    }

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
