import React from 'react';
import { WeeklyCyberReport } from '../dashboard/WeeklyCyberReport';
import type { WeeklyReportData } from '../../types/dashboard';

interface ReportsPageProps {
  report: WeeklyReportData;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ report }) => {
  return (
    <div className="space-y-4">
      <WeeklyCyberReport report={report} />
    </div>
  );
};
