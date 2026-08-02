/** Item que o garçom está montando no modal da mesa, antes de enviar. */
export interface DraftOrderItem {
  /** Identificador local do rascunho — o mesmo produto pode entrar mais de uma
   * vez com observações diferentes, então o product_id não serve de chave. */
  key: string;
  product_id: number;
  product_name: string;
  unit_price: string;
  quantity: number;
  notes: string;
}

export interface OrderItemInput {
  product_id: number;
  quantity: number;
  notes?: string;
}

export interface PresencialOrderPayload {
  table_id: number;
  items: OrderItemInput[];
  notes?: string;
  send_to_kitchen?: boolean;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name_snapshot: string;
  unit_price_snapshot: string;
  quantity: number;
  notes: string;
}

export interface OrderStatusHistoryEntry {
  status: string;
  changed_at: string;
}

export interface Order {
  id: number;
  restaurant: number;
  table: number | null;
  order_type: "online" | "presencial";
  customer_name: string;
  current_status: string;
  current_status_code: string;
  total_amount: string;
  notes: string;
  tracking_token: string;
  items: OrderItem[];
  status_history: OrderStatusHistoryEntry[];
  created_at: string;
}

/** Conta aberta de uma mesa — o que o garçom confirma antes de finalizar. */
export interface TableAccount {
  table: number;
  total: string;
  orders: Order[];
}

export interface CloseAccountResult {
  orders_closed: number;
  total: string;
}

/** Etapas que a cozinha controla, na ordem em que avançam. */
export type KitchenStatus = "na_fila" | "em_preparacao" | "pronto";

export const KITCHEN_STATUS_LABELS: Record<KitchenStatus, string> = {
  na_fila: "Aguardando preparo",
  em_preparacao: "Preparando",
  pronto: "Pronto",
};

export const KITCHEN_STATUS_ORDER: KitchenStatus[] = ["na_fila", "em_preparacao", "pronto"];

/** Uma mesa na fila da cozinha, com todos os pedidos dela juntos. */
export interface KitchenQueueEntry {
  table: RestaurantTableRef;
  status: KitchenStatus;
  total: string;
  waiting_since: string;
  orders: Order[];
}

interface RestaurantTableRef {
  id: number;
  restaurant: number;
  number: number;
  status: string;
}
