import { render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthGuard } from "./AuthGuard";
import { RoleGuard } from "./RoleGuard";
import { ROUTES } from "@/shared/config/routes";
import type { SystemUserSession } from "@/shared/api/types/auth";

const useAuthAccessMock = vi.fn();

vi.mock("@/features/auth", () => ({
  useAuthAccess: () => useAuthAccessMock(),
}));

const employerSession: SystemUserSession = {
  actorType: "system_user",
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: {
    id: "9fbbb9bf-4a5c-401f-855c-541a650af6db",
    email: "admin@empresa.com",
    full_name: "Admin Empresa",
    is_active: true,
    role: "empresa",
    created_at: "2026-06-18T18:21:38.613733-05:00",
    updated_at: "2026-06-18T18:21:38.613849-05:00",
  },
};

function renderEmployerRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={ROUTES.login} element={<div>Login page</div>} />
        <Route element={<AuthGuard />}>
          <Route element={<RoleGuard allowed={["employer"]} />}>
            <Route path="/empleador" element={<div>Employer layout<Outlet /></div>}>
              <Route path="panel" element={<div>Employer dashboard</div>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthGuard", () => {
  beforeEach(() => {
    useAuthAccessMock.mockReset();
  });

  it("redirige a login si no hay sesión válida", () => {
    useAuthAccessMock.mockReturnValue({
      isAuthenticated: false,
      isInitializing: false,
      appRole: null,
      session: null,
    });

    renderEmployerRoute(ROUTES.employer.panel);

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("permite el panel empresa cuando el rol es employer", () => {
    useAuthAccessMock.mockReturnValue({
      isAuthenticated: true,
      isInitializing: false,
      appRole: "employer",
      session: employerSession,
    });

    renderEmployerRoute(ROUTES.employer.panel);

    expect(screen.getByText("Employer dashboard")).toBeInTheDocument();
  });
});
