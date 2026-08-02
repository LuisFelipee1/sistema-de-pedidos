"use client";

import { useEffect, useMemo } from "react";
import { FiLoader } from "react-icons/fi";

import { Badge, Card, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchFinishedOrdersThunk } from "@/lib/redux/slices/ordersSlice";
import type { Order } from "@/types/orders";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Momento em que a conta foi fechada — o histórico guarda quando o pedido
 * entrou em "Finalizado", que é o que interessa para faturamento. */
function finishedAt(order: Order): string {
  const entry = [...order.status_history].reverse().find((item) => item.status === "Finalizado");
  return dateFormatter.format(new Date(entry?.changed_at ?? order.created_at));
}

export function FinishedOrdersPanel() {
  const dispatch = useAppDispatch();
  const { finished, finishedStatus } = useAppSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchFinishedOrdersThunk());
  }, [dispatch]);

  const revenue = useMemo(
    () => finished.reduce((total, order) => total + Number(order.total_amount), 0),
    [finished],
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Text variant="h2">Pedidos finalizados</Text>
          <Text variant="muted">Contas já fechadas — base das métricas do restaurante.</Text>
        </div>
        {finished.length > 0 && (
          <div className="text-right">
            <Text variant="label">Total faturado</Text>
            <Text variant="body" className="text-2xl font-bold text-success tabular-nums">
              {formatCurrency(revenue)}
            </Text>
          </div>
        )}
      </div>

      {finishedStatus === "loading" && finished.length === 0 ? (
        <div className="flex justify-center py-10">
          <FiLoader className="animate-spin text-ink-muted" size={24} aria-label="Carregando" />
        </div>
      ) : finished.length === 0 ? (
        <Card className="p-6">
          <Text variant="muted" className="text-center">
            Nenhum pedido finalizado ainda. Feche a conta de uma mesa para ela aparecer aqui.
          </Text>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {finished.map((order) => (
            <li key={order.id}>
              <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text variant="body" className="font-semibold">
                      {order.table ? `Mesa ${order.table}` : "Sem mesa"}
                    </Text>
                    <Badge tone="success">Finalizado</Badge>
                    <Text variant="muted">{finishedAt(order)}</Text>
                  </div>
                  <Text variant="muted" className="truncate">
                    {order.items
                      .map((item) => `${item.quantity}x ${item.product_name_snapshot}`)
                      .join(", ")}
                  </Text>
                </div>
                <Text variant="body" className="text-lg font-bold tabular-nums">
                  {formatCurrency(order.total_amount)}
                </Text>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
