const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../db');

/**
 * GET /api/activity
 * Get current user's activity timeline with optional category filter
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { category, limit = 50 } = req.query;
    const conditions = ['user_id = $1'];
    const params = [req.user.id];
    let idx = 2;

    if (category && category !== 'All') {
      conditions.push(`category = $${idx++}`);
      params.push(category);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    const sql = `
      SELECT id, activity_type, label, detail, category, icon_type, metadata_json, timestamp
      FROM user_activity
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${idx}
    `;
    params.push(parseInt(limit, 10));

    const result = await db.query(sql, params);

    const activities = result.rows.map((r) => ({
      id: r.id,
      activityType: r.activity_type,
      label: r.label,
      detail: r.detail,
      category: r.category,
      icon: r.icon_type,
      time: r.timestamp,
      metadata: JSON.parse(r.metadata_json || '{}'),
    }));

    res.json({
      success: true,
      data: activities,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/activity
 * Record a user activity
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { activityType, label, detail, category, iconType = 'success', metadata = {} } = req.body;
    if (!activityType || !label) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'activityType and label are required',
        },
      });
    }

    const id = 'act_' + Math.random().toString(36).substring(2, 10);
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, req.user.id, activityType, label, detail || '', category || 'General', iconType, JSON.stringify(metadata), now]
    );

    res.json({
      success: true,
      data: {
        id,
        activityType,
        label,
        detail,
        category,
        icon: iconType,
        time: now,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
