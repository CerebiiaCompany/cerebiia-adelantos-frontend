import { describe, expect, it } from "vitest";
import {
  canAccessModule,
  canAccessPath,
  getModulesForRole,
} from "./moduleAccess";
import { ROUTES } from "./routes";

describe("moduleAccess", () => {
  it("allows employees to access all employee modules", () => {
    const modules = getModulesForRole("employee");
    expect(modules).toHaveLength(8);

    for (const moduleId of modules) {
      expect(canAccessModule("employee", moduleId)).toBe(true);
      expect(canAccessModule("employer", moduleId)).toBe(false);
    }
  });

  it("allows employers to access all employer audit modules", () => {
    expect(canAccessModule("employer", "employer.dashboard")).toBe(true);
    expect(canAccessModule("employer", "employer.misEmpleados")).toBe(true);
    expect(canAccessModule("employer", "employer.monitoreoAdelantos")).toBe(
      true,
    );
    expect(canAccessModule("employer", "employer.seguimientoCuotas")).toBe(
      true,
    );
    expect(canAccessModule("employer", "employer.historialMovimientos")).toBe(
      true,
    );
    expect(canAccessModule("employer", "employer.retencionesCierres")).toBe(
      true,
    );
    expect(canAccessModule("employer", "employee.adelanto")).toBe(false);
    expect(getModulesForRole("employer")).toEqual([
      "employer.dashboard",
      "employer.misEmpleados",
      "employer.monitoreoAdelantos",
      "employer.seguimientoCuotas",
      "employer.historialMovimientos",
      "employer.retencionesCierres",
    ]);
  });

  it("blocks cross-role path access", () => {
    expect(canAccessPath("employee", ROUTES.employee.adelanto)).toBe(true);
    expect(canAccessPath("employer", ROUTES.employee.adelanto)).toBe(false);
    expect(canAccessPath("employer", ROUTES.employer.misEmpleados)).toBe(
      true,
    );
    expect(
      canAccessPath("employer", ROUTES.employer.monitoreoAdelantos),
    ).toBe(true);
    expect(canAccessPath("employee", ROUTES.employer.panel)).toBe(false);
  });
});
