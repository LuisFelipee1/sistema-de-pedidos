import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded = true, className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface shadow-lg shadow-ink/5
        ${padded ? "p-8" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
