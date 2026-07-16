import { describe, expect, it } from "vitest";
import { mapHistorialEmpresaToRegisteredCompanyAdvances } from "@/entities/employer-audit";
import type { HistorialSolicitudEmpresaDTO } from "@/shared/api/types/adelanto";
import type { EmpleadoDTO } from "@/shared/api/types";

describe("mapHistorialEmpresaToRegisteredCompanyAdvances", () => {
  it("mapea el historial empresa usando nombres del endpoint", () => {
    const historial: HistorialSolicitudEmpresaDTO[] = [
      {
        id: "sol-1",
        empleado_id: "emp-1",
        empleado_nombre: "Juan Pérez",
        empleado_documento: "12345678",
        monto: "200000.00",
        monto_neto: "184000.00",
        tarifa_total: "16000.00",
        numero_cuotas_snapshot: 2,
        estado: "aprobado",
        created_at: "2026-07-01T10:00:00-05:00",
        decidido_por_id: null,
        decidido_por_nombre: null,
        decidido_en: null,
        motivo_rechazo: null,
        comprobante_pago_url: "https://cdn.example.com/pago.pdf",
        pagado_en: null,
      },
    ];

    const empleados: EmpleadoDTO[] = [
      {
        id: "emp-1",
        documento: "12345678",
        nombre: "Juan Pérez",
        salario: "1500000.00",
        banco_id: "banco-1",
        banco_nombre: "Bancolombia",
        numero_cuenta: "1",
        tipo_documento: "cc",
        email_empleado: "a@b.com",
        celular: "3001234567",
        tipo_contrato: "indefinido",
        fecha_ingreso: "2024-01-01",
        tipo_cuenta: "ahorros",
        estado: "activo",
        empresa_id: "empresa-1",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
      },
    ];

    const advances = mapHistorialEmpresaToRegisteredCompanyAdvances(
      historial,
      empleados,
      "empresa-1",
    );

    expect(advances).toHaveLength(1);
    expect(advances[0]).toMatchObject({
      id: "sol-1",
      employeeName: "Juan Pérez",
      employeeDocument: "12345678",
      advancedAmount: 200000,
      feeAmount: 16000,
      netDisbursedAmount: 184000,
      installments: 2,
      status: "procesado",
      empresaId: "empresa-1",
      paymentEvidenceUrl: "https://cdn.example.com/pago.pdf",
      rejectionReason: null,
    });
  });

  it("mapea evidencia /media/ del backend como URL usable", () => {
    const historial: HistorialSolicitudEmpresaDTO[] = [
      {
        id: "sol-2",
        empleado_id: "emp-1",
        empleado_nombre: "Juan Pérez",
        empleado_documento: "12345678",
        monto: "100000.00",
        monto_neto: "92000.00",
        tarifa_total: "8000.00",
        numero_cuotas_snapshot: 1,
        estado: "pagado",
        created_at: "2026-07-14T10:00:00-05:00",
        decidido_por_id: null,
        decidido_por_nombre: null,
        decidido_en: null,
        comprobante_pago_url: "/media/comprobantes/sol-2/transferencia.pdf",
        pagado_en: "2026-07-14T12:00:00-05:00",
      },
    ];

    const advances = mapHistorialEmpresaToRegisteredCompanyAdvances(
      historial,
      [],
      "empresa-1",
    );

    expect(advances[0].paymentEvidenceUrl).toBe(
      "/media/comprobantes/sol-2/transferencia.pdf",
    );
    expect(advances[0].status).toBe("procesado");
  });

  it("mapea motivo_rechazo en solicitudes rechazadas", () => {
    const historial: HistorialSolicitudEmpresaDTO[] = [
      {
        id: "sol-3",
        empleado_id: "emp-1",
        empleado_nombre: "Hans Dieter Schmidt",
        empleado_documento: "857493",
        monto: "300000.00",
        monto_neto: "276000.00",
        tarifa_total: "24000.00",
        numero_cuotas_snapshot: 1,
        estado: "rechazado",
        created_at: "2026-07-16T15:17:00-05:00",
        decidido_por_id: null,
        decidido_por_nombre: null,
        decidido_en: "2026-07-16T15:20:00-05:00",
        motivo_rechazo: "Documentación incompleta en la solicitud",
        comprobante_pago_url: null,
        pagado_en: null,
      },
    ];

    const advances = mapHistorialEmpresaToRegisteredCompanyAdvances(
      historial,
      [],
      "empresa-1",
    );

    expect(advances[0].status).toBe("rechazado");
    expect(advances[0].rejectionReason).toBe(
      "Documentación incompleta en la solicitud",
    );
  });
});
