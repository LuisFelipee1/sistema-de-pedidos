"use client";

import { use, useEffect } from "react";

import { loadCart } from "@/lib/cart-storage";
import { useAppDispatch } from "@/lib/redux/hooks";
import { hydrateCart } from "@/lib/redux/slices/cartSlice";

/** Restaura o carrinho uma vez para toda a vitrine.
 *
 * Fica no layout, e não em cada página, porque o carrinho é gravado com o slug
 * do restaurante: se a página do produto adicionasse um item antes de alguém
 * ter definido esse slug, o item seria salvo como "de restaurante nenhum" e
 * descartado na volta para o cardápio. O layout não remonta ao navegar entre
 * as páginas filhas, então isso roda uma vez só. */
export default function CardapioLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateCart({ slug, saved: loadCart() }));
  }, [dispatch, slug]);

  return children;
}
