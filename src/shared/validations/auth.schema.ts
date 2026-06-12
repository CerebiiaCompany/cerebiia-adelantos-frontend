// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
// Zod is allowed here (pure TS, compatible with React Native).
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
