import React from 'react';
import { Globe, Mail, QrCode, Zap, ArrowRight } from 'lucide-react';

interface ActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

const actions: ActionItem[] = [
  {
    id: 'url',
    label: 'Analyze URL',
    description: 'Check any link for threats',
    icon: <Globe className="w-4 h-4" strokeWidth={1.75} />,
    iconColor: 'var(--accent-info)',
    iconBg: 'var(--accent-info-faint)',
  },
  {
    id: 'email',
    label: 'Scan Email',
    description: 'Detect phishing & malware',
    icon: <Mail className="w-4 h-4" strokeWidth={1.75} />,
    iconColor: 'var(--accent-primary)',
    iconBg: 'var(--accent-primary-faint)',
  },
  {
    id: 'qr',
    label: 'Check QR Code',
    description: 'Verify QR code destinations',
    icon: <QrCode className="w-4 h-4" strokeWidth={1.75} />,
    iconColor: 'var(--accent-success)',
    iconBg: 'var(--accent-success-faint)',
  },
  {
    id: 'sim',
    label: 'Start Simulation',
    description: 'Run a security drill',
    icon: <Zap className="w-4 h-4" strokeWidth={1.75} />,
    iconColor: 'var(--accent-warning)',
    iconBg: 'var(--accent-warning-faint)',
  },
];

export const QuickActions: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <h3
        className="text-[13px] font-bold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Quick Actions
      </h3>

      {/* Actions grid */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-200 group"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-default)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-medium)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-sm)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-1)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: action.iconBg, color: action.iconColor }}
            >
              {action.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-semibold leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {action.label}
              </p>
              <p
                className="text-[10px] mt-0.5 truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {action.description}
              </p>
            </div>
            <ArrowRight
              className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
