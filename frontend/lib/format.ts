const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** A API devolve valores decimais como string ("25.00") para não perder
 * precisão no JSON — converta só na hora de exibir. */
export function formatCurrency(value: string | number): string {
  const numeric = typeof value === "number" ? value : Number(value);
  return currencyFormatter.format(Number.isFinite(numeric) ? numeric : 0);
}
