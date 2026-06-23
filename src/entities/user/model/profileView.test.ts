import { describe, expect, it } from "vitest";
import { mapEmpleadoToProfileView } from "./profileView";

describe("mapEmpleadoToProfileView", () => {
  it("mapea los datos del empleado autenticado al perfil visible", () => {
    const profile = mapEmpleadoToProfileView({
      id: "emp-123",
      documento: "1098765432",
      nombre: "Erick Herrera",
      salario: "2400000.00",
      banco: "Bancolombia",
      numero_cuenta: "987654321",
      tipo_cuenta: "ahorros",
      estado: "activo",
      empresa_id: "empresa-abc",
      created_at: "2025-01-15T10:00:00.000Z",
      updated_at: "2025-01-15T10:00:00.000Z",
    });

    expect(profile.initials).toBe("EH");
    expect(profile.fullName).toBe("Erick Herrera");
    expect(profile.documentNumber).toBe("1098765432");
    expect(profile.salary).toContain("2.400.000");
    expect(profile.bank).toBe("Bancolombia");
    expect(profile.accountNumber).toBe("987654321");
    expect(profile.accountType).toBe("ahorros");
    expect(profile.status).toBe("Activo");
    expect(profile.isVerified).toBe(true);
    expect(profile.roleLabel).toContain("Empleado");
  });

  it("usa banco_nombre cuando banco no está presente", () => {
    const profile = mapEmpleadoToProfileView({
      id: "emp-123",
      documento: "1098765432",
      nombre: "Erick Herrera",
      salario: "2400000.00",
      banco_nombre: "Davivienda",
      numero_cuenta: "987654321",
      estado: "activo",
      empresa_id: "empresa-abc",
      created_at: "2025-01-15T10:00:00.000Z",
      updated_at: "2025-01-15T10:00:00.000Z",
    });

    expect(profile.bank).toBe("Davivienda");
  });
});
