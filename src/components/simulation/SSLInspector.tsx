// ============================================================
// SE-LAB — SSL Certificate Inspector + HTTP vs HTTPS Educator
// Interactive component teaching users to identify secure sites
// and inspect certificates like real browsers do.
// ============================================================

import React, { useState } from 'react';
import {
  Lock, Unlock, Shield, ShieldAlert, AlertTriangle, CheckCircle2,
  X, ExternalLink, Globe, ChevronDown, ChevronRight, Info,
  AlertCircle, Eye, Server, Calendar, Award
} from 'lucide-react';

// ---- Types ----
export interface CertificateInfo {
  isValid: boolean;
  isEV?: boolean; // Extended Validation (shows organization name in green)
  issuer: string;
  issuedTo: string;
  organization?: string;
  validFrom: string;
  validUntil: string;
  signatureAlgorithm: string;
  keySize: number;
  san: string[]; // Subject Alternative Names
  fingerprint: string;
  chainDepth: number;
  trustedCA: boolean;
  warnings?: string[];
}

interface SSLInspectorProps {
  url: string;
  isHTTPS: boolean;
  cert?: CertificateInfo;
  onClose?: () => void;
  embedded?: boolean; // render inline, not as modal
}

// ---- HTTP vs HTTPS Comparison Panel ----
export function HTTPvsHTTPSPanel({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<'compare' | 'banking' | 'howto'>('compare');

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl text-xs">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 to-blue-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white text-sm">HTTP vs HTTPS — Security Fundamentals</span>
        </div>
        {onClose && <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(['compare', 'banking', 'howto'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[11px] font-semibold transition ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-500 bg-cyan-950/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'compare' ? '🔄 Compare' : tab === 'banking' ? '🏦 Banking Sites' : '🔍 How to Check'}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {activeTab === 'compare' && (
          <div className="grid grid-cols-2 gap-3">
            {/* HTTP column */}
            <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-1.5">
                <Unlock className="w-4 h-4 text-red-400" />
                <span className="font-bold text-red-300 text-sm">HTTP</span>
                <span className="text-[10px] text-red-400 bg-red-950/60 px-1 rounded">INSECURE</span>
              </div>
              <div className="font-mono text-[11px] text-red-300 bg-slate-950 px-2 py-1 rounded border border-red-900/40">http://example.com</div>
              <ul className="space-y-1.5 text-slate-300">
                {[
                  '❌ Data sent in PLAINTEXT',
                  '❌ Hackers can READ your data mid-transit',
                  '❌ Passwords visible to network attackers',
                  '❌ No server identity verification',
                  '❌ Vulnerable to MITM attacks',
                  '❌ Never use for banking/login!',
                ].map((t, i) => <li key={i} className="text-[11px] leading-relaxed">{t}</li>)}
              </ul>
              {/* ASCII visualization of HTTP */}
              <div className="bg-slate-950 rounded-lg p-2 font-mono text-[10px] text-slate-400 space-y-0.5">
                <div>Your Browser → <span className="text-yellow-400">[OPEN WIRE]</span> → Server</div>
                <div className="text-red-400">⚠ Attacker sees: "password=abc123"</div>
              </div>
            </div>

            {/* HTTPS column */}
            <div className="bg-emerald-950/30 border border-emerald-800/50 rounded-xl p-3 space-y-3">
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-300 text-sm">HTTPS</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1 rounded">ENCRYPTED</span>
              </div>
              <div className="font-mono text-[11px] text-emerald-300 bg-slate-950 px-2 py-1 rounded border border-emerald-900/40">https://example.com</div>
              <ul className="space-y-1.5 text-slate-300">
                {[
                  '✅ TLS 1.3 encryption (256-bit AES)',
                  '✅ Data encrypted in transit',
                  '✅ Server identity verified by CA',
                  '✅ Tamper-proof (integrity checking)',
                  '✅ HSTS prevents downgrade attacks',
                  '✅ Required for all financial sites',
                ].map((t, i) => <li key={i} className="text-[11px] leading-relaxed">{t}</li>)}
              </ul>
              {/* ASCII visualization of HTTPS */}
              <div className="bg-slate-950 rounded-lg p-2 font-mono text-[10px] text-slate-400 space-y-0.5">
                <div>Your Browser → <span className="text-emerald-400">[🔐 TLS 1.3]</span> → Server</div>
                <div className="text-emerald-400">Attacker sees: "▒▒▒▒▒▒▒▒" (encrypted)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-4">
            <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-300">Banking Sites — What to ALWAYS Check</span>
              </div>
              <div className="space-y-2">
                {[
                  { step: '1', title: 'Check for HTTPS padlock', desc: 'The padlock icon must be CLOSED (🔒). A broken or missing padlock means the connection is insecure.', safe: true },
                  { step: '2', title: 'Verify the exact domain', desc: 'bankofamerica.com ≠ bankofamer1ca.com ≠ bank-of-america.com. Attackers use lookalike domains!', safe: true },
                  { step: '3', title: 'Check for Extended Validation (EV) cert', desc: 'Premium banks show their company name in the address bar in green. Example: "Bank of America, Inc. [US]"', safe: true },
                  { step: '4', title: 'Never ignore cert warnings', desc: 'If your browser shows "Your connection is not private" — STOP. Do not click "Advanced" and proceed.', safe: false },
                  { step: '5', title: 'Check HSTS status', desc: 'Real banks use HSTS (HTTP Strict Transport Security) which forces HTTPS — preventing downgrade attacks.', safe: true },
                ].map(item => (
                  <div key={item.step} className="flex gap-2 items-start">
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${item.safe ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}`}>
                      {item.step}
                    </div>
                    <div>
                      <div className={`font-semibold text-[11px] ${item.safe ? 'text-emerald-300' : 'text-red-300'}`}>{item.title}</div>
                      <div className="text-slate-400 text-[10px] leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'howto' && (
          <div className="space-y-3">
            <div className="text-slate-300 font-semibold text-[11px] mb-2">How to inspect a certificate in your browser:</div>
            {[
              { browser: 'Chrome', steps: ['Click the padlock 🔒 in the address bar', 'Click "Connection is secure"', 'Click "Certificate is valid"', 'Check: Issued to, Issued by, Valid dates'] },
              { browser: 'Firefox', steps: ['Click the padlock 🔒 → "Connection Secure"', 'Click "More Information"', 'Click "View Certificate"', 'Check: Subject, Issuer, Validity period, Fingerprint'] },
              { browser: 'Safari', steps: ['Click the padlock 🔒 in the address bar', 'Click "Show Certificate"', 'Review certificate details', 'Verify issuer is a trusted CA like DigiCert, Let\'s Encrypt, etc.'] },
            ].map(b => (
              <div key={b.browser} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                <div className="font-bold text-cyan-400 text-[11px] mb-2">🌐 {b.browser}</div>
                <ol className="space-y-1">
                  {b.steps.map((s, i) => (
                    <li key={i} className="flex gap-1.5 text-[11px] text-slate-300">
                      <span className="text-cyan-600 font-mono">{i + 1}.</span> {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reference links */}
      <div className="border-t border-slate-800 px-4 py-2 bg-slate-950/50">
        <div className="text-[10px] text-slate-500 mb-1.5 font-semibold">📚 Learn More (Official Resources):</div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Mozilla Web Security', url: 'https://developer.mozilla.org/en-US/docs/Web/Security' },
            { label: 'OWASP TLS Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html' },
            { label: 'CISA HTTPS Guidance', url: 'https://www.cisa.gov/https' },
          ].map(link => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition bg-cyan-950/30 border border-cyan-800/40 px-2 py-0.5 rounded"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- SSL Certificate Inspector ----
export function SSLInspector({ url, isHTTPS, cert, onClose, embedded = false }: SSLInspectorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  const wrapper = embedded
    ? 'bg-slate-900 border border-slate-700 rounded-xl overflow-hidden text-xs'
    : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm';

  const inner = embedded ? '' : 'bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl w-full max-w-lg text-xs';

  return (
    <div className={wrapper} onClick={!embedded && onClose ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}>
      <div className={embedded ? '' : inner}>
        {/* Browser address bar simulation */}
        <div className={`${isHTTPS ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-red-950/40 border-red-800/60'} border-b px-3 py-2 flex items-center gap-2`}>
          {isHTTPS ? (
            <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
          )}
          <span className="font-mono text-[11px] flex-1 truncate text-slate-200">{url}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isHTTPS ? 'bg-emerald-700 text-white' : 'bg-red-700 text-white'}`}>
            {isHTTPS ? '🔒 SECURE' : '⚠ NOT SECURE'}
          </span>
          {onClose && !embedded && (
            <button onClick={onClose} className="text-slate-400 hover:text-white ml-1"><X className="w-4 h-4" /></button>
          )}
        </div>

        {/* Connection status */}
        <div className={`px-3 py-2.5 border-b border-slate-800 ${isHTTPS ? 'bg-emerald-950/20' : 'bg-red-950/20'}`}>
          {isHTTPS ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Connection is secure
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Your information (e.g., passwords or credit card numbers) is private when it is sent to this site.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" /> Your connection to this site is NOT secure
              </div>
              <p className="text-red-300/80 text-[10px] leading-relaxed">
                You should not enter any sensitive information on this site (such as passwords or credit cards), because it could be stolen by attackers.
              </p>
            </div>
          )}
        </div>

        {/* Certificate details */}
        {cert && isHTTPS && (
          <div className="divide-y divide-slate-800 overflow-y-auto max-h-72">
            {/* Basic cert info */}
            <div className="px-3 py-2.5 space-y-1.5">
              <div className="text-cyan-400 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Award className="w-3 h-3" /> Certificate Identity
              </div>
              <Row label="Issued to" value={cert.issuedTo} highlight={!cert.trustedCA} />
              {cert.organization && <Row label="Organization" value={cert.organization} />}
              <Row label="Issued by" value={cert.issuer} highlight={!cert.trustedCA} />
              <Row label="Valid from" value={cert.validFrom} />
              <Row
                label="Valid until"
                value={cert.validUntil}
                highlight={new Date(cert.validUntil) < new Date()}
                warning={new Date(cert.validUntil) < new Date() ? 'EXPIRED!' : undefined}
              />
            </div>

            {/* Technical details */}
            <button
              onClick={() => toggleSection('tech')}
              className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:bg-slate-800/40 transition"
            >
              <span className="text-[10px] font-semibold text-slate-300">Technical Details</span>
              {expanded['tech'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {expanded['tech'] && (
              <div className="px-3 py-2.5 space-y-1.5 bg-slate-950/40">
                <Row label="Signature algorithm" value={cert.signatureAlgorithm} />
                <Row label="Key size" value={`${cert.keySize}-bit RSA`} />
                <Row label="Certificate chain" value={`${cert.chainDepth} certificates`} />
                <Row label="Trusted CA" value={cert.trustedCA ? '✅ Yes (Browser root store)' : '❌ NO — Untrusted issuer!'} highlight={!cert.trustedCA} />
              </div>
            )}

            {/* SAN */}
            {cert.san.length > 0 && (
              <>
                <button
                  onClick={() => toggleSection('san')}
                  className="w-full px-3 py-2 flex items-center justify-between text-slate-400 hover:bg-slate-800/40 transition"
                >
                  <span className="text-[10px] font-semibold text-slate-300">Subject Alternative Names ({cert.san.length})</span>
                  {expanded['san'] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                {expanded['san'] && (
                  <div className="px-3 py-2.5 bg-slate-950/40 space-y-1">
                    {cert.san.map((s, i) => (
                      <div key={i} className="font-mono text-[10px] text-slate-300">{s}</div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Fingerprint */}
            <div className="px-3 py-2.5 bg-slate-950/40">
              <div className="text-[10px] text-slate-500 mb-1 font-semibold">SHA-256 Fingerprint</div>
              <div className="font-mono text-[10px] text-slate-400 break-all leading-relaxed">{cert.fingerprint}</div>
            </div>

            {/* Warnings */}
            {cert.warnings && cert.warnings.length > 0 && (
              <div className="px-3 py-2.5 bg-red-950/20 border-t border-red-800/40">
                <div className="text-red-400 font-bold text-[10px] mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Security Warnings
                </div>
                {cert.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-red-300 text-[10px] mb-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" /> {w}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No cert / HTTP */}
        {!isHTTPS && (
          <div className="px-3 py-4 text-center space-y-2">
            <Unlock className="w-8 h-8 text-red-400 mx-auto" />
            <div className="text-red-300 font-bold text-sm">No SSL Certificate</div>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs mx-auto">
              This site uses plain HTTP. All data transmitted between your browser and this server is unencrypted and can be intercepted by anyone on the same network.
            </p>
          </div>
        )}

        {/* Edu footer */}
        <div className="border-t border-slate-800 px-3 py-2 bg-slate-950/50 flex flex-wrap gap-2">
          <a href="https://letsencrypt.org/how-it-works/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition">
            <ExternalLink className="w-2.5 h-2.5" /> How TLS Works — Let's Encrypt
          </a>
          <a href="https://www.ssllabs.com/ssltest/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition">
            <ExternalLink className="w-2.5 h-2.5" /> SSL Labs — Test Any Site
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, warning }: { label: string; value: string; highlight?: boolean; warning?: string }) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-slate-500 text-[10px] w-28 flex-shrink-0">{label}</span>
      <span className={`font-mono text-[10px] break-all ${highlight ? 'text-red-300 font-bold' : 'text-slate-200'}`}>
        {value} {warning && <span className="text-red-500 ml-1">{warning}</span>}
      </span>
    </div>
  );
}

// ---- Preset certificates for simulations ----
export const CERT_PRESETS = {
  legitimate: (domain: string): CertificateInfo => ({
    isValid: true,
    isEV: false,
    issuer: "Let's Encrypt Authority X3",
    issuedTo: domain,
    organization: undefined,
    validFrom: '2024-01-15',
    validUntil: '2026-12-15',
    signatureAlgorithm: 'SHA-256 with RSA',
    keySize: 2048,
    san: [domain, `www.${domain}`],
    fingerprint: 'A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90:A1:B2:C3:D4:E5:F6:07:18:29:3A:4B:5C:6D:7E:8F:90',
    chainDepth: 3,
    trustedCA: true,
  }),

  bankEV: (): CertificateInfo => ({
    isValid: true,
    isEV: true,
    issuer: 'DigiCert EV RSA CA G2',
    issuedTo: 'www.bankofamerica.com',
    organization: 'Bank of America Corporation [US]',
    validFrom: '2024-03-01',
    validUntil: '2025-04-01',
    signatureAlgorithm: 'SHA-256 with RSA',
    keySize: 4096,
    san: ['bankofamerica.com', 'www.bankofamerica.com', 'secure.bankofamerica.com'],
    fingerprint: 'FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:00:FF:EE:DD:CC:BB:AA:99:88:77:66:55:44:33:22:11:00',
    chainDepth: 3,
    trustedCA: true,
  }),

  phishingFake: (domain: string): CertificateInfo => ({
    isValid: false,
    issuer: 'Self-Signed (NOT TRUSTED)',
    issuedTo: domain,
    validFrom: '2026-08-01',
    validUntil: '2026-09-01',
    signatureAlgorithm: 'SHA-1 with RSA (WEAK)',
    keySize: 512,
    san: [domain],
    fingerprint: '00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF',
    chainDepth: 1,
    trustedCA: false,
    warnings: [
      'Certificate is SELF-SIGNED — not trusted by any browser',
      'Issuer is not a recognized Certificate Authority',
      'Domain registered only 3 days ago (registration date: 2026-08-22)',
      'SHA-1 signature algorithm is cryptographically broken',
    ],
  }),

  expired: (domain: string): CertificateInfo => ({
    isValid: false,
    issuer: "Let's Encrypt Authority X3",
    issuedTo: domain,
    validFrom: '2023-01-15',
    validUntil: '2023-04-15',
    signatureAlgorithm: 'SHA-256 with RSA',
    keySize: 2048,
    san: [domain],
    fingerprint: 'AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90',
    chainDepth: 3,
    trustedCA: true,
    warnings: ['Certificate expired on 2023-04-15 — connection may be insecure'],
  }),
};
