"use client";

import { useState } from "react";
import { FiCheckCircle, FiSend } from "react-icons/fi";

import { Button, Select, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  closeTableAccountThunk,
  createPresencialOrderThunk,
  fetchTableAccountThunk,
} from "@/lib/redux/slices/ordersSlice";
import { updateTableStatusThunk } from "@/lib/redux/slices/tablesSlice";
import type { Category, Product } from "@/types/menu";
import type { DraftOrderItem } from "@/types/orders";
import {
  TABLE_STATUS_LABELS,
  TABLE_STATUS_ORDER,
  type RestaurantTable,
  type TableStatus,
} from "@/types/tables";

import { CloseAccountDialog } from "./CloseAccountDialog";
import { OrderDraftList, draftItemCount, draftTotal } from "./OrderDraftList";
import { ObservationSheet, type ObservationPick, type ObservationResult } from "./ObservationSheet";
import { ProductPicker } from "./ProductPicker";

export interface TableOrderModalProps {
  table: RestaurantTable;
  products: Product[];
  categories: Category[];
  onClose: () => void;
  onSuccess: (message: string) => void;
  /** Dispara a comemoração de tela cheia depois que a conta é fechada. */
  onAccountClosed: (total: string) => void;
}

/** Produto aguardando a folha de observações. `draftKey` presente = estamos
 * editando um item que já está no pedido, não adicionando um novo. */
interface PendingPick extends ObservationPick {
  productId: number;
  unitPrice: string;
  draftKey?: string;
}

/** Cada abertura da mesa monta um pedido do zero — quem controla isso é o
 * `key` no componente pai, que remonta esta árvore inteira. */
