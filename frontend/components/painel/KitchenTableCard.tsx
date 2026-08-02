"use client";

import { motion } from "framer-motion";
import { FiCheck, FiClock } from "react-icons/fi";

import { Badge } from "@/components/ui";
import { formatWaiting, kitchenItems, minutesWaiting } from "@/lib/kitchen";
import { KITCHEN_STATUS_LABELS, type KitchenQueueEntry } from "@/types/orders";

import { KITCHEN_STATUS_SURFACE, KITCHEN_STATUS_TONE } from "./kitchen-status";

export interface KitchenTableCardProps {
  entry: KitchenQueueEntry;
  onSelect: (entry: KitchenQueueEntry) => void;
  /** Recalculado pelo pai a cada tique, para o tempo de espera não congelar. */
  now: number;
}

export function KitchenTableCard({ entry, onSelect, now }: KitchenTableCardProps) {
  const items = kitchenItems(entry);
  const isReady = entry.status === "pronto";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(entry)}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      aria-label={`Mesa ${entry.table.number} — ${KITCHEN_STATUS_LABELS[entry.status]}`}
      className={`flex w-full flex-col gap-4 rounded-3xl border-4 p-5 text-left shadow-lg
        transition-colors duration-200 ${KITCHEN_STATUS_SURFACE[entry.status]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-lg font-semibold tracking-wide text-ink-muted uppercase">Mesa</span>
          <span className="block text-6xl leading-none font-bold text-ink tabular-nums sm:text-7xl">
            {entry.table.number}
          </span>
        </div>
        <Badge tone={KITCHEN_STATUS_TONE[entry.status]} size="lg" className="shrink-0">
          {KITCHEN_STATUS_LABELS[entry.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-lg font-medium text-ink-muted">
        <FiClock size={20} aria-hidden />
        {formatWaiting(minutesWaiting(entry.waiting_since, now))}
      </div>

      <ul className="flex flex-col gap-2.5 border-t border-ink/10 pt-4">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3">
            <span
              aria-hidden
              className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2
                ${isReady ? "border-success bg-success text-white" : "border-ink/30"}`}
            >
              {isReady && <FiCheck size={16} strokeWidth={3} />}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block text-xl leading-tight font-semibold text-ink sm:text-2xl
                  ${isReady ? "line-through opacity-60" : ""}`}
              >
                {item.quantity}x {item.name}
              </span>
              {item.notes && (
                <span className="mt-1 block text-base font-medium text-danger italic sm:text-lg">
                  {item.notes}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </motion.button>
  );
}
