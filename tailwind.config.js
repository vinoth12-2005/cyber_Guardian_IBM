/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          base:       'var(--bg-base, #070B14)',
          raised:     'var(--bg-raised, #0D1320)',
          elevated:   'var(--bg-elevated, #121A28)',
          cardBorder: 'var(--border-default, rgba(148, 163, 184, 0.13))',
          cyan:       'var(--accent-ai, #06B6D4)',
          blue:       'var(--accent-primary, #3B82F6)',
          purple:     'var(--accent-primary, #3B82F6)',
          pink:       'var(--accent-danger, #EF4444)',
          safe:       'var(--accent-success, #22C55E)',
          suspicious: 'var(--accent-warning, #F59E0B)',
          dangerous:  'var(--accent-danger, #EF4444)',
        },
        bg: {
          DEFAULT: "var(--bg-base, #070B14)",
          secondary: "var(--bg-raised, #0D1320)",
        },
        glass: "var(--surface-2, rgba(255,255,255,0.05))",
        primary: {
          DEFAULT: "var(--accent-primary, #3B82F6)",
          foreground: "var(--text-primary, #F8FAFC)",
        },
        accent: {
          DEFAULT: "var(--accent-ai, #06B6D4)",
        },
        success: "var(--accent-success, #22C55E)",
        warning: "var(--accent-warning, #F59E0B)",
        danger: "var(--accent-danger, #EF4444)",
        text: {
          DEFAULT: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-cyan':   'var(--glow-ai, 0 0 20px -4px rgba(6,182,212,0.30))',
        'glow-blue':   'var(--glow-primary, 0 0 20px -4px rgba(59,130,246,0.30))',
        'glow-purple': 'var(--glow-primary, 0 0 20px -4px rgba(59,130,246,0.30))',
        'glow-sm':     '0 0 10px -2px rgba(6,182,212,0.20)',
        glow: "var(--glow-primary, 0 0 32px -8px rgba(59,130,246,0.40))",
        "glow-accent": "var(--glow-ai, 0 0 32px -8px rgba(6,182,212,0.40))",
        "glow-danger": "0 0 32px -8px rgba(239,68,68,0.40)",
        card: "var(--shadow-md, 0 8px 32px rgba(0,0,0,0.35))",
        'cyber-glow':  'var(--glow-ai, 0 0 20px -5px rgba(6, 182, 212, 0.25))',
        'blue-glow':   'var(--glow-primary, 0 0 20px -5px rgba(59, 130, 246, 0.25))',
        'purple-glow': 'var(--glow-primary, 0 0 20px -5px rgba(59, 130, 246, 0.25))',
        'card-glow':   'var(--shadow-lg, 0 8px 32px 0 rgba(0, 0, 0, 0.37))',
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.18), transparent 40%), radial-gradient(circle at 80% 60%, rgba(6,182,212,0.15), transparent 45%)",
        "hero-gradient":
          "linear-gradient(160deg, #0B1120 0%, #0E1730 45%, #0B1120 100%)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.35s ease both',
        'scale-in':   'scaleIn 0.2s ease both',
        'slide-in':   'slideInRight 0.25s ease both',
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite",
        "fade-slide-up": "fade-slide-up 0.5s ease both",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.55, transform: "scale(1)" },
          "50%": { opacity: 1, transform: "scale(1.05)" },
        },
        "particle-drift": {
          "0%": { transform: "translate(0,0)", opacity: 0 },
          "10%": { opacity: 0.7 },
          "100%": { transform: "translate(var(--dx), var(--dy))", opacity: 0 },
        },
        "fade-slide-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "10%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
    },
  },
  plugins: [],
}

