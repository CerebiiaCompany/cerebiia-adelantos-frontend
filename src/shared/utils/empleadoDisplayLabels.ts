import type {
  TipoContratoEmpleado,
  TipoCuentaEmpleado,
  TipoDocumento,
} from "@/shared/api/types/empleado";
import {
  EMPLEADO_ACCOUNT_TYPE_OPTIONS,
  EMPLEADO_CONTRACT_TYPE_OPTIONS,
  getEmpleadoCatalogLabel,
} from "@/shared/constants/empleadoFormCatalogs";

const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  cc: "CC",
  ce: "CE",
  ti: "TI",
  pas: "Pasaporte",
};

export function formatTipoDocumento(value?: TipoDocumento | string): string {
  if (!value) return "—";
  return TIPO_DOCUMENTO_LABELS[value as TipoDocumento] ?? value.toUpperCase();
}

export function formatTipoCuenta(value?: TipoCuentaEmpleado | string): string {
  if (!value) return "—";
  return (
    getEmpleadoCatalogLabel(EMPLEADO_ACCOUNT_TYPE_OPTIONS, value) ?? value
  );
}

export function formatTipoContrato(value?: TipoContratoEmpleado | string): string {
  if (!value) return "—";
  return (
    getEmpleadoCatalogLabel(EMPLEADO_CONTRACT_TYPE_OPTIONS, value) ?? value
  );
}

export function formatFechaIngreso(value?: string): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatEmpleadoCell(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}
