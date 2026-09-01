const db = require('../db');
const certificationService = require('./certificationService');

class CourseService {
  /**
   * List courses with optional filters and user progress
   */
  async listCourses({ cat = '', level = '', search = '', userId = null } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (cat && cat !== 'All') {
      conditions.push(`cat = $${idx++}`);
      params.push(cat);
    }

    if (level && level !== 'All') {
      conditions.push(`level = $${idx++}`);
      params.push(level);
    }

    if (search) {
      conditions.push(`(title ILIKE $${idx} OR desc_text ILIKE $${idx} OR cat ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM courses ${whereClause} ORDER BY created_at ASC`;
    const res = await db.query(sql, params);

    const courses = res.rows.map(this._formatCourse);

    // If userId provided, attach enrollment and progress
    if (userId && courses.length > 0) {
      const progRes = await db.query(
        'SELECT * FROM course_progress WHERE user_id = $1',
        [userId]
      );
      const progMap = new Map();
      for (const p of progRes.rows) {
        progMap.set(p.course_id, p);
      }

      for (const c of courses) {
        const prog = progMap.get(c.id);
        c.userProgress = prog
          ? {
              completedLessons: JSON.parse(prog.completed_lessons || '[]'),
              quizScore: prog.quiz_score,
              certified: !!prog.certified,
              certifiedAt: prog.certified_at,
              credId: prog.cred_id,
            }
          : null;
      }
    }

    return courses;
  }

  /**
   * Get single course with full modules, lessons, and quizzes
   */
  async getCourseById(courseId, userId = null) {
    const cRes = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (cRes.rowCount === 0) return null;

    const course = this._formatCourse(cRes.rows[0]);

    // Fetch modules
    const modRes = await db.query(
      'SELECT * FROM course_modules WHERE course_id = $1 ORDER BY module_order ASC',
      [courseId]
    );

    // Fetch lessons
    const lesRes = await db.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY lesson_order ASC',
      [courseId]
    );

    // Fetch quizzes
    const quizRes = await db.query(
      'SELECT * FROM course_quizzes WHERE course_id = $1 ORDER BY question_order ASC',
      [courseId]
    );

    // Group lessons by module_id
    const lessonsByModule = new Map();
    for (const l of lesRes.rows) {
      if (!lessonsByModule.has(l.module_id)) {
        lessonsByModule.set(l.module_id, []);
      }
      lessonsByModule.get(l.module_id).push(this._formatLesson(l));
    }

    course.modules = modRes.rows.map((m) => ({
      id: m.id,
      title: m.title,
      desc: m.desc_text,
      duration: m.duration,
      objectives: JSON.parse(m.objectives || '[]'),
      lessons: lessonsByModule.get(m.id) || [],
    }));

    course.quiz = quizRes.rows.map((q) => ({
      id: q.id,
      q: q.question,
      options: JSON.parse(q.options || '[]'),
      answer: q.answer,
      explanation: q.explanation || '',
    }));

    if (userId) {
      const progRes = await db.query(
        'SELECT * FROM course_progress WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );
      course.userProgress = progRes.rows[0]
        ? {
            completedLessons: JSON.parse(progRes.rows[0].completed_lessons || '[]'),
            quizScore: progRes.rows[0].quiz_score,
            certified: !!progRes.rows[0].certified,
            certifiedAt: progRes.rows[0].certified_at,
            credId: progRes.rows[0].cred_id,
          }
        : null;
    }

    return course;
  }

  /**
   * Enroll user in course
   */
  async enrollUser(userId, courseId) {
    const course = await db.query('SELECT id FROM courses WHERE id = $1', [courseId]);
    if (course.rowCount === 0) throw new Error('Course not found');

    const now = new Date().toISOString();
    const id = `enr_${userId}_${courseId}`;

    await db.query(
      `INSERT INTO course_enrollments (id, user_id, course_id, status, enrolled_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [id, userId, courseId, 'enrolled', now]
    );

    // Initialize progress record if not exists
    const progId = `prog_${userId}_${courseId}`;
    await db.query(
      `INSERT INTO course_progress (id, user_id, course_id, completed_lessons, completed_activities, quizzes_passed, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, course_id) DO NOTHING`,
      [progId, userId, courseId, JSON.stringify([]), JSON.stringify([]), JSON.stringify({}), now]
    );

    // Record activity
    await db.query(
      `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'act_' + Math.random().toString(36).substring(2, 10),
        userId,
        'COURSE_OPENED',
        'Enrolled in course',
        courseId,
        'Learning',
        'success',
        JSON.stringify({ courseId }),
        now,
      ]
    );

    return { success: true, message: 'Successfully enrolled in course' };
  }

  /**
   * Update lesson progress (mark complete / toggle)
   */
  async updateProgress(userId, courseId, { lessonKey, timeSpentMinutes = 0 }) {
    const now = new Date().toISOString();
    const progRes = await db.query(
      'SELECT * FROM course_progress WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    let completed = [];
    let prevTime = 0;

    if (progRes.rowCount > 0) {
      completed = JSON.parse(progRes.rows[0].completed_lessons || '[]');
      prevTime = progRes.rows[0].time_spent_minutes || 0;
    }

    if (lessonKey) {
      if (completed.includes(lessonKey)) {
        completed = completed.filter((k) => k !== lessonKey);
      } else {
        completed.push(lessonKey);
      }
    }

    const totalTime = prevTime + timeSpentMinutes;
    const progId = `prog_${userId}_${courseId}`;

    await db.query(
      `INSERT INTO course_progress (id, user_id, course_id, completed_lessons, time_spent_minutes, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, course_id) DO UPDATE SET
         completed_lessons = $4,
         time_spent_minutes = $5,
         updated_at = $6`,
      [progId, userId, courseId, JSON.stringify(completed), totalTime, now]
    );

    // Award XP for completed lesson
    if (lessonKey && completed.includes(lessonKey)) {
      await db.query(
        'UPDATE users SET xp = xp + 50, updated_at = $1 WHERE id = $2',
        [now, userId]
      );

      // Record activity
      await db.query(
        `INSERT INTO user_activity (id, user_id, activity_type, label, detail, category, icon_type, metadata_json, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          'act_' + Math.random().toString(36).substring(2, 10),
          userId,
          'LESSON_COMPLETED',
          'Completed lesson',
          lessonKey,
          'Learning',
          'success',
          JSON.stringify({ courseId, lessonKey }),
          now,
        ]
      );
    }

    return {
      success: true,
      completedLessons: completed,
      timeSpentMinutes: totalTime,
    };
  }

  /**
   * Submit quiz, calculate score and issue certificate if passed (>= 70%)
   */
  async submitQuiz(userId, courseId, userAnswers = []) {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error('Course not found');

    const quizQuestions = course.quiz || [];
    if (quizQuestions.length === 0) throw new Error('No quiz defined for this course');

    let correctCount = 0;
    const results = quizQuestions.map((q, idx) => {
      const userAns = userAnswers[idx];
      const isCorrect = userAns === q.answer;
      if (isCorrect) correctCount++;
      return {
        question: q.q,
        userAnswer: userAns,
        correctAnswer: q.answer,
        isCorrect,
        explanation: q.explanation,
      };
    });

    const scorePct = Math.round((correctCount / quizQuestions.length) * 100);
    const passed = scorePct >= 70;
    const now = new Date().toISOString();

    let cert = null;
    if (passed) {
      // Issue certificate
      cert = await certificationService.issueCertificate(userId, courseId, scorePct);

      // Update enrollment to completed
      await db.query(
        `UPDATE course_enrollments SET status = 'completed', completed_at = $1 WHERE user_id = $2 AND course_id = $3`,
        [now, userId, courseId]
      );

      // Award XP
      await db.query(
        'UPDATE users SET xp = xp + 200, updated_at = $1 WHERE id = $2',
        [now, userId]
      );
    }

    // Update progress table
    const progId = `prog_${userId}_${courseId}`;
    await db.query(
      `INSERT INTO course_progress (id, user_id, course_id, quiz_score, final_assessment_score, certified, certified_at, cred_id, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, course_id) DO UPDATE SET
         quiz_score = $4,
         final_assessment_score = $5,
         certified = $6,
         certified_at = $7,
         cred_id = $8,
         updated_at = $9`,
      [
        progId,
        userId,
        courseId,
        scorePct,
        scorePct,
        passed ? 1 : 0,
        passed ? now : null,
        cert ? cert.credId : null,
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
        passed ? 'CERTIFICATE_EARNED' : 'QUIZ_COMPLETED',
        passed ? `Certified in ${course.title}` : `Completed quiz for ${course.title}`,
        `Score: ${scorePct}%`,
        'Learning',
        passed ? 'success' : 'warning',
        JSON.stringify({ courseId, scorePct, passed, credId: cert?.credId }),
        now,
      ]
    );

    return {
      success: true,
      score: scorePct,
      passed,
      results,
      certificate: cert,
    };
  }

  /**
   * Create new course (Admin)
   */
  async createCourse(courseData) {
    const id = courseData.id || (
      courseData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()
    );
    const now = new Date().toISOString();

    await db.query(
      `INSERT INTO courses (id, title, cat, icon, color1, color2, level, desc_text, duration, provider, objectives, skills_gained, prerequisites, banner_image, intro_video, credential_eligible, credential_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        id,
        courseData.title,
        courseData.cat,
        courseData.icon || 'shield',
        courseData.color1 || '#7C3AED',
        courseData.color2 || '#38BDF8',
        courseData.level || 'Beginner',
        courseData.desc || courseData.desc_text || '',
        courseData.duration || '4-6 hours',
        courseData.provider || 'CyberGuardian Institute',
        JSON.stringify(courseData.objectives || []),
        JSON.stringify(courseData.skillsGained || []),
        JSON.stringify(courseData.prerequisites || []),
        courseData.bannerImage || null,
        courseData.introVideo || null,
        courseData.credentialEligible !== false ? 1 : 0,
        courseData.credentialName || `${courseData.title} Specialist Certification`,
        now,
        now,
      ]
    );

    // Create modules & lessons if provided
    if (Array.isArray(courseData.modules)) {
      for (let mi = 0; mi < courseData.modules.length; mi++) {
        const mod = courseData.modules[mi];
        const moduleId = `${id}-mod-${mi + 1}`;
        await db.query(
          `INSERT INTO course_modules (id, course_id, module_order, title, desc_text, duration, objectives)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [moduleId, id, mi, mod.title, mod.desc || '', mod.duration || '', JSON.stringify(mod.objectives || [])]
        );

        if (Array.isArray(mod.lessons)) {
          for (let li = 0; li < mod.lessons.length; li++) {
            const les = mod.lessons[li];
            const lessonId = les.id || `${moduleId}-les-${li + 1}`;
            await db.query(
              `INSERT INTO lessons (id, module_id, course_id, lesson_order, title, lesson_type, dur, body, image, example, real_time_example, points, activities, knowledge_check)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
              [
                lessonId,
                moduleId,
                id,
                li,
                les.title,
                les.type || 'reading',
                les.dur || '5 min',
                les.body || '',
                les.image || null,
                les.example || null,
                les.realTimeExample || null,
                JSON.stringify(les.points || []),
                JSON.stringify(les.activities || []),
                JSON.stringify(les.knowledgeCheck || []),
              ]
            );
          }
        }
      }
    }

    // Create Quizzes if provided
    if (Array.isArray(courseData.quiz)) {
      for (let qi = 0; qi < courseData.quiz.length; qi++) {
        const q = courseData.quiz[qi];
        const quizId = `${id}-quiz-${qi + 1}`;
        await db.query(
          `INSERT INTO course_quizzes (id, course_id, question, options, answer, explanation, question_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [quizId, id, q.q || q.question || '', JSON.stringify(q.options || []), q.answer ?? 0, q.explanation || '', qi]
        );
      }
    }

    return await this.getCourseById(id);
  }

  /**
   * Delete course (Admin)
   */
  async deleteCourse(courseId) {
    await db.query('DELETE FROM lessons WHERE course_id = $1', [courseId]);
    await db.query('DELETE FROM course_modules WHERE course_id = $1', [courseId]);
    await db.query('DELETE FROM course_quizzes WHERE course_id = $1', [courseId]);
    await db.query('DELETE FROM course_progress WHERE course_id = $1', [courseId]);
    await db.query('DELETE FROM course_enrollments WHERE course_id = $1', [courseId]);
    const res = await db.query('DELETE FROM courses WHERE id = $1', [courseId]);
    return res.rowCount > 0;
  }

  _formatCourse(row) {
    return {
      id: row.id,
      title: row.title,
      cat: row.cat,
      icon: row.icon,
      color1: row.color1,
      color2: row.color2,
      level: row.level,
      desc: row.desc_text,
      duration: row.duration,
      provider: row.provider,
      objectives: JSON.parse(row.objectives || '[]'),
      skillsGained: JSON.parse(row.skills_gained || '[]'),
      prerequisites: JSON.parse(row.prerequisites || '[]'),
      bannerImage: row.banner_image,
      introVideo: row.intro_video,
      credentialEligible: !!row.credential_eligible,
      credentialName: row.credential_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  _formatLesson(row) {
    return {
      id: row.id,
      title: row.title,
      type: row.lesson_type,
      dur: row.dur,
      body: row.body,
      image: row.image,
      example: row.example,
      realTimeExample: row.real_time_example,
      points: JSON.parse(row.points || '[]'),
      activities: JSON.parse(row.activities || '[]'),
      knowledgeCheck: JSON.parse(row.knowledge_check || '[]'),
    };
  }
}

module.exports = new CourseService();
