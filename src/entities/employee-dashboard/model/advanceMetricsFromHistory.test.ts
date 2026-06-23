import { describe, expect, it } from "vitest";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import {
  buildMonthlyAdvancesFromHistory,
  deriveAdvanceMetricsFromHistory,
} from "./advanceMetricsFromHistory";

function makeRecord(
  partial: Partial<AdvanceHistoryRecord> & Pick<AdvanceHistoryRecord, "amount" | "requestedAt">,
): AdvanceHistoryRecord {
  return {
    id: "adv-1",
    periodLabel: "junio 2026",
    status: "en_curso",
    transactionFeeAmount: 8_000,
    folio: "ADV-1",
    receiptStatus: "en_curso",
    paymentMethod: "Transferencia bancaria",
    ...partial,
  };
}

describe("deriveAdvanceMetricsFromHistory", () => {
  it("suma adelantos del mes actual y excluye rechazados", () => {
    const now = new Date("2026-06-13T10:00:00");

    const metrics = deriveAdvanceMetricsFromHistory([
      makeRecord({ amount: 400_000, requestedAt: now }),
      makeRecord({
        amount: 200_000,
        requestedAt: new Date("2026-06-05T12:00:00"),
        status: "aprobado",
      }),
      makeRecord({
        amount: 999_000,
        requestedAt: new Date("2026-06-01T12:00:00"),
        status: "no_aprobado",
      }),
      makeRecord({
        amount: 100_000,
        requestedAt: new Date("2026-05-20T12:00:00"),
      }),
    ]);

    expect(metrics.totalAdvancedThisMonth).toBe(600_000);
    expect(metrics.monthlyAdvances["2026-06"]).toBe(600_000);
    expect(metrics.monthlyAdvances["2026-05"]).toBe(100_000);
    expect(metrics.activity).toHaveLength(3);
  });
});

describe("buildMonthlyAdvancesFromHistory", () => {
  it("agrupa montos por mes", () => {
    const monthly = buildMonthlyAdvancesFromHistory([
      makeRecord({
        amount: 300_000,
        requestedAt: new Date("2026-03-10T08:00:00"),
      }),
      makeRecord({
        amount: 150_000,
        requestedAt: new Date("2026-03-25T08:00:00"),
      }),
    ]);

    expect(monthly["2026-03"]).toBe(450_000);
  });
});
