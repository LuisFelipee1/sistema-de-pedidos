import type { Order, PresencialOrderPayload } from "@/types/orders";

import { apiClient } from "./client";

export async function createPresencialOrder(payload: PresencialOrderPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>("/api/orders/presencial/", payload);
  return data;
}
