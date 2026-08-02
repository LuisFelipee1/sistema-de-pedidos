import type { PaginatedResponse } from "@/types/common";
import type { RestaurantTable, TablePayload, TableStatus } from "@/types/tables";

import { apiClient } from "./client";

export async function listTables(): Promise<RestaurantTable[]> {
  const { data } = await apiClient.get<PaginatedResponse<RestaurantTable>>("/api/tables/");
  return data.results;
}

export async function createTable(payload: TablePayload): Promise<RestaurantTable> {
  const { data } = await apiClient.post<RestaurantTable>("/api/tables/", payload);
  return data;
}

export async function updateTable(
  id: number,
  payload: Partial<TablePayload>,
): Promise<RestaurantTable> {
  const { data } = await apiClient.patch<RestaurantTable>(`/api/tables/${id}/`, payload);
  return data;
}

/** Endpoint enxuto que o garçom usa no salão — não exige ser administrador,
 * ao contrário do PATCH completo em /api/tables/{id}/. */
export async function updateTableStatus(
  id: number,
  status: TableStatus,
): Promise<RestaurantTable> {
  const { data } = await apiClient.patch<RestaurantTable>(`/api/tables/${id}/status/`, { status });
  return data;
}

export async function deleteTable(id: number): Promise<void> {
  await apiClient.delete(`/api/tables/${id}/`);
}
