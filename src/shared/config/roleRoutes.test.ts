import { describe, expect, it, beforeEach } from "vitest";
import { getHomeRouteForAppRole, getPostLoginRoute } from "./roleRoutes";
import { ROUTES } from "./routes";
import type { AuthSession } from "@/shared/api/types/auth";
import { passwordChangeCompletionStorage } from "@/shared/api/passwordChangeCompletionStorage";

const empresaSession = {
  actorType: "system_user",
  accessToken: "access",
  refreshToken: "refresh",
  user: {
    id: "user-1",
    email: "empresa@cerebiia.com",
    full_name: "Empresa Demo",
    is_active: true,
    role: "empresa",
    created_at: "2026-06-18T10:00:00Z",
    updated_at: "2026-06-18T10:00:00Z",
  },
} satisfies AuthSession;

beforeEach(() => {
  passwordChangeCompletionStorage.clear();
});

describe("getHomeRouteForAppRole", () => {
  it("routes employees to the employee dashboard", () => {
    expect(getHomeRouteForAppRole("employee")).toBe(ROUTES.employee.dashboard);
  });

  it("routes employers to the employer panel", () => {
    expect(getHomeRouteForAppRole("employer")).toBe(ROUTES.employer.panel);
  });
});

describe("getPostLoginRoute", () => {
  it("envía a la empresa a cambiar contraseña cuando el flag es true", () => {
    expect(
      getPostLoginRoute({
        ...empresaSession,
        user: { ...empresaSession.user, must_change_password: true },
      }),
    ).toBe(ROUTES.employer.changePasswordRequired);
  });

  it("envía a cambiar contraseña si el backend aún no envía el flag", () => {
    expect(getPostLoginRoute(empresaSession)).toBe(
      ROUTES.employer.changePasswordRequired,
    );
  });

  it("envía al panel cuando el flag es false", () => {
    expect(
      getPostLoginRoute({
        ...empresaSession,
        user: { ...empresaSession.user, must_change_password: false },
      }),
    ).toBe(ROUTES.employer.panel);
  });
});
