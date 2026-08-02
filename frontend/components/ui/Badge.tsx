import type { HTMLAttributes } from "react";

export type BadgeTone = "success" | "accent" | "neutral" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-success/15 text-success border-success/30",
  accent: "bg-accent/15 text-accent border-accent/30",
  neutral: "bg-ink/10 text-ink-muted border-ink/15",
  danger: "bg-danger/15 text-danger border-danger/30",
};

export function Badge({ tone = "neutral", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px]
        font-semibold uppercase tracking-wide ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
