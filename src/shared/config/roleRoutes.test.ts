import { describe, expect, it } from "vitest";
import { getHomeRouteForAppRole } from "./roleRoutes";
import { ROUTES } from "./routes";

describe("getHomeRouteForAppRole", () => {
  it("routes employees to the employee dashboard", () => {
    expect(getHomeRouteForAppRole("employee")).toBe(ROUTES.employee.dashboard);
  });

  it("routes employers to the employer panel", () => {
    expect(getHomeRouteForAppRole("employer")).toBe(ROUTES.employer.panel);
  });
});
