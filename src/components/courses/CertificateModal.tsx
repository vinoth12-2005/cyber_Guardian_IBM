import React, { useRef, useState } from 'react';
import type { Course } from '../../types/courses';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Award, Download, Share2, X } from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  scorePct?: number;
  credId?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  scorePct = 95,
  credId,
  onClose,
}) => {
  const { user } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const userName = user?.displayName || 'Security Professional';
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const credentialCode = credId || `CG-CERT-${course.id.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        backgroundColor: '#060608',
        logging: false,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${course.title.replace(/\s+/g, '_')}_Certificate.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Certificate downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate certificate image.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Certificate link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in">
      <div className="glass-card rounded-2xl p-6 md:p-8 max-w-2xl w-full relative space-y-6 max-h-[90vh] overflow-y-auto border-purple-500/20 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-primary hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Canvas Box */}
        <div
          ref={certRef}
          className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-[#0B0F19] via-[#060608] to-[#111827] border-2 border-amber-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl"
        >
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />

          {/* Certificate Header */}
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  CyberGuardian AI
                </span>
                <span className="text-[9px] uppercase tracking-widest text-purple-300 block">
                  Security Operations Center
                </span>
              </div>
            </div>

            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Main Body */}
          <div className="space-y-3 py-4">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 block">
              Certificate of Completion
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {userName}
            </h2>
            <p className="text-xs text-slate-300">
              has successfully completed all modules and passed the security evaluation for
            </p>
            <div className="text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-amber-300 pt-1">
              {course.title}
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-amber-500/20 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Date Issued
              </span>
              <span className="font-bold text-white">{today}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Quiz Score
              </span>
              <span className="font-bold text-emerald-400">{scorePct}%</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Credential ID
              </span>
              <span className="font-mono text-[10px] font-semibold text-purple-300">
                {credentialCode}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-secondary border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" /> Share Link
          </button>

          <button
            disabled={downloading}
            onClick={handleDownload}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" /> {downloading ? 'Generating...' : 'Download Certificate PNG'}
          </button>
        </div>
      </div>
    </div>
  );
};
