import { motion } from "framer-motion";
import FloatingParticles from "./FloatingParticles";
import GlowShield from "./GlowShield";

interface AuthLayoutProps {
  children: React.ReactNode;
  /** "login" keeps illustration on left; "register" keeps it on right (collapses on mobile) */
  mode?: "login" | "register";
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Violet top-left blob */}
        <motion.div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Sky bottom-right blob */}
        <motion.div
          className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(var(--border-default) 1px, transparent 1px), linear-gradient(90deg, var(--border-default) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Floating particles (always visible) ── */}
      <FloatingParticles count={50} />

      {/* ── Illustration panel — visible on lg+ ── */}
      <div className="relative hidden lg:flex w-1/2 flex-col items-center justify-center px-12">
        <motion.div
          className="relative z-10 flex flex-col items-center text-center"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Brand — just text, logo lives inside GlowShield box */}
          <motion.div
            className="mb-6 flex items-center gap-2.5"
            layoutId="auth-brand-desktop"
          >
            <span className="text-lg font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              CyberGuardian AI
            </span>
          </motion.div>

          <GlowShield />

          <motion.h1
            className="mt-6 max-w-sm text-2xl font-semibold leading-tight tracking-tight"
            style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Your digital world,{" "}
            <span style={{ color: "var(--accent-primary)" }}>guarded by intelligence.</span>
          </motion.h1>

          <motion.p
            className="mt-3 max-w-sm text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Real-time threat detection, security training, and an AI mentor —
            all in one place built to keep you a step ahead of attackers.
          </motion.p>

          {/* Security badges row */}
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {["🔒 End-to-End Encrypted", "🤖 AI-Powered", "⚡ Real-time"].map((badge) => (
              <span
                key={badge}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-default)",
                }}
              >
                {badge}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Form panel ── */}
      <div className="relative z-10 flex w-full lg:w-1/2 items-center justify-center px-5 py-10 sm:px-8">
        {/* The card with layoutId so Framer Motion animates it between routes */}
        <motion.div
          layoutId="auth-card"
          layout
          className="w-full max-w-md"
          style={{ borderRadius: "var(--radius-xl)" }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        >
          <motion.div
            className="glass-card p-7 sm:p-9"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            {/* Mobile-only brand */}
            <motion.div
              layoutId="auth-brand-mobile"
              className="mb-5 flex items-center gap-2 lg:hidden"
            >
              <img src="/logo-icon.png" alt="CyberGuardian AI" className="h-10 w-10 object-contain" />
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                CyberGuardian AI
              </span>
            </motion.div>

            {/* Page content injected here */}
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
