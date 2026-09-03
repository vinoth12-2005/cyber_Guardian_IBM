const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const courseService = require('../services/courseService');

/**
 * GET /api/courses
 * List all courses with optional filters and user progress if authenticated
 */
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { cat, level, search, status, includeDrafts } = req.query;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN'].includes(req.user.role);
    const allowDrafts = isAdmin || includeDrafts === 'true';
    const courses = await courseService.listCourses({ cat, level, search, status, includeDrafts: allowDrafts, userId });

    res.json({
      success: true,
      data: courses,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/courses/my-learning
 * Get user's enrolled and in-progress courses
 */
router.get('/my-learning', authenticate, async (req, res, next) => {
  try {
    const courses = await courseService.listCourses({ userId: req.user.id });
    const enrolledCourses = courses.filter((c) => c.userProgress !== null);

    res.json({
      success: true,
      data: enrolledCourses,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/courses/:id
 * Get course details with modules, lessons, and final quiz
 */
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const course = await courseService.getCourseById(req.params.id, userId);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COURSE_NOT_FOUND',
          message: `Course '${req.params.id}' not found`,
        },
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/courses/:id/enroll
 * Enroll current user in a course
 */
router.post('/:id/enroll', authenticate, async (req, res, next) => {
  try {
    const result = await courseService.enrollUser(req.user.id, req.params.id);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/courses/:id/progress
 * Update lesson completion or time spent
 */
router.post('/:id/progress', authenticate, async (req, res, next) => {
  try {
    const { lessonKey, timeSpentMinutes } = req.body;
    const result = await courseService.updateProgress(req.user.id, req.params.id, {
      lessonKey,
      timeSpentMinutes,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/courses/:id/quiz
 * Submit course quiz assessment answers
 */
router.post('/:id/quiz', authenticate, async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Expected array of answers',
        },
      });
    }

    const result = await courseService.submitQuiz(req.user.id, req.params.id, answers);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