export function TableOrderModal({
  table,
  products,
  categories,
  onClose,
  onSuccess,
  onAccountClosed,
}: TableOrderModalProps) {
  const dispatch = useAppDispatch();
  const { account, accountStatus } = useAppSelector((state) => state.orders);
  const [status, setStatus] = useState<TableStatus>(table.status);
  const [draft, setDraft] = useState<DraftOrderItem[]>([]);
  const [pending, setPending] = useState<PendingPick | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = status === "desativada";
  // Fechar conta é sobre o estado real da mesa no servidor, não sobre o status
  // que o garçom acabou de escolher no select e ainda não salvou.
  const canCloseAccount = table.status === "ocupada";

  function openCloseConfirmation() {
    setCloseError(null);
    setIsConfirmingClose(true);
    dispatch(fetchTableAccountThunk(table.id));
  }

  async function handleCloseAccount() {
    setIsClosing(true);
    setCloseError(null);
    try {
      const result = await dispatch(closeTableAccountThunk(table.id)).unwrap();
      setIsConfirmingClose(false);
      onClose();
      // Só comemora depois que o servidor confirmou — a animação nunca decide
      // se a conta foi fechada ou não.
      onAccountClosed(result.total);
    } catch (thrown) {
      setCloseError(
        typeof thrown === "string" ? thrown : "Não foi possível finalizar. Tente de novo.",
      );
    } finally {
      setIsClosing(false);
    }
  }

  function handleStatusChange(next: TableStatus) {
    setStatus(next);
    // Mesa desativada não recebe pedido, então o rascunho perde o sentido.
    if (next === "desativada") setDraft([]);
  }

  function pickProduct(product: Product) {
    setPending({
      id: `pick-${product.id}-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: 1,
      notes: "",
    });
  }

  function editDraftItem(item: DraftOrderItem) {
    setPending({
      id: `edit-${item.key}-${Date.now()}`,
      productId: item.product_id,
      productName: item.product_name,
      unitPrice: item.unit_price,
      draftKey: item.key,
      quantity: item.quantity,
      notes: item.notes,
    });
  }

  function confirmPending(result: ObservationResult) {
    if (!pending) return;
    setDraft((current) => {
      if (pending.draftKey) {
        return current.map((item) =>
          item.key === pending.draftKey
            ? { ...item, quantity: result.quantity, notes: result.notes }
            : item,
        );
      }
      return [
        ...current,
        {
          key: pending.id,
          product_id: pending.productId,
          product_name: pending.productName,
          unit_price: pending.unitPrice,
          quantity: result.quantity,
          notes: result.notes,
        },
      ];
    });
    setPending(null);
  }

  async function handleSave() {
    const statusChanged = status !== table.status;
    if (!statusChanged && draft.length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      if (statusChanged) {
        await dispatch(updateTableStatusThunk({ id: table.id, status })).unwrap();
      }
      if (draft.length > 0) {
        await dispatch(
          createPresencialOrderThunk({
            table_id: table.id,
            send_to_kitchen: true,
            items: draft.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              notes: item.notes,
            })),
          }),
        ).unwrap();
      }
      onSuccess(
        draft.length > 0
          ? "Pedido enviado para a cozinha com sucesso!"
          : `Mesa ${table.number} atualizada para ${TABLE_STATUS_LABELS[status]}.`,
      );
      onClose();
    } catch (thrown) {
      setError(typeof thrown === "string" ? thrown : "Não foi possível salvar. Tente de novo.");
    } finally {
      setIsSaving(false);
    }
  }

  const itemCount = draftItemCount(draft);

  return (
    <div className="flex flex-col gap-5">
      <Select
        label="Status da mesa"
        name="status"
        value={status}
        onChange={(event) => handleStatusChange(event.target.value as TableStatus)}
      >
        {TABLE_STATUS_ORDER.map((value) => (
          <option key={value} value={value}>
            {TABLE_STATUS_LABELS[value]}
          </option>
        ))}
      </Select>

      {isDisabled ? (
        <Text variant="muted" className="rounded-xl border border-border bg-paper px-4 py-3">
          Mesa desativada não recebe pedidos. Mude o status para Livre ou Ocupada para anotar.
        </Text>
      ) : (
        <>
          {draft.length > 0 && (
            <div className="flex flex-col gap-2">
              <Text variant="label">
                Pedido · {itemCount} {itemCount === 1 ? "item" : "itens"}
              </Text>
              <OrderDraftList
                items={draft}
                onEdit={editDraftItem}
                onRemove={(key) =>
                  setDraft((current) => current.filter((item) => item.key !== key))
                }
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Text variant="label">Adicionar ao pedido</Text>
            <ProductPicker products={products} categories={categories} onPick={pickProduct} />
          </div>
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="sticky -bottom-6 -mx-6 -mb-6 flex flex-col gap-3 border-t border-border bg-surface px-6 pt-4 pb-6">
        {draft.length > 0 && (
          <div className="flex items-center justify-between">
            <Text variant="body" className="font-medium">
              Total
            </Text>
            <Text variant="body" className="text-lg font-bold tabular-nums">
              {formatCurrency(draftTotal(draft))}
            </Text>
          </div>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} isLoading={isSaving} className="flex-1">
            {draft.length > 0 && <FiSend size={16} />}
            Salvar
          </Button>
        </div>
        {canCloseAccount && !isDisabled && (
          <Button type="button" variant="success" size="lg" onClick={openCloseConfirmation}>
            <FiCheckCircle size={18} />
            Finalizar pedido
          </Button>
        )}
      </div>

      <ObservationSheet
        pick={pending}
        onConfirm={confirmPending}
        onCancel={() => setPending(null)}
      />

      <CloseAccountDialog
        isOpen={isConfirmingClose}
        tableNumber={table.number}
        account={account?.table === table.id ? account : null}
        isLoadingAccount={accountStatus === "loading"}
        isClosing={isClosing}
        error={closeError}
        onConfirm={handleCloseAccount}
        onCancel={() => setIsConfirmingClose(false)}
      />
    </div>
  );
}
