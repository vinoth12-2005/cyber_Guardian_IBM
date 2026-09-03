import React, { useState } from "react";
import { motion } from "framer-motion";
import logoIcon from "@/assets/logo-icon.png";

export default function GlowShield() {
  const [imgError, setImgError] = useState(false);

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
        className="relative overflow-hidden h-36 w-36 rounded-3xl backdrop-blur-xl flex items-center justify-center p-2 shadow-2xl"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.25), rgba(15, 23, 42, 0.85))",
          border: "1px solid rgba(99, 102, 241, 0.35)",
        }}
      >
        {!imgError ? (
          <img
            src={logoIcon}
            alt="CyberGuardian AI"
            className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]"
            onError={() => setImgError(true)}
          />
        ) : (
          <svg viewBox="0 0 48 46" className="w-20 h-20 drop-shadow-[0_0_16px_rgba(134,59,255,0.8)]" fill="none">
            <path fill="#863bff" d="M25.946 44.938c-.664.845-2.021.375-2.021-.698V33.937a2.26 2.26 0 0 0-2.262-2.262H10.287c-.92 0-1.456-1.04-.92-1.788l7.48-10.471c1.07-1.497 0-3.578-1.842-3.578H1.237c-.92 0-1.456-1.04-.92-1.788L10.013.474c.214-.297.556-.474.92-.474h28.894c.92 0 1.456 1.04.92 1.788l-7.48 10.471c-1.07 1.498 0 3.579 1.842 3.579h11.377c.943 0 1.473 1.088.89 1.83L25.947 44.94z" />
          </svg>
        )}
      </motion.div>
    </div>
  );
}
