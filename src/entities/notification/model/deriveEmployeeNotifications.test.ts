import { describe, expect, it, vi } from "vitest";
import { deriveEmployeeNotifications } from "./deriveEmployeeNotifications";

const routes = {
  misAdelantos: "/mis-adelantos",
  control: "/control",
  logros: "/logros",
  auditorias: "/auditorias",
  soportes: "/mi-soporte",
  adelanto: "/adelanto",
};

const baseInput = {
  routes,
  solicitudes: [] as const,
  auditoriaCambios: [] as const,
  reportes: [] as const,
  achievements: [] as const,
  cupoUsedPercent: 0,
  monthKey: "2026-01",
  nextPaymentNet: null as number | null,
  previousNextPaymentNet: null as number | null,
  adelantoConfig: null as null,
  previousAdelantoConfig: null as null,
  now: new Date("2026-01-10T12:00:00.000Z"),
};

describe("deriveEmployeeNotifications", () => {
  it("deriva aprobado, pagado, rechazado y no emite notificación en estado solicitado", () => {
    const { notifications } = deriveEmployeeNotifications({
      ...baseInput,
      nextPaymentNet: 1_000_000,
      previousNextPaymentNet: 1_000_000,
      solicitudes: [
        {
          id: "s0",
          monto: 80000,
          estado: "solicitado",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "s1",
          monto: 100000,
          estado: "aprobado",
          createdAt: "2026-01-01T00:00:00.000Z",
          decididoEn: "2026-01-02T00:00:00.000Z",
        },
        {
          id: "s2",
          monto: 200000,
          estado: "pagado",
          createdAt: "2026-01-01T00:00:00.000Z",
          pagadoEn: "2026-01-03T00:00:00.000Z",
          comprobantePagoUrl: "https://example.com/c.pdf",
        },
        {
          id: "s3",
          monto: 50000,
          estado: "rechazado",
          createdAt: "2026-01-01T00:00:00.000Z",
          motivoRechazo: "Datos incompletos",
        },
      ],
    });

    const kinds = notifications.map((n) => n.kind);
    expect(kinds).not.toContain("advance_requested");
    expect(kinds).toContain("advance_approved");
    expect(kinds).toContain("advance_paid");
    expect(kinds).toContain("advance_rejected");
    expect(notifications.find((n) => n.id === "advance-approved:s2")).toBeUndefined();
    
    const approvedNotification = notifications.find((n) => n.id === "advance-approved:s1");
    expect(approvedNotification?.description).toContain("24 horas");

    const paidNotification = notifications.find((n) => n.id === "advance-paid:s2");
    expect(paidNotification?.description).toContain("Revisa la evidencia");

    expect(
      notifications.find((n) => n.id === "advance-rejected:s3")?.description,
    ).toContain("Datos incompletos");
  });

  it("emite cupo 80, logro, auditoría y soporte respondido", () => {
    const { notifications } = deriveEmployeeNotifications({
      ...baseInput,
      nextPaymentNet: 900000,
      previousNextPaymentNet: 900000,
      cupoUsedPercent: 85,
      auditoriaCambios: [
        {
          id: "a1",
          actorTipo: "empresa",
          actorNombre: "RRHH",
          createdAt: "2026-01-05T00:00:00.000Z",
        },
      ],
      reportes: [
        {
          id: "r1",
          estado: "respondido",
          respondidoEn: "2026-01-06T00:00:00.000Z",
          respondidoPorNombre: "Soporte",
          createdAt: "2026-01-04T00:00:00.000Z",
        },
      ],
      achievements: [
        {
          id: "primera_vez",
          title: "Primera vez",
          points: 100,
          unlocked: true,
        },
      ],
    });

    expect(notifications.some((n) => n.id === "cupo-80:2026-01")).toBe(true);
    expect(notifications.some((n) => n.id === "achievement:primera_vez")).toBe(
      true,
    );
    expect(notifications.some((n) => n.id === "audit:a1")).toBe(true);
    expect(notifications.some((n) => n.id === "support-replied:r1")).toBe(true);
    expect(
      notifications.find((n) => n.id === "achievement:primera_vez")?.href,
    ).toBe("/logros#logro-primera_vez");
  });

  it("notifica cambio de próximo pago neto solo tras baseline", () => {
    const first = deriveEmployeeNotifications({
      ...baseInput,
      nextPaymentNet: 1_000_000,
      previousNextPaymentNet: null,
    });
    expect(
      first.notifications.some((n) => n.kind === "next_payment_net_updated"),
    ).toBe(false);
    expect(first.nextPaymentNetSnapshot).toBe(1_000_000);

    const second = deriveEmployeeNotifications({
      ...baseInput,
      nextPaymentNet: 800_000,
      previousNextPaymentNet: 1_000_000,
    });
    expect(
      second.notifications.some((n) => n.kind === "next_payment_net_updated"),
    ).toBe(true);
  });

  it("notifica cambios de comisión y porcentaje máximo tras baseline", () => {
    const baseline = deriveEmployeeNotifications({
      ...baseInput,
      adelantoConfig: {
        tarifaFijaPorCuota: 8000,
        porcentajeMaximoAdelanto: 30,
      },
      previousAdelantoConfig: null,
    });
    expect(
      baseline.notifications.some((n) => n.kind === "config_fee_updated"),
    ).toBe(false);
    expect(
      baseline.notifications.some(
        (n) => n.kind === "config_advance_percent_updated",
      ),
    ).toBe(false);
    expect(baseline.adelantoConfigSnapshot).toEqual({
      tarifaFijaPorCuota: 8000,
      porcentajeMaximoAdelanto: 30,
    });

    const changed = deriveEmployeeNotifications({
      ...baseInput,
      adelantoConfig: {
        tarifaFijaPorCuota: 10000,
        porcentajeMaximoAdelanto: 40,
      },
      previousAdelantoConfig: {
        tarifaFijaPorCuota: 8000,
        porcentajeMaximoAdelanto: 30,
      },
    });

    const fee = changed.notifications.find((n) => n.kind === "config_fee_updated");
    const percent = changed.notifications.find(
      (n) => n.kind === "config_advance_percent_updated",
    );
    expect(fee?.description).toContain("$8.000");
    expect(fee?.description).toContain("$10.000");
    expect(fee?.href).toBe("/adelanto");
    expect(percent?.description).toContain("30%");
    expect(percent?.description).toContain("40%");
  });

  it("emite aviso de nómina cuando faltan 3 días o menos", () => {
    vi.useFakeTimers();
    const now = new Date(2026, 3, 29, 12, 0, 0); // Apr 29 → next payment Apr 30
    vi.setSystemTime(now);

    const { notifications } = deriveEmployeeNotifications({
      ...baseInput,
      monthKey: "2026-04",
      now,
    });

    expect(notifications.some((n) => n.kind === "payroll_due_3d")).toBe(true);
    vi.useRealTimers();
  });
});
