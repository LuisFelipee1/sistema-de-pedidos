"use client";

import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

import { KitchenOrderModal } from "@/components/painel/KitchenOrderModal";
import { KitchenTableCard } from "@/components/painel/KitchenTableCard";
import { FilterChips, Modal, Text, Toast, type FilterChipOption } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchKitchenQueueThunk } from "@/lib/redux/slices/kitchenSlice";
import { KITCHEN_STATUS_LABELS, KITCHEN_STATUS_ORDER, type KitchenStatus } from "@/types/orders";

type Filter = KitchenStatus | "todas";

/** A tela fica aberta numa TV sem ninguém tocando nela, então precisa buscar
 * pedidos novos sozinha — senão a cozinha nunca vê o que o garçom lançou. */
const REFRESH_MS = 15_000;

export default function CozinhaPage() {
  const dispatch = useAppDispatch();
  const { queue, status } = useAppSelector((state) => state.kitchen);

  const [filter, setFilter] = useState<Filter>("todas");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openToken, setOpenToken] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    dispatch(fetchKitchenQueueThunk());
    const timer = setInterval(() => {
      dispatch(fetchKitchenQueueThunk());
      setNow(Date.now());
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [dispatch]);

  const selectedEntry = queue.find((entry) => entry.table.id === selectedTableId) ?? null;

  const filterOptions = useMemo<FilterChipOption<Filter>[]>(
    () => [
      { value: "todas", label: "Todas", count: queue.length },
      ...KITCHEN_STATUS_ORDER.map((value) => ({
        value,
        label: KITCHEN_STATUS_LABELS[value],
        count: queue.filter((entry) => entry.status === value).length,
      })),
    ],
    [queue],
  );

  const visible = useMemo(
    () => (filter === "todas" ? queue : queue.filter((entry) => entry.status === filter)),
    [queue, filter],
  );

  const isLoading = status === "loading" && queue.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Text variant="h1" className="text-2xl sm:text-3xl">
          Cozinha
        </Text>
        <Text variant="muted" className="text-base">
          Pedidos das mesas ocupadas. Toque em uma mesa para mudar o status.
        </Text>
      </div>

      <FilterChips
        aria-label="Filtrar pedidos por status"
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="animate-spin text-ink-muted" size={32} aria-label="Carregando" />
        </div>
      ) : visible.length === 0 ? (
        <Text variant="muted" className="py-20 text-center text-lg">
          {queue.length === 0
            ? "Nenhum pedido na cozinha agora."
            : `Nenhuma mesa em "${KITCHEN_STATUS_LABELS[filter as KitchenStatus]}" no momento.`}
        </Text>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {visible.map((entry) => (
            <li key={entry.table.id}>
              <KitchenTableCard
                entry={entry}
                now={now}
                onSelect={(selected) => {
                  setSelectedTableId(selected.table.id);
                  setOpenToken((token) => token + 1);
                  setIsModalOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEntry ? `Mesa ${selectedEntry.table.number}` : "Pedido"}
      >
        {selectedEntry && (
          <KitchenOrderModal
            key={openToken}
            entry={selectedEntry}
            onClose={() => setIsModalOpen(false)}
            onSuccess={setToast}
          />
        )}
      </Modal>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
