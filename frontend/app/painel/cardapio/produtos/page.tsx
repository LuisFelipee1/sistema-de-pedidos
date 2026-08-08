"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";

import { Button, DataTable, Text } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { fetchCategoriesThunk } from "@/lib/redux/slices/categoriesSlice";
import { deleteProductThunk, fetchProductsThunk } from "@/lib/redux/slices/productsSlice";
import type { Product } from "@/types/menu";

export default function ProdutosPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.products);
  const { items: categories } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProductsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  async function handleDelete(product: Product) {
    if (!window.confirm(`Remover o produto "${product.name}"?`)) return;
    await dispatch(deleteProductThunk(product.id));
  }

  const categoryName = (categoryId: number) =>
    categories.find((category) => category.id === categoryId)?.name ?? "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Text variant="h1" className="text-2xl">
            Produtos
          </Text>
          <Text variant="muted">Cadastre os produtos do cardápio, preços e fotos.</Text>
        </div>
        {/* O cadastro tem construtor de perguntas e não cabe num modal. */}
        <Button
          onClick={() => router.push("/painel/cardapio/produtos/novo")}
          disabled={categories.length === 0}
          className="shrink-0"
        >
          <FiPlus size={16} />
          <span className="hidden sm:inline">Novo produto</span>
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
          {
            key: "category",
            header: "Categoria",
            render: (product) => categoryName(product.category),
          },
          { key: "price", header: "Preço", render: (product) => formatCurrency(product.price) },
          {
            key: "addons",
            header: "Perguntas",
            render: (product) => product.addon_groups.length || "—",
          },
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
                  onClick={() => router.push(`/painel/cardapio/produtos/${product.id}`)}
                  className="text-ink-muted transition-colors hover:text-accent"
                  aria-label={`Editar ${product.name}`}
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product)}
                  className="text-ink-muted transition-colors hover:text-danger"
                  aria-label={`Remover ${product.name}`}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
