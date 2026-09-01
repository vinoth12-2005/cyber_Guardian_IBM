const http = require('http');
const { startServer } = require('./server');
const db = require('./db');

function makeRequest(port, path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Helper to create a mock Firebase ID token for testing
function createMockFirebaseToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    iss: 'https://securetoken.google.com/cyberguardian-ai-8098f',
    aud: 'cyberguardian-ai-8098f',
    auth_time: Math.floor(Date.now() / 1000),
    user_id: payload.uid,
    sub: payload.uid,
    email: payload.email,
    email_verified: true,
    name: payload.name || 'Test User',
    ...payload,
  })).toString('base64url');
  return `${header}.${body}.signature`;
}

async function runTests() {
  console.log('🧪 Starting CyberGuardian AI Unified Backend Test Suite...\n');
  const PORT = 5098;
  const { server } = await startServer(PORT);

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health Endpoint
    console.log('\n--- 1. System Health ---');
    const health = await makeRequest(PORT, '/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /health returns 200 ok');

    // 2. Authentication & User Sync
    console.log('\n--- 2. Authentication & Token Verification ---');
    const studentToken = createMockFirebaseToken({
      uid: 'test_student_123',
      email: 'student@example.com',
      name: 'Alice Student',
    });

    const adminToken = createMockFirebaseToken({
      uid: 'test_admin_456',
      email: 'admin@cyberguardian.local',
      name: 'Bob Admin',
    });

    // Test unauthenticated request on protected route
    const unauthRes = await makeRequest(PORT, '/api/auth/me');
    assert(unauthRes.status === 401, 'Protected route returns 401 without token');

    // Test sync endpoint for student
    const syncStudent = await makeRequest(PORT, '/api/auth/sync', 'POST', {}, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(syncStudent.status === 200 && syncStudent.data.data.user.email === 'student@example.com', 'Student sync creates database user');
    const studentUserId = syncStudent.data.data.user.id;

    // Test sync endpoint for admin
    const syncAdmin = await makeRequest(PORT, '/api/auth/sync', 'POST', {}, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(syncAdmin.status === 200 && syncAdmin.data.data.user.role === 'SUPER_ADMIN', 'Admin sync assigns SUPER_ADMIN role');
    const adminUserId = syncAdmin.data.data.user.id;

    // 3. User Profile & Dashboard
    console.log('\n--- 3. User Profile & Dashboard ---');
    const userMe = await makeRequest(PORT, '/api/users/me', 'GET', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(userMe.status === 200 && userMe.data.data.profile.id === studentUserId, 'GET /api/users/me returns student profile and stats');

    const updateProfile = await makeRequest(PORT, '/api/users/me', 'PUT', {
      name: 'Alice Updated',
      bio: 'Cybersecurity learner and bug bounty hunter.',
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(updateProfile.status === 200 && updateProfile.data.data.name === 'Alice Updated', 'PUT /api/users/me updates profile info');

    // 4. Course Catalog, Enrollment & Progress
    console.log('\n--- 4. Course Operations ---');
    const coursesList = await makeRequest(PORT, '/api/courses');
    assert(coursesList.status === 200 && coursesList.data.data.length > 0, `GET /api/courses returns ${coursesList.data?.data?.length} courses`);
    const firstCourseId = coursesList.data.data[0].id;

    const courseDetail = await makeRequest(PORT, `/api/courses/${firstCourseId}`);
    assert(courseDetail.status === 200 && courseDetail.data.data.id === firstCourseId, `GET /api/courses/${firstCourseId} returns course with modules`);

    const enrollRes = await makeRequest(PORT, `/api/courses/${firstCourseId}/enroll`, 'POST', {}, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(enrollRes.status === 200 && enrollRes.data.success === true, 'POST /api/courses/:id/enroll enrolls user');

    const progRes = await makeRequest(PORT, `/api/courses/${firstCourseId}/progress`, 'POST', {
      lessonKey: `${firstCourseId}-mod-1-les-1`,
      timeSpentMinutes: 10,
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(progRes.status === 200 && progRes.data.success === true, 'POST /api/courses/:id/progress records lesson completion & XP');

    // Quiz submission
    const quizAnswers = (courseDetail.data.data.quiz || []).map(q => q.answer);
    const quizRes = await makeRequest(PORT, `/api/courses/${firstCourseId}/quiz`, 'POST', {
      answers: quizAnswers,
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(quizRes.status === 200 && quizRes.data.data.passed === true, 'POST /api/courses/:id/quiz grades answers and issues certificate');
    const issuedCredId = quizRes.data.data.certificate?.credId;

    // 5. Certifications
    console.log('\n--- 5. Certifications ---');
    const myCerts = await makeRequest(PORT, '/api/certifications/my', 'GET', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(myCerts.status === 200 && myCerts.data.data.length > 0, 'GET /api/certifications/my returns earned certificate');

    if (issuedCredId) {
      const verifyRes = await makeRequest(PORT, `/api/certifications/verify/${issuedCredId}`);
      assert(verifyRes.status === 200 && verifyRes.data.data.verified === true, `GET /api/certifications/verify/${issuedCredId} verifies certificate`);
    }

    // 6. Simulations
    console.log('\n--- 6. Simulations ---');
    const simList = await makeRequest(PORT, '/api/simulations');
    assert(simList.status === 200 && simList.data.data.length > 0, `GET /api/simulations returns ${simList.data.data.length} scenarios`);
    const firstSimId = simList.data.data[0].id;

    const startSim = await makeRequest(PORT, `/api/simulations/${firstSimId}/start`, 'POST', {}, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(startSim.status === 200 && startSim.data.data.attemptId, 'POST /api/simulations/:id/start creates attempt session');
    const attemptId = startSim.data.data.attemptId;

    const recordEvent = await makeRequest(PORT, `/api/simulations/${firstSimId}/event`, 'POST', {
      attemptId,
      action: 'INSPECTED_HEADER',
      riskDelta: -10,
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(recordEvent.status === 200 && recordEvent.data.data.riskScore !== undefined, 'POST /api/simulations/:id/event records interaction');

    const completeSim = await makeRequest(PORT, `/api/simulations/${firstSimId}/complete`, 'POST', {
      attemptId,
      score: 95,
      outcome: 'safe',
      hintsUsed: 0,
    }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(completeSim.status === 200 && completeSim.data.data.stars === 3, 'POST /api/simulations/:id/complete finalizes score & awards XP');

    // 7. Activity Timeline
    console.log('\n--- 7. User Activity Timeline ---');
    const activityRes = await makeRequest(PORT, '/api/activity', 'GET', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(activityRes.status === 200 && activityRes.data.data.length >= 3, `GET /api/activity returns real timeline events (${activityRes.data.data.length} events)`);

    // 8. FlotBot Security Data & Lifecycle
    console.log('\n--- 8. FlotBot Security Operations ---');
    const alertsRes = await makeRequest(PORT, '/api/flotbot/alerts');
    assert(alertsRes.status === 200 && alertsRes.data.data.alerts.length > 0, `GET /api/flotbot/alerts returns ${alertsRes.data.data.alerts.length} security alerts`);
    const firstAlertId = alertsRes.data.data.alerts[0].id;

    const alertDetail = await makeRequest(PORT, `/api/flotbot/alerts/${firstAlertId}`);
    assert(alertDetail.status === 200 && Array.isArray(alertDetail.data.data.history), 'GET /api/flotbot/alerts/:id includes alert history');

    // Acknowledge alert
    const ackRes = await makeRequest(PORT, `/api/flotbot/alerts/${firstAlertId}/acknowledge`, 'POST', {}, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(ackRes.status === 200 && ackRes.data.data.acknowledged === true, 'POST /api/flotbot/alerts/:id/acknowledge updates status');

    // AI explanation
    const explainRes = await makeRequest(PORT, '/api/flotbot/ai/explain', 'POST', { alertId: firstAlertId }, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(explainRes.status === 200 && explainRes.data.data.analysis, 'POST /api/flotbot/ai/explain generates security analysis');

    // User Security Behaviour
    const behaviourRes = await makeRequest(PORT, '/api/flotbot/my-security-behaviour', 'GET', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(behaviourRes.status === 200 && behaviourRes.data.data.metrics.securityPostureScore > 0, 'GET /api/flotbot/my-security-behaviour computes posture from real DB records');

    // 9. IOC Management & Threat Rules (Admin/Analyst)
    console.log('\n--- 9. IOCs & Threat Rules ---');
    const iocList = await makeRequest(PORT, '/api/flotbot/iocs', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(iocList.status === 200 && iocList.data.data.length > 0, 'GET /api/flotbot/iocs returns IOC list');

    const addIoc = await makeRequest(PORT, '/api/flotbot/iocs', 'POST', {
      type: 'domain',
      value: 'evil-phish-domain.com',
      threatName: 'Phishing C2',
      severity: 'HIGH',
      note: 'Found in phishing simulation report',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(addIoc.status === 200 && addIoc.data.data.id, 'POST /api/flotbot/iocs adds new indicator');

    const rulesList = await makeRequest(PORT, '/api/flotbot/rules', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(rulesList.status === 200 && rulesList.data.data.length > 0, 'GET /api/flotbot/rules returns detection rules');

    // 10. Role-Based Access Control on Admin Endpoints
    console.log('\n--- 10. RBAC Authorization Checks ---');
    // Student attempting admin endpoint -> must get 403 Forbidden
    const forbiddenRes = await makeRequest(PORT, '/api/admin/users', 'GET', null, {
      Authorization: `Bearer ${studentToken}`,
    });
    assert(forbiddenRes.status === 403, 'Student accessing /api/admin/users is correctly rejected with 403 FORBIDDEN');

    // Admin accessing admin endpoint -> must get 200 OK
    const adminUsers = await makeRequest(PORT, '/api/admin/users', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(adminUsers.status === 200 && adminUsers.data.data.users.length >= 2, 'Admin accessing /api/admin/users successfully gets user list');

    // Update role (Admin action creates audit log)
    const updateRoleRes = await makeRequest(PORT, `/api/admin/users/${studentUserId}/role`, 'PUT', {
      role: 'SECURITY_ANALYST',
    }, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(updateRoleRes.status === 200 && updateRoleRes.data.data.role === 'SECURITY_ANALYST', 'Admin updates student role to SECURITY_ANALYST');

    // 11. Admin Audit Logs
    console.log('\n--- 11. Admin Audit Logs ---');
    const auditRes = await makeRequest(PORT, '/api/admin/audit-logs', 'GET', null, {
      Authorization: `Bearer ${adminToken}`,
    });
    assert(auditRes.status === 200 && auditRes.data.data.logs.length > 0, `GET /api/admin/audit-logs returns ${auditRes.data.data.logs.length} audit trail records`);

    // 12. Unified Analytics
    console.log('\n--- 12. Unified Analytics ---');
    const overviewRes = await makeRequest(PORT, '/api/analytics/overview');
    assert(overviewRes.status === 200 && overviewRes.data.data.platform.totalUsers >= 2, 'GET /api/analytics/overview returns platform & security metrics');

    console.log(`\n====================================================`);
    console.log(`🏁 Test Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
}

runTests();
