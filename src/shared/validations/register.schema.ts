// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { z } from "zod";
import {
  COLOMBIAN_DEPARTMENTS,
  GENDER_OPTIONS,
  PAYMENT_DAY_DEFAULT,
  PAYMENT_DAY_MAX,
  PAYMENT_DAY_MIN,
} from "@/shared/constants/colombia";

export const documentTypes = ["CC", "PASSPORT", "CE", "PPT"] as const;
export type DocumentType = (typeof documentTypes)[number];

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "CC", label: "Cédula de Ciudadanía Colombiana" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PPT", label: "Permiso por protección temporal - PPT" },
] as const;

const genderValues = GENDER_OPTIONS.map((g) => g.value) as [
  (typeof GENDER_OPTIONS)[number]["value"],
  ...(typeof GENDER_OPTIONS)[number]["value"][],
];

const departmentValues = [...COLOMBIAN_DEPARTMENTS] as [
  (typeof COLOMBIAN_DEPARTMENTS)[number],
  ...(typeof COLOMBIAN_DEPARTMENTS)[number][],
];

const documentPatterns: Record<DocumentType, RegExp> = {
  CC: /^\d{6,10}$/,
  PASSPORT: /^[A-Za-z0-9]{6,10}$/,
  CE: /^\d{6,11}$/,
  PPT: /^\d{15}$/,
};

export function getDocumentMaxLength(type: DocumentType): number {
  switch (type) {
    case "CC":
    case "PASSPORT":
      return 10;
    case "CE":
      return 11;
    case "PPT":
      return 15;
  }
}

export function sanitizeDocumentNumber(
  type: DocumentType,
  value: string,
): string {
  const maxLength = getDocumentMaxLength(type);

  if (type === "PASSPORT") {
    return value.replace(/[^A-Za-z0-9]/g, "").slice(0, maxLength);
  }

  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function isValidDocumentNumber(
  type: DocumentType,
  number: string,
): boolean {
  const trimmed = number.trim();
  if (!trimmed) return false;

  const pattern = documentPatterns[type];
  if (!pattern) return false;

  return pattern.test(trimmed);
}

export const verifyDocumentSchema = z
  .object({
    documentType: z.enum(documentTypes, {
      required_error: "Selecciona un tipo de documento",
      invalid_type_error: "Selecciona un tipo de documento",
    }),
    documentNumber: z.string().min(1, "Ingresa el número de documento"),
    acceptMandatorySensitiveTreatment: z.boolean().refine((value) => value === true, {
      message:
        "Debes autorizar el tratamiento obligatorio y sensible para continuar.",
    }),
    acceptAccessoryTreatment: z.boolean().refine((value) => value === true, {
      message:
        "Debes autorizar el tratamiento para finalidades accesorias para continuar.",
    }),
  })
  .superRefine((data, ctx) => {
    const trimmed = data.documentNumber.trim();
    if (!trimmed) return;

    if (!isValidDocumentNumber(data.documentType, trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe ingresar un documento válido",
        path: ["documentNumber"],
      });
    }
  });

export const basicInfoSchema = z.object({
  firstNames: z
    .string()
    .min(1, "Ingresa tus nombres completos")
    .min(2, "Los nombres deben tener al menos 2 caracteres"),
  lastNames: z
    .string()
    .min(1, "Ingresa tus apellidos completos")
    .min(2, "Los apellidos deben tener al menos 2 caracteres"),
  gender: z.enum(genderValues, {
    required_error: "Selecciona tu género",
    invalid_type_error: "Selecciona tu género",
  }),
  cityId: z.string().min(1, "Selecciona tu ciudad"),
  department: z.enum(departmentValues, {
    required_error: "Selecciona tu departamento",
    invalid_type_error: "Selecciona tu departamento",
  }),
  address: z
    .string()
    .min(1, "Ingresa tu dirección")
    .min(5, "La dirección debe tener al menos 5 caracteres"),
  companyId: z.string().min(1, "Selecciona tu empresa"),
  paymentDay: z
    .number({
      required_error: "Selecciona tu día de pago",
      invalid_type_error: "Selecciona tu día de pago",
    })
    .min(PAYMENT_DAY_MIN, "El día de pago mínimo es 1")
    .max(PAYMENT_DAY_MAX, "El día de pago máximo es 30"),
});

// Validación de correo electrónico
export const EMAIL_MAX_LENGTH = 254;

const EMAIL_REGEX =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || normalized.length > EMAIL_MAX_LENGTH) return false;
  if (normalized.includes("..")) return false;
  return EMAIL_REGEX.test(normalized);
}

// Validación de celular colombiano (10 dígitos, inicia en 3)
export function sanitizeColombianPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("57") && digits.length > 10) {
    digits = digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function isValidColombianPhone(phone: string): boolean {
  const sanitized = sanitizeColombianPhone(phone);
  return /^3\d{9}$/.test(sanitized);
}

export const contactEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .refine(isValidEmail, "Ingresa un correo electrónico válido"),
  acceptDataPolicy: z
    .boolean()
    .refine((value) => value === true, {
      message: "Debes aceptar la política de tratamiento de datos",
    }),
  acceptRecords: z
    .boolean()
    .refine((value) => value === true, {
      message: "Debes autorizar el tratamiento de registros",
    }),
});

