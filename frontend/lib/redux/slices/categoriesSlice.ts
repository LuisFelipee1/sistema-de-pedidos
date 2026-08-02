import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { createCategory, deleteCategory, listCategories, updateCategory } from "@/lib/api/menu";
import { extractErrorMessage } from "@/lib/api/errors";
import type { Category, CategoryPayload } from "@/types/menu";

interface CategoriesState {
  items: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Ignora respostas de fetchCategoriesThunk fora de ordem — só a última
   * requisição disparada pode escrever em items. */
  latestRequestId: string | null;
}

const initialState: CategoriesState = {
  items: [],
  status: "idle",
  error: null,
  latestRequestId: null,
};

export const fetchCategoriesThunk = createAsyncThunk(
  "categories/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      return await listCategories();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createCategoryThunk = createAsyncThunk(
  "categories/create",
  async (payload: CategoryPayload, { rejectWithValue }) => {
    try {
      return await createCategory(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateCategoryThunk = createAsyncThunk(
  "categories/update",
  async (
    { id, payload }: { id: number; payload: Partial<CategoryPayload> },
    { rejectWithValue },
  ) => {
    try {
      return await updateCategory(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteCategoryThunk = createAsyncThunk(
  "categories/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteCategory(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategoriesThunk.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createCategoryThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default categoriesSlice.reducer;
