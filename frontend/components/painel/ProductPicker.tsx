"use client";

import { useMemo, useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";

import { FilterChips, Text, type FilterChipOption } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import type { Category, Product } from "@/types/menu";

export interface ProductPickerProps {
  products: Product[];
  categories: Category[];
  onPick: (product: Product) => void;
}

const ALL = "todas";

export function ProductPicker({ products, categories, onPick }: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);

  const available = useMemo(
    () => products.filter((product) => product.is_available),
    [products],
  );

  const categoryOptions = useMemo<FilterChipOption<string>[]>(() => {
    const withProducts = categories.filter((category) =>
      available.some((product) => product.category === category.id),
    );
    return [
      { value: ALL, label: "Todas", count: available.length },
      ...withProducts.map((category) => ({
        value: String(category.id),
        label: category.name,
        count: available.filter((product) => product.category === category.id).length,
      })),
    ];
  }, [categories, available]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return available.filter((product) => {
      const matchesCategory = categoryFilter === ALL || String(product.category) === categoryFilter;
      const matchesSearch = !term || product.name.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [available, categoryFilter, search]);

  if (available.length === 0) {
    return (
      <Text variant="muted" className="py-6 text-center">
        Nenhum produto disponível no cardápio. Cadastre produtos antes de anotar pedidos.
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <FiSearch
          size={18}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted"
        />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto..."
          aria-label="Buscar produto"
          className="h-12 w-full rounded-xl border border-border bg-paper pr-4 pl-11 text-base
            text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
        />
      </div>

      {categoryOptions.length > 2 && (
        <FilterChips
          aria-label="Filtrar por categoria"
          options={categoryOptions}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      )}

      {visible.length === 0 ? (
        <Text variant="muted" className="py-6 text-center">
          Nenhum produto encontrado.
        </Text>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onPick(product)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface
                  px-4 py-3 text-left transition-colors hover:border-accent hover:bg-accent/5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{product.name}</span>
                  <span className="block text-sm text-ink-muted">
                    {formatCurrency(product.price)}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full
                    bg-accent text-accent-ink"
                >
                  <FiPlus size={18} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
