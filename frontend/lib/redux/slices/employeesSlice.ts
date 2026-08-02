import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  listRoles,
  updateEmployee,
} from "@/lib/api/employees";
import { extractErrorMessage } from "@/lib/api/errors";
import type { Employee, EmployeePayload, Role } from "@/types/employees";

interface EmployeesState {
  items: Employee[];
  roles: Role[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  /** Ignora respostas de fetchEmployeesThunk fora de ordem — só a última
   * requisição disparada pode escrever em items/roles. */
  latestRequestId: string | null;
}

const initialState: EmployeesState = {
  items: [],
  roles: [],
  status: "idle",
  error: null,
  latestRequestId: null,
};

export const fetchEmployeesThunk = createAsyncThunk(
  "employees/fetchAll",
  async (_: void, { rejectWithValue }) => {
    try {
      const [employees, roles] = await Promise.all([listEmployees(), listRoles()]);
      return { employees, roles };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createEmployeeThunk = createAsyncThunk(
  "employees/create",
  async (payload: EmployeePayload, { rejectWithValue }) => {
    try {
      return await createEmployee(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateEmployeeThunk = createAsyncThunk(
  "employees/update",
  async (
    { id, payload }: { id: number; payload: Partial<EmployeePayload> },
    { rejectWithValue },
  ) => {
    try {
      return await updateEmployee(id, payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteEmployeeThunk = createAsyncThunk(
  "employees/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteEmployee(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesThunk.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "succeeded";
        state.items = action.payload.employees;
        state.roles = action.payload.roles;
      })
      .addCase(fetchEmployeesThunk.rejected, (state, action) => {
        if (action.meta.requestId !== state.latestRequestId) return;
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(createEmployeeThunk.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateEmployeeThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteEmployeeThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default employeesSlice.reducer;
