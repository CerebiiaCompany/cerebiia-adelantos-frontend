// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { z } from "zod";

const DOCUMENTO_REGEX = /^[0-9]{6,12}$/;
const SALARIO_REGEX = /^\d{1,12}(\.\d{1,2})?$/;

export const createEmpleadoSchema = z.object({
  documento: z
    .string()
    .min(1, "Ingresa el número de documento")
    .transform((value) => value.trim())
    .refine(
      (value) => DOCUMENTO_REGEX.test(value),
      "El documento debe tener entre 6 y 12 dígitos numéricos",
    ),
  nombre: z
    .string()
    .min(1, "Ingresa el nombre del empleado")
    .max(255, "Máximo 255 caracteres")
    .transform((value) => value.trim()),
  salario: z
    .string()
    .min(1, "Ingresa el salario")
    .transform((value) => value.trim().replace(/,/g, ""))
    .refine(
      (value) => SALARIO_REGEX.test(value),
      "Salario inválido (máx. 12 dígitos y 2 decimales)",
    ),
  banco: z
    .string()
    .min(1, "Ingresa el banco")
    .max(255, "Máximo 255 caracteres")
    .transform((value) => value.trim()),
  numero_cuenta: z
    .string()
    .min(1, "Ingresa el número de cuenta")
    .max(50, "Máximo 50 caracteres")
    .transform((value) => value.trim()),
});

export type CreateEmpleadoFormValues = z.infer<typeof createEmpleadoSchema>;
