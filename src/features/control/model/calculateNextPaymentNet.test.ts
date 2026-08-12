import { describe, expect, it } from "vitest";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import {
  calculateCurrentMonthPayrollDeduction,
  calculateNextPaymentNet,
} from "./calculateNextPaymentNet";

function record(
  partial: Partial<AdvanceHistoryRecord> &
    Pick<AdvanceHistoryRecord, "amount" | "requestedAt" | "status" | "installments">,
): AdvanceHistoryRecord {
  return {
    id: partial.id ?? "adv",
    amount: partial.amount,
    netAmount: partial.netAmount ?? partial.amount,
    requestedAt: partial.requestedAt,
    periodLabel: "agosto",
    status: partial.status,
    transactionFeeAmount: partial.transactionFeeAmount ?? 0,
    folio: "ABC",
    receiptStatus: "transferido",
    paymentMethod: "Transferencia",
    installments: partial.installments,
    bankName: "—",
    accountTypeLabel: "—",
    accountNumber: "—",
  };
}

describe("calculateCurrentMonthPayrollDeduction", () => {
  it("suma cuotas del mes como en retenciones (caso Melanny)", () => {
    // 100k a 1 cuota + 100k a 2 cuotas en agosto → 100k + 50k = 150k
    const history = [
      record({
        id: "a1",
        amount: 100_000,
        installments: 1,
        status: "aprobado",
        requestedAt: new Date("2026-08-05T10:00:00-05:00"),
      }),
      record({
        id: "a2",
        amount: 100_000,
        installments: 2,
        status: "aprobado",
        requestedAt: new Date("2026-08-10T10:00:00-05:00"),
      }),
    ];

    const deduction = calculateCurrentMonthPayrollDeduction(
      history,
      new Date("2026-08-15T12:00:00-05:00"),
    );
    expect(deduction).toBe(150_000);
    expect(calculateNextPaymentNet(1_700_000, deduction)).toBe(1_550_000);
  });

  it("cobra la 2ª cuota en el mes siguiente", () => {
    const history = [
      record({
        amount: 100_000,
        installments: 2,
        status: "aprobado",
        requestedAt: new Date("2026-08-10T10:00:00-05:00"),
      }),
    ];

    expect(
      calculateCurrentMonthPayrollDeduction(
        history,
        new Date("2026-09-15T12:00:00-05:00"),
      ),
    ).toBe(50_000);
  });

  it("ignora en curso y rechazados", () => {
    const history = [
      record({
        amount: 200_000,
        installments: 1,
        status: "en_curso",
        requestedAt: new Date("2026-08-10T10:00:00-05:00"),
      }),
      record({
        amount: 80_000,
        installments: 1,
        status: "no_aprobado",
        requestedAt: new Date("2026-08-10T10:00:00-05:00"),
      }),
    ];

    expect(
      calculateCurrentMonthPayrollDeduction(
        history,
        new Date("2026-08-15T12:00:00-05:00"),
      ),
    ).toBe(0);
  });
});
