import React from "react";
import { cn } from "../../lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export default function Label({ className, children, style, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-sm font-medium",
        className
      )}
      style={{ color: "var(--text-secondary)", ...style }}
      {...props}
    >
      {children}
    </label>
  );
}
