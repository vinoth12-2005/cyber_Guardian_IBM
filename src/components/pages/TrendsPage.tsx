import React from 'react';
import { AttackTrendLearning } from '../dashboard/AttackTrendLearning';
import type { AttackTrendItem } from '../../types/dashboard';

interface TrendsPageProps {
  trends: AttackTrendItem[];
}

export const TrendsPage: React.FC<TrendsPageProps> = ({ trends }) => {
  return (
    <div className="space-y-4">
      <AttackTrendLearning trends={trends} />
    </div>
  );
};
