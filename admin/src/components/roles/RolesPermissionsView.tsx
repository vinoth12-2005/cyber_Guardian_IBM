import React from 'react';
import { UserCog, ShieldCheck, Lock } from 'lucide-react';

export const RolesPermissionsView: React.FC = () => {
  const roles = [
    { name: 'SUPER_ADMIN', desc: 'Full unrestricted root authority over all systems, learning labs, EDR sensors, and audit logs.', perms: ['*'] },
    { name: 'PLATFORM_ADMIN', desc: 'Comprehensive operational oversight across users, courses, simulations, certifications, analytics, and audit logs.', perms: ['users:*', 'courses:*', 'simulations:*', 'certifications:*', 'analytics:*', 'audit:*'] },
    { name: 'USER_ADMIN', desc: 'User directory governance: provision accounts, adjust workforce roles, manage suspensions, and audit identities.', perms: ['users:*'] },
    { name: 'COURSE_ADMIN', desc: 'Curriculum authoring studio: AI PDF ingestion, video uploads, 3D flip card authoring, and proctored assessment governance.', perms: ['courses:*', 'assessments:*'] },
    { name: 'SIMULATION_ADMIN', desc: 'Hands-on cyber ranges: create and configure attack/defense simulation scenarios, terminal flags, and room scoring.', perms: ['simulations:*'] },
    { name: 'CERTIFICATION_ADMIN', desc: 'Credential authority: review all issued enterprise certificates, audit criteria, and execute security revocations.', perms: ['certifications:*'] },
    { name: 'FLOTBOT_SECURITY_ADMIN', desc: 'Complete authority over EDR threat rules, IOC repositories, live host sensors, and AI security policies.', perms: ['flotbot:*', 'security:*', 'rules:*', 'iocs:*', 'audit:*'] },
    { name: 'SECURITY_ANALYST', desc: 'SOC operations: investigate live alerts, acknowledge/resolve threats, query IOC indicators, and analyze user telemetry.', perms: ['flotbot:read', 'flotbot:ack', 'flotbot:resolve', 'iocs:*', 'analytics:security'] },
    { name: 'ANALYST', desc: 'Business intelligence: analyze workforce course completion trends, simulation outcomes, and export institutional reports.', perms: ['analytics:*', 'reports:*'] },
    { name: 'EMPLOYEE / STUDENT', desc: 'Workforce learner account: engages in training courses, executes simulation exercises, and earns verified credentials.', perms: ['courses:learn', 'simulations:play', 'certifications:read', 'profile:manage'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Role-Based Access Control (RBAC)</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Hierarchy of administrative and analyst role definitions enforced server-side.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((r) => (
          <div key={r.name} className="rounded-xl bg-slate-900/70 border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                {r.name}
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
            <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500">
              Permissions: <span className="text-slate-300">{r.perms.join(', ')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
