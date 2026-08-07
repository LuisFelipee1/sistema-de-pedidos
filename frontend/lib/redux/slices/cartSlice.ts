import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CartItem, CartSnapshot } from "@/types/cart";
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
    addItem(state, action: PayloadAction<Product>) {
      const product = action.payload;
      const existing = state.items.find((item) => item.product_id === product.id);
      if (existing) {
        existing.quantity += 1;
        return;
      }
      state.items.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    },
    decrementItem(state, action: PayloadAction<number>) {
      const item = state.items.find((entry) => entry.product_id === action.payload);
      if (!item) return;
      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.product_id !== action.payload);
        return;
      }
      item.quantity -= 1;
    },
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((entry) => entry.product_id !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { hydrateCart, addItem, decrementItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

// --- Seletores derivados ---

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
}
