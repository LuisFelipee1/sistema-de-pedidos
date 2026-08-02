import type { BadgeTone } from "@/components/ui";
import type { TableStatus } from "@/types/tables";

export const TABLE_STATUS_TONE: Record<TableStatus, BadgeTone> = {
  livre: "success",
  ocupada: "accent",
  desativada: "neutral",
};

/** Cor da borda e do fundo do quadrado da mesa. A cor precisa ser legível de
 * longe: o garçom bate o olho no salão inteiro antes de ler qualquer texto. */
export const TABLE_STATUS_SURFACE: Record<TableStatus, string> = {
  livre: "border-success/40 bg-success/10 text-ink",
  ocupada: "border-accent/50 bg-accent/15 text-ink",
  desativada: "border-border bg-ink/5 text-ink-muted opacity-60",
};
