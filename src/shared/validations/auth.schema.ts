// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
// Zod is allowed here (pure TS, compatible with React Native).
import { z } from "zod";
import { isValidEmail } from "./register.schema";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  rememberMe: z.boolean().default(false),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .refine(isValidEmail, "Ingresa un correo electrónico válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
