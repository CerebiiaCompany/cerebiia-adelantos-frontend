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
  });
});
