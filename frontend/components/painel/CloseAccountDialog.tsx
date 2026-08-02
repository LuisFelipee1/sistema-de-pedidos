"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiLoader } from "react-icons/fi";

import { Button, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import type { TableAccount } from "@/types/orders";

export interface CloseAccountDialogProps {
  isOpen: boolean;
  tableNumber: number;
  account: TableAccount | null;
  isLoadingAccount: boolean;
  isClosing: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CloseAccountDialog({
  isOpen,
  tableNumber,
  account,
  isLoadingAccount,
  isClosing,
  error,
  onConfirm,
  onCancel,
}: CloseAccountDialogProps) {
  const itemCount =
    account?.orders.reduce(
      (total, order) => total + order.items.reduce((sum, item) => sum + item.quantity, 0),
      0,
    ) ?? 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          // Sem parar a propagação, o clique aqui chegaria ao backdrop do modal
          // da mesa e fecharia o pedido inteiro junto.
          onClick={(event) => {
            event.stopPropagation();
            if (!isClosing) onCancel();
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
            <div className="flex flex-col items-center gap-2 text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.06 }}
                className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success"
              >
                <FiCheckCircle size={28} />
              </motion.span>
              <Text variant="h2">Tem certeza que deseja finalizar esse pedido?</Text>
              <Text variant="muted">
                A mesa {tableNumber} será liberada e a conta ficará registrada.
              </Text>
            </div>

            <div className="my-6 rounded-2xl border border-success/30 bg-success/10 px-5 py-4">
              {isLoadingAccount ? (
                <div className="flex justify-center py-2">
                  <FiLoader className="animate-spin text-ink-muted" size={22} aria-label="Carregando conta" />
                </div>
              ) : (
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <Text variant="label">Valor final</Text>
                    <Text variant="muted" className="mt-0.5">
                      {itemCount} {itemCount === 1 ? "item" : "itens"}
                    </Text>
                  </div>
                  <motion.span
                    key={account?.total}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    className="text-3xl font-bold text-success tabular-nums"
                  >
                    {formatCurrency(account?.total ?? 0)}
                  </motion.span>
                </div>
              )}
            </div>

            {error && <p className="mb-4 text-center text-sm text-danger">{error}</p>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isClosing}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="success"
                onClick={onConfirm}
                isLoading={isClosing}
                disabled={isLoadingAccount}
                className="flex-1"
              >
                Finalizar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
