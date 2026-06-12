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
