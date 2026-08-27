import { describe, expect, it } from "vitest";
import { deriveEmployeeUnifiedAudit } from "./deriveEmployeeUnifiedAudit";
import type { AuditoriaCambioEmpleadoDTO } from "@/shared/api/types/empleado";
import type { SolicitudAdelantoDTO } from "@/shared/api/types/adelanto";

describe("deriveEmployeeUnifiedAudit", () => {
  const mockProfileChanges: AuditoriaCambioEmpleadoDTO[] = [
    {
      id: "audit-1",
      created_at: "2026-08-20T14:30:00Z",
      accion: "actualizacion_propia",
      actor_tipo: "empleado",
      actor_nombre: "Carlos Mendoza",
      empleado_id: "emp-1",
      empleado_nombre: "Carlos Mendoza",
      empleado_documento: "1010203040",
      cambios: [
        {
          campo: "telefono",
          etiqueta: "Teléfono",
          valor_anterior: "3001112233",
          valor_nuevo: "3009998877",
        },
      ],
    },
  ];

  const mockSolicitudes: SolicitudAdelantoDTO[] = [
    {
      id: "sol-1",
      empleado_id: "emp-1",
      empresa_id: "empresa-1",
      monto: "200000",
      monto_neto: "192000",
      numero_cuotas_snapshot: 2,
      plazo_dias_snapshot: 30,
      estado: "pagado",
      created_at: "2026-08-10T10:00:00Z",
      decidido_en: "2026-08-10T11:00:00Z",
      pagado_en: "2026-08-10T12:00:00Z",
      comprobante_pago_url: "https://storage.example.com/receipt-1.pdf",
    },
    {
      id: "sol-2",
      empleado_id: "emp-1",
      empresa_id: "empresa-1",
      monto: "150000",
      numero_cuotas_snapshot: 1,
      plazo_dias_snapshot: 30,
      estado: "rechazado",
      created_at: "2026-08-15T09:00:00Z",
      decidido_en: "2026-08-15T09:30:00Z",
      motivo_rechazo: "Tope salarial superado",
    },
  ];

  it("consolida eventos de perfil, solicitudes, aprobaciones, rechazos y pagos", () => {
    const result = deriveEmployeeUnifiedAudit({
      profileAuditRecords: mockProfileChanges,
      solicitudes: mockSolicitudes,
      availableAdvance: 500_000,
      maxAdvanceLimit: 800_000,
    });

    expect(result.metrics.totalEvents).toBe(6);
    expect(result.metrics.totalSolicitudesTracked).toBe(2);
    expect(result.metrics.totalProfileChanges).toBe(1);
    expect(result.metrics.availableAdvance).toBe(500_000);

    // Eventos ordenados descendentemente por fecha
    expect(new Date(result.records[0].timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(result.records[1].timestamp).getTime(),
    );

    // Verificar que el evento de rechazo incluye el motivo
    const rechazo = result.records.find((r) => r.eventType === "solicitud_rechazada");
    expect(rechazo).toBeDefined();
    expect(rechazo?.rejectionReason).toBe("Tope salarial superado");

    // Verificar que el evento de pago incluye comprobante
    const pago = result.records.find((r) => r.eventType === "solicitud_pagada");
    expect(pago).toBeDefined();
    expect(pago?.evidenceUrl).toBe("https://storage.example.com/receipt-1.pdf");
  });

  it("registra evento de liberación de cuota cuando super admin libera una cuota", () => {
    const multiCuotaSolicitud = [
      {
        ...mockSolicitudes[0],
        cuotas: [
          {
            id: "c-1",
            solicitud_id: "sol-1",
            numero: 1,
            monto: "100000",
            tarifa_cuota: "8000",
            fecha_corte: "2026-08-30",
            estado: "pagado" as const,
            fecha_pago: "2026-08-25T16:00:00Z",
          },
          {
            id: "c-2",
            solicitud_id: "sol-1",
            numero: 2,
            monto: "100000",
            tarifa_cuota: "8000",
            fecha_corte: "2026-09-30",
            estado: "pendiente" as const,
            fecha_pago: null,
          },
        ],
      },
    ];

    const result = deriveEmployeeUnifiedAudit({
      profileAuditRecords: [],
      solicitudes: multiCuotaSolicitud,
      availableAdvance: 600_000,
      maxAdvanceLimit: 600_000,
    });

    const cuotaLiberada = result.records.find((r) => r.eventType === "cuota_liberada");
    expect(cuotaLiberada).toBeDefined();
    expect(cuotaLiberada?.currentInstallment).toBe(1);
    expect(cuotaLiberada?.amount).toBe(100_000);
    expect(cuotaLiberada?.cupoAnterior).toBe(500_000);
    expect(cuotaLiberada?.cupoNuevo).toBe(600_000);
    expect(result.metrics.totalCuotasLiberadas).toBe(1);
  });

  it("registra evento de configuración vigente del Super Admin", () => {
    const result = deriveEmployeeUnifiedAudit({
      profileAuditRecords: [],
      solicitudes: [],
      config: {
        porcentajeMaximoAdelanto: 30,
        numeroMaximoCuotas: 2,
        tarifaFijaPorCuota: 8000,
        plazoMaximoDias: 30,
      },
    });

    const configEvent = result.records.find(
      (r) => r.eventType === "cambio_configuracion",
    );
    expect(configEvent).toBeDefined();
    expect(configEvent?.category).toBe("configuracion");
    expect(configEvent?.configDetails?.parameters.length).toBe(4);
  });
});
