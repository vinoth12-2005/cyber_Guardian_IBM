import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("glass-card p-6 sm:p-8", className)} {...props}>
      {children}
    </div>
  );
}
