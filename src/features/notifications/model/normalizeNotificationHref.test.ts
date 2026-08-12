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

  it("redirige cambios de configuración según actor", () => {
    expect(normalizeNotificationHref("/adelanto", "config_fee_updated")).toBe(
      ROUTES.employee.adelanto,
    );
    expect(
      normalizeNotificationHref("/empleador/panel", "config_fee_updated"),
    ).toBe(ROUTES.employer.panel);
    expect(
      normalizeNotificationHref(
        "/empleador/panel",
        "config_advance_percent_updated",
      ),
    ).toBe(ROUTES.employer.panel);
    expect(
      normalizeNotificationHref("/adelanto", "config_min_amount_updated"),
    ).toBe(ROUTES.employee.adelanto);
  });

  it("redirige soporte respondido a mi-soporte", () => {
    expect(normalizeNotificationHref("/soportes", "support_replied")).toBe(
      ROUTES.employee.soportes,
    );
  });

  it("redirige cupo bajo y agotado a control", () => {
    expect(normalizeNotificationHref("/control", "cupo_low")).toBe(
      ROUTES.employee.control,
    );
    expect(normalizeNotificationHref("/control", "cupo_exhausted")).toBe(
      ROUTES.employee.control,
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
