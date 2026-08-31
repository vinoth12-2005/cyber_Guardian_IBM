import { Check } from "lucide-react";
import { cn } from "../../../lib/utils";

const steps = ["Basics", "Security", "Finish"];

export default function ProgressSteps({ current }: { current: number }) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((label, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                style={{
                  borderColor: done ? undefined : active ? undefined : "var(--border-medium)",
                  background: done ? undefined : active ? undefined : "var(--surface-2)",
                  color: done ? undefined : active ? undefined : "var(--text-secondary)",
                }}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300",
                  done && "border-success bg-success/20 text-success",
                  active &&
                    "border-accent bg-accent/15 text-accent shadow-glow-accent"
                )}
              >
                {done ? <Check className="h-4 w-4" /> : index}
              </div>
              <span
                style={{
                  color: active || done ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                className="text-[11px] font-medium"
              >
                {label}
              </span>
            </div>
            {index !== steps.length && (
              <div
                style={{
                  background: done ? undefined : "var(--border-default)",
                }}
                className={cn(
                  "mx-2 h-px flex-1 -translate-y-3 transition-colors duration-300",
                  done && "bg-success/50"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
