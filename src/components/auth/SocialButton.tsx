import { cn } from "../../lib/utils";

const icons = {
  google: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.4 14.7 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.3-4.8 9.3-7.3 0-.5-.05-.9-.12-1.3H12z"
      />
    </svg>
  ),
  microsoft: (
    <svg viewBox="0 0 23 23" className="h-[18px] w-[18px]">
      <path fill="#F35325" d="M1 1h10v10H1z" />
      <path fill="#81BC06" d="M12 1h10v10H12z" />
      <path fill="#05A6F0" d="M1 12h10v10H1z" />
      <path fill="#FFBA08" d="M12 12h10v10H12z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current text-text">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.46-1.19-1.11-1.51-1.11-1.51-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.05a9.32 9.32 0 0 1 5 0c1.9-1.33 2.74-1.05 2.74-1.05.56 1.41.21 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.58 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .28.18.61.69.5A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
};

export interface SocialButtonProps {
  provider: keyof typeof icons;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export default function SocialButton({ provider, label, onClick, disabled }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border text-sm font-medium transition-all duration-200",
        "hover:opacity-90 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border-default)",
        color: "var(--text-primary)",
      }}
    >
      {icons[provider]}
      {label}
    </button>
  );
}
