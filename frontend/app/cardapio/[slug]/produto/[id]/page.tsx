"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiLoader, FiMinus, FiPlus, FiSearch, FiX } from "react-icons/fi";

import { AddonGroupPicker } from "@/components/cardapio/AddonGroupPicker";
import { Button, Text } from "@/components/ui";
import { fetchPublicProduct } from "@/lib/api/restaurant";
import { formatCurrency } from "@/lib/format";
import { useAppDispatch } from "@/lib/redux/hooks";
import { addItem } from "@/lib/redux/slices/cartSlice";
import type { CartItemOption } from "@/types/cart";
import type { AddonGroup, AddonOption, Product } from "@/types/menu";

export default function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  /** Ids escolhidos por grupo. */
  const [choices, setChoices] = useState<Record<number, number[]>>({});

  useEffect(() => {
    let active = true;
    fetchPublicProduct(slug, Number(id))
      .then((data) => active && setProduct(data))
      .catch(() => active && setError("Produto não encontrado."))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [slug, id]);

  function toggle(group: AddonGroup, option: AddonOption) {
    setChoices((current) => {
      const selected = current[group.id] ?? [];
      // Composição é resposta única: escolher outra troca, não acumula.
      if (!group.is_addon) {
        return { ...current, [group.id]: selected.includes(option.id) ? [] : [option.id] };
      }
      return {
        ...current,
        [group.id]: selected.includes(option.id)
          ? selected.filter((value) => value !== option.id)
          : [...selected, option.id],
      };
    });
  }

  const selectedOptions = useMemo<CartItemOption[]>(() => {
    if (!product) return [];
    return product.addon_groups.flatMap((group) =>
      (choices[group.id] ?? []).flatMap((optionId) => {
        const option = group.options.find((entry) => entry.id === optionId);
        return option
          ? [
              {
                group_id: group.id,
                group_name: group.name,
                option_id: option.id,
                option_name: option.name,
                price_delta: option.price_delta,
              },
            ]
          : [];
      }),
    );
  }, [product, choices]);

  const missingGroups = useMemo(() => {
    if (!product) return [];
    return product.addon_groups.filter(
      (group) => group.is_required && (choices[group.id] ?? []).length === 0,
    );
  }, [product, choices]);

  const unitTotal = product
    ? Number(product.price) +
      selectedOptions.reduce((total, option) => total + Number(option.price_delta), 0)
    : 0;

  function handleAdd() {
    if (!product || missingGroups.length > 0) return;
    dispatch(addItem({ product, options: selectedOptions, quantity }));
    router.push(`/cardapio/${slug}`);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <FiLoader className="animate-spin text-ink-muted" size={32} aria-label="Carregando" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-6">
        <Text variant="h2">Produto indisponível</Text>
        <Text variant="muted">{error}</Text>
        <Button href={`/cardapio/${slug}`} variant="secondary">
          Voltar ao cardápio
        </Button>
      </div>
    );
  }

  const hasOptions = product.addon_groups.length > 0;

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-2xl pb-28">
        <div className="relative">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={800}
              height={450}
              className="aspect-[16/9] w-full object-cover"
              priority
            />
          ) : (
            <div className="aspect-[16/9] w-full bg-paper" />
          )}
          <button
            type="button"
            onClick={() => router.push(`/cardapio/${slug}`)}
            aria-label="Voltar ao cardápio"
            className="absolute top-4 left-4 flex size-10 items-center justify-center rounded-full
              bg-surface/90 text-ink shadow-md backdrop-blur transition-colors hover:bg-surface"
          >
            <FiArrowLeft size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2 px-4 py-5">
          <Text variant="h1" className="text-2xl">
            {product.name}
          </Text>
          <p className="text-xl font-semibold text-ink tabular-nums">
            {formatCurrency(product.price)}
          </p>
          {product.description && (
            <p className="whitespace-pre-line text-ink-muted">{product.description}</p>
          )}
        </div>

        {hasOptions && (
          <>
            <div className="relative px-4 pb-4">
              <FiSearch
                size={18}
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-8 -translate-y-1/2 text-ink-muted"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Pesquise pelo nome"
                aria-label="Pesquisar opção pelo nome"
                className="h-11 w-full rounded-xl border border-border bg-paper pr-10 pl-11
                  text-ink outline-none transition-colors placeholder:text-ink-muted
                  focus:border-accent"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Limpar busca"
                  className="absolute top-1/2 right-7 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>

            {product.addon_groups.map((group) => (
              <AddonGroupPicker
                key={group.id}
                group={group}
                selected={choices[group.id] ?? []}
                onToggle={toggle}
                search={search}
              />
            ))}
          </>
        )}
      </div>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface px-4 py-3
          pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.12)]"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border px-2 py-1.5">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              disabled={quantity <= 1}
              aria-label="Diminuir quantidade"
              className="flex size-8 items-center justify-center rounded-lg text-ink
                transition-colors hover:text-accent disabled:opacity-40"
            >
              <FiMinus size={16} />
            </button>
            <span className="w-5 text-center font-semibold tabular-nums">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              aria-label="Aumentar quantidade"
              className="flex size-8 items-center justify-center rounded-lg text-ink
                transition-colors hover:text-accent"
            >
              <FiPlus size={16} />
            </button>
          </div>

          <Button
            type="button"
            onClick={handleAdd}
            disabled={missingGroups.length > 0}
            className="flex-1"
            size="lg"
          >
            {missingGroups.length > 0
              ? `Escolha: ${missingGroups[0].name}`
              : `Avançar · ${formatCurrency(unitTotal * quantity)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
