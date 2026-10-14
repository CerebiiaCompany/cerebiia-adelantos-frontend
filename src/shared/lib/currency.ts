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

/**
 * Formatea valores de dinero para los ejes de gráficas (p. ej. Recharts YAxis)
 * de forma compacta y legible, evitando repeticiones de marcas como "$0.1M".
 *
 * - Cero: "$0"
 * - >= 1_000_000: en millones, p. ej. "$1M", "$1.5M", "$1.25M", "$2M"
 * - >= 1_000: en miles, p. ej. "$50K", "$100K", "$750K"
 * - < 1_000: enteros directos, p. ej. "$500"
 */
export function formatChartAxisMoney(value: number): string {
  if (value === 0) return "$0";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    const millions = abs / 1_000_000;
    const formatted = parseFloat(millions.toFixed(2)).toString();
    return `${sign}$${formatted}M`;
  }

  if (abs >= 1_000) {
    const thousands = abs / 1_000;
    const formatted = parseFloat(thousands.toFixed(1)).toString();
    return `${sign}$${formatted}K`;
  }

  return `${sign}$${Math.round(abs)}`;
}
