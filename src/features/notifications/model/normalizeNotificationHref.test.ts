import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/config/routes";
import { normalizeNotificationHref } from "./normalizeNotificationHref";

describe("normalizeNotificationHref", () => {
  it("redirige adelanto aprobado a mis adelantos aunque el href sea /adelanto", () => {
    expect(normalizeNotificationHref("/adelanto", "advance_approved")).toBe(
      ROUTES.employee.misAdelantos,
    );
  });

  it("redirige evidencia y otros estados de adelanto a mis adelantos", () => {
    expect(normalizeNotificationHref("/adelanto", "advance_paid")).toBe(
      ROUTES.employee.misAdelantos,
    );
    expect(normalizeNotificationHref("/adelanto", "payment_evidence")).toBe(
      ROUTES.employee.misAdelantos,
    );
    expect(normalizeNotificationHref("", "advance_requested")).toBe(
      ROUTES.employee.misAdelantos,
    );
  });

  it("mantiene /adelanto solo para cambios de configuración", () => {
    expect(normalizeNotificationHref("/adelanto", "config_fee_updated")).toBe(
      ROUTES.employee.adelanto,
    );
  });

  it("redirige soporte respondido a mi-soporte", () => {
    expect(normalizeNotificationHref("/soportes", "support_replied")).toBe(
      ROUTES.employee.soportes,
    );
  });

  it("preserva hash de logros", () => {
    expect(
      normalizeNotificationHref("/logros#logro-primera_vez", "achievement_unlocked"),
    ).toBe(`${ROUTES.employee.logros}#logro-primera_vez`);
  });

  it("separa auditoría empleado vs empresa", () => {
    expect(normalizeNotificationHref("/auditorias", "data_change_audit")).toBe(
      ROUTES.employee.auditorias,
    );
    expect(
      normalizeNotificationHref("/empleador/auditorias", "data_change_audit"),
    ).toBe(ROUTES.employer.auditorias);
  });

  it("corrige /empleador/empleados a mis-empleados", () => {
    expect(
      normalizeNotificationHref("/empleador/empleados", "employee_activated"),
    ).toBe(ROUTES.employer.misEmpleados);
  });
});
