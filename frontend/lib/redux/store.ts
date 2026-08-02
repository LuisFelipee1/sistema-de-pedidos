import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import categoriesReducer from "./slices/categoriesSlice";
import employeesReducer from "./slices/employeesSlice";
import ordersReducer from "./slices/ordersSlice";
import productsReducer from "./slices/productsSlice";
import tablesReducer from "./slices/tablesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tables: tablesReducer,
    categories: categoriesReducer,
    products: productsReducer,
    employees: employeesReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
