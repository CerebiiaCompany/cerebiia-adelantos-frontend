import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useAuthAccess } from "./useAuthAccess";
import type { SystemUserSession } from "@/shared/api/types/auth";

const useAuthMock = vi.fn();

vi.mock("./AuthProvider", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/shared/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api")>();
  return {
    ...actual,
    authStorage: {
      get: vi.fn(() => null),
      set: vi.fn(),
      clear: vi.fn(),
    },
  };
});

const employerSession: SystemUserSession = {
  actorType: "system_user",
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: {
    id: "1",
    email: "admin@empresa.com",
    full_name: "Admin Empresa",
    is_active: true,
    role: "empresa",
    created_at: "2026-06-18T18:21:38.613733-05:00",
    updated_at: "2026-06-18T18:21:38.613849-05:00",
  },
};

describe("useAuthAccess", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("usa el rol de localStorage si React aún no actualizó el estado", async () => {
    const { authStorage } = await import("@/shared/api");
    vi.mocked(authStorage.get).mockReturnValue(employerSession);

    useAuthMock.mockReturnValue({
      session: null,
      appRole: null,
      isAuthenticated: false,
      isInitializing: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useAuthAccess());

    expect(result.current.appRole).toBe("employer");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.session).toEqual(employerSession);
  });
});
