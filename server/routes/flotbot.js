const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole, requireAnyAdmin } = require('../middleware/rbac');
const flotbotService = require('../services/flotbotService');
const securityBehaviourService = require('../services/securityBehaviourService');

// ── Security Alerts ──────────────────────────────────────────────────────────

/**
 * GET /api/flotbot/alerts
 * List alerts with filtering and pagination
 */
router.get('/alerts', optionalAuth, async (req, res, next) => {
  try {
    const { page, limit, severity, status, category, search } = req.query;
    const result = await flotbotService.listAlerts({ page, limit, severity, status, category, search });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/flotbot/alerts/:id
 * Get single alert with full event lifecycle history
 */
router.get('/alerts/:id', optionalAuth, async (req, res, next) => {
  try {
    const alert = await flotbotService.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALERT_NOT_FOUND',
          message: `Alert '${req.params.id}' not found`,
        },
      });
    }

    res.json({
      success: true,
      data: alert,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/alerts/:id/event
 * Record alert lifecycle event (displayed, viewed, ai_explained, investigated, etc.)
 */
router.post('/alerts/:id/event', optionalAuth, async (req, res, next) => {
  try {
    const { eventType, metadata } = req.body;
    if (!eventType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'eventType is required',
        },
      });
    }

    const userId = req.user ? req.user.id : null;
    const result = await flotbotService.recordAlertEvent(req.params.id, eventType, userId, metadata || {});

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/alerts/:id/acknowledge
 * Acknowledge an alert
 */
router.post('/alerts/:id/acknowledge', authenticate, async (req, res, next) => {
  try {
    const alert = await flotbotService.acknowledgeAlert(req.params.id, req.user.id);
    res.json({
      success: true,
      data: alert,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/alerts/:id/resolve
 * Resolve an alert with resolution notes
 */
router.post('/alerts/:id/resolve', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;
    const alert = await flotbotService.resolveAlert(req.params.id, req.user.id, resolutionNotes || '');
    res.json({
      success: true,
      data: alert,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/flotbot/alerts/:id/history
 * Get alert lifecycle event history
 */
router.get('/alerts/:id/history', optionalAuth, async (req, res, next) => {
  try {
    const alert = await flotbotService.getAlertById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ALERT_NOT_FOUND',
          message: `Alert '${req.params.id}' not found`,
        },
      });
    }

    res.json({
      success: true,
      data: alert.history || [],
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/flotbot/threats
 * Get active threat detections
 */
router.get('/threats', optionalAuth, async (req, res, next) => {
  try {
    const alertsResult = await flotbotService.listAlerts({ status: 'NEW', limit: 20 });
    res.json({
      success: true,
      data: {
        activeThreats: alertsResult.alerts,
        status: alertsResult.alerts.some(a => a.severity === 'CRITICAL') ? 'CRITICAL' : alertsResult.alerts.length > 0 ? 'WARNING' : 'SECURE',
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── User Security Behaviour ──────────────────────────────────────────────────

/**
 * GET /api/flotbot/user-behaviour/:userId
 * Calculate real user security behavior metrics from actual DB records
 */
router.get('/user-behaviour/:userId', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST', 'PLATFORM_ADMIN'), async (req, res, next) => {
  try {
    const behaviour = await securityBehaviourService.getUserSecurityBehaviour(req.params.userId);
    res.json({
      success: true,
      data: behaviour,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/flotbot/my-security-behaviour
 * Get current user's security behavior metrics
 */
router.get('/my-security-behaviour', authenticate, async (req, res, next) => {
  try {
    const behaviour = await securityBehaviourService.getUserSecurityBehaviour(req.user.id);
    res.json({
      success: true,
      data: behaviour,
    });
  } catch (err) {
    next(err);
  }
});

// ── IOC Management ──────────────────────────────────────────────────────────

/**
 * GET /api/flotbot/iocs
 * List and search IOCs
 */
router.get('/iocs', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const { type, search } = req.query;
    const iocs = await flotbotService.listIocs({ type, search });
    res.json({
      success: true,
      data: iocs,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/iocs
 * Add new IOC indicator (Admin / Analyst)
 */
router.post('/iocs', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const { type, value, threatName, severity, note } = req.body;
    const ioc = await flotbotService.addIoc({
      type,
      value,
      threatName,
      severity,
      note,
      addedBy: req.user.name || req.user.email,
    });
    res.json({
      success: true,
      data: ioc,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/flotbot/iocs/:id
 * Update IOC indicator
 */
router.put('/iocs/:id', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'), async (req, res, next) => {
  try {
    const updated = await flotbotService.updateIoc(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'IOC_NOT_FOUND', message: 'IOC not found' },
      });
    }
    res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/flotbot/iocs/:id
 * Remove IOC indicator
 */
router.delete('/iocs/:id', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'), async (req, res, next) => {
  try {
    const success = await flotbotService.deleteIoc(req.params.id);
    res.json({
      success,
      message: success ? 'IOC removed successfully' : 'IOC not found',
    });
  } catch (err) {
    next(err);
  }
});

// ── Threat Rules ────────────────────────────────────────────────────────────

/**
 * GET /api/flotbot/rules
 * List all threat detection rules
 */
router.get('/rules', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST'), async (req, res, next) => {
  try {
    const rules = await flotbotService.listRules();
    res.json({
      success: true,
      data: rules,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/flotbot/rules/:id/toggle
 * Enable or disable a threat rule
 */
router.patch('/rules/:id/toggle', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'), async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const rule = await flotbotService.toggleRule(req.params.id, enabled, req.user.name || req.user.email);
    res.json({
      success: true,
      data: rule,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/flotbot/rules/:id
 * Update threat rule configuration
 */
router.put('/rules/:id', authenticate, requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN'), async (req, res, next) => {
  try {
    const rule = await flotbotService.updateRuleConfig(req.params.id, req.body.config || req.body, req.user.name || req.user.email);
    res.json({
      success: true,
      data: rule,
    });
  } catch (err) {
    next(err);
  }
});

// ── URL Threat Detection & Interception ──────────────────────────────────────

/**
 * POST /api/flotbot/analyze-url
 * Analyze URL with URLEngine, pause navigation, generate AI awareness explanation, and log alert
 */
router.post('/analyze-url', optionalAuth, async (req, res, next) => {
  try {
    const { url, metadata } = req.body;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'url is required' },
      });
    }

    const userId = req.user ? req.user.id : (metadata?.userId || null);
    const result = await flotbotService.analyzeUrl(url, userId, metadata || {});

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/analyze-file
 * Analyze file hash via VirusTotal & Hybrid Analysis with local entropy heuristics
 */
router.post('/analyze-file', optionalAuth, async (req, res, next) => {
  try {
    const { sha256, fileName, filePath, entropy } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await flotbotService.analyzeFile({ sha256, fileName, filePath, entropy }, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/alerts/:id/decision
 * Record user decision at Interception Gate (safe_exit vs override_proceed)
 */
router.post('/alerts/:id/decision', optionalAuth, async (req, res, next) => {
  try {
    const { action, reason } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await flotbotService.recordUserDecision(req.params.id, userId, action, reason || '');

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

// ── AI Operations ────────────────────────────────────────────────────────────

/**
 * GET /api/flotbot/chats
 * List persistent chat sessions for authenticated user + course study context
 */
router.get('/chats', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    const sessions = await flotbotService.listChatSessions(userId);
    const studyContext = await flotbotService.getUserCourseStudyContext(userId);

    res.json({
      success: true,
      data: {
        sessions,
        studyContext,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/flotbot/chats/:sessionId
 * Load complete message history for a specific chat session
 */
router.get('/chats/:sessionId', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    const result = await flotbotService.getChatSessionWithMessages(req.params.sessionId, userId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Chat session not found' },
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/flotbot/chats/:sessionId
 * Delete chat session and its message logs
 */
router.delete('/chats/:sessionId', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : 'anonymous';
    const result = await flotbotService.deleteChatSession(req.params.sessionId, userId);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/ai/chat
 * Persistent FlotBot AI Chat assistant with course study awareness and multi-turn history
 */
router.post('/ai/chat', optionalAuth, async (req, res, next) => {
  try {
    const { message, sessionId, context = {} } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'message is required' },
      });
    }

    const userId = req.user ? req.user.id : 'anonymous';

    // 1. Create or retrieve persistent session
    const session = await flotbotService.createOrGetSession(sessionId, userId, message);
    const activeSessionId = session.id;

    // 2. Persist user message to PostgreSQL
    const savedUserMsg = await flotbotService.saveChatMessage(
      activeSessionId,
      userId,
      'user',
      message,
      context.metadata || {}
    );

    // 3. Inject Course Study Context & Recent Conversation History
    const studyContext = await flotbotService.getUserCourseStudyContext(userId);
    const fullSession = await flotbotService.getChatSessionWithMessages(activeSessionId, userId);
    const recentMessages = (fullSession?.messages || []).slice(-8);

    const mergedContext = {
      ...context,
      userId,
      sessionId: activeSessionId,
      courseContext: studyContext,
      conversationHistory: recentMessages,
    };

    // 4. Query AI Engine
    const aiResult = await flotbotService.askAI(message, mergedContext);

    // 5. Persist AI response to PostgreSQL
    const savedBotMsg = await flotbotService.saveChatMessage(
      activeSessionId,
      userId,
      'flotbot',
      aiResult.reply,
      {
        provider: aiResult.provider,
        model: aiResult.model,
      }
    );

    res.json({
      success: true,
      data: {
        reply: aiResult.reply,
        sessionId: activeSessionId,
        sessionTitle: session.title,
        sessionCategory: session.category,
        provider: aiResult.provider,
        model: aiResult.model,
        userMessage: savedUserMsg,
        botMessage: savedBotMsg,
        studyContext,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/flotbot/ai/explain
 * Request AI explanation for an alert
 */
router.post('/ai/explain', optionalAuth, async (req, res, next) => {
  try {
    const { alertId } = req.body;
    const userId = req.user ? req.user.id : null;
    const explanation = await flotbotService.explainAlert(alertId, userId);
    res.json({
      success: true,
      data: explanation,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

