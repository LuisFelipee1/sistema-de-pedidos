"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export type ToastTone = "success" | "error";

export interface ToastProps {
  message: string | null;
  tone?: ToastTone;
  onDismiss: () => void;
  /** Tempo até sumir sozinho. Use 0 para exigir dispensa manual. */
  duration?: number;
}

const toneConfig: Record<ToastTone, { icon: typeof FiCheckCircle; className: string }> = {
  success: { icon: FiCheckCircle, className: "border-success/40 bg-success text-white" },
  error: { icon: FiAlertCircle, className: "border-danger/40 bg-danger text-white" },
};

export function Toast({ message, tone = "success", onDismiss, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!message || duration <= 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  const { icon: Icon, className } = toneConfig[tone];

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onDismiss}
          className={`fixed inset-x-4 bottom-4 z-[70] flex cursor-pointer items-center gap-3
            rounded-2xl border px-4 py-3 text-sm font-medium shadow-xl
            sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm ${className}`}
        >
          <Icon size={20} className="shrink-0" aria-hidden />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
