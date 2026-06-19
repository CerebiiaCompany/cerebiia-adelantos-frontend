import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  updateProfileDataSchema,
} from "./auth.schema";

describe("loginSchema", () => {
  it("requires a valid employee document and password", () => {
    const valid = loginSchema.safeParse({
      loginType: "empleado",
      documento: " 12345678 ",
      password: "secret",
      rememberMe: true,
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.documento).toBe("12345678");
    }
  });

  it("requires a valid company email and password", () => {
    const valid = loginSchema.safeParse({
      loginType: "empresa",
      email: " Admin@Empresa.COM ",
      password: "secret",
      rememberMe: false,
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("admin@empresa.com");
    }
  });
});

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

describe("changePasswordSchema", () => {
  it("requiere contraseña actual, nueva y confirmación válidas", () => {
    const empty = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    expect(empty.success).toBe(false);

    const valid = changePasswordSchema.safeParse({
      currentPassword: "Actual123",
      newPassword: "NuevaClave1",
      confirmPassword: "NuevaClave1",
    });
    expect(valid.success).toBe(true);
  });
});

describe("updateProfileDataSchema", () => {
  it("requiere correo y teléfono colombiano válidos", () => {
    const invalid = updateProfileDataSchema.safeParse({
      email: "correo-invalido",
      phone: "123",
    });
    expect(invalid.success).toBe(false);

    const valid = updateProfileDataSchema.safeParse({
      email: "usuario@empresa.com",
      phone: "3001234567",
    });
    expect(valid.success).toBe(true);
  });
});
