const db = require('./index');
const { TABLES, INDEXES } = require('./schema');
const { DEFAULT_ROLES, DEFAULT_THREAT_RULES, DEFAULT_IOCS, DEFAULT_SETTINGS } = require('./seedData');
const path = require('path');
const fs = require('fs');

async function initDatabase() {
  console.log('[DB Init] Initializing database tables and indexes...');
  await db.connect();

  // 1. Create Tables
  for (const tableSql of TABLES) {
    try {
      await db.query(tableSql);
    } catch (err) {
      console.error('[DB Init] Error creating table:', err.message, '\nSQL:', tableSql);
    }
  }

  // 2. Create Indexes
  for (const indexSql of INDEXES) {
    try {
      await db.query(indexSql);
    } catch (err) {
      // Index might already exist or table syntax variant
    }
  }

  // 3. Seed Default Roles
  for (const role of DEFAULT_ROLES) {
    const existing = await db.query('SELECT id FROM roles WHERE name = $1', [role.name]);
    if (existing.rowCount === 0) {
      await db.query(
        'INSERT INTO roles (id, name, description, permissions) VALUES ($1, $2, $3, $4)',
        [role.id, role.name, role.description, role.permissions]
      );
    }
  }

  // 4. Seed Default Threat Rules
  for (const rule of DEFAULT_THREAT_RULES) {
    const existing = await db.query('SELECT id FROM threat_rules WHERE rule_id = $1', [rule.rule_id]);
    if (existing.rowCount === 0) {
      const id = 'rule-' + Math.random().toString(36).substring(2, 9);
      const now = new Date().toISOString();
      await db.query(
        `INSERT INTO threat_rules (id, rule_id, name, category, severity, description, enabled, config_json, created_at, updated_at, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [id, rule.rule_id, rule.name, rule.category, rule.severity, rule.description, rule.enabled, rule.config_json, now, now, 'system']
      );
    }
  }

  // 5. Seed Default IOCs
  for (const ioc of DEFAULT_IOCS) {
    const existing = await db.query('SELECT id FROM iocs WHERE value = $1', [ioc.value]);
    if (existing.rowCount === 0) {
      const now = new Date().toISOString();
      await db.query(
        `INSERT INTO iocs (id, type, value, threat_name, severity, status, added_by, note, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [ioc.id, ioc.type, ioc.value, ioc.threat_name, ioc.severity, ioc.status, ioc.added_by, ioc.note, now, now]
      );
    }
  }

  // 6. Seed Default Settings
  for (const setting of DEFAULT_SETTINGS) {
    const existing = await db.query('SELECT key FROM settings WHERE key = $1', [setting.key]);
    if (existing.rowCount === 0) {
      await db.query(
        'INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, $3)',
        [setting.key, setting.value, new Date().toISOString()]
      );
    }
  }

  // 7. Seed Initial Courses if empty
  await seedCoursesIfEmpty();

  // 8. Seed Initial Simulations if empty
  await seedSimulationsIfEmpty();

  // 9. Seed Sample Alerts if empty
  await seedInitialAlertsIfEmpty();

  console.log('[DB Init] Database ready with unified schema & initial data.');
}

async function seedCoursesIfEmpty() {
  const countRes = await db.query('SELECT COUNT(*) as count FROM courses');
  const count = parseInt(countRes.rows[0]?.count || countRes.rows[0]?.COUNT || 0, 10);
  if (count > 0) return;

  console.log('[DB Init] Seeding initial courses...');
  try {
    // Dynamically load courses from frontend data files if available
    const coursesDataPath = path.resolve(__dirname, '../../src/data/coursesData.ts');
    let coursesList = [];

    if (fs.existsSync(coursesDataPath)) {
      const content = fs.readFileSync(coursesDataPath, 'utf8');
      const jsonMatch = content.match(/export\s+const\s+COURSES_DEFAULT:\s*Course\[\]\s*=\s*(\[[\s\S]*?\]);/);
      if (jsonMatch) {
        try {
          coursesList = JSON.parse(jsonMatch[1]);
        } catch (e) {
          // Fallback minimal courses if parse regex fails
        }
      }
    }

    if (!coursesList || coursesList.length === 0) {
      // Fallback base course
      coursesList = [
        {
          id: 'phish-fund',
          title: 'Phishing Fundamentals',
          cat: 'Phishing',
          icon: 'mail',
          color1: '#3B82F6',
          color2: '#06B6D4',
          level: 'Beginner',
          desc: 'Learn to spot the red flags in fake emails, texts, and links before they cost you.',
          objectives: ['Identify common phishing tactics', 'Spot lookalike domains', 'Report phishing incidents'],
          modules: [
            {
              title: 'Introduction & Detection',
              lessons: [
                {
                  id: 'les-phish-1',
                  title: 'What is phishing?',
                  type: 'reading',
                  dur: '6 min',
                  body: 'Phishing is a social engineering attack where bad actors impersonate trusted entities.',
                  points: ['Verify email headers', 'Recognize artificial urgency'],
                },
              ],
            },
          ],
          quiz: [
            {
              q: 'What is the primary technical check to verify if an email sender address is spoofed?',
              options: ['Check display name', 'Inspect Return-Path and SPF/DKIM headers', 'Check attachments', 'Read signature'],
              answer: 1,
              explanation: 'SPF/DKIM headers confirm the genuine originating server.',
            },
          ],
        },
      ];
    }

    const now = new Date().toISOString();

    for (const course of coursesList) {
      await db.query(
        `INSERT INTO courses (id, title, cat, icon, color1, color2, level, desc_text, duration, provider, objectives, skills_gained, prerequisites, banner_image, intro_video, credential_eligible, credential_name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          course.id,
          course.title,
          course.cat,
          course.icon || 'shield',
          course.color1 || '#7C3AED',
          course.color2 || '#38BDF8',
          course.level || 'Beginner',
          course.desc || '',
          course.duration || '4-6 hours',
          course.provider || 'CyberGuardian Institute',
          JSON.stringify(course.objectives || []),
          JSON.stringify(course.skillsGained || []),
          JSON.stringify(course.prerequisites || []),
          course.bannerImage || null,
          course.introVideo || null,
          course.credentialEligible !== false ? 1 : 0,
          course.credentialName || `${course.title} Specialist Certification`,
          now,
          now,
        ]
      );

      // Insert Modules and Lessons
      if (Array.isArray(course.modules)) {
        for (let mi = 0; mi < course.modules.length; mi++) {
          const mod = course.modules[mi];
          const moduleId = `${course.id}-mod-${mi + 1}`;
          await db.query(
            `INSERT INTO course_modules (id, course_id, module_order, title, desc_text, duration, objectives)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              moduleId,
              course.id,
              mi,
              mod.title,
              mod.desc || '',
              mod.duration || '',
              JSON.stringify(mod.objectives || []),
            ]
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
                  course.id,
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

      // Insert Course Quizzes
      if (Array.isArray(course.quiz)) {
        for (let qi = 0; qi < course.quiz.length; qi++) {
          const q = course.quiz[qi];
          const quizId = `${course.id}-quiz-${qi + 1}`;
          await db.query(
            `INSERT INTO course_quizzes (id, course_id, question, options, answer, explanation, question_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              quizId,
              course.id,
              q.q || q.question || '',
              JSON.stringify(q.options || []),
              typeof q.answer === 'number' ? q.answer : 0,
              q.explanation || '',
              qi,
            ]
          );
        }
      }
    }
    console.log(`[DB Init] Seeded ${coursesList.length} courses with modules and quizzes.`);
  } catch (err) {
    console.error('[DB Init] Error seeding courses:', err.message);
  }
}

async function seedSimulationsIfEmpty() {
  const countRes = await db.query('SELECT COUNT(*) as count FROM simulations');
  const count = parseInt(countRes.rows[0]?.count || countRes.rows[0]?.COUNT || 0, 10);
  if (count > 0) return;

  console.log('[DB Init] Seeding initial simulation scenarios...');
  const defaultSims = [
    {
      id: 'SE-001',
      numeric_id: 1,
      title: 'Urgent Password Reset',
      category: 'Phishing',
      difficulty: 'Beginner',
      duration: 10,
      environment: 'email',
      xp: 150,
      icon: 'mail',
      goal: 'Learn to identify phishing emails, suspicious URLs, and credential harvesting attacks.',
      summary: 'Phishing is the #1 entry point for cyber attacks. Practice identifying sender spoofing, urgency manipulation, and credential harvesting.',
      brand: 'Northstar Systems',
      learning_objectives: ['Inspect sender addresses carefully', 'Identify homoglyph/typosquatting attacks', 'Report phishing to security operations'],
      hints: [
        { level: 1, text: 'Look carefully at the sender email address', scorePenalty: 5 },
        { level: 2, text: 'Compare the sender domain with the official domain', scorePenalty: 10 },
      ],
    },
    {
      id: 'SE-002',
      numeric_id: 2,
      title: 'Fake IT Helpdesk Phone Scam',
      category: 'Vishing',
      difficulty: 'Beginner',
      duration: 12,
      environment: 'phone',
      xp: 175,
      icon: 'phone',
      goal: 'Defend against voice phishing (vishing) impersonating internal IT support.',
      summary: 'Attackers use urgent telephone calls requesting AnyDesk remote access or password changes.',
      brand: 'Global Enterprise IT',
      learning_objectives: ['Demand employee verification badge numbers', 'Never grant remote desktop control to unsolicited callers'],
      hints: [
        { level: 1, text: 'IT support will never call asking for your cleartext password', scorePenalty: 5 },
      ],
    },
    {
      id: 'SE-003',
      numeric_id: 3,
      title: 'Malicious QR Code (Quishing)',
      category: 'Quishing',
      difficulty: 'Intermediate',
      duration: 15,
      environment: 'qr',
      xp: 200,
      icon: 'qr',
      goal: 'Detect and inspect malicious QR codes in cafeteria parking and corporate notices.',
      summary: 'Quishing disguises malicious URLs inside QR codes to bypass standard email URL security gateways.',
      brand: 'SmartPark Enterprise',
      learning_objectives: ['Inspect destination URL before opening QR codes', 'Avoid scanning unverified public stickers'],
      hints: [
        { level: 1, text: 'Check the real domain preview before proceeding in browser', scorePenalty: 5 },
      ],
    },
    {
      id: 'SE-004',
      numeric_id: 4,
      title: 'MFA Push Fatigue & Session Hijacking',
      category: 'MFA Fatigue',
      difficulty: 'Advanced',
      duration: 20,
      environment: 'mfa',
      xp: 250,
      icon: 'lock',
      goal: 'Recognize MFA prompt flooding and prevent unauthorized token approvals.',
      summary: 'Adversaries spam authentication prompts at late night hours hoping tired users tap Approve.',
      brand: 'Azure AD / Entra ID',
      learning_objectives: ['Reject unprompted MFA requests', 'Change credentials immediately upon prompt spamming'],
      hints: [
        { level: 1, text: 'If you did not initiate the login, tap Deny & Report immediately', scorePenalty: 5 },
      ],
    },
  ];

  const now = new Date().toISOString();
  for (const sim of defaultSims) {
    await db.query(
      `INSERT INTO simulations (id, numeric_id, title, category, difficulty, duration, environment, xp, icon, goal, summary, brand, learning_objectives, hints, learning_cards, debrief, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        sim.id,
        sim.numeric_id,
        sim.title,
        sim.category,
        sim.difficulty,
        sim.duration,
        sim.environment,
        sim.xp,
        sim.icon,
        sim.goal,
        sim.summary,
        sim.brand,
        JSON.stringify(sim.learning_objectives || []),
        JSON.stringify(sim.hints || []),
        JSON.stringify([]),
        JSON.stringify({}),
        now,
      ]
    );
  }
  console.log(`[DB Init] Seeded ${defaultSims.length} simulation scenarios.`);
}

async function seedInitialAlertsIfEmpty() {
  const countRes = await db.query('SELECT COUNT(*) as count FROM alerts');
  const count = parseInt(countRes.rows[0]?.count || countRes.rows[0]?.COUNT || 0, 10);
  if (count > 0) return;

  const now = new Date().toISOString();
  const sampleAlerts = [
    {
      id: 'alert-sec-101',
      title: 'Suspicious PowerShell Encoded Command',
      severity: 'HIGH',
      category: 'Execution',
      source: 'System Watcher',
      description: 'PowerShell was executed with -EncodedCommand containing base64 dropper string.',
      recommendation: 'Inspect parent process and terminate process tree.',
      evidence: JSON.stringify({ pid: 4892, parent: 'winword.exe', cmdline: 'powershell.exe -w hidden -enc JABz...=' }),
      status: 'NEW',
    },
    {
      id: 'alert-sec-102',
      title: 'Outbound Connection to Known Malicious IP',
      severity: 'CRITICAL',
      category: 'Network',
      source: 'Network Watcher',
      description: 'Process established TCP connection to blacklisted C2 IP 185.220.101.5:4444.',
      recommendation: 'Block IP in firewall and isolate network interface.',
      evidence: JSON.stringify({ pid: 5120, process: 'svchost_updater.exe', remote_ip: '185.220.101.5', port: 4444 }),
      status: 'NEW',
    },
    {
      id: 'alert-sec-103',
      title: 'Persistence Run Key Created in User Registry',
      severity: 'MEDIUM',
      category: 'Persistence',
      source: 'Registry Watcher',
      description: 'New startup value added to HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run pointing to %APPDATA%\\updater.exe.',
      recommendation: 'Verify binary digital signature and remove startup entry.',
      evidence: JSON.stringify({ key: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', valueName: 'AppAutoUpdater', target: '%APPDATA%\\updater.exe' }),
      status: 'ACKNOWLEDGED',
      acknowledged: 1,
      acknowledged_at: now,
    },
  ];

  for (const alt of sampleAlerts) {
    await db.query(
      `INSERT INTO alerts (id, user_id, timestamp, title, severity, category, source, description, recommendation, evidence, status, acknowledged, acknowledged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        alt.id,
        null,
        now,
        alt.title,
        alt.severity,
        alt.category,
        alt.source,
        alt.description,
        alt.recommendation,
        alt.evidence,
        alt.status,
        alt.acknowledged || 0,
        alt.acknowledged_at || null,
      ]
    );

    // Also record lifecycle event
    await db.query(
      `INSERT INTO alert_events (id, alert_id, event_type, timestamp, metadata_json)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'evt-' + Math.random().toString(36).substring(2, 9),
        alt.id,
        'detected',
        now,
        JSON.stringify({ source: alt.source, severity: alt.severity }),
      ]
    );
  }
}

module.exports = {
  initDatabase,
};
