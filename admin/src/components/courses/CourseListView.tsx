import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { CourseFormModal } from './CourseFormModal';
import {
  BookOpen,
  Search,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Layers,
  HelpCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Send,
  FileUp,
} from 'lucide-react';

export const CourseListView: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'info' | 'curriculum' | 'quiz' | 'pdf'>('info');
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminApi.courses.list({
        search,
        cat: catFilter,
        status: statusFilter,
        includeDrafts: true,
      });
      if (res.success && res.data) {
        setCourses(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [catFilter, statusFilter]);

  const handleEdit = async (courseId: string) => {
    try {
      const res = await adminApi.courses.getById(courseId);
      if (res.success && res.data) {
        setSelectedCourse(res.data);
        setModalTab('curriculum');
        setModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setModalTab('info');
    setModalOpen(true);
  };

  const handleGeneratePdf = () => {
    setSelectedCourse(null);
    setModalTab('pdf');
    setModalOpen(true);
  };

  const handlePublishCourse = async (courseId: string, title: string) => {
    if (!confirm(`Publish course "${title}" live to all students?`)) return;
    try {
      const res = await adminApi.courses.publish(courseId);
      if (res.success) {
        fetchCourses();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm(`Are you sure you want to delete course '${courseId}'?`)) return;
    try {
      await adminApi.courses.delete(courseId);
      fetchCourses();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Course Curriculum Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingest course documents via AI, embed video lectures & 3D threat flip cards, and publish proctored assessments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCourses}
            title="Refresh Courses"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleGeneratePdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate from PDF</span>
          </button>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
        <div className="relative sm:col-span-2">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCourses()}
            placeholder="Search courses by title, category, description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Categories</option>
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="">All Statuses (Live & Drafts)</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only (In Staging)</option>
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => {
          const isDraft = c.status === 'draft';
          return (
            <div
              key={c.id}
              className={`rounded-xl bg-slate-900/70 border p-5 flex flex-col justify-between hover:border-slate-700 transition-colors ${
                isDraft ? 'border-amber-500/40' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {c.cat}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        isDraft
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isDraft ? 'Draft' : 'Live'}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{c.level}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">{c.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.desc}</p>
                {c.sourceDocName && (
                  <span className="text-[10px] font-mono text-cyan-400/80 block mb-2">
                    📄 Ingested from: {c.sourceDocName}
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{c.duration || '4-6 hours'}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isDraft && (
                    <button
                      onClick={() => handlePublishCourse(c.id, c.title)}
                      title="Publish course live to students"
                      className="px-2 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-colors inline-flex items-center gap-1 text-[11px] font-mono font-bold cursor-pointer"
                    >
                      <Send className="h-3 w-3" />
                      <span>Publish</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(c.id)}
                    title="Customize Course"
                    className="p-1.5 rounded text-indigo-400 hover:bg-indigo-950/40 transition-colors inline-flex items-center gap-1 text-[11px] font-mono cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Customize</span>
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    title="Delete Course"
                    className="p-1.5 rounded text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Modal */}
      {modalOpen && (
        <CourseFormModal
          course={selectedCourse}
          initialTab={modalTab}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            fetchCourses();
          }}
        />
      )}
    </div>
  );
};
