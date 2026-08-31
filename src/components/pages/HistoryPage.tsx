import React from 'react';
import { AnalysisHistory } from '../dashboard/AnalysisHistory';
import type { AnalysisHistoryItem } from '../../types/dashboard';

interface HistoryPageProps {
  logs: AnalysisHistoryItem[];
  onSelectLog: (log: AnalysisHistoryItem) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ logs, onSelectLog }) => {
  return (
    <div className="space-y-4">
      <AnalysisHistory logs={logs} onSelectLog={onSelectLog} />
    </div>
  );
};
