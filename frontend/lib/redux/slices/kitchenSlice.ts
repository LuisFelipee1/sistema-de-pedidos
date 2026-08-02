import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { extractErrorMessage } from "@/lib/api/errors";
import { fetchKitchenQueue, setKitchenStatus } from "@/lib/api/orders";
import type { KitchenQueueEntry, KitchenStatus } from "@/types/orders";

interface KitchenState {
  queue: KitchenQueueEntry[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Ignora respostas de fetchQueue fora de ordem — só a última requisição
   * disparada pode escrever na fila. */
  latestRequestId: string | null;
}

const initialState: KitchenState = {
  queue: [],
  status: "idle",
  error: null,
  latestRequestId: null,
};

export const fetchKitchenQueueThunk = createAsyncThunk(
  "kitchen/fetchQueue",
  async (_: void, { rejectWithValue }) => {
    try {
      return await fetchKitchenQueue();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const setKitchenStatusThunk = createAsyncThunk(
  "kitchen/setStatus",
  async (
    { tableId, status }: { tableId: number; status: KitchenStatus },
    { rejectWithValue },
  ) => {
    try {
      return await setKitchenStatus(tableId, status);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKitchenQueueThunk.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchKitchenQueueThunk.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "succeeded";
        state.queue = action.payload;
      })
      .addCase(fetchKitchenQueueThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(setKitchenStatusThunk.fulfilled, (state, action) => {
        // O backend devolve a fila inteira já recalculada.
        state.queue = action.payload;
        state.status = "succeeded";
      })
      .addCase(setKitchenStatusThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export default kitchenSlice.reducer;
