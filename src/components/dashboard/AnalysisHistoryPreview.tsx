import React from 'react';
import type { AnalysisHistoryItem, RiskLevel } from '../../types/dashboard';
import { ShieldCheck, AlertTriangle, ShieldAlert, FileSearch, ArrowRight, Eye } from 'lucide-react';

interface AnalysisHistoryPreviewProps {
  logs: AnalysisHistoryItem[];
  onSelectLog: (log: AnalysisHistoryItem) => void;
  onViewAll: () => void;
}

const getRiskBadge = (risk: RiskLevel) => {
  switch (risk) {
    case 'Safe':
      return (
        <span className="badge" style={{ background: 'var(--accent-success-faint)', color: 'var(--accent-success)', borderColor: 'var(--accent-success-border)' }}>
          <ShieldCheck className="w-3 h-3" /> Safe
        </span>
      );
    case 'Suspicious':
      return (
        <span className="badge" style={{ background: 'var(--accent-warning-faint)', color: 'var(--accent-warning)', borderColor: 'var(--accent-warning-border)' }}>
          <AlertTriangle className="w-3 h-3" /> Suspicious
        </span>
      );
    case 'Dangerous':
      return (
        <span className="badge" style={{ background: 'var(--accent-danger-faint)', color: 'var(--accent-danger)', borderColor: 'var(--accent-danger-border)' }}>
          <ShieldAlert className="w-3 h-3" /> Dangerous
        </span>
      );
  }
};

// Sort so highest-risk rows appear first, then take top 3
const riskOrder: Record<RiskLevel, number> = { Dangerous: 0, Suspicious: 1, Safe: 2 };

export const AnalysisHistoryPreview: React.FC<AnalysisHistoryPreviewProps> = ({
  logs,
  onSelectLog,
  onViewAll,
}) => {
  const preview = [...logs]
    .sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel])
    .slice(0, 3);

  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ background: 'var(--accent-info-faint)', border: '1px solid var(--accent-info-border)' }}>
            <FileSearch className="w-3.5 h-3.5" style={{ color: 'var(--accent-info)' }} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-[13px] font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Analysis History
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Recent / highest-risk scans</p>
          </div>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)')}
        >
          View full history <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Rows */}
      <div className="space-y-0">
        {preview.length === 0 ? (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            No analysis history recorded yet. Live scans and inspection logs will appear here.
          </div>
        ) : (
          preview.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 py-2.5 cursor-pointer transition-colors"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--surface-1)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
              onClick={() => onSelectLog(item)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium truncate" style={{ color: 'var(--accent-info)' }}>{item.target}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.type} · {item.date}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {getRiskBadge(item.riskLevel)}
                <button onClick={(e) => { e.stopPropagation(); onSelectLog(item); }} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
