// ⚠️ AGNOSTIC — normaliza valores de celdas Excel/CSV para importación

/** Quita sufijos .0 que Excel agrega a números enteros (ej. 1014261059.0). */
export function normalizeImportNumericString(value: string): string {
  const trimmed = value.trim();
  if (/^\d+\.0+$/.test(trimmed)) {
    return trimmed.replace(/\.0+$/, "");
  }
  return trimmed;
}

export function stringifyImportCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)) {
    return String(value);
  }
  return normalizeImportNumericString(String(value).trim());
}
