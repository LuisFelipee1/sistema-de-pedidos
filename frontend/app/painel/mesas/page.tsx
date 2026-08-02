"use client";

import { useEffect, useMemo, useState } from "react";
import { FiLoader, FiPlus } from "react-icons/fi";

import { TableCard } from "@/components/painel/TableCard";
import { TableOrderModal } from "@/components/painel/TableOrderModal";
import { Button, FilterChips, Modal, Text, Toast, type FilterChipOption } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCategoriesThunk } from "@/lib/redux/slices/categoriesSlice";
import { fetchProductsThunk } from "@/lib/redux/slices/productsSlice";
import { createTableThunk, fetchTablesThunk } from "@/lib/redux/slices/tablesSlice";
import { TABLE_STATUS_LABELS, TABLE_STATUS_ORDER, type TableStatus } from "@/types/tables";

type Filter = TableStatus | "todas";

export default function MesasPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.tables);
  const products = useAppSelector((state) => state.products.items);
  const categories = useAppSelector((state) => state.categories.items);
  const isAdmin = useAppSelector((state) => state.auth.roles.includes("administrador"));

  const [filter, setFilter] = useState<Filter>("todas");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  /** Muda a cada abertura do modal para remontá-lo, garantindo que o pedido
   * comece vazio mesmo ao reabrir a mesma mesa. */
  const [openToken, setOpenToken] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTablesThunk());
    dispatch(fetchProductsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  // Derivar do store em vez de guardar o objeto da mesa: assim o modal enxerga
  // o status novo assim que o backend responde.
  const selectedTable = items.find((table) => table.id === selectedTableId) ?? null;

  const filterOptions = useMemo<FilterChipOption<Filter>[]>(
    () => [
      { value: "todas", label: "Todas", count: items.length },
      ...TABLE_STATUS_ORDER.map((value) => ({
        value,
        label: TABLE_STATUS_LABELS[value],
        count: items.filter((table) => table.status === value).length,
      })),
    ],
    [items],
  );

  const visibleTables = useMemo(
    () => (filter === "todas" ? items : items.filter((table) => table.status === filter)),
    [items, filter],
  );

  async function handleCreateTable() {
    const nextNumber = items.reduce((highest, table) => Math.max(highest, table.number), 0) + 1;
    setIsCreating(true);
    try {
      await dispatch(createTableThunk({ number: nextNumber })).unwrap();
      setToast(`Mesa ${nextNumber} criada.`);
    } catch {
      setToast("Não foi possível criar a mesa.");
    } finally {
      setIsCreating(false);
    }
  }

  const isLoading = status === "loading" && items.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text variant="h1" className="text-2xl sm:text-3xl">
            Mesas
          </Text>
          <Text variant="muted">Toque em uma mesa para mudar o status ou anotar o pedido.</Text>
        </div>
        {isAdmin && (
          <Button onClick={handleCreateTable} isLoading={isCreating} className="shrink-0">
            <FiPlus size={16} />
            <span className="hidden sm:inline">Nova mesa</span>
          </Button>
        )}
      </div>

      <FilterChips
        aria-label="Filtrar mesas por status"
        options={filterOptions}
        value={filter}
        onChange={setFilter}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <FiLoader className="animate-spin text-ink-muted" size={28} aria-label="Carregando" />
        </div>
      ) : visibleTables.length === 0 ? (
        <Text variant="muted" className="py-16 text-center">
          {items.length === 0
            ? "Nenhuma mesa cadastrada ainda."
            : `Nenhuma mesa ${TABLE_STATUS_LABELS[filter as TableStatus].toLowerCase()} no momento.`}
        </Text>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
          {visibleTables.map((table) => (
            <li key={table.id}>
              <TableCard
                table={table}
                onSelect={(selected) => {
                  setSelectedTableId(selected.id);
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
        title={selectedTable ? `Mesa ${selectedTable.number}` : "Mesa"}
      >
        {selectedTable && (
          <TableOrderModal
            key={openToken}
            table={selectedTable}
            products={products}
            categories={categories}
            onClose={() => setIsModalOpen(false)}
            onSuccess={setToast}
          />
        )}
      </Modal>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
