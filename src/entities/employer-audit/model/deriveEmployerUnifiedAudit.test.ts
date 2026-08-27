import { describe, expect, it } from "vitest";
import { deriveEmployerUnifiedAudit } from "./deriveEmployerUnifiedAudit";
import type { AuditoriaCambioEmpleadoDTO } from "@/shared/api/types/empleado";
import type { HistorialSolicitudEmpresaDTO } from "@/shared/api/types/adelanto";
import type { AdelantoConfiguracionDTO } from "@/shared/api/types/configuracion";

describe("deriveEmployerUnifiedAudit", () => {
  const mockEmployeeAudits: AuditoriaCambioEmpleadoDTO[] = [
    {
      id: "audit-e1",
      created_at: "2026-08-22T10:00:00Z",
      accion: "actualizacion_empresa",
      actor_tipo: "empresa",
      actor_nombre: "Acme S.A.S.",
      empleado_id: "emp-1",
      empleado_nombre: "Carlos Mendoza",
      empleado_documento: "1010203040",
      cambios: [
        {
          campo: "salario",
          etiqueta: "Salario base",
          valor_anterior: "2000000",
          valor_nuevo: "2500000",
        },
      ],
    },
  ];

  const mockAdvances: HistorialSolicitudEmpresaDTO[] = [
    {
      id: "adv-1",
      empleado_id: "emp-1",
      empleado_nombre: "Carlos Mendoza",
      empleado_documento: "1010203040",
      monto: "200000",
      monto_neto: "192000",
      tarifa_total: "8000",
      numero_cuotas_snapshot: 1,
      estado: "pagado",
      created_at: "2026-08-10T08:00:00Z",
      decidido_en: "2026-08-10T09:00:00Z",
      decidido_por_id: "admin-1",
      decidido_por_nombre: "Super Admin",
      pagado_en: "2026-08-10T10:00:00Z",
      comprobante_pago_url: "https://storage.example.com/receipt-adv1.pdf",
    },
    {
      id: "adv-2",
      empleado_id: "emp-2",
      empleado_nombre: "Daniela Gonzales",
      empleado_documento: "1090545465",
      monto: "300000",
      monto_neto: "284000",
      tarifa_total: "16000",
      numero_cuotas_snapshot: 2,
      estado: "rechazado",
      created_at: "2026-08-12T14:00:00Z",
      decidido_en: "2026-08-12T14:30:00Z",
      decidido_por_id: "admin-1",
      decidido_por_nombre: "Super Admin",
      motivo_rechazo: "Documentación inconsistente",
      pagado_en: null,
      comprobante_pago_url: null,
    },
  ];

  const mockConfig: AdelantoConfiguracionDTO = {
    porcentajeMaximoAdelanto: 30,
    numeroMaximoCuotas: 3,
    tarifaFijaPorCuota: 8000,
    plazoMaximoDias: 30,
  };

  it("consolida eventos de solicitudes, modificaciones de empleados y configuración", () => {
    const result = deriveEmployerUnifiedAudit({
      employeeProfileAudits: mockEmployeeAudits,
      advances: mockAdvances,
      config: mockConfig,
    });

    expect(result.metrics.totalEvents).toBeGreaterThan(5);
    expect(result.metrics.totalAdvancesTracked).toBe(2);
    expect(result.metrics.totalEmployeeDataChanges).toBe(1);
    expect(result.metrics.totalConfigEvents).toBe(1);

    // Eventos ordenados descendentemente
    expect(new Date(result.records[0].timestamp).getTime()).toBeGreaterThanOrEqual(
      new Date(result.records[1].timestamp).getTime(),
    );

    // Rechazo incluye motivo
    const rechazo = result.records.find((r) => r.eventType === "solicitud_rechazada");
    expect(rechazo).toBeDefined();
    expect(rechazo?.employeeName).toBe("Daniela Gonzales");
    expect(rechazo?.rejectionReason).toBe("Documentación inconsistente");

    // Desembolso incluye comprobante
    const pago = result.records.find((r) => r.eventType === "solicitud_pagada");
    expect(pago).toBeDefined();
    expect(pago?.employeeName).toBe("Carlos Mendoza");
    expect(pago?.evidenceUrl).toBe("https://storage.example.com/receipt-adv1.pdf");
  });

  it("registra liberaciones de cuotas de la nómina por el Super Admin", () => {
    const advanceWithCuotas = [
      {
        ...mockAdvances[0],
        cuotas: [
          {
            id: "c-1",
            solicitud_id: "adv-1",
            numero: 1,
            monto: "200000",
            tarifa_cuota: "8000",
            fecha_corte: "2026-08-30",
            estado: "pagado" as const,
            fecha_pago: "2026-08-25T17:00:00Z",
          },
        ],
      },
    ];

    const result = deriveEmployerUnifiedAudit({
      employeeProfileAudits: [],
      advances: advanceWithCuotas,
    });

    const cuotaLiberada = result.records.find((r) => r.eventType === "cuota_liberada");
    expect(cuotaLiberada).toBeDefined();
    expect(cuotaLiberada?.employeeName).toBe("Carlos Mendoza");
    expect(cuotaLiberada?.amount).toBe(200_000);
    expect(result.metrics.totalCuotasLiberadas).toBe(1);
  });
});
