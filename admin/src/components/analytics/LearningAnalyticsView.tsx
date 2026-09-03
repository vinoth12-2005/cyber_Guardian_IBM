import React, { useEffect, useState } from 'react';
import { adminApi } from '../../lib/api';
import { BarChart3, TrendingUp, Users, Award, BookOpen, RefreshCw } from 'lucide-react';

export const LearningAnalyticsView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminApi.stats.getCourseAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const popular = data?.popularCourses || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Learning Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Course popularity rankings, enterprise workforce completion trajectories, and examination success analytics.
          </p>
        </div>
        <button onClick={fetchAnalytics} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-5">
        <h2 className="text-sm font-bold text-white mb-4">Most Enrolled Courses</h2>
        <div className="space-y-3">
          {popular.map((c: any) => (
            <div key={c.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-white">{c.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">({c.category})</span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">{c.enrollmentCount} Enrolled ({c.completionRate}% Done)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.max(5, c.completionRate)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
