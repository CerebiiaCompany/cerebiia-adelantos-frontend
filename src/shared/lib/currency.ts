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
 *
 * Importante: "2,000,000" son miles (en-US), no decimales. Excel/SheetJS suele
 * devolver ese formato aunque en pantalla se vea "2.000.000".
 */
export function normalizeSalaryInput(input: string): string {
  const trimmed = input.trim().replace(/\s/g, "");
  if (!trimmed) return "";

  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");

  // Ambos separadores: el último es el decimal.
  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      // 1.500.000,50 (es-CO)
      const intPart = trimmed.slice(0, lastComma).replace(/\D/g, "");
      const decPart = trimmed.slice(lastComma + 1).replace(/\D/g, "").slice(0, 2);
      return decPart.length > 0 ? `${intPart}.${decPart}` : intPart;
    }

    // 1,500,000.50 (en-US)
    const intPart = trimmed.slice(0, lastDot).replace(/\D/g, "");
    const decPart = trimmed.slice(lastDot + 1).replace(/\D/g, "").slice(0, 2);
    return decPart.length > 0 ? `${intPart}.${decPart}` : intPart;
  }

  // Solo comas
  if (lastComma !== -1) {
    const after = trimmed.slice(lastComma + 1);
    const commaCount = (trimmed.match(/,/g) ?? []).length;

    // 2,000,000 o 2,000 → miles
    if (commaCount > 1 || /^\d{3}$/.test(after)) {
      return trimmed.replace(/\D/g, "");
    }

    // 1500,50 o 1,5 → decimal
    if (/^\d{1,2}$/.test(after)) {
      const intPart = trimmed.slice(0, lastComma).replace(/\D/g, "");
      return `${intPart}.${after}`;
    }

    return trimmed.replace(/\D/g, "");
  }

  // Solo puntos
  if (lastDot !== -1) {
    const after = trimmed.slice(lastDot + 1);
    const dotCount = (trimmed.match(/\./g) ?? []).length;

    // 2.000.000 o 2.000 → miles
    if (dotCount > 1 || /^\d{3}$/.test(after)) {
      return trimmed.replace(/\D/g, "");
    }

    // 1500.50 → decimal
    if (/^\d{1,2}$/.test(after)) {
      const intPart = trimmed.slice(0, lastDot).replace(/\D/g, "");
      return `${intPart}.${after}`;
    }

    return trimmed.replace(/\D/g, "");
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
