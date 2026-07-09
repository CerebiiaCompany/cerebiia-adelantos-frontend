// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
// Zod is allowed here (pure TS, compatible with React Native).
import { z } from "zod";
import {
  getPasswordRequirementChecks,
  isValidEmail,
  EMAIL_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  contactEmailSchema,
  contactPhoneSchema,
} from "./register.schema";

export const loginSchema = z.discriminatedUnion("loginType", [
  z.object({
    loginType: z.literal("empleado"),
    documento: z
      .string()
      .min(1, "Ingresa tu número de documento")
      .max(20, "Máximo 20 caracteres")
      .transform((value) => value.trim()),
    password: z.string().min(1, "Ingresa tu contraseña"),
    rememberMe: z.boolean().default(false),
  }),
  z.object({
    loginType: z.literal("empresa"),
    email: z
      .string()
      .min(1, "Ingresa tu correo electrónico")
      .max(
        EMAIL_MAX_LENGTH,
        `El correo no puede superar ${EMAIL_MAX_LENGTH} caracteres`,
      )
      .transform((value) => value.trim().toLowerCase())
      .refine(isValidEmail, "Ingresa un correo electrónico válido"),
    password: z.string().min(1, "Ingresa tu contraseña"),
    rememberMe: z.boolean().default(false),
  }),
]);

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .max(
      EMAIL_MAX_LENGTH,
      `El correo no puede superar ${EMAIL_MAX_LENGTH} caracteres`,
    )
    .refine(isValidEmail, "Ingresa un correo electrónico válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function validateNewPassword(password: string, ctx: z.RefinementCtx, path?: string) {
  const checks = getPasswordRequirementChecks(password);

  if (!checks.hasUppercase) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña debe incluir al menos una mayúscula",
      path: path ? [path] : undefined,
    });
  }

  if (!checks.hasLowercase) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña debe incluir al menos una minúscula",
      path: path ? [path] : undefined,
    });
  }

  if (!checks.hasNumber) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La contraseña debe incluir al menos un número",
      path: path ? [path] : undefined,
    });
  }

  if (!checks.hasMinLength) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`,
      path: path ? [path] : undefined,
    });
  }
}

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Ingresa tu contraseña actual"),
    newPassword: z
      .string()
      .min(1, "Ingresa tu nueva contraseña"),
    confirmPassword: z
      .string()
      .min(1, "Confirma tu nueva contraseña"),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword) {
      validateNewPassword(data.newPassword, ctx, "newPassword");
    }

    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
      });
    }

    if (
      data.currentPassword &&
      data.newPassword &&
      data.currentPassword === data.newPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La nueva contraseña debe ser diferente a la actual",
        path: ["newPassword"],
      });
    }
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const updateProfileDataSchema = z.object({
  email: contactEmailSchema.shape.email,
  phone: contactPhoneSchema.shape.phone,
});

export type UpdateProfileDataFormValues = z.infer<typeof updateProfileDataSchema>;
