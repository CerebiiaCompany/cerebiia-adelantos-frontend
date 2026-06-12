// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { z } from "zod";

export const requestAdvanceSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Ingresa un monto" })
    .min(10_000, "Mínimo $10.000 COP")
    .max(5_000_000, "Máximo $5.000.000 COP"),
});

export type RequestAdvanceValues = z.infer<typeof requestAdvanceSchema>;
