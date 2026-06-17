import type { AdvanceReceiptStatus } from "@/shared/config/advanceHistory.types";
import {
  ADVANCE_TRANSACTION_FEE_RATE,
  calculateAdvanceTransactionFee,
} from "@/shared/config/advanceFees";
import type { AdvanceHistoryRecord, AdvanceHistoryStatus } from "@/shared/config/advanceHistory.types";
import {
  buildAdvanceReceiptFolio,
  getPayrollPeriodLabel,
} from "@/shared/utils/payrollPeriod";

export type { AdvanceHistoryRecord, AdvanceHistoryStatus } from "@/shared/config/advanceHistory.types";
export {
  ADVANCE_HISTORY_STATUS_BADGE_CLASS,
  ADVANCE_HISTORY_STATUS_LABEL,
} from "@/shared/config/advanceStatusStyles";

const STATUS_TO_RECEIPT: Record<
  AdvanceHistoryStatus,
  AdvanceReceiptStatus | null
> = {
  en_curso: "en_curso",
  aprobado: "transferido",
  no_aprobado: null,
};

function createRecord(
  id: string,
  isoDate: string,
  amount: number,
  status: AdvanceHistoryStatus,
  paymentMethod = "Transferencia bancaria",
  transactionFeeRate = ADVANCE_TRANSACTION_FEE_RATE,
): AdvanceHistoryRecord {
  const requestedAt = new Date(isoDate);

  return {
    id,
    amount,
    requestedAt,
    periodLabel: getPayrollPeriodLabel(requestedAt),
    status,
    transactionFeeRate,
    transactionFeeAmount: calculateAdvanceTransactionFee(amount),
    folio: buildAdvanceReceiptFolio(requestedAt),
    receiptStatus: STATUS_TO_RECEIPT[status],
    paymentMethod,
  };
}

/** Historial demo de adelantos del empleado. */
export const DEMO_ADVANCE_HISTORY: AdvanceHistoryRecord[] = [
  createRecord("adv-006", "2026-06-10T14:30:00", 500_000, "en_curso"),
  createRecord("adv-005", "2026-05-22T11:15:00", 300_000, "aprobado"),
  createRecord("adv-004", "2026-05-08T09:45:00", 800_000, "aprobado"),
  createRecord("adv-003", "2026-04-18T16:20:00", 600_000, "aprobado"),
  createRecord("adv-002", "2026-04-03T10:05:00", 450_000, "no_aprobado"),
  createRecord("adv-001", "2026-03-12T13:40:00", 1_200_000, "aprobado"),
].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
