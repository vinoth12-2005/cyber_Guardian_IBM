import React from 'react';
import type { WeeklyReportData } from '../../types/dashboard';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { BarChart3, CheckCircle2, AlertOctagon } from 'lucide-react';

interface WeeklyCyberReportProps {
  report: WeeklyReportData;
}

export const WeeklyCyberReport: React.FC<WeeklyCyberReportProps> = ({ report }) => {
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: 'var(--bg-elevated)',
      border: '1px solid var(--border-medium)',
      borderRadius: '10px',
      fontSize: '11px',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-lg)',
    },
    labelStyle: { color: 'var(--text-secondary)' },
  };

  const gridColor = 'var(--border-subtle)';
  const axisColor = 'var(--text-muted)';

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent-info)' }} strokeWidth={2} />
            Weekly Cyber Analytics Report
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Comprehensive security audit for August W2
          </p>
        </div>
        <span
          className="badge"
          style={{ background: 'var(--accent-success-faint)', color: 'var(--accent-success)', borderColor: 'var(--accent-success-border)' }}
        >
          Strong Readiness
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Awareness Score Change', value: `+${report.scoreChange}%`, sub: 'vs previous month', color: 'var(--accent-success)' },
          { label: 'Simulations Completed',  value: report.simulationsCompleted, sub: '100% pass rate',  color: 'var(--accent-primary)' },
          { label: 'Threats Blocked',         value: report.threatsIdentified,   sub: '0 breaches',      color: 'var(--accent-info)' },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
          >
            <span className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
              {s.label}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {s.value}
              </span>
              <span className="text-xs font-medium" style={{ color: s.color }}>
                {s.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Strong / Weak areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="p-4 rounded-xl"
          style={{ background: 'var(--accent-success-faint)', border: '1px solid var(--accent-success-border)' }}
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-success)' }}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Strong Areas
          </div>
          <ul className="space-y-1.5">
            {report.strongAreas.map((area, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-success)' }} />
                {area}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{ background: 'var(--accent-warning-faint)', border: '1px solid var(--accent-warning-border)' }}
        >
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-warning)' }}>
            <AlertOctagon className="w-3.5 h-3.5" />
            Priority to Strengthen
          </div>
          <ul className="space-y-1.5">
            {report.weakAreas.map((area, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent-warning)' }} />
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart */}
        <div
          className="p-4 rounded-xl flex flex-col"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Daily Threat Scans
            </h4>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.barChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="day" stroke={axisColor} fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke={axisColor} fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="threatsBlocked" name="Threats Blocked" fill="var(--accent-danger)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="scansPerformed" name="Scans" fill="var(--accent-info)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area chart */}
        <div
          className="p-4 rounded-xl flex flex-col"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Awareness Trend (Area Distribution)
            </h4>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={report.lineChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="week" stroke={axisColor} fontSize={9} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke={axisColor} fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--accent-primary)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreAreaGradient)"
                  dot={{ r: 3.5, fill: 'var(--accent-info)', strokeWidth: 1.5, stroke: 'var(--accent-primary)' }}
                  activeDot={{ r: 5, fill: 'var(--accent-primary)' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div
          className="p-4 rounded-xl flex flex-col"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Threat Vectors
            </h4>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {report.pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {report.pieChartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                {entry.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
