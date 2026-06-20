import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { authStorage } from "./authStorage";
import { logoutAuthSession } from "./logoutSession";
import type { EmpleadoSession } from "./types/auth";

const empleadoSession: EmpleadoSession = {
  actorType: "empleado",
  accessToken: "access-token",
  refreshToken: "refresh-token",
  empleado: {
    id: "emp-1",
    documento: "1234567890",
    nombre: "Ana Pérez",
    salario: "3000000",
    banco: "Bancolombia",
    numero_cuenta: "123",
    estado: "activo",
    empresa_id: "company-1",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
};

describe("logoutAuthSession", () => {
  beforeEach(() => {
    authStorage.set(empleadoSession);
  });

  afterEach(() => {
    authStorage.clear();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("revoca tokens en el backend con refresh y Bearer access", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await logoutAuthSession();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/auth/logout/");

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = new Headers(init.headers);

    expect(init.method).toBe("POST");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(JSON.parse(init.body as string)).toEqual({
      refresh: "refresh-token",
    });
  });

  it("no llama al backend si no hay refresh token", async () => {
    authStorage.set({
      ...empleadoSession,
      refreshToken: "",
    });

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await logoutAuthSession();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no lanza error si el backend responde 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "Invalid email or password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(logoutAuthSession()).resolves.toBeUndefined();
  });
});
