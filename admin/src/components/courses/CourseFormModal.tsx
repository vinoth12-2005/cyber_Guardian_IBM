import React, { useState, useRef } from 'react';
import { adminApi } from '../../lib/api';
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  CheckCircle2,
  Save,
  FileUp,
  Sparkles,
  Upload,
  Video,
  Image as ImageIcon,
  RotateCw,
  Eye,
  AlertTriangle,
  FileText,
  Send,
  Radio,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Award,
} from 'lucide-react';

interface CourseFormModalProps {
  course?: any | null; // If null, mode is Create; otherwise mode is Edit
  initialTab?: 'info' | 'curriculum' | 'quiz' | 'pdf';
  onClose: () => void;
  onSaved: () => void;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  course,
  initialTab = 'info',
  onClose,
  onSaved,
}) => {
  const isEditing = !!course;

  const [activeTab, setActiveTab] = useState<'info' | 'curriculum' | 'quiz' | 'pdf'>(initialTab);

  const [title, setTitle] = useState(course?.title || '');
  const [id, setId] = useState(course?.id || '');
  const [cat, setCat] = useState(course?.cat || 'Phishing');
  const [level, setLevel] = useState(course?.level || 'Beginner');
  const [duration, setDuration] = useState(course?.duration || '4-6 hours');
  const [provider, setProvider] = useState(course?.provider || 'CyberGuardian Institute');
  const [desc, setDesc] = useState(course?.desc || course?.desc_text || '');
  const [objectives, setObjectives] = useState<string>(
    Array.isArray(course?.objectives) ? course.objectives.join('\n') : ''
  );
  const [skillsGained, setSkillsGained] = useState<string>(
    Array.isArray(course?.skillsGained) ? course.skillsGained.join('\n') : ''
  );
  const [bannerImage, setBannerImage] = useState(course?.bannerImage || '');
  const [status, setStatus] = useState<'draft' | 'published'>(course?.status || 'published');
  const [sourceDocName, setSourceDocName] = useState(course?.sourceDocName || '');
  const [credentialEligible, setCredentialEligible] = useState<boolean>(
    course?.credentialEligible !== false
  );
  const [credentialName, setCredentialName] = useState<string>(
    course?.credentialName || (course?.title ? `${course.title} Specialist Certification` : 'Cybersecurity Specialist Certification')
  );

  // PDF Generation State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [extractedImages, setExtractedImages] = useState<any[]>([]);
  const [pdfStats, setPdfStats] = useState<any | null>(null);

  // Uploading media state
  const [uploadingMedia, setUploadingMedia] = useState<{ [key: string]: boolean }>({});

  // Active flip card preview states: { [lessonKey]: boolean }
  const [previewFlipped, setPreviewFlipped] = useState<{ [key: string]: boolean }>({});

  // Accordion expansion states for clean, organized navigation
  const [expandedModules, setExpandedModules] = useState<{ [mi: number]: boolean }>({ 0: true });
  const [expandedLessons, setExpandedLessons] = useState<{ [key: string]: boolean }>({ '0-0': true });
  const [pdfSynthesisSuccess, setPdfSynthesisSuccess] = useState(false);

  // Modules & Lessons
  const [modules, setModules] = useState<any[]>(
    course?.modules && course.modules.length > 0
      ? course.modules
      : [
          {
            title: 'Module 1: Threat Fundamentals & Overview',
            desc: 'Core operational concepts and threat actor methodology.',
            duration: '2 hours',
            lessons: [
              {
                title: 'Introduction to Vectors & Detection',
                type: 'reading',
                dur: '6 min',
                body: 'Detailed technical analysis of threat vectors and defense protocols.',
                image: '',
                videoUrl: '',
                example: 'curl -s -I "https://domain.com"',
                realTimeExample: 'Real-world adversary attempt mitigated through DNS sinkholing.',
                points: ['Identify vector indicators', 'Apply defense mitigations'],
                flipCard: {
                  front: {
                    title: 'Inspect Beaconing Indicator',
                    scenario: 'System initiated periodic connections to unrecognized port.',
                    indicator: 'Suspicious Heartbeat',
                  },
                  back: {
                    title: 'Forensic Isolation',
                    analysis: 'Telemetry points to automated command and control poll.',
                    mitigation: 'Block port in boundary firewall and snapshot host RAM.',
                  },
                },
              },
            ],
          },
        ]
  );

  // Quizzes
  const [quiz, setQuiz] = useState<any[]>(
    course?.quiz && course.quiz.length > 0
      ? course.quiz
      : [
          {
            question: 'What is the primary indicator of attack in this scenario?',
            options: [
              'Option A - Legitimate communication',
              'Option B - Spoofed headers & unauthorized behavior',
              'Option C - System reboot',
              'Option D - Normal query volume',
            ],
            answer: 1,
            explanation: 'Option B correctly identifies the spoofed headers and abnormal activity.',
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── PDF Auto-Generation Engine ────────────────────────────────────────────
  const handleGenerateFromPdf = async () => {
    if (!pdfFile) {
      setError('Please select a PDF document first.');
      return;
    }

    setPdfGenerating(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);
      if (customInstructions) {
        formData.append('customInstructions', customInstructions);
      }

      const res = await adminApi.courses.generateFromPdf(formData);
      if (res.success && res.data) {
        const { courseBlueprint, extractedImages: imgs, stats } = res.data;
        if (courseBlueprint) {
          setTitle(courseBlueprint.title || '');
          if (!isEditing) {
            setId(
              (courseBlueprint.title || 'course')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            );
          }
          if (courseBlueprint.cat) setCat(courseBlueprint.cat);
          if (courseBlueprint.level) setLevel(courseBlueprint.level);
          if (courseBlueprint.duration) setDuration(courseBlueprint.duration);
          if (courseBlueprint.desc) setDesc(courseBlueprint.desc);
          if (courseBlueprint.objectives) setObjectives(courseBlueprint.objectives.join('\n'));
          if (courseBlueprint.skillsGained) setSkillsGained(courseBlueprint.skillsGained.join('\n'));
          if (courseBlueprint.bannerImage) setBannerImage(courseBlueprint.bannerImage);
          if (courseBlueprint.credentialName) setCredentialName(courseBlueprint.credentialName);
          if (courseBlueprint.credentialEligible !== undefined) setCredentialEligible(!!courseBlueprint.credentialEligible);
          if (Array.isArray(courseBlueprint.modules)) setModules(courseBlueprint.modules);
          if (Array.isArray(courseBlueprint.quiz)) setQuiz(courseBlueprint.quiz);
          setSourceDocName(res.data.sourceDocName || pdfFile.name);
          setStatus('draft'); // Generated courses default to staging draft mode
        }

        if (Array.isArray(imgs)) {
          setExtractedImages(imgs);
        }
        if (stats) {
          setPdfStats(stats);
        }

        setPdfSynthesisSuccess(true);
        setExpandedModules({ 0: true });
        setExpandedLessons({ '0-0': true });
      } else {
        setError(res.error?.message || 'Failed to synthesize course from PDF');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during PDF synthesis');
    } finally {
      setPdfGenerating(false);
    }
  };

  // ── Media Upload Handler (Video or Image) ──────────────────────────────────
  const handleUploadMediaFile = async (
    file: File,
    callback: (url: string, isVideo: boolean) => void,
    key: string
  ) => {
    setUploadingMedia((prev) => ({ ...prev, [key]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.courses.uploadMedia(formData);
      if (res.success && res.data) {
        callback(res.data.url, res.data.isVideo);
      } else {
        alert(res.error?.message || 'Failed to upload media file');
      }
    } catch (err: any) {
      alert(err.message || 'Error uploading file');
    } finally {
      setUploadingMedia((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleAddModule = () => {
    setModules([
      ...modules,
      {
        title: `Module ${modules.length + 1}: Advanced Hardening`,
        desc: 'Practical defensive countermeasures and implementation rules.',
        duration: '1-2 hours',
        lessons: [
          {
            title: 'Defensive Implementation & Inspection',
            type: 'reading',
            dur: '5 min',
            body: 'Key controls and validation steps for enterprise security hygiene.',
            points: ['Enforce zero trust validation', 'Audit telemetry logs'],
            flipCard: {
              front: {
                title: 'Suspicious Log Artifact',
                scenario: 'Multiple failed logins followed immediately by sudo privilege elevation.',
                indicator: 'Brute Force Escalation',
              },
              back: {
                title: 'Containment Procedure',
                analysis: 'Adversary successfully guessed service account password.',
                mitigation: 'Revoke sudo access, rotate account secret, and require hardware MFA.',
              },
            },
          },
        ],
      },
    ]);
  };

  const handleAddLesson = (modIndex: number) => {
    const updated = [...modules];
    updated[modIndex].lessons.push({
      title: `Lesson ${updated[modIndex].lessons.length + 1}: Tactical Exercise`,
      type: 'reading',
      dur: '5 min',
      body: 'Operational procedure and detection methodology.',
      points: ['Verify integrity hashes', 'Isolate compromised endpoints'],
      flipCard: {
        front: {
          title: 'Threat Indicator Inspection',
          scenario: 'Unusual outbound HTTP POST payload containing base64 string.',
          indicator: 'Data Exfiltration Alert',
        },
        back: {
          title: 'Remediation Protocol',
          analysis: 'Data payload matched corporate database column headers.',
          mitigation: 'Terminate active session, block IP destination, and trigger DLP incident alert.',
        },
      },
    });
    setModules(updated);
  };

  const handleAddQuizQuestion = () => {
    setQuiz([
      ...quiz,
      {
        question: 'Which action should be taken immediately upon identifying this vulnerability?',
        options: [
          'Ignore until next month',
          'Revoke permissions, isolate asset, and patch endpoint',
          'Restart the local computer',
          'Disable firewall logging',
        ],
        answer: 1,
        explanation: 'Revoking permissions and isolating the asset prevents lateral spread.',
      },
    ]);
  };

  // ── Save / Publish Handler ────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent, targetStatus?: 'draft' | 'published') => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Course title is required.');
      return;
    }

    const finalStatus = targetStatus || status;

    const payload = {
      id: id.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: title.trim(),
      cat,
      level,
      duration: duration.trim() || '4-6 hours',
      provider: provider.trim() || 'CyberGuardian Institute',
      desc: desc.trim(),
      objectives: objectives.split('\n').map((o) => o.trim()).filter(Boolean),
      skillsGained: skillsGained.split('\n').map((s) => s.trim()).filter(Boolean),
      bannerImage: bannerImage.trim() || null,
      credentialEligible,
      credentialName: credentialName.trim() || `${title.trim()} Specialist Certification`,
      status: finalStatus,
      sourceDocName: sourceDocName || (pdfFile ? pdfFile.name : null),
      modules,
      quiz,
    };

    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        const res = await adminApi.courses.update(course.id, payload);
        if (res.success) {
          onSaved();
          onClose();
        } else {
          setError(res.error?.message || 'Failed to update course');
        }
      } else {
        const res = await adminApi.courses.create(payload);
        if (res.success) {
          onSaved();
          onClose();
        } else {
          setError(res.error?.message || 'Failed to create course');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {isEditing ? `Customize: ${course.title}` : 'Cybersecurity Course Studio'}
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    status === 'draft'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {status === 'draft' ? 'Draft Mode' : 'Live / Published'}
                </span>
                {sourceDocName && (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    Source: {sourceDocName}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                AI PDF Course Ingestion · Video & Diagram Integration · 3D Threat Flip Cards · Proctored Quiz
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 gap-2 text-xs font-mono overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('pdf')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'pdf'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>✨ AI Ingest from PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Metadata & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curriculum')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'curriculum'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Curriculum & Flip Cards ({modules.length} Mods)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`py-3 px-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'quiz'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Proctored Quiz ({quiz.length} Qs)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e)} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* TAB 0: AI Ingest from PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <FileUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      AI PDF Document to Course Synthesizer
                    </h3>
                    <p className="text-xs text-slate-400">
                      Upload any cybersecurity whitepaper, threat report, or policy PDF. FlotBot extracts text, pulls diagram images, structures modules, builds 3D flip cards, and generates proctored quiz questions.
                    </p>
                  </div>
                </div>

                {/* PDF File Picker */}
                <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-6 text-center bg-slate-950/50 transition-colors">
                  <input
                    type="file"
                    id="course-pdf-input"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setPdfFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="course-pdf-input" className="cursor-pointer space-y-2 block">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
                      <Upload className="w-5 h-5" />
                    </div>
                    {pdfFile ? (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-cyan-300 block font-mono">
                          📄 {pdfFile.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to analyze
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-200 block">
                          Click to select or drop a PDF document
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Supports up to 50MB (Threat reports, ISO manuals, breach briefs)
                        </span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Custom Instructions */}
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Custom FlotBot Instructions (Optional)
                  </label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    rows={2}
                    placeholder="e.g. Focus specifically on ransomware response playbooks and cloud lateral movement..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                {/* Synthesis Trigger Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] font-mono text-slate-400">
                    {pdfGenerating ? (
                      <span className="text-cyan-400 animate-pulse flex items-center gap-1.5">
                        <RotateCw className="w-3 h-3 animate-spin" /> Analyzing text & extracting embedded images...
                      </span>
                    ) : (
                      <span>Synthesizes draft for staging review before publishing</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={!pdfFile || pdfGenerating}
                    onClick={handleGenerateFromPdf}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{pdfGenerating ? 'Synthesizing Curriculum...' : 'Auto-Generate Course'}</span>
                  </button>
                </div>
              </div>

              {/* Extraction Telemetry & Extracted Images Gallery */}
              {pdfStats && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">Extraction Telemetry</span>
                    <span className="text-slate-400">
                      {pdfStats.pageCount} Pages · {pdfStats.charCount} Chars · {pdfStats.imagesFound} Images Extracted
                    </span>
                  </div>

                  {extractedImages.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400 block">
                        Extracted Diagram Images (Click to set as Course Banner):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {extractedImages.map((img, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setBannerImage(img.url);
                              alert(`Set Image ${i + 1} as Course Banner!`);
                            }}
                            className={`rounded-lg overflow-hidden border p-1 bg-slate-900 cursor-pointer hover:border-cyan-400 transition-all ${
                              bannerImage === img.url ? 'border-cyan-400 ring-2 ring-cyan-400/30' : 'border-slate-800'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-20 object-cover rounded"
                            />
                            <span className="text-[9px] font-mono text-slate-400 block text-center truncate mt-1">
                              Image {i + 1} ({Math.round(img.sizeBytes / 1024)} KB)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PDF Synthesis Success Card */}
              {pdfSynthesisSuccess && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-slate-900 to-indigo-950/50 border border-emerald-500/40 space-y-4 shadow-xl shadow-emerald-950/20 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>🎉 Curriculum Synthesized Successfully!</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                            Ready to Deploy
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          FlotBot analyzed your PDF and generated {modules.length} comprehensive modules with {modules.flatMap((m) => m.lessons || []).length} lessons, 3D flip cards, and proctored assessment questions.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">COURSE TITLE</span>
                      <span className="text-white font-bold truncate block">{title || 'Cybersecurity Course'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">CATEGORY & LEVEL</span>
                      <span className="text-cyan-400 font-semibold">{cat} · {level}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">MODULES & LESSONS</span>
                      <span className="text-indigo-400 font-semibold">{modules.length} Mods ({modules.flatMap((m) => m.lessons || []).length} Lessons)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase">PROCTORED QUIZ</span>
                      <span className="text-amber-400 font-semibold">{quiz.length} Questions</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('curriculum')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer"
                    >
                      <span>✏️ Review & Edit Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={(e) => handleSubmit(e, 'published')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{saving ? 'Publishing...' : '🚀 Publish Live to Students Now'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: General Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Course Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!isEditing && !id) {
                        setId(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Zero Trust Architecture Fundamentals"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Course ID / Slug</label>
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    disabled={isEditing}
                    placeholder="e.g. zero-trust-fund"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Category</label>
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Phishing">Phishing</option>
                    <option value="Network">Network Security</option>
                    <option value="Malware">Malware Defense</option>
                    <option value="Cloud">Cloud Security</option>
                    <option value="Cryptography">Cryptography</option>
                    <option value="Incident Response">Incident Response</option>
                    <option value="Social Engineering">Social Engineering</option>
                    <option value="Identity & Access">Identity & Access</option>
                    <option value="Web Security">Web Security</option>
                    <option value="Compliance">Compliance & Governance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Proficiency Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 4-6 hours"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Lifecycle Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    <option value="published">Published (Live to Students)</option>
                    <option value="draft">Draft (Admin Staging Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Banner Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://... or /uploads/courses/banner.jpg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 cursor-pointer border border-slate-700 whitespace-nowrap flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleUploadMediaFile(
                            e.target.files[0],
                            (url) => setBannerImage(url),
                            'banner'
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Course Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={3}
                  placeholder="Comprehensive summary of course scope, threat models explored, and outcomes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Learning Objectives (1 per line)
                  </label>
                  <textarea
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    rows={4}
                    placeholder="Master authentication handshake verification&#10;Implement least privilege policies&#10;Identify anomalies in telemetry logs"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Skills Gained (1 per line)
                  </label>
                  <textarea
                    value={skillsGained}
                    onChange={(e) => setSkillsGained(e.target.value)}
                    rows={4}
                    placeholder="Network Packet Inspection&#10;Zero Trust Architecture&#10;Heuristic Threat Detection"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Verified Credential & Certification Settings */}
              <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Verified Professional Credential & Certification</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={credentialEligible}
                      onChange={(e) => setCredentialEligible(e.target.checked)}
                      className="accent-indigo-500 rounded"
                    />
                    <span>Eligible for Certificate</span>
                  </label>
                </div>
                {credentialEligible && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Certificate Credential Title (Awarded upon 100% completion & passing final assessment)
                    </label>
                    <input
                      type="text"
                      value={credentialName}
                      onChange={(e) => setCredentialName(e.target.value)}
                      placeholder="e.g. Zero-Trust Architecture Specialist Certification"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-amber-300 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Curriculum (Modules, Lessons, Video, 3D Flip Card) */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Configure modules, lesson reading text, video lectures, and interactive 3D threat flip cards.
                </span>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Module</span>
                </button>
              </div>

              {modules.map((mod, mi) => {
                const isModExpanded = expandedModules[mi] !== false;
                return (
                  <div key={mi} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4 transition-all">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <span className="h-6 w-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {mi + 1}
                        </span>
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const updated = [...modules];
                            updated[mi].title = e.target.value;
                            setModules(updated);
                          }}
                          placeholder="Module Title"
                          className="bg-transparent border-b border-slate-700 text-xs font-bold text-white px-1 py-0.5 w-full focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 whitespace-nowrap hidden sm:inline shrink-0">
                          {mod.lessons?.length || 0} Lessons
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedModules((prev) => ({
                              ...prev,
                              [mi]: !isModExpanded,
                            }));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {isModExpanded ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              <span className="text-[10px]">Collapse</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              <span className="text-[10px]">Expand</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (modules.length <= 1) return;
                            setModules(modules.filter((_, idx) => idx !== mi));
                          }}
                          className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-950/40"
                          title="Delete Module"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {isModExpanded && (
                      <div className="space-y-4 animate-fade-in">
                        {/* Lessons in Module */}
                        <div className="pl-2 sm:pl-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-slate-400">Lessons ({mod.lessons?.length || 0})</span>
                            <button
                              type="button"
                              onClick={() => handleAddLesson(mi)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-mono cursor-pointer"
                            >
                              <Plus className="h-3 w-3" /> Add Lesson
                            </button>
                          </div>

                          {mod.lessons?.map((les: any, li: number) => {
                            const lessonKey = `${mi}-${li}`;
                            const isLesExpanded = expandedLessons[lessonKey] !== false;
                            return (
                              <div
                                key={li}
                                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-inner"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                                      L{li + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={les.title}
                                      onChange={(e) => {
                                        const updated = [...modules];
                                        updated[mi].lessons[li].title = e.target.value;
                                        setModules(updated);
                                      }}
                                      placeholder="Lesson Title"
                                      className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-semibold text-slate-100 flex-1 focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={les.dur || '5 min'}
                                    onChange={(e) => {
                                      const updated = [...modules];
                                      updated[mi].lessons[li].dur = e.target.value;
                                      setModules(updated);
                                    }}
                                    placeholder="Duration"
                                    className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-400 w-20 font-mono text-center shrink-0"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedLessons((prev) => ({
                                        ...prev,
                                        [lessonKey]: !isLesExpanded,
                                      }));
                                    }}
                                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 font-mono transition-colors cursor-pointer shrink-0"
                                    title={isLesExpanded ? 'Collapse Lesson' : 'Edit Details'}
                                  >
                                    {isLesExpanded ? (
                                      <>
                                        <ChevronUp className="h-3 w-3" />
                                        <span className="hidden sm:inline text-[10px]">Collapse</span>
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-3 w-3" />
                                        <span className="hidden sm:inline text-[10px]">Edit Details</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...modules];
                                      updated[mi].lessons = updated[mi].lessons.filter((_: any, idx: number) => idx !== li);
                                      setModules(updated);
                                    }}
                                    className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>

                                {isLesExpanded && (
                                  <div className="space-y-3 pt-2 border-t border-slate-800/80 animate-fade-in">

                          {/* Lesson Main Body */}
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 mb-1">
                              Lesson Content (Markdown)
                            </label>
                            <textarea
                              value={les.body}
                              onChange={(e) => {
                                const updated = [...modules];
                                updated[mi].lessons[li].body = e.target.value;
                                setModules(updated);
                              }}
                              rows={3}
                              placeholder="Detailed technical lesson material..."
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                            />
                          </div>

                          {/* Lesson Media (Image & Video URL) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Image Field */}
                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                                <span>Diagram / Image URL</span>
                                <label className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 text-[10px]">
                                  <Upload className="w-2.5 h-2.5" /> Upload File
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleUploadMediaFile(
                                          e.target.files[0],
                                          (url) => {
                                            const updated = [...modules];
                                            updated[mi].lessons[li].image = url;
                                            setModules(updated);
                                          },
                                          `img-${lessonKey}`
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              </label>
                              <input
                                type="text"
                                value={les.image || ''}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[mi].lessons[li].image = e.target.value;
                                  setModules(updated);
                                }}
                                placeholder="/uploads/courses/... or https://..."
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                              />
                            </div>

                            {/* Video Field */}
                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Video className="w-3 h-3 text-cyan-400" /> Video URL / Lecture
                                </span>
                                <label className="text-cyan-400 hover:text-cyan-300 cursor-pointer flex items-center gap-1 text-[10px]">
                                  <Upload className="w-2.5 h-2.5" /> Upload Video
                                  <input
                                    type="file"
                                    accept="video/mp4,video/webm"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleUploadMediaFile(
                                          e.target.files[0],
                                          (url) => {
                                            const updated = [...modules];
                                            updated[mi].lessons[li].videoUrl = url;
                                            setModules(updated);
                                          },
                                          `vid-${lessonKey}`
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              </label>
                              <input
                                type="text"
                                value={les.videoUrl || ''}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  updated[mi].lessons[li].videoUrl = e.target.value;
                                  setModules(updated);
                                }}
                                placeholder="/uploads/courses/video.mp4 or YouTube URL"
                                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 font-mono"
                              />
                            </div>
                          </div>

                          {/* Interactive 3D Flip Card Builder */}
                          <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-2 mt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Interactive 3D Threat Flip Card</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewFlipped((prev) => ({
                                    ...prev,
                                    [lessonKey]: !prev[lessonKey],
                                  }));
                                }}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCw className="w-2.5 h-2.5" /> Flip Card Live Preview
                              </button>
                            </div>

                            {/* Live Card Preview Box */}
                            <div className="border border-slate-800 rounded-lg p-3 bg-slate-900/60">
                              {!previewFlipped[lessonKey] ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                                    [Front Face]: {les.flipCard?.front?.title || 'Inspect Signal'}
                                  </span>
                                  <p className="text-xs text-slate-200">
                                    {les.flipCard?.front?.scenario || 'Prompt scenario...'}
                                  </p>
                                  <span className="text-[11px] text-amber-300 block">
                                    Flag: {les.flipCard?.front?.indicator || 'Indicator'}
                                  </span>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                                    [Back Face]: {les.flipCard?.back?.title || 'Forensic Breakdown'}
                                  </span>
                                  <p className="text-xs text-slate-300">
                                    {les.flipCard?.back?.analysis || 'Technical analysis...'}
                                  </p>
                                  <span className="text-[11px] text-emerald-300 block">
                                    Action: {les.flipCard?.back?.mitigation || 'Mitigation step'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Front Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <input
                                type="text"
                                value={les.flipCard?.front?.title || ''}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  if (!updated[mi].lessons[li].flipCard) {
                                    updated[mi].lessons[li].flipCard = { front: {}, back: {} };
                                  }
                                  updated[mi].lessons[li].flipCard.front.title = e.target.value;
                                  setModules(updated);
                                }}
                                placeholder="Front: Card Title"
                                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200"
                              />
                              <input
                                type="text"
                                value={les.flipCard?.front?.indicator || ''}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  if (!updated[mi].lessons[li].flipCard) {
                                    updated[mi].lessons[li].flipCard = { front: {}, back: {} };
                                  }
                                  updated[mi].lessons[li].flipCard.front.indicator = e.target.value;
                                  setModules(updated);
                                }}
                                placeholder="Front: Threat Indicator (e.g. Spoofed Domain)"
                                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-amber-300"
                              />
                            </div>
                            <input
                              type="text"
                              value={les.flipCard?.front?.scenario || ''}
                              onChange={(e) => {
                                const updated = [...modules];
                                if (!updated[mi].lessons[li].flipCard) {
                                  updated[mi].lessons[li].flipCard = { front: {}, back: {} };
                                }
                                updated[mi].lessons[li].flipCard.front.scenario = e.target.value;
                                setModules(updated);
                              }}
                              placeholder="Front: Scenario prompt describing what the student sees..."
                              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                            />

                            {/* Back Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <input
                                type="text"
                                value={les.flipCard?.back?.analysis || ''}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  if (!updated[mi].lessons[li].flipCard) {
                                    updated[mi].lessons[li].flipCard = { front: {}, back: {} };
                                  }
                                  updated[mi].lessons[li].flipCard.back.analysis = e.target.value;
                                  setModules(updated);
                                }}
                                placeholder="Back: Technical analysis & forensic breakdown"
                                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300"
                              />
                              <input
                                type="text"
                                value={les.flipCard?.back?.mitigation || ''}
                                onChange={(e) => {
                                  const updated = [...modules];
                                  if (!updated[mi].lessons[li].flipCard) {
                                    updated[mi].lessons[li].flipCard = { front: {}, back: {} };
                                  }
                                  updated[mi].lessons[li].flipCard.back.mitigation = e.target.value;
                                  setModules(updated);
                                }}
                                placeholder="Back: Remediation & defense action"
                                className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-emerald-300"
                              />
                            </div>
                          </div>

                          {/* Topic Knowledge Check Question Editor */}
                          <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-3 mt-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Lesson Quick Knowledge Check</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...modules];
                                  if (!Array.isArray(updated[mi].lessons[li].knowledgeCheck)) {
                                    updated[mi].lessons[li].knowledgeCheck = [];
                                  }
                                  updated[mi].lessons[li].knowledgeCheck.push({
                                    q: 'Question on this lesson topic...',
                                    question: 'Question on this lesson topic...',
                                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                                    answer: 0,
                                    explanation: 'Explanation of correct answer.',
                                  });
                                  setModules(updated);
                                }}
                                className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" /> Add Question
                              </button>
                            </div>

                            {(!les.knowledgeCheck || les.knowledgeCheck.length === 0) ? (
                              <p className="text-[11px] text-slate-500 italic">
                                No knowledge check for this lesson yet. Click "Add Question" to include an interactive check.
                              </p>
                            ) : (
                              les.knowledgeCheck.map((kc: any, kci: number) => (
                                <div key={kci} className="border border-slate-800 rounded-lg p-3 bg-slate-900/60 space-y-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[11px] font-mono font-bold text-cyan-400">KC Q{kci + 1}.</span>
                                    <input
                                      type="text"
                                      value={kc.q || kc.question || ''}
                                      onChange={(e) => {
                                        const updated = [...modules];
                                        updated[mi].lessons[li].knowledgeCheck[kci].q = e.target.value;
                                        updated[mi].lessons[li].knowledgeCheck[kci].question = e.target.value;
                                        setModules(updated);
                                      }}
                                      placeholder="Interactive scenario question prompt..."
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-100"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...modules];
                                        updated[mi].lessons[li].knowledgeCheck = updated[mi].lessons[li].knowledgeCheck.filter((_: any, idx: number) => idx !== kci);
                                        setModules(updated);
                                      }}
                                      className="text-slate-500 hover:text-rose-400 p-1"
                                      title="Remove Knowledge Check"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>

                                  {/* Options with radio button for answer */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                                    {(kc.options || []).map((opt: string, oi: number) => (
                                      <div key={oi} className="flex items-center gap-1.5">
                                        <input
                                          type="radio"
                                          name={`kc-answer-${mi}-${li}-${kci}`}
                                          checked={kc.answer === oi}
                                          onChange={() => {
                                            const updated = [...modules];
                                            updated[mi].lessons[li].knowledgeCheck[kci].answer = oi;
                                            setModules(updated);
                                          }}
                                          className="accent-cyan-500"
                                        />
                                        <input
                                          type="text"
                                          value={opt}
                                          onChange={(e) => {
                                            const updated = [...modules];
                                            updated[mi].lessons[li].knowledgeCheck[kci].options[oi] = e.target.value;
                                            setModules(updated);
                                          }}
                                          placeholder={`Option ${oi + 1}`}
                                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-300"
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pl-4">
                                    <input
                                      type="text"
                                      value={kc.explanation || ''}
                                      onChange={(e) => {
                                        const updated = [...modules];
                                        updated[mi].lessons[li].knowledgeCheck[kci].explanation = e.target.value;
                                        setModules(updated);
                                      }}
                                      placeholder="Explanation of the correct answer and remediation protocol..."
                                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-400 font-mono"
                                    />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    })}
            </div>
          )}

          {/* TAB 3: Quiz Assessment */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-300 font-bold block">
                    Unstop-Style Proctored Assessment Questions
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Questions run in fullscreen lockdown with tab-switch tracking, anti-copy enforcement, and strict timer.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuizQuestion}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              {quiz.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">Q{qi + 1}.</span>
                    <input
                      type="text"
                      value={q.question || q.q || ''}
                      onChange={(e) => {
                        const updated = [...quiz];
                        updated[qi].question = e.target.value;
                        setQuiz(updated);
                      }}
                      placeholder="Question prompt..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (quiz.length <= 1) return;
                        setQuiz(quiz.filter((_, idx) => idx !== qi));
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6">
                    {(q.options || []).map((opt: string, oi: number) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${qi}`}
                          checked={q.answer === oi}
                          onChange={() => {
                            const updated = [...quiz];
                            updated[qi].answer = oi;
                            setQuiz(updated);
                          }}
                          className="accent-indigo-500"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const updated = [...quiz];
                            updated[qi].options[oi] = e.target.value;
                            setQuiz(updated);
                          }}
                          placeholder={`Option ${oi + 1}`}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pl-6">
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => {
                        const updated = [...quiz];
                        updated[qi].explanation = e.target.value;
                        setQuiz(updated);
                      }}
                      placeholder="Explanation for the correct answer and defensive protocol..."
                      className="w-full bg-slate-900/60 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-400 font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Controls: Save as Draft vs. Publish Live */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, 'draft')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save as Draft</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, 'published')}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving...' : isEditing ? 'Publish Updates' : 'Publish Live Course'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
