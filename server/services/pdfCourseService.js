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
    if (!courseBlueprint || !courseBlueprint.title || !Array.isArray(courseBlueprint.modules)) {
      courseBlueprint = this._synthesizeCurriculumFallback(rawText, extractedImages, originalFilename);
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
      `Follow this JSON schema strictly without extra markdown formatting:\n` +
      `{\n` +
      `  "title": "Course Title",\n` +
      `  "cat": "Category (Phishing | Passwords | Malware | Network | Cloud | Application Security | Social Engineering | Incident Response | Compliance & Governance | Identity & Access)",\n` +
      `  "level": "Beginner | Intermediate | Advanced",\n` +
      `  "duration": "3-5 hours",\n` +
      `  "desc": "2-3 sentence overview",\n` +
      `  "objectives": ["objective 1", "objective 2", "objective 3"],\n` +
      `  "skillsGained": ["skill 1", "skill 2", "skill 3"],\n` +
      `  "prerequisites": ["prerequisite 1"],\n` +
      `  "modules": [\n` +
      `    {\n` +
      `      "title": "Module Title",\n` +
      `      "desc": "Module summary",\n` +
      `      "duration": "1 hour",\n` +
      `      "objectives": ["mod objective"],\n` +
      `      "lessons": [\n` +
      `        {\n` +
      `          "title": "Lesson Title",\n` +
      `          "type": "reading",\n` +
      `          "dur": "6 min",\n` +
      `          "body": "Detailed technical lesson text in Markdown format...",\n` +
      `          "image": "${images[0]?.url || ''}",\n` +
      `          "videoUrl": null,\n` +
      `          "example": "code or payload example",\n` +
      `          "realTimeExample": "Real-world incident scenario",\n` +
      `          "points": ["Key takeaway 1", "Key takeaway 2"],\n` +
      `          "flipCard": {\n` +
      `            "front": { "title": "Inspect Indicator", "scenario": "Front scenario prompt", "indicator": "Warning indicator" },\n` +
      `            "back": { "title": "Forensic Breakdown", "analysis": "Technical analysis", "mitigation": "Defense step" }\n` +
      `          }\n` +
      `        }\n` +
      `      ]\n` +
      `    }\n` +
      `  ],\n` +
      `  "quiz": [\n` +
      `    {\n` +
      `      "question": "Scenario assessment question?",\n` +
      `      "options": ["Option A", "Option B", "Option C", "Option D"],\n` +
      `      "answer": 1,\n` +
      `      "explanation": "Detailed explanation of correct answer."\n` +
      `    }\n` +
      `  ]\n` +
      `}`;

    const userPrompt = `Document: ${originalFilename}\nInstructions: ${customInstructions || 'Create an in-depth, structured cybersecurity course with 3-4 modules, rich lessons with examples and flip cards, and a 5-question assessment quiz.'}\n\nDocument Text:\n${textSnippet}`;

    const resp = await axios.post(
      `${ollamaHost}/api/generate`,
      {
        model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        format: 'json',
        stream: false,
      },
      { timeout: 12000 }
    );

    if (resp.data && resp.data.response) {
      const parsed = JSON.parse(resp.data.response);
      return parsed;
    }
    return null;
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

    // Detect category
    const lowerText = rawText.toLowerCase();
    let cat = 'Incident Response';
    if (lowerText.includes('phish') || lowerText.includes('email') || lowerText.includes('spoof')) cat = 'Phishing';
    else if (lowerText.includes('password') || lowerText.includes('mfa') || lowerText.includes('credential')) cat = 'Passwords';
    else if (lowerText.includes('cloud') || lowerText.includes('aws') || lowerText.includes('azure') || lowerText.includes('s3')) cat = 'Cloud';
    else if (lowerText.includes('malware') || lowerText.includes('ransomware') || lowerText.includes('virus')) cat = 'Malware';
    else if (lowerText.includes('network') || lowerText.includes('firewall') || lowerText.includes('packet')) cat = 'Network';
    else if (lowerText.includes('owasp') || lowerText.includes('injection') || lowerText.includes('xss') || lowerText.includes('api')) cat = 'Application Security';
    else if (lowerText.includes('hipaa') || lowerText.includes('iso') || lowerText.includes('pci') || lowerText.includes('soc 2') || lowerText.includes('compliance')) cat = 'Compliance & Governance';

    // Break text into substantial paragraphs
    const paragraphs = rawText
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter((p) => p.length > 60);

    const pCount = paragraphs.length;
    const pPerMod = Math.max(2, Math.floor(pCount / 3));

    const mod1Text = paragraphs.slice(0, pPerMod).join('\n\n') || rawText.slice(0, 800);
    const mod2Text = paragraphs.slice(pPerMod, pPerMod * 2).join('\n\n') || rawText.slice(800, 1600);
    const mod3Text = paragraphs.slice(pPerMod * 2).join('\n\n') || rawText.slice(1600, 2400);

    const img1 = extractedImages[0]?.url || null;
    const img2 = extractedImages[1]?.url || null;
    const img3 = extractedImages[2]?.url || null;

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
      modules: [
        {
          title: 'Module 1: Architecture & Vector Analysis',
          desc: 'Understanding baseline concepts and identifying threat actor tactics.',
          duration: '1.5 hours',
          objectives: ['Identify attack surfaces', 'Classify threat severity'],
          lessons: [
            {
              title: 'Threat Environment & Attack Surface Overview',
              type: 'reading',
              dur: '7 min',
              body: `### Core Threat Environment\n\n${mod1Text.slice(0, 1000)}\n\n### Defensive Protocols\n\nEstablishing persistent telemetry and enforcing strict identity verification ensures unauthorized lateral movement is intercepted at early execution stages.`,
              image: img1,
              videoUrl: null,
              example: 'curl -s -I "https://target-domain.com" | grep -i -E "server|x-powered-by|content-security-policy"',
              realTimeExample: `During recent forensic audits, adversaries exploited unpatched gateways using techniques detailed in ${originalFilename}. Immediate isolation prevented credential leakage.`,
              points: [
                'Validate all ingress traffic against reputation feeds',
                'Ensure principle of least privilege across operational roles',
              ],
              flipCard: {
                front: {
                  title: 'Threat Indicator Inspection',
                  scenario: 'Anomalous outbound session initiated to unverified remote port.',
                  indicator: 'Potential Beaconing / C2 Communication',
                },
                back: {
                  title: 'Forensic Mitigation Analysis',
                  analysis: 'Traffic inspection identified periodic heartbeat intervals characteristic of reverse shell dropper payloads.',
                  mitigation: 'Immediately revoke session tokens, isolate the host IP, and collect volatile memory artifacts.',
                },
              },
            },
          ],
        },
        {
          title: 'Module 2: Defensive Countermeasures & Hardening',
          desc: 'Operational enforcement and active defense implementation steps.',
          duration: '2 hours',
          objectives: ['Apply hardening baselines', 'Configure automated rule engines'],
          lessons: [
            {
              title: 'Hardening Safeguards & Enforcement Workflows',
              type: 'reading',
              dur: '8 min',
              body: `### Technical Mitigation Baseline\n\n${mod2Text.slice(0, 1000)}\n\n### Implementation Steps\n\nSecurity teams must enforce deterministic controls across network boundaries, email gateways, and application runtimes.`,
              image: img2,
              videoUrl: null,
              example: '# Firewall rule enforcement\nsudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --set\nsudo iptables -A INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP',
              realTimeExample: 'Enterprise systems that deployed automated threshold rate-limiting resisted high-frequency brute force attacks without service degradation.',
              points: [
                'Apply automated rate-limiting and connection throttling',
                'Audit configuration baselines on a continuous recurring schedule',
              ],
              flipCard: {
                front: {
                  title: 'Access Control Breach Indicator',
                  scenario: 'Multiple concurrent login sessions authenticated from distant geographic locations within 5 minutes.',
                  indicator: 'Impossible Travel Anomaly',
                },
                back: {
                  title: 'Zero Trust Remediation',
                  analysis: 'Credential stuffing or session hijacking enabled adversary access from non-corporate VPN subnet.',
                  mitigation: 'Trigger immediate MFA challenge, terminate concurrent active web sessions, and blacklist rogue IP range.',
                },
              },
            },
          ],
        },
        {
          title: 'Module 3: Verification, Auditing & Incident Playbooks',
          desc: 'Validating posture integrity and executing incident response procedures.',
          duration: '1.5 hours',
          objectives: ['Execute audit verification', 'Generate compliance documentation'],
          lessons: [
            {
              title: 'Continuous Verification & Incident Playbook',
              type: 'reading',
              dur: '6 min',
              body: `### Incident Response Governance\n\n${mod3Text.slice(0, 1000)}\n\n### Post-Incident Review\n\nDocumenting root causes and updating threat detection signatures ensures organizational resilience improves after every security event.`,
              image: img3,
              videoUrl: null,
              example: 'tail -n 100 /var/log/auth.log | grep "Failed password" | awk "{print $11}" | sort | uniq -c | sort -nr',
              realTimeExample: 'Timely triage and containment in accordance with NIST incident response phases reduced dwell time from weeks to under 45 minutes.',
              points: [
                'Maintain immutable, offsite audit logging',
                'Conduct scheduled table-top simulation drills with stakeholders',
              ],
              flipCard: {
                front: {
                  title: 'Audit Discrepancy Indicator',
                  scenario: 'Event logs indicate sudden clearing of system security log channels.',
                  indicator: 'Evidence Tampering / Anti-Forensics',
                },
                back: {
                  title: 'Incident Containment Protocol',
                  analysis: 'Log clearing indicates malicious administrative privilege escalation and attempts to hide adversary footprint.',
                  mitigation: 'Pivot to SIEM central stream logs, snapshot VM disk state, and isolate domain controllers.',
                },
              },
            },
          ],
        },
      ],
      quiz: [
        {
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
          question: 'Which of the following represents the most effective mitigation against unauthorized credential reuse?',
          options: [
            'Using short 6-character passwords changed daily',
            'Enforcing phishing-resistant Multi-Factor Authentication (FIDO2 / WebAuthn)',
            'Disabling HTTPS encryption to decrease server latency',
            'Storing plain text passwords in a shared spreadsheet',
          ],
          answer: 1,
          explanation: 'Phishing-resistant MFA (FIDO2/WebAuthn) cryptographically binds credentials to the domain origin, neutralizing credential harvesting.',
        },
        {
          question: 'What is the role of an interactive threat flip card during security awareness training?',
          options: [
            'To generate synthetic mock data for administrative reports',
            'To present learners with a raw threat scenario and flip to inspect technical forensic breakdown and defense protocol',
            'To automatically pass the quiz without reading lesson material',
            'To bypass local firewall rules',
          ],
          answer: 1,
          explanation: 'Interactive 3D flip cards reinforce cognitive retention by presenting the suspicious artifact first and revealing the technical analysis on the back.',
        },
        {
          question: 'During proctored assessment examinations, which behavior will trigger an academic integrity violation strike?',
          options: [
            'Selecting an option and moving to the next question',
            'Switching browser tabs, exiting fullscreen, or attempting to copy questions',
            'Reviewing the countdown timer',
            'Completing all questions within the allowed time limit',
          ],
          answer: 1,
          explanation: 'Proctored mode enforces fullscreen lockdown and tracks window blur / tab switching to prevent cheating and question leaks.',
        },
        {
          question: 'What is the recommended status for a newly AI-generated course before making it live to all students?',
          options: [
            'Permanently Deleted',
            'DRAFT mode for Course Admin inspection, media upload, and curriculum refinement',
            'Direct Public Deployment with zero human review',
            'Read-only Archive',
          ],
          answer: 1,
          explanation: 'Saving as DRAFT enables Course Admins to inspect the generated lessons, attach custom videos/images, refine quiz questions, and publish when verified.',
        },
      ],
    };
  }
}

module.exports = new PdfCourseService();
