import React, { useState } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { adminApi } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Sparkles,
  Plus,
  Video,
  HelpCircle,
  CheckCircle2,
  Clock,
  Layers,
  FileUp,
  ShieldCheck,
  Send,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface CourseAdminDashboardProps {
  stats: any;
  courses: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const CourseAdminDashboard: React.FC<CourseAdminDashboardProps> = ({
  stats,
  courses,
  loading,
  onRefresh,
}) => {
  const { setActiveTab } = useAdminAuth();
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const draftCourses = courses.filter((c) => c.status === 'draft');
  const publishedCourses = courses.filter((c) => c.status !== 'draft');
  const totalLessons = courses.reduce(
    (acc, c) => acc + (c.modules || []).reduce((mAcc: number, m: any) => mAcc + (m.lessons || []).length, 0),
    0
  );
  const totalQuizzes = courses.filter((c) => c.quiz && c.quiz.length > 0).length;

  const handlePublish = async (courseId: string) => {
    setPublishingId(courseId);
    try {
      await adminApi.courses.publish(courseId);
      toast.success('Course published live to students!');
      onRefresh();
    } catch (e: any) {
      toast.error(e.message || 'Failed to publish course');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Course Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Curriculum Studio & Assessment Center</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1 font-semibold">
              COURSE_ADMIN STUDIO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            AI PDF curriculum ingestion, video lecture hosting, 3D threat flip cards, and Unstop-style proctored assessments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('courses')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-cyan-600/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Ingest from PDF</span>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Course</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Curriculum KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Courses */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Courses</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{courses.length}</span>
            <span className="text-[11px] text-cyan-400 font-mono">Curricula</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Master Catalog</div>
        </div>

        {/* Staged Drafts */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Staged Drafts</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400 font-mono">{draftCourses.length}</span>
            <span className="text-[11px] text-slate-400 font-mono">Awaiting Publish</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Hidden from student catalog</div>
        </div>

        {/* Total Lessons & Video Lectures */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Interactive Lessons</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Video className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-indigo-400 font-mono">{totalLessons}</span>
            <span className="text-[11px] text-slate-400 font-mono">Modules & Media</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Video & 3D Flip Card enabled</div>
        </div>

        {/* Proctored Quizzes */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Proctored Assessments</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400 font-mono">{totalQuizzes}</span>
            <span className="text-[11px] text-emerald-400 font-mono">Lockdown Active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Unstop-style anti-cheat engine</div>
        </div>
      </div>

      {/* Course Studio Staging Matrix */}
      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Course Staging & Publishing Pipeline</h2>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <span>Open Studio</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-3">Course Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Modules / Lessons</th>
                <th className="p-3">Status</th>
                <th className="p-3">Source Document</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {courses.slice(0, 7).map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3">
                    <div className="font-semibold text-white">{c.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Level: {c.level || 'Intermediate'}</div>
                  </td>
                  <td className="p-3 text-cyan-400 font-mono">{c.cat}</td>
                  <td className="p-3 text-slate-400 font-mono">
                    {c.modules?.length || 0} modules ({(c.modules || []).reduce((acc: number, m: any) => acc + (m.lessons || []).length, 0)} lessons)
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        c.status === 'draft'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {c.status === 'draft' ? 'Draft' : 'Live'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] font-mono">
                    {c.sourceDocName || 'Direct Creation'}
                  </td>
                  <td className="p-3 text-right">
                    {c.status === 'draft' ? (
                      <button
                        onClick={() => handlePublish(c.id)}
                        disabled={publishingId === c.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors"
                      >
                        <Send className="h-3 w-3" />
                        <span>{publishingId === c.id ? 'Publishing...' : 'Publish Live'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Deployed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
