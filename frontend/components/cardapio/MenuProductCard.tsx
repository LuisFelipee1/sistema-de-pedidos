"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FiChevronRight } from "react-icons/fi";

import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types/menu";

export interface MenuProductCardProps {
  product: Product;
  /** Quantidade já no carrinho, somando todas as variações do produto. */
  quantity: number;
  onSelect: (product: Product) => void;
}

export function MenuProductCard({ product, quantity, onSelect }: MenuProductCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(product)}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      aria-label={`Ver ${product.name}`}
      className="flex w-full items-start gap-3 rounded-2xl border border-border bg-surface p-3
        text-left transition-colors hover:border-accent sm:p-4"
    >
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

      <span className="flex shrink-0 items-center gap-2 self-center">
        {quantity > 0 && (
          <span
            className="flex min-w-6 items-center justify-center rounded-full bg-accent px-1.5
              py-0.5 text-xs font-bold text-accent-ink tabular-nums"
          >
            {quantity}
          </span>
        )}
        <FiChevronRight size={20} className="text-ink-muted" aria-hidden />
      </span>
    </motion.button>
  );
}
