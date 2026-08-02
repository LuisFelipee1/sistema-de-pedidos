import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createTable,
  deleteTable,
  listTables,
  updateTable,
  updateTableStatus,
} from "@/lib/api/tables";
import { extractErrorMessage } from "@/lib/api/errors";
import type { RestaurantTable, TablePayload, TableStatus } from "@/types/tables";

import { createPresencialOrderThunk } from "./ordersSlice";

interface TablesState {
  items: RestaurantTable[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Ignora respostas de fetchTablesThunk fora de ordem (ex: Strict Mode
   * disparando o efeito de mount duas vezes) — só a última requisição
   * disparada pode escrever em items, senão uma resposta antiga pode
   * sobrescrever um item criado/editado nesse meio tempo. */
  latestRequestId: string | null;
}

const initialState: TablesState = {
  items: [],
  status: "idle",
  error: null,
  latestRequestId: null,
};

export const fetchTablesThunk = createAsyncThunk(
  "tables/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      return await listTables();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createTableThunk = createAsyncThunk(
  "tables/create",
  async (payload: TablePayload, { rejectWithValue }) => {
    try {
      return await createTable(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateTableThunk = createAsyncThunk(
  "tables/update",
  async ({ id, payload }: { id: number; payload: Partial<TablePayload> }, { rejectWithValue }) => {
    try {
      return await updateTable(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

/** Usado pelo garçom: só troca o status, sem exigir permissão de administrador. */
export const updateTableStatusThunk = createAsyncThunk(
  "tables/updateStatus",
  async ({ id, status }: { id: number; status: TableStatus }, { rejectWithValue }) => {
    try {
      return await updateTableStatus(id, status);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteTableThunk = createAsyncThunk(
  "tables/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteTable(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const tablesSlice = createSlice({
  name: "tables",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTablesThunk.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchTablesThunk.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTablesThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createTableThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateTableThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateTableStatusThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(createPresencialOrderThunk.fulfilled, (state, action) => {
        // O backend marca a mesa como ocupada ao receber o pedido; espelhamos
        // aqui para a tela não ficar mostrando "Livre" logo após o envio.
        const index = state.items.findIndex((item) => item.id === action.payload.table);
        if (index !== -1) state.items[index].status = "ocupada";
      })
      .addCase(deleteTableThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default tablesSlice.reducer;
