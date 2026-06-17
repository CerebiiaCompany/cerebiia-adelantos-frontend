export function getPayrollPeriodLabel(date: Date): string {
  const month = date.toLocaleDateString("es-CO", { month: "long" });
  const year = date.getFullYear();
  const quincena = date.getDate() <= 15 ? "1.ª quincena" : "2.ª quincena";
  return `${month} ${year} · ${quincena}`;
}

export function formatAdvanceRequestDate(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildAdvanceReceiptFolio(date: Date): string {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = String(date.getTime()).slice(-5);
  return `ADV-${stamp}-${suffix}`;
}
