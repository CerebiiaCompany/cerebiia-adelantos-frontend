import { describe, expect, it } from "vitest";
import { mapSolicitudToHistoryRecord } from "./adelantoMappers";

describe("adelantoMappers", () => {
  it("mapea una solicitud del backend al historial del empleado", () => {
    const record = mapSolicitudToHistoryRecord({
      id: "550e8400-e29b-41d4-a716-446655440000",
      empleado_id: "emp-1",
      empresa_id: "empresa-1",
      monto: "500000.00",
      numero_cuotas_snapshot: 3,
      plazo_dias_snapshot: 90,
      estado: "solicitado",
      created_at: "2026-06-22T16:56:49Z",
    });

    expect(record.amount).toBe(500000);
    expect(record.status).toBe("en_curso");
    expect(record.receiptStatus).toBe("en_curso");
    expect(record.installments).toBe(3);
    expect(record.canCancel).toBe(true);
  });

  it("usa monto_neto del backend para calcular la tarifa", () => {
    const record = mapSolicitudToHistoryRecord({
      id: "550e8400-e29b-41d4-a716-446655440001",
      empleado_id: "emp-1",
      empresa_id: "empresa-1",
      monto: "400000.00",
      monto_neto: "384000.00",
      numero_cuotas_snapshot: 2,
      plazo_dias_snapshot: 90,
      estado: "aprobado",
      created_at: "2026-06-22T16:56:49Z",
    });

    expect(record.transactionFeeAmount).toBe(16000);
    expect(record.netAmount).toBe(384000);
    expect(record.canCancel).toBe(false);
  });

  it("mapea comprobante_pago a URL de evidencia", () => {
    const record = mapSolicitudToHistoryRecord({
      id: "550e8400-e29b-41d4-a716-446655440002",
      empleado_id: "emp-1",
      empresa_id: "empresa-1",
      monto: "200000.00",
      monto_neto: "184000.00",
      numero_cuotas_snapshot: 2,
      plazo_dias_snapshot: 90,
      estado: "pagado",
      created_at: "2026-06-26T16:00:00Z",
      comprobante_pago:
        "comprobantes/550e8400-e29b-41d4-a716-446655440002/transferencia.jpg",
    });

    expect(record.paymentEvidenceUrl).toContain("/media/comprobantes/");
    expect(record.paymentEvidenceUrl).toContain("transferencia.jpg");
  });

  it("mapea motivo_rechazo para solicitudes no aprobadas", () => {
    const record = mapSolicitudToHistoryRecord({
      id: "550e8400-e29b-41d4-a716-446655440003",
      empleado_id: "emp-1",
      empresa_id: "empresa-1",
      monto: "250000.00",
      numero_cuotas_snapshot: 1,
      plazo_dias_snapshot: 90,
      estado: "rechazado",
      created_at: "2026-06-26T16:00:00Z",
      motivo_rechazo: "Documentación incompleta en la solicitud",
    });

    expect(record.status).toBe("no_aprobado");
    expect(record.rejectionReason).toBe(
      "Documentación incompleta en la solicitud",
    );
  });
});
