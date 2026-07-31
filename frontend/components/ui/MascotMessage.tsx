"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { Mascot, type MascotVariant } from "./Mascot";
import { SpeechBubble } from "./SpeechBubble";

export interface MascotMessageProps {
  variant?: MascotVariant;
  size?: number;
  align?: "left" | "right";
  children: ReactNode;
  className?: string;
}

export function MascotMessage({
  variant = "happy",
  size = 88,
  align = "left",
  children,
  className = "",
}: MascotMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex items-end gap-4 ${align === "right" ? "flex-row-reverse" : ""} ${className}`}
    >
      <Mascot variant={variant} size={size} className="animate-float shrink-0" />
      <SpeechBubble tailSide={align} className="max-w-sm">
        {children}
      </SpeechBubble>
    </motion.div>
  );
}
