import React from 'react';
import type { Course, CourseProgressMap } from '../../types/courses';
import { pct } from '../../utils/coursesState';
import { BookOpen } from 'lucide-react';

interface MyLearningViewProps {
  courses: Course[];
  progress: CourseProgressMap;
  onOpenCourse: (courseId: string) => void;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  courses,
  progress,
  onOpenCourse,
}) => {
  const inProgress = courses.filter((c) => pct(c, progress) > 0 && pct(c, progress) < 100);
  const notStarted = courses.filter((c) => pct(c, progress) === 0);
  const activeList = [...inProgress, ...notStarted];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-400 block mb-1">
          Active Dashboard
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-primary">My Learning</h1>
        <p className="text-sm text-secondary mt-1">
          Track and resume all cybersecurity training courses assigned to your profile.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeList.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center text-secondary">
            <BookOpen className="w-10 h-10 mx-auto text-muted mb-2" />
            <p className="font-semibold text-primary">No active courses</p>
            <p className="text-xs text-muted">You have completed all available courses!</p>
          </div>
        ) : (
          activeList.map((course) => {
            const pPct = pct(course, progress);
            const bannerStyle = course.bannerImage
              ? { backgroundImage: `url(${course.bannerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: `linear-gradient(135deg, ${course.color1 || '#7C3AED'}, ${course.color2 || '#38BDF8'})` };

            return (
              <div
                key={course.id}
                onClick={() => onOpenCourse(course.id)}
                className="glass-card glass-card-interactive rounded-2xl overflow-hidden cursor-pointer flex flex-col group"
              >
                <div className="h-28 relative flex items-center justify-center p-4" style={bannerStyle}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="relative z-10 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                      {course.cat}
                    </span>
                    <h3 className="font-bold text-sm text-primary group-hover:text-purple-300 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] text-secondary">
                      <span>{pPct === 0 ? 'Not Started' : 'In Progress'}</span>
                      <span className="font-bold">{pPct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-400 transition-all duration-500"
                        style={{ width: `${pPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
