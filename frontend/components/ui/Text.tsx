import { createElement, type ElementType, type HTMLAttributes } from "react";

type TextVariant = "h1" | "h2" | "body" | "muted" | "label";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: ElementType;
}

const variantConfig: Record<TextVariant, { tag: ElementType; className: string }> = {
  h1: { tag: "h1", className: "text-3xl sm:text-4xl font-bold tracking-tight text-ink" },
  h2: { tag: "h2", className: "text-xl font-semibold tracking-tight text-ink" },
  body: { tag: "p", className: "text-base text-ink" },
  muted: { tag: "p", className: "text-sm text-ink-muted" },
  label: {
    tag: "span",
    className: "text-xs font-semibold uppercase tracking-wide text-ink-muted",
  },
};

export function Text({ variant = "body", as, className = "", children, ...props }: TextProps) {
  const config = variantConfig[variant];
  return createElement(
    as ?? config.tag,
    { className: `${config.className} ${className}`, ...props },
    children,
  );
}
