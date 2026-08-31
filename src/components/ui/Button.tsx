import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary/90 shadow-glow btn-glow",
  outline:
    "border transition-colors hover:opacity-90",
  ghost: "transition-colors hover:opacity-90",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const sizes = {
  default: "h-12 px-5 text-sm",
  sm: "h-9 px-3.5 text-sm",
  lg: "h-14 px-6 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      loading = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const dynamicStyle: React.CSSProperties = { ...style };
    if (variant === "outline") {
      dynamicStyle.background = dynamicStyle.background || "var(--surface-1)";
      dynamicStyle.borderColor = dynamicStyle.borderColor || "var(--border-medium)";
      dynamicStyle.color = dynamicStyle.color || "var(--text-primary)";
    } else if (variant === "ghost") {
      dynamicStyle.color = dynamicStyle.color || "var(--text-secondary)";
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={dynamicStyle}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
