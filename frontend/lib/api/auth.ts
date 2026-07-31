import type {
  LoginPayload,
  LoginResponse,
  Me,
  RestaurantSignupPayload,
  RestaurantSignupResponse,
} from "@/types/auth";

import { apiClient } from "./client";

export async function signupRestaurant(
  payload: RestaurantSignupPayload,
): Promise<RestaurantSignupResponse> {
  const { data } = await apiClient.post<RestaurantSignupResponse>(
    "/api/auth/restaurants/signup/",
    payload,
  );
  return data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/api/auth/login/", payload);
  return data;
}

export async function fetchMe(): Promise<Me> {
  const { data } = await apiClient.get<Me>("/api/auth/me/");
  return data;
}
