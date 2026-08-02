"use client";

import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { ProductForm } from "@/components/painel/ProductForm";
import { Button, DataTable, Modal, Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCategoriesThunk } from "@/lib/redux/slices/categoriesSlice";
import {
  createProductThunk,
  deleteProductThunk,
  fetchProductsThunk,
  updateProductThunk,
} from "@/lib/redux/slices/productsSlice";
import type { Product, ProductPayload } from "@/types/menu";

export default function ProdutosPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.products);
  const { items: categories } = useAppSelector((state) => state.categories);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchProductsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  function openCreate() {
    setEditingProduct(null);
    setModalMode("create");
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingProduct(null);
  }

  async function handleSubmit(payload: ProductPayload) {
    if (modalMode === "edit" && editingProduct) {
      await dispatch(updateProductThunk({ id: editingProduct.id, payload })).unwrap();
    } else {
      await dispatch(createProductThunk(payload)).unwrap();
    }
    closeModal();
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Remover o produto "${product.name}"?`)) return;
    await dispatch(deleteProductThunk(product.id));
  }

  const categoryName = (categoryId: number) =>
    categories.find((category) => category.id === categoryId)?.name ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Text variant="h1" className="text-2xl">
            Produtos
          </Text>
          <Text variant="muted">Cadastre os produtos do cardápio, preços e fotos.</Text>
        </div>
        <Button onClick={openCreate} disabled={categories.length === 0}>
          <FiPlus size={16} />
          Novo produto
        </Button>
      </div>

      {categories.length === 0 && status !== "loading" && (
        <Text variant="muted">Crie ao menos uma categoria antes de cadastrar produtos.</Text>
      )}

      <DataTable
        data={items}
        isLoading={status === "loading"}
        emptyMessage="Nenhum produto cadastrado ainda."
        keyExtractor={(product) => product.id}
        columns={[
          { key: "name", header: "Nome", render: (product) => product.name },
          { key: "category", header: "Categoria", render: (product) => categoryName(product.category) },
          { key: "price", header: "Preço", render: (product) => `R$ ${product.price}` },
          {
            key: "is_available",
            header: "Status",
            render: (product) => (product.is_available ? "Disponível" : "Indisponível"),
          },
          {
            key: "actions",
            header: "",
            render: (product) => (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="text-ink-muted transition-colors hover:text-accent"
                  aria-label="Editar"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
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
        title={modalMode === "edit" ? "Editar produto" : "Novo produto"}
      >
        <ProductForm
          initialValue={editingProduct ?? undefined}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
