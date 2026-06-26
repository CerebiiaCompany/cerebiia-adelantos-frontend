import type { AdvanceReceiptStatus } from "@/shared/config/advanceHistory.types";
import { calculateAdvanceTransactionFee } from "@/shared/config/advanceFees";
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

type BuildAdvanceHistoryRecordOptions = {
  paymentMethod?: string;
  installments?: number;
  bankName?: string;
  accountTypeLabel?: string;
  accountNumber?: string;
};

const DEMO_BANKING_DEFAULTS = {
  bankName: "Bancolombia",
  accountTypeLabel: "Ahorros",
  accountNumber: "63920194820",
} as const;

/** Crea un registro de historial de adelanto. */
export function buildAdvanceHistoryRecord(
  id: string,
  isoDate: string,
  amount: number,
  status: AdvanceHistoryStatus,
  options: BuildAdvanceHistoryRecordOptions = {},
): AdvanceHistoryRecord {
  const requestedAt = new Date(isoDate);
  const paymentMethod = options.paymentMethod ?? "Transferencia bancaria";
  const transactionFeeAmount = calculateAdvanceTransactionFee(amount);

  return {
    id,
    amount,
    netAmount: Math.max(0, amount - transactionFeeAmount),
    requestedAt,
    periodLabel: getPayrollPeriodLabel(requestedAt),
    status,
    transactionFeeAmount,
    folio: buildAdvanceReceiptFolio(requestedAt),
    receiptStatus: STATUS_TO_RECEIPT[status],
    paymentMethod,
    installments: options.installments ?? 1,
    bankName: options.bankName ?? DEMO_BANKING_DEFAULTS.bankName,
    accountTypeLabel:
      options.accountTypeLabel ?? DEMO_BANKING_DEFAULTS.accountTypeLabel,
    accountNumber: options.accountNumber ?? DEMO_BANKING_DEFAULTS.accountNumber,
  };
}

/** Historial demo de adelantos del empleado. */
export const DEMO_ADVANCE_HISTORY: AdvanceHistoryRecord[] = [
  buildAdvanceHistoryRecord("adv-006", "2026-06-10T14:30:00", 500_000, "en_curso", {
    installments: 2,
  }),
  buildAdvanceHistoryRecord("adv-005", "2026-05-22T11:15:00", 300_000, "aprobado", {
    installments: 1,
  }),
  buildAdvanceHistoryRecord("adv-004", "2026-05-08T09:45:00", 800_000, "aprobado", {
    installments: 3,
  }),
  buildAdvanceHistoryRecord("adv-003", "2026-04-18T16:20:00", 600_000, "aprobado", {
    installments: 2,
  }),
  buildAdvanceHistoryRecord("adv-002", "2026-04-03T10:05:00", 450_000, "no_aprobado", {
    installments: 1,
  }),
  buildAdvanceHistoryRecord("adv-001", "2026-03-12T13:40:00", 1_200_000, "aprobado", {
    installments: 3,
  }),
].sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
