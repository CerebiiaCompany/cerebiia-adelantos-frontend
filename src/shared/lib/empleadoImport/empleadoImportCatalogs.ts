// ⚠️ AGNOSTIC — valores permitidos en POST /empleados/cargar-nomina/ (backend Django)

import { EMPLEADO_IMPORT_ACCEPTED_BANKS } from "./empleadoImportBancos";

/** Alineado con TipoDocumento del backend (minúsculas). */
export const EMPLEADO_IMPORT_DOCUMENT_TYPES = [
  "cc",
  "ce",
  "ti",
  "pas",
] as const;

/** Alineado con TipoContrato del backend. */
export const EMPLEADO_IMPORT_CONTRACT_TYPES = [
  "indefinido",
  "fijo",
  "obra_labor",
  "prestacion_servicios",
  "aprendizaje",
] as const;

/** Alineado con TipoCuenta del backend. */
export const EMPLEADO_IMPORT_ACCOUNT_TYPES = ["ahorros", "corriente"] as const;

/** Placeholder visible en la plantilla Excel para la columna fecha_ingreso. */
export const EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER = "AAAA-MM-DD";

export type EmpleadoImportTemplateOptions = {
  /** Nombres exactos de bancos (columna banco). Si no se envía, usa el seed del backend. */
  bancos?: string[];
};

export function resolveEmpleadoImportBancoNames(
  options?: EmpleadoImportTemplateOptions,
): string[] {
  const source =
    options?.bancos && options.bancos.length > 0
      ? options.bancos
      : [...EMPLEADO_IMPORT_ACCEPTED_BANKS];

  return [...new Set(source.map((name) => name.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "es"),
  );
}

export interface EmpleadoImportListRanges {
  bancos: string;
  tipoDocumento: string;
  tipoContrato: string;
  tipoCuenta: string;
}

const LIST_SHEET_NAME = "Listas";

export function getEmpleadoImportListSheetName(): string {
  return LIST_SHEET_NAME;
}
