import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { saveCart } from "@/lib/cart-storage";

import authReducer from "./slices/authSlice";
import cartReducer, {
  addItem,
  clearCart,
  decrementItem,
  hydrateCart,
  removeItem,
} from "./slices/cartSlice";
import categoriesReducer from "./slices/categoriesSlice";
import employeesReducer from "./slices/employeesSlice";
import kitchenReducer from "./slices/kitchenSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import tablesReducer from "./slices/tablesSlice";

/** Grava o carrinho no navegador a cada mudança. Fica aqui, e não nas telas,
 * para nenhuma alteração futura do carrinho esquecer de persistir. */
const cartPersistence = createListenerMiddleware();

cartPersistence.startListening({
  matcher: isAnyOf(hydrateCart, addItem, decrementItem, removeItem, clearCart),
  effect: (_action, api) => {
    const { cart } = api.getState() as RootState;
    saveCart({ slug: cart.slug, items: cart.items });
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tables: tablesReducer,
    categories: categoriesReducer,
    products: productsReducer,
    employees: employeesReducer,
    orders: ordersReducer,
    kitchen: kitchenReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(cartPersistence.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
