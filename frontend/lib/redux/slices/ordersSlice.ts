import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { extractErrorMessage } from "@/lib/api/errors";
import { createPresencialOrder } from "@/lib/api/orders";
import type { Order, PresencialOrderPayload } from "@/types/orders";

interface OrdersState {
  /** Último pedido enviado — usado só para feedback na tela do garçom. */
  lastCreated: Order | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: OrdersState = {
  lastCreated: null,
  status: "idle",
  error: null,
};

export const createPresencialOrderThunk = createAsyncThunk(
  "orders/createPresencial",
  async (payload: PresencialOrderPayload, { rejectWithValue }) => {
    try {
      return await createPresencialOrder(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPresencialOrderThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createPresencialOrderThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.lastCreated = action.payload;
      })
      .addCase(createPresencialOrderThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default ordersSlice.reducer;
