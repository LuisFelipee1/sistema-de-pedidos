import type { BadgeTone } from "@/components/ui";
import type { KitchenStatus } from "@/types/orders";

export const KITCHEN_STATUS_TONE: Record<KitchenStatus, BadgeTone> = {
  na_fila: "warning",
  em_preparacao: "info",
  pronto: "success",
};

/** Borda e fundo do card. Cores bem separadas no espectro para a cozinha
 * distinguir os estados de longe, sem precisar ler a flag. */
export const KITCHEN_STATUS_SURFACE: Record<KitchenStatus, string> = {
  na_fila: "border-warning bg-warning/10",
  em_preparacao: "border-info bg-info/10",
  pronto: "border-success bg-success/10",
};
