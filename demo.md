# Cyber Guardian AI — Complete Presentation & Video Demonstration Guide

> **Official Project Presentation Script & Video Submission Walkthrough**  
> **Project Name:** Cyber Guardian AI (IBM Project)  
> **Target Audience:** IBM Evaluators, Technical Stakeholders, Project Review Committee  
> **Goal:** Showcase the full capabilities, architecture, hands-on cyber range, and enterprise security governance of Cyber Guardian AI.

---

## 📋 Table of Contents
1. [Executive Summary & Value Proposition](#1-executive-summary--value-proposition)
2. [Pre-Recording Checklist & Environment Setup](#2-pre-recording-checklist--environment-setup)
3. [Recommended Demo Video Timeline (10–14 Minutes)](#3-recommended-demo-video-timeline)
4. [Step-by-Step Spoken Script & Screen Action Guide](#4-step-by-step-spoken-script--screen-action-guide)
   - [Act 1: Project Introduction & Authentication](#act-1-project-introduction--authentication-000--115)
   - [Act 2: Security Dashboard & Real-Time Threat Interception](#act-2-security-dashboard--real-time-threat-interception-115--245)
   - [Act 3: Flagship Hands-On Cyber Range (TryHackMe Style Lab)](#act-3-flagship-hands-on-cyber-range-tryhackme-style-lab-245--700)
   - [Act 4: AI Security Assistant (FlotBot) & Zero-Trust URL Engine](#act-4-ai-security-assistant-flotbot--zero-trust-url-engine-700--830)
   - [Act 5: Courses LMS, Academy Progress & Gamification](#act-5-courses-lms-academy-progress--gamification-830--1000)
   - [Act 6: Threat Analytics, Forensics & AI Behavioral Insights](#act-6-threat-analytics-forensics--ai-behavioral-insights-1000--1115)
   - [Act 7: Enterprise Admin, EDR/XDR Consoles & Governance](#act-7-enterprise-admin-edrxdr-consoles--governance-1115--1245)
   - [Act 8: Wrap-Up, Impact & Future Roadmap](#act-8-wrap-up-impact--future-roadmap-1245--1330)
5. [Frequently Asked Questions & Winning Evaluator Answers](#5-frequently-asked-questions--winning-evaluator-answers)
6. [Quick Live Meeting Cheatsheet (1-Page Summary)](#6-quick-live-meeting-cheatsheet)

---

## 1. Executive Summary & Value Proposition

### The Problem
- Over **82% of all enterprise cybersecurity breaches** involve human error (phishing, social engineering, credential reuse, and mishandled alerts).
- Traditional corporate training relies on boring slide decks and obvious multiple-choice quizzes where employees guess answers without learning how to handle real attacks.

### The Solution: Cyber Guardian AI
- **Cyber Guardian AI** is an intelligent, gamified, and immersive cybersecurity training and threat defense platform.
- It features an authentic **TryHackMe / HackTheBox style Cyber Range** where users interact with simulated virtual environments (Email client, Kali terminal, Corporate Chat, QR Scanner, Ransomware dropper).
- Features an authentic **5-Step SOC Incident Response Console** requiring learners to classify attack vectors, assess severity, submit observable Indicators of Compromise (IoCs), and execute defensive containment playbooks to earn **Root Defense Flags**.
- Powered by **FlotBot AI**, dual-engine threat scanning (Client-side heuristic engine + Server SOC database), and enterprise **EDR/XDR management consoles**.

---

## 2. Pre-Recording Checklist & Environment Setup

### Technical Setup
- [ ] **Display Resolution:** 1920x1080 (1080p).
- [ ] **Browser:** Chrome or Firefox in Fullscreen Mode (`F11`).
- [ ] **Browser Zoom:** Reset to `100%` (`Ctrl + 0`).
- [ ] **Local Dev Server:** Run `npm run dev` in terminal and ensure `http://localhost:5173` is active.
- [ ] **Audio:** Use a clean microphone or headset; test audio levels so speech is crisp without background noise.
- [ ] **Recording Tool:** OBS Studio, Loom, or Screen Studio with cursor highlighting enabled.

### Demonstration Accounts / Preparation
- **Account 1 (Student / Trainee):** For demonstrating the learner dashboard, courses, and cyber range.
- **Account 2 (Admin / SOC Analyst):** For demonstrating the administrative governance and FlotBot EDR/XDR consoles.

---

## 3. Recommended Demo Video Timeline

| Segment | Feature Covered | Duration |
|---|---|---|
| **Act 1** | Introduction, Problem Statement & Authentication | 1:15 |
| **Act 2** | Security Dashboard, Awareness Score & Quick Actions | 1:30 |
| **Act 3** | **Hands-On Cyber Range Lab (TryHackMe Style)** | **4:15** |
| **Act 4** | AI Security Assistant (FlotBot) & Real-Time URL Scanner | 1:30 |
| **Act 5** | Courses LMS, Progress Tracking & Gamification (Badges/XP) | 1:30 |
| **Act 6** | Threat Analytics, Attack Trends & AI Security Insights | 1:15 |
| **Act 7** | Enterprise Admin, FlotBot EDR/XDR Consoles & RBAC | 1:30 |
| **Act 8** | Conclusion, Technical Architecture & Closing Pitch | 0:45 |
| **Total** | **Full Feature Comprehensive Demonstration** | **~13:30** |

---

## 4. Step-by-Step Spoken Script & Screen Action Guide

---

### Act 1: Project Introduction & Authentication (0:00 – 1:15)

#### 🖥️ What to show on screen:
1. Open the browser to the **Login Page** (`#/login`).
2. Show the clean Cyber-themed login interface with dark mode aesthetics, dynamic glow effects, and tabs for Login / Register / Forgot Password.
3. Log in with your credentials.

#### 🎙️ What to say:
> *"Hello respected evaluators and team. Today, I am proud to present **Cyber Guardian AI**, an intelligent cybersecurity training, hands-on simulation, and threat intelligence platform built to eliminate the #1 cause of enterprise data breaches: human error.*
> 
> *Traditional security awareness training is passive and ineffective. Employees just click through boring slides. Cyber Guardian AI transforms security training into an interactive cyber range where learners defend live systems, analyze real threat telemetry, and submit official incident reports just like a SOC analyst.*
> 
> *Let's log in and explore the platform."*

---

### Act 2: Security Dashboard & Real-Time Threat Interception (1:15 – 2:45)

#### 🖥️ What to show on screen:
1. Land on the **Executive Security Dashboard** (`#/dashboard`).
2. Highlight the **Cyber Awareness Score** (radial score meter, current security grade, e.g., `88/100`).
3. Point out the **Quick Stats Cards**:
   - Attacks Defended
   - Active Quests
   - Training Hours
   - Security XP & Level
4. Demonstrate the **Quick Actions Panel** (Scan URL, Start Simulation, Chat with AI Assistant).
5. In the Quick Action URL scanner or top bar, enter a test suspicious URL (e.g. `http://secure-login.paypaI-updates.com/login`) and click **Scan**.
6. Show the **Threat Interception Modal** pop up with:
   - Risk Level (`CRITICAL`) & Threat Score (`92/100`)
   - Detected Insecure Protocol (Plaintext HTTP warning)
   - Homoglyph Detection (`paypaI` with a capital 'I')
   - MITRE ATT&CK Mapping (`T1566.002 - Spearphishing Link`)
   - Threat intelligence verdicts and Safe Exit button.

#### 🎙️ What to say:
> *"Upon logging in, the employee lands on the **Executive Security Dashboard**. At the center is our dynamic **Cyber Awareness Score**, which updates in real-time based on training performance, lab defense results, and phishing susceptibility.*
> 
> *Our platform is not just educational—it includes an active **Client & Server Zero-Trust Detection Engine**. Watch what happens when I scan a suspicious URL.*
> 
> *The system immediately intercepts the request and generates a comprehensive forensic analysis: detecting the lack of TLS encryption, homoglyph domain substitution, and mapping the technique directly to the MITRE ATT&CK framework. Learners can inspect the evidence or safely abort, reinforcing safe security habits."*

---

### Act 3: Flagship Hands-On Cyber Range (TryHackMe Style Lab) (2:45 – 7:00)
*(⭐ THIS IS THE MOST IMPORTANT PART OF YOUR PRESENTATION! Spend proper time here.)*

#### 🖥️ What to show on screen:
1. Navigate via sidebar to **Simulation Lab** (`#/simulation`).
2. Show the **Simulation Matrix** featuring multiple scenarios across different domains:
   - Email Phishing & BEC
   - Malicious USB Drop
   - Vishing & Social Engineering Calls
   - QR Code / Quishing Attacks
   - Man-in-the-Middle (MITM) & SSL Stripping
   - Ransomware Execution Defense
3. Click into **`SE-001: Urgent Wire Transfer Spear Phishing`** to open the **Cyber Range Room** (`TryHackMeRoom`).
4. **Walk through the Room Architecture:**
   - **Header:** Highlight the **`LEVEL: BEGINNER`** scheduled level badge (explain that each scenario has a scheduled curriculum difficulty).
   - **Split Screen:** Left side is the **Task Progression Panel**; right side is the **Interactive Virtual Sandbox (Email Client)**.
5. **Demonstrate Task 1 (Theory & Forensics Q&A):**
   - Expand the **Practical Concept Guide** / click **"Know More"** to show threat actor TTPs, red flags, and playbooks.
   - Answer Question 1 (Identify spoofing mechanism) and Question 2.
6. **Demonstrate Task 2 (Sandbox Investigation & Forensics):**
   - Switch focus to the virtual **Email Client** on the right.
   - Click the suspicious email from `"PayPal Support"`.
   - **Crucial Demonstration:** Click to expand **Sender Details**.
     - Point out the sender address: `security@paypaI-updates.com` (capital 'I').
     - Check SPF & DKIM records (`FAIL / MISSING`).
     - **Highlight this:** Notice how inspecting the sender does NOT cheat or reveal the flag! The system isolates reconnaissance from containment.
   - Hover over the `"Verify Account Now"` button to inspect the destination URL safely without clicking.
7. **Demonstrate the Hands-On SOC Incident Response Console:**
   - In the email toolbar, click **"Investigate & Report Phishing"**.
   - Show the **SOC Incident Report Modal**:
     - **Step 1: Attack Vector:** Select `Spear Phishing / Targeted Email` and `Domain Homoglyph / Typo-Squatting`.
     - **Step 2: Severity:** Choose `HIGH` or `CRITICAL`.
     - **Step 3: Observable IoC Evidence:** Type `security@paypaI-updates.com` and `http://secure-verify.paypaI-updates.com`.
     - **Step 4: Forensic Red Flags:** Check off *Domain Homoglyph*, *Urgent Coercive Language*, and *Mismatched Return-Path*.
     - **Step 5: Containment Action:** Select `Domain Sinkhole & Firewall Drop` and `Mailbox Purge (Global)`.
   - Click **"Execute Containment & Submit Report"**.
   - Show the **SOC Containment Confirmation Screen** releasing the official **Root Defense Flag**:
     `FLAG{SE-001_PHISHING_DEFENDED}`.
   - Click **"Copy Flag & Proceed"**.
8. **Demonstrate Task 3 (Root Flag Submission & Clearance):**
   - Paste the flag into **Task 3: Root Defense Flag** submission box.
   - Click **"Submit Flag"**.
   - Show the celebration modal:
     - **Marks Awarded:** `200 / 200 Marks`
     - **Rating:** `⭐⭐⭐ 3/3 Stars (Perfect Defense)`
     - **XP and Badge Unlock**.

#### 🎙️ What to say:
> *"Now let's examine the heart of Cyber Guardian AI: our **TryHackMe-style Cyber Range**. Here, learners don't just read about security—they enter a realistic sandbox and defend virtual machines.*
> 
> *Notice at the top, the lab is locked to its official scheduled curriculum level: `LEVEL: BEGINNER`. There are no easy shortcut buttons or artificial difficulty cheats.*
> 
> *On the left, we have a multi-task structured progression. On the right, we have a fully functional virtual client—in this case, an employee corporate email client.*
> 
> *First, in Task 1, students review the threat briefing and answer analytical questions.*
> 
> *Next, in Task 2, students investigate the threat. As you can see, when I click to inspect the sender headers, the system reveals SPF failures and homoglyph domain characters. Importantly, our system isolates investigative telemetry: merely looking at the sender does NOT automatically reveal the flag.*
> 
> *To contain the threat, the student must click 'Investigate & Report Phishing' to launch our **5-Step SOC Incident Response Console**. Here, students must classify the attack vector, evaluate threat severity, input observable IoCs, check forensic indicators, and select an active mitigation action like Domain Sinkholing or Mailbox Purging.*
> 
> *Only when this full forensic report is validated by the SOC engine does the system contain the threat and issue the verified Root Defense Flag: `FLAG{SE-001_PHISHING_DEFENDED}`.*
> 
> *Finally, the student pastes the Root Flag into Task 3. The engine verifies the submission, awards 200 marks, grants a 3-star rating, and updates the user's defensive record."*

---

### Act 4: AI Security Assistant (FlotBot) & Zero-Trust URL Engine (7:00 – 8:30)

#### 🖥️ What to show on screen:
1. Navigate via sidebar to **AI Assistant** (`#/ai-assistant`) or open the floating **FlotBot Widget**.
2. Type an interactive cybersecurity question in the chat:
   - *"How can I identify a BEC (Business Email Compromise) attack?"*
   - or *"What is the difference between DKIM and DMARC?"*
3. Show the intelligent, formatted response with markdown, bullet points, and actionable defense checklists.
4. Show the sidebar history of previous threat analysis sessions.

#### 🎙️ What to say:
> *"To support continuous learning, we developed **FlotBot AI**, a specialized conversational security mentor. Unlike generic chatbots, FlotBot is fine-tuned specifically on enterprise cybersecurity playbooks, NIST standards, and company security policies.*
> 
> *Employees can ask FlotBot to explain complex concepts, guide them through live incidents, or verify whether an unusual executive request aligns with company verification protocols.*
> 
> *FlotBot is also available platform-wide as a floating assistant widget, allowing students to summon help directly while working inside any cyber range lab."*

---

### Act 5: Courses LMS, Academy Progress & Gamification (8:30 – 10:00)

#### 🖥️ What to show on screen:
1. Navigate to **Courses & Training** (`courses-training`).
   - Show the rich course catalog across different skill paths (Phishing Defense, Password Security, Ransomware Awareness, Cloud Security, Remote Work Hygiene).
   - Click into a course to show reading modules, key takeaways, and end-of-module assessment quizzes.
2. Navigate to **Academy Progress** (`simulation-progress`).
   - Show the visual progress bars, attack domain mastery meters, and lab completion percentages.
3. Navigate to **Achievements** (`achievements`).
   - Show the gamification hub:
     - **Badges:** Phish Slayer, Forensic Inspector, Flag Hunter, Zero-Day Defender.
     - **Streaks & XP:** Current daily learning streak and total XP points.
     - **Leaderboard:** Team and organization rankings fostering healthy security competition.

#### 🎙️ What to say:
> *"Beyond hands-on simulations, Cyber Guardian AI features a complete Learning Management System with over 50 interactive modules.*
> 
> *In the **Academy Progress Dashboard**, students and team leads can track specific competency across diverse attack vectors.*
> 
> *To drive engagement and habitual learning, we implemented a complete **Gamification Engine**. Users earn XP, maintain daily defense streaks, unlock milestone badges, and climb the company leaderboard. This turns security awareness from a boring annual chore into an engaging daily practice."*

---

### Act 6: Threat Analytics, Forensics & AI Behavioral Insights (10:00 – 11:15)

#### 🖥️ What to show on screen:
1. Navigate to **Attack Trends** (`trends`).
   - Show the interactive charts: attack vectors distribution (Phishing vs. Malware vs. Social Engineering), weekly simulated incidents, and response time curves.
2. Navigate to **Suspicious Activity** (`threats`) and **Analysis History** (`history`).
   - Show the audit log of all simulated threats encountered, verdicts, and timestamped actions.
3. Navigate to **AI Security Insight** (`ai-insight`).
   - Show the personalized AI recommendations (e.g. *"Your homoglyph detection speed improved by 40%, but review macro-enabled attachments in Lesson 4"*).
4. Briefly show the **Reports** (`reports`) page with executive summary downloads.

#### 🎙️ What to say:
> *"In the Analytics suite, Cyber Guardian AI provides rich data visualization for both employees and security leadership.*
> 
> *The **Attack Trends** dashboard aggregates organizational telemetry to highlight emerging threat patterns, such as an increase in QR code quishing or vishing attacks.*
> 
> *In **AI Security Insights**, our machine learning engine analyzes each user's individual simulation telemetry to provide personalized, strengths-and-weaknesses coaching, ensuring training adapts dynamically to each learner."*

---

### Act 7: Enterprise Admin, EDR/XDR Consoles & Governance (11:15 – 12:45)

#### 🖥️ What to show on screen:
*(Log in or switch to an Administrative role to show admin navigation sections)*
1. Show the **Admin Navigation Panel**:
   - **Users Directory & RBAC:** Show user accounts, roles (`SUPER_ADMIN`, `PLATFORM_ADMIN`, `EMPLOYEE`), and permission toggles.
   - **Courses & Curriculum Studio:** Show where administrators can author new courses and lessons.
   - **Simulation Cyber Range Studio:** Show scenario management where admins can configure IoCs and challenge parameters.
2. Highlight the **FlotBot EDR/XDR Security Suite**:
   - **Security Dashboard (`flotbot-dashboard`):** Real-time endpoint health and alert status.
   - **Live Telemetry & IOC Management (`flotbot-iocs`):** Database of malicious domains, IPs, and hashes.
   - **Threat Rules Engine (`flotbot-rules`):** Custom detection rules engine for automated interception.
   - **Unified Audit Logs (`audit-logs`):** Immutable security and compliance audit logs.

#### 🎙️ What to say:
> *"For enterprise administrators and SOC teams, Cyber Guardian AI provides a comprehensive governance back-office.*
> 
> *Through our **RBAC Governance** system, administrators can manage user roles, audit training completion, and deploy new simulation scenarios.*
> 
> *Furthermore, our **FlotBot EDR/XDR Suite** integrates security operations directly into the training platform—enabling SOC managers to manage IoC databases, configure detection rules, monitor live endpoint telemetry, and review immutable audit trails for compliance standards like ISO 27001 and SOC 2."*

---

### Act 8: Wrap-Up, Impact & Future Roadmap (12:45 – 13:30)

#### 🖥️ What to show on screen:
1. Return to the main **Executive Dashboard** (`#/dashboard`).
2. Show the platform running smoothly with dark cyber styling.

#### 🎙️ What to say:
> *"In conclusion, Cyber Guardian AI bridges the critical divide between passive theoretical training and real-world SOC defense. By combining a hands-on cyber range, realistic 5-step incident containment, dual-engine threat interception, and FlotBot AI coaching, we empower every employee to become an active defender.*
> 
> *The application is built on modern, production-ready technologies: React 18, TypeScript, TailwindCSS, Firebase, and Vite, with clean modular architecture and robust test coverage.*
> 
> *Thank you for your time and attention. I look forward to your feedback and questions."*

---

## 5. Frequently Asked Questions & Winning Evaluator Answers

### Q1: "How is Cyber Guardian AI different from existing tools like KnowBe4 or PhishMe?"
> **Answer:** *"Most commercial tools only send automated phishing emails; if the user clicks, they are redirected to a static PDF or video. Cyber Guardian AI is an authentic **Cyber Range**. Learners actively explore simulated virtual machines, analyze raw headers, use forensic tools, and must execute a realistic 5-step SOC containment report to earn canonical Root Defense Flags. It trains real defensive reflexes rather than passive memorization."*

### Q2: "How does the platform prevent students from guessing or cheating the flags?"
> **Answer:** *"We eliminated all shortcut buttons and difficulty toggle bypasses. Flags are generated as canonical root defense flags (e.g. `FLAG{SE-001_PHISHING_DEFENDED}`). The flag is only unlocked when the student successfully completes the full SOC Incident Report—classifying the vector, submitting observable IoCs, selecting forensic indicators, and choosing the proper containment action. Furthermore, incorrect attempts incur a -15 mark deduction, discouraging brute-force guessing."*

### Q3: "Is the URL and threat detection engine purely simulated, or does it do real analysis?"
> **Answer:** *"It uses a dual-engine architecture: a real-time client-side heuristic engine (`ClientURLEngine`) that immediately detects plaintext protocols, homoglyphs, IP hostnames, and suspicious keywords, paired with an asynchronous backend SOC API that persists threat telemetry, queries threat intelligence databases, and maps attacks directly to the MITRE ATT&CK framework."*

### Q4: "Can non-technical employees use this platform?"
> **Answer:** *"Yes! Scenarios are tiered by scheduled curriculum levels: Beginner, Intermediate, and Advanced. Beginners receive guided concept playbooks and clear red-flag checklists, while advanced users face complex MITM, ransomware droppers, and OAuth consent spoofing challenges."*

---

## 6. Quick Live Meeting Cheatsheet (1-Page Summary)

Keep this cheat-sheet open on a second monitor or printed next to you during the live meeting:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   CYBER GUARDIAN AI — PRESENTATION CHEATSHEET               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. ELEVATOR PITCH (30s):                                                    │
│    • Human error causes 82%+ breaches. Passive training fails.               │
│    • Cyber Guardian AI = TryHackMe Cyber Range + SOC Incident Response      │
│      + FlotBot AI Assistant + Gamified LMS.                                 │
│                                                                             │
│ 2. KEY DEMO FLOW:                                                           │
│    • Dashboard: Awareness Score (88/100) -> Live URL Interception (MITRE)   │
│    • Cyber Range: SE-001 Phishing Lab (Beginner level badge)                │
│    • Forensics: Header analysis -> SPF fail -> homoglyphs (paypaI)          │
│    • SOC Console: Vector -> Severity -> IoC -> Red Flags -> Containment     │
│    • Root Flag: FLAG{SE-001_PHISHING_DEFENDED} -> 200 Marks -> 3 Stars!     │
│    • FlotBot AI: Live cybersecurity mentor & policy advisor                 │
│    • Gamification: Badges, Streaks, Academy Progress, Leaderboard           │
│    • Admin/EDR: RBAC, User governance, IoC DB, Detection rules              │
│                                                                             │
│ 3. KEY DIFFERENTIATORS TO EMPHASIZE:                                        │
│    ✓ Hands-on VM sandboxes, NOT multiple-choice slides.                     │
│    ✓ Strict 5-Step SOC containment report before flag is unlocked.          │
│    ✓ Zero-trust client/server URL & threat interception engine.             │
│    ✓ Unified canonical root flags: FLAG{<ID>_<CATEGORY>_DEFENDED}.          │
│    ✓ Production stack: React, TypeScript, Tailwind, Firebase, Vite.         │
└─────────────────────────────────────────────────────────────────────────────┘
```
