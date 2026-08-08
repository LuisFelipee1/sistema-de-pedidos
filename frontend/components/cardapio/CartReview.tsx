"use client";

import Image from "next/image";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

import { Button, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { unitPrice, type CartItem } from "@/types/cart";

export interface CartReviewProps {
  items: CartItem[];
  total: number;
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onRemove: (key: string) => void;
}

export function CartReview({
  items,
  total,
  onIncrement,
  onDecrement,
  onRemove,
}: CartReviewProps) {
  if (items.length === 0) {
    return (
      <Text variant="muted" className="py-10 text-center">
        Seu carrinho está vazio.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3">
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                width={64}
                height={64}
                className="size-16 shrink-0 rounded-xl object-cover"
              />
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="min-w-0 flex-1 font-medium text-ink">{item.name}</span>
                <span className="shrink-0 font-bold text-ink tabular-nums">
                  {formatCurrency(unitPrice(item) * item.quantity)}
                </span>
              </div>

              {item.options.length > 0 && (
                <ul className="flex flex-col gap-0.5">
                  {item.options.map((option) => (
                    <li key={option.option_id} className="text-sm text-ink-muted">
                      {option.option_name}
                      {Number(option.price_delta) > 0 && (
                        <span className="text-success">
                          {" "}
                          + {formatCurrency(option.price_delta)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                  <button
                    type="button"
                    onClick={() => onDecrement(item.key)}
                    aria-label={`Diminuir ${item.name}`}
                    className="flex size-8 items-center justify-center rounded-full text-ink
                      transition-colors hover:text-accent"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-5 text-center font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onIncrement(item.key)}
                    aria-label={`Aumentar ${item.name}`}
                    className="flex size-8 items-center justify-center rounded-full text-ink
                      transition-colors hover:text-accent"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(item.key)}
                  aria-label={`Remover ${item.name}`}
                  className="flex size-9 items-center justify-center rounded-lg text-ink-muted
                    transition-colors hover:text-danger"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="sticky -bottom-6 -mx-6 -mb-6 flex flex-col gap-3 border-t border-border
        bg-surface px-6 pt-4 pb-6">
        <div className="flex items-center justify-between">
          <Text variant="body" className="font-medium">
            Total
          </Text>
          <Text variant="body" className="text-xl font-bold tabular-nums">
            {formatCurrency(total)}
          </Text>
        </div>
        {/* Sem ação por enquanto: a etapa seguinte do pedido ainda não existe. */}
        <Button type="button" size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
}
