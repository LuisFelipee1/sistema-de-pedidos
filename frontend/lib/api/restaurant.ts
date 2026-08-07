import type { PaginatedResponse } from "@/types/common";
import type { Category, Product } from "@/types/menu";
import type {
  PublicRestaurant,
  RestaurantSettings,
  RestaurantSettingsPayload,
} from "@/types/restaurant";

import { apiClient } from "./client";

/** Rotas públicas: o cliente final não tem login, então nada aqui manda token. */
export async function fetchPublicRestaurant(slug: string): Promise<PublicRestaurant> {
  const { data } = await apiClient.get<PublicRestaurant>(`/api/r/${slug}/`);
  return data;
}

export async function fetchPublicCategories(slug: string): Promise<Category[]> {
  const { data } = await apiClient.get<PaginatedResponse<Category>>(`/api/r/${slug}/categories/`);
  return data.results;
}

export async function fetchPublicProducts(slug: string): Promise<Product[]> {
  const { data } = await apiClient.get<PaginatedResponse<Product>>(`/api/r/${slug}/products/`);
  return data.results;
}

// --- Configurações do dono ---

export async function fetchMyRestaurant(): Promise<RestaurantSettings> {
  const { data } = await apiClient.get<RestaurantSettings>("/api/restaurant/");
  return data;
}

function toRestaurantFormData(payload: RestaurantSettingsPayload): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    form.append(key, value as string | Blob);
  }
  return form;
}

export async function updateMyRestaurant(
  payload: RestaurantSettingsPayload,
): Promise<RestaurantSettings> {
  const { data } = await apiClient.patch<RestaurantSettings>(
    "/api/restaurant/",
    toRestaurantFormData(payload),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
