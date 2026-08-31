import React, { useState, useRef } from 'react';
import type { Course } from '../../types/courses';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import {
  Lock,
  Plus,
  Trash2,
  Check,
  BookOpen,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

const ADMIN_PASSWORD = 'changeme123';

interface AdminViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  courses,
  onAddCourse,
  onDeleteCourse,
}) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [desc, setDesc] = useState('');
  const [color1, setColor1] = useState('#7C3AED');
  const [color2, setColor2] = useState('#38BDF8');
  const [icon, setIcon] = useState('shield');
  const [objectives, setObjectives] = useState('');
  const [introVideo, setIntroVideo] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [modules, setModules] = useState<Course['modules']>([]);
  const [quizQuestions, setQuizQuestions] = useState<Course['quiz']>([]);
  const [quizPreview, setQuizPreview] = useState('');

  const imageRef = useRef<HTMLInputElement>(null);
  const quizRef = useRef<HTMLInputElement>(null);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      toast.success('Admin authenticated');
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBannerImage(ev.target?.result as string);
      toast.success('Banner image loaded');
    };
    reader.readAsDataURL(file);
  };

  const handleQuizFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

        const questions: Course['quiz'] = rows
          .filter((r) => r[0] && String(r[0]).trim() !== '')
          .map((r) => ({
            q: String(r[0]).trim(),
            options: [r[1], r[2], r[3], r[4]].map((o) => String(o ?? '').trim()),
            answer: parseInt(r[5], 10) - 1,
            explanation: r[6] ? String(r[6]).trim() : '',
          }));

        setQuizQuestions(questions);
        setQuizPreview(`Loaded ${questions.length} quiz questions from Excel.`);
        toast.success(`Imported ${questions.length} quiz questions!`);
      } catch (err) {
        console.error(err);
        toast.error('Could not parse Excel quiz file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addModule = () =>
    setModules((prev) => [...prev, { title: '', lessons: [] }]);

  const removeModule = (mi: number) =>
    setModules((prev) => prev.filter((_, i) => i !== mi));

  const updateModuleTitle = (mi: number, val: string) =>
    setModules((prev) => prev.map((m, i) => (i === mi ? { ...m, title: val } : m)));

  const addLesson = (mi: number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                { title: '', type: 'reading', dur: '5 min', body: '', points: [] },
              ],
            }
          : m
      )
    );

  const removeLesson = (mi: number, li: number) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi ? { ...m, lessons: m.lessons.filter((_, j) => j !== li) } : m
      )
    );

  const updateLesson = (mi: number, li: number, field: string, val: any) =>
    setModules((prev) =>
      prev.map((m, i) =>
        i === mi
          ? {
              ...m,
              lessons: m.lessons.map((l, j) => (j === li ? { ...l, [field]: val } : l)),
            }
          : m
      )
    );

  const handleSubmit = () => {
    if (!title.trim() || !cat.trim()) {
      toast.error('Title and category are required');
      return;
    }
    if (modules.length === 0) {
      toast.error('Add at least one module');
      return;
    }
    if (quizQuestions.length === 0) {
      toast.error('Upload a quiz Excel file');
      return;
    }

    const id =
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') +
      '-' +
      Date.now();

    onAddCourse({
      id,
      title: title.trim(),
      cat: cat.trim(),
      icon,
      color1,
      color2,
      level,
      desc: desc.trim(),
      bannerImage,
      introVideo: introVideo.trim(),
      objectives: objectives.trim()
        ? objectives.trim().split('\n').map((s) => s.trim()).filter(Boolean)
        : [],
      modules: modules.map((m) => ({
        title: m.title,
        lessons: m.lessons.map((l) => ({ ...l, points: [] })),
      })),
      quiz: quizQuestions,
    });

    // Reset
    setTitle('');
    setCat('');
    setDesc('');
    setIntroVideo('');
    setObjectives('');
    setBannerImage(null);
    setModules([]);
    setQuizQuestions([]);
    setQuizPreview('');
    if (imageRef.current) imageRef.current.value = '';
    if (quizRef.current) quizRef.current.value = '';

    toast.success('Course created and added to catalog!');
  };

  if (!loggedIn) {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in-up">
        <div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-purple-400 block mb-1">
            Course Management
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Admin Control</h1>
          <p className="text-sm text-secondary mt-1">
            Authenticate to manage the courses catalog and upload curriculum data.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-secondary flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" /> Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter password (default: changeme123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2.5 rounded-xl text-xs input-base"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/20 transition-all"
          >
            Authenticate Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-purple-400 block mb-1">
          Course Creator
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Admin Control Center</h1>
        <p className="text-sm text-secondary mt-1">
          Create new cybersecurity courses, edit modules, and import Excel quizzes.
        </p>
      </div>

      {/* Existing Courses List */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" /> Catalog Courses ({courses.length})
        </h3>

        <div className="divide-y divide-white/5 max-h-48 overflow-y-auto pr-2">
          {courses.map((c) => (
            <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-primary">{c.title}</span>
                <span className="text-muted text-[10px] ml-2">({c.cat})</span>
              </div>
              <button
                onClick={() => onDeleteCourse(c.id)}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Course"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Course Form */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <Plus className="w-4 h-4 text-cyan-400" /> Add New Course
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs input-base"
          />
          <input
            placeholder="Category (e.g. Phishing)"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs input-base"
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="px-4 py-2 rounded-xl text-xs input-base"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <textarea
          placeholder="Course Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full h-20 px-4 py-2 rounded-xl text-xs input-base"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-secondary block mb-1">Color 1</label>
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-full h-9 rounded-xl input-base cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-secondary block mb-1">Color 2</label>
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-full h-9 rounded-xl input-base cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-secondary block mb-1">Icon</label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-xs input-base"
            >
              {['shield', 'mail', 'key', 'users', 'wifi', 'file', 'lock', 'bot', 'phone', 'cloud'].map(
                (ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold text-secondary block mb-1">
              Banner Image (Optional)
            </label>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs text-muted"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-secondary block mb-1">
              Intro Video URL (Optional)
            </label>
            <input
              placeholder="https://..."
              value={introVideo}
              onChange={(e) => setIntroVideo(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-xs input-base"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-secondary block mb-1">
            Learning Objectives (one per line)
          </label>
          <textarea
            placeholder="Identify phishing links&#10;Spot lookalike domains"
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            className="w-full h-20 px-4 py-2 rounded-xl text-xs input-base"
          />
        </div>

        {/* Modules & Lessons Builder */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" /> Modules & Lessons
            </h4>
            <button
              onClick={addModule}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Module
            </button>
          </div>

          {modules.map((m, mi) => (
            <div key={mi} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-2">
                <input
                  placeholder="Module Title"
                  value={m.title}
                  onChange={(e) => updateModuleTitle(mi, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs input-base"
                />
                <button
                  onClick={() => removeModule(mi)}
                  className="p-1.5 rounded-lg text-muted hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {m.lessons.map((l, li) => (
                <div key={li} className="pl-4 border-l-2 border-purple-500/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Lesson Title"
                      value={l.title}
                      onChange={(e) => updateLesson(mi, li, 'title', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-xs input-base"
                    />
                    <button
                      onClick={() => removeLesson(mi, li)}
                      className="p-1 rounded-lg text-muted hover:text-rose-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <select
                    value={l.type}
                    onChange={(e) => updateLesson(mi, li, 'type', e.target.value)}
                    className="px-3 py-1.5 rounded-lg text-xs input-base"
                  >
                    <option value="reading">Reading</option>
                    <option value="video">Video</option>
                    <option value="quiz">Quiz Checkpoint</option>
                  </select>
                  <textarea
                    placeholder="Lesson text body or video URL"
                    value={l.body}
                    onChange={(e) => updateLesson(mi, li, 'body', e.target.value)}
                    className="w-full h-16 px-3 py-1.5 rounded-lg text-xs input-base"
                  />
                </div>
              ))}

              <button
                onClick={() => addLesson(mi)}
                className="text-[11px] font-semibold text-purple-400 hover:underline flex items-center gap-1"
              >
                + Add Lesson
              </button>
            </div>
          ))}
        </div>

        {/* Excel Quiz Upload */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-xs font-bold text-primary flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Final Quiz (.xlsx Upload)
          </label>
          <p className="text-[11px] text-muted">
            Format: Column 1 = Question, Columns 2-5 = Options A-D, Column 6 = Correct Choice (1-4).
          </p>
          <input
            ref={quizRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleQuizFile}
            className="w-full text-xs text-muted"
          />
          {quizPreview && <p className="text-xs font-semibold text-emerald-400">{quizPreview}</p>}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Check className="w-4 h-4" /> Save & Publish Course
        </button>
      </div>
    </div>
  );
};
