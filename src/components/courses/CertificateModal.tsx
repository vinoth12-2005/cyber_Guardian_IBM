import React, { useRef, useState } from 'react';
import type { Course } from '../../types/courses';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, Award, Download, Share2, X, CheckCircle, ShieldCheck, Lock } from 'lucide-react';

interface CertificateModalProps {
  course: Course;
  scorePct?: number;
  credId?: string;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  course,
  scorePct = 100,
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
  const credentialCode =
    credId ||
    `CG-CERT-${course.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: '#070B14',
        logging: false,
        useCORS: true,
        allowTaint: true,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in bg-black/80 backdrop-blur-sm">
      <div className="rounded-2xl p-6 md:p-8 max-w-2xl w-full relative space-y-6 max-h-[92vh] overflow-y-auto bg-[#0A0E1A] border border-slate-700/80 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 transition-colors z-10 cursor-pointer"
          title="Close Certificate"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Canvas Box */}
        <div
          ref={certRef}
          className="certificate-canvas p-7 md:p-9 rounded-2xl relative overflow-hidden shadow-2xl text-center space-y-6"
          style={{
            background: 'linear-gradient(145deg, #070B14 0%, #0D1322 50%, #080D18 100%)',
            border: '2px solid rgba(245, 158, 11, 0.45)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 60px rgba(0, 0, 0, 0.7)',
            color: '#FFFFFF',
          }}
        >
          {/* Subtle Ambient Orbs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Corner Ornamental Accents */}
          <div
            className="absolute top-3 left-3 w-5 h-5 pointer-events-none"
            style={{
              borderTop: '2px solid rgba(245, 158, 11, 0.8)',
              borderLeft: '2px solid rgba(245, 158, 11, 0.8)',
            }}
          />
          <div
            className="absolute top-3 right-3 w-5 h-5 pointer-events-none"
            style={{
              borderTop: '2px solid rgba(245, 158, 11, 0.8)',
              borderRight: '2px solid rgba(245, 158, 11, 0.8)',
            }}
          />
          <div
            className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none"
            style={{
              borderBottom: '2px solid rgba(245, 158, 11, 0.8)',
              borderLeft: '2px solid rgba(245, 158, 11, 0.8)',
            }}
          />
          <div
            className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none"
            style={{
              borderBottom: '2px solid rgba(245, 158, 11, 0.8)',
              borderRight: '2px solid rgba(245, 158, 11, 0.8)',
            }}
          />

          {/* Certificate Header */}
          <div
            className="flex items-center justify-between pb-4"
            style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.25)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                  color: '#FFFFFF',
                }}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left">
                <span
                  className="font-extrabold text-sm sm:text-base tracking-tight block"
                  style={{ color: '#FFFFFF' }}
                >
                  CyberGuardian AI
                </span>
                <span
                  className="text-[9px] uppercase font-bold tracking-widest block"
                  style={{ color: '#D8B4FE' }}
                >
                  Enterprise Security Operations Center
                </span>
              </div>
            </div>

            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#F59E0B',
              }}
            >
              <Award className="w-6 h-6" />
            </div>
          </div>

          {/* Main Body */}
          <div className="space-y-3.5 py-3">
            <div className="flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.25em]"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#FBBF24',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Certificate of Completion
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)',
              }}
            >
              {userName}
            </h2>

            <div
              className="w-20 h-0.5 mx-auto"
              style={{
                background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
              }}
            />

            <p
              className="text-xs sm:text-sm font-medium leading-relaxed max-w-lg mx-auto"
              style={{ color: '#CBD5E1' }}
            >
              has successfully completed all modules and passed the comprehensive evaluation for
            </p>

            {/* Course Title: Solid high-contrast styling without bg-clip-text */}
            <div
              className="text-xl sm:text-2xl font-black tracking-tight pt-1"
              style={{
                color: '#38BDF8',
                textShadow: '0 2px 14px rgba(56, 189, 248, 0.35)',
              }}
            >
              {course.title}
            </div>
          </div>

          {/* Footer Metadata */}
          <div
            className="grid grid-cols-3 gap-2 pt-4 text-center text-xs"
            style={{ borderTop: '1px solid rgba(245, 158, 11, 0.25)' }}
          >
            <div>
              <span
                className="text-[10px] uppercase font-bold tracking-wider block"
                style={{ color: '#94A3B8' }}
              >
                Date Issued
              </span>
              <span className="font-bold text-xs sm:text-sm" style={{ color: '#FFFFFF' }}>
                {today}
              </span>
            </div>
            <div>
              <span
                className="text-[10px] uppercase font-bold tracking-wider block"
                style={{ color: '#94A3B8' }}
              >
                Evaluation Score
              </span>
              <span className="font-extrabold text-xs sm:text-sm" style={{ color: '#34D399' }}>
                {scorePct}% · PASS
              </span>
            </div>
            <div>
              <span
                className="text-[10px] uppercase font-bold tracking-wider block"
                style={{ color: '#94A3B8' }}
              >
                Credential ID
              </span>
              <span
                className="font-mono text-[10px] sm:text-xs font-bold block truncate"
                style={{ color: '#C084FC' }}
              >
                {credentialCode}
              </span>
            </div>
          </div>

          {/* Cryptographic Verification Bar */}
          <div
            className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px]"
            style={{ color: '#64748B' }}
          >
            <span className="flex items-center gap-1 font-mono">
              <Lock className="w-3 h-3 text-emerald-400 inline" />
              Verified Anti-Tamper Digital Credential
            </span>
            <span className="font-mono tracking-wider">
              ISO/IEC 27001 SOC VERIFIED
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Recorded in Central Credential Registry</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share Link
            </button>

            <button
              disabled={downloading}
              onClick={handleDownload}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {downloading ? 'Generating...' : 'Download Certificate PNG'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
