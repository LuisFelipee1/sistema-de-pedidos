import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { extractErrorMessage } from "@/lib/api/errors";
import {
  closeTableAccount,
  createPresencialOrder,
  fetchTableAccount,
  listFinishedOrders,
} from "@/lib/api/orders";
import type { Order, PresencialOrderPayload, TableAccount } from "@/types/orders";

interface OrdersState {
  /** Último pedido enviado — usado só para feedback na tela do garçom. */
  lastCreated: Order | null;
  /** Conta aberta da mesa que está sendo visualizada no momento. */
  account: TableAccount | null;
  accountStatus: "idle" | "loading" | "succeeded" | "failed";
  finished: Order[];
  finishedStatus: "idle" | "loading" | "succeeded" | "failed";
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Ignora respostas de listFinished fora de ordem — só a última requisição
   * disparada pode escrever em finished. */
  latestFinishedRequestId: string | null;
}

const initialState: OrdersState = {
  lastCreated: null,
  account: null,
  accountStatus: "idle",
  finished: [],
  finishedStatus: "idle",
  status: "idle",
  error: null,
  latestFinishedRequestId: null,
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

export const fetchTableAccountThunk = createAsyncThunk(
  "orders/fetchTableAccount",
  async (tableId: number, { rejectWithValue }) => {
    try {
      return await fetchTableAccount(tableId);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const closeTableAccountThunk = createAsyncThunk(
  "orders/closeTableAccount",
  async (tableId: number, { rejectWithValue }) => {
    try {
      return await closeTableAccount(tableId);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const fetchFinishedOrdersThunk = createAsyncThunk(
  "orders/fetchFinished",
  async (_: void, { rejectWithValue }) => {
    try {
      return await listFinishedOrders();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearTableAccount(state) {
      state.account = null;
      state.accountStatus = "idle";
    },
  },
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
      })
      .addCase(fetchTableAccountThunk.pending, (state) => {
        state.accountStatus = "loading";
      })
      .addCase(fetchTableAccountThunk.fulfilled, (state, action) => {
        state.accountStatus = "succeeded";
        state.account = action.payload;
      })
      .addCase(fetchTableAccountThunk.rejected, (state, action) => {
        state.accountStatus = "failed";
        state.error = action.payload as string;
      })
      .addCase(closeTableAccountThunk.fulfilled, (state) => {
        // A conta fechada deixa de existir; a lista de finalizados é recarregada
        // sob demanda pelo dashboard.
        state.account = null;
        state.accountStatus = "idle";
      })
      .addCase(fetchFinishedOrdersThunk.pending, (state, action) => {
        state.finishedStatus = "loading";
        state.latestFinishedRequestId = action.meta.requestId;
      })
      .addCase(fetchFinishedOrdersThunk.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestFinishedRequestId) return;
        state.finishedStatus = "succeeded";
        state.finished = action.payload;
      })
      .addCase(fetchFinishedOrdersThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestFinishedRequestId) return;
        state.finishedStatus = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearTableAccount } = ordersSlice.actions;
export default ordersSlice.reducer;
