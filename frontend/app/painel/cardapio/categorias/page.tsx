"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { CategoryForm } from "@/components/painel/CategoryForm";
import { Button, DataTable, Modal, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  createCategoryThunk,
  deleteCategoryThunk,
  fetchCategoriesThunk,
  updateCategoryThunk,
} from "@/lib/redux/slices/categoriesSlice";
import type { Category, CategoryPayload } from "@/types/menu";

export default function CategoriasPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.categories);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  function openCreate() {
    setEditingCategory(null);
    setModalMode("create");
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingCategory(null);
  }

  async function handleSubmit(payload: CategoryPayload) {
    if (modalMode === "edit" && editingCategory) {
      await dispatch(updateCategoryThunk({ id: editingCategory.id, payload })).unwrap();
    } else {
      await dispatch(createCategoryThunk(payload)).unwrap();
    }
    closeModal();
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Remover a categoria "${category.name}"?`)) return;
    await dispatch(deleteCategoryThunk(category.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h1" className="text-2xl">
            Categorias
          </Text>
          <Text variant="muted">Organize o cardápio em categorias.</Text>
        </div>
        <Button onClick={openCreate}>
          <FiPlus size={16} />
          Nova categoria
        </Button>
      </div>

      <DataTable
        data={items}
        isLoading={status === "loading"}
        emptyMessage="Nenhuma categoria cadastrada ainda."
        keyExtractor={(category) => category.id}
        columns={[
          { key: "name", header: "Nome", render: (category) => category.name },
          {
            key: "is_active",
            header: "Status",
            render: (category) => (category.is_active ? "Ativa" : "Inativa"),
          },
          {
            key: "actions",
            header: "",
            render: (category) => (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(category)}
                  className="text-ink-muted transition-colors hover:text-accent"
                  aria-label="Editar"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
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
        title={modalMode === "edit" ? "Editar categoria" : "Nova categoria"}
      >
        <CategoryForm
          initialValue={editingCategory ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
