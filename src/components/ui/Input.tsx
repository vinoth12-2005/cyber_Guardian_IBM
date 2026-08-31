import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  error?: string;
  endAdornment?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon: Icon, error, endAdornment, style, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2" style={{ color: "var(--text-secondary)" }} />
          )}
          <input
            ref={ref}
            style={{
              background: "var(--surface-2)",
              borderColor: error ? undefined : "var(--border-default)",
              color: "var(--text-primary)",
              ...style,
            }}
            className={cn(
              "h-12 w-full rounded-2xl border px-4 text-sm outline-none transition-all duration-200",
              "focus:border-accent/60 focus:ring-2 focus:ring-accent/25",
              Icon ? "pl-11" : "pl-4",
              endAdornment ? "pr-11" : "pr-4",
              error
                ? "border-danger/60 focus:border-danger focus:ring-danger/25"
                : "",
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {endAdornment}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
