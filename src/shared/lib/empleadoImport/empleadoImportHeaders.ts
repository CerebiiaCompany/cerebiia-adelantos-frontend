// ⚠️ AGNOSTIC — payroll file import column mapping

import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";

export type EmpleadoImportField = keyof CreateEmpleadoFormValues;

/**
 * Definición única de columnas: etiqueta humana (Excel) + clave backend (upload).
 * El cargue convierte display → backend; el parser Django espera snake_case.
 */
export const EMPLEADO_IMPORT_COLUMN_DEFS = [
  {
    field: "tipo_documento",
    backend: "tipo_documento",
    display: "Tipo de documento",
  },
  {
    field: "documento",
    backend: "documento",
    display: "Número de documento",
  },
  {
    field: "nombre",
    backend: "nombre",
    display: "Nombre completo",
  },
  {
    field: "correo",
    backend: "email",
    display: "Correo electrónico",
  },
  {
    field: "celular",
    backend: "celular",
    display: "Celular",
  },
  {
    field: "salario",
    backend: "salario",
    display: "Salario mensual",
  },
  {
    field: "tipo_contrato",
    backend: "tipo_contrato",
    display: "Tipo de contrato",
  },
  {
    field: "fecha_ingreso",
    backend: "fecha_ingreso",
    display: "Fecha de ingreso",
  },
  {
    field: "banco_id",
    backend: "banco",
    display: "Entidad financiera",
  },
  {
    field: "tipo_cuenta",
    backend: "tipo_cuenta",
    display: "Tipo de cuenta",
  },
  {
    field: "numero_cuenta",
    backend: "numero_cuenta",
    display: "Número de cuenta",
  },
] as const satisfies ReadonlyArray<{
  field: EmpleadoImportField;
  backend: string;
  display: string;
}>;

export type EmpleadoImportTemplateHeader =
  (typeof EMPLEADO_IMPORT_COLUMN_DEFS)[number]["display"];

export type EmpleadoImportBackendHeader =
  (typeof EMPLEADO_IMPORT_COLUMN_DEFS)[number]["backend"];

/** Encabezados visibles en la plantilla Excel corporativa. */
export const EMPLEADO_IMPORT_TEMPLATE_HEADERS: readonly EmpleadoImportTemplateHeader[] =
  EMPLEADO_IMPORT_COLUMN_DEFS.map((column) => column.display);

/**
 * Encabezados que exige POST /empleados/cargar-nomina/ (snake_case).
 * Solo se escriben en el archivo temporal de upload, no en la plantilla descargable.
 */
export const EMPLEADO_IMPORT_BACKEND_HEADERS: readonly EmpleadoImportBackendHeader[] =
  EMPLEADO_IMPORT_COLUMN_DEFS.map((column) => column.backend);

/** Alias de compatibilidad: mismas claves que el parser del backend. */
export const EMPLEADO_IMPORT_REQUIRED_BACKEND_HEADERS =
  EMPLEADO_IMPORT_BACKEND_HEADERS;

const HEADER_ALIASES: Record<string, EmpleadoImportField> = {
  tipodocumento: "tipo_documento",
  tipodedocumento: "tipo_documento",
  tipodoc: "tipo_documento",
  documento: "documento",
  numerodedocumento: "documento",
  numerodocumento: "documento",
  ndocumento: "documento",
  nombre: "nombre",
  nombrecompleto: "nombre",
  nombresyapellidos: "nombre",
  correo: "correo",
  email: "correo",
  mail: "correo",
  correoelectronico: "correo",
  celular: "celular",
  telefono: "celular",
  movil: "celular",
  salario: "salario",
  sueldo: "salario",
  salariomensual: "salario",
  tipocontrato: "tipo_contrato",
  tipodecontrato: "tipo_contrato",
  contrato: "tipo_contrato",
  fechaingreso: "fecha_ingreso",
  fechadeingreso: "fecha_ingreso",
  fechaingresoempresa: "fecha_ingreso",
  ingreso: "fecha_ingreso",
  banco: "banco_id",
  entidadfinanciera: "banco_id",
  tipocuenta: "tipo_cuenta",
  tipodecuenta: "tipo_cuenta",
  cuentabancaria: "tipo_cuenta",
  numerocuenta: "numero_cuenta",
  numerodecuenta: "numero_cuenta",
  nocuenta: "numero_cuenta",
  cuentabanco: "numero_cuenta",
};

export function normalizeImportHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function resolveEmpleadoImportField(
  header: string,
): EmpleadoImportField | null {
  const normalized = normalizeImportHeader(header);
  return HEADER_ALIASES[normalized] ?? null;
}

export function getEmpleadoImportColumnIndexByField(
  field: EmpleadoImportField,
): number {
  return EMPLEADO_IMPORT_COLUMN_DEFS.findIndex((column) => column.field === field);
}
