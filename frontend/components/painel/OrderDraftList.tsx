"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";

import { formatCurrency } from "@/lib/format";
import type { DraftOrderItem } from "@/types/orders";

export interface OrderDraftListProps {
  items: DraftOrderItem[];
  onEdit: (item: DraftOrderItem) => void;
  onRemove: (key: string) => void;
}

export function OrderDraftList({ items, onEdit, onRemove }: OrderDraftListProps) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.key}
          className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3"
        >
          <span className="mt-0.5 shrink-0 text-sm font-bold text-accent tabular-nums">
            {item.quantity}x
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink">{item.product_name}</span>
            {item.notes && (
              <span className="mt-0.5 block text-sm break-words text-ink-muted italic">
                {item.notes}
              </span>
            )}
            <span className="mt-0.5 block text-sm text-ink-muted tabular-nums">
              {formatCurrency(Number(item.unit_price) * item.quantity)}
            </span>
          </span>
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Editar ${item.product_name}`}
              className="flex size-9 items-center justify-center rounded-lg text-ink-muted
                transition-colors hover:bg-surface hover:text-accent"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              aria-label={`Remover ${item.product_name}`}
              className="flex size-9 items-center justify-center rounded-lg text-ink-muted
                transition-colors hover:bg-surface hover:text-danger"
            >
              <FiTrash2 size={16} />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function draftTotal(items: DraftOrderItem[]): number {
  return items.reduce((total, item) => total + Number(item.unit_price) * item.quantity, 0);
}

export function draftItemCount(items: DraftOrderItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}
