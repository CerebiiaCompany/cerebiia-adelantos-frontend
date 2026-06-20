// ⚠️ AGNOSTIC — mensajes estructurados para resultado de importación

import type { CreateEmpleadoRequest } from "@/shared/api/types";

export type EmpleadoImportErrorKind = "validation" | "duplicate" | "api";

export interface EmpleadoImportRowError {
  rowNumber: number;
  kind: EmpleadoImportErrorKind;
  nombre?: string;
  documento?: string;
  tipoDocumento?: string;
  field?: string;
  message: string;
}

export interface EmpleadoImportValidRow {
  rowNumber: number;
  data: CreateEmpleadoRequest;
}

const FIELD_LABELS: Record<string, string> = {
  tipo_documento: "Tipo de documento",
  documento: "Número de documento",
  nombre: "Nombre",
  correo: "Correo electrónico",
  celular: "Celular",
  salario: "Salario",
  tipo_contrato: "Tipo de contrato",
  fecha_ingreso: "Fecha de ingreso",
  banco: "Banco",
  tipo_cuenta: "Tipo de cuenta",
  numero_cuenta: "Número de cuenta",
};

export function isDuplicateDocumentError(apiMessage: string): boolean {
  const normalized = apiMessage.toLowerCase();
  return (
    normalized.includes("ya existe") ||
    normalized.includes("already exists") ||
    normalized.includes("duplicate")
  );
}

export function formatDuplicateImportMessage(
  nombre: string,
  tipoDocumento: string,
  documento: string,
): string {
  return `${nombre} · ${tipoDocumento} ${documento} ya existe en tus empleados.`;
}

export function formatValidationImportMessage(
  fieldName: string,
  zodMessage: string,
): string {
  const label = FIELD_LABELS[fieldName] ?? fieldName;
  return `${label}: ${zodMessage}`;
}

export function buildApiImportRowError(
  rowNumber: number,
  payload: CreateEmpleadoRequest,
  apiMessage: string,
): EmpleadoImportRowError {
  if (isDuplicateDocumentError(apiMessage)) {
    return {
      rowNumber,
      kind: "duplicate",
      nombre: payload.nombre,
      documento: payload.documento,
      tipoDocumento: payload.tipo_documento,
      message: formatDuplicateImportMessage(
        payload.nombre,
        payload.tipo_documento,
        payload.documento,
      ),
    };
  }

  return {
    rowNumber,
    kind: "api",
    nombre: payload.nombre,
    documento: payload.documento,
    tipoDocumento: payload.tipo_documento,
    message: apiMessage,
  };
}

export function sortImportErrorsByRow(
  errors: EmpleadoImportRowError[],
): EmpleadoImportRowError[] {
  return [...errors].sort((left, right) => left.rowNumber - right.rowNumber);
}

export function groupImportErrorsByKind(errors: EmpleadoImportRowError[]) {
  const sorted = sortImportErrorsByRow(errors);

  return {
    validation: sorted.filter((error) => error.kind === "validation"),
    duplicate: sorted.filter((error) => error.kind === "duplicate"),
    api: sorted.filter((error) => error.kind === "api"),
  };
}
