import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  updateProfileDataSchema,
} from "./auth.schema";

describe("loginSchema", () => {
  it("requiere usuario (documento) y contraseña válidos", () => {
    const empty = loginSchema.safeParse({
      username: "",
      password: "",
      rememberMe: false,
    });
    expect(empty.success).toBe(false);

    const shortDocument = loginSchema.safeParse({
      username: "1234",
      password: "123456",
      rememberMe: false,
    });
    expect(shortDocument.success).toBe(false);

    const valid = loginSchema.safeParse({
      username: " 1020304050 ",
      password: "123456",
      rememberMe: true,
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.username).toBe("1020304050");
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

    const weak = changePasswordSchema.safeParse({
      currentPassword: "Actual123",
      newPassword: "corta1",
      confirmPassword: "corta1",
    });
    expect(weak.success).toBe(false);

    const mismatch = changePasswordSchema.safeParse({
      currentPassword: "Actual123",
      newPassword: "NuevaClave1",
      confirmPassword: "OtraClave1",
    });
    expect(mismatch.success).toBe(false);

    const sameAsCurrent = changePasswordSchema.safeParse({
      currentPassword: "Actual123",
      newPassword: "Actual123",
      confirmPassword: "Actual123",
    });
    expect(sameAsCurrent.success).toBe(false);

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
