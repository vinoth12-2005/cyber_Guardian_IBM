/**
 * Automated RBAC Role Privilege Verification Script
 * Validates role-based access rules and privilege enforcement across all administrative roles.
 */

const { requireRole, requireAnyAdmin, ROLE_PERMISSIONS } = require('./middleware/rbac');

// Helper to simulate express middleware execution
function testMiddleware(middleware, userRole) {
  return new Promise((resolve) => {
    const req = {
      user: userRole ? { id: 'usr_test', email: 'test@cyberguardian.local', role: userRole } : null,
    };
    let statusCode = 200;
    let errorResponse = null;

    const res = {
      status(code) {
        statusCode = code;
        return {
          json(data) {
            errorResponse = data;
            resolve({ passed: false, statusCode, errorResponse });
          },
        };
      },
    };

    const next = () => {
      resolve({ passed: true, statusCode: 200, errorResponse: null });
    };

    middleware(req, res, next);
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('  🛡️ CYBERGUARDIAN ROLE-BASED ACCESS CONTROL (RBAC) VERIFICATION');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  async function assertAccess(role, middleware, shouldAllow, testName) {
    totalTests++;
    const result = await testMiddleware(middleware, role);
    const success = (result.passed === shouldAllow);

    if (success) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} -> Role: ${role || 'UNAUTHENTICATED'} | Expected: ${shouldAllow ? 'ALLOW' : 'DENY'} | Got: ${result.passed ? 'ALLOW' : 'DENY'}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} -> Role: ${role || 'UNAUTHENTICATED'} | Expected: ${shouldAllow ? 'ALLOW' : 'DENY'} | Got: ${result.passed ? 'ALLOW' : 'DENY'}`);
    }
  }

  // 1. Authentication Check
  console.log('--- 1. Authentication Enforcement ---');
  await assertAccess(null, requireAnyAdmin, false, 'Unauthenticated access to admin portal');
  await assertAccess(null, requireRole('SUPER_ADMIN'), false, 'Unauthenticated access to Super Admin');

  // 2. Student & Employee Lockdown
  console.log('\n--- 2. Learner & Employee Lockdown (Should NOT have admin access) ---');
  await assertAccess('STUDENT', requireAnyAdmin, false, 'Student attempting any admin action');
  await assertAccess('EMPLOYEE', requireAnyAdmin, false, 'Employee attempting any admin action');
  await assertAccess('STUDENT', requireRole('COURSE_ADMIN'), false, 'Student attempting course authoring');
  await assertAccess('EMPLOYEE', requireRole('USER_ADMIN'), false, 'Employee attempting user management');

  // 3. SUPER_ADMIN (Root Access)
  console.log('\n--- 3. SUPER_ADMIN (Full Root Access) ---');
  await assertAccess('SUPER_ADMIN', requireAnyAdmin, true, 'Super Admin access to admin portal');
  await assertAccess('SUPER_ADMIN', requireRole('USER_ADMIN'), true, 'Super Admin access to User Management');
  await assertAccess('SUPER_ADMIN', requireRole('COURSE_ADMIN'), true, 'Super Admin access to Course Studio');
  await assertAccess('SUPER_ADMIN', requireRole('SIMULATION_ADMIN'), true, 'Super Admin access to Simulations');
  await assertAccess('SUPER_ADMIN', requireRole('CERTIFICATION_ADMIN'), true, 'Super Admin access to Certifications');
  await assertAccess('SUPER_ADMIN', requireRole('FLOTBOT_SECURITY_ADMIN'), true, 'Super Admin access to EDR Rules');
  await assertAccess('SUPER_ADMIN', requireRole('SECURITY_ANALYST'), true, 'Super Admin access to Analyst triage');

  // 4. PLATFORM_ADMIN
  console.log('\n--- 4. PLATFORM_ADMIN (Operational Oversight) ---');
  const userAdminMdw = requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'USER_ADMIN');
  const courseAdminMdw = requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'COURSE_ADMIN');
  const simAdminMdw = requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'SIMULATION_ADMIN');
  const certAdminMdw = requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'CERTIFICATION_ADMIN');
  const edrRulesMdw = requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN');

  await assertAccess('PLATFORM_ADMIN', requireAnyAdmin, true, 'Platform Admin entry');
  await assertAccess('PLATFORM_ADMIN', userAdminMdw, true, 'Platform Admin user management');
  await assertAccess('PLATFORM_ADMIN', courseAdminMdw, true, 'Platform Admin course management');
  await assertAccess('PLATFORM_ADMIN', simAdminMdw, true, 'Platform Admin simulation management');
  await assertAccess('PLATFORM_ADMIN', certAdminMdw, true, 'Platform Admin certification management');
  await assertAccess('PLATFORM_ADMIN', edrRulesMdw, false, 'Platform Admin threat rules modification');

  // 5. USER_ADMIN
  console.log('\n--- 5. USER_ADMIN (User Directory Governance) ---');
  await assertAccess('USER_ADMIN', userAdminMdw, true, 'User Admin managing users');
  await assertAccess('USER_ADMIN', courseAdminMdw, false, 'User Admin attempting course authoring');
  await assertAccess('USER_ADMIN', simAdminMdw, false, 'User Admin attempting simulation editing');
  await assertAccess('USER_ADMIN', certAdminMdw, false, 'User Admin attempting cert revocation');
  await assertAccess('USER_ADMIN', edrRulesMdw, false, 'User Admin attempting threat rules edit');

  // 6. COURSE_ADMIN
  console.log('\n--- 6. COURSE_ADMIN (Curriculum & Proctored Quizzes) ---');
  await assertAccess('COURSE_ADMIN', courseAdminMdw, true, 'Course Admin authoring courses');
  await assertAccess('COURSE_ADMIN', userAdminMdw, false, 'Course Admin attempting user moderation');
  await assertAccess('COURSE_ADMIN', simAdminMdw, false, 'Course Admin attempting simulation editing');
  await assertAccess('COURSE_ADMIN', certAdminMdw, false, 'Course Admin attempting cert revocation');
  await assertAccess('COURSE_ADMIN', edrRulesMdw, false, 'Course Admin attempting threat rules edit');

  // 7. SIMULATION_ADMIN
  console.log('\n--- 7. SIMULATION_ADMIN (Cyber Range Scenarios) ---');
  await assertAccess('SIMULATION_ADMIN', simAdminMdw, true, 'Simulation Admin editing cyber labs');
  await assertAccess('SIMULATION_ADMIN', userAdminMdw, false, 'Simulation Admin managing users');
  await assertAccess('SIMULATION_ADMIN', courseAdminMdw, false, 'Simulation Admin authoring courses');
  await assertAccess('SIMULATION_ADMIN', certAdminMdw, false, 'Simulation Admin revoking certificates');

  // 8. CERTIFICATION_ADMIN
  console.log('\n--- 8. CERTIFICATION_ADMIN (Credential Authority) ---');
  await assertAccess('CERTIFICATION_ADMIN', certAdminMdw, true, 'Cert Admin revoking certificate');
  await assertAccess('CERTIFICATION_ADMIN', userAdminMdw, false, 'Cert Admin managing users');
  await assertAccess('CERTIFICATION_ADMIN', courseAdminMdw, false, 'Cert Admin authoring courses');
  await assertAccess('CERTIFICATION_ADMIN', simAdminMdw, false, 'Cert Admin managing simulations');

  // 9. FLOTBOT_SECURITY_ADMIN
  console.log('\n--- 9. FLOTBOT_SECURITY_ADMIN (EDR Rules & IOCs) ---');
  const iocMdw = requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST');
  await assertAccess('FLOTBOT_SECURITY_ADMIN', edrRulesMdw, true, 'FlotBot Admin configuring threat rules');
  await assertAccess('FLOTBOT_SECURITY_ADMIN', iocMdw, true, 'FlotBot Admin managing IOC indicators');
  await assertAccess('FLOTBOT_SECURITY_ADMIN', userAdminMdw, false, 'FlotBot Admin managing users');
  await assertAccess('FLOTBOT_SECURITY_ADMIN', courseAdminMdw, false, 'FlotBot Admin managing courses');

  // 10. SECURITY_ANALYST
  console.log('\n--- 10. SECURITY_ANALYST (SOC Triage & Alert Investigation) ---');
  const alertResolveMdw = requireRole('SUPER_ADMIN', 'FLOTBOT_SECURITY_ADMIN', 'SECURITY_ANALYST');
  await assertAccess('SECURITY_ANALYST', alertResolveMdw, true, 'Security Analyst investigating/resolving alerts');
  await assertAccess('SECURITY_ANALYST', iocMdw, true, 'Security Analyst querying IOCs');
  await assertAccess('SECURITY_ANALYST', edrRulesMdw, false, 'Security Analyst reconfiguring threat rules');
  await assertAccess('SECURITY_ANALYST', userAdminMdw, false, 'Security Analyst managing users');

  // 11. ANALYST
  console.log('\n--- 11. ANALYST (Business & Training Intelligence) ---');
  const analyticsMdw = requireRole('SUPER_ADMIN', 'PLATFORM_ADMIN', 'ANALYST');
  await assertAccess('ANALYST', requireAnyAdmin, true, 'Analyst portal access');
  await assertAccess('ANALYST', analyticsMdw, true, 'Analyst viewing learning analytics');
  await assertAccess('ANALYST', userAdminMdw, false, 'Analyst modifying user directory');
  await assertAccess('ANALYST', courseAdminMdw, false, 'Analyst modifying courses');
  await assertAccess('ANALYST', edrRulesMdw, false, 'Analyst modifying threat rules');

  console.log('\n================================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL ADMIN ROLES AND PRIVILEGES STRICTLY VERIFIED AND SECURE!\n');
    process.exit(0);
  } else {
    console.error('\n⚠️ RBAC PRIVILEGE VIOLATIONS DETECTED!\n');
    process.exit(1);
  }
}

runTests().catch(console.error);
