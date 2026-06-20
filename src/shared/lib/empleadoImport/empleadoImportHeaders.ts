// ⚠️ AGNOSTIC — payroll file import column mapping

import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";

export type EmpleadoImportField = keyof CreateEmpleadoFormValues;

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
  correoelectronico: "correo",
  celular: "celular",
  telefono: "celular",
  movil: "celular",
  salario: "salario",
  sueldo: "salario",
  tipocontrato: "tipo_contrato",
  tipodecontrato: "tipo_contrato",
  contrato: "tipo_contrato",
  fechaingreso: "fecha_ingreso",
  fechaingresoempresa: "fecha_ingreso",
  ingreso: "fecha_ingreso",
  banco: "banco",
  entidadfinanciera: "banco",
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

export const EMPLEADO_IMPORT_TEMPLATE_HEADERS = [
  "tipo_documento",
  "documento",
  "nombre",
  "correo",
  "celular",
  "salario",
  "tipo_contrato",
  "fecha_ingreso",
  "banco",
  "tipo_cuenta",
  "numero_cuenta",
] as const;
