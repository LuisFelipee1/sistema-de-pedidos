"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiPlus } from "react-icons/fi";

import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/menu";

export interface MenuProductCardProps {
  product: Product;
  /** Quantidade já no carrinho, para o cliente ver o que somou. */
  quantity: number;
  onAdd: (product: Product) => void;
}

export function MenuProductCard({ product, quantity, onAdd }: MenuProductCardProps) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-3 sm:p-4">
      {product.image && (
        <Image
          src={product.image}
          alt={product.name}
          width={88}
          height={88}
          className="size-20 shrink-0 rounded-xl object-cover sm:size-22"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="font-semibold text-ink">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-ink-muted">{product.description}</p>
        )}
        <p className="mt-auto font-bold text-ink tabular-nums">{formatCurrency(product.price)}</p>
      </div>

      <motion.button
        type="button"
        onClick={() => onAdd(product)}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        aria-label={`Adicionar ${product.name} ao carrinho`}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-xl
          bg-accent text-accent-ink shadow-sm shadow-accent/30"
      >
        <FiPlus size={20} />
        {quantity > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 flex min-w-5 items-center justify-center
              rounded-full border-2 border-surface bg-ink px-1 text-[11px] font-bold text-paper
              tabular-nums"
          >
            {quantity}
          </span>
        )}
      </motion.button>
    </article>
  );
}
