import { useMemo } from "react";

interface FloatingParticlesProps {
  count?: number;
}

export default function FloatingParticles({ count = 50 }: FloatingParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        dx: `${(Math.random() - 0.5) * 120}px`,
        dy: `${-(Math.random() * 160 + 60)}px`,
        duration: Math.random() * 6 + 6,
        delay: Math.random() * 6,
        hue: Math.random() > 0.5 ? "#3B82F6" : "#06B6D4",
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-[particle-drift_var(--dur)_ease-in_var(--delay)_infinite]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.hue,
            boxShadow: `0 0 6px ${p.hue}`,
            // @ts-ignore
            "--dx": p.dx,
            "--dy": p.dy,
            "--dur": `${p.duration}s`,
            "--delay": `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
