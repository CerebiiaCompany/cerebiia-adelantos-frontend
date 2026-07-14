import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";
import {
  assertSystemLoginAllowed,
  buildDemoEmpleadoSession,
  mapEmpleadoLoginResponseToSession,
  mapSystemLoginResponseToSession,
  resolveAppRole,
} from "./authMappers";

const empresaUser = {
  id: "user-1",
  email: "empresa@cerebiia.com",
  full_name: "Empresa Demo",
  is_active: true,
  role: "empresa" as const,
  created_at: "2026-06-18T10:00:00Z",
  updated_at: "2026-06-18T10:00:00Z",
};

const empleadoProfile = {
  id: "emp-1",
  documento: "12345678",
  nombre: "Juan Perez",
  salario: "1500000.00",
  banco: "Bancolombia",
  numero_cuenta: "123456789",
  estado: "activo" as const,
  empresa_id: "empresa-1",
  created_at: "2026-06-18T10:00:00Z",
  updated_at: "2026-06-18T10:00:00Z",
};

describe("mapSystemLoginResponseToSession", () => {
  it("maps empresa users to employer sessions", () => {
    const session = mapSystemLoginResponseToSession({
      user: empresaUser,
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(session.actorType).toBe("system_user");
    expect(resolveAppRole(session)).toBe("employer");
  });

  it("rejects super admin logins", () => {
    expect(() =>
      assertSystemLoginAllowed({
        ...empresaUser,
        role: "super_admin",
      }),
    ).toThrow(ApiError);
  });
});

describe("mapEmpleadoLoginResponseToSession", () => {
  it("maps active employees to employee sessions", () => {
    const session = mapEmpleadoLoginResponseToSession({
      empleado: empleadoProfile,
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(session.actorType).toBe("empleado");
    expect(resolveAppRole(session)).toBe("employee");
  });

  it("rechaza empleados suspendidos con mensaje claro", () => {
    expect(() =>
      mapEmpleadoLoginResponseToSession({
        empleado: { ...empleadoProfile, estado: "inactivo" },
        tokens: { access: "access", refresh: "refresh" },
      }),
    ).toThrow(/suspendida/i);
  });

  it("normaliza banco_nombre del backend al campo banco de sesión", () => {
    const session = mapEmpleadoLoginResponseToSession({
      empleado: {
        id: "emp-1",
        documento: "12345678",
        nombre: "Juan Perez",
        salario: "1500000.00",
        banco_nombre: "Nequi",
        numero_cuenta: "123456789",
        estado: "activo",
        empresa_id: "empresa-1",
        created_at: "2026-06-18T10:00:00Z",
        updated_at: "2026-06-18T10:00:00Z",
      },
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(session.empleado.banco).toBe("Nequi");
  });
});

describe("buildDemoEmpleadoSession", () => {
  it("returns a demo employee session", () => {
    const session = buildDemoEmpleadoSession();
    expect(session.actorType).toBe("empleado");
    expect(resolveAppRole(session)).toBe("employee");
  });
});
