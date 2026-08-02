export type TableStatus = "livre" | "ocupada" | "desativada";

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  livre: "Livre",
  ocupada: "Ocupada",
  desativada: "Desativada",
};

/** Ordem em que os status aparecem nos filtros e no select do modal. */
export const TABLE_STATUS_ORDER: TableStatus[] = ["livre", "ocupada", "desativada"];

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
