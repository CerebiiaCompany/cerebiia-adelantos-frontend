import { describe, expect, it, vi } from "vitest";
import { deriveEmployerNotifications } from "./deriveEmployerNotifications";

const routes = {
  misEmpleados: "/empleador/mis-empleados",
  auditorias: "/empleador/auditorias",
  historialMovimientos: "/empleador/historial-movimientos",
  monitoreoAdelantos: "/empleador/monitoreo-adelantos",
  soportes: "/empleador/soportes",
  retencionesCierres: "/empleador/retenciones-cierres",
  panel: "/empleador/panel",
};

describe("deriveEmployerNotifications", () => {
  it("notifica activación, edición, adelanto con nombre/monto y soporte", () => {
    const { notifications } = deriveEmployerNotifications({
      routes,
      solicitudes: [
        {
          id: "s1",
          empleadoId: "e1",
          empleadoNombre: "Juan Rodriguez",
          monto: 250000,
          estado: "solicitado",
          createdAt: "2026-01-10T10:00:00.000Z",
        },
        {
          id: "s2",
          empleadoId: "e2",
          empleadoNombre: "Ana Pérez",
          monto: 100000,
          estado: "aprobado",
          createdAt: "2026-01-09T10:00:00.000Z",
          decididoEn: "2026-01-09T12:00:00.000Z",
        },
        {
          id: "s3",
          empleadoId: "e3",
          empleadoNombre: "Luis Gómez",
          monto: 50000,
          estado: "rechazado",
          createdAt: "2026-01-08T10:00:00.000Z",
          motivoRechazo: "Cupo insuficiente",
        },
      ],
      auditoriaCambios: [
        {
          id: "a1",
          empleadoId: "e1",
          empleadoNombre: "Juan Rodriguez",
          actorTipo: "empleado",
          actorNombre: "Juan Rodriguez",
          accion: "confirmacion_activacion",
          createdAt: "2026-01-10T09:00:00.000Z",
        },
        {
          id: "a2",
          empleadoId: "e2",
          empleadoNombre: "Ana Pérez",
          actorTipo: "empresa",
          actorNombre: "RRHH",
          accion: "actualizacion_empresa",
          createdAt: "2026-01-10T08:00:00.000Z",
        },
      ],
      reportes: [
        {
          id: "r1",
          empleadoNombre: "Ana Pérez",
          estado: "pendiente",
          createdAt: "2026-01-10T07:00:00.000Z",
        },
      ],
      inactiveEmpleados: [],
      previousInactiveById: {},
      suspendedBaselineReady: true,
      adelantoConfig: null,
      previousAdelantoConfig: null,
      providerDebtAmount: null,
      providerPeriodLabel: "2026-01",
      now: new Date("2026-01-12T12:00:00.000Z"), // Monday — no week debt
    });

    const activated = notifications.find((n) => n.kind === "employee_activated");
    expect(activated?.description).toContain("Juan Rodriguez");
    expect(activated?.description).toContain("activar");

    expect(
      notifications.some((n) => n.id === "audit:a2" && n.kind === "data_change_audit"),
    ).toBe(true);

    const requested = notifications.find(
      (n) => n.kind === "employer_advance_requested",
    );
    expect(requested?.description).toContain("Juan Rodriguez");
    expect(requested?.description).toContain("$250.000");
    expect(requested?.href).toBe("/empleador/historial-movimientos");

    expect(
      notifications.some((n) => n.kind === "employer_advance_approved"),
    ).toBe(true);
    expect(
      notifications.find((n) => n.kind === "employer_advance_rejected")
        ?.description,
    ).toContain("Cupo insuficiente");

    expect(
      notifications.find((n) => n.kind === "employer_support_message")?.href,
    ).toBe("/empleador/soportes");
  });

  it("notifica suspensión solo tras baseline", () => {
    const first = deriveEmployerNotifications({
      routes,
      solicitudes: [],
      auditoriaCambios: [],
      reportes: [],
      inactiveEmpleados: [
        {
          id: "e9",
          nombre: "Pedro Suspendido",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      previousInactiveById: {},
      suspendedBaselineReady: false,
      adelantoConfig: null,
      previousAdelantoConfig: null,
      providerDebtAmount: null,
      providerPeriodLabel: "2026-01",
      now: new Date("2026-01-12T12:00:00.000Z"),
    });
    expect(first.notifications.some((n) => n.kind === "employee_suspended")).toBe(
      false,
    );
    expect(first.suspendedBaselineReady).toBe(true);

    const second = deriveEmployerNotifications({
      routes,
      solicitudes: [],
      auditoriaCambios: [],
      reportes: [],
      inactiveEmpleados: [
        {
          id: "e9",
          nombre: "Pedro Suspendido",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          id: "e10",
          nombre: "Nuevo Inactivo",
          updatedAt: "2026-01-11T00:00:00.000Z",
        },
      ],
      previousInactiveById: first.inactiveByIdSnapshot,
      suspendedBaselineReady: true,
      adelantoConfig: null,
      previousAdelantoConfig: null,
      providerDebtAmount: null,
      providerPeriodLabel: "2026-01",
      now: new Date("2026-01-12T12:00:00.000Z"),
    });
    expect(
      second.notifications.find((n) => n.kind === "employee_suspended")
        ?.description,
    ).toContain("Nuevo Inactivo");
  });

  it("notifica cambios de config y deuda semanal al proveedor", () => {
    vi.useFakeTimers();
    const friday = new Date(2026, 0, 9, 12, 0, 0); // Fri Jan 9 2026
    vi.setSystemTime(friday);

    const { notifications } = deriveEmployerNotifications({
      routes,
      solicitudes: [],
      auditoriaCambios: [],
      reportes: [],
      inactiveEmpleados: [],
      previousInactiveById: {},
      suspendedBaselineReady: true,
      adelantoConfig: {
        tarifaFijaPorCuota: 12000,
        porcentajeMaximoAdelanto: 35,
        montoMinimoAdelanto: 15000,
      },
      previousAdelantoConfig: {
        tarifaFijaPorCuota: 8000,
        porcentajeMaximoAdelanto: 30,
        montoMinimoAdelanto: 10000,
      },
      providerDebtAmount: 1_500_000,
      providerPeriodLabel: "2026-01",
      now: friday,
    });

    expect(notifications.some((n) => n.kind === "config_fee_updated")).toBe(true);
    expect(
      notifications.some((n) => n.kind === "config_advance_percent_updated"),
    ).toBe(true);
    expect(
      notifications.some((n) => n.kind === "config_min_amount_updated"),
    ).toBe(true);

    const debt = notifications.find((n) => n.kind === "provider_week_debt");
    expect(debt?.description).toContain("$1.500.000");
    expect(debt?.href).toBe("/empleador/retenciones-cierres");

    vi.useRealTimers();
  });
});
