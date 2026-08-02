"use client";

import { useState } from "react";
import { FiCheckCircle, FiClock } from "react-icons/fi";

import { Badge, Button, ConfirmDialog, Select, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { formatWaiting, kitchenItems, minutesWaiting } from "@/lib/kitchen";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setKitchenStatusThunk } from "@/lib/redux/slices/kitchenSlice";
import {
  KITCHEN_STATUS_LABELS,
  KITCHEN_STATUS_ORDER,
  type KitchenQueueEntry,
  type KitchenStatus,
} from "@/types/orders";

import { KITCHEN_STATUS_TONE } from "./kitchen-status";

export interface KitchenOrderModalProps {
  entry: KitchenQueueEntry;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/** Remontado pelo pai via `key` a cada abertura, então o select sempre começa
 * no status atual da mesa. */
export function KitchenOrderModal({ entry, onClose, onSuccess }: KitchenOrderModalProps) {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<KitchenStatus>(entry.status);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingReady, setIsConfirmingReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = kitchenItems(entry);

  async function applyStatus(target: KitchenStatus, message: string) {
    setIsSaving(true);
    setError(null);
    try {
      await dispatch(setKitchenStatusThunk({ tableId: entry.table.id, status: target })).unwrap();
      setIsConfirmingReady(false);
      onSuccess(message);
      onClose();
    } catch (thrown) {
      setError(
        typeof thrown === "string" ? thrown : "Não foi possível atualizar. Tente de novo.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={KITCHEN_STATUS_TONE[entry.status]} size="md">
          {KITCHEN_STATUS_LABELS[entry.status]}
        </Badge>
        <span className="flex items-center gap-1.5 text-base text-ink-muted">
          <FiClock size={16} aria-hidden />
          {formatWaiting(minutesWaiting(entry.waiting_since))}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Text variant="label">Itens para preparo</Text>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.key}
              className="flex items-start gap-3 rounded-xl border border-border bg-paper px-4 py-3"
            >
              <span className="text-lg font-bold text-accent tabular-nums">{item.quantity}x</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold text-ink">{item.name}</span>
                {item.notes && (
                  <span className="mt-0.5 block text-base font-medium text-danger italic">
                    {item.notes}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <Text variant="body" className="font-medium">
          Total da mesa
        </Text>
        <Text variant="body" className="text-lg font-bold tabular-nums">
          {formatCurrency(entry.total)}
        </Text>
      </div>

      <Select
        label="Status do pedido"
        name="kitchen-status"
        value={status}
        onChange={(event) => {
          const next = event.target.value as KitchenStatus;
          setStatus(next);
          void applyStatus(next, `Mesa ${entry.table.number}: ${KITCHEN_STATUS_LABELS[next]}.`);
        }}
      >
        {KITCHEN_STATUS_ORDER.map((value) => (
          <option key={value} value={value}>
            {KITCHEN_STATUS_LABELS[value]}
          </option>
        ))}
      </Select>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="sticky -bottom-6 -mx-6 -mb-6 flex flex-col gap-3 border-t border-border bg-surface px-6 pt-4 pb-6">
        <Button
          type="button"
          variant="success"
          size="lg"
          onClick={() => setIsConfirmingReady(true)}
          disabled={entry.status === "pronto" || isSaving}
        >
          <FiCheckCircle size={18} />
          Pedido Pronto
        </Button>
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
          Cancelar
        </Button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmingReady}
        title={`Marcar a mesa ${entry.table.number} como pronta?`}
        description="A cozinha encerra o preparo e o garçom é avisado para servir."
        confirmLabel="Finalizar"
        confirmVariant="success"
        isConfirming={isSaving}
        error={error}
        onConfirm={() =>
          applyStatus("pronto", `Mesa ${entry.table.number} pronta para servir!`)
        }
        onCancel={() => setIsConfirmingReady(false)}
      />
    </div>
  );
}
