import { describe, expect, it } from "vitest";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import { calculateMaxAdvanceLimit } from "@/entities/employee-dashboard";
import { buildControlMonthlyAdvanceData } from "./buildControlMonthlyAdvanceData";

function makeRecord(
  partial: Partial<AdvanceHistoryRecord> &
    Pick<AdvanceHistoryRecord, "id" | "amount" | "requestedAt" | "status">,
): AdvanceHistoryRecord {
  return {
    netAmount: partial.netAmount ?? Math.max(0, partial.amount - 12_000),
    periodLabel: "julio 2026",
    transactionFeeAmount: 12_000,
    folio: partial.id,
    receiptStatus: partial.status === "no_aprobado" ? null : "aprobado",
    paymentMethod: "Transferencia bancaria",
    installments: 1,
    bankName: "Nequi",
    accountTypeLabel: "Ahorros",
    accountNumber: "3204739882",
    ...partial,
  };
}

describe("buildControlMonthlyAdvanceData", () => {
  it("excluye rechazados del adelantado, del conteo y del disponible", () => {
    const limitAmount = calculateMaxAdvanceLimit(1_700_000);
    const history = [
      makeRecord({
        id: "ok",
        amount: 100_000,
        requestedAt: new Date("2026-07-14T10:00:00"),
        status: "aprobado",
      }),
      makeRecord({
        id: "rejected",
        amount: 500_000,
        requestedAt: new Date("2026-07-14T12:00:00"),
        status: "no_aprobado",
      }),
    ];

    const points = buildControlMonthlyAdvanceData(
      history,
      limitAmount,
      new Date("2026-07-14T15:00:00"),
    );
    const july = points.find((point) => point.sortKey === "2026-07");

    expect(july).toBeDefined();
    expect(july?.adelantos).toBe(100_000);
    expect(july?.count).toBe(1);
    expect(july?.disponible).toBe(limitAmount - 100_000);
    expect(
      Math.round(((july?.adelantos ?? 0) / limitAmount) * 100),
    ).toBe(20);
  });
});