export const contactPhoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Ingresa tu número celular")
    .refine(
      (value) => isValidColombianPhone(value),
      "Ingresa un número celular colombiano válido (10 dígitos, inicia en 3)",
    ),
  acceptWalletContract: z
    .boolean()
    .refine((value) => value === true, {
      message:
        "Debes autorizar el uso de tu número celular y aceptar las condiciones del contrato",
    }),
  acceptTemporaryStorage: z
    .boolean()
    .refine((value) => value === true, {
      message: "Debes aceptar el almacenamiento temporal de tus datos",
    }),
});

export const reviewStepSchema = z.object({
  firstNames: basicInfoSchema.shape.firstNames,
  lastNames: basicInfoSchema.shape.lastNames,
  gender: basicInfoSchema.shape.gender,
  address: basicInfoSchema.shape.address,
  companyId: basicInfoSchema.shape.companyId,
  email: contactEmailSchema.shape.email,
  phone: contactPhoneSchema.shape.phone,
});

export const PASSWORD_MIN_LENGTH = 8;

export interface PasswordRequirementChecks {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasMinLength: boolean;
}

export function getPasswordRequirementChecks(
  password: string,
): PasswordRequirementChecks {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasMinLength: password.length >= PASSWORD_MIN_LENGTH,
  };
}

export function isPasswordValid(password: string): boolean {
  const checks = getPasswordRequirementChecks(password);
  return Object.values(checks).every(Boolean);
}

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Ingresa tu contraseña")
      .superRefine((password, ctx) => {
        const checks = getPasswordRequirementChecks(password);

        if (!checks.hasUppercase) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La contraseña debe incluir al menos una mayúscula",
          });
        }

        if (!checks.hasLowercase) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La contraseña debe incluir al menos una minúscula",
          });
        }

        if (!checks.hasNumber) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "La contraseña debe incluir al menos un número",
          });
        }

        if (!checks.hasMinLength) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
          });
        }
      }),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }
  });

/** @deprecated Usar verifyDocumentSchema */
export const registerSchema = verifyDocumentSchema;

export type VerifyDocumentFormValues = z.infer<typeof verifyDocumentSchema>;
export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
export type ContactEmailFormValues = z.infer<typeof contactEmailSchema>;
export type ContactPhoneFormValues = z.infer<typeof contactPhoneSchema>;
export type ReviewStepFormValues = z.infer<typeof reviewStepSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
export type RegisterFormValues = VerifyDocumentFormValues;

// ── Carga de documento de identidad ──────────────────────────────────────────

// Límite pensado para fotos directas de cámara móvil (12–48 MP, distintos fabricantes).
export const IDENTITY_UPLOAD_MAX_MB = 15;
export const IDENTITY_UPLOAD_MAX_BYTES = IDENTITY_UPLOAD_MAX_MB * 1024 * 1024;

const IDENTITY_ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"] as const;
const IDENTITY_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export interface IdentityFileLike {
  name: string;
  size: number;
  type: string;
}

export function requiresDocumentBothSides(type: DocumentType): boolean {
  return type === "CC" || type === "CE" || type === "PPT";
}

export function getIdentityFileExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function isAllowedIdentityFile(file: IdentityFileLike): boolean {
  const extension = getIdentityFileExtension(file.name);
  if (
    !IDENTITY_ALLOWED_EXTENSIONS.includes(
      extension as (typeof IDENTITY_ALLOWED_EXTENSIONS)[number],
    )
  ) {
    return false;
  }

  if (!file.type) return true;

  return IDENTITY_ALLOWED_MIME_TYPES.includes(
    file.type as (typeof IDENTITY_ALLOWED_MIME_TYPES)[number],
  );
}

export function validateIdentityFile(
  file: IdentityFileLike | null | undefined,
): string | null {
  if (!file) return "Debes adjuntar el archivo de tu documento";

  if (!isAllowedIdentityFile(file)) {
    return "Formato no permitido. Usa JPG, JPEG, PNG o PDF";
  }

  if (file.size > IDENTITY_UPLOAD_MAX_BYTES) {
    return `El archivo supera el tamaño máximo de ${IDENTITY_UPLOAD_MAX_MB} MB`;
  }

  return null;
}

export interface IdentityUploadFormValues {
  frontFile: File | null;
  backFile: File | null;
}

export function validateIdentityUpload(
  documentType: DocumentType,
  values: IdentityUploadFormValues,
): { frontFile?: string; backFile?: string } {
  const errors: { frontFile?: string; backFile?: string } = {};
  const needsBothSides = requiresDocumentBothSides(documentType);

  const frontError = validateIdentityFile(values.frontFile);
  if (frontError) {
    errors.frontFile = needsBothSides
      ? "Adjunta la cara frontal de tu documento"
      : frontError;
  }

  if (needsBothSides) {
    const backError = validateIdentityFile(values.backFile);
    if (backError) {
      errors.backFile = "Adjunta la cara posterior de tu documento";
    }
  }

  return errors;
}

export function validateLaborCertFile(
  file: IdentityFileLike | null | undefined,
): string | null {
  if (!file) return "Debes adjuntar tu certificación laboral";

  if (!isAllowedIdentityFile(file)) {
    return "Formato no permitido. Usa JPG, JPEG, PNG o PDF";
  }

  if (file.size > IDENTITY_UPLOAD_MAX_BYTES) {
    return `El archivo supera el tamaño máximo de ${IDENTITY_UPLOAD_MAX_MB} MB`;
  }

  return null;
}
