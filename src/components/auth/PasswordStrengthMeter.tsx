import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { scorePassword, strengthMeta, cn } from "../../lib/utils";

const checklist = [
  { key: "length", label: "8+ characters", test: (p: string) => p.length >= 8 },
  { key: "upper", label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "Number", test: (p: string) => /[0-9]/.test(p) },
  { key: "symbol", label: "Symbol", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function PasswordStrengthMeter({ password = "" }: { password?: string }) {
  const score = scorePassword(password);
  const meta = strengthMeta[score];

  return (
    <div className="mt-2.5">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => {
          const filled = password.length > 0 && i < Math.max(score, 1);
          return (
            <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--border-default)" }}>
              <motion.div
                className={cn("h-full rounded-full", meta.color)}
                initial={{ width: 0 }}
                animate={{ width: filled ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          );
        })}
      </div>

      {password && (
        <p className={cn("mt-1.5 text-xs font-medium", meta.text)}>{meta.label}</p>
      )}

      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {checklist.map(({ key, label, test }) => {
          const passed = test(password);
          return (
            <li
              key={key}
              style={{
                color: passed ? undefined : "var(--text-secondary)",
              }}
              className={cn(
                "flex items-center gap-1.5 text-xs transition-colors",
                passed && "text-success"
              )}
            >
              {passed ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <X className="h-3.5 w-3.5 opacity-40" />
              )}
              {label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
