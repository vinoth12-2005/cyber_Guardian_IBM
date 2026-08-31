import React from 'react';
import type { Course, CourseProgressMap } from '../../types/courses';
import { Trophy, Award, ArrowRight } from 'lucide-react';

interface CertificatesViewProps {
  courses: Course[];
  progress: CourseProgressMap;
  onOpenCert: (courseId: string) => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({
  courses,
  progress,
  onOpenCert,
}) => {
  const earned = courses.filter((c) => progress[c.id]?.certified);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400 block mb-1">
          Achievements
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Your Certificates</h1>
        <p className="text-sm text-secondary mt-1">
          Verified cybersecurity credentials earned through course completions and passed evaluations.
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {earned.length === 0 ? (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center text-secondary space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-amber-400 opacity-60" />
            <h3 className="font-bold text-primary text-base">No certificates earned yet</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Complete all lessons in a course and score 70% or higher on the final quiz to unlock your certificate.
            </p>
          </div>
        ) : (
          earned.map((course) => {
            const p = progress[course.id];
            return (
              <div
                key={course.id}
                onClick={() => onOpenCert(course.id)}
                className="glass-card glass-card-interactive rounded-2xl p-6 text-center cursor-pointer space-y-4 border-amber-500/20 hover:border-amber-500/40 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-primary group-hover:text-amber-300 transition-colors">
                    {course.title}
                  </h3>
                  <span className="text-xs text-emerald-400 font-semibold block">
                    Quiz Score: {p?.quizScore ?? 100}%
                  </span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                  <Award className="w-4 h-4" /> View Certificate <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
