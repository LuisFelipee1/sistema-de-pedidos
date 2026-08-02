"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { TableForm } from "@/components/painel/TableForm";
import { Button, DataTable, Modal, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  createTableThunk,
  deleteTableThunk,
  fetchTablesThunk,
  updateTableThunk,
} from "@/lib/redux/slices/tablesSlice";
import { TABLE_STATUS_LABELS, type RestaurantTable, type TablePayload } from "@/types/tables";

export default function MesasPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.tables);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);

  useEffect(() => {
    dispatch(fetchTablesThunk());
  }, [dispatch]);

  function openCreate() {
    setEditingTable(null);
    setModalMode("create");
  }

  function openEdit(table: RestaurantTable) {
    setEditingTable(table);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingTable(null);
  }

  async function handleSubmit(payload: TablePayload) {
    if (modalMode === "edit" && editingTable) {
      await dispatch(updateTableThunk({ id: editingTable.id, payload })).unwrap();
    } else {
      await dispatch(createTableThunk(payload)).unwrap();
    }
    closeModal();
  }

  async function handleDelete(table: RestaurantTable) {
    if (!window.confirm(`Remover a mesa ${table.number}?`)) return;
    await dispatch(deleteTableThunk(table.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h1" className="text-2xl">
            Mesas
          </Text>
          <Text variant="muted">Gerencie as mesas do seu restaurante.</Text>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} />
          Nova mesa
        </Button>
      </div>

      <DataTable
        data={items}
        isLoading={status === "loading"}
        emptyMessage="Nenhuma mesa cadastrada ainda."
        keyExtractor={(table) => table.id}
        columns={[
          { key: "number", header: "Número", render: (table) => `Mesa ${table.number}` },
          { key: "status", header: "Status", render: (table) => TABLE_STATUS_LABELS[table.status] },
          {
            key: "actions",
            header: "",
            render: (table) => (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(table)}
                  className="text-ink-muted transition-colors hover:text-accent"
                  aria-label="Editar"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(table)}
                  className="text-ink-muted transition-colors hover:text-danger"
                  aria-label="Remover"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        isOpen={modalMode !== null}
        onClose={closeModal}
        title={modalMode === "edit" ? "Editar mesa" : "Nova mesa"}
      >
        <TableForm initialValue={editingTable ?? undefined} onSubmit={handleSubmit} onCancel={closeModal} />
      </Modal>
    </div>
  );
}
