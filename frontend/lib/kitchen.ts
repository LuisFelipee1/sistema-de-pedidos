import type { KitchenQueueEntry } from "@/types/orders";

export interface KitchenItem {
  key: string;
  name: string;
  quantity: number;
  notes: string;
}

/** Junta os itens de todos os pedidos da mesa em uma lista de preparo.
 *
 * Itens iguais somam quantidade, mas observações diferentes ficam separadas:
 * "2x X-Burguer sem cebola" e "1x X-Burguer" são pratos distintos no fogão. */
export function kitchenItems(entry: KitchenQueueEntry): KitchenItem[] {
  const merged = new Map<string, KitchenItem>();

  for (const order of entry.orders) {
    for (const item of order.items) {
      const key = `${item.product}::${item.notes}`;
      const existing = merged.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.set(key, {
          key,
          name: item.product_name_snapshot,
          quantity: item.quantity,
          notes: item.notes,
        });
      }
    }
  }

  return [...merged.values()];
}

/** Itens conferidos considerando o status: mesa já pronta conta como tudo
 * conferido, senão reabrir o modal de uma mesa pronta pediria conferir de novo. */
export function effectiveCheckedKeys(
  entry: KitchenQueueEntry,
  checkedKeys: string[],
): Set<string> {
  if (entry.status === "pronto") return new Set(kitchenItems(entry).map((item) => item.key));
  return new Set(checkedKeys);
}

/** Há quantos minutos a mesa está esperando — o dado que a cozinha usa para
 * decidir a ordem de preparo. */
export function minutesWaiting(isoDate: string, now: number = Date.now()): number {
  const elapsed = now - new Date(isoDate).getTime();
  return Math.max(0, Math.floor(elapsed / 60_000));
}

export function formatWaiting(minutes: number): string {
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `há ${hours}h` : `há ${hours}h${String(rest).padStart(2, "0")}`;
}
