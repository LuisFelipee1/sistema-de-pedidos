import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createProduct, deleteProduct, listProducts, updateProduct } from "@/lib/api/menu";
import { extractErrorMessage } from "@/lib/api/errors";
import type { Product, ProductPayload } from "@/types/menu";

interface ProductsState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Ignora respostas de fetchProductsThunk fora de ordem — só a última
   * requisição disparada pode escrever em items. */
  latestRequestId: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
  latestRequestId: null,
};

export const fetchProductsThunk = createAsyncThunk(
  "products/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      return await listProducts();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createProductThunk = createAsyncThunk(
  "products/create",
  async (payload: ProductPayload, { rejectWithValue }) => {
    try {
      return await createProduct(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async (
    { id, payload }: { id: number; payload: Partial<ProductPayload> },
    { rejectWithValue },
  ) => {
    try {
      return await updateProduct(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsThunk.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchProductsThunk.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProductsThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default productsSlice.reducer;
