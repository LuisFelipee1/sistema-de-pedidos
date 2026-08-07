"use client";

import { use, useEffect, useMemo, useState } from "react";
import { FiLoader, FiSearch } from "react-icons/fi";

import { CartFooter } from "@/components/cardapio/CartFooter";
import { CartReview } from "@/components/cardapio/CartReview";
import { MenuProductCard } from "@/components/cardapio/MenuProductCard";
import { RestaurantHeader } from "@/components/cardapio/RestaurantHeader";
import { FilterChips, Modal, Text, type FilterChipOption } from "@/components/ui";
import {
  fetchPublicCategories,
  fetchPublicProducts,
  fetchPublicRestaurant,
} from "@/lib/api/restaurant";
import { loadCart } from "@/lib/cart-storage";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addItem,
  cartItemCount,
  cartTotal,
  decrementItem,
  hydrateCart,
  removeItem,
} from "@/lib/redux/slices/cartSlice";
import type { Category, Product } from "@/types/menu";
import type { PublicRestaurant } from "@/types/restaurant";

const ALL = "todas";

export default function CardapioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);

  const [restaurant, setRestaurant] = useState<PublicRestaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Rota aberta: nenhuma chamada aqui depende de login.
  useEffect(() => {
    // `isLoading` já nasce true — marcar de novo aqui só provocaria uma
    // renderização extra antes das requisições saírem.
    let active = true;

    Promise.all([
      fetchPublicRestaurant(slug),
      fetchPublicCategories(slug),
      fetchPublicProducts(slug),
    ])
      .then(([restaurantData, categoriesData, productsData]) => {
        if (!active) return;
        setRestaurant(restaurantData);
        setCategories(categoriesData);
        setProducts(productsData);
        setError(null);
      })
      .catch(() => {
        if (active) setError("Não encontramos esse cardápio.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  // localStorage só existe no navegador, então a leitura fica fora da render.
  useEffect(() => {
    dispatch(hydrateCart({ slug, saved: loadCart() }));
  }, [dispatch, slug]);

  const categoryOptions = useMemo<FilterChipOption<string>[]>(() => {
    const withProducts = categories.filter((category) =>
      products.some((product) => product.category === category.id),
    );
    return [
      { value: ALL, label: "Todas", count: products.length },
      ...withProducts.map((category) => ({
        value: String(category.id),
        label: category.name,
        count: products.filter((product) => product.category === category.id).length,
      })),
    ];
  }, [categories, products]);

  /** Categorias visíveis com os produtos já filtrados por busca e chip. */
  const sections = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matches = products.filter((product) => {
      const matchesCategory = categoryFilter === ALL || String(product.category) === categoryFilter;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });

    return categories
      .map((category) => ({
        category,
        products: matches.filter((product) => product.category === category.id),
      }))
      .filter((section) => section.products.length > 0);
  }, [products, categories, search, categoryFilter]);

  const itemCount = cartItemCount(items);
  const total = cartTotal(items);
  const quantityOf = (productId: number) =>
    items.find((item) => item.product_id === productId)?.quantity ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <FiLoader className="animate-spin text-ink-muted" size={32} aria-label="Carregando" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-paper px-6">
        <Text variant="h2">Cardápio indisponível</Text>
        <Text variant="muted">{error}</Text>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* pb generoso para a barra do carrinho não cobrir o último produto. */}
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-6 pb-32">
        <RestaurantHeader restaurant={restaurant} />

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
            placeholder="Buscar no cardápio..."
            aria-label="Buscar no cardápio"
            className="h-12 w-full rounded-xl border border-border bg-surface pr-4 pl-11 text-base
              text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-accent"
          />
        </div>

        {categoryOptions.length > 1 && (
          <FilterChips
            aria-label="Filtrar por categoria"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        )}

        {sections.length === 0 ? (
          <Text variant="muted" className="py-16 text-center">
            {products.length === 0
              ? "Este restaurante ainda não publicou produtos."
              : "Nenhum produto encontrado."}
          </Text>
        ) : (
          sections.map((section) => (
            <section key={section.category.id} className="flex flex-col gap-3">
              <Text variant="h2" id={`categoria-${section.category.id}`}>
                {section.category.name}
              </Text>
              <ul className="flex flex-col gap-3">
                {section.products.map((product) => (
                  <li key={product.id}>
                    <MenuProductCard
                      product={product}
                      quantity={quantityOf(product.id)}
                      onAdd={(picked) => dispatch(addItem(picked))}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <CartFooter itemCount={itemCount} total={total} onOpen={() => setIsCartOpen(true)} />

      <Modal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} title="Seu pedido">
        <CartReview
          items={items}
          total={total}
          onIncrement={(productId) => {
            const product = products.find((entry) => entry.id === productId);
            if (product) dispatch(addItem(product));
          }}
          onDecrement={(productId) => dispatch(decrementItem(productId))}
          onRemove={(productId) => dispatch(removeItem(productId))}
        />
      </Modal>
    </div>
  );
}
