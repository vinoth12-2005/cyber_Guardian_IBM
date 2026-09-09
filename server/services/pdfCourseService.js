const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const config = require('../config/config');

class PdfCourseService {
  /**
   * Extract text, metadata, and embedded images from a PDF buffer
   */
  async extractTextAndImages(pdfBuffer, originalFilename = 'course_document.pdf') {
    // 1. Extract raw text and metadata via pdf-parse with fallback
    let rawText = '';
    let numPages = 1;
    let info = {};

    try {
      const pdfData = await pdfParse(pdfBuffer);
      rawText = (pdfData.text || '').replace(/\r\n/g, '\n').trim();
      numPages = pdfData.numpages || 1;
      info = pdfData.info || {};
    } catch (parseErr) {
      console.warn('[PdfCourseService] pdf-parse warning, attempting raw stream text recovery:', parseErr.message);
      const bufferStr = pdfBuffer.toString('utf-8');
      const matches = bufferStr.match(/[A-Za-z0-9\s.,!?:;'"()\/-]{5,}/g);
      if (matches && matches.length > 0) {
        rawText = matches.join(' ').replace(/\s+/g, ' ').trim();
      }
    }

    // 2. Extract embedded JPEG images from PDF byte stream
    const extractedImages = [];
    const uploadDir = path.join(__dirname, '../../public/uploads/courses');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    try {
      let start = 0;
      let imgCount = 0;
      const baseTimestamp = Date.now();

      // Scan buffer for JPEG Start of Image (0xFF, 0xD8, 0xFF) and End of Image (0xFF, 0xD9)
      while ((start = pdfBuffer.indexOf(Buffer.from([0xff, 0xd8, 0xff]), start)) !== -1 && imgCount < 12) {
        const end = pdfBuffer.indexOf(Buffer.from([0xff, 0xd9]), start + 2);
        if (end !== -1) {
          const imageSize = end + 2 - start;
          // Filter out tiny thumbnails (< 2KB)
          if (imageSize > 2048) {
            const imgBuffer = pdfBuffer.slice(start, end + 2);
            const imgFileName = `extracted_${baseTimestamp}_${imgCount + 1}.jpg`;
            const imgPath = path.join(uploadDir, imgFileName);
            fs.writeFileSync(imgPath, imgBuffer);

            extractedImages.push({
              url: `/uploads/courses/${imgFileName}`,
              name: imgFileName,
              sizeBytes: imageSize,
              index: imgCount + 1,
            });
            imgCount++;
          }
          start = end + 2;
        } else {
          start += 2;
        }
      }
    } catch (imgErr) {
      console.warn('[PdfCourseService] Notice during image stream extraction:', imgErr.message);
    }

    return {
      rawText,
      numPages,
      info,
      extractedImages,
      sourceFilename: originalFilename,
    };
  }

  /**
   * Extract all multiple-choice assessment questions from the document text
   */
  extractQuestionsFromText(rawText) {
    const questions = [];
    const parts = rawText.split(/(?=(?:Question\s+\d+[:.]|Q\d+[:.]))/i);

    for (const part of parts) {
      if (!part.match(/^(?:Question\s+\d+|Q\d+)/i)) continue;

      const qMatch = part.match(/^(?:Question\s+\d+[:.]?|Q\d+[:.]?)\s*([\s\S]*?)(?=(?:[A-D][.)]|\n[A-D][.)]))/i);
      const questionText = qMatch ? qMatch[1].replace(/\s+/g, ' ').trim() : '';

      const optA = part.match(/[A][.)]\s*([\s\S]*?)(?=(?:[B-D][.)]|\n[B-D][.)]|Correct Answer:|Answer:|$))/i);
      const optB = part.match(/[B][.)]\s*([\s\S]*?)(?=(?:[C-D][.)]|\n[C-D][.)]|Correct Answer:|Answer:|$))/i);
      const optC = part.match(/[C][.)]\s*([\s\S]*?)(?=(?:[D][.)]|\n[D][.)]|Correct Answer:|Answer:|$))/i);
      const optD = part.match(/[D][.)]\s*([\s\S]*?)(?=(?:Correct Answer:|Answer:|$))/i);

      const options = [
        optA ? optA[1].replace(/\s+/g, ' ').trim() : '',
        optB ? optB[1].replace(/\s+/g, ' ').trim() : '',
        optC ? optC[1].replace(/\s+/g, ' ').trim() : '',
        optD ? optD[1].replace(/\s+/g, ' ').trim() : '',
      ].filter(Boolean);

      let answer = 0;
      let explanation = '';
      const ansMatch = part.match(
        /(?:Correct Answer|Answer)\s*:\s*([A-D])(?:\s*[-—–:]\s*([\s\S]*?))?(?=(?:Question\s+\d+|Q\d+|$|\n\n[A-Z]|Standardization|Verified|Generated Date))/i
      );
      if (ansMatch) {
        const letter = ansMatch[1].toUpperCase();
        answer = letter === 'A' ? 0 : letter === 'B' ? 1 : letter === 'C' ? 2 : 3;
        explanation = ansMatch[2] ? ansMatch[2].replace(/\s+/g, ' ').trim() : '';
      }

      if (questionText && options.length >= 2) {
        questions.push({
          q: questionText,
          question: questionText,
          options,
          answer,
          explanation,
        });
      }
    }
    return questions;
  }

  /**
   * Generate structured course blueprint from PDF
   */
  async generateCourseFromPdf(pdfBuffer, originalFilename = 'document.pdf', customInstructions = '') {
    const extraction = await this.extractTextAndImages(pdfBuffer, originalFilename);
    const { rawText, numPages, extractedImages } = extraction;

    if (!rawText || rawText.length < 50) {
      throw new Error('The uploaded PDF does not contain sufficient readable text.');
    }

    // Truncate text for AI prompt (first 14,000 characters)
    const textSnippet = rawText.slice(0, 14000);

    // Try AI Generation with local Ollama
    let courseBlueprint = null;
    try {
      courseBlueprint = await this._generateWithAI(textSnippet, extractedImages, originalFilename, customInstructions);
    } catch (err) {
      console.warn('[PdfCourseService] AI model generation fallback triggered:', err.message);
    }

    // If AI fails or returns invalid format, use rule-based intelligent synthesis
    if (!courseBlueprint || !courseBlueprint.title || !Array.isArray(courseBlueprint.modules) || courseBlueprint.modules.length === 0) {
      courseBlueprint = this._synthesizeCurriculumFallback(rawText, extractedImages, originalFilename);
    } else {
      // Enrich AI generated blueprint with extracted questions and per-lesson knowledgeCheck
      courseBlueprint = this._enrichBlueprint(courseBlueprint, rawText, extractedImages, originalFilename);
    }

    // Attach extracted images if any weren't assigned
    if (extractedImages.length > 0 && (!courseBlueprint.bannerImage || courseBlueprint.bannerImage === '')) {
      courseBlueprint.bannerImage = extractedImages[0].url;
    }

    return {
      courseBlueprint,
      extractedImages,
      sourceDocName: originalFilename,
      stats: {
        pageCount: numPages,
        charCount: rawText.length,
        imagesFound: extractedImages.length,
      },
    };
  }

  /**
   * Prompt Ollama to generate strict JSON course blueprint
   */
  async _generateWithAI(textSnippet, images, originalFilename, customInstructions) {
    const ollamaHost = config.ai.ollamaHost;
    const model = config.ai.ollamaModel;

    const availableImagesStr = images.map((img, i) => `Image ${i + 1}: ${img.url}`).join('\n') || 'None';

    const systemPrompt =
      `You are an elite Cybersecurity Course Architect. Your task is to analyze the provided document text and convert it into a complete, comprehensive, highly professional training course in strict JSON format.\n\n` +
      `Extracted images available to attach to lessons:\n${availableImagesStr}\n\n` +
      `Requirements:\n` +
      `1. Each reading lesson MUST contain an interactive "knowledgeCheck" array with at least 1 scenario question testing that topic.\n` +
      `2. Extract all quiz/exam questions present in the document into the "quiz" array.\n` +
      `3. Include a final assessment lesson ("type": "quiz") at the end of the course.\n` +
      `4. Set credentialEligible to true and assign a credentialName.\n\n` +
      `Follow this JSON schema strictly without extra markdown formatting:\n` +
      `{\n` +
      `  "title": "Course Title",\n` +
      `  "cat": "Category (Phishing | Passwords | Malware | Network | Cloud | Application Security | Social Engineering | Incident Response | Compliance & Governance | Identity & Access)",\n` +
      `  "level": "Beginner | Intermediate | Advanced",\n` +
      `  "duration": "4-6 hours",\n` +
      `  "desc": "2-3 sentence overview",\n` +
      `  "credentialEligible": true,\n` +
      `  "credentialName": "Course Title Specialist Certification",\n` +
      `  "objectives": ["objective 1", "objective 2", "objective 3"],\n` +
      `  "skillsGained": ["skill 1", "skill 2", "skill 3"],\n` +
      `  "prerequisites": ["prerequisite 1"],\n` +
      `  "modules": [\n` +
      `    {\n` +
      `      "title": "Module Title",\n` +
      `      "desc": "Module summary",\n` +
      `      "duration": "1.5 hours",\n` +
      `      "objectives": ["mod objective"],\n` +
      `      "lessons": [\n` +
      `        {\n` +
      `          "title": "Lesson Title",\n` +
      `          "type": "reading",\n` +
      `          "dur": "8 min",\n` +
      `          "body": "Detailed technical lesson text in Markdown format...",\n` +
      `          "image": "${images[0]?.url || ''}",\n` +
      `          "videoUrl": null,\n` +
      `          "example": "code or payload example",\n` +
      `          "realTimeExample": "Real-world incident scenario",\n` +
      `          "points": ["Key takeaway 1", "Key takeaway 2"],\n` +
      `          "flipCard": {\n` +
      `            "front": { "title": "Inspect Indicator", "scenario": "Front scenario prompt", "indicator": "Warning indicator" },\n` +
      `            "back": { "title": "Forensic Breakdown", "analysis": "Technical analysis", "mitigation": "Defense step" }\n` +
      `          },\n` +
      `          "knowledgeCheck": [\n` +
      `            {\n` +
      `              "q": "Interactive question on this lesson topic?",\n` +
      `              "options": ["Option A", "Option B", "Option C", "Option D"],\n` +
      `              "answer": 0,\n` +
      `              "explanation": "Explanation of correct answer."\n` +
      `            }\n` +
      `          ]\n` +
      `        }\n` +
      `      ]\n` +
      `    }\n` +
      `  ],\n` +
      `  "quiz": [\n` +
      `    {\n` +
      `      "q": "Scenario assessment question from document?",\n` +
      `      "options": ["Option A", "Option B", "Option C", "Option D"],\n` +
      `      "answer": 1,\n` +
      `      "explanation": "Detailed explanation of correct answer."\n` +
      `    }\n` +
      `  ]\n` +
      `}`;

    const userPrompt = `Document: ${originalFilename}\nInstructions: ${customInstructions || 'Create an in-depth, structured cybersecurity course with 3-4 modules, rich lessons with examples, interactive flip cards, per-topic knowledge checks, and extract all assessment questions.'}\n\nDocument Text:\n${textSnippet}`;

    const resp = await axios.post(
      `${ollamaHost}/api/generate`,
      {
        model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        format: 'json',
        stream: false,
      },
      { timeout: 35000 }
    );

    if (resp.data && resp.data.response) {
      const parsed = JSON.parse(resp.data.response);
      return parsed;
    }
    return null;
  }

  /**
   * Enrich blueprint (ensures knowledgeCheck on every lesson, merges PDF questions, attaches quiz lesson)
   */
  _enrichBlueprint(blueprint, rawText, extractedImages, originalFilename) {
    const courseTitle = blueprint.title || 'Cybersecurity Advanced Training';
    blueprint.credentialEligible = true;
    if (!blueprint.credentialName || blueprint.credentialName.includes('Course Title')) {
      blueprint.credentialName = `${courseTitle} Specialist Certification`;
    }

    // 1. Merge any extracted questions from PDF that AI missed and sanitize placeholders
    const pdfQuestions = this.extractQuestionsFromText(rawText);
    const existingQuiz = Array.isArray(blueprint.quiz) ? blueprint.quiz : [];
    
    const isPlaceholderQuestion = (item) => {
      const qText = (item.q || item.question || '').toLowerCase();
      const opts = (item.options || []).map((o) => (o || '').toLowerCase());
      return (
        !qText ||
        qText.includes('scenario assessment question') ||
        qText.includes('interactive question on this lesson') ||
        opts.length < 2 ||
        opts.some((o) => o === 'option a' || o === 'option b' || o === 'option 1')
      );
    };

    const normalizedQuiz = existingQuiz
      .filter((q) => !isPlaceholderQuestion(q))
      .map((q) => ({
        q: q.q || q.question || '',
        question: q.q || q.question || '',
        options: q.options || [],
        answer: q.answer ?? 0,
        explanation: q.explanation || '',
      }));

    for (const pq of pdfQuestions) {
      if (!normalizedQuiz.some((eq) => eq.q.slice(0, 30) === pq.q.slice(0, 30))) {
        normalizedQuiz.unshift(pq);
      }
    }

    const standardQuestions = [
      {
        q: `According to the training material in "${courseTitle}", what is the primary defensive priority upon detecting an active threat indicator?`,
        question: `According to the training material in "${courseTitle}", what is the primary defensive priority upon detecting an active threat indicator?`,
        options: [
          'Delete all affected systems immediately without taking backups',
          'Isolate the compromised asset, preserve forensic evidence, and assess scope',
          'Ignore the alert if it has not repeated more than 10 times',
          'Restart the host computer to clear volatile memory',
        ],
        answer: 1,
        explanation: 'Isolating the asset prevents lateral spread while preserving critical memory and disk forensic evidence for root-cause analysis.',
      },
      {
        q: 'Which authentication mechanism provides mathematical cryptographic protection against Adversary-in-the-Middle (AiTM) reverse proxy interception?',
        question: 'Which authentication mechanism provides mathematical cryptographic protection against Adversary-in-the-Middle (AiTM) reverse proxy interception?',
        options: [
          'SMS OTP text verification codes',
          'FIDO2 / WebAuthn hardware security keys with domain-bound origin validation',
          'Voice telephone automated callbacks',
          'Simple 6-character passwords changed monthly',
        ],
        answer: 1,
        explanation: 'FIDO2 / WebAuthn binds the cryptographic assertion directly to the browser origin, neutralizing proxy interception.',
      },
    ];

    for (const sq of standardQuestions) {
      if (normalizedQuiz.length >= 5) break;
      if (!normalizedQuiz.some((fq) => fq.q.slice(0, 30) === sq.q.slice(0, 30))) {
        normalizedQuiz.push(sq);
      }
    }
    blueprint.quiz = normalizedQuiz;

    // 2. Check if AI truncated modules compared to fallback multi-module analysis
    const fallbackBp = this._synthesizeCurriculumFallback(rawText, extractedImages, originalFilename);
    if (
      (!Array.isArray(blueprint.modules) || blueprint.modules.length < 2) &&
      Array.isArray(fallbackBp.modules) &&
      fallbackBp.modules.length >= 2
    ) {
      blueprint.modules = fallbackBp.modules;
    }

    // 3. Ensure each lesson has knowledgeCheck with non-placeholder questions
    if (Array.isArray(blueprint.modules)) {
      for (const mod of blueprint.modules) {
        if (Array.isArray(mod.lessons)) {
          for (const les of mod.lessons) {
            if (les.type === 'reading') {
              const hasValidKc =
                Array.isArray(les.knowledgeCheck) &&
                les.knowledgeCheck.length > 0 &&
                !les.knowledgeCheck.some(isPlaceholderQuestion);

              if (!hasValidKc) {
                les.knowledgeCheck = this._buildTopicKnowledgeCheck(les.title, les.body || '', les.points || []);
              } else {
                les.knowledgeCheck = les.knowledgeCheck.map((kc) => ({
                  q: kc.q || kc.question || '',
                  question: kc.q || kc.question || '',
                  options: kc.options || [],
                  answer: kc.answer ?? 0,
                  explanation: kc.explanation || '',
                }));
              }
            }
          }
        }
      }

      // Ensure last module has the quiz lesson
      const lastMod = blueprint.modules[blueprint.modules.length - 1];
      if (lastMod && Array.isArray(lastMod.lessons)) {
        const hasQuizLesson = lastMod.lessons.some((l) => l.type === 'quiz');
        if (!hasQuizLesson) {
          lastMod.lessons.push({
            title: `Quiz: ${courseTitle} Assessment`,
            type: 'quiz',
            dur: '10 min',
            body: `Test your comprehension and earn your verified certificate in ${courseTitle}. Complete all preceding lessons to unlock this final proctored assessment.`,
            points: [],
          });
        }
      }
    }

    return blueprint;
  }

  /**
   * High-quality deterministic synthesis when offline or AI returns non-json
   */
  _synthesizeCurriculumFallback(rawText, extractedImages, originalFilename) {
    const lines = rawText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Extract potential title
    let courseTitle = lines[0] || 'Cybersecurity Advanced Training';
    if (courseTitle.length > 80 || courseTitle.toLowerCase().includes('page')) {
      courseTitle = originalFilename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      courseTitle = courseTitle.charAt(0).toUpperCase() + courseTitle.slice(1);
    }
    if (lines.length > 1 && lines[0].length < 40 && !lines[1].toLowerCase().startsWith('module') && !lines[1].toLowerCase().startsWith('page')) {
      courseTitle = lines[0] + ' - ' + lines[1];
    }

    // Detect category
    const lowerText = rawText.toLowerCase();
    let cat = 'Incident Response';
    if (lowerText.includes('zero-trust') || lowerText.includes('zero trust') || lowerText.includes('identity') || lowerText.includes('mfa')) cat = 'Identity & Access';
    else if (lowerText.includes('phish') || lowerText.includes('email') || lowerText.includes('spoof')) cat = 'Phishing';
    else if (lowerText.includes('password') || lowerText.includes('credential')) cat = 'Passwords';
    else if (lowerText.includes('cloud') || lowerText.includes('aws') || lowerText.includes('azure') || lowerText.includes('s3')) cat = 'Cloud';
    else if (lowerText.includes('malware') || lowerText.includes('ransomware') || lowerText.includes('virus')) cat = 'Malware';
    else if (lowerText.includes('network') || lowerText.includes('firewall') || lowerText.includes('packet')) cat = 'Network';
    else if (lowerText.includes('owasp') || lowerText.includes('injection') || lowerText.includes('xss') || lowerText.includes('api')) cat = 'Application Security';
    else if (lowerText.includes('hipaa') || lowerText.includes('iso') || lowerText.includes('pci') || lowerText.includes('soc 2') || lowerText.includes('compliance')) cat = 'Compliance & Governance';

    // 1. Extract real quiz questions from PDF
    const extractedQuiz = this.extractQuestionsFromText(rawText);

    // 2. Extract sections by module keywords
    const sectionSplits = rawText.split(/(?=(?:Module|Chapter|Section|Unit)\s+\d+[:.])/i);
    const parsedModules = [];

    const img1 = extractedImages[0]?.url || null;
    const img2 = extractedImages[1]?.url || null;
    const img3 = extractedImages[2]?.url || null;
    const imgs = [img1, img2, img3];

    for (let i = 0; i < sectionSplits.length; i++) {
      const section = sectionSplits[i].trim();
      if (!section.match(/^(?:Module|Chapter|Section|Unit)\s+\d+/i)) continue;

      const sectionLines = section.split('\n').map((l) => l.trim()).filter(Boolean);
      let rawHeader = sectionLines[0] || `Module ${parsedModules.length + 1}`;
      if (sectionLines.length > 1 && rawHeader.length < 40 && !sectionLines[1].includes('.')) {
        rawHeader += ' ' + sectionLines[1];
      }

      // Check if this module is purely assessment / quiz
      if (
        rawHeader.toLowerCase().includes('assessment') ||
        rawHeader.toLowerCase().includes('quiz') ||
        rawHeader.toLowerCase().includes('exam') ||
        section.toLowerCase().includes('question 1:')
      ) {
        continue;
      }

      // Extract bullet points if present
      const bulletMatches = section.match(/(?:^\d+\.\s+|^[-*]\s+)([^\n]+)/gm) || [];
      const cleanPoints = bulletMatches
        .map((p) => p.replace(/^\d+\.\s+|^[-*]\s+/, '').trim())
        .filter((p) => p.length > 10)
        .slice(0, 4);

      // Extract code snippets or scripts if present
      let codeExample = null;
      const codeMatches = section.match(/(?:^#\s+[^\n]+|^curl\s+[^\n]+|^sudo\s+[^\n]+|^journalctl\s+[^\n]+|^Revoke-[^\n]+|^Get-[^\n]+)/gm);
      if (codeMatches && codeMatches.length > 0) {
        codeExample = codeMatches.slice(0, 3).join('\n');
      }

      // Extract case study or scenario if present
      let realTimeExample = null;
      const caseMatch = section.match(/(?:Case Study\s*\d*:[^\n]+[\s\S]*?(?=(?:Case Study|\n\n[A-Z]|$)))/i);
      if (caseMatch) {
        realTimeExample = caseMatch[0].replace(/\s+/g, ' ').trim().slice(0, 350);
      }

      // Contextual Knowledge Check for this module
      const kc = this._buildTopicKnowledgeCheck(rawHeader, section, cleanPoints);

      // Construct lesson
      const lessonTitle = rawHeader.replace(/^(?:Module|Chapter|Section|Unit)\s+\d+[:.]\s*/i, '').trim();
      const lesson = {
        title: lessonTitle,
        type: 'reading',
        dur: '8 min',
        body: `### Overview & Core Concepts\n\n${section.slice(0, 1200)}\n\n### Operational Defensive Implementation\n\nContinuous telemetry evaluation and deterministic policy enforcement minimize attack surface dwell time.`,
        image: imgs[parsedModules.length % imgs.length],
        videoUrl: null,
        example: codeExample || '# Defensive enforcement telemetry baseline\nsudo auditctl -w /etc/security/ -p wa -k identity_changes',
        realTimeExample: realTimeExample || `Adversaries attempting lateral compromise detailed in ${rawHeader} were intercepted via zero-trust policy enforcement telemetry.`,
        points: cleanPoints.length > 0 ? cleanPoints : [
          'Enforce strict verification and least privilege policies across operational roles',
          'Inspect telemetry in real time rather than relying on static network perimeters',
          'Isolate anomalies immediately to prevent lateral privilege escalation'
        ],
        flipCard: {
          front: {
            title: 'Threat Indicator Inspection',
            scenario: `Anomalous activity detected relating to ${lessonTitle}.`,
            indicator: 'Identity or Policy Violation Alert',
          },
          back: {
            title: 'Forensic Remediation',
            analysis: 'Telemetry indicates unauthorized session state manipulation or perimeter bypass attempt.',
            mitigation: 'Revoke active authentication tokens, apply endpoint quarantine, and challenge with FIDO2 MFA.',
          },
        },
        knowledgeCheck: kc,
      };

      parsedModules.push({
        title: rawHeader,
        desc: `In-depth analysis of ${lessonTitle}.`,
        duration: '1.5 hours',
        objectives: [
          `Understand architectural principles of ${lessonTitle}`,
          `Implement telemetry monitoring and defense mitigations`,
        ],
        lessons: [lesson],
      });
    }

    // Fallback if no modules parsed via explicit headers
    if (parsedModules.length === 0) {
      const paragraphs = rawText
        .split(/\n\s*\n/)
        .map((p) => p.replace(/\s+/g, ' ').trim())
        .filter((p) => p.length > 60);

      const pCount = paragraphs.length;
      const pPerMod = Math.max(1, Math.floor(pCount / 3));

      for (let mIdx = 0; mIdx < 3; mIdx++) {
        const modNum = mIdx + 1;
        const modTitle = `Module ${modNum}: ${['Architecture & Vector Analysis', 'Defensive Safeguards & Enforcement', 'Telemetry & Incident Playbooks'][mIdx]}`;
        const modText = paragraphs.slice(mIdx * pPerMod, (mIdx + 1) * pPerMod).join('\n\n') || rawText.slice(mIdx * 800, (mIdx + 1) * 800);
        const kc = this._buildTopicKnowledgeCheck(modTitle, modText, []);

        parsedModules.push({
          title: modTitle,
          desc: `Core operational concepts and defense implementation for module ${modNum}.`,
          duration: '1.5 hours',
          objectives: ['Master technical defense protocols', 'Apply automated telemetry rules'],
          lessons: [
            {
              title: `Core Principles & Technical Breakdown`,
              type: 'reading',
              dur: '7 min',
              body: `### Core Threat Environment\n\n${modText.slice(0, 1000)}\n\n### Defensive Protocols\n\nEnforcing strict identity verification ensures unauthorized lateral movement is intercepted at early execution stages.`,
              image: imgs[mIdx % imgs.length],
              videoUrl: null,
              example: 'sudo auditctl -w /etc/pam.d/ -p wa -k auth_tampering',
              realTimeExample: `Forensic audit logs confirmed adversary session manipulation was contained following procedures in ${courseTitle}.`,
              points: [
                'Validate all ingress requests against reputation feeds',
                'Ensure least privilege across operational roles',
              ],
              flipCard: {
                front: {
                  title: 'Threat Indicator Inspection',
                  scenario: 'Anomalous outbound session initiated to unverified remote port.',
                  indicator: 'Potential Beaconing / C2 Communication',
                },
                back: {
                  title: 'Forensic Mitigation Analysis',
                  analysis: 'Periodic heartbeat intervals identified characteristic of reverse shell dropper payloads.',
                  mitigation: 'Immediately revoke session tokens, isolate the host IP, and collect volatile memory artifacts.',
                },
              },
              knowledgeCheck: kc,
            },
          ],
        });
      }
    }

    // Append final Quiz Lesson to the last module (matching native courses in coursesData.ts)
    if (parsedModules.length > 0) {
      const lastMod = parsedModules[parsedModules.length - 1];
      lastMod.lessons.push({
        title: `Quiz: ${courseTitle} Assessment`,
        type: 'quiz',
        dur: '10 min',
        body: `Test your comprehension and earn your verified certificate in ${courseTitle}. Complete all preceding lessons to unlock this final proctored assessment.`,
        points: [],
      });
    }

    // Build final comprehensive Quiz:
    // 1) Start with all extracted questions from the PDF
    const finalQuiz = [...extractedQuiz];

    // 2) If fewer than 5 questions, supplement with high-yield scenario questions
    const standardQuestions = [
      {
        q: `According to the training material in "${courseTitle}", what is the primary defensive priority upon detecting an active threat indicator?`,
        question: `According to the training material in "${courseTitle}", what is the primary defensive priority upon detecting an active threat indicator?`,
        options: [
          'Delete all affected systems immediately without taking backups',
          'Isolate the compromised asset, preserve forensic evidence, and assess scope',
          'Ignore the alert if it has not repeated more than 10 times',
          'Restart the host computer to clear volatile memory',
        ],
        answer: 1,
        explanation: 'Isolating the asset prevents lateral spread while preserving critical memory and disk forensic evidence for root-cause analysis.',
      },
      {
        q: 'Which authentication mechanism provides mathematical cryptographic protection against Adversary-in-the-Middle (AiTM) reverse proxy interception?',
        question: 'Which authentication mechanism provides mathematical cryptographic protection against Adversary-in-the-Middle (AiTM) reverse proxy interception?',
        options: [
          'SMS OTP text verification codes',
          'FIDO2 / WebAuthn hardware security keys with domain-bound origin validation',
          'Voice telephone automated callbacks',
          'Simple 6-character passwords changed monthly',
        ],
        answer: 1,
        explanation: 'FIDO2 / WebAuthn binds the cryptographic assertion directly to the browser origin, neutralizing proxy interception.',
      },
      {
        q: 'During proctored assessment examinations, which behavior triggers an academic integrity strike?',
        question: 'During proctored assessment examinations, which behavior triggers an academic integrity strike?',
        options: [
          'Reviewing the countdown timer',
          'Switching browser tabs, exiting fullscreen, or attempting unauthorized shortcuts',
          'Submitting an answer before the timer expires',
          'Viewing the question navigator pills',
        ],
        answer: 1,
        explanation: 'Proctored mode enforces fullscreen lockdown and tracks window blur / tab switching to prevent cheating.',
      },
      {
        q: 'What is the role of an interactive threat flip card during security training?',
        question: 'What is the role of an interactive threat flip card during security training?',
        options: [
          'To generate fake user reports',
          'To present learners with a raw threat indicator first, flipping to reveal forensic root cause and mitigation steps',
          'To automatically bypass the final examination',
          'To disable local firewall logging',
        ],
        answer: 1,
        explanation: 'Interactive 3D flip cards reinforce cognitive retention by presenting the suspicious indicator first and revealing the technical analysis on the back.',
      },
      {
        q: 'What is the recommended status for a newly AI-generated course before releasing it to all learners?',
        question: 'What is the recommended status for a newly AI-generated course before releasing it to all learners?',
        options: [
          'Permanently deleted',
          'DRAFT mode for Course Admin inspection, media upload, and curriculum refinement',
          'Direct public staging with zero administrative review',
          'Unencrypted archive',
        ],
        answer: 1,
        explanation: 'Saving as DRAFT enables Course Admins to inspect the synthesized lessons, review questions, attach custom media, and publish when verified.',
      },
    ];

    for (const sq of standardQuestions) {
      if (finalQuiz.length >= 5) break;
      if (!finalQuiz.some((fq) => fq.q.slice(0, 30) === sq.q.slice(0, 30))) {
        finalQuiz.push(sq);
      }
    }

    return {
      title: courseTitle,
      cat,
      level: 'Intermediate',
      duration: '4-6 hours',
      desc: `Comprehensive training program synthesized from "${originalFilename}". Covers essential threat vectors, operational safeguards, and organizational compliance.`,
      objectives: [
        'Master foundational threat identification and attack surface recognition',
        'Deploy technical countermeasures and incident handling playbooks',
        'Demonstrate certified proficiency through scenario-based assessment drills',
      ],
      skillsGained: [
        `${cat} Defense Protocols`,
        'Threat Telemetry & Log Inspection',
        'Zero Trust Hardening & Incident Response',
      ],
      prerequisites: ['Basic cybersecurity hygiene awareness and network fundamentals'],
      bannerImage: img1,
      credentialEligible: true,
      credentialName: `${courseTitle} Specialist Certification`,
      modules: parsedModules,
      quiz: finalQuiz,
    };
  }

  /**
   * Build contextual knowledge check for each topic/lesson
   */
  _buildTopicKnowledgeCheck(title, text, points) {
    const titleLower = title.toLowerCase();
    const textLower = text.toLowerCase();

    if (titleLower.includes('control plane') || titleLower.includes('nist') || titleLower.includes('architecture')) {
      return [
        {
          q: 'Under NIST SP 800-207 Zero-Trust Architecture, which component evaluates dynamic context and decides access?',
          question: 'Under NIST SP 800-207 Zero-Trust Architecture, which component evaluates dynamic context and decides access?',
          options: [
            'Policy Decision Point (PDP / Policy Engine)',
            'Boundary edge DHCP server',
            'Local browser cookie store',
            'Unencrypted perimeter hub',
          ],
          answer: 0,
          explanation: 'The Policy Decision Point (PDP) evaluates continuous telemetry rules and directs the Policy Enforcement Point (PEP) to open or terminate communication.',
        },
      ];
    } else if (titleLower.includes('identity') || titleLower.includes('token') || titleLower.includes('session') || titleLower.includes('aitm')) {
      return [
        {
          q: 'What is the primary mechanism an Adversary-in-the-Middle (AiTM) proxy uses to bypass MFA?',
          question: 'What is the primary mechanism an Adversary-in-the-Middle (AiTM) proxy uses to bypass MFA?',
          options: [
            'Capturing and replaying the authenticated session cookie/token after the user completes MFA',
            'Brute forcing 64-character master password hashes',
            'Physically stealing the target hardware smartphone',
            'Altering motherboard firmware over email',
          ],
          answer: 0,
          explanation: 'AiTM reverse proxies capture the authenticated session cookie returned once MFA is completed by the victim, enabling session token hijacking.',
        },
      ];
    } else if (titleLower.includes('soc') || titleLower.includes('containment') || titleLower.includes('playbook') || titleLower.includes('telemetry')) {
      return [
        {
          q: 'What is the immediate primary containment step when an identity token hijacking is detected?',
          question: 'What is the immediate primary containment step when an identity token hijacking is detected?',
          options: [
            'Revoke all active global user session tokens and refresh tokens across identity providers',
            'Wait 72 hours to see if anomalous traffic stops on its own',
            'Power off all enterprise computers without backup',
            'Post the compromised credentials to public forums',
          ],
          answer: 0,
          explanation: 'Immediately revoking active refresh tokens and terminating browser sessions invalidates the hijacked session cookie and stops lateral movement.',
        },
      ];
    } else if (titleLower.includes('phish') || textLower.includes('phish') || textLower.includes('quish')) {
      return [
        {
          q: 'Which email header verification method confirms that the sender IP is authorized to send for that domain?',
          question: 'Which email header verification method confirms that the sender IP is authorized to send for that domain?',
          options: [
            'SPF (Sender Policy Framework) and DKIM cryptographic signature',
            'Subject line urgency score',
            'Number of CC recipients',
            'Font color formatting in the email HTML body',
          ],
          answer: 0,
          explanation: 'SPF validates sending server IP addresses against DNS TXT records, while DKIM cryptographically proves message integrity.',
        },
      ];
    } else if (titleLower.includes('password') || textLower.includes('credential') || textLower.includes('hash')) {
      return [
        {
          q: 'Which cryptographic algorithm is recommended for salting and hashing stored user passwords?',
          question: 'Which cryptographic algorithm is recommended for salting and hashing stored user passwords?',
          options: [
            'Argon2id or bcrypt with adaptive work factor',
            'Plain unsalted MD5',
            'Single-round SHA-1',
            'Base64 encoding without key',
          ],
          answer: 0,
          explanation: 'Argon2id and bcrypt provide memory-hard and computationally intensive work factors that resist GPU/ASIC brute-force cracking.',
        },
      ];
    } else if (titleLower.includes('cloud') || textLower.includes('s3') || textLower.includes('iam')) {
      return [
        {
          q: 'What is the most frequent root cause of critical data exposure in enterprise cloud environments?',
          question: 'What is the most frequent root cause of critical data exposure in enterprise cloud environments?',
          options: [
            'Publicly accessible storage buckets and overly permissive IAM roles',
            'Underclocking CPU instances',
            'Using SSH keys instead of passwords',
            'Enabling CloudTrail logging',
          ],
          answer: 0,
          explanation: 'Misconfigured cloud storage bucket policies and wildcard IAM permissions enable unauthenticated external access.',
        },
      ];
    } else {
      const p1 = points && points.length > 0 ? points[0] : 'core defense protocols';
      return [
        {
          q: `What is a primary operational safeguard emphasized in "${title.replace(/^(?:Module|Chapter)\s+\d+[:.]\s*/i, '')}"?`,
          question: `What is a primary operational safeguard emphasized in "${title.replace(/^(?:Module|Chapter)\s+\d+[:.]\s*/i, '')}"?`,
          options: [
            `${p1}`,
            'Disable audit logging to reduce server load',
            'Grant unrestricted admin rights to all domain users',
            'Store shared passwords in unencrypted network shares',
          ],
          answer: 0,
          explanation: `Applying proactive controls such as "${p1}" ensures multi-layered defense-in-depth across enterprise systems.`,
        },
      ];
    }
  }
}

module.exports = new PdfCourseService();
