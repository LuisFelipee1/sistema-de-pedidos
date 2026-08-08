export interface CartItemOption {
  group_id: number;
  group_name: string;
  option_id: number;
  option_name: string;
  price_delta: string;
}

export interface CartItem {
  /** Identifica a linha do carrinho. O mesmo produto com escolhas diferentes
   * é outra linha — quem pediu sem cebola não quer somar com quem pediu com. */
  key: string;
  product_id: number;
  name: string;
  image: string | null;
  /** Preço base do produto, sem os adicionais. */
  price: string;
  options: CartItemOption[];
  quantity: number;
}

export interface CartSnapshot {
  /** Carrinho pertence a um restaurante só — abrir outro cardápio recomeça. */
  slug: string | null;
  items: CartItem[];
}

/** Preço de uma unidade já com os adicionais escolhidos. */
export function unitPrice(item: CartItem): number {
  return item.options.reduce(
    (total, option) => total + Number(option.price_delta),
    Number(item.price),
  );
}
