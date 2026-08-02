import type { PaginatedResponse } from "@/types/common";
import type {
  CloseAccountResult,
  KitchenQueueEntry,
  KitchenStatus,
  Order,
  PresencialOrderPayload,
  TableAccount,
} from "@/types/orders";
import type { RestaurantTable } from "@/types/tables";

import { apiClient } from "./client";

export async function createPresencialOrder(payload: PresencialOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>("/api/orders/presencial/", payload);
  return data;
}

export async function fetchTableAccount(tableId: number): Promise<TableAccount> {
  const { data } = await apiClient.get<TableAccount>(`/api/tables/${tableId}/account/`);
  return data;
}

export async function closeTableAccount(
  tableId: number,
): Promise<CloseAccountResult & { table: RestaurantTable }> {
  const { data } = await apiClient.post<CloseAccountResult & { table: RestaurantTable }>(
    `/api/tables/${tableId}/account/`,
  );
  return data;
}

export async function fetchKitchenQueue(): Promise<KitchenQueueEntry[]> {
  const { data } = await apiClient.get<KitchenQueueEntry[]>("/api/kitchen/queue/");
  return data;
}

/** Devolve a fila já atualizada, poupando um segundo fetch na tela da cozinha. */
export async function setKitchenStatus(
  tableId: number,
  status: KitchenStatus,
): Promise<KitchenQueueEntry[]> {
  const { data } = await apiClient.post<KitchenQueueEntry[]>(
    `/api/kitchen/tables/${tableId}/status/`,
    { status },
  );
  return data;
}

export async function listFinishedOrders(): Promise<Order[]> {
  const { data } = await apiClient.get<PaginatedResponse<Order>>("/api/orders/", {
    params: { status: "finalizado" },
  });
  return data.results;
}
