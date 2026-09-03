# 🛡️ CyberGuardian AI — Course Creation, PDF Ingestion & Proctored Assessment Manual

This comprehensive guide details the architecture, authoring workflows, media integration guidelines, and proctored assessment specifications for creating courses in the **CyberGuardian AI Unified Platform**.

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Course Creation Methods](#2-course-creation-methods)
   - [Method A: AI Ingestion from PDF Document](#method-a-ai-ingestion-from-pdf-document)
   - [Method B: Manual Course Authoring](#method-b-manual-course-authoring)
3. [Media Integration & Video Uploads](#3-media-integration--video-uploads)
4. [Interactive 3D Threat Flip Cards](#4-interactive-3d-threat-flip-cards)
5. [Unstop-Style Proctored Assessment Suite](#5-unstop-style-proctored-assessment-suite)
6. [Draft Staging vs. Live Publishing Workflow](#6-draft-staging-vs-live-publishing-workflow)
7. [Database Schema & REST API Reference](#7-database-schema--rest-api-reference)

---

## 1. System Overview & Architecture

The CyberGuardian platform provides a multi-tier course management and delivery system:
- **Admin Studio** (`admin/` running on port 5174): Accessible to `SUPER_ADMIN`, `PLATFORM_ADMIN`, and `COURSE_ADMIN` roles.
- **Unified Express Backend** (`server/` running on port 5000): Handles PDF byte stream parsing, image extraction, Ollama curriculum synthesis, disk storage for video lectures, and PostgreSQL persistence.
- **Learner App** (`src/` running on port 5173): Delivers responsive reading material, video lectures, 3D flip card animations, and proctored assessments.

```
┌────────────────────────┐
│ Course Admin / Creator │
└───────────┬────────────┘
            │ 1. Upload PDF (whitepaper, policy, slides)
            ▼
┌────────────────────────────────────────────────────────┐
│  server/services/pdfCourseService.js                   │
│  - pdf-parse extracts full text & metadata             │
│  - Stream scanner extracts embedded JPEG/PNG diagrams   │
│  - FlotBot AI synthesizes modules, lessons & quizzes   │
└───────────┬────────────────────────────────────────────┘
            │ 2. JSON Course Blueprint + Extracted Media
            ▼
┌────────────────────────────────────────────────────────┐
│  Course Studio (CourseFormModal.tsx)                   │
│  - Review metadata, duration, category & level         │
│  - Upload/embed video lectures (.mp4, .webm, YouTube)  │
│  - Configure interactive 3D threat flip cards          │
│  - Inspect / customize proctored assessment questions  │
│  - Choose "Save as Draft" or "Publish Live"            │
└───────────┬────────────────────────────────────────────┘
            │ 3. Database Persistence (PostgreSQL)
            ▼
┌────────────────────────────────────────────────────────┐
│  Learner Interface (LessonView.tsx & QuizView.tsx)     │
│  - Video player & figure diagrams                      │
│  - Interactive 3D flip card threat inspector           │
│  - Fullscreen lockdown proctored exam (Unstop-style)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Course Creation Methods

### Method A: AI Ingestion from PDF Document

Course Admins can automatically convert existing PDF documents (e.g. NIST guidance, OWASP reports, incident handling playbooks, company security policies) into courses with 3-4 modules, technical lessons, real-world breach case studies, and assessment quizzes.

#### Steps:
1. Navigate to the **Admin Portal** &rarr; **Course Curriculum Management**.
2. Click **"✨ Generate from PDF"** (or open Course Studio and switch to the **✨ AI Ingest from PDF** tab).
3. Click the dropzone to select your `.pdf` document (up to 50MB).
4. *(Optional)* Provide **Custom FlotBot Instructions** to steer the generated curriculum:
   - *Example*: `"Focus specifically on cloud lateral movement and IAM privilege escalation mitigation."*
5. Click **"Auto-Generate Course"**:
   - The backend reads the document byte streams.
   - Text is extracted, cleaned, and summarized into technical sections.
   - Any embedded diagrams and figures are carved out and stored in `/uploads/courses/`.
   - FlotBot synthesizes complete modules, reading lessons, code payloads, real-time breach examples, 3D threat flip cards, and multiple-choice assessment questions.
6. Once complete, the Studio automatically navigates to **Curriculum & Flip Cards** for your inspection and customization.
7. Click **"Save as Draft"** to keep in staging, or **"Publish Live Course"** to deploy immediately.

---

### Method B: Manual Course Authoring

For full control, instructors can manually create or modify every aspect of a course:

1. In the **Admin Portal**, click **"+ Add Course"**.
2. **Tab 1 — Metadata & Details**:
   - **Course Title**: Descriptive title (e.g. *Advanced API Security & Token Tampering*).
   - **Slug / ID**: Auto-generated or custom URL-safe identifier (e.g. `advanced-api-sec`).
   - **Category**: Select from `Phishing`, `Network`, `Malware`, `Cloud`, `Cryptography`, `Incident Response`, `Social Engineering`, `Identity & Access`, `Web Security`, `Compliance & Governance`.
   - **Proficiency Level**: `Beginner`, `Intermediate`, or `Advanced`.
   - **Estimated Duration**: e.g., `4-6 hours`.
   - **Lifecycle Status**: Choose `Published` or `Draft`.
   - **Banner Image URL**: Enter an image URL or click **Upload** to upload an image from your computer.
   - **Description**: 2-3 sentence overview of target competencies.
   - **Learning Objectives & Skills Gained**: Enter one line per objective/skill.
3. **Tab 2 — Curriculum & Flip Cards**:
   - Add modules and lessons.
   - For each lesson, supply:
     - **Title & Duration**: e.g., *JWT Signature Verification Bypass* (8 min).
     - **Lesson Content**: In-depth markdown explanation.
     - **Diagram / Image**: Direct image link or upload button.
     - **Video URL**: Local uploaded video (`.mp4`, `.webm`) or external URL.
     - **Interactive 3D Threat Flip Card**: Configure front scenario & back mitigation.
4. **Tab 3 — Proctored Quiz**:
   - Add scenario questions, four options, correct answer index, and an explanation.
5. Click **"Save as Draft"** or **"Publish Live Course"**.

---

## 3. Media Integration & Video Uploads

CyberGuardian supports high-resolution diagrams and video lectures directly embedded within lesson modules:

### Supported Video Formats:
- **Direct Video Uploads**: `.mp4`, `.webm`, `.mov`, `.mkv` (up to 150MB). Files are uploaded to `public/uploads/courses/` and served statically via Express at `/uploads/courses/<filename>`.
- **Streaming & External Embeds**: YouTube embed links (`https://www.youtube.com/embed/...`), Vimeo embed links, or any HTTPS `.mp4` stream.

### How to Add a Video to a Lesson:
1. In the **Course Studio**, switch to the **Curriculum & Flip Cards** tab.
2. Under the target lesson, find the **Video URL / Lecture** section.
3. **Option 1**: Click **"Upload Video"**, select your video file. The system uploads it and populates the field with `/uploads/courses/<filename>`.
4. **Option 2**: Paste a YouTube/Vimeo embed URL directly into the input box.
5. In the student view (`LessonView.tsx`), the lecture is rendered in an optimized 16:9 player with HTML5 controls or embedded iframe.

### Extracted Images from PDF:
When generating from a PDF, all extracted figures appear in the **Extracted Diagram Images** gallery. Admins can click any image to set it as the **Course Banner** or copy its URL to attach it to any specific lesson.

---

## 4. Interactive 3D Threat Flip Cards

Every lesson can feature an **Interactive 3D Threat Inspector Flip Card**. Flip cards reinforce cognitive retention through a two-sided investigative model:

### Structure:
- **Front Face (Suspicious Signal / Indicator)**:
  - **Front Title**: e.g., *Anomalous Outbound Beaconing*
  - **Threat Scenario**: The realistic artifact or incident log observed by an analyst (e.g., *Host workstation 10.0.4.21 initiated recurring 60-second HTTP POST requests to an unknown IP in an unregistered country code.*)
  - **Flag / Indicator**: The specific signature to detect (e.g., *C2 Heartbeat Interval*)
- **Back Face (Forensic Breakdown & Defense)**:
  - **Back Title**: e.g., *Forensic Containment Protocol*
  - **Technical Analysis**: Deep-dive explanation of the attacker technique.
  - **Remediation Action**: Actionable containment steps (e.g., *Isolate host IP, dump volatile RAM, block external IP on egress perimeter.*)

### Student Experience:
In `LessonView.tsx`, the flip card renders with CSS 3D perspective (`rotateY(180deg)`). The student reads the initial suspicious signal on the front and clicks **"Flip to Reveal Forensic Breakdown"** to rotate the card in 3D and inspect the root cause and mitigation steps.

---

## 5. Unstop-Style Proctored Assessment Suite

The assessment engine (`QuizView.tsx`) enforces academic integrity modeled after competitive testing platforms like **Unstop**:

### Anti-Cheating Protections:
1. **Fullscreen Lockdown ("Sit to Run")**:
   - The test launches directly in fullscreen mode.
   - If the user presses `Esc` or attempts to exit fullscreen, a strike is recorded and a blocking warning overlay pauses the test.
2. **Tab Switch & Window Blur Detection**:
   - Utilizing the Page Visibility API (`document.hidden`) and `window.onblur`, the test detects when a user switches tabs, opens an external browser, or minimizes the window.
3. **Strict 3-Strike Warning Limit**:
   - **Strike 1**: Warning modal & sound chime: *"⚠️ Proctoring Strike 1/3: Browser tab switched or app minimized"*.
   - **Strike 2**: Critical warning modal: *"⚠️ Proctoring Strike 2/3: Warning — Next violation results in disqualification"*.
   - **Strike 3**: **Immediate Disqualification**: The exam auto-submits, score is recorded as 0%, and proctor status is set to `DISQUALIFIED`.
4. **Anti-Copy & Anti-Paste Enforcement**:
   - Text selection is disabled (`user-select: none`).
   - Right-click context menu is blocked (`contextmenu` intercepted).
   - Copying (`Ctrl+C`, `Cmd+C`), pasting (`Ctrl+V`), viewing source (`Ctrl+U`), and Developer Tools (`F12`, `Ctrl+Shift+I`) are intercepted and penalized with strikes.
5. **Non-Tamperable Countdown Timer**:
   - A synchronized 12-minute countdown timer runs continuously.
   - If the timer expires before completion, answers are automatically finalized and submitted.
6. **Integrity Watermarking & Audit Telemetry**:
   - An ambient security watermark (`ACADEMIC INTEGRITY PROCTORED EXAM`) is rendered across the examination viewport to deter camera photography or external screen recording.
   - Proctoring metrics (`strikes`, `timeSpentSeconds`, `proctorRating`) are included in the certification record upon passing.

---

## 6. Draft Staging vs. Live Publishing Workflow

Courses support two lifecycle states:

| Status | Learner Visibility | Admin Studio Visibility | Use Case |
| :--- | :--- | :--- | :--- |
| `draft` | **Hidden** (Not visible in student catalog) | **Visible** (Marked with amber "Draft" badge) | Staging newly AI-ingested PDF courses, attaching videos, fine-tuning quizzes before rollout. |
| `published` | **Live** (Visible to all enrolled students) | **Visible** (Marked with green "Live" badge) | Active courses with full enrollment and certification eligibility. |

### How to Publish a Draft Course:
- **From Course Studio**: Open the course modal, adjust settings, and click **"Publish Live Course"**.
- **Directly from Course List**: In `admin/src/components/courses/CourseListView.tsx`, draft courses feature a one-click **"Publish"** button.

---

## 7. Database Schema & REST API Reference

### Database Tables (PostgreSQL):
- `courses`:
  - `id` (VARCHAR PRIMARY KEY)
  - `title`, `cat`, `level`, `duration`, `provider`, `desc_text`
  - `banner_image`, `intro_video`
  - `status` (`'draft'` | `'published'`)
  - `created_by` (Admin user ID)
  - `source_doc_name` (Name of ingested PDF document)
  - `created_at`, `updated_at`
- `lessons`:
  - `id` (VARCHAR PRIMARY KEY)
  - `module_id`, `course_id`, `lesson_order`, `title`, `lesson_type`, `dur`, `body`
  - `image` (TEXT — Diagram or architectural figure)
  - `video_url` (TEXT — Local uploaded MP4/WebM or YouTube embed)
  - `flip_card` (TEXT JSON — Front scenario and back forensic analysis)
  - `example`, `real_time_example`, `points`, `activities`, `knowledge_check`
- `course_quizzes`:
  - `id` (VARCHAR PRIMARY KEY), `course_id`, `question`, `options`, `answer`, `explanation`, `question_order`

### REST API Endpoints:

#### Ingestion & Media:
- `POST /api/admin/courses/generate-from-pdf`
  - **Auth**: Admin (`SUPER_ADMIN`, `PLATFORM_ADMIN`, `COURSE_ADMIN`)
  - **Body**: Multipart form with `pdf` file and optional `customInstructions`.
  - **Returns**: `{ success: true, data: { courseBlueprint, extractedImages, sourceDocName, stats } }`
- `POST /api/admin/courses/upload-media`
  - **Auth**: Admin
  - **Body**: Multipart form with `file` (image or video).
  - **Returns**: `{ success: true, data: { url, filename, isVideo, sizeBytes } }`

#### Course CRUD & Publishing:
- `POST /api/admin/courses`
  - **Body**: Full course object with modules, lessons (with `videoUrl`, `flipCard`), and quizzes. Can set `status: 'draft'` or `'published'`.
- `PUT /api/admin/courses/:id`
  - **Body**: Updated course fields.
- `PUT /api/admin/courses/:id/publish`
  - Sets `status = 'published'` and logs audit action `COURSE_PUBLISHED`.
- `DELETE /api/admin/courses/:id`
  - Cascading deletion of course, modules, lessons, and quizzes.
- `GET /api/courses`
  - Query params: `cat`, `level`, `search`, `status`, `includeDrafts`.
  - Learners only receive published courses (`status = 'published'`); Admins can see drafts.
