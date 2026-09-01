const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const simulationService = require('../services/simulationService');

/**
 * GET /api/simulations
 * List all simulation scenarios
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;
    const simulations = await simulationService.listSimulations({ category, difficulty });

    res.json({
      success: true,
      data: simulations,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/simulations/my-history
 * Get user's simulation attempt history
 */
router.get('/my-history', authenticate, async (req, res, next) => {
  try {
    const history = await simulationService.getUserHistory(req.user.id);
    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/simulations/:id
 * Get single simulation scenario details
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const simulation = await simulationService.getSimulationById(req.params.id);
    if (!simulation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SIMULATION_NOT_FOUND',
          message: `Simulation scenario '${req.params.id}' not found`,
        },
      });
    }

    res.json({
      success: true,
      data: simulation,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/simulations/:id/start
 * Start a simulation attempt
 */
router.post('/:id/start', authenticate, async (req, res, next) => {
  try {
    const session = await simulationService.startAttempt(req.user.id, req.params.id);
    res.json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/simulations/:id/event
 * Record interactive simulation action/event
 */
router.post('/:id/event', authenticate, async (req, res, next) => {
  try {
    const { attemptId, ...eventData } = req.body;
    if (!attemptId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Missing attemptId parameter',
        },
      });
    }

    const result = await simulationService.recordEvent(attemptId, eventData);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/simulations/:id/complete
 * Complete a simulation attempt and save score/outcomes
 */
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const result = await simulationService.completeAttempt(req.user.id, req.params.id, req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
