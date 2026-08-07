import type { CartSnapshot } from "@/types/cart";

const STORAGE_KEY = "sistema-pedidos:cart";

/** O cliente final não tem conta, então o carrinho vive no navegador dele —
 * sem isso, recarregar a página perderia o pedido inteiro. */
export function loadCart(): CartSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CartSnapshot;
    if (!Array.isArray(parsed.items)) return null;
    return parsed;
  } catch {
    // Dado corrompido não pode derrubar o cardápio — começa vazio.
    return null;
  }
}

export function saveCart(snapshot: CartSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Modo privado do Safari pode recusar escrita; o carrinho segue em memória.
  }
}
