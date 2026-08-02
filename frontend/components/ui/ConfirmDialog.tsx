"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

import { Button } from "./Button";
import { Text } from "./Text";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "success" | "secondary";
  isConfirming?: boolean;
  error?: string | null;
  /** Conteúdo extra entre a descrição e os botões (resumo, valor, ícone). */
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmação que pode abrir por cima de outro modal.
 *
 * O backdrop para a propagação do clique: sem isso, fechar esta confirmação
 * também fecharia o modal que está atrás, que tem o próprio clique de backdrop. */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "primary",
  isConfirming = false,
  error,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={(event) => {
            event.stopPropagation();
            if (!isConfirming) onCancel();
          }}
          className="fixed inset-0 z-60 flex items-end justify-center bg-ink/50 sm:items-center sm:px-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.6 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-6
              shadow-xl sm:rounded-3xl"
          >
            <div className="flex flex-col gap-2 text-center">
              <Text variant="h2">{title}</Text>
              {description && <Text variant="muted">{description}</Text>}
            </div>

            {children && <div className="my-6">{children}</div>}

            {error && <p className="mb-4 text-center text-sm text-danger">{error}</p>}

            <div className={`flex gap-3 ${children ? "" : "mt-6"}`}>
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isConfirming}
                className="flex-1"
              >
                {cancelLabel}
              </Button>
              <Button
                type="button"
                variant={confirmVariant}
                onClick={onConfirm}
                isLoading={isConfirming}
                className="flex-1"
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
