export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/** Converte a string digitada (com máscara) em número, ex: "1.234,56" -> 1234.56 */
export function parseBRLInput(value: string): number {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return 0;
  return Number(digitsOnly) / 100;
}

/** Formata um valor numérico em centavos como string de máscara para exibir no input, ex: 123456 -> "1.234,56" */
export function formatBRLInputFromDigits(digitsOnly: string): string {
  const cents = Number(digitsOnly || "0");
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
