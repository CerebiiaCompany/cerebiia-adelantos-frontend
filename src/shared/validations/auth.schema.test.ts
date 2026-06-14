import { describe, expect, it } from "vitest";
import { forgotPasswordSchema } from "./auth.schema";

describe("forgotPasswordSchema", () => {
  it("requiere un correo electrónico válido", () => {
    const empty = forgotPasswordSchema.safeParse({ email: "" });
    expect(empty.success).toBe(false);

    const invalid = forgotPasswordSchema.safeParse({ email: "correo-invalido" });
    expect(invalid.success).toBe(false);

    const valid = forgotPasswordSchema.safeParse({
      email: "usuario@empresa.com",
    });
    expect(valid.success).toBe(true);
  });
});
