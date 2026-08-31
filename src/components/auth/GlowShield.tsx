import { motion } from "framer-motion";

export default function GlowShield() {
  return (
    <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
      {/* Calm pulsing rings */}
      {[0, 1, 2].map((ring) => (
        <motion.span
          key={ring}
          className="absolute rounded-full border border-accent/30"
          style={{ inset: ring * 28 }}
          animate={{ opacity: [0.15, 0.5, 0.15], scale: [1, 1.03, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: ring * 0.6, ease: "easeInOut" }}
        />
      ))}

      {/* Soft glow blob */}
      <motion.div
        className="absolute h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo image replaces the ShieldCheck icon */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden h-36 w-36 rounded-3xl backdrop-blur-xl"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border-default)",
        }}
      >
        <img
          src="/logo-icon.png"
          alt="CyberGuardian AI"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </div>
  );
}
