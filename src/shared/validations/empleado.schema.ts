// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { z } from "zod";
import { normalizeSalaryInput } from "../lib/currency";
import {
  EMPLEADO_ACCOUNT_TYPE_OPTIONS,
  EMPLEADO_CONTRACT_TYPE_OPTIONS,
  EMPLEADO_DOCUMENT_TYPE_OPTIONS,
  EMPLEADO_FINANCIAL_INSTITUTION_VALUES,
} from "../constants/empleadoFormCatalogs";
import {
  documentTypes,
  isValidColombianPhone,
  isValidEmail,
  normalizeEmail,
  sanitizeColombianPhone,
  type DocumentType,
} from "./register.schema";
import { isValidEmpleadoDocumentNumber } from "./empleadoDocumentValidation";

const SALARIO_REGEX = /^\d{1,12}(\.\d{1,2})?$/;

export const TIPO_CONTRATO_VALUES = [
  "indefinido",
  "fijo",
  "obra_labor",
] as const;

export const TIPO_CUENTA_VALUES = ["ahorros", "corriente"] as const;

export type TipoContrato = (typeof TIPO_CONTRATO_VALUES)[number];
export type TipoCuenta = (typeof TIPO_CUENTA_VALUES)[number];

export const TIPO_CONTRATO_OPTIONS = EMPLEADO_CONTRACT_TYPE_OPTIONS;
export const TIPO_CUENTA_OPTIONS = EMPLEADO_ACCOUNT_TYPE_OPTIONS;
export const EMPLEADO_TIPO_DOCUMENTO_OPTIONS = EMPLEADO_DOCUMENT_TYPE_OPTIONS;

export const CREATE_EMPLEADO_STEP1_FIELDS = [
  "tipo_documento",
  "documento",
  "nombre",
  "correo",
  "celular",
] as const;

export const CREATE_EMPLEADO_STEP2_FIELDS = [
  "salario",
  "tipo_contrato",
  "fecha_ingreso",
  "banco",
  "tipo_cuenta",
  "numero_cuenta",
] as const;

function isValidIngresoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date <= today;
}

export const createEmpleadoSchema = z
  .object({
    tipo_documento: z
      .string()
      .min(1, "Selecciona el tipo de documento")
      .refine(
        (value): value is DocumentType =>
          (documentTypes as readonly string[]).includes(value),
        "Selecciona el tipo de documento",
      ),
    documento: z
      .string()
      .min(1, "Ingresa el número de documento")
      .transform((value) => value.trim()),
    nombre: z
      .string()
      .min(1, "Ingresa el nombre del empleado")
      .max(255, "Máximo 255 caracteres")
      .transform((value) => value.trim()),
    correo: z
      .string()
      .min(1, "Ingresa el correo electrónico")
      .transform((value) => normalizeEmail(value))
      .refine(isValidEmail, "Ingresa un correo electrónico válido"),
    celular: z
      .string()
      .min(1, "Ingresa el número celular")
      .transform((value) => sanitizeColombianPhone(value))
      .refine(
        (value) => isValidColombianPhone(value),
        "Ingresa un celular colombiano válido (10 dígitos, inicia en 3)",
      ),
    salario: z
      .string()
      .min(1, "Ingresa el salario")
      .transform((value) => normalizeSalaryInput(value))
      .refine(
        (value) => SALARIO_REGEX.test(value),
        "Salario inválido (máx. 12 dígitos y 2 decimales)",
      ),
    tipo_contrato: z
      .string()
      .min(1, "Selecciona el tipo de contrato")
      .refine(
        (value): value is TipoContrato =>
          (TIPO_CONTRATO_VALUES as readonly string[]).includes(value),
        "Selecciona el tipo de contrato",
      ),
    fecha_ingreso: z
      .string()
      .min(1, "Ingresa la fecha de ingreso")
      .refine(isValidIngresoDate, "La fecha de ingreso no puede ser futura"),
    banco: z
      .string()
      .min(1, "Selecciona el banco o plataforma de pago")
      .refine(
        (value) => EMPLEADO_FINANCIAL_INSTITUTION_VALUES.includes(value),
        "Selecciona un banco o plataforma válido",
      ),
    tipo_cuenta: z
      .string()
      .min(1, "Selecciona el tipo de cuenta")
      .refine(
        (value): value is TipoCuenta =>
          (TIPO_CUENTA_VALUES as readonly string[]).includes(value),
        "Selecciona el tipo de cuenta",
      ),
    numero_cuenta: z
      .string()
      .min(1, "Ingresa el número de cuenta")
      .max(50, "Máximo 50 caracteres")
      .transform((value) => value.trim()),
  })
  .superRefine((data, ctx) => {
    if (!data.tipo_documento || !data.documento) return;

    if (!isValidEmpleadoDocumentNumber(data.tipo_documento, data.documento)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ingresa un número de documento válido",
        path: ["documento"],
      });
    }
  });

export type CreateEmpleadoFormValues = z.infer<typeof createEmpleadoSchema>;

export function isCreateEmpleadoStep1Complete(
  values: Partial<
    Pick<
      CreateEmpleadoFormValues,
      (typeof CREATE_EMPLEADO_STEP1_FIELDS)[number]
    >
  >,
): boolean {
  return CREATE_EMPLEADO_STEP1_FIELDS.every((field) => {
    const value = values[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function isCreateEmpleadoStep2Complete(
  values: Partial<
    Pick<
      CreateEmpleadoFormValues,
      (typeof CREATE_EMPLEADO_STEP2_FIELDS)[number]
    >
  >,
): boolean {
  return CREATE_EMPLEADO_STEP2_FIELDS.every((field) => {
    const value = values[field];
    return typeof value === "string" && value.trim().length > 0;
  });
}
