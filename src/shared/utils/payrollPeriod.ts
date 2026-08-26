export function toSafeDate(
  value: Date | string | number | null | undefined,
): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getPayrollPeriodLabel(
  date?: Date | string | number | null,
): string {
  const safeDate = toSafeDate(date);
  if (!safeDate) return "Periodo actual";
  const month = safeDate.toLocaleDateString("es-CO", { month: "long" });
  const year = safeDate.getFullYear();
  const quincena = safeDate.getDate() <= 15 ? "1.ª quincena" : "2.ª quincena";
  return `${month} ${year} · ${quincena}`;
}

export function formatAdvanceRequestDate(
  date?: Date | string | number | null,
): string {
  const safeDate = toSafeDate(date);
  if (!safeDate) return "—";
  return safeDate.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildAdvanceReceiptFolio(
  date?: Date | string | number | null,
): string {
  const safeDate = toSafeDate(date) ?? new Date();
  const stamp = safeDate.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = String(safeDate.getTime()).slice(-5);
  return `ADV-${stamp}-${suffix}`;
}

 