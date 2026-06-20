// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function parseCOP(value: string): number {
  return Number(value.replace(/[^0-9]/g, ""));
}

/**
 * Normaliza un salario digitado a formato canónico: "1500000" o "1500000.50".
 * Acepta separadores es-CO (1.500.000,50) y en-US (1,500,000.50).
 */
export function normalizeSalaryInput(input: string): string {
  const trimmed = input.trim().replace(/\s/g, "");
  if (!trimmed) return "";

  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");
  const commaDecimalMatch = trimmed.match(/,(\d+)$/);
  const endsWithDotDec = /\.\d{1,2}$/.test(trimmed);

  if (
    commaDecimalMatch &&
    (!endsWithDotDec || lastComma > lastDot)
  ) {
    const intPart = trimmed.slice(0, lastComma).replace(/\D/g, "");
    const decPart = commaDecimalMatch[1].slice(0, 2);
    return decPart.length > 0 ? `${intPart}.${decPart}` : intPart;
  }

  if (endsWithDotDec) {
    const intPart = trimmed.slice(0, lastDot).replace(/\D/g, "");
    const decPart = trimmed.slice(lastDot + 1).replace(/\D/g, "").slice(0, 2);
    return decPart.length > 0 ? `${intPart}.${decPart}` : intPart;
  }

  return trimmed.replace(/\D/g, "");
}

/** Formatea un salario canónico para visualización en input (miles/millones es-CO). */
export function formatSalaryInput(value: string): string {
  const normalized = normalizeSalaryInput(value);
  if (!normalized) return "";

  const [integerPart = "", decimalPart] = normalized.split(".");
  const amount = Number(integerPart);

  if (Number.isNaN(amount)) return "";

  const formattedInteger = amount.toLocaleString("es-CO", {
    maximumFractionDigits: 0,
  });

  if (decimalPart !== undefined && decimalPart.length > 0) {
    return `${formattedInteger},${decimalPart}`;
  }

  return formattedInteger;
}
