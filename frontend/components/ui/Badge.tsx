import type { HTMLAttributes } from "react";

export type BadgeTone = "success" | "accent" | "neutral" | "danger" | "warning" | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
}

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success/15 text-success border-success/30",
  accent: "bg-accent/15 text-accent border-accent/30",
  neutral: "bg-ink/10 text-ink-muted border-ink/15",
  danger: "bg-danger/15 text-danger border-danger/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  info: "bg-info/15 text-info border-info/30",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-[11px]",
  md: "px-3 py-1 text-sm",
  /** Para leitura a distância — a TV da cozinha. */
  lg: "px-4 py-1.5 text-base sm:text-lg",
};

export function Badge({
  tone = "neutral",
  size = "sm",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase
        tracking-wide ${toneClasses[tone]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
