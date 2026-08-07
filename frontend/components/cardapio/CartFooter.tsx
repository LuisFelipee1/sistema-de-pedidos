"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FiShoppingBag } from "react-icons/fi";

import { formatCurrency } from "@/lib/format";

export interface CartFooterProps {
  itemCount: number;
  total: number;
  onOpen: () => void;
}

/** Barra que só existe depois do primeiro item — antes disso o cliente ainda
 * está só olhando o cardápio e a barra roubaria espaço da lista. */
export function CartFooter({ itemCount, total, onOpen }: CartFooterProps) {
  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: 0 }}
          exit={{ y: "120%" }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-4 py-3
            pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </span>
              <span className="text-lg font-bold text-ink tabular-nums">
                {formatCurrency(total)}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={onOpen}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="ml-auto flex h-12 flex-1 items-center justify-center gap-2 rounded-xl
                bg-accent px-5 font-semibold text-accent-ink shadow-sm shadow-accent/30 sm:flex-none"
            >
              <FiShoppingBag size={18} aria-hidden />
              Ver carrinho
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
