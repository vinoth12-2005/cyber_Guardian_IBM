import React from 'react';
import { SuspiciousActivityHistory } from '../dashboard/SuspiciousActivityHistory';
import type { SuspiciousActivityItem } from '../../types/dashboard';

interface ThreatsPageProps {
  activities: SuspiciousActivityItem[];
  onSelectActivity: (activity: SuspiciousActivityItem) => void;
}

export const ThreatsPage: React.FC<ThreatsPageProps> = ({ activities, onSelectActivity }) => {
  return (
    <div className="space-y-4">
      <SuspiciousActivityHistory activities={activities} onSelectActivity={onSelectActivity} />
    </div>
  );
};
