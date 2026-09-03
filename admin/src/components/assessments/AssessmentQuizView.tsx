import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { HelpCircle, CheckCircle2, BookOpen, RefreshCw } from 'lucide-react';

export const AssessmentQuizView: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      const res = await adminApi.courses.list();
      if (res.success && res.data && res.data.length > 0) {
        setCourses(res.data);
        // Load first course details with quiz questions
        const detailRes = await adminApi.courses.getById(res.data[0].id);
        if (detailRes.success && detailRes.data) {
          setSelectedCourse(detailRes.data);
        }
      }
      setLoading(false);
    };
    loadCourses();
  }, []);

  const handleCourseChange = async (courseId: string) => {
    setLoading(true);
    const res = await adminApi.courses.getById(courseId);
    if (res.success && res.data) {
      setSelectedCourse(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Assessment & Quiz Question Bank</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Review examination questions, answer keys, passing thresholds (≥70%), and certificate triggers.
        </p>
      </div>

      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <label className="text-xs font-mono uppercase text-slate-400">Select Course Examination:</label>
        <select
          value={selectedCourse?.id || ''}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.title} ({c.cat})</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white">{selectedCourse.title}</h2>
              <span className="text-[11px] font-mono text-slate-400">Passing Score: 70% · Certificate: {selectedCourse.credentialName}</span>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">{selectedCourse.quiz?.length || 0} Questions</span>
          </div>

          <div className="space-y-4">
            {(selectedCourse.quiz || []).map((q: any, idx: number) => (
              <div key={q.id || idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-bold text-white flex items-start gap-2">
                  <span className="text-indigo-400 font-mono">Q{idx + 1}.</span>
                  <span>{q.q}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {(q.options || []).map((opt: string, oi: number) => (
                    <div
                      key={oi}
                      className={`p-2 rounded-lg text-xs font-mono flex items-center justify-between ${
                        oi === q.answer
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 font-bold'
                          : 'bg-slate-900 text-slate-400'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                      {oi === q.answer && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    <em>Rationale: {q.explanation}</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
