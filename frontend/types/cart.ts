export interface CartItem {
  product_id: number;
  name: string;
  price: string;
  image: string | null;
  quantity: number;
}

export interface CartSnapshot {
  /** Carrinho pertence a um restaurante só — abrir outro cardápio recomeça. */
  slug: string | null;
  items: CartItem[];
}
