import type { ReactNode } from "react";

export interface SpeechBubbleProps {
  children: ReactNode;
  tailSide?: "left" | "right";
  className?: string;
}

export function SpeechBubble({ children, tailSide = "left", className = "" }: SpeechBubbleProps) {
  return (
    <div
      className={`relative rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-ink shadow-md shadow-ink/5 ${className}`}
    >
      {children}
      <span
        aria-hidden
        className={`absolute -bottom-2 h-4 w-4 rotate-45 border-b border-r border-border bg-surface ${
          tailSide === "left" ? "left-8" : "right-8"
        }`}
      />
    </div>
  );
}
