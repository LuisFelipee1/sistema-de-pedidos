import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchMe, login, signupRestaurant } from "@/lib/api/auth";
import { extractErrorMessage } from "@/lib/api/errors";
import type { LoginPayload, Me, Restaurant, RestaurantSignupPayload } from "@/types/auth";

interface AuthState {
  username: string | null;
  restaurant: Restaurant | null;
  roles: string[];
  accessToken: string | null;
  refreshToken: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  username: null,
  restaurant: null,
  roles: [],
  accessToken: null,
  refreshToken: null,
  status: "idle",
  error: null,
};

function persistTokens(access: string, refresh: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("access_token", access);
  window.localStorage.setItem("refresh_token", refresh);
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
}

export const signupRestaurantThunk = createAsyncThunk(
  "auth/signupRestaurant",
  async (payload: RestaurantSignupPayload, { rejectWithValue }) => {
    try {
      const data = await signupRestaurant(payload);
      persistTokens(data.access, data.refresh);
      return { tokens: data, me: { roles: ["administrador"] } as Pick<Me, "roles"> };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const tokens = await login(payload);
      persistTokens(tokens.access, tokens.refresh);
      const me = await fetchMe();
      return { tokens, me };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      clearTokens();
      state.username = null;
      state.restaurant = null;
      state.roles = [];
      state.accessToken = null;
      state.refreshToken = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupRestaurantThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupRestaurantThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.restaurant = action.payload.tokens.restaurant;
        state.roles = action.payload.me.roles;
      })
      .addCase(signupRestaurantThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Erro ao cadastrar restaurante.";
      })
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.username = action.payload.me.username;
        state.roles = action.payload.me.roles;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) ?? "Usuário ou senha inválidos.";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
