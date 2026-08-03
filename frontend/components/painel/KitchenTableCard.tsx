"use client";

import { motion } from "framer-motion";
import { FiCheck, FiClock } from "react-icons/fi";

import { Badge } from "@/components/ui";
import { effectiveCheckedKeys, formatWaiting, kitchenItems, minutesWaiting } from "@/lib/kitchen";
import { KITCHEN_STATUS_LABELS, type KitchenQueueEntry } from "@/types/orders";

import { KITCHEN_STATUS_SURFACE, KITCHEN_STATUS_TONE } from "./kitchen-status";

export interface KitchenTableCardProps {
  entry: KitchenQueueEntry;
  onSelect: (entry: KitchenQueueEntry) => void;
  /** Itens já conferidos no modal — o card só mostra, quem marca é o modal. */
  checkedKeys: string[];
  /** Recalculado pelo pai a cada tique, para o tempo de espera não congelar. */
  now: number;
}

export function KitchenTableCard({ entry, onSelect, checkedKeys, now }: KitchenTableCardProps) {
  const items = kitchenItems(entry);
  const checked = effectiveCheckedKeys(entry, checkedKeys);
  const checkedCount = items.filter((item) => checked.has(item.key)).length;

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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-lg font-medium text-ink-muted">
        <span className="flex items-center gap-2">
          <FiClock size={20} aria-hidden />
          {formatWaiting(minutesWaiting(entry.waiting_since, now))}
        </span>
        <span className="tabular-nums">
          {checkedCount}/{items.length} conferidos
        </span>
      </div>

      <ul className="flex flex-col gap-2.5 border-t border-ink/10 pt-4">
        {items.map((item) => {
          const isChecked = checked.has(item.key);
          return (
            <li key={item.key} className="flex items-start gap-3">
              <span
                aria-hidden
                className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md border-2
                  ${isChecked ? "border-success bg-success text-white" : "border-ink/30"}`}
              >
                {isChecked && <FiCheck size={16} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-xl leading-tight font-semibold text-ink sm:text-2xl
                    ${isChecked ? "line-through opacity-60" : ""}`}
                >
                  {item.quantity}x {item.name}
                </span>
                {item.notes && (
                  <span
                    className={`mt-1 block text-base font-medium text-danger italic sm:text-lg
                      ${isChecked ? "line-through opacity-60" : ""}`}
                  >
                    {item.notes}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </motion.button>
  );
}
