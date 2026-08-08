import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { unitPrice, type CartItem, type CartItemOption, type CartSnapshot } from "@/types/cart";
import type { Product } from "@/types/menu";

interface CartState {
  /** Slug do restaurante dono deste carrinho. */
  slug: string | null;
  items: CartItem[];
  /** Só vira true depois de ler o localStorage, para a tela não piscar um
   * carrinho vazio antes de restaurar o que o cliente já tinha montado. */
  hydrated: boolean;
}

const initialState: CartState = {
  slug: null,
  items: [],
  hydrated: false,
};

/** Duas linhas se somam só quando é o mesmo produto com as mesmas escolhas. */
function signature(productId: number, options: CartItemOption[]): string {
  const ids = options
    .map((option) => option.option_id)
    .sort((a, b) => a - b)
    .join("-");
  return `${productId}:${ids}`;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Restaura o carrinho salvo, descartando se for de outro restaurante. */
    hydrateCart(state, action: PayloadAction<{ slug: string; saved: CartSnapshot | null }>) {
      const { slug, saved } = action.payload;
      state.hydrated = true;
      state.slug = slug;
      state.items = saved && saved.slug === slug ? saved.items : [];
    },
    addItem(
      state,
      action: PayloadAction<{ product: Product; options?: CartItemOption[]; quantity?: number }>,
    ) {
      const { product, options = [], quantity = 1 } = action.payload;
      const key = signature(product.id, options);
      const existing = state.items.find((item) => item.key === key);

      if (existing) {
        existing.quantity += quantity;
        return;
      }

      state.items.push({
        key,
        product_id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        options,
        quantity,
      });
    },
    incrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.key === action.payload);
      if (item) item.quantity += 1;
    },
    decrementItem(state, action: PayloadAction<string>) {
      const item = state.items.find((entry) => entry.key === action.payload);
      if (!item) return;
      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.key !== action.payload);
        return;
      }
      item.quantity -= 1;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((entry) => entry.key !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { hydrateCart, addItem, incrementItem, decrementItem, removeItem, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

// --- Seletores derivados ---

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + unitPrice(item) * item.quantity, 0);
}
