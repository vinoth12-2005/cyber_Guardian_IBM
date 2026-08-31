import React, { useState } from 'react';
import type { AnalysisHistoryItem, RiskLevel } from '../../types/dashboard';
import { ShieldCheck, AlertTriangle, ShieldAlert, Search, Eye, FileSearch } from 'lucide-react';

interface AnalysisHistoryProps {
  logs: AnalysisHistoryItem[];
  onSelectLog: (log: AnalysisHistoryItem) => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ logs, onSelectLog }) => {
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((item) => {
    const matchesRisk   = riskFilter === 'ALL' || item.riskLevel.toUpperCase() === riskFilter;
    const matchesSearch =
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

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

  const getStatusColor = (status: AnalysisHistoryItem['status']) => {
    switch (status) {
      case 'Quarantined': return 'var(--accent-danger)';
      case 'Whitelisted': return 'var(--accent-success)';
      case 'Flagged':     return 'var(--accent-warning)';
      case 'Completed':   return 'var(--accent-info)';
    }
  };

  const riskFilters = ['ALL', 'SAFE', 'SUSPICIOUS', 'DANGEROUS'];

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileSearch className="w-4 h-4" style={{ color: 'var(--accent-info)' }} strokeWidth={2} />
            Analysis History
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Inspection logs for URLs, emails, attachments &amp; QR codes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search target…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-base text-xs rounded-xl pl-8 pr-3 py-1.5 w-full sm:w-44"
            />
          </div>

          {/* Risk filter pills */}
          <div
            className="flex items-center p-0.5 rounded-xl text-xs gap-0.5"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-subtle)' }}
          >
            {riskFilters.map((risk) => (
              <button
                key={risk}
                onClick={() => setRiskFilter(risk)}
                className="px-2.5 py-1 rounded-lg transition-all duration-200 text-[11px] font-medium"
                style={{
                  background: riskFilter === risk ? 'var(--accent-primary)' : 'transparent',
                  color: riskFilter === risk ? '#fff' : 'var(--text-muted)',
                  fontWeight: riskFilter === risk ? '600' : '500',
                }}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr
              className="text-[10px] uppercase tracking-wider"
              style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
            >
              {['Date', 'Type', 'Target', 'Finding', 'Risk', 'Status', ''].map((h, i) => (
                <th key={i} className={`pb-3 px-3 font-medium ${i === 6 ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  No analysis logs match the selected filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((item) => (
                <tr
                  key={item.id}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => onSelectLog(item)}
                >
                  <td className="py-3 px-3 text-[11px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {item.date}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-lg"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-[180px] truncate" style={{ color: 'var(--accent-info)', fontSize: '11px' }}>
                    {item.target}
                  </td>
                  <td className="py-3 px-3 font-medium" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    {item.result}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {getRiskBadge(item.riskLevel)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="text-[11px]" style={{ color: getStatusColor(item.status) }}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectLog(item); }}
                      className="p-1.5 rounded-lg transition-all duration-150"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-medium)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      title="Inspect"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
