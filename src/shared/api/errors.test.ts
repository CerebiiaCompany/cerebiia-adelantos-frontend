import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";

describe("ApiError", () => {
  it("traduce credenciales inválidas del backend a español", () => {
    const error = new ApiError(401, "/auth/login/", {
      detail: "Invalid email or password",
    });

    expect(error.message).toBe(
      "Credenciales incorrectas. Verifica tus datos e intenta de nuevo.",
    );
    expect(error.status).toBe(401);
  });

  it("muestra mensaje de cuenta suspendida sin alterarlo", () => {
    const error = new ApiError(403, "/empleados/login/", {
      detail:
        "Tu cuenta ha sido suspendida por la empresa. Contacta a Recursos Humanos.",
    });

    expect(error.message).toMatch(/suspendida/i);
  });

  it("uses first field validation message for 400 responses", () => {
    const error = new ApiError(400, "/auth/login/", {
      email: ["Enter a valid email address."],
    });

    expect(error.message).toBe("Enter a valid email address.");
  });

  it("detects proxy ECONNREFUSED as backend unreachable", () => {
    const error = new ApiError(500, "/auth/login/", null);

    expect(error.message).toContain("No se pudo conectar con el backend");
  });
});
