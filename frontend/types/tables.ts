export type TableStatus = "livre" | "ocupada" | "aguardando_pagamento";

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  livre: "Livre",
  ocupada: "Ocupada",
  aguardando_pagamento: "Aguardando pagamento",
};

export interface RestaurantTable {
  id: number;
  restaurant: number;
  number: number;
  status: TableStatus;
}

export interface TablePayload {
  number: number;
  status?: TableStatus;
}
