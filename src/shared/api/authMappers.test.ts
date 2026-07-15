import { describe, expect, it, beforeEach } from "vitest";
import { ApiError } from "./errors";
import {
  assertSystemLoginAllowed,
  buildDemoEmpleadoSession,
  mapEmpleadoLoginResponseToSession,
  mapSystemLoginResponseToSession,
  mustChangePassword,
  resolveAppRole,
} from "./authMappers";
import { passwordChangeCompletionStorage } from "./passwordChangeCompletionStorage";

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

beforeEach(() => {
  passwordChangeCompletionStorage.clear();
});

describe("mapSystemLoginResponseToSession", () => {
  it("maps empresa users to employer sessions", () => {
    const session = mapSystemLoginResponseToSession({
      user: empresaUser,
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(session.actorType).toBe("system_user");
    expect(resolveAppRole(session)).toBe("employer");
  });

  it("preserva must_change_password del usuario empresa", () => {
    const session = mapSystemLoginResponseToSession({
      user: { ...empresaUser, must_change_password: true },
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(session.user.must_change_password).toBe(true);
  });

  it("normaliza aliases camelCase del flag", () => {
    const session = mapSystemLoginResponseToSession({
      user: {
        ...empresaUser,
        mustChangePassword: true,
      } as typeof empresaUser & { mustChangePassword: boolean },
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(session.user.must_change_password).toBe(true);
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

describe("mustChangePassword", () => {
  it("es true con flag explícito en true", () => {
    const session = mapSystemLoginResponseToSession({
      user: { ...empresaUser, must_change_password: true },
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(mustChangePassword(session)).toBe(true);
  });

  it("es false con flag explícito en false", () => {
    const session = mapSystemLoginResponseToSession({
      user: { ...empresaUser, must_change_password: false },
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(mustChangePassword(session)).toBe(false);
  });

  it("si el backend no envía el flag, obliga a cambiar hasta completar", () => {
    const session = mapSystemLoginResponseToSession({
      user: empresaUser,
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(mustChangePassword(session)).toBe(true);

    passwordChangeCompletionStorage.markCompleted(session.user.id);
    expect(mustChangePassword(session)).toBe(false);
  });

  it("nunca aplica a sesiones de empleado", () => {
    const session = mapEmpleadoLoginResponseToSession({
      empleado: empleadoProfile,
      tokens: { access: "access", refresh: "refresh" },
    });

    expect(mustChangePassword(session)).toBe(false);
  });

  it("es false con sesión nula", () => {
    expect(mustChangePassword(null)).toBe(false);
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
