import type { CartItem, CartSnapshot } from "@/types/cart";

const STORAGE_KEY = "sistema-pedidos:cart";

/** Suba este número sempre que o formato do item mudar. O carrinho fica no
 * navegador do cliente por tempo indeterminado, então uma versão antiga pode
 * voltar muito depois — sem esta checagem, o formato velho entra no app e
 * quebra em qualquer lugar que espere um campo novo. */
const CART_VERSION = 2;

interface StoredCart extends CartSnapshot {
  version?: number;
}

/** Aceita só o item que tem tudo que o app precisa. Vale para dado corrompido
 * e para o formato anterior, que não tinha `key` nem `options`. */
function isValidItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<CartItem>;
  return (
    typeof item.key === "string" &&
    typeof item.product_id === "number" &&
    typeof item.name === "string" &&
    typeof item.price === "string" &&
    typeof item.quantity === "number" &&
    Array.isArray(item.options)
  );
}

/** O cliente final não tem conta, então o carrinho vive no navegador dele —
 * sem isso, recarregar a página perderia o pedido inteiro. */
export function loadCart(): CartSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredCart;
    if (parsed.version !== CART_VERSION) return null;
    if (!Array.isArray(parsed.items)) return null;

    return {
      slug: parsed.slug ?? null,
      items: parsed.items.filter(isValidItem),
    };
  } catch {
    // Dado corrompido não pode derrubar o cardápio — começa vazio.
    return null;
  }
}

export function saveCart(snapshot: CartSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...snapshot, version: CART_VERSION }),
    );
  } catch {
    // Modo privado do Safari pode recusar escrita; o carrinho segue em memória.
  }
}
