import { describe, expect, it } from "vitest";
import type { EmployerMovementRecord } from "@/entities/employer-audit";
import {
  DEFAULT_MOVEMENT_LEDGER_FILTERS,
  filterMovementLedgerRecords,
  hasActiveMovementLedgerFilters,
} from "./movementLedgerFilters";

const sample: EmployerMovementRecord[] = [
  {
    id: "1",
    transferId: "AAAA1111",
    occurredAt: "2026-07-10T10:00:00-05:00",
    type: "adelanto",
    status: "procesado",
    netDisbursedAmount: 100_000,
    employeeName: "Ana Pérez",
    paymentEvidenceUrl: "https://cdn.example.com/a.pdf",
    rejectionReason: null,
  },
  {
    id: "2",
    transferId: "BBBB2222",
    occurredAt: "2026-07-14T12:00:00-05:00",
    type: "adelanto",
    status: "rechazado",
    netDisbursedAmount: 88_000,
    employeeName: "Luis Gómez",
    paymentEvidenceUrl: null,
    rejectionReason: "Documentación incompleta",
  },
  {
    id: "3",
    transferId: "CCCC3333",
    occurredAt: "2026-06-01T09:00:00-05:00",
    type: "adelanto",
    status: "en_curso",
    netDisbursedAmount: 50_000,
    employeeName: "Ana Ruiz",
    paymentEvidenceUrl: null,
    rejectionReason: null,
  },
];

describe("movementLedgerFilters", () => {
  it("detecta filtros activos", () => {
    expect(hasActiveMovementLedgerFilters(DEFAULT_MOVEMENT_LEDGER_FILTERS)).toBe(
      false,
    );
    expect(
      hasActiveMovementLedgerFilters({
        ...DEFAULT_MOVEMENT_LEDGER_FILTERS,
        status: "rechazado",
      }),
    ).toBe(true);
  });

  it("filtra por estado", () => {
    const result = filterMovementLedgerRecords(sample, "", {
      ...DEFAULT_MOVEMENT_LEDGER_FILTERS,
      status: "rechazado",
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filtra por rango de fechas", () => {
    const result = filterMovementLedgerRecords(sample, "", {
      ...DEFAULT_MOVEMENT_LEDGER_FILTERS,
      dateFrom: "2026-07-01",
      dateTo: "2026-07-14",
    });
    expect(result.map((r) => r.id)).toEqual(["1", "2"]);
  });

  it("combina búsqueda con filtros", () => {
    const result = filterMovementLedgerRecords(sample, "ana", {
      ...DEFAULT_MOVEMENT_LEDGER_FILTERS,
      status: "procesado",
    });
    expect(result).toHaveLength(1);
    expect(result[0].employeeName).toBe("Ana Pérez");
  });
});
