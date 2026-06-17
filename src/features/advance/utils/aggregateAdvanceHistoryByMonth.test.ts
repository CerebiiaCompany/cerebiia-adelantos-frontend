import { describe, expect, it } from "vitest";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import { aggregateAdvanceHistoryByMonth } from "./aggregateAdvanceHistoryByMonth";

const sampleRecords: AdvanceHistoryRecord[] = [
  {
    id: "1",
    amount: 500_000,
    requestedAt: new Date("2026-05-08T10:00:00"),
    periodLabel: "mayo 2026 · 1.ª quincena",
    status: "aprobado",
    transactionFeeRate: 0.025,
    transactionFeeAmount: 12_500,
    folio: "ADV-1",
    receiptStatus: "transferido",
    paymentMethod: "Transferencia bancaria",
  },
  {
    id: "2",
    amount: 300_000,
    requestedAt: new Date("2026-05-22T10:00:00"),
    periodLabel: "mayo 2026 · 2.ª quincena",
    status: "aprobado",
    transactionFeeRate: 0.025,
    transactionFeeAmount: 7_500,
    folio: "ADV-2",
    receiptStatus: "transferido",
    paymentMethod: "Transferencia bancaria",
  },
  {
    id: "3",
    amount: 450_000,
    requestedAt: new Date("2026-04-03T10:00:00"),
    periodLabel: "abril 2026 · 1.ª quincena",
    status: "no_aprobado",
    transactionFeeRate: 0.025,
    transactionFeeAmount: 11_250,
    folio: "ADV-3",
    receiptStatus: null,
    paymentMethod: "Transferencia bancaria",
  },
];

describe("aggregateAdvanceHistoryByMonth", () => {
  it("agrupa montos aprobados por mes", () => {
    const result = aggregateAdvanceHistoryByMonth(sampleRecords);

    expect(result).toHaveLength(1);
    expect(result[0]?.adelantos).toBe(800_000);
    expect(result[0]?.count).toBe(2);
  });

  it("excluye adelantos no aprobados", () => {
    const result = aggregateAdvanceHistoryByMonth(sampleRecords);
    expect(result.some((point) => point.sortKey.includes("04"))).toBe(false);
  });
});
